#!/bin/sh
cat <<JS > /usr/share/nginx/html/config.js
window.JET_ADMIN_CONFIG = {
  SERVER_HOST: "${VITE_SERVER_HOST:-http://localhost:8090}",
  SOCKET_HOST: "${VITE_SOCKET_HOST:-http://localhost:8090}"
};
JS
exec nginx -g "daemon off;"
