#!/bin/bash
# Quick Docker rebuild script for development

set -e  # Exit on error

echo "🛑 Stopping and removing old container..."
docker stop timor-inss-frontend 2>/dev/null || true
docker rm timor-inss-frontend 2>/dev/null || true

echo "🏗️  Building new Docker image..."
docker build -t timor-inss-frontend:latest .

echo "🚀 Starting new container..."
docker run -d -p 8080:8080 --name timor-inss-frontend timor-inss-frontend:latest

echo "✅ Done! Application running at http://localhost:8080"
echo ""
echo "📋 Useful commands:"
echo "   View logs:    docker logs -f timor-inss-frontend"
echo "   Stop:         docker stop timor-inss-frontend"
echo "   Restart:      docker restart timor-inss-frontend"
echo "   Shell access: docker exec -it timor-inss-frontend sh"

