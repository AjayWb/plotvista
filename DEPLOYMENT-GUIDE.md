# PlotVista Production Deployment Guide

This guide will help you deploy PlotVista to the internet using free/low-cost hosting services.

## 🎯 Quick Overview

- **Frontend**: Deployed to Vercel (free)
- **Backend**: Deployed to Railway.app (free tier)
- **Database**: Supabase PostgreSQL (free tier)
- **Total Cost**: $0/month
- **Access**: Available from anywhere on internet

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up with GitHub)
- Railway.app account (sign up with GitHub)
- Supabase account (sign up with GitHub)

## 🗄️ Phase 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Choose organization and enter:
   - **Name**: `plotvista-db`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your location
6. Click "Create new project"
7. Wait for setup to complete (~2 minutes)

### 1.2 Create Database Tables
1. In Supabase dashboard, click "SQL Editor"
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create plots table
CREATE TABLE plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  plot_number VARCHAR(50) NOT NULL,
  dimension VARCHAR(50),
  area INTEGER,
  row INTEGER,
  col INTEGER,
  status VARCHAR(20) DEFAULT 'available',
  UNIQUE(project_id, plot_number)
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID REFERENCES plots(id) ON DELETE CASCADE,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  booking_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read access" ON plots FOR SELECT USING (true);
CREATE POLICY "Public read access" ON bookings FOR SELECT USING (true);

-- Insert sample project for testing
INSERT INTO projects (name) VALUES ('Sample Project');

-- Get the project ID for sample plots
DO $$
DECLARE
    project_uuid UUID;
BEGIN
    SELECT id INTO project_uuid FROM projects WHERE name = 'Sample Project';
    
    -- Insert sample plots
    INSERT INTO plots (project_id, plot_number, dimension, area, row, col, status) VALUES
    (project_uuid, '1', '30x40', 1200, 0, 0, 'available'),
    (project_uuid, '2', '30x40', 1200, 0, 1, 'booked'),
    (project_uuid, '3', '30x50', 1500, 1, 0, 'available'),
    (project_uuid, '4', '40x40', 1600, 1, 1, 'agreement');
END $$;
```

4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned"

### 1.3 Get Database Credentials
1. Go to "Settings" → "API"
2. Note down these values:
   - **Project URL** (starts with https://)
   - **anon public key** (starts with eyJ...)
   - **service_role key** (starts with eyJ... - this is different from anon)

⚠️ **Keep these credentials secure!**

## 🚀 Phase 2: Backend Deployment (Railway.app)

### 2.1 Prepare Backend Code
1. Open terminal and navigate to backend folder:
```bash
cd /Users/ajay/plotvista/backend
```

2. Initialize git repository:
```bash
git init
git add .
git commit -m "Initial backend setup"
```

3. Create GitHub repository:
   - Go to GitHub.com
   - Click "New repository"
   - Name: `plotvista-backend`
   - Make it public
   - Don't initialize with README
   - Click "Create repository"

4. Push code to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/plotvista-backend.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click "Login" → Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `plotvista-backend` repository
6. Railway will automatically detect Node.js and start deploying

### 2.3 Configure Environment Variables
1. In Railway dashboard, click on your deployed service
2. Go to "Variables" tab
3. Add these environment variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
ADMIN_PASSWORD=your_secure_admin_password
PORT=3001
NODE_ENV=production
```

4. Replace the values with your actual Supabase credentials
5. Choose a strong admin password (you'll use this to login as manager)
6. Click "Deploy" to redeploy with new environment variables

### 2.4 Get Backend URL
1. In Railway dashboard, go to "Settings" tab
2. Click "Generate Domain" 
3. Copy the generated URL (e.g., `https://plotvista-backend-production.up.railway.app`)
4. Save this URL - you'll need it for frontend configuration

## 🌐 Phase 3: Frontend Deployment (Vercel)

### 3.1 Prepare Frontend Code
1. Navigate to frontend folder:
```bash
cd /Users/ajay/plotvista/frontend
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Edit `.env` file and add your backend URL:
```
VITE_API_URL=https://your-railway-backend-url.up.railway.app
```

4. Install dependencies and test build:
```bash
npm install
npm run build
```

5. Initialize git and push to GitHub:
```bash
git init
git add .
git commit -m "Initial frontend setup"
```

6. Create GitHub repository:
   - Name: `plotvista-frontend`
   - Push code similar to backend steps

### 3.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Login" → Sign in with GitHub
3. Click "New Project"
4. Import your `plotvista-frontend` repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Railway backend URL

7. Click "Deploy"
8. Wait for deployment to complete (~2 minutes)

### 3.3 Get Frontend URL
1. After deployment, Vercel will show your live URL
2. Example: `https://plotvista-frontend.vercel.app`
3. Test the URL - you should see PlotVista loading

## ✅ Phase 4: Testing & Verification

### 4.1 Test Public Access (Employees)
1. Open your Vercel URL in browser
2. You should see:
   - Dashboard with sample project statistics
   - Plot grid showing 4 sample plots
   - No login required
   - Filters and search working

### 4.2 Test Admin Access (Manager)
1. Click "Manager Login"
2. Enter your admin password
3. You should see:
   - "Manager" label in header
   - Additional buttons (Multiple Booking, Export Data)
   - Ability to click plots and change status

### 4.3 Test Core Features
- ✅ View plot status (should see green, yellow, orange plots)
- ✅ Search functionality
- ✅ Status filters
- ✅ Admin login/logout
- ✅ Create new project (admin only)
- ✅ Export data (admin only)

## 📱 Phase 5: Mobile & Employee Setup

### 5.1 Share with Employees
1. Share the Vercel URL with all 20 employees
2. They can:
   - Bookmark it on phones/computers
   - Access without any login
   - View real-time plot status
   - Search and filter plots

### 5.2 Mobile Optimization
- URL works on all devices
- Automatic responsive design
- Touch-friendly interface
- No app installation needed

## 🔒 Phase 6: Security & Maintenance

### 6.1 Admin Security
- **Never share admin password**
- **Change password monthly**
- **Always logout after use**
- **Don't access from public computers**

### 6.2 Backup Strategy
- **Automatic**: Supabase provides automatic backups
- **Manual**: Weekly data export via admin panel
- **Code**: Both repositories are backed up on GitHub

### 6.3 Monitoring
- **Uptime**: Both Vercel and Railway have 99.9% uptime
- **Errors**: Check browser console if issues occur
- **Performance**: Both services auto-scale

## 🎯 Final Setup Checklist

### Database (Supabase)
- [ ] Project created
- [ ] Tables created with sample data
- [ ] API credentials noted
- [ ] Row Level Security enabled

### Backend (Railway)
- [ ] Code pushed to GitHub
- [ ] Deployed to Railway
- [ ] Environment variables configured
- [ ] Backend URL obtained and tested

### Frontend (Vercel)
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] Frontend URL obtained and tested

### Testing
- [ ] Public access works (no login)
- [ ] Admin login works
- [ ] Plot status updates work
- [ ] Mobile access works
- [ ] All 20 employees can access

## 🚨 Troubleshooting

### Common Issues

**Frontend shows "Loading..." forever**
- Check if backend URL is correct in environment variables
- Verify backend is running (visit backend URL directly)
- Check browser console for errors

**Admin login fails**
- Verify ADMIN_PASSWORD environment variable in Railway
- Check if backend is deployed successfully
- Try different browser

**Plots don't load**
- Verify Supabase credentials in backend
- Check if sample data was inserted correctly
- Review backend logs in Railway dashboard

**Mobile doesn't work well**
- Ensure you're using the Vercel URL (not localhost)
- Try different mobile browsers
- Check if URL is bookmarked correctly

### Getting Help
- **Backend logs**: Railway dashboard → your service → "Logs" tab
- **Frontend logs**: Browser developer tools (F12) → Console
- **Database**: Supabase dashboard → "Logs" section

## 🎉 Success!

Your PlotVista system is now live on the internet at:
- **Public URL**: Your Vercel URL
- **Admin Access**: Same URL + Manager Login
- **24/7 Availability**: No need to keep your computer on
- **Global Access**: Works from anywhere with internet

**Total deployment time**: ~1 hour  
**Monthly cost**: $0  
**User capacity**: 20+ employees  
**Reliability**: 99.9% uptime

Share the public URL with your team and start managing plots from anywhere! 🚀