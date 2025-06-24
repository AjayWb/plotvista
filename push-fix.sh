#!/bin/bash
cd /Users/ajay/plotvista
git add .
git commit -m "Fix Railway build memory issue - simplified Dockerfile and added nixpacks config"
git push origin main
echo "✅ Pushed fix to GitHub - Railway will rebuild automatically"