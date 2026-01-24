#!/bin/bash

# Captain Whiskers - Development Startup Script

echo "🐱 Starting Captain Whiskers Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check PostgreSQL
echo -e "${BLUE}📊 Checking PostgreSQL...${NC}"
if pg_isready -h localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL not running. Starting...${NC}"
    brew services start postgresql@14 2>/dev/null || echo "Please start PostgreSQL manually"
fi

# Function to start a service in background
start_service() {
    local name=$1
    local dir=$2
    local cmd=$3
    
    echo -e "${BLUE}🚀 Starting ${name}...${NC}"
    cd "$dir"
    
    if [ "$name" = "Quantum Service" ]; then
        source venv/bin/activate
    fi
    
    $cmd > "../logs/${name// /_}.log" 2>&1 &
    echo $! > "../logs/${name// /_}.pid"
    echo -e "${GREEN}✅ ${name} started (PID: $(cat ../logs/${name// /_}.pid))${NC}"
    cd - > /dev/null
}

# Create logs directory
mkdir -p logs

# Start services
echo ""
echo -e "${BLUE}Starting all services...${NC}"
echo ""

start_service "Backend" "apps/backend" "npm run dev"
sleep 3

start_service "Quantum Service" "apps/quantum-service" "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
sleep 3

start_service "Frontend" "apps/frontend" "npm run dev"
sleep 3

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 All services started!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📍 Services:"
echo "   Backend:        http://localhost:3001"
echo "   Quantum API:    http://localhost:8000"
echo "   Frontend:       http://localhost:3000"
echo ""
echo "📋 Logs:"
echo "   Backend:        logs/Backend.log"
echo "   Quantum:        logs/Quantum_Service.log"
echo "   Frontend:       logs/Frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop-dev.sh"
echo ""
