#!/bin/bash
cd "$(dirname "$0")"

echo "🔍 DEBUG MODE - Let's see what's happening"
echo ""

# Kill processes
killall node 2>/dev/null || true
sleep 1

echo "📦 Step 1: Install backend dependencies"
cd backend
npm install
echo "Backend npm install completed"

echo ""
echo "🧪 Step 2: Test basic node"
node --version
echo "Node version check passed"

echo ""
echo "📝 Step 3: Test server file exists"
if [ -f "server-local.js" ]; then
    echo "✅ server-local.js exists"
else
    echo "❌ server-local.js missing"
    exit 1
fi

echo ""
echo "🚀 Step 4: Starting backend with verbose output"
echo "Command: PORT=4001 node server-local.js"
PORT=4001 node server-local.js &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

echo ""
echo "⏳ Waiting 5 seconds for backend to start..."
sleep 5

echo ""
echo "🧪 Step 5: Test backend connection"
curl -v http://localhost:4001/api/projects 2>&1 | head -10
CURL_EXIT=$?
echo "Curl exit code: $CURL_EXIT"

if [ $CURL_EXIT -eq 0 ]; then
    echo "✅ Backend is responding!"
else
    echo "❌ Backend not responding"
    echo ""
    echo "Let's check what's running on port 4001:"
    lsof -i :4001
    exit 1
fi

echo ""
echo "🎨 Step 6: Starting frontend"
cd ../frontend
npm install
echo "Frontend npm install completed"

echo ""
echo "Frontend starting on port 6173..."
npm run dev -- --port 6173 --host 0.0.0.0 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "⏳ Waiting 8 seconds for frontend..."
sleep 8

echo ""
echo "🧪 Step 7: Test frontend"
curl -v http://localhost:6173 2>&1 | head -5

echo ""
echo "✅ If you see HTML above, frontend is working!"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:6173"
echo "   Backend: http://localhost:4001"
echo ""
echo "🔐 Password: sizzle123"
echo ""
echo "Press Ctrl+C to stop both servers"

wait