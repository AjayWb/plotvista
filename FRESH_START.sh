#!/bin/bash

echo "🛑 Killing everything..."
pkill -f "node\|vite\|ngrok" 2>/dev/null || true
sleep 2

echo "🚀 Starting Backend on port 8000..."
cd /Users/ajay/plotvista/backend
PORT=8000 node server-local.js &
BACKEND_PID=$!
sleep 4

echo "🎨 Starting Simple frontend server on port 8001..."
cd /Users/ajay/plotvista

# Create a simple server on port 8001 that proxies to 8000
cat > temp_server.js << 'EOF'
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8001;

app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend running on http://0.0.0.0:${PORT}`);
});
EOF

node temp_server.js &
FRONTEND_PID=$!
sleep 4

echo "🔍 Checking if servers are up..."
curl -s http://localhost:8000 > /dev/null && echo "✅ Backend responding" || echo "❌ Backend not responding"
curl -s http://localhost:8001 > /dev/null && echo "✅ Frontend responding" || echo "❌ Frontend not responding"

echo "🌐 Starting ngrok on port 8001..."
ngrok http 8001 &
NGROK_PID=$!
sleep 5

echo ""
echo "✅ FRESH START COMPLETE!"
echo "🌐 Local Frontend: http://localhost:8001"
echo "🔧 Local Backend: http://localhost:8000"
echo ""

# Get URL
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        echo "🌍 PUBLIC URL: $NGROK_URL"
        echo "🔐 Password: sizzle123"
        echo ""
        echo "✅ FRESH PORTS - SHOULD WORK!"
        break
    else
        echo "⏳ Getting URL... ($i/10)"
        sleep 2
    fi
done

echo ""
echo "📊 Running on:"
echo "   Backend: localhost:8000 (PID $BACKEND_PID)"
echo "   Frontend: localhost:8001 (PID $FRONTEND_PID)"
echo "   Ngrok: PID $NGROK_PID"
echo ""
echo "Press Ctrl+C to stop everything"

trap "echo '🛑 Stopping...'; kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null; rm -f temp_server.js; exit" INT
wait