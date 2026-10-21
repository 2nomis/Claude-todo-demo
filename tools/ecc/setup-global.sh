#!/usr/bin/env bash
# Installs the ECC plugin for every project on this machine (user scope).
# Works locally and as a cloud environment setup script; it does not need
# this repository, a Claude session or API credentials.
#
# - Writes a local marketplace file that pins ECC to a fixed commit and
#   registers it with `claude plugin marketplace add`.
# - Enables ecc@ecc and sets the hook env (minimal profile) in your user
#   settings, keeping everything else as is (with a backup).
# - Safe to run again.
#
# Usage: bash tools/ecc/setup-global.sh

set -euo pipefail

ECC_REPO="affaan-m/ECC"
ECC_REF="v2.2.3"
ECC_SHA="c05b2d6614f62f6db0047669aa4eefb223d478f9"

CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SETTINGS="$CONFIG_DIR/settings.json"
MARKETPLACE_DIR="$CONFIG_DIR/ecc-marketplace"

for tool in claude git; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Fehler: '$tool' wurde nicht gefunden." >&2
    exit 1
  fi
done

if command -v python3 >/dev/null 2>&1; then
  JSON_TOOL=python3
elif command -v node >/dev/null 2>&1; then
  JSON_TOOL=node
else
  echo "Fehler: python3 oder node wird benötigt, um $SETTINGS zu bearbeiten." >&2
  exit 1
fi

mkdir -p "$MARKETPLACE_DIR/.claude-plugin"
cat > "$MARKETPLACE_DIR/.claude-plugin/marketplace.json" <<EOF
{
  "name": "ecc",
  "owner": { "name": "local" },
  "plugins": [
    {
      "name": "ecc",
      "description": "ECC $ECC_REF, pinned to a fixed commit",
      "source": {
        "source": "github",
        "repo": "$ECC_REPO",
        "ref": "$ECC_REF",
        "sha": "$ECC_SHA"
      }
    }
  ]
}
EOF

if [ -f "$SETTINGS" ]; then
  BACKUP="$SETTINGS.bak-$(date +%Y%m%d-%H%M%S)"
  cp "$SETTINGS" "$BACKUP"
  echo "Sicherung: $BACKUP"
fi

# Drops any earlier "ecc" marketplace entry (it is registered again below),
# enables the plugin and sets the hook env.
export SETTINGS
if [ "$JSON_TOOL" = python3 ]; then
  python3 - <<'PY'
import json, os, sys

path = os.environ["SETTINGS"]
data = {}
if os.path.exists(path) and os.path.getsize(path) > 0:
    try:
        with open(path) as f:
            data = json.load(f)
    except json.JSONDecodeError as err:
        sys.exit(f"Fehler: {path} ist kein gültiges JSON ({err}). Bitte korrigieren und erneut ausführen.")

data.get("extraKnownMarketplaces", {}).pop("ecc", None)
data.setdefault("enabledPlugins", {})["ecc@ecc"] = True
env = data.setdefault("env", {})
env["ECC_HOOK_PROFILE"] = "minimal"
env["ECC_DISABLED_HOOKS"] = "stop:cost-tracker,stop:evaluate-session"

with open(path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY
else
  node - <<'JS'
const fs = require('fs');
const path = process.env.SETTINGS;
let data = {};
if (fs.existsSync(path) && fs.statSync(path).size > 0) {
  try {
    data = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch (err) {
    console.error(`Fehler: ${path} ist kein gültiges JSON (${err.message}). Bitte korrigieren und erneut ausführen.`);
    process.exit(1);
  }
}

if (data.extraKnownMarketplaces) delete data.extraKnownMarketplaces.ecc;
(data.enabledPlugins ??= {})['ecc@ecc'] = true;
const env = (data.env ??= {});
env.ECC_HOOK_PROFILE = 'minimal';
env.ECC_DISABLED_HOOKS = 'stop:cost-tracker,stop:evaluate-session';

fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
JS
fi
echo "Einstellungen aktualisiert: $SETTINGS"

echo "Melde die ECC-Marketplace an ..."
claude plugin marketplace add "$MARKETPLACE_DIR"

echo "Installiere ecc@ecc für alle Projekte ..."
claude plugin install ecc@ecc --scope user

echo
claude plugin list | grep -A3 "ecc@ecc" || true
echo
echo "Fertig. ECC steht ab dem nächsten Claude-Code-Start in jedem Projekt bereit."
echo "Abschalten pro Projekt: \"ecc@ecc\": false in .claude/settings.local.json"
