#!/bin/bash
set -e

echo ""
echo "===================================="
echo "  HH GOA 2026 - PORTAL STARTER"
echo "===================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[ERROR] Python not found. Install Python 3.10+"
    exit 1
fi

PYTHON=$(command -v python3 || command -v python)

# Check Node
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found. Install Node 18+"
    exit 1
fi

echo "[1/4] Installing backend dependencies..."
cd "$SCRIPT_DIR/HH-backend"
pip install -r requirements.txt -q 2>/dev/null || $PYTHON -m pip install -r requirements.txt -q

echo "[2/4] Installing frontend dependencies..."
cd "$SCRIPT_DIR/HH-frontend"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "       node_modules exists, skipping..."
fi

echo "[3/4] Starting backend on http://localhost:8000 ..."
cd "$SCRIPT_DIR/HH-backend"
$PYTHON -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "[4/4] Starting frontend on http://localhost:3000 ..."
cd "$SCRIPT_DIR/HH-frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "===================================="
echo "  ALL SERVICES STARTED!"
echo "===================================="
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "===================================="

# Trap to kill background processes on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Services stopped.'" EXIT

wait
