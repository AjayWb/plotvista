#!/bin/bash
set -e
cd /Users/ajay/plotvista

echo "🚀 Initializing Git repository..."
git init

echo "📝 Adding all files..."
git add .

echo "💾 Creating commit..."
git commit -m "Initial PlotVista setup for Railway deployment

- Added Railway-compatible PostgreSQL backend
- Created Dockerfile and deployment configuration  
- Set up build scripts for production deployment
- Added comprehensive documentation and guides
- Ready for $5/month Railway hosting with global access"

echo "🔗 Adding GitHub remote..."
git remote add origin https://github.com/AjayWb/plotvista.git

echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ SUCCESS! Code pushed to GitHub"
echo "🌐 Repository: https://github.com/AjayWb/plotvista"
echo ""
echo "🚂 Next: Set up Railway"
echo "1. Go to https://railway.app"
echo "2. New Project → Deploy from GitHub → Select 'plotvista'"
echo "3. Add PostgreSQL database"
echo "4. Set environment variables (see RAILWAY_QUICK_SETUP.md)"
echo "5. Your app will be live at Railway URL!"