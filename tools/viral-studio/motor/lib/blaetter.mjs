// Kontaktbögen: mehrere Momente des Videos, klein und der Reihe nach, mit ihrer Sekunde und dem Wort, das gesagt wird. So
// sieht man die Bewegung, ohne auf ein Rendern zu warten: Jeder Bogen dauert Sekunden.
import { createCanvas } from "@napi-rs/canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { HOEHE, BREITE } from "./gemeinsam.mjs";
import { zeichneBild } from "./bild.mjs";

// Das Wort, das bei t gesagt wird (oder das zuletzt gesagte).
export function wortBei(v, t) {
  let w = null;
  for (const p of v.woerter) { if (p.anfang <= t + 0.001) w = p; else break; }
  return w;
}

// zeitpunkte: eine Liste von Sekunden (oder von { t, markierung }); breite jedes Bildes; spalten.
export function blatt(proj, zst, zeitpunkte, { breite = 180, spalten = 8, untertitel = true, titel = "" } = {}) {
  const hoch = Math.round((breite * HOEHE) / BREITE), kopf = titel ? 34 : 0, fuss = 22;
  const reihen = Math.ceil(zeitpunkte.length / spalten), sep = 4;
  const W = spalten * breite + (spalten + 1) * sep, H = kopf + reihen * (hoch + fuss + sep) + sep;
  const c = createCanvas(W, H), g = c.getContext("2d");
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
  if (titel) { g.fillStyle = "#111"; g.font = "700 20px Figtree"; g.textBaseline = "middle"; g.fillText(titel, sep + 4, kopf / 2); }
  zeitpunkte.forEach((x, i) => {
    const t = typeof x === "number" ? x : x.t, markierung = typeof x === "number" ? "" : x.markierung || "";
    const col = i % spalten, reihe = Math.floor(i / spalten), px = sep + col * (breite + sep), py = kopf + sep + reihe * (hoch + fuss + sep);
    zeichneBild(proj, zst, Math.max(0, Math.min(proj.dauer - 1 / 120, t)), { untertitel });
    g.drawImage(zst.leinwand, px, py, breite, hoch);
    const w = wortBei(proj.v, t);
    g.fillStyle = markierung ? "#c0262d" : "#111"; g.font = "700 14px Figtree"; g.textBaseline = "top";
    g.fillText(`${t.toFixed(2)} ${markierung || (w ? "«" + w.text.replace(/[.,:;!?¿¡]/g, "") + "»" : "")}`.slice(0, 26), px + 2, py + hoch + 4);
  });
  return c;
}

export function speichereJpg(c, route) {
  mkdirSync(dirname(route), { recursive: true });
  writeFileSync(route, c.toBuffer("image/jpeg", 88));
  return route;
}

// Von a bis b, n Bilder verteilt (beide Enden eingeschlossen).
export const verteilung = (a, b, n) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / Math.max(1, n - 1));
