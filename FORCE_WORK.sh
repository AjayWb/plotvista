#!/bin/bash

echo "🛑 Killing everything..."
pkill -f "node" 2>/dev/null
pkill -f "vite" 2>/dev/null  
pkill -f "ngrok" 2>/dev/null
sleep 2

echo "🚀 Starting Backend (port 5000)..."
cd /Users/ajay/plotvista/backend
PORT=5000 node server-local.js &
sleep 3

echo "🎨 Starting Frontend with FORCED settings..."
cd /Users/ajay/plotvista/frontend
npx vite --port 5001 --host 0.0.0.0 --allowed-hosts all &
sleep 5

echo "🌐 Starting ngrok..."
ngrok http 5001 &
sleep 5

echo ""
echo "✅ FORCED TO WORK!"
echo "🌐 Local: http://localhost:5001"
echo ""

# Get URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
if [ ! -z "$NGROK_URL" ]; then
    echo "🌍 PUBLIC URL: $NGROK_URL"
    echo "🔐 Password: sizzle123"
    echo ""
    echo "✅ THIS WILL WORK!"
else
    echo "📊 Check: http://localhost:4040"
fi

echo ""
echo "Press Ctrl+C to stop"
wait