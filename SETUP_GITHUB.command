#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Setting up PlotVista for GitHub and Railway..."
echo ""

# Initialize git repository
echo "📦 Initializing Git repository..."
git init

# Add all files
echo "📝 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial PlotVista setup for Railway deployment

- Added Railway-compatible backend with PostgreSQL support
- Created Dockerfile for containerized deployment
- Set up build scripts and configuration
- Added comprehensive documentation
- Ready for Railway deployment with $5/month hosting"

echo ""
echo "✅ Git repository initialized successfully!"
echo ""
echo "🔗 Next steps:"
echo ""
echo "1. Create GitHub repository:"
echo "   - Go to https://github.com"
echo "   - Click 'New repository'"
echo "   - Name it: plotvista"
echo "   - Keep it public (or private if you prefer)"
echo "   - DO NOT initialize with README (we already have files)"
echo "   - Click 'Create repository'"
echo ""
echo "2. Copy your GitHub username and run:"
echo '   ./PUSH_TO_GITHUB.command YOUR_GITHUB_USERNAME'
echo ""
echo "   Example: ./PUSH_TO_GITHUB.command ajay123"
echo ""
echo "Repository ready for GitHub! 🎉"