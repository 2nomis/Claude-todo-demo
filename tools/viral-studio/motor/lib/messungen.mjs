// Messungen des Videos, ohne es zu rendern: wie sehr sich das Bild ändert, wie jeder Schnitt ankommt und ob man den
// Untertitel lesen kann. Es sind Daten, um zu wissen, wo man hinschauen muss, nie eine Note und nie ein Grund, etwas zu verschieben,
// was die Stimme nicht verlangt.
import { createCanvas } from "@napi-rs/canvas";
import { zeichneBild } from "./bild.mjs";

const W = 90, H = 160;
const klein = createCanvas(W, H), gp = klein.getContext("2d");

// Bild t, klein und in Graustufen (ohne Untertitel: gemessen wird das Bild).
export function grau(proj, zst, t) {
  zeichneBild(proj, zst, Math.max(0, Math.min(proj.dauer - 1 / 120, t)), { untertitel: false });
  gp.drawImage(zst.leinwand, 0, 0, W, H);
  const d = gp.getImageData(0, 0, W, H).data, out = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) out[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  return out;
}

// Welcher Teil des Bildschirms sich von a nach b ändert (0 bis 1) und wie sehr er sich im Mittel ändert (0 bis 255).
export function unterschied(a, b) {
  let n = 0, s = 0;
  for (let i = 0; i < a.length; i++) { const x = Math.abs(a[i] - b[i]); s += x; if (x > 12) n++; }
  return { anteil: n / a.length, mittel: s / a.length };
}

// Sekunde für Sekunde, was sich bewegt: . fast nichts (weniger als 3 % des Bildschirms), - wenig, = etwas, # viel, | Schnitt.
export function bewegungslinie(proj, zst, schritt = 0.1) {
  const schnitte = proj.einstellungen.slice(1).filter((p) => p.uebergang !== "weiter").map((p) => p.von);
  const seg = Math.ceil(proj.dauer), maxProSek = new Array(seg).fill(0);
  let vorher = grau(proj, zst, 0);
  for (let t = schritt; t < proj.dauer; t += schritt) {
    const aktuell = grau(proj, zst, t), s = Math.floor(t);
    const hatSchnitt = schnitte.some((c) => c > t - schritt && c <= t);
    if (!hatSchnitt) maxProSek[s] = Math.max(maxProSek[s], unterschied(vorher, aktuell).anteil);
    vorher = aktuell;
  }
  const zeile = maxProSek.map((p, s) => (schnitte.some((c) => c >= s && c < s + 1) ? "|" : p < 0.03 ? "." : p < 0.1 ? "-" : p < 0.25 ? "=" : "#")).join("");
  return { zeile, maxProSek };
}

// Wie jeder Schnitt ankommt:
//   amEnde: was sich in der letzten Zehntelsekunde vor dem Schnitt ändert (Teil des Bildschirms und wie sehr). Gemessen an den
//           Schnitten, die mittendrin abgeschnitten wirkten (der Salzstreuer mitten im Fallen, der Dampf halb offen): mehr als
//           5 % des Bildschirms und mehr als 3 im Mittel. Die, die gut ankommen, liegen darunter.
//   sprung: was sich vom letzten Bild davor zum ersten danach ändert. Ein Schnitt an einen anderen Ort, mehr als 25; einer an
//           denselben Ort aus einem anderen Bildausschnitt (der seltsame Sprung), um die 17; eine Fortsetzung ohne Schnitt, weniger als 2.
export function schnitte(proj, zst) {
  const out = [];
  proj.einstellungen.forEach((p, i) => {
    if (i === 0) return;
    const c = p.von, vorig = proj.einstellungen[i - 1];
    const amEnde = unterschied(grau(proj, zst, c - 0.12), grau(proj, zst, c - 0.02));
    const sprung = unterschied(grau(proj, zst, c - 0.02), grau(proj, zst, c + 0.02));
    out.push({ n: i, t: c, von: vorig.id, bis: p.id, uebergang: p.uebergang, dauert: p.bis - p.von, dauerteVorher: c - vorig.von, amEnde, sprung });
  });
  return out;
}

// Ob man den Untertitel lesen kann: wie hell der Hintergrund dahinter ist (x 170–910, y 318–482). Gibt die
// Abschnitte zurück, in denen der Hintergrund fast weiß ist (weißer Text wäre nicht zu sehen).
export function untertitelAufHell(proj, zst, schritt = 0.25) {
  const bereiche = [];
  let von = null;
  for (let t = 0; t < proj.dauer; t += schritt) {
    zeichneBild(proj, zst, t, { untertitel: false });
    const d = zst.g.getImageData(170, 318, 740, 164).data;
    let s = 0;
    for (let i = 0; i < d.length; i += 16) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const hell = s / (d.length / 16) > 185;
    if (hell && von === null) von = t;
    if (!hell && von !== null) { bereiche.push([von, t]); von = null; }
  }
  if (von !== null) bereiche.push([von, proj.dauer]);
  return bereiche.filter(([a, b]) => b - a >= 0.5);
}
