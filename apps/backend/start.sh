#!/bin/bash
echo "📦 Installing dependencies..."
npm ci || npm install

echo "🔨 Building application..."
npm run build

echo "🚀 Starting server..."
node dist/main.js
