#!/usr/bin/env node
// klang.mjs: macht die Effektspur des Videos aus dem, was klaenge.js im Projekt sagt.
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { argumente, hilfe, projektOrdner, schreibeWav, fehler, leseAudio } from "./lib/gemeinsam.mjs";
import { SR, katalog, hatEffekte, luecken, mischeEffekte } from "./lib/mischung.mjs";
import { oeffnen } from "./lib/projekt.mjs";

hilfe(`
node motor/klang.mjs <projekt>

Liest <projekt>/klaenge.js (jeder Effekt: in welcher Sekunde, welcher Klang, wie laut) und schreibt
<projekt>/klaenge/effekte.wav, das render.mjs mit der Stimme mischt. Es listet auf:
  - jeden Moment mit Klang (die, die «was» haben),
  - die Abschnitte von mehr als 2 s ganz ohne Effekt (wenn dort im Bild etwas passiert, fehlt ihm der Klang),
  - die Effekte, die auf einen Schnitt fallen (ein Schnitt macht kein Geräusch: Der Klang gehört zu dem, was sich bewegt).
Die verfügbaren Klänge sind in klaenge/ (was jeder ist, in klaenge/LIESMICH.md).
`);

const { lose } = argumente();
const dir = projektOrdner(lose[0]);
if (!hatEffekte(dir)) fehler(`Dieses Projekt hat keine klaenge.js. Wenn das Video Effekte hat, leg sie an (siehe anleitung/klang.md).`);
const proj = await oeffnen(dir);
let ereignisse = (await import(pathToFileURL(join(dir, "klaenge.js")).href)).default;
if (typeof ereignisse === "function") ereignisse = ereignisse(proj.v);
if (!Array.isArray(ereignisse)) fehler("klaenge.js muss als Standard eine Liste von Effekten exportieren (oder eine Funktion, die eine zurückgibt).");
for (const [i, e] of ereignisse.entries()) {
  if (typeof e.t !== "number" || !isFinite(e.t)) fehler(`Effekt ${i + 1} (${e.klang || "?"}) hat keine gültige Sekunde t.`);
  if (!katalog()[e.klang]) fehler(`Effekt ${i + 1} verlangt «${e.klang}», den es in klaenge/ nicht gibt. Verfügbar: ${Object.keys(katalog()).join(", ")}.`);
}
const stimme = leseAudio(join(dir, "stimme", "stimme.wav"), SR);
const { spurDatei, benutzte } = mischeEffekte(ereignisse, stimme);
schreibeWav(join(dir, "klaenge", "effekte.wav"), spurDatei, SR);

let spitze = 0;
for (const x of spurDatei) spitze = Math.max(spitze, Math.abs(x));
for (const e of benutzte) if (e.was) console.log(`${e.t.toFixed(2).padStart(6)} s  ${e.klang.padEnd(12)} ${e.was}`);
console.log(`${benutzte.length} Klänge; Effekte mit Spitze ${(20 * Math.log10(spitze + 1e-9)).toFixed(1)} dB → ${join(dir, "klaenge", "effekte.wav")}`);
const hs = luecken(spurDatei, 2);
if (hs.length) console.log("Mehr als 2 s gar kein Effekt: " + hs.map(([a, b]) => `${a.toFixed(1)}–${b.toFixed(1)} s`).join(", ") + ". Wenn sich dort etwas bewegt, fehlt ihm der Klang.");
const schnitte = proj.einstellungen.slice(1).filter((p) => p.uebergang !== "weiter").map((p) => p.von);
for (const e of benutzte) for (const c of schnitte) if (Math.abs(e.t - c) < 0.08) console.log(`  Warnung: «${e.klang}» bei ${e.t.toFixed(2)} s fällt auf den Schnitt bei ${c.toFixed(2)} s: Ein Schnitt macht kein Geräusch.`);
