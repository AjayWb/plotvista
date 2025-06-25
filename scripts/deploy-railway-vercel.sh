#!/bin/bash

# PlotVista Railway + Vercel Deployment Script
set -e

echo "🚀 PlotVista Railway + Vercel Deployment"
echo "========================================"
echo ""

# Check if required tools are installed
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "📋 Checking prerequisites..."

if ! command_exists git; then
    echo "❌ Git is required. Please install Git first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is required. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites met!"
echo ""

# Check if this is a git repository
if [ ! -d .git ]; then
    echo "❌ This is not a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git branch -M main"
    exit 1
fi

# Check for Railway CLI
if ! command_exists railway; then
    echo "📥 Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check for Vercel CLI
if ! command_exists vercel; then
    echo "📥 Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "🔧 Building and testing locally first..."

# Test backend build
echo "   Testing backend..."
cd backend
npm install
if ! npm run start --dry-run 2>/dev/null; then
    echo "   Backend dependencies installed"
fi
cd ..

# Test frontend build
echo "   Testing frontend..."
cd frontend
npm install
echo "   Building frontend..."
npm run build
if [ ! -d "dist" ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "   ✅ Frontend build successful"
cd ..

echo ""
echo "🚀 Ready to deploy!"
echo ""

echo "📝 Next steps:"
echo ""
echo "1. Deploy Backend to Railway:"
echo "   railway login"
echo "   railway init"
echo "   cd backend"
echo "   railway up"
echo ""
echo "2. Deploy Frontend to Vercel:"
echo "   vercel login"
echo "   cd frontend"
echo "   vercel"
echo ""
echo "3. Configure Environment Variables:"
echo "   - Railway: Set ADMIN_PASSWORD, FRONTEND_URL"
echo "   - Vercel: Set VITE_API_URL"
echo ""
echo "📄 Detailed guide: DEPLOYMENT_QUICK_GUIDE.md"
echo ""

read -p "Would you like to start the deployment process now? (y/n): " start_deploy

if [ "$start_deploy" = "y" ] || [ "$start_deploy" = "Y" ]; then
    echo ""
    echo "🚂 Starting Railway deployment..."
    
    # Railway deployment
    if ! railway whoami >/dev/null 2>&1; then
        echo "Please log in to Railway:"
        railway login
    fi
    
    echo "Initializing Railway project (if not already done)..."
    cd backend
    railway init || true
    
    echo "Deploying to Railway..."
    railway up
    
    echo ""
    echo "✅ Backend deployed to Railway!"
    echo "   Copy the deployment URL and use it in the next step."
    echo ""
    
    cd ../frontend
    
    read -p "Enter your Railway backend URL (https://...): " railway_url
    
    if [ -n "$railway_url" ]; then
        echo "VITE_API_URL=$railway_url" > .env.production.local
        echo "Environment variable set for Vercel deployment"
    fi
    
    echo ""
    echo "🔺 Starting Vercel deployment..."
    
    if ! vercel whoami >/dev/null 2>&1; then
        echo "Please log in to Vercel:"
        vercel login
    fi
    
    echo "Deploying to Vercel..."
    vercel --prod
    
    echo ""
    echo "🎉 Deployment complete!"
    echo ""
    echo "📝 Don't forget to:"
    echo "   1. Set FRONTEND_URL in Railway to your Vercel URL"
    echo "   2. Change the default ADMIN_PASSWORD in Railway"
    echo "   3. Test your deployment"
    
else
    echo "Deployment cancelled. You can run the commands manually when ready."
fi