#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
PIDFILE="$SCRIPT_DIR/.dev-pids"

# Cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services...${NC}"
    if [ -f "$PIDFILE" ]; then
        while read -r pid; do
            kill "$pid" 2>/dev/null || true
        done < "$PIDFILE"
        rm -f "$PIDFILE"
    fi
    echo -e "${GREEN}All services stopped.${NC}"
}
trap cleanup EXIT INT TERM

echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🛒 Tokoo — Development Mode (cloudflared)${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""

# --- 1. Find cloudflared ---
CLOUDFLARED="$SCRIPT_DIR/cloudflared"
if [ ! -x "$CLOUDFLARED" ]; then
    echo -e "${YELLOW}cloudflared not found at $CLOUDFLARED${NC}"
    echo -e "${YELLOW}Downloading...${NC}"
    ARCH=$(uname -m)
    if [ "$ARCH" = "x86_64" ]; then CF_ARCH="amd64"; elif [ "$ARCH" = "aarch64" ]; then CF_ARCH="arm64"; else CF_ARCH="amd64"; fi
    curl -sL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${CF_ARCH}" -o "$CLOUDFLARED"
    chmod +x "$CLOUDFLARED"
fi

# --- 2. Start Laravel backend ---
echo -e "${GREEN}[1/3] Starting Laravel backend on :8000...${NC}"
cd "$BACKEND_DIR"
php artisan serve --host=0.0.0.0 --port=8000 > /tmp/tokoo-backend.log 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" >> "$PIDFILE"
sleep 2

if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "${RED}Backend failed to start. Check: tail /tmp/tokoo-backend.log${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Backend running (PID: $BACKEND_PID)${NC}"

# --- 3. Start cloudflared tunnel ---
echo -e "${GREEN}[2/3] Starting cloudflared tunnel...${NC}"
setsid -f "$CLOUDFLARED" tunnel --url http://localhost:8000 --protocol http2 > /tmp/tokoo-cloudflared.log 2>&1 < /dev/null &
CF_PID=$!
echo "$CF_PID" >> "$PIDFILE"

# Wait for URL to appear
echo -e "  Waiting for tunnel URL..."
TUNNEL_URL=""
for i in $(seq 1 30); do
    TUNNEL_URL=$(grep -oP 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tokoo-cloudflared.log 2>/dev/null | head -1 || true)
    if [ -n "$TUNNEL_URL" ]; then
        break
    fi
    sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
    echo -e "${RED}Failed to get tunnel URL. Check: tail /tmp/tokoo-cloudflared.log${NC}"
    exit 1
fi

echo -e "${GREEN}  ✓ Tunnel active: ${TUNNEL_URL}${NC}"
echo -e "${CYAN}  Backend API: ${TUNNEL_URL}/api${NC}"

# --- 4. Update frontend .env.local ---
echo -e "${GREEN}[3/3] Updating frontend environment...${NC}"
cat > "$FRONTEND_DIR/.env.local" <<EOF
NEXT_PUBLIC_API_URL=${TUNNEL_URL}/api
NEXT_PUBLIC_APP_URL=${TUNNEL_URL}
NEXT_PUBLIC_APP_NAME=Tokoo
EOF
echo -e "${GREEN}  ✓ Frontend .env.local updated${NC}"

# --- 5. Start Next.js dev server ---
echo ""
echo -e "${CYAN}Starting Next.js dev server...${NC}"
cd "$FRONTEND_DIR"
setsid -f npm run dev > /tmp/tokoo-frontend.log 2>&1 < /dev/null &
FRONTEND_PID=$!
echo "$FRONTEND_PID" >> "$PIDFILE"

# --- Summary ---
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🛒 Tokoo is running!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Frontend:    ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend:     ${GREEN}http://localhost:8000${NC}"
echo -e "  API (public): ${GREEN}${TUNNEL_URL}/api${NC}"
echo ""
echo -e "  ${YELLOW}→ Update Vercel NEXT_PUBLIC_API_URL to:${NC}"
echo -e "  ${GREEN}${TUNNEL_URL}/api${NC}"
echo ""
echo -e "  Press Ctrl+C to stop all services."
echo ""

# Wait for any process to exit
wait
