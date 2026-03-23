#!/bin/bash
# Flutter Dev Assistant MCP Server - Startup script
# Installs npm dependencies on first run, then starts the MCP server.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d "node_modules" ]; then
  echo "[flutter-dev-assistant] Installing dependencies..." >&2
  npm install --silent --prefer-offline 2>/dev/null || npm install --silent 2>/dev/null
fi

exec node index.js
