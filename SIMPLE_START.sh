#!/bin/bash
cd /Users/ajay/plotvista

echo "🎯 Simple Start - Correct Ports"

# Kill existing
killall node 2>/dev/null || true
sleep 2

# Backend on 4001 (explicit port)
echo "Starting backend on 4001..."
cd backend && PORT=4001 node server-local.js &

sleep 4

# Frontend on 6173
echo "Starting frontend on 6173..."  
cd ../frontend && npm run dev -- --port 6173 --host 0.0.0.0 &

sleep 6

echo "✅ Done! Check:"
echo "Frontend: http://localhost:6173"
echo "Backend: http://localhost:4001"