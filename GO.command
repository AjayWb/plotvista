#!/bin/bash
cd "$(dirname "$0")"
echo "Installing dependencies and starting PlotVista..."
cd backend && npm install && cd ../frontend && npm install && cd .. && node start.js