#!/usr/bin/env node
// doctor.mjs: prüft den Rechner und sagt eine Zeile pro Sache: ok, oder was fehlt. Die KI installiert, was
// fehlt; dem Creator bleibt nur, seinen Schlüssel auf der Schlüsselseite einzufügen.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statfsSync } from "node:fs";
import { join } from "node:path";
import { WURZEL, ladeSchluessel } from "./lib/gemeinsam.mjs";

const zeilen = [];
const ok = (q, t) => zeilen.push(`ok      ${q.padEnd(13)} ${t}`);
const falsch = (q, t) => zeilen.push(`fehlt   ${q.padEnd(13)} ${t}`);
const hinweis = (q, t) => zeilen.push(`hinweis ${q.padEnd(13)} ${t}`);
const win = process.platform === "win32";

const node = Number(process.versions.node.split(".")[0]);
node >= 20 ? ok("node", process.versions.node) : falsch("node", `Node 20 oder neuer wird gebraucht (gefunden: ${process.versions.node}): installiere es (${win ? "winget install OpenJS.NodeJS.LTS" : "brew install node"})`);

const ff = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" }), fp = spawnSync("ffprobe", ["-version"], { encoding: "utf8" });
ff.status === 0 && fp.status === 0 ? ok("ffmpeg", (ff.stdout.split("\n")[0] || "").slice(0, 60))
  : falsch("ffmpeg", `installiere es: ${win ? "winget install Gyan.FFmpeg (und öffne ein neues Terminal)" : process.platform === "darwin" ? "brew install ffmpeg" : "sudo apt install ffmpeg"}`);

const leinwand = join(WURZEL, "node_modules", "@napi-rs", "canvas");
if (!existsSync(leinwand)) falsch("zeichnen", "die Zeichenbibliothek fehlt: npm install (in diesem Ordner)");
else {
  // die Version, die package.json verlangt (ältere können kein Licht addieren: "lighter" bewirkt nichts)
  const will = JSON.parse(readFileSync(join(WURZEL, "package.json"), "utf8")).dependencies["@napi-rs/canvas"];
  const vorhanden = JSON.parse(readFileSync(join(leinwand, "package.json"), "utf8")).version;
  vorhanden === will ? ok("zeichnen", `@napi-rs/canvas ${vorhanden}`) : falsch("zeichnen", `Version ${vorhanden} ist installiert, gebraucht wird ${will}: npm install (in diesem Ordner)`);
}

const schriften = ["Medium", "Bold", "ExtraBold"].every((p) => existsSync(join(WURZEL, "schriften", `Figtree-${p}.ttf`)));
schriften ? ok("schriften", "Figtree") : falsch("schriften", "die Schriften in schriften/ fehlen: kopiere den ganzen Ordner noch einmal");

ladeSchluessel();
process.env.ELEVENLABS_API_KEY ? ok("stimme", "ElevenLabs-Schlüssel vorhanden") : falsch("stimme", "kein ElevenLabs-Schlüssel: node motor/schluessel.mjs öffnet die Seite zum Einfügen (nie im Chat)");

try { const s = statfsSync(WURZEL), gb = (s.bavail * s.bsize) / 1e9; gb > 2 ? ok("festplatte", `${gb.toFixed(0)} GB frei`) : falsch("festplatte", `${gb.toFixed(1)} GB frei; gebraucht werden etwa 2`); } catch { /* keine Angaben zur Festplatte */ }

const pref = join(WURZEL, "vorlieben.md");
existsSync(pref) && readFileSync(pref, "utf8").replace(/^#.*$/gm, "").trim() ? ok("vorlieben", "gespeichert") : hinweis("vorlieben", "noch keine: Die KI fragt einmal danach, vor dem ersten Video");

console.log(zeilen.join("\n"));
process.exit(zeilen.some((l) => l.startsWith("fehlt")) ? 1 : 0);
