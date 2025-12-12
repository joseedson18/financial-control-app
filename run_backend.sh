#!/usr/bin/env bash
set -euo pipefail

# Configurable runtime options with sane defaults
PORT=${PORT:-8000}
HOST=${HOST:-0.0.0.0}
WORKERS=${WORKERS:-1}
RELOAD=${RELOAD:-false}

# Kill any process already using the port (best-effort)
if command -v lsof >/dev/null 2>&1; then
    PIDS=$(lsof -ti :"$PORT" || true)
    if [ -n "$PIDS" ]; then
        echo "Port $PORT already in use by: $PIDS"
        kill $PIDS 2>/dev/null || true
        sleep 1
    fi
fi

echo "Starting uvicorn on ${HOST}:${PORT} (workers=${WORKERS}, reload=${RELOAD})..."

uvicorn backend.main:app \
    --host "$HOST" \
    --port "$PORT" \
    $( [ "$RELOAD" = "true" ] && echo "--reload" ) \
    $( [ "$WORKERS" -gt 1 ] && echo "--workers $WORKERS" )
