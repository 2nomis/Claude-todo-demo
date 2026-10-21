# CLAUDE.md

Kontext für Claude-Sitzungen in diesem Repo. Der Nutzer schreibt Deutsch; antworte auf Deutsch, kurz und ohne viel Drumherum.

## Projekt

Todo-Demo-App: Node.js ≥ 22.13, Express 5, eingebautes `node:sqlite`, Frontend ohne Framework.

| Pfad | Inhalt |
|---|---|
| `src/db.js` | SQLite-Datenschicht (`openDb`, list/create/update/remove, Filter all/open/done) |
| `src/app.js` | Express-App `createApp(db)`: REST-API unter `/api/todos`, Validierung, JSON-Fehler `{ error }` |
| `src/server.js` | Start; `PORT` (3000), `HOST` (`127.0.0.1`), `DB_PATH` (`data/todos.db`) |
| `public/` | `index.html`, `app.js`, `style.css` |
| `test/` | `node:test`: `db.test.js`, `api.test.js`, `server.test.js` (Start bei belegtem Port) |
| `tools/ecc/setup-global.sh` | Richtet ECC für alle Projekte eines Rechners ein |

```bash
npm install
npm test         # muss grün sein vor jedem Commit
npm start        # http://127.0.0.1:3000
```

Konventionen:
- Tests zuerst schreiben und fehlschlagen sehen, dann implementieren.
- SQL nur mit Prepared Statements; Titel im Frontend nur über `textContent`.
- Titel: getrimmt, nicht leer, höchstens 200 Zeichen (`MAX_TITLE_LENGTH`).
- `data/` und `node_modules/` sind in `.gitignore`.

Verhalten, das bewusst so ist:
- Bearbeiten: Schlägt das Speichern fehl, bleibt das Feld mit der Eingabe offen; Enter versucht es erneut, Esc bricht ab. Nur nach Enter holt das Feld den Fokus zurück, nicht nach dem Herausklicken.
- Bei belegtem oder ungültigem `PORT` beendet sich der Server mit Exit-Code 1 und einer klaren Meldung statt mit Stacktrace. Achtung: In Express 5 ruft `app.listen` den Callback auch im Fehlerfall auf (mit `err`).
- Der Server lauscht standardmäßig nur auf `127.0.0.1`; die App hat keine Anmeldung, daher nur bewusst mit `HOST=0.0.0.0` freigeben.
- Schlägt eine Aktion fehl (abhaken, löschen, anlegen), zeigt die Liste wieder den letzten bekannten Stand statt der abgelehnten Änderung.
- Der Server hängt beim Beenden nicht an offenen Keep-Alive-Verbindungen (gemessen: 9 ms); dafür ist kein Extra-Code nötig.

Frontend-Verhalten ist nicht automatisch getestet (kein Playwright im Repo); Änderungen an `public/` im Browser prüfen.

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
