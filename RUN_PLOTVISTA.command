#!/bin/bash
cd "$(dirname "$0")"

# Kill everything first
killall node 2>/dev/null || true
killall ngrok 2>/dev/null || true
sleep 2

# Start backend
echo "Starting PlotVista..."
cd backend
PORT=4001 node server-local.js &
sleep 3

# Start frontend
cd ../frontend
npm run dev -- --port 6173 --host 0.0.0.0 &
sleep 5

# Start ngrok
ngrok http 6173 --log=stdout | grep -o 'https://.*\.ngrok.*\.app' &

echo ""
echo "✅ PlotVista is starting..."
echo ""
echo "⏳ Wait 10 seconds, then look for your public URL above"
echo "   It will look like: https://xxxx.ngrok-free.app"
echo ""
echo "🔐 Manager Password: sizzle123"
echo ""
echo "📱 Share the ngrok URL with your 20 employees"
echo ""
echo "Press Ctrl+C to stop everything"

wait