# ruflo-setup

Ruflo-Setup für Claude-Code-Sessions in der Cloud.

## Nutzung

Starte eine neue Claude-Code-Session mit diesem Repository. Beim Start führt ein
`SessionStart`-Hook in `.claude/settings.json` das Skript `ruflo-setup.sh` aus. Es

- installiert die Ruflo-CLI global (`npm install -g ruflo@latest`),
- fügt den Ruflo-Marketplace hinzu und installiert die Plugins `ruflo-core`,
  `ruflo-console`, `ruflo-mods` und `ruflo-swarm`,
- registriert den MCP-Server `claude-flow` mit Tool-Limit (`memory,swarm,agent,hooks`,
  etwa 90 statt 358 Tools), gibt ihn frei und schaltet den zweiten Server von
  `ruflo-core` ab,
- lädt das Embedding-Modell vorab und lädt es neu, falls es beschädigt ist,
- startet den Daemon und legt einen Swarm an,
- liest das gesicherte Gedächtnis aus `memory/ruflo-memory.json` ein.

Schlägt ein Schritt fehl, erscheint `WARN: ruflo setup step failed: …`, und die
Session startet trotzdem.

In der allerersten Session eines neuen Containers fehlen MCP-Server und Plugins noch,
weil Claude Code sie lädt, bevor die Installation fertig ist. Ab der nächsten Session
(oder nach `/mcp` und `/reload-plugins`) ist alles da.

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
