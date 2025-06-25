#!/bin/bash

echo "🛑 Killing everything..."
pkill -f "node\|vite\|ngrok" 2>/dev/null || true
sleep 2

echo "🚀 Starting Backend (port 5000)..."
cd /Users/ajay/plotvista/backend
PORT=5000 node server-local.js &
BACKEND_PID=$!
sleep 3

echo "🎨 Starting Simple frontend server (port 5001)..."
cd /Users/ajay/plotvista
node SIMPLE_SERVER.js &
FRONTEND_PID=$!
sleep 3

echo "🌐 Starting ngrok..."
ngrok http 5001 &
NGROK_PID=$!
sleep 5

echo ""
echo "✅ ALL RUNNING!"
echo "🌐 Local: http://localhost:5001"
echo ""

# Better URL detection
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        echo "🌍 PUBLIC URL: $NGROK_URL"
        echo "🔐 Password: sizzle123"
        echo ""
        echo "✅ SHARE THIS URL - IT WORKS!"
        break
    else
        echo "⏳ Getting URL... ($i/10)"
        sleep 2
    fi
done

if [ -z "$NGROK_URL" ]; then
    echo "📊 Manual check: http://localhost:4040"
fi

echo ""
echo "📊 Services running:"
echo "   Backend: PID $BACKEND_PID"
echo "   Frontend: PID $FRONTEND_PID" 
echo "   Ngrok: PID $NGROK_PID"
echo ""
echo "Press Ctrl+C to stop everything"

# Cleanup on exit
trap "echo '🛑 Stopping...'; kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null; exit" INT
wait