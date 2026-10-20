#!/usr/bin/env bash
# Rebuilds the ruflo setup for this repository in a fresh container.
# Safe to run repeatedly: every step is skipped when it is already done.
# A failing step prints a warning and the rest still runs. The script always
# exits 0, so a ruflo problem never stops the session from starting.
set -uo pipefail

# The repository this script lives in (works for /home/user and for a cloned repo)
PROJECT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")" && pwd)}"
MCP_TOOLS="memory,swarm,agent,hooks"   # limits the MCP server to ~90 tools (~19k tokens) instead of 358
FAILED=()

step() {
    local name=$1
    shift
    if ! "$@"; then
        echo "WARN: ruflo setup step failed: $name" >&2
        FAILED+=("$name")
    fi
}

# Global install starts fast; npx re-resolves on every start and timed out as an MCP server
install_cli() { command -v ruflo >/dev/null || npm install -g ruflo@latest; }

# Project config, hooks, plugins and all 89 agents
init_project() {
    [ -f .claude/settings.json ] && return 0
    # Anchors left in ~/.config/ruflo by an earlier install make swarm init fail with policy-anchor-log-missing
    rm -rf "$HOME/.config/ruflo/policy-trust"
    ruflo init --no-global --no-skills-sh --all-agents </dev/null
}

# ruflo-core is not installed by init
install_core_plugin() {
    claude plugin list 2>/dev/null | grep -q 'ruflo-core@ruflo' \
        || claude plugin install ruflo-core@ruflo --scope project
}

# MCP server: global binary + tool limit, both in .mcp.json and the local registration
fix_mcp_json() {
    python3 -I - "$PROJECT/.mcp.json" "$MCP_TOOLS" <<'EOF'
import json, sys
path, tools = sys.argv[1], sys.argv[2]
try:
    cfg = json.load(open(path))
except FileNotFoundError:
    cfg = {"mcpServers": {}}
server = cfg["mcpServers"].setdefault("claude-flow", {"env": {}})
server["command"], server["args"] = "ruflo", ["mcp", "start"]
server.setdefault("env", {})["CLAUDE_FLOW_MCP_TOOLS"] = tools
with open(path, "w") as f:
    json.dump(cfg, f, indent=2)
    f.write("\n")
EOF
}

register_mcp() {
    claude mcp get claude-flow >/dev/null 2>&1 \
        || claude mcp add claude-flow -e CLAUDE_FLOW_MCP_TOOLS="$MCP_TOOLS" -- ruflo mcp start
}

# The ruflo-core plugin starts its own MCP server with all 358 tools and no limit;
# claude-flow above already serves the limited set, so switch the plugin's server off
# (same setting as the /mcp toggle; takes effect from the next session start)
disable_plugin_mcp() {
    python3 -I - "$HOME/.claude.json" "$PROJECT" <<'EOF'
import json, os, sys, tempfile
path, project = sys.argv[1], sys.argv[2]
try:
    cfg = json.load(open(path))
except FileNotFoundError:
    cfg = {}
proj = cfg.setdefault("projects", {}).setdefault(project, {})
disabled = proj.get("disabledMcpServers") or []
if "plugin:ruflo-core:ruflo" in disabled:
    sys.exit(0)
proj["disabledMcpServers"] = disabled + ["plugin:ruflo-core:ruflo"]
fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path))
with os.fdopen(fd, "w") as f:
    json.dump(cfg, f, indent=2)
os.replace(tmp, path)
EOF
}

init_git() { [ -d .git ] || git init -q; }

start_daemon() { ruflo daemon status 2>/dev/null | grep -q RUNNING || ruflo daemon start </dev/null; }

init_swarm() { ruflo swarm status 2>/dev/null | grep -q 'Swarm Status' || ruflo swarm init </dev/null; }

# Restore committed memory (merge skips entries that already exist)
restore_memory() {
    [ -f memory/ruflo-memory.json ] || return 0
    ruflo memory import -i memory/ruflo-memory.json </dev/null >/dev/null
}

if ! cd "$PROJECT"; then
    echo "WARN: ruflo setup skipped: $PROJECT not found" >&2
    exit 0
fi

step "install ruflo CLI" install_cli
if ! command -v ruflo >/dev/null; then
    echo "WARN: ruflo setup stopped: ruflo is not installed, all later steps need it" >&2
    exit 0
fi

step "ruflo init" init_project
step "install ruflo-core plugin" install_core_plugin
step "fix .mcp.json" fix_mcp_json
step "register MCP server" register_mcp
step "disable ruflo-core MCP server" disable_plugin_mcp
step "git init" init_git
step "start daemon" start_daemon
step "init swarm" init_swarm
step "restore memory" restore_memory

if [ ${#FAILED[@]} -eq 0 ]; then
    echo "ruflo setup complete. Start a new Claude Code session to load plugins, MCP tools and agents."
else
    echo "ruflo setup finished with ${#FAILED[@]} failed step(s): ${FAILED[*]}" >&2
fi
exit 0
