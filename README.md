# Claude-todo-demo

## Claude Code: ECC-Plugin

`.claude/settings.json` registriert die Marketplace [affaan-m/ECC](https://github.com/affaan-m/ECC) und schaltet das Plugin `ecc@ecc` ein. Es bringt Agenten, Skills, Befehle und Hooks mit.

- **Version:** Die Marketplace ist auf den Tag `v2.2.3` festgelegt (`ref`). Für ein Update den Tag in `.claude/settings.json` anheben.
- **Hook-Profil:** `ECC_HOOK_PROFILE=minimal`. Hooks, die nur zu `standard`/`strict` gehören (z. B. Desktop-Benachrichtigung, Doc-Datei-Warnung, Config-Schutz), laufen damit nicht.
- **Zusätzlich abgeschaltet** über `ECC_DISABLED_HOOKS`: `stop:cost-tracker` (Kosten-Telemetrie) und `stop:evaluate-session` (Musterextraktion für „Continuous Learning“).

### ECC abschalten

- Nur die Hooks: `"ECC_HOOKS_ENABLED": "false"` unter `env` setzen.
- Das ganze Plugin: `"ecc@ecc": false` unter `enabledPlugins` setzen.

Lokale Abweichungen gehören in `.claude/settings.local.json`, nicht in die eingecheckte Datei.
