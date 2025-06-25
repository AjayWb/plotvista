#!/bin/bash

echo "🧹 Cleaning everything..."
pkill -f "node" 2>/dev/null
pkill -f "vite" 2>/dev/null  
pkill -f "ngrok" 2>/dev/null
sleep 3

echo "🚀 Starting Backend on port 5000..."
cd /Users/ajay/plotvista/backend
PORT=5000 node server-local.js &
BACKEND_PID=$!
sleep 3

echo "🎨 Starting Frontend on port 5001..."
cd /Users/ajay/plotvista/frontend
npx vite --port 5001 --host 0.0.0.0 &
FRONTEND_PID=$!
sleep 5

echo ""
echo "✅ PLOTVISTA IS RUNNING!"
echo "🌐 Open: http://localhost:5001"
echo "🔐 Password: sizzle123"
echo ""
echo "💡 For public URL, run in NEW terminal:"
echo "   ngrok http 5001"
echo ""
echo "Press Ctrl+C to stop everything"

# Wait for user interrupt
trap "echo '🛑 Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait