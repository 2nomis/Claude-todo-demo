# Claude-todo-demo

## Claude Code: ECC-Plugin

`.claude/settings.json` deklariert eine eigene Marketplace `ecc` direkt in der Datei (Quelltyp `settings`) und schaltet das Plugin `ecc@ecc` aus [affaan-m/ECC](https://github.com/affaan-m/ECC) ein. Es bringt Agenten, Skills, Befehle und Hooks mit.

- **Version:** Das Plugin ist auf den Commit `c05b2d6614f62f6db0047669aa4eefb223d478f9` (Tag `v2.2.3`) festgelegt. Weil `sha` gesetzt ist, lädt Claude Code genau diesen Commit, auch wenn der Tag upstream verschoben wird. Das `marketplace.json` von ECC wird nicht gelesen.
- **Update:** Neuen Release-Tag prüfen (vor allem `hooks/`), dann `ref` und `sha` in `.claude/settings.json` gemeinsam anheben.
- **Hook-Profil:** `ECC_HOOK_PROFILE=minimal`. Hooks, die nur zu `standard`/`strict` gehören (z. B. Desktop-Benachrichtigung, Doc-Datei-Warnung, Config-Schutz), laufen damit nicht.
- **Zusätzlich abgeschaltet** über `ECC_DISABLED_HOOKS`: `stop:cost-tracker` (Kosten-Telemetrie) und `stop:evaluate-session` (Musterextraktion für „Continuous Learning“).

### Einrichten

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
