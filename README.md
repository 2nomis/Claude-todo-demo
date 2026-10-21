# Claude-todo-demo

## Todo-App

Kleine Todo-App: Todos anlegen, abhaken, bearbeiten (Doppelklick oder ✎, Enter speichert, Esc bricht ab), löschen und nach *Alle / Offen / Erledigt* filtern. Die Daten liegen in SQLite und überleben einen Neustart.

**Stack:** Node.js ≥ 22.13, Express, das eingebaute `node:sqlite`, Frontend ohne Framework, Tests mit `node:test`.

```bash
npm install
npm start        # http://127.0.0.1:3000
npm run dev      # mit automatischem Neustart bei Änderungen
npm test
```

| Variable | Standard | Zweck |
|---|---|---|
| `PORT` | `3000` | Port des Servers (0–65535; `0` wählt einen freien Port) |
| `HOST` | `127.0.0.1` | Adresse, auf der der Server lauscht. Standardmäßig nur vom eigenen Rechner erreichbar; `HOST=0.0.0.0` macht die App im Netzwerk erreichbar (ohne Anmeldung!) |
| `DB_PATH` | `data/todos.db` | Pfad der SQLite-Datei (Ordner wird angelegt) |

### API

| Methode | Pfad | Body | Antwort |
|---|---|---|---|
| GET | `/api/todos?filter=all\|open\|done` | – | `200` Liste |
| POST | `/api/todos` | `{ "title": "…" }` | `201` neues Todo |
| PATCH | `/api/todos/:id` | `{ "title"?: "…", "done"?: true }` | `200` geändertes Todo |
| DELETE | `/api/todos/:id` | – | `204` |

Ein Todo sieht so aus: `{ "id": 1, "title": "Milch kaufen", "done": false, "createdAt": "2026-10-21T13:23:55.384Z" }`.
Titel werden getrimmt und dürfen nicht leer und höchstens 200 Zeichen lang sein. Fehler kommen als `{ "error": "…" }` mit `400` (ungültige Eingabe) oder `404` (unbekannte ID).

`node:sqlite` ist in Node 22 noch als experimentell markiert; die Scripts blenden die Warnung dazu aus.

## Claude Code: ECC-Plugin

`.claude/settings.json` deklariert eine eigene Marketplace `ecc` direkt in der Datei (Quelltyp `settings`) und schaltet das Plugin `ecc@ecc` aus [affaan-m/ECC](https://github.com/affaan-m/ECC) ein. Es bringt Agenten, Skills, Befehle und Hooks mit.

- **Version:** Das Plugin ist auf den Commit `c05b2d6614f62f6db0047669aa4eefb223d478f9` (Tag `v2.2.3`) festgelegt. Weil `sha` gesetzt ist, lädt Claude Code genau diesen Commit, auch wenn der Tag upstream verschoben wird. Das `marketplace.json` von ECC wird nicht gelesen.
- **Update:** Neuen Release-Tag prüfen (vor allem `hooks/`), dann `ref` und `sha` in `.claude/settings.json` gemeinsam anheben.
- **Hook-Profil:** `ECC_HOOK_PROFILE=minimal`. Hooks, die nur zu `standard`/`strict` gehören (z. B. Desktop-Benachrichtigung, Doc-Datei-Warnung, Config-Schutz), laufen damit nicht.
- **Zusätzlich abgeschaltet** über `ECC_DISABLED_HOOKS`: `stop:cost-tracker` (Kosten-Telemetrie) und `stop:evaluate-session` (Musterextraktion für „Continuous Learning“).

### Für alle Projekte einrichten (empfohlen)

Einmal pro Rechner ausführen (macOS/Linux, braucht `claude`, `git` und `python3` oder `node`):

```bash
bash tools/ecc/setup-global.sh
```

Das Skript trägt dieselbe festgelegte ECC-Version und dieselben Hook-Einstellungen in `~/.claude/settings.json` ein. Vorher legt es eine Sicherung an, und andere Einträge bleiben erhalten. Danach installiert es `ecc@ecc` für alle Projekte (`--scope user`). Mehrfaches Ausführen ist unschädlich. Für ein Update `ECC_REF` und `ECC_SHA` im Skript anheben und es erneut ausführen.

### Nur für dieses Repo einrichten

Die Projekteinstellungen melden die Marketplace an und schalten das Plugin ein, **installieren es aber nicht**. Jede Person muss das einmal selbst tun, im Repo-Ordner und nachdem sie dem Ordner vertraut hat:

```bash
claude plugin install ecc@ecc --scope project
```

Ohne diesen Schritt meldet Claude Code das Plugin als „enabled in project settings but isn't installed“.

**Cloud-Sitzungen** (claude.ai/code) laden Plugins aus der `.claude/settings.json` eines Repos laut Doku gar nicht. Dort ist ECC nur über server-verwaltete Einstellungen der Organisation verfügbar.

### Kosten

Gemessen in einer neuen Sitzung: Die erste Anfrage hatte mit ECC etwa 8.500 Tokens mehr Kontext als ohne (50.569 statt 42.110). `claude plugin details ecc` schätzt den Anteil, der immer geladen wird, auf bis zu etwa 44.800 Tokens.

### ECC abschalten

- Nur die Hooks: `"ECC_HOOKS_ENABLED": "false"` unter `env` setzen.
- Das ganze Plugin: `"ecc@ecc": false` unter `enabledPlugins` setzen.

Lokale Abweichungen gehören in `.claude/settings.local.json`, nicht in die eingecheckte Datei.
