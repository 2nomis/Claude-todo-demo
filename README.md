# Claude-todo-demo

## Claude Code: ECC-Plugin

`.claude/settings.json` deklariert eine eigene Marketplace `ecc` direkt in der Datei (Quelltyp `settings`) und schaltet das Plugin `ecc@ecc` aus [affaan-m/ECC](https://github.com/affaan-m/ECC) ein. Es bringt Agenten, Skills, Befehle und Hooks mit.

- **Version:** Das Plugin ist auf den Commit `c05b2d6614f62f6db0047669aa4eefb223d478f9` (Tag `v2.2.3`) festgelegt. Weil `sha` gesetzt ist, lädt Claude Code genau diesen Commit, auch wenn der Tag upstream verschoben wird. Das `marketplace.json` von ECC wird nicht gelesen.
- **Update:** Neuen Release-Tag prüfen (vor allem `hooks/`), dann `ref` und `sha` in `.claude/settings.json` gemeinsam anheben.
- **Hook-Profil:** `ECC_HOOK_PROFILE=minimal`. Hooks, die nur zu `standard`/`strict` gehören (z. B. Desktop-Benachrichtigung, Doc-Datei-Warnung, Config-Schutz), laufen damit nicht.
- **Zusätzlich abgeschaltet** über `ECC_DISABLED_HOOKS`: `stop:cost-tracker` (Kosten-Telemetrie) und `stop:evaluate-session` (Musterextraktion für „Continuous Learning“).

### ECC abschalten

- Nur die Hooks: `"ECC_HOOKS_ENABLED": "false"` unter `env` setzen.
- Das ganze Plugin: `"ecc@ecc": false` unter `enabledPlugins` setzen.

Lokale Abweichungen gehören in `.claude/settings.local.json`, nicht in die eingecheckte Datei.
