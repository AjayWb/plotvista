#!/bin/bash
cd /Users/ajay/plotvista

echo "🚀 Setting up PlotVista for GitHub..."

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial PlotVista setup for Railway deployment"

# Add remote and push
git remote add origin https://github.com/AjayWb/plotvista.git
git branch -M main
git push -u origin main

echo "✅ Pushed to GitHub successfully!"
echo "🌐 Repository: https://github.com/AjayWb/plotvista"