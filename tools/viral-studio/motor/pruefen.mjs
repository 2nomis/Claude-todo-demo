#!/usr/bin/env node
// pruefen.mjs: alles, was man sich ansehen muss, bevor man das Video zeigt, in einer Minute und ohne zu rendern.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { argumente, hilfe, projektOrdner, leseAudio } from "./lib/gemeinsam.mjs";
import { vorbereiten } from "./lib/bild.mjs";
import { speichereJpg, blatt, verteilung } from "./lib/blaetter.mjs";
import { schnitte, bewegungslinie, untertitelAufHell } from "./lib/messungen.mjs";
import { SR, hatEffekte, luecken, mischeEffekte } from "./lib/mischung.mjs";
import { oeffnen } from "./lib/projekt.mjs";

hilfe(`
node motor/pruefen.mjs <projekt> [--bis s]

Macht zwei Blätter und sagt alles als Text. Sieh dir immer beide Blätter ganz an:
  pruefen/saetze.jpg     jeder Satz vom ersten bis zum letzten Wort: Ist zu sehen, was er sagt, groß und in Bewegung?
  pruefen/schnitte.jpg   jeder Einstellungswechsel, von 0,6 s davor bis 0,4 s danach: Ist die vorige Aktion fertig? Ist die neue klar?
Und es warnt vor:
  - einem Schnitt, der kommt, während die vorige Einstellung sich noch bewegt (wirkt mittendrin abgeschnitten),
  - einem Schnitt zwischen zwei Einstellungen, die sich ähneln (ist es derselbe Ort, beweg die Kamera; wenn nicht, mach den Wechsel deutlich),
  - einer Einstellung, die kürzer als 1,2 s ist (keine Zeit, sie zu sehen),
  - Sekunden am Stück, in denen sich fast nichts bewegt (außer es ist die Pause nach der Pointe: Dort fehlt etwas, das zur Stimme passt),
  - dem Untertitel über fast weißem Hintergrund (nicht lesbar),
  - Lücken ohne Klang und Klängen, die auf einen Schnitt fallen.
Nichts davon ist eine Note: Es zeigt, wo man hinschauen soll. Behebe, was du falsch siehst, nicht die Zahl.
--bis: nur bis zu dieser Sekunde (für den Hook).
`);

const { lose, opt } = argumente();
const dir = projektOrdner(lose[0]);
const proj = await oeffnen(dir);
if (opt.bis) { proj.dauer = Math.min(proj.dauer, Number(opt.bis)); proj.einstellungen = proj.einstellungen.filter((p) => p.von < proj.dauer); }
const zst = vorbereiten(proj), v = proj.v;
const t0 = Date.now();

// --- die Blätter
const fs = v.saetze.filter((f) => f.anfang < proj.dauer), ts = [];
for (const f of fs) verteilung(f.woerter[0].anfang, Math.min(proj.dauer - 0.01, f.woerter[f.woerter.length - 1].ende), 6).forEach((t, i) => ts.push(i ? t : { t, markierung: `${f.n}: ${t.toFixed(2)}` }));
const hf = speichereJpg(blatt(proj, zst, ts, { breite: 150, spalten: 6, titel: "Jeder Satz, vom ersten bis zum letzten Wort" }), join(dir, "pruefen", "saetze.jpg"));
const tc = [];
for (const p of proj.einstellungen.slice(1)) for (let k = -9; k <= 6; k++) { const t = p.von + k / 15; tc.push(k === 0 ? { t, markierung: `Schnitt ${p.uebergang}` } : t); }
const hc = tc.length ? speichereJpg(blatt(proj, zst, tc, { breite: 120, spalten: 16, titel: "Jeder Einstellungswechsel: von 0,6 s davor bis 0,4 s danach (mit 15 fps)" }), join(dir, "pruefen", "schnitte.jpg")) : null;

// --- die Einstellungen und ihre Schnitte
console.log(`${proj.einstellungen.length} Einstellungen, ${proj.dauer.toFixed(2)} s:`);
for (const p of proj.einstellungen) console.log(`  ${p.id.padEnd(22)} ${p.von.toFixed(2).padStart(6)}–${p.bis.toFixed(2).padEnd(6)} ${(p.bis - p.von).toFixed(1).padStart(4)} s  ${p.uebergang}${typeof p.abGesagt === "string" ? `  (bei «${p.abGesagt}»)` : ""}`);
const warnungen = [];
for (const c of schnitte(proj, zst)) {
  const platz = `Schnitt ${c.n} (${c.von} → ${c.bis}, ${c.t.toFixed(2)} s)`;
  if (c.uebergang === "weiter") { if (c.sprung.mittel > 2.5) warnungen.push(`${platz}: es ist «weiter», aber das Bild springt (${c.sprung.mittel.toFixed(1)}): Von einer Einstellung zur anderen sollte nichts zu merken sein. Sieh es dir an mit ansehen.mjs schnitt ${c.n}.`); continue; }
  if (c.amEnde.anteil > 0.05 && c.amEnde.mittel > 3) warnungen.push(`${platz}: die vorige Einstellung bewegt sich noch, als geschnitten wird (in der letzten Zehntelsekunde ändern sich ${(100 * c.amEnde.anteil).toFixed(0)} % des Bildschirms): Es wird mittendrin abgeschnitten wirken. Lass ihre Aktion zu Ende gehen und das Bild kurz ruhen, bevor geschnitten wird, oder schneide später, bei einem anderen Wort.`);
  if (c.sprung.mittel < 20 && c.uebergang !== "blende") warnungen.push(`${platz}: das letzte Bild davor und das erste danach ähneln sich (${c.sprung.mittel.toFixed(1)}): Es wirkt wie ein Sprung am selben Ort. Ist es derselbe Ort, schneide nicht: Lass die Kamera in einer einzigen Einstellung von einem Bildausschnitt zum anderen gehen. Ist es ein anderer Ort, lass ihn anders aussehen als sein erstes Bild.`);
  if (c.dauert < 1.2) warnungen.push(`${platz}: die neue Einstellung dauert ${c.dauert.toFixed(2)} s; keine Zeit, sie zu sehen. Gib ihr einen ganzen Satz oder lass sie in der vorigen Einstellung.`);
  if (c.dauerteVorher < 1.2) warnungen.push(`${platz}: die vorige Einstellung dauerte nur ${c.dauerteVorher.toFixed(2)} s.`);
}

// --- was sich bewegt, Sekunde für Sekunde
const { zeile } = bewegungslinie(proj, zst);
console.log(`Sekunde für Sekunde, was sich bewegt (. fast nichts, - wenig, = etwas, # viel, | Schnitt):\n  ${zeile}`);
const ruhend = [...zeile.matchAll(/\.{3,}/g)].map((m) => `${m.index}–${m.index + m[0].length} s`);
if (ruhend.length) warnungen.push(`Fast still bei ${ruhend.join(", ")}. Außer es ist die Pause nach der Pointe, fehlt dort etwas Großes, das zur Stimme passt.`);

// --- der Untertitel
const helle = untertitelAufHell(proj, zst);
if (helle.length) warnungen.push(`Der Untertitel liegt über fast weißem Hintergrund bei ${helle.map(([a, b]) => `${a.toFixed(1)}–${b.toFixed(1)} s`).join(", ")}: Er wird nicht lesbar sein. Dunkle diesen Streifen ab (ein weicher Schleier oben) oder verschieb den hellen Teil.`);

// --- der Klang
if (hatEffekte(dir)) {
  let ev = (await import(pathToFileURL(join(dir, "klaenge.js")).href)).default;
  if (typeof ev === "function") ev = ev(v);
  const { spurDatei, benutzte } = mischeEffekte(ev, leseAudio(join(dir, "stimme", "stimme.wav"), SR));
  const hs = luecken(spurDatei, 2).filter(([a]) => a < proj.dauer);
  if (hs.length) warnungen.push(`Mehr als 2 s gar kein Effekt: ${hs.map(([a, b]) => `${a.toFixed(1)}–${b.toFixed(1)} s`).join(", ")}. Wenn sich dort etwas bewegt, fehlt ihm der Klang.`);
  const cs = proj.einstellungen.slice(1).filter((p) => p.uebergang !== "weiter").map((p) => p.von);
  for (const e of benutzte) for (const c of cs) if (Math.abs(e.t - c) < 0.08) warnungen.push(`Der Klang «${e.klang}» bei ${e.t.toFixed(2)} s fällt auf den Schnitt bei ${c.toFixed(2)} s: Ein Schnitt macht kein Geräusch; leg ihn auf das, was sich bewegt.`);
  if (!existsSync(join(dir, "klaenge", "effekte.wav"))) warnungen.push("Es gibt noch keine Effektspur: node motor/klang.mjs " + dir);
}

console.log(warnungen.length ? "\nZum Ansehen:\n" + warnungen.map((a) => "  - " + a).join("\n") : "\nNichts zu warnen. Trotzdem: Sieh dir beide Blätter ganz an.");
console.log(`\nSieh dir die Blätter in voller Größe an:\n  ${hf}${hc ? "\n  " + hc : ""}\n(${((Date.now() - t0) / 1000).toFixed(0)} s)`);
