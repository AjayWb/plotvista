#!/bin/bash
cd "$(dirname "$0")"

echo "🚀 Starting PlotVista with ngrok..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    brew install ngrok
fi

# Start PlotVista in background
echo "🎨 Starting PlotVista..."
node start.js &
PLOTVISTA_PID=$!

# Wait for PlotVista to start
echo "⏳ Waiting for PlotVista to start..."
sleep 8

# Start ngrok
echo "🌐 Exposing to internet with ngrok..."
echo ""
echo "🎯 PlotVista will be accessible worldwide!"
echo "📱 Copy the https:// URL and share with employees"
echo "🔐 Manager password: sizzle123"
echo ""
echo "Press Ctrl+C to stop everything"
echo ""

# This will show the public URL
ngrok http 5173

# Cleanup when stopped
echo "🛑 Stopping PlotVista..."
kill $PLOTVISTA_PID