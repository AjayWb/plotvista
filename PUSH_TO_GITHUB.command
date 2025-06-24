#!/bin/bash
cd "$(dirname "$0")"

# Check if username provided
if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub username:"
    echo "   ./PUSH_TO_GITHUB.command YOUR_USERNAME"
    echo ""
    echo "Example: ./PUSH_TO_GITHUB.command ajay123"
    exit 1
fi

USERNAME=$1
REPO_URL="https://github.com/$USERNAME/plotvista.git"

echo "🚀 Pushing PlotVista to GitHub..."
echo "📍 Repository: $REPO_URL"
echo ""

# Add remote origin
echo "🔗 Adding GitHub remote..."
git remote add origin $REPO_URL

# Create main branch and push
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 Your repository: https://github.com/$USERNAME/plotvista"
    echo ""
    echo "🚂 Next: Set up Railway deployment"
    echo ""
    echo "1. Go to https://railway.app"
    echo "2. Click 'New Project'"
    echo "3. Select 'Deploy from GitHub repo'"
    echo "4. Choose your 'plotvista' repository"
    echo "5. Add PostgreSQL database (New Service → Database → PostgreSQL)"
    echo "6. Set environment variables:"
    echo "   NODE_ENV=production"
    echo "   ADMIN_PASSWORD=sizzle123"
    echo "   DATABASE_URL=\${{Postgres.DATABASE_URL}}"
    echo ""
    echo "🎉 Your app will be live at: https://your-app-name.railway.app"
    echo "💰 Cost: $5/month for professional hosting"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo ""
    echo "1. Make sure you created the GitHub repository:"
    echo "   https://github.com/$USERNAME/plotvista"
    echo ""
    echo "2. Repository should be empty (no README, no files)"
    echo ""
    echo "3. Check your GitHub credentials are set up"
    echo ""
    echo "4. Try again with: ./PUSH_TO_GITHUB.command $USERNAME"
fi