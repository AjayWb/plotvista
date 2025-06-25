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

echo "🎨 Starting Frontend on port 5001 (with ngrok support)..."
cd /Users/ajay/plotvista/frontend
npx vite --port 5001 --host 0.0.0.0 --config vite.config.ts &
FRONTEND_PID=$!
sleep 5

echo "🌐 Starting ngrok tunnel..."
ngrok http 5001 --log=stdout &
NGROK_PID=$!
sleep 5

echo ""
echo "✅ PLOTVISTA IS LIVE ON INTERNET!"
echo ""

# Get ngrok URL with retries
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        echo "🌐 PUBLIC URL: $NGROK_URL"
        echo "🔐 Password: sizzle123"
        echo ""
        echo "✅ Share this URL with anyone!"
        break
    else
        echo "⏳ Getting URL... (attempt $i/10)"
        sleep 2
    fi
done

if [ -z "$NGROK_URL" ]; then
    echo "⚠️  Check http://localhost:4040 for your URL"
fi

echo ""
echo "📊 Monitor at: http://localhost:4040"
echo "Press Ctrl+C to stop everything"

# Wait for user interrupt
trap "echo '🛑 Stopping all services...'; kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null; exit" INT
wait