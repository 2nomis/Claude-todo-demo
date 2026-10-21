# CLAUDE.md

Kontext für Claude-Sitzungen in diesem Repo. Der Nutzer schreibt Deutsch; antworte auf Deutsch, kurz und ohne viel Drumherum.

## Projekt

Todo-Demo-App: Node.js ≥ 22.13, Express 5, eingebautes `node:sqlite`, Frontend ohne Framework.

| Pfad | Inhalt |
|---|---|
| `src/db.js` | SQLite-Datenschicht (`openDb`, list/create/update/remove, Filter all/open/done) |
| `src/app.js` | Express-App `createApp(db)`: REST-API unter `/api/todos`, Validierung, JSON-Fehler `{ error }` |
| `src/server.js` | Start; `PORT` (3000), `DB_PATH` (`data/todos.db`) |
| `public/` | `index.html`, `app.js`, `style.css` |
| `test/` | `node:test`: `db.test.js`, `api.test.js` |
| `tools/ecc/setup-global.sh` | Richtet ECC für alle Projekte eines Rechners ein |

```bash
npm install
npm test         # muss grün sein vor jedem Commit
npm start        # http://localhost:3000
```

Konventionen:
- Tests zuerst schreiben und fehlschlagen sehen, dann implementieren.
- SQL nur mit Prepared Statements; Titel im Frontend nur über `textContent`.
- Titel: getrimmt, nicht leer, höchstens 200 Zeichen (`MAX_TITLE_LENGTH`).
- `data/` und `node_modules/` sind in `.gitignore`.

## Offene Punkte (aus `/ecc:code-review`, nachgeprüft)

1. `public/app.js`: Schlägt das Speichern beim Bearbeiten fehl, bleibt das Eingabefeld stehen und reagiert nicht mehr auf Enter/Esc (weil `finished` schon gesetzt ist und `run` bei Fehlern nicht neu rendert).
2. `src/server.js`: Kein Handler für `listen`-Fehler; bei belegtem Port bricht der Prozess mit Stacktrace ab statt mit klarer Meldung.

Nicht zutreffend: Der Server hängt beim Beenden nicht an offenen Keep-Alive-Verbindungen (gemessen: 9 ms).

## ECC-Plugin

- Eingerichtet in `.claude/settings.json`: Marketplace `ecc` direkt in der Datei (Quelltyp `settings`), Plugin `ecc@ecc` festgelegt auf Commit `c05b2d6614f62f6db0047669aa4eefb223d478f9` (Tag `v2.2.3`).
- Hook-Profil `ECC_HOOK_PROFILE=minimal`, dazu `ECC_DISABLED_HOOKS=stop:cost-tracker,stop:evaluate-session`. Nicht auf `standard` stellen: dessen „Fact-Forcing Gate“ blockiert schon einfache Write- und Bash-Aufrufe.
- Die Projekteinstellungen installieren das Plugin nicht. Pro Rechner einmal `claude plugin install ecc@ecc --scope project` oder für alle Projekte `bash tools/ecc/setup-global.sh`.
- Cloud-Sitzungen laden Plugins aus Repo-Einstellungen laut Doku nicht. Im Cloud-Container lädt ECC nur, wenn es dort in `~/.claude` installiert wurde; der Container ist flüchtig.
- Kontextkosten: etwa 8.500 Tokens pro Sitzung. Abschalten: `"ecc@ecc": false` in `.claude/settings.local.json`.
- Neun Namen gibt es als Befehl und als Skill (u. a. `ecc-guide`, `security-scan`, `plan-canvas`, `orch-*`); `/ecc:<name>` lädt dann immer den Befehl.
- Bewährter Ablauf: `/ecc:plan` → `/ecc:tdd-workflow` → `/ecc:code-review`. `/ecc:code-review` mit PR-Nummer postet ein Review auf GitHub.

## Git

- PRs werden auf Wunsch des Nutzers gemergt (Merge-Commit, kein Squash).
- Es gibt keine CI; vor dem Push `npm test` lokal ausführen.
