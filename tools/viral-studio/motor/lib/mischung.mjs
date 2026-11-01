// Die Effektspur: jeder Klang in seiner Sekunde, in seinem Tempo, mit seinem Pegel passend zur Stimme, die um ihn herum läuft
// (wie in den Reels, die funktioniert haben: die lautesten 10 ms des Effekts liegen `db` unter den lautesten 50 ms der nahen Stimme,
// innerhalb von ±0,4 s; wenn dort niemand spricht, unter dem typischen Pegel der Stimme).
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WURZEL, fehler, leseAudio } from "./gemeinsam.mjs";

export const SR = 48000;
export const ORDNER = join(WURZEL, "klaenge");

// Die verfügbaren Klänge: Name → Datei.
export function katalog() {
  const c = {};
  for (const f of readdirSync(ORDNER)) { const m = f.match(/^(.+)\.(mp3|wav)$/); if (m) c[m[1]] = join(ORDNER, f); }
  return c;
}

// der lauteste Teil (RMS in Fenstern von `fensterLaenge` Samples) zwischen zwei Sekunden: sein Pegel in dB und wo er beginnt
function lautestes(a, t0, t1, fensterLaenge) {
  let beste = 0, wo = Math.max(0, t0);
  for (let i = Math.max(0, Math.floor(t0 * SR)); i + fensterLaenge <= Math.min(a.length, Math.floor(t1 * SR)); i += fensterLaenge / 2) {
    let s = 0;
    for (let j = i; j < i + fensterLaenge; j++) s += a[j] * a[j];
    const r = Math.sqrt(s / fensterLaenge);
    if (r > beste) { beste = r; wo = i / SR; }
  }
  return { db: 20 * Math.log10(beste + 1e-9), t: wo };
}

// zweipoliger Tiefpass: entfernt harte Höhen
function tiefpass(x, fc) {
  const w = (2 * Math.PI * fc) / SR, cw = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2);
  const b0 = (1 - cw) / 2, b1 = 1 - cw, b2 = (1 - cw) / 2, a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y; x[i] = y;
  }
}

// ereignisse: [{ t, klang, db = -10, tempo = 1, lp, anker = "treffer" | "anfang", umgekehrt, schneidet, was }]
//   t           die Sekunde, in der der lauteste Teil des Klangs landet (sein Treffer); mit anker "anfang", wo er beginnt
//   tempo       über 1 höher und kürzer; unter 1 tiefer und länger
//   lp          entfernt die Höhen über so vielen Hz (dumpfer, weiter weg)
//   umgekehrt   rückwärts abgespielt: Er schwillt an und bricht ab (für etwas, das zurückspult oder eingesaugt wird)
//   schneidet   die Sekunde, in der er ganz ausblendet (mit seiner Einstellung: Wird die Einstellung geschnitten, dann auch der Klang)
export function mischeEffekte(ereignisse, stimme) {
  const klaenge = katalog(), cache = {}, spurDatei = new Float32Array(stimme.length);
  const typisch = lautestes(stimme, 0, stimme.length / SR, 2400).db - 3;
  const benutzte = [];
  for (const e0 of [...ereignisse].sort((a, b) => a.t - b.t)) {
    const e = { db: -10, tempo: 1, anker: "treffer", ...e0 };
    const route = klaenge[e.klang];
    if (!route) fehler(`Es gibt keinen Klang «${e.klang}» in klaenge/. Verfügbar: ${Object.keys(klaenge).join(", ")}.`);
    const src = cache[route] || (cache[route] = leseAudio(route, SR));
    let n = Math.floor(src.length / e.tempo);
    const x = new Float32Array(n);
    for (let i = 0; i < n; i++) { const p = i * e.tempo, k = Math.floor(p), f = p - k; x[i] = (src[k] || 0) * (1 - f) + (src[k + 1] || 0) * f; }
    if (e.umgekehrt) x.reverse();
    if (e.lp) tiefpass(x, e.lp);
    const treffer = lautestes(x, 0, n / SR, 480), anker = e.anker === "anfang" ? 0 : treffer.t;
    const nah = lautestes(stimme, e.t - 0.4, e.t + 0.4, 2400).db, ref = nah < -45 ? typisch : nah;
    const verst = 10 ** ((ref + e.db - treffer.db) / 20), ini = Math.round((e.t - anker) * SR);
    if (e.schneidet !== undefined) n = Math.max(0, Math.min(n, Math.round(e.schneidet * SR) - ini));
    const blende = e.schneidet !== undefined ? 0.08 : Math.min(0.04, n / SR / 3);
    for (let i = 0; i < n; i++) {
      const j = ini + i;
      if (j < 0 || j >= spurDatei.length) continue;
      const ti = i / SR, bleibt = n / SR - ti;
      spurDatei[j] += x[i] * verst * Math.min(1, ti / 0.004) * Math.min(1, bleibt / blende);
    }
    benutzte.push({ ...e, von: ini / SR, bis: (ini + n) / SR });
  }
  return { spurDatei, benutzte };
}

// Die Abschnitte, in denen gar kein Effekt klingt (länger als `lang` Sekunden).
export function luecken(spurDatei, lang = 2) {
  const W = 2400, h = [];
  let von = null;
  for (let i = 0; i + W <= spurDatei.length; i += W) {
    let s = 0;
    for (let j = i; j < i + W; j++) s += spurDatei[j] * spurDatei[j];
    const klingt = 10 * Math.log10(s / W + 1e-12) > -48, t = i / SR;
    if (!klingt && von === null) von = t;
    if (klingt && von !== null) { if (t - von > lang) h.push([von, t]); von = null; }
  }
  return h;
}

export const hatEffekte = (dir) => existsSync(join(dir, "klaenge.js"));
