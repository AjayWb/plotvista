#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Starting PlotVista Fresh - Clean Setup"
echo ""

# Kill any existing processes
echo "🧹 Cleaning up..."
killall node 2>/dev/null || true
killall npm 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "plotvista" 2>/dev/null || true

sleep 3

# Start backend on port 4001
echo "📦 Starting Backend on port 4001..."
cd backend
PORT=4001 node server-local.js &
BACKEND_PID=$!

# Wait for backend
echo "⏳ Waiting for backend..."
sleep 5

# Start frontend on port 6173 
echo "🎨 Starting Frontend on port 6173..."
cd ../frontend
npm run dev -- --host 0.0.0.0 --port 6173 &
FRONTEND_PID=$!

# Wait for frontend
echo "⏳ Waiting for frontend..."
sleep 8

echo ""
echo "✅ PlotVista is RUNNING!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:6173"
echo "   Backend:  http://localhost:4001"
echo ""
echo "🔐 Manager Login:"
echo "   Password: sizzle123"
echo ""
echo "💡 Next step - run in another terminal:"
echo "   ngrok http 6173"
echo ""
echo "Press Ctrl+C to stop everything"

# Keep running
wait