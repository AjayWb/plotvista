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

echo "🌐 Starting ngrok tunnel..."
ngrok http 5001 --log=stdout &
NGROK_PID=$!
sleep 3

echo ""
echo "✅ PLOTVISTA IS LIVE ON INTERNET!"
echo ""
echo "🔍 Getting your public URL..."
sleep 2

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app')

if [ ! -z "$NGROK_URL" ]; then
    echo "🌐 PUBLIC URL: $NGROK_URL"
    echo "🔐 Password: sizzle123"
    echo ""
    echo "✅ Share this URL with anyone!"
else
    echo "⏳ Getting URL... check http://localhost:4040"
fi

echo ""
echo "📊 Monitor at: http://localhost:4040"
echo "Press Ctrl+C to stop everything"

# Wait for user interrupt
trap "echo '🛑 Stopping all services...'; kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null; exit" INT
wait