# ruflo-setup

Ruflo-Setup für Claude-Code-Sessions in der Cloud.

## Nutzung

Starte eine neue Claude-Code-Session mit diesem Repository. Beim Start führt ein
`SessionStart`-Hook in `.claude/settings.json` das Skript `ruflo-setup.sh` aus. Es

- installiert die Ruflo-CLI global (`npm install -g ruflo@latest`),
- installiert das Plugin `ruflo-core` und registriert den MCP-Server `claude-flow`
  mit Tool-Limit (`memory,swarm,agent,hooks`, etwa 90 statt 358 Tools),
- startet den Daemon und legt einen Swarm an,
- liest das gesicherte Gedächtnis aus `memory/ruflo-memory.json` ein.

Schlägt ein Schritt fehl, erscheint `WARN: ruflo setup step failed: …`, und die
Session startet trotzdem.

In der allerersten Session kann der MCP-Server fehlen, weil Claude Code ihn startet,
bevor die Installation fertig ist. Dann hilft `/mcp` (neu verbinden) oder eine
weitere Session.

## Inhalt

| Pfad | Inhalt |
|---|---|
| `.claude/` | 89 Agenten, Skills, Befehle, Hooks, Einstellungen |
| `CLAUDE.md` | Ruflo-Anweisungen für Claude |
| `.mcp.json` | MCP-Server `claude-flow` |
| `ruflo-setup.sh` | Setup-Skript, wird beim Session-Start ausgeführt |
| `ruflo-setup-short.sh` | Kurzfassung für das Setup-Skript-Feld der Umgebung |
| `memory/ruflo-memory.json` | Export des Ruflo-Gedächtnisses |

## Gedächtnis sichern

```
ruflo memory export -o memory/ruflo-memory.json
git add memory && git commit -m "Update ruflo memory" && git push
```
