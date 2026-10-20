#!/usr/bin/env bash
# ruflo setup, short version: a failing step only warns, the script always exits 0
cd /home/user || exit 0
w() { "$@" || echo "WARN: ruflo setup step failed: $*" >&2; }
command -v ruflo >/dev/null || w npm install -g ruflo@latest
command -v ruflo >/dev/null || exit 0
if [ ! -f .claude/settings.json ]; then rm -rf ~/.config/ruflo/policy-trust; w ruflo init --no-global --no-skills-sh --all-agents </dev/null; fi
claude plugin list 2>/dev/null | grep -q ruflo-core@ruflo || w claude plugin install ruflo-core@ruflo --scope project
T=memory,swarm,agent,hooks
w python3 -I -c "import json;p='.mcp.json';c=json.load(open(p));s=c['mcpServers']['claude-flow'];s.update(command='ruflo',args=['mcp','start']);s.setdefault('env',{})['CLAUDE_FLOW_MCP_TOOLS']='$T';json.dump(c,open(p,'w'),indent=2)"
claude mcp get claude-flow >/dev/null 2>&1 || w claude mcp add claude-flow -e CLAUDE_FLOW_MCP_TOOLS=$T -- ruflo mcp start
w python3 -I -c "import json,os;p=os.path.expanduser('~/.claude.json');c=json.load(open(p)) if os.path.exists(p) else {};d=c.setdefault('projects',{}).setdefault(os.getcwd(),{});l=d.get('disabledMcpServers') or [];n='plugin:ruflo-core:ruflo';d['disabledMcpServers']=l if n in l else l+[n];json.dump(c,open(p+'.tmp','w'),indent=2);os.replace(p+'.tmp',p)"
[ -d .git ] || w git init -q
ruflo daemon status 2>/dev/null | grep -q RUNNING || w ruflo daemon start </dev/null
ruflo swarm status 2>/dev/null | grep -q 'Swarm Status' || w ruflo swarm init </dev/null
exit 0
