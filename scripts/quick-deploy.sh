#!/bin/bash

# PlotVista Quick Deploy Script
# This script helps you deploy PlotVista to the internet quickly

set -e

echo "🚀 PlotVista Quick Deploy Assistant"
echo "=================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists git; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ All prerequisites met!"
echo ""

# Choose deployment method
echo "🎯 Choose your deployment method:"
echo "1) Railway + Vercel (Recommended - Free tier available)"
echo "2) Docker (Local/VPS deployment)"
echo "3) Manual setup guide"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📦 Preparing for Railway + Vercel deployment..."
        echo ""
        
        # Check if railway CLI is installed
        if ! command_exists railway; then
            echo "📥 Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        
        # Frontend build
        echo "🔨 Building frontend for production..."
        cd frontend
        
        # Create production env if not exists
        if [ ! -f .env.production ]; then
            echo "VITE_API_URL=https://your-backend.railway.app" > .env.production
            echo "⚠️  Created .env.production - You'll need to update VITE_API_URL after deploying backend"
        fi
        
        npm install
        npm run build
        cd ..
        
        echo ""
        echo "✅ Build complete!"
        echo ""
        echo "📝 Next steps:"
        echo ""
        echo "1. Deploy Backend to Railway:"
        echo "   - Go to https://railway.app"
        echo "   - Create new project from GitHub"
        echo "   - Set root directory to: /backend"
        echo "   - Add PostgreSQL database"
        echo "   - Set environment variables:"
        echo "     ADMIN_PASSWORD=<your-secure-password>"
        echo "     FRONTEND_URL=<your-vercel-url>"
        echo ""
        echo "2. Deploy Frontend to Vercel:"
        echo "   - Go to https://vercel.com"
        echo "   - Import your GitHub repository"
        echo "   - Set root directory to: /frontend"
        echo "   - Set environment variable:"
        echo "     VITE_API_URL=<your-railway-backend-url>"
        echo ""
        echo "📄 Full guide: DEPLOYMENT_QUICK_GUIDE.md"
        ;;
        
    2)
        echo ""
        echo "🐳 Preparing for Docker deployment..."
        echo ""
        
        # Check if docker is installed
        if ! command_exists docker; then
            echo "❌ Docker is not installed."
            echo "Please install Docker from: https://www.docker.com/get-started"
            exit 1
        fi
        
        # Check if docker-compose is installed
        if ! command_exists docker-compose; then
            echo "❌ Docker Compose is not installed."
            echo "Please install Docker Compose."
            exit 1
        fi
        
        # Create .env.docker if not exists
        if [ ! -f .env.docker ]; then
            cp .env.docker.example .env.docker 2>/dev/null || cat > .env.docker << EOF
# Docker Deployment Environment Variables
DB_PASSWORD=plotvista-db-\$(date +%s)
ADMIN_PASSWORD=admin-\$(date +%s)
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000
JWT_SECRET=jwt-secret-\$(date +%s)
EOF
            echo "📝 Created .env.docker with random passwords"
            echo "⚠️  Please edit .env.docker to set secure passwords!"
            echo ""
            read -p "Press Enter after updating .env.docker..."
        fi
        
        # Run docker deployment
        ./scripts/deploy-docker.sh
        ;;
        
    3)
        echo ""
        echo "📖 Opening deployment guide..."
        echo ""
        
        if [ -f DEPLOYMENT_QUICK_GUIDE.md ]; then
            if command_exists less; then
                less DEPLOYMENT_QUICK_GUIDE.md
            else
                cat DEPLOYMENT_QUICK_GUIDE.md
            fi
        else
            echo "Guide available at: DEPLOYMENT_QUICK_GUIDE.md"
        fi
        ;;
        
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📚 Additional resources:"
echo "   - DEPLOYMENT_QUICK_GUIDE.md - Full deployment guide"
echo "   - RAILWAY_DEPLOYMENT_GUIDE.md - Detailed Railway guide"
echo "   - docs/FAQ.md - Common issues and solutions"