#!/usr/bin/env bash
# Installs Paperclip (paperclipai) on a Linux machine as root.
# Works as a cloud environment setup script; it does not need this
# repository, a Claude session or API credentials.
#
# - Creates the user `paperclip`: Paperclip's embedded PostgreSQL refuses
#   to run as root.
# - Installs Node.js 24 (Paperclip needs >= 24.11) to /usr/local/node24.
# - Installs Paperclip to /opt/paperclip, readable for all users.
# - Safe to run again.
#
# Start the server afterwards with: bash tools/paperclip/start.sh
#
# Usage: bash tools/paperclip/setup.sh

set -euo pipefail

NODE_VERSION="24.22.0"
PAPERCLIP_VERSION="2026.1012.0"

NODE_DIR="/usr/local/node24"
APP_DIR="/opt/paperclip"
APP_USER="paperclip"

if [ "$(id -u)" -ne 0 ]; then
  echo "Fehler: Bitte als root ausführen." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "Fehler: 'npm' wurde nicht gefunden." >&2
  exit 1
fi

if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "$APP_USER"
  echo "Nutzer $APP_USER angelegt."
fi

if [ "$("$NODE_DIR/bin/node" --version 2>/dev/null)" != "v$NODE_VERSION" ]; then
  mkdir -p "$NODE_DIR/bin"
  npm install --prefix "$NODE_DIR" --no-save --no-audit --no-fund "node@$NODE_VERSION" >/dev/null
  cp "$NODE_DIR/node_modules/node/bin/node" "$NODE_DIR/bin/node"
  chmod 755 "$NODE_DIR/bin/node"
  echo "Node.js $NODE_VERSION installiert."
fi

installed="$("$NODE_DIR/bin/node" -p "require('$APP_DIR/node_modules/paperclipai/package.json').version" 2>/dev/null || true)"
if [ "$installed" != "$PAPERCLIP_VERSION" ]; then
  mkdir -p "$APP_DIR"
  # legacy-peer-deps: without it npm aborts with "Cannot read properties of null (reading 'edgesOut')".
  (cd "$APP_DIR" && PATH="$NODE_DIR/bin:$PATH" npm_config_legacy_peer_deps=true \
    npm install --no-audit --no-fund "paperclipai@$PAPERCLIP_VERSION" >/dev/null)
  chmod -R a+rX "$APP_DIR"
  echo "Paperclip $PAPERCLIP_VERSION installiert."
fi

echo "Fertig. Server starten: bash tools/paperclip/start.sh"
