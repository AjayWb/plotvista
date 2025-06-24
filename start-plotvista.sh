#!/bin/bash

echo "🚀 Starting PlotVista..."
echo ""

# Function to get IP address
get_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0 || ipconfig getifaddr en1
    else
        # Linux
        hostname -I | awk '{print $1}'
    fi
}

IP_ADDRESS=$(get_ip)

# Start backend
echo "📦 Starting Backend Server..."
cd backend
npm install --silent
node server-local.js &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend..."
cd ../frontend
npm install --silent
npm run dev -- --host &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

echo ""
echo "✅ PlotVista is running!"
echo ""
echo "🌐 Access PlotVista at:"
echo "   Local: http://localhost:5173"
echo "   Network: http://$IP_ADDRESS:5173"
echo ""
echo "📱 Share this with employees on same WiFi:"
echo "   http://$IP_ADDRESS:5173"
echo ""
echo "🔐 Admin Login:"
echo "   Click 'Manager Login'"
echo "   Password: sizzle123"
echo ""
echo "Press Ctrl+C to stop PlotVista"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping PlotVista..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT

# Keep script running
wait