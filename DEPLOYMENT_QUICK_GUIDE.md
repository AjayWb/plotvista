# PlotVista Deployment Quick Guide

PlotVista can be deployed using multiple methods. Choose the one that best fits your needs.

## 🚀 Option 1: Railway + Vercel (Recommended)

Best for: Production deployments with automatic scaling and free tier options.

### Backend (Railway)

1. **Create Railway Account**: https://railway.app
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Connect Repository**: Select your PlotVista repository
4. **Configure**:
   - Set root directory to `/backend`
   - Railway will auto-detect Node.js
5. **Environment Variables** (in Railway dashboard):
   ```
   ADMIN_PASSWORD=your-secure-password
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```
6. **Database**: Add PostgreSQL from Railway's dashboard
7. **Deploy**: Railway will auto-deploy on push

### Frontend (Vercel)

1. **Create Vercel Account**: https://vercel.com
2. **Import Project**: Connect your GitHub repository
3. **Configure**:
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```
5. **Deploy**: Click "Deploy"

## 🐳 Option 2: Docker (Self-Hosted)

Best for: Full control, on-premise deployment, or VPS hosting.

### Quick Start

1. **Clone Repository**:
   ```bash
   git clone https://github.com/yourusername/plotvista.git
   cd plotvista
   ```

2. **Configure Environment**:
   ```bash
   cp .env.docker.example .env.docker
   # Edit .env.docker with your settings
   ```

3. **Deploy**:
   ```bash
   ./scripts/deploy-docker.sh
   ```

4. **Access**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Production Docker Deployment

For production, use a reverse proxy like Nginx:

```bash
docker-compose --profile production up -d
```

## 🌐 Option 3: Traditional VPS

Best for: Simple deployments on DigitalOcean, AWS EC2, etc.

### Setup Steps

1. **Server Requirements**:
   - Ubuntu 20.04+ or similar
   - Node.js 18+
   - PostgreSQL 14+
   - Nginx (optional)

2. **Install Dependencies**:
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # PostgreSQL
   sudo apt-get install postgresql postgresql-contrib

   # PM2 (process manager)
   sudo npm install -g pm2
   ```

3. **Clone and Setup**:
   ```bash
   git clone https://github.com/yourusername/plotvista.git
   cd plotvista

   # Backend setup
   cd backend
   npm install
   cp .env.production .env
   # Edit .env with your database and settings

   # Frontend setup
   cd ../frontend
   npm install
   echo "VITE_API_URL=https://api.yourdomain.com" > .env.production
   npm run build
   ```

4. **Start Services**:
   ```bash
   # Backend
   cd backend
   pm2 start server-railway.js --name plotvista-backend

   # Frontend (using nginx)
   sudo cp -r ../frontend/dist/* /var/www/html/
   ```

## 🔒 Security Checklist

Before going live:

- [ ] Change default ADMIN_PASSWORD
- [ ] Set secure database password
- [ ] Configure HTTPS (use Let's Encrypt)
- [ ] Set proper CORS origins
- [ ] Enable firewall (allow only 80, 443, 22)
- [ ] Regular backups configured

## 🆘 Quick Troubleshooting

### Backend won't start
- Check database connection: `DATABASE_URL` or PostgreSQL credentials
- Verify port isn't in use: `lsof -i :5000`
- Check logs: `docker-compose logs backend` or `pm2 logs`

### Frontend shows connection error
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is accessible from frontend URL

### Database issues
- For Railway: Database is auto-provisioned
- For Docker: `docker-compose down -v` and restart
- For VPS: Check PostgreSQL service: `sudo systemctl status postgresql`

## 📞 Need Help?

1. Check existing deployment guides in `/docs`
2. Review logs for specific errors
3. Common issues are in FAQ.md

---

**Pro Tip**: Start with Railway+Vercel for the easiest deployment experience. You can always migrate to self-hosted later!