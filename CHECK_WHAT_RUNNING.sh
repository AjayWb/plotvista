#!/bin/bash
echo "🔍 Checking what's actually running..."
echo ""

echo "📊 All node processes:"
ps aux | grep node | grep -v grep

echo ""
echo "🌐 Ports in use:"
echo "Port 3000:" 
lsof -i :3000 2>/dev/null || echo "Nothing on 3000"

echo "Port 4001:"
lsof -i :4001 2>/dev/null || echo "Nothing on 4001" 

echo "Port 6173:"
lsof -i :6173 2>/dev/null || echo "Nothing on 6173"

echo "Port 6174:"
lsof -i :6174 2>/dev/null || echo "Nothing on 6174"

echo ""
echo "🧪 Testing URLs:"
echo "Testing 4001 (backend):"
curl -s http://localhost:4001/api/projects >/dev/null && echo "✅ Backend working on 4001" || echo "❌ Backend not working on 4001"

echo "Testing 6173 (frontend):"
curl -s http://localhost:6173 >/dev/null && echo "✅ Frontend working on 6173" || echo "❌ Frontend not working on 6173"

echo "Testing 6174 (frontend):"
curl -s http://localhost:6174 >/dev/null && echo "✅ Frontend working on 6174" || echo "❌ Frontend not working on 6174"