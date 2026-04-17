#!/bin/bash
cd "$(dirname "$0")"

echo ""
echo "====== FreeCode ======"
echo ""

# ── Ports ──────────────────────────────────────────────────────────────────
FC_BACKEND_PORT=47820
FC_FRONTEND_PORT=47821

PYTHON=$(command -v python3 || command -v python)
[ -z "$PYTHON" ] && echo "ERROR: Python 3 not found." && exit 1
command -v node &>/dev/null || { echo "ERROR: Node.js not found."; exit 1; }

# ── 1/5 Build / Requirements ───────────────────────────────────────────────
if [ ! -d venv ]; then
    echo "[setup] Creating Python virtual environment..."
    $PYTHON -m venv venv
fi

if   [ -f venv/bin/activate ];     then source venv/bin/activate
elif [ -f venv/Scripts/activate ]; then source venv/Scripts/activate
else echo "ERROR: Could not activate venv." && exit 1
fi

PYTHON=$(command -v python)
if ! "$PYTHON" -c "import websockets, webview" &>/dev/null; then
    echo "[setup] Installing Python dependencies..."
    "$PYTHON" -m pip install -q -r requirements.txt || exit 1
fi

if [ ! -d frontend/node_modules ]; then
    echo "[setup] Installing Node dependencies..."
    cd frontend && npm install --silent >/dev/null 2>&1 || exit 1
    cd ..
fi

# Ensure .env.local exists for frontend baking
cat > frontend/.env.local <<EOF
NEXT_PUBLIC_BACKEND_URL=ws://localhost:${FC_BACKEND_PORT}
NEXT_PUBLIC_FRONTEND_PORT=${FC_FRONTEND_PORT}
EOF

# Build frontend
REBUILD=0
[[ "$1" == "--rebuild" || "$1" == "-r" ]] && REBUILD=1

# Auto-detect changes in src or public
if [ -d frontend/.next ] && [ "$REBUILD" -eq 0 ]; then
    if [ "$(find frontend/src frontend/public -newer frontend/.next 2>/dev/null | wc -l)" -gt 0 ]; then
        echo "[1/5] Changes detected in frontend source, rebuilding..."
        REBUILD=1
    fi
fi

if [ -d frontend/.next ] && [ "$REBUILD" -eq 0 ]; then
    echo "[1/5] Frontend build found. (Use --rebuild to force fresh build)"
else
    echo "[1/5] Building Frontend (production)..."
    rm -rf frontend/.next
    (cd frontend && npm run build) > logs/build.log 2>&1 || { echo "ERROR: Build failed. Check logs/build.log"; exit 1; }
fi

# Write .env.local so NEXT_PUBLIC vars are baked into the production build
cat > frontend/.env.local <<EOF
NEXT_PUBLIC_BACKEND_URL=ws://localhost:${FC_BACKEND_PORT}
NEXT_PUBLIC_FRONTEND_PORT=${FC_FRONTEND_PORT}
EOF

# ── 2/5 Cleanup ────────────────────────────────────────────────────────────
echo "[2/5] Cleaning up previous sessions..."
fuser -k ${FC_BACKEND_PORT}/tcp 2>/dev/null || true
fuser -k ${FC_FRONTEND_PORT}/tcp 2>/dev/null || true

# ── 3/5 Starting Backend ───────────────────────────────────────────────────
echo "[3/5] Starting Backend..."
mkdir -p logs
export FC_BACKEND_PORT
"$PYTHON" -m backend.server > logs/backend.log 2>&1 &
BACKEND_PID=$!

# ── 4/5 Starting Frontend ──────────────────────────────────────────────────
echo "[4/5] Starting Frontend..."
(cd frontend && npm start -- -p ${FC_FRONTEND_PORT}) > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

cleanup() {
    echo ""; echo "Stopping FreeCode..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# ── 5/5 Launch GUI ────────────────────────────────────────────────────────
echo "[5/5] Launching GUI..."
sleep 2
"$PYTHON" scripts/run_webview.py

cleanup
