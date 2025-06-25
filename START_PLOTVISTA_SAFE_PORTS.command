#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Starting PlotVista on SAFE PORTS (avoiding 3000)"
echo "📊 Marketing dashboard on 3000 will be left alone"
echo ""

# Kill any PlotVista processes (not marketing dashboard)
echo "🧹 Cleaning PlotVista processes only..."
pkill -f "plotvista" 2>/dev/null || true
pkill -f "server-local" 2>/dev/null || true

# Start PlotVista backend on port 4001 (not 3001)
echo "📦 Starting PlotVista Backend on port 4001..."
cd backend
PORT=4001 npm run start-local &
BACKEND_PID=$!

# Wait for backend
sleep 5

# Start PlotVista frontend on port 6173 (not 5173)  
echo "🎨 Starting PlotVista Frontend on port 6173..."
cd ../frontend
npm run dev -- --host 0.0.0.0 --port 6173 &
FRONTEND_PID=$!

# Wait for frontend
sleep 8

echo ""
echo "✅ PLOTVISTA IS RUNNING ON SAFE PORTS!"
echo ""
echo "🌐 PlotVista URLs:"
echo "   Local: http://localhost:6173"
echo "   Backend: http://localhost:4001"
echo ""
echo "📊 Marketing Dashboard: http://localhost:3000 (untouched)"
echo ""
echo "💡 Now run this in another terminal:"
echo "   ngrok http 6173"
echo ""
echo "🔐 Manager password: sizzle123"
echo ""
echo "Press Ctrl+C to stop PlotVista only"

# Keep script alive
wait