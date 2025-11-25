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

# 5. Rebuild and upgrade the application
echo "🐳 Rebuilding containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 6. Refresh server settings (in case you changed synchboard.conf)
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx

echo "✅ Deployment Finished Successfully!"