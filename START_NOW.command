#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Starting PlotVista - Network Accessible Version..."

# Kill any existing processes
killall node 2>/dev/null || true

# Get IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "📍 Your Mac IP: $IP"

# Start backend
echo "📦 Starting Backend..."
cd backend
npm install --silent
npm start &
BACKEND_PID=$!

# Wait for backend
sleep 5

# Start frontend with network access
cd ../frontend
echo "🎨 Starting Frontend with network access..."
npm install --silent
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

# Wait for startup
sleep 8

echo ""
echo "✅ PlotVista is running!"
echo ""
echo "🌐 Access URLs:"
echo "   On this Mac: http://localhost:5173"
echo "   From other devices: http://$IP:5173"
echo ""
echo "📱 Share with employees: http://$IP:5173"
echo "🔐 Admin password: sizzle123"
echo ""
echo "⚠️  If not accessible from phones:"
echo "   1. Both devices must be on same WiFi"
echo "   2. Try turning off Mac firewall temporarily"
echo "   3. Use exact IP shown above"
echo ""
echo "Press Ctrl+C to stop PlotVista"

# Open browser
open http://localhost:5173

# Keep script running
wait