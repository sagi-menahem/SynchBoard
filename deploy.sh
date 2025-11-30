#!/bin/bash

# Stop if there is an error
set -e

echo "🚀 Starting Deployment..."

# 1. Enter the folder (for safety)
cd /root/SynchBoard

# 2. Revert local changes (prevents conflicts)
git checkout .

# 3. Pull the latest code
echo "📥 Pulling latest code..."
git pull

# 4. Verify permissions
chmod +x backend/gradlew
chmod +x deploy.sh

# 5. Clear Docker build cache to ensure fresh builds
echo "🧹 Clearing Docker build cache..."
docker builder prune -f

# 6. Touch index.html to update timestamp (helps with cache invalidation)
echo "📝 Updating index.html timestamp..."
touch frontend/index.html

# 7. Rebuild and upgrade the application with force recreate
echo "🐳 Rebuilding containers with fresh cache..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --force-recreate

# 8. Refresh server settings (in case you changed synchboard.conf)
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment Finished Successfully!"
echo ""
echo "⚠️  IMPORTANT: Users may need to perform a hard refresh to see updates:"
echo "   • Chrome/Edge: Ctrl+Shift+R or Ctrl+F5"
echo "   • Firefox: Ctrl+Shift+R"
echo "   • Safari: Cmd+Shift+R"
echo "   • Mobile: Clear browser cache or use incognito mode"
echo ""