#!/bin/bash

echo "🛑 Stopping everything..."
pkill -f "node\|ngrok" 2>/dev/null || true
sleep 3

echo "🚀 Starting Backend on port 8000..."
cd /Users/ajay/plotvista/backend
PORT=8000 node server-local.js &
BACKEND_PID=$!
sleep 3

echo "🎨 Starting Frontend server on port 8001..."
cd /Users/ajay/plotvista
node simple_frontend.js &
FRONTEND_PID=$!
sleep 3

echo "🔍 Testing servers..."
if curl -s http://localhost:8000/api/projects > /dev/null; then
    echo "✅ Backend working on port 8000"
else
    echo "❌ Backend failed on port 8000"
fi

if curl -s http://localhost:8001 > /dev/null; then
    echo "✅ Frontend working on port 8001"
else
    echo "❌ Frontend failed on port 8001"
fi

echo "🌐 Starting ngrok tunnel..."
ngrok http 8001 --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!
sleep 5

echo ""
echo "✅ ALL SERVICES RUNNING!"
echo ""
echo "🌐 Local access: http://localhost:8001"
echo "🔧 Backend API: http://localhost:8000"
echo ""

# Get ngrok URL
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        echo "🌍 PUBLIC URL: $NGROK_URL"
        echo "🔐 Admin Password: sizzle123"
        echo ""
        echo "✅ WORKING! Share the public URL!"
        break
    else
        echo "⏳ Getting ngrok URL... ($i/10)"
        sleep 2
    fi
done

if [ -z "$NGROK_URL" ]; then
    echo "📊 Check ngrok dashboard: http://localhost:4040"
    echo "📋 Or check ngrok.log for details"
fi

echo ""
echo "📊 Services:"
echo "   Backend: PID $BACKEND_PID (port 8000)"
echo "   Frontend: PID $FRONTEND_PID (port 8001)"
echo "   Ngrok: PID $NGROK_PID"
echo ""
echo "Press Ctrl+C to stop everything"

# Cleanup
trap "echo '🛑 Stopping all services...'; kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null; rm -f ngrok.log; exit" INT
wait