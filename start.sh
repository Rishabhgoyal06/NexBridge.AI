#!/usr/bin/env bash
set -e

# ==============================================================================
# NexBridge.ai — Unified Startup Orchestrator
# Launches FastAPI Backend (Port 8000) and React Vite Frontend (Port 5173)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "================================================================="
echo "  🚀 Starting NexBridge.ai Autonomous Venture Studio"
echo "  Executive Precision | React 19 + FastAPI + Supabase + Gemini"
echo "================================================================="

# Trap termination signals to cleanly shut down both servers
cleanup() {
    echo ""
    echo "🛑 Shutting down NexBridge services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    echo "✅ All services stopped."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Check Python virtual environment
PYTHON_BIN="python3"
if [ -f "$SCRIPT_DIR/backend/venv/bin/python" ]; then
    PYTHON_BIN="$SCRIPT_DIR/backend/venv/bin/python"
    UVICORN_BIN="$SCRIPT_DIR/backend/venv/bin/uvicorn"
elif command -v uvicorn >/dev/null 2>&1; then
    UVICORN_BIN="uvicorn"
else
    echo "⚠️ Python virtualenv not found at backend/venv. Initializing..."
    python3 -m venv "$SCRIPT_DIR/backend/venv"
    "$SCRIPT_DIR/backend/venv/bin/pip" install -r "$SCRIPT_DIR/backend/requirements.txt"
    PYTHON_BIN="$SCRIPT_DIR/backend/venv/bin/python"
    UVICORN_BIN="$SCRIPT_DIR/backend/venv/bin/uvicorn"
fi

# 2. Check Frontend node_modules
if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm --prefix "$SCRIPT_DIR/frontend" install
fi

# 3. Start Backend API
echo "⚡ Starting FastAPI Backend on http://localhost:8000..."
$UVICORN_BIN app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir "$SCRIPT_DIR/backend" &
BACKEND_PID=$!

# Wait briefly for backend port to open
sleep 1.5

# 4. Start Frontend Dev Server
echo "⚡ Starting Vite Frontend on http://localhost:5173..."
npm --prefix "$SCRIPT_DIR/frontend" run dev &
FRONTEND_PID=$!

echo ""
echo "================================================================="
echo "  🌟 NexBridge.ai is ready for action!"
echo "  • Frontend Studio:  http://localhost:5173"
echo "  • Backend API:      http://localhost:8000"
echo "  • API Docs:         http://localhost:8000/docs"
echo "  • Health Check:     http://localhost:8000/health"
echo "  Press Ctrl+C to stop all services."
echo "================================================================="
echo ""

# Keep orchestrator running and wait for both processes
wait $BACKEND_PID $FRONTEND_PID
