#!/usr/bin/env bash
# Jet Admin launcher - start the complete application, starting with Docker.
# Bash / WSL / macOS wrapper around scripts/start.js.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$ROOT/scripts/start.js" "$@"
