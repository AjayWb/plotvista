#!/bin/bash

echo "🛑 Force killing everything..."
pkill -f "node" 2>/dev/null
pkill -f "vite" 2>/dev/null  
pkill -f "ngrok" 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
sleep 3

echo "🚀 Starting Backend (port 5000)..."
cd /Users/ajay/plotvista/backend
PORT=5000 node server-local.js &
sleep 4

echo "🎨 Starting Frontend (port 5001) with correct flags..."
cd /Users/ajay/plotvista/frontend
VITE_ALLOWED_HOSTS=all npx vite --port 5001 --host 0.0.0.0 &
sleep 6

echo "🌐 Starting ngrok..."
ngrok http 5001 &
sleep 5

echo ""
echo "✅ EVERYTHING STARTED!"
echo "🌐 Local: http://localhost:5001"
echo ""

# Get URL with better detection
for i in {1..5}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        echo "🌍 PUBLIC URL: $NGROK_URL"
        echo "🔐 Password: sizzle123"
        echo ""
        echo "✅ SHARE THIS URL!"
        break
    else
        echo "⏳ Getting URL... ($i/5)"
        sleep 2
    fi
done

if [ -z "$NGROK_URL" ]; then
    echo "📊 Manual check: http://localhost:4040"
fi

echo ""
echo "Press Ctrl+C to stop everything"
wait