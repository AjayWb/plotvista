#!/bin/bash
cd /Users/ajay/plotvista/backend

echo "🚀 Starting Backend RIGHT NOW on port 4001..."
echo ""

# Make sure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔥 Starting server..."
PORT=4001 node server-local.js