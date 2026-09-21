#!/bin/sh
# ============================================
# Jet Admin - Frontend Entrypoint
# ============================================
# Generates /usr/share/nginx/html/config.js from environment variables so
# the SAME image can point at any backend without rebuilding.
#
#   docker run -e SERVER_HOST=http://localhost:8090 \
#              -e SOCKET_HOST=http://localhost:8090 ...
#
# Legacy VITE_SERVER_HOST / VITE_SOCKET_HOST are honored as fallbacks.
# Empty values are omitted -> the app falls back to window.location.origin
# (nginx proxies /api + /socket.io to the backend, so same-origin works).
set -e

CONFIG_FILE="/usr/share/nginx/html/config.js"

# Prefer SERVER_HOST / SOCKET_HOST, fall back to the legacy VITE_* names.
SERVER="${SERVER_HOST:-${VITE_SERVER_HOST:-}}"
SOCKET="${SOCKET_HOST:-${VITE_SOCKET_HOST:-}}"

# Escape backslashes and double quotes for safe JS string embedding.
escape_js() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

{
  echo "window.__JET_ADMIN_CONFIG__ = {"
  if [ -n "$SERVER" ]; then
    echo "  SERVER_HOST: \"$(escape_js "$SERVER")\","
  fi
  if [ -n "$SOCKET" ]; then
    echo "  SOCKET_HOST: \"$(escape_js "$SOCKET")\","
  fi
  echo "};"
} > "$CONFIG_FILE"

echo "Frontend runtime config written to $CONFIG_FILE:"
cat "$CONFIG_FILE"

exec nginx -g "daemon off;"
