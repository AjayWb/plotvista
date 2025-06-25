#!/bin/bash
cd "$(dirname "$0")"

echo "🚨 EMERGENCY PLOTVISTA START - MAKING IT WORK!"
echo ""

# Kill everything first
echo "🧹 Cleaning up any running processes..."
killall node 2>/dev/null || true
killall npm 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Wait a moment
sleep 2

# Start backend
echo "📦 Starting Backend on port 3001..."
cd backend
npm install --silent
npm run start-local &
BACKEND_PID=$!

# Wait for backend
sleep 5

# Start frontend
echo "🎨 Starting Frontend on port 5173..."
cd ../frontend
npm install --silent
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

# Wait for frontend
sleep 8

echo ""
echo "✅ PLOTVISTA IS RUNNING!"
echo ""
echo "🌐 Access URLs:"
echo "   Local: http://localhost:5173"
echo "   Local Backend: http://localhost:3001"
echo ""
echo "💡 Now run this in another terminal:"
echo "   ngrok http 5173"
echo ""
echo "🔐 Manager password: sizzle123"
echo ""
echo "Press Ctrl+C to stop everything"

# Keep script alive
wait