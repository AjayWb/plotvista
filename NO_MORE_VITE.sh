#!/bin/bash

echo "🛑 Killing everything..."
pkill -f "node\|vite\|ngrok" 2>/dev/null || true
sleep 2

echo "🚀 Starting Backend (port 5000)..."
cd /Users/ajay/plotvista/backend
PORT=5000 node server-local.js &
sleep 3

echo "🎨 Starting SIMPLE frontend server (port 5001)..."
cd /Users/ajay/plotvista
node SIMPLE_SERVER.js &
sleep 3

echo "🌐 Starting ngrok..."
ngrok http 5001 &
sleep 5

echo ""
echo "✅ NO MORE VITE PROBLEMS!"
echo "🌐 Local: http://localhost:5001"
echo ""

# Get URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
if [ ! -z "$NGROK_URL" ]; then
    echo "🌍 PUBLIC URL: $NGROK_URL"
    echo "🔐 Password: sizzle123"
    echo ""
    echo "✅ THIS WORKS - NO VITE BLOCKING!"
else
    echo "📊 Check: http://localhost:4040"
fi

echo ""
echo "Press Ctrl+C to stop"
wait