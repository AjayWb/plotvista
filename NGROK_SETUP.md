# 🚀 PlotVista with ngrok - 2 Minute Setup

## Step 1: Install ngrok (30 seconds)
```bash
brew install ngrok
```

## Step 2: Start PlotVista (30 seconds)
```bash
cd /Users/ajay/plotvista
node start.js
```

## Step 3: Expose to Internet (30 seconds)
Open a new terminal:
```bash
ngrok http 5173
```

## Step 4: Share URL (30 seconds)
- Copy the `https://` URL from ngrok (e.g., `https://abc123.ngrok.io`)
- Share with your 20 employees
- They can access from anywhere!

## 🎯 Total Time: 2 minutes vs 2 hours with Railway

## 🔐 Manager Access:
- URL: `https://your-ngrok-url.ngrok.io`
- Click "Manager Login"
- Password: `sizzle123`

## 💰 Cost: FREE
- ngrok free tier: 2 hours sessions
- Just restart ngrok when it expires
- $5/month for permanent URL if needed later

## ✅ Benefits:
- Works immediately
- No deployment issues
- Full control on your Mac
- Easy to update and restart