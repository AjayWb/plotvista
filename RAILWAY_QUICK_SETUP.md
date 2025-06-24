# 🚂 Railway Quick Setup Checklist

After pushing to GitHub, follow these exact steps:

## 1. 🔗 Connect Railway to GitHub

1. Go to **https://railway.app**
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **"plotvista"** repository
5. Railway starts building automatically

## 2. 🗄️ Add PostgreSQL Database

1. In Railway dashboard, click **"New Service"**
2. Select **"Database"** → **"PostgreSQL"**
3. Database will be created automatically

## 3. ⚙️ Set Environment Variables

1. Click on your **PlotVista service** (not the database)
2. Go to **"Variables"** tab
3. Add these exact variables:

```
NODE_ENV=production
ADMIN_PASSWORD=sizzle123
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Important:** The `${{Postgres.DATABASE_URL}}` references your PostgreSQL service

## 4. 🌐 Generate Domain

1. Go to **"Settings"** tab in your PlotVista service
2. Click **"Generate Domain"**
3. Your URL will be: `https://plotvista-production-XXXX.up.railway.app`

## 5. ✅ Test Your Deployment

1. Visit your Railway URL
2. Click **"Manager Login"**
3. Password: **sizzle123**
4. Create a test project to verify everything works

## 6. 📱 Share with Employees

**Share this URL with all 20 employees:**
`https://your-app-name.railway.app`

They can access it from anywhere - no VPN, no special setup needed!

---

## 🔧 If Something Goes Wrong

### Build Fails:
- Check **"Deployments"** tab for error logs
- Verify all files were pushed to GitHub

### Database Connection Issues:
- Ensure `DATABASE_URL` variable is set correctly
- Check PostgreSQL service is running

### Can't Login:
- Verify `ADMIN_PASSWORD` is set to `sizzle123`
- Check service has finished deploying

---

## 💰 Final Cost

**$5/month** for:
- Professional hosting
- PostgreSQL database
- Automatic SSL/HTTPS
- Global CDN
- Automatic backups
- 99.9% uptime
- Custom domain

**Your PlotVista will be accessible 24/7 from anywhere in the world!**