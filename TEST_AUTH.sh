#!/bin/bash
echo "🔍 Testing authentication..."
echo ""

echo "1. Testing if backend is running on 4001:"
curl -s http://localhost:4001/api/projects >/dev/null && echo "✅ Backend is running" || echo "❌ Backend not running"

echo ""
echo "2. Testing login endpoint directly:"
curl -X POST http://localhost:4001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"sizzle123"}' \
  -v

echo ""
echo "3. Let's check what backend file is actually running:"
ps aux | grep "server-local.js" | grep -v grep