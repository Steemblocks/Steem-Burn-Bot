#!/bin/bash

# Steem Burn Bot - Docker Debug and Fix Script

echo "🔍 Checking container logs..."
docker logs steem-burn-bot

echo ""
echo "🛑 Stopping container..."
docker stop steem-burn-bot 2>/dev/null
docker rm steem-burn-bot 2>/dev/null

echo "🗑️  Removing old image..."
docker rmi steem-burn-bot 2>/dev/null

echo "📥 Pulling latest fixes..."
git pull origin main

echo "🔨 Building new image..."
docker build -t steem-burn-bot .

echo "📂 Creating logs directory..."
mkdir -p logs
chmod 755 logs

echo "🚀 Starting container..."
docker run -d \
  --name steem-burn-bot \
  --restart unless-stopped \
  -v "$(pwd)/config.json:/app/config.json:ro" \
  -v "$(pwd)/logs:/app" \
  steem-burn-bot

echo ""
echo "⏳ Waiting 5 seconds for startup..."
sleep 5

echo ""
echo "📊 Container status:"
docker ps | grep steem-burn-bot

echo ""
echo "📝 Container logs:"
docker logs steem-burn-bot

echo ""
echo "✅ Done! If successful, logs will show:"
echo "   'Configuration loaded successfully'"
echo "   'Connected to Steem blockchain'"
