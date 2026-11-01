#!/usr/bin/env node
// ansehen.mjs: zeigt jeden Moment des Videos in Sekunden, ohne zu rendern.
import { join } from "node:path";
import { argumente, hilfe, projektOrdner, fehler } from "./lib/gemeinsam.mjs";
import { vorbereiten } from "./lib/bild.mjs";
import { speichereJpg, blatt, verteilung } from "./lib/blaetter.mjs";
import { oeffnen } from "./lib/projekt.mjs";

hilfe(`
node motor/ansehen.mjs <projekt> <was> [--fps N] [--breite px] [--ohne-untertitel] [--eroeffnung name]

Macht einen Kontaktbogen (ein .jpg in <projekt>/pruefen/) und gibt aus, wo er liegt. Sieh ihn dir immer an: So sieht es aus.
  <sekunde>            ein großes Bild, zum Beispiel 12.4
  <a>-<b>              von a bis b Sekunden, mit --fps (10, wenn du nichts sagst), zum Beispiel 9-11.5
  wort <w>[#n]         von 0,5 s vor bis 0,8 s nach diesem Wort, mit 30 fps (natrium, sonne#2)
  satz <n>             Satz n, vom ersten bis zum letzten Wort, in 8 Bildern
  saetze               alle Sätze, eine Zeile pro Satz (vom ersten bis zum letzten Wort)
  schnitt <n>          Einstellungswechsel n: 0,6 s davor und 0,4 s danach, mit 30 fps
  einstellungen        Anfang, Mitte und Ende jeder Einstellung
--eroeffnung 01-tunnel: dasselbe, mit dieser anderen Hook-Eröffnung (video/eroeffnungen/01-tunnel.js statt Einstellung 01).
`);

const { lose, opt } = argumente();
const dir = projektOrdner(lose[0]);
const was = lose.slice(1);
if (!was.length) fehler("Es fehlt, was angesehen werden soll: eine Sekunde, ein Abschnitt (9-11.5), wort <w>, satz <n>, saetze, schnitt <n> oder einstellungen.");
const eroeffnung = opt.eroeffnung ? String(opt.eroeffnung) : null;
const proj = await oeffnen(dir, { eroeffnung }), zst = vorbereiten(proj), v = proj.v;
const untertitel = !opt["ohne-untertitel"], breite = Number(opt.breite || 0);
const raus = (c, name) => console.log(speichereJpg(c, join(dir, "pruefen", eroeffnung ? `${eroeffnung}-${name}` : name)));

if (was[0] === "wort") {
  const w = v.wort(was[1]), fps = Number(opt.fps || 30);
  const ts = []; for (let t = w.anfang - 0.5; t <= w.anfang + 0.8 + 1e-6; t += 1 / fps) ts.push(t);
  raus(blatt(proj, zst, ts, { breite: breite || 150, spalten: 10, untertitel, titel: `«${w.text}» bei ${w.anfang.toFixed(2)} s, mit ${fps} fps` }), `wort-${was[1].replace(/[^a-z0-9#]/gi, "")}.jpg`);
} else if (was[0] === "satz") {
  const f = v.satz(Number(was[1])), a = f.woerter[0].anfang, b = f.woerter[f.woerter.length - 1].ende;
  raus(blatt(proj, zst, verteilung(a, b, Number(opt.n || 8)), { breite: breite || 200, spalten: 8, untertitel, titel: `Satz ${f.n}: «${f.text}»` }), `satz-${f.n}.jpg`);
} else if (was[0] === "saetze") {
  const ts = [];
  for (const f of v.saetze) verteilung(f.woerter[0].anfang, f.woerter[f.woerter.length - 1].ende, 6).forEach((t, i) => ts.push(i ? t : { t, markierung: `${f.n}: ${t.toFixed(2)}` }));
  raus(blatt(proj, zst, ts, { breite: breite || 150, spalten: 6, untertitel, titel: "Jeder Satz, vom ersten bis zum letzten Wort" }), "saetze.jpg");
} else if (was[0] === "schnitt") {
  const n = Number(was[1]), p = proj.einstellungen[n];
  if (!p || n < 1) fehler(`Es gibt keinen Schnitt ${was[1]}: es gibt ${proj.einstellungen.length - 1} (von 1 bis ${proj.einstellungen.length - 1}).`);
  const fps = Number(opt.fps || 30), ts = [];
  for (let t = p.von - 0.6; t < p.von + 0.4; t += 1 / fps) ts.push(Math.abs(t - p.von) < 0.5 / fps ? { t, markierung: `${t.toFixed(2)} ${p.uebergang}` } : t);
  raus(blatt(proj, zst, ts, { breite: breite || 150, spalten: 10, untertitel, titel: `Schnitt ${n}: von ${proj.einstellungen[n - 1].id} bis ${p.id} (${p.uebergang}) bei ${p.von.toFixed(2)} s` }), `schnitt-${n}.jpg`);
} else if (was[0] === "einstellungen") {
  const ts = [];
  for (const p of proj.einstellungen) verteilung(p.von + 0.02, p.bis - 0.02, 4).forEach((t, i) => ts.push(i ? t : { t, markierung: p.id.slice(0, 14) }));
  raus(blatt(proj, zst, ts, { breite: breite || 150, spalten: 8, untertitel, titel: "Jede Einstellung: Anfang, Mitte und Ende" }), "einstellungen.jpg");
} else if (/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(was[0])) {
  const [a, b] = was[0].split("-").map(Number), fps = Number(opt.fps || 10), ts = [];
  for (let t = a; t <= b + 1e-6; t += 1 / fps) ts.push(t);
  if (ts.length > 120) fehler(`Das sind ${ts.length} Bilder: Bitte um weniger Zeit oder weniger fps (höchstens 120).`);
  raus(blatt(proj, zst, ts, { breite: breite || 150, spalten: 10, untertitel, titel: `Von ${a} bis ${b} s, mit ${fps} fps` }), `abschnitt-${a}-${b}.jpg`);
} else if (/^\d+(\.\d+)?$/.test(was[0])) {
  const t = Number(was[0]);
  raus(blatt(proj, zst, [t], { breite: breite || 540, spalten: 1, untertitel }), `bei-${t}.jpg`);
} else fehler(`Ich weiß nicht, wie ich «${was.join(" ")}» ansehen soll. Siehe node motor/ansehen.mjs --help`);
