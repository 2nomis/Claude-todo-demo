#!/usr/bin/env bash
# ruflo setup, short version: a failing step only warns, the script always exits 0
cd /home/user || exit 0
w() { "$@" || echo "WARN: ruflo setup step failed: $*" >&2; }
command -v ruflo >/dev/null || w npm install -g ruflo@latest
command -v ruflo >/dev/null || exit 0
if [ ! -f .claude/settings.json ]; then rm -rf ~/.config/ruflo/policy-trust; w ruflo init --no-global --no-skills-sh --all-agents </dev/null; fi
claude plugin marketplace list 2>/dev/null | grep -q ruflo || w claude plugin marketplace add ruvnet/ruflo --scope project
for p in ruflo-core ruflo-console ruflo-mods ruflo-swarm; do claude plugin list 2>/dev/null | grep -q "$p@ruflo" || w claude plugin install "$p@ruflo" --scope project; done
T=memory,swarm,agent,hooks
w python3 -I -c "import json;p='.mcp.json';c=json.load(open(p));s=c['mcpServers']['claude-flow'];s.update(command='ruflo',args=['mcp','start']);s.setdefault('env',{})['CLAUDE_FLOW_MCP_TOOLS']='$T';json.dump(c,open(p,'w'),indent=2)"
claude mcp get claude-flow >/dev/null 2>&1 || w claude mcp add claude-flow -e CLAUDE_FLOW_MCP_TOOLS=$T -- ruflo mcp start
w python3 -I -c "import json,os;p=os.path.expanduser('~/.claude.json');c=json.load(open(p)) if os.path.exists(p) else {};d=c.setdefault('projects',{}).setdefault(os.getcwd(),{});l=d.get('disabledMcpServers') or [];n='plugin:ruflo-core:ruflo';d['disabledMcpServers']=l if n in l else l+[n];json.dump(c,open(p+'.tmp','w'),indent=2);os.replace(p+'.tmp',p)"
w python3 -I -c "import json,os;p=os.path.expanduser('~/.claude/settings.json');os.makedirs(os.path.dirname(p),exist_ok=True);c=json.load(open(p)) if os.path.exists(p) else {};l=c.get('enabledMcpjsonServers') or [];c['enabledMcpjsonServers']=l if 'claude-flow' in l else l+['claude-flow'];json.dump(c,open(p+'.tmp','w'),indent=2);os.replace(p+'.tmp',p)"
[ -d .git ] || w git init -q
ok() { o=$(timeout 300 ruflo embeddings warmup </dev/null 2>&1); grep -q Ready <<<"$o" && ! grep -q 'Failed to load model' <<<"$o"; }
ok || { rm -rf ~/.cache/ruflo/models/Xenova/all-MiniLM-L6-v2; ok || echo "WARN: ruflo setup step failed: embedding model" >&2; }
ruflo daemon status 2>/dev/null | grep -q RUNNING || w ruflo daemon start </dev/null
ruflo swarm status 2>/dev/null | grep -q 'Swarm Status' || w ruflo swarm init </dev/null
exit 0
