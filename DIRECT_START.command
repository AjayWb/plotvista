#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Direct Start - Manual Steps"
echo ""

# Kill processes
killall node 2>/dev/null || true
sleep 2

echo "Step 1: Starting Backend..."
cd backend
npm install
echo "Backend dependencies installed"

echo "Starting backend server on port 4001..."
PORT=4001 node server-local.js &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 5

echo ""
echo "Step 2: Testing backend..."
curl -s http://localhost:4001/api/projects > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is responding on port 4001"
else
    echo "❌ Backend not responding on port 4001"
    exit 1
fi

echo ""
echo "Step 3: Starting Frontend..."
cd ../frontend
npm install
echo "Frontend dependencies installed"

echo "Starting frontend on port 6173..."
npm run dev -- --host 0.0.0.0 --port 6173 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

sleep 8

echo ""
echo "Step 4: Testing frontend..."
curl -s http://localhost:6173 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend is responding on port 6173"
else
    echo "❌ Frontend not responding on port 6173"
fi

echo ""
echo "✅ PlotVista should be running:"
echo "   Frontend: http://localhost:6173"
echo "   Backend:  http://localhost:4001"
echo ""
echo "🔐 Try login with password: sizzle123"
echo ""
echo "Keep this terminal open. Press Ctrl+C to stop."

wait