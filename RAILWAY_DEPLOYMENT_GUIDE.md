# 🚂 Railway Deployment Guide for PlotVista

## 🎯 Quick Steps Overview
1. Push code to GitHub
2. Connect Railway to GitHub
3. Add PostgreSQL database
4. Deploy
5. Share URL with employees

---

## 📋 Step-by-Step Instructions

### Step 1: Push to GitHub

1. **Open Terminal and navigate to PlotVista:**
   ```bash
   cd /Users/ajay/plotvista
   ```

2. **Initialize Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial PlotVista setup for Railway deployment"
   ```

3. **Create GitHub repository:**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it "plotvista"
   - Click "Create repository"

4. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/plotvista.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Railway Setup

1. **Go to Railway Dashboard:**
   - Visit [railway.app](https://railway.app)
   - Click "Login" and sign in

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your "plotvista" repository

3. **Add PostgreSQL Database:**
   - In your project dashboard, click "New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create the database

### Step 3: Configure Environment Variables

1. **In Railway Dashboard:**
   - Go to your PlotVista service (not the database)
   - Click "Variables" tab
   - Add these variables:

   ```
   NODE_ENV=production
   ADMIN_PASSWORD=sizzle123
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```

2. **Important:** The `DATABASE_URL` should reference your PostgreSQL service. Railway will auto-populate this.

### Step 4: Deploy

1. **Trigger Deployment:**
   - Railway will automatically start building
   - You can watch the build logs in the "Deployments" tab
   - First deployment takes 5-10 minutes

2. **Get Your URL:**
   - Once deployed, go to "Settings" tab
   - Click "Generate Domain"
   - Your app will be available at: `https://your-app-name.railway.app`

---

## 🌐 Accessing PlotVista

### For You (Manager):
1. Go to: `https://your-app-name.railway.app`
2. Click "Manager Login"
3. Password: `sizzle123`

### For Employees:
1. Share URL: `https://your-app-name.railway.app`
2. They can view projects without login
3. Only you can add/edit/delete

---

## 🔧 Configuration Details

### Files Created for Railway:
- `server-railway.js` - PostgreSQL-compatible backend
- `Dockerfile` - Container configuration
- `railway.json` - Railway-specific settings
- `package.json` - Root package with build scripts
- `.gitignore` - Git ignore file

### Database Migration:
- Local: SQLite (`plotvista.db`)
- Railway: PostgreSQL (managed by Railway)
- Schema automatically created on first run

---

## 🚀 Making Updates

### To Update Your App:
1. Make changes to your code locally
2. Test locally with: `node start.js`
3. Push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
4. Railway automatically redeploys

---

## 💰 Cost Breakdown

### Railway Pricing:
- **Hobby Plan:** $5/month
- **Includes:** 
  - App hosting
  - PostgreSQL database
  - Automatic SSL/HTTPS
  - Custom domain
  - Automatic backups
  - 24/7 uptime

### What You Get:
- Public URL accessible from anywhere
- Professional hosting
- Automatic database backups
- No maintenance required

---

## 🛠️ Troubleshooting

### Build Fails:
- Check "Deployments" tab for error logs
- Ensure all dependencies are in package.json
- Verify Dockerfile syntax

### Database Connection Issues:
- Verify `DATABASE_URL` environment variable
- Check PostgreSQL service is running
- Review connection logs

### App Not Loading:
- Check if deployment completed successfully
- Verify domain is generated
- Check for any runtime errors in logs

### Need to Change Password:
1. Go to Railway dashboard
2. Click your app → "Variables"
3. Update `ADMIN_PASSWORD`
4. App will automatically restart

---

## 📞 Support

### Railway Support:
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)

### Common Issues:
1. **Port binding:** App uses `process.env.PORT` (handled automatically)
2. **Database connection:** Uses `DATABASE_URL` environment variable
3. **File storage:** All data stored in PostgreSQL (no local files)

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] App deployed successfully
- [ ] Custom domain generated
- [ ] Manager login works
- [ ] Employee access works
- [ ] All 20 employees can access the URL

**Your PlotVista will be live at:** `https://your-app-name.railway.app`

**Share this URL with all 20 employees** - they can access it from anywhere in the world!