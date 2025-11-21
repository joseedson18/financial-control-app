#!/usr/bin/env bash
PORT=8000

# Kill any process already using the port
PIDS=$(lsof -ti :$PORT)
if [ -n "$PIDS" ]; then
    echo "Port $PORT already in use by: $PIDS"
    kill $PIDS 2>/dev/null || true
    sleep 1
fi

echo "Starting uvicorn on port $PORT..."
uvicorn backend.main:app --reload --port $PORT
