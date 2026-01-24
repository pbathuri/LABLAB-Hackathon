#!/bin/bash

echo "🐱 Starting Captain Whiskers with Docker Compose..."

# Stop any existing containers
docker-compose down

# Build and start services
docker-compose up --build -d

echo ""
echo "✅ Services starting..."
echo ""
echo "📋 Service URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3001"
echo "   Quantum:   http://localhost:8000"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
