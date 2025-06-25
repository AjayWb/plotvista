# 🚀 Railway + Vercel Deployment Guide

This guide will help you deploy PlotVista to Railway (backend) and Vercel (frontend) with optimized settings.

## 📋 Prerequisites

- GitHub account
- Railway account (free tier available)
- Vercel account (free tier available)
- Git CLI installed
- Node.js 18+ installed

## 🚂 Step 1: Deploy Backend to Railway

### 1.1 Setup Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Install Railway CLI: `npm install -g @railway/cli`

### 1.2 Deploy Backend
```bash
# In your project root
cd backend
railway login
railway init

# Deploy
railway up
```

### 1.3 Add PostgreSQL Database
1. In Railway dashboard, click "Add Service"
2. Select "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

### 1.4 Set Environment Variables
In Railway dashboard, add these variables:
```
ADMIN_PASSWORD=your-secure-password
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### 1.5 Copy Backend URL
- Note your Railway backend URL (e.g., `https://plotvista-backend.railway.app`)

## 🔺 Step 2: Deploy Frontend to Vercel

### 2.1 Setup Vercel Account
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Install Vercel CLI: `npm install -g vercel`

### 2.2 Deploy Frontend
```bash
# In your project root
cd frontend
vercel login
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: plotvista-frontend
# - Directory: ./
```

### 2.3 Set Environment Variables
In Vercel dashboard:
```
VITE_API_URL=https://your-backend.railway.app
NODE_ENV=production
```

### 2.4 Redeploy with Environment Variables
```bash
vercel --prod
```

## 🔄 Step 3: Configure Cross-Platform Settings

### 3.1 Update Railway Backend
Go back to Railway and update `FRONTEND_URL`:
```
FRONTEND_URL=https://your-app.vercel.app
```

### 3.2 Test the Connection
1. Visit your Vercel frontend URL
2. Try logging in as admin
3. Check if data loads properly

## 🤖 Step 4: Setup Automated Deployment (Optional)

### 4.1 Repository Secrets
Add these secrets to your GitHub repository:

```
RAILWAY_TOKEN=your-railway-token
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
RAILWAY_BACKEND_URL=https://your-backend.railway.app
VERCEL_FRONTEND_URL=https://your-app.vercel.app
```

### 4.2 Get Railway Token
```bash
railway login
railway whoami --token
```

### 4.3 Get Vercel Tokens
1. Go to Vercel → Settings → Tokens
2. Create new token
3. Get Org ID and Project ID from Vercel dashboard

## ✅ Step 5: Verification

### 5.1 Health Checks
```bash
# Backend health
curl https://your-backend.railway.app/health

# Frontend
curl https://your-app.vercel.app
```

### 5.2 Admin Panel Test
1. Visit your frontend URL
2. Click "Admin Login"
3. Use your admin password
4. Verify all features work

## 💰 Cost Optimization

### Free Tier Limits
- **Railway**: 500 hours/month, $5 credit
- **Vercel**: Unlimited static hosting, 100GB bandwidth

### Monitoring Costs
Access cost metrics at: `https://your-backend.railway.app/api/admin/metrics`

## 🛠 Troubleshooting

### Backend Issues
```bash
# Check Railway logs
railway logs

# Test database connection
railway connect
```

### Frontend Issues
```bash
# Check Vercel logs
vercel logs

# Test local build
npm run build
npm run preview
```

### Common Problems

**"Network Error" in frontend:**
- Check CORS settings in Railway
- Verify `FRONTEND_URL` is set correctly
- Ensure `VITE_API_URL` points to Railway backend

**Database connection failed:**
- Railway auto-provides `DATABASE_URL`
- Check PostgreSQL service is running
- Verify environment variables

**Build failures:**
- Check Node.js version (use 18+)
- Clear `node_modules` and reinstall
- Check for TypeScript errors

## 🔄 Updates and Maintenance

### Updating Code
1. Push to GitHub main branch
2. Railway and Vercel auto-deploy
3. Monitor health endpoints

### Database Backups
Railway provides automatic backups for PostgreSQL.

### Monitoring
- Railway: Built-in metrics dashboard
- Vercel: Analytics in dashboard
- Custom: `/api/admin/metrics` endpoint

## 📞 Support

- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- PlotVista: Check `docs/FAQ.md`

---

**🎉 Congratulations! Your PlotVista is now live on the internet!**