# 🔧 Railway Builder Fix

## If you don't see Build settings:

### Option 1: Delete Dockerfile (Force Nixpacks)
Railway auto-detects Dockerfile. Remove it to force Nixpacks:

```bash
cd /Users/ajay/plotvista
rm Dockerfile
rm .dockerignore
git add -A
git commit -m "Remove Dockerfile to force Nixpacks builder"
git push origin main
```

### Option 2: Check Railway UI Location
In Railway Dashboard:
1. Click on your **PlotVista service** box (not PostgreSQL)
2. Look for tabs: **Deployments | Variables | Settings**
3. Click **Settings**
4. Scroll down - Build settings might be under:
   - "Build Configuration"
   - "Service Settings"
   - "Advanced"

### Option 3: Use Railway CLI
```bash
# Install Railway CLI
brew install railway

# Login
railway login

# Link to your project
railway link

# Set builder
railway vars set RAILWAY_BUILDER=NIXPACKS
```

## 🚀 Quick Fix - Just Delete Dockerfile

The fastest solution is Option 1 - remove Dockerfile and let Railway auto-detect and use Nixpacks.