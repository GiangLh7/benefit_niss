#!/bin/bash
# Docker rebuild script WITHOUT cache (slower but ensures fresh build)

set -e  # Exit on error

echo "🛑 Stopping and removing old container..."
docker stop timor-inss-frontend 2>/dev/null || true
docker rm timor-inss-frontend 2>/dev/null || true

echo "🗑️  Removing old image..."
docker rmi timor-inss-frontend:latest 2>/dev/null || true

echo "🏗️  Building new Docker image (no cache - this will take longer)..."
docker build --no-cache -t timor-inss-frontend:latest .

echo "🚀 Starting new container..."
docker run -d -p 8080:8080 --name timor-inss-frontend timor-inss-frontend:latest

echo "✅ Done! Application running at http://localhost:8080"

