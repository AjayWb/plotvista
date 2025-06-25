#!/bin/bash
echo "🔍 Checking what's running on different ports..."
echo ""

echo "📊 Port 3000 (Marketing Dashboard?):"
lsof -i :3000
echo ""

echo "📦 Port 3001 (PlotVista Backend):"
lsof -i :3001
echo ""

echo "🎨 Port 5173 (PlotVista Frontend):"
lsof -i :5173
echo ""

echo "🌐 Port 5000:"
lsof -i :5000
echo ""

echo "💡 If marketing dashboard is on 3000, we can:"
echo "1. Use different ports for PlotVista"
echo "2. Or expose the marketing dashboard with ngrok instead"
echo ""
echo "What would you like to do?"