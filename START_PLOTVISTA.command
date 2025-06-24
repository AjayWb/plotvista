#!/bin/bash

cd "$(dirname "$0")"

echo "🚀 Starting PlotVista..."
echo ""

# Start backend in new terminal
osascript -e 'tell app "Terminal" to do script "cd /Users/ajay/plotvista/backend && npm install && npm start"'

# Wait for backend to start
sleep 5

# Start frontend in new terminal
osascript -e 'tell app "Terminal" to do script "cd /Users/ajay/plotvista/frontend && npm install && npm run dev -- --host"'

# Wait for frontend to start
sleep 8

# Open in browser
open http://localhost:5173

echo ""
echo "✅ PlotVista is starting..."
echo ""
echo "📝 IMPORTANT INFORMATION:"
echo ""
echo "🌐 Local Access (on this Mac):"
echo "   http://localhost:5173"
echo ""
echo "📱 Network Access (for other devices on same WiFi):"
echo "   1. Go to System Settings → Network → WiFi"
echo "   2. Click 'Details...' button"
echo "   3. Find your IP address (like 192.168.1.xxx)"
echo "   4. Share this URL: http://YOUR-IP:5173"
echo ""
echo "🔐 Admin Login:"
echo "   Password: sizzle123"
echo ""
echo "💡 Keep both Terminal windows open while using PlotVista"
echo ""
echo "Press any key to close this window..."
read -n 1