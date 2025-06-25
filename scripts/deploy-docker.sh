#!/bin/bash

# PlotVista Docker Deployment Script
set -e

echo "🚀 PlotVista Docker Deployment"
echo "=============================="

# Check if .env.docker exists
if [ ! -f .env.docker ]; then
    echo "❌ Error: .env.docker file not found!"
    echo "Please copy .env.docker.example and configure it with your settings."
    exit 1
fi

# Load environment variables
export $(cat .env.docker | grep -v '^#' | xargs)

# Check required variables
if [ -z "$ADMIN_PASSWORD" ] || [ "$ADMIN_PASSWORD" == "your-secure-admin-password" ]; then
    echo "❌ Error: Please set a secure ADMIN_PASSWORD in .env.docker"
    exit 1
fi

if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" == "your-secure-db-password" ]; then
    echo "❌ Error: Please set a secure DB_PASSWORD in .env.docker"
    exit 1
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo "🏥 Checking service health..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend health check failed"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "✅ PlotVista is now running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop:     docker-compose down"