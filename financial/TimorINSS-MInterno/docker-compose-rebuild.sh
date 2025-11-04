#!/bin/bash
# Docker Compose rebuild script

set -e  # Exit on error

echo "🔄 Rebuilding with Docker Compose..."

# Stop existing containers
docker-compose down

# Rebuild and start
docker-compose up -d --build

echo "✅ Done! Application running at http://localhost:8080"
echo ""
echo "📋 Useful commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop:         docker-compose down"
echo "   Restart:      docker-compose restart"

