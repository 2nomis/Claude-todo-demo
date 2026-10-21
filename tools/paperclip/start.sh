#!/usr/bin/env bash
# Starts the Paperclip server as user `paperclip` in the background and
# creates the dropshipping team (team.mjs). Needs setup.sh first; run as root.
#
# - First start runs `paperclipai onboard --yes`, later starts `paperclipai run`.
# - Passes ANTHROPIC_API_KEY / CLAUDE_CODE_OAUTH_TOKEN and the proxy settings
#   through to the server so the agents can reach Claude.
# - Does nothing if the server already answers; --restart stops it first
#   (needed after setting a new API key).
#
# Usage: bash tools/paperclip/start.sh [--restart]

set -euo pipefail

NODE_DIR="/usr/local/node24"
APP_DIR="/opt/paperclip"
APP_USER="paperclip"
APP_HOME="/home/$APP_USER"
URL="http://127.0.0.1:3100"
LOG="$APP_HOME/paperclip.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$(id -u)" -ne 0 ]; then
  echo "Fehler: Bitte als root ausführen." >&2
  exit 1
fi
if [ ! -x "$APP_DIR/node_modules/.bin/paperclipai" ] || ! id "$APP_USER" >/dev/null 2>&1; then
  echo "Fehler: Paperclip ist nicht installiert. Zuerst: bash tools/paperclip/setup.sh" >&2
  exit 1
fi

up() { curl -fsS -o /dev/null "$URL/" 2>/dev/null; }

if [ "${1:-}" = "--restart" ] && up; then
  pkill -u "$APP_USER" -f paperclipai || true
  for _ in $(seq 1 30); do up || break; sleep 1; done
  pkill -u "$APP_USER" -f postgres || true
  sleep 2
fi

if up; then
  echo "Paperclip läuft bereits auf $URL."
else
  # Only these variables reach the server; the user cannot read root's
  # CA file, so a copy is placed where it can.
  pass=(HOME="$APP_HOME" USER="$APP_USER" PATH="$NODE_DIR/bin:$APP_DIR/node_modules/.bin:$(dirname "$(command -v claude 2>/dev/null || echo /usr/bin/x)"):/usr/bin:/bin")
  for v in ANTHROPIC_API_KEY CLAUDE_CODE_OAUTH_TOKEN HTTPS_PROXY HTTP_PROXY NO_PROXY https_proxy http_proxy no_proxy; do
    if [ -n "${!v:-}" ]; then pass+=("$v=${!v}"); fi
  done
  for v in NODE_EXTRA_CA_CERTS SSL_CERT_FILE REQUESTS_CA_BUNDLE CURL_CA_BUNDLE; do
    f="${!v:-}"
    if [ -n "$f" ] && [ -f "$f" ]; then
      install -D -m 644 "$f" "/etc/paperclip/$(basename "$f")"
      pass+=("$v=/etc/paperclip/$(basename "$f")")
    fi
  done

  if [ -f "$APP_HOME/.paperclip/instances/default/config.json" ]; then
    cmd="paperclipai run"
  else
    cmd="paperclipai onboard --yes"
  fi
  runuser -u "$APP_USER" -- env -i "${pass[@]}" \
    setsid bash -c "cd ~ && exec $cmd" >"$LOG" 2>&1 < /dev/null &

  echo "Starte Paperclip ($cmd), Log: $LOG"
  for _ in $(seq 1 120); do
    up && break
    if ! pgrep -u "$APP_USER" -f paperclipai >/dev/null; then
      echo "Fehler: Paperclip hat sich beendet. Siehe $LOG" >&2
      tail -20 "$LOG" >&2
      exit 1
    fi
    sleep 2
  done
  if ! up; then
    echo "Fehler: Paperclip antwortet nach 4 Minuten nicht. Siehe $LOG" >&2
    exit 1
  fi
  echo "Paperclip läuft auf $URL."
fi

if [ -z "${ANTHROPIC_API_KEY:-}${CLAUDE_CODE_OAUTH_TOKEN:-}" ]; then
  echo "Hinweis: ANTHROPIC_API_KEY ist nicht gesetzt; die Agenten können noch nicht arbeiten."
fi

PAPERCLIP_API_BASE="$URL" "$NODE_DIR/bin/node" "$SCRIPT_DIR/team.mjs"
