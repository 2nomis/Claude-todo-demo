#!/usr/bin/env bash
# Installs the ECC plugin for every project on this machine (user scope).
#
# - Adds the pinned ECC marketplace, enables ecc@ecc and sets the hook env
#   (minimal profile) in your user settings, keeping everything else as is.
# - Backs up the settings file before changing it.
# - Safe to run again; it only updates the ECC entries.
#
# Usage: bash tools/ecc/setup-global.sh

set -euo pipefail

ECC_REPO="affaan-m/ECC"
ECC_REF="v2.2.3"
ECC_SHA="c05b2d6614f62f6db0047669aa4eefb223d478f9"

CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SETTINGS="$CONFIG_DIR/settings.json"

if ! command -v claude >/dev/null 2>&1; then
  echo "Fehler: 'claude' wurde nicht gefunden. Bitte zuerst Claude Code installieren." >&2
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "Fehler: 'git' wurde nicht gefunden. Claude Code braucht git, um ECC herunterzuladen." >&2
  exit 1
fi

if command -v python3 >/dev/null 2>&1; then
  JSON_TOOL=python3
elif command -v node >/dev/null 2>&1; then
  JSON_TOOL=node
else
  echo "Fehler: python3 oder node wird benötigt, um $SETTINGS zu bearbeiten." >&2
  exit 1
fi

mkdir -p "$CONFIG_DIR"
if [ -f "$SETTINGS" ]; then
  BACKUP="$SETTINGS.bak-$(date +%Y%m%d-%H%M%S)"
  cp "$SETTINGS" "$BACKUP"
  echo "Sicherung: $BACKUP"
fi

export SETTINGS ECC_REPO ECC_REF ECC_SHA

if [ "$JSON_TOOL" = python3 ]; then
  python3 - <<'PY'
import json, os

path = os.environ["SETTINGS"]
data = {}
if os.path.exists(path) and os.path.getsize(path) > 0:
    with open(path) as f:
        data = json.load(f)

data.setdefault("extraKnownMarketplaces", {})["ecc"] = {
    "source": {
        "source": "settings",
        "name": "ecc",
        "plugins": [{
            "name": "ecc",
            "description": "ECC " + os.environ["ECC_REF"] + ", pinned to a fixed commit",
            "source": {
                "source": "github",
                "repo": os.environ["ECC_REPO"],
                "ref": os.environ["ECC_REF"],
                "sha": os.environ["ECC_SHA"],
            },
        }],
    }
}
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
const { SETTINGS: path, ECC_REPO, ECC_REF, ECC_SHA } = process.env;
const data = fs.existsSync(path) && fs.statSync(path).size > 0
  ? JSON.parse(fs.readFileSync(path, 'utf8')) : {};

(data.extraKnownMarketplaces ??= {}).ecc = {
  source: {
    source: 'settings',
    name: 'ecc',
    plugins: [{
      name: 'ecc',
      description: `ECC ${ECC_REF}, pinned to a fixed commit`,
      source: { source: 'github', repo: ECC_REPO, ref: ECC_REF, sha: ECC_SHA },
    }],
  },
};
(data.enabledPlugins ??= {})['ecc@ecc'] = true;
const env = (data.env ??= {});
env.ECC_HOOK_PROFILE = 'minimal';
env.ECC_DISABLED_HOOKS = 'stop:cost-tracker,stop:evaluate-session';

fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
JS
fi
echo "Einstellungen aktualisiert: $SETTINGS"

# Claude Code registers marketplaces from settings when a session starts,
# so run one minimal session before installing.
echo "Melde die ECC-Marketplace an (eine kurze Claude-Sitzung) ..."
(cd "$CONFIG_DIR" && claude -p "Antworte nur mit OK" --max-turns 1 </dev/null >/dev/null)

echo "Installiere ecc@ecc für alle Projekte ..."
claude plugin install ecc@ecc --scope user

echo
claude plugin list | grep -A3 "ecc@ecc" || true
echo
echo "Fertig. ECC steht ab dem nächsten Claude-Code-Start in jedem Projekt bereit."
echo "Abschalten pro Projekt: \"ecc@ecc\": false in .claude/settings.local.json"
