#!/bin/bash

# Stop all Captain Whiskers services

echo "🛑 Stopping Captain Whiskers services..."

if [ -d "logs" ]; then
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            name=$(basename "$pidfile" .pid)
            if kill -0 "$pid" 2>/dev/null; then
                echo "Stopping $name (PID: $pid)..."
                kill "$pid" 2>/dev/null
            fi
            rm "$pidfile"
        fi
    done
fi

# Also kill any node/python processes on our ports
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "✅ All services stopped"
