// Die Grundlagen: Vektoren, Zeitkurven, Zufall mit Saat, Hilfsleinwände und Farben.
import { createCanvas } from "@napi-rs/canvas";

export const BREITE = 1080, HOEHE = 1920;

// ---------------------------------------------------------------- Vektoren [x, y, z]
export const sum = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const teil = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mal = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const pkt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const laenge = (a) => Math.sqrt(pkt(a, a));
export const einh = (a) => mal(a, 1 / (laenge(a) || 1));
export const mischV = (a, b, u) => sum(a, mal(teil(b, a), u));

// ---------------------------------------------------------------- Zeit
// rampe(t, a, b): 0 vor a, 1 nach b, und dazwischen eine gerade Linie. Funktioniert auch mit a > b (geht von 1 nach 0).
export const rampe = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
// sanft(u): beginnt und endet ohne Ruckeln (erste und zweite Ableitung sind an beiden Enden null).
export const sanft = (u) => u * u * u * (u * (u * 6 - 15) + 10);
export const misch = (a, b, u) => a + (b - a) * u;
// Kurven für das, was hereinkommt oder geht: kommtRein(u) kommt schnell und bremst lange; geht(u) beginnt langsam und geht schnell.
export const kommtRein = (u) => 1 - Math.pow(1 - u, 3);
export const geht = (u) => u * u * u;
// Ein Puls, der um t0 steigt und fällt (breite: ungefähr, wie lange er dauert).
export const puls = (t, t0, breite = 0.2) => Math.exp(-Math.pow((t - t0) / breite, 2));
// Etwas, das sich zwischen zwei Sekunden sanft von a nach b bewegt: weich(t, t0, t1, a, b).
export const weich = (t, t0, t1, a, b) => misch(a, b, sanft(rampe(t, t0, t1)));

// kurve(schluesselwerte): geht durch jedes [t, wert], ohne zu überschwingen oder dazwischen anzuhalten (monotone Kubik). Für etwas,
// das nacheinander durch mehrere Orte geht, mit stetiger Geschwindigkeit: die Größe eines Dings, die Entfernung der Kamera...
// p0 und p1: die Steigung am Anfang und am Ende (0, damit es ruhig beginnt und endet).
export function kurve(schluesselwerte, p0, p1) {
  const n = schluesselwerte.length, m = [], d = [];
  if (n === 1) return () => schluesselwerte[0][1];
  for (let i = 0; i < n - 1; i++) d.push((schluesselwerte[i + 1][1] - schluesselwerte[i][1]) / (schluesselwerte[i + 1][0] - schluesselwerte[i][0]));
  m[0] = p0 === undefined ? d[0] : p0; m[n - 1] = p1 === undefined ? d[n - 2] : p1;
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return (t) => {
    if (t <= schluesselwerte[0][0]) return schluesselwerte[0][1] + m[0] * (t - schluesselwerte[0][0]);
    if (t >= schluesselwerte[n - 1][0]) return schluesselwerte[n - 1][1] + m[n - 1] * (t - schluesselwerte[n - 1][0]);
    let j = 0;
    while (j < n - 1 && t > schluesselwerte[j + 1][0]) j++;
    const h = schluesselwerte[j + 1][0] - schluesselwerte[j][0], u = (t - schluesselwerte[j][0]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * schluesselwerte[j][1] + (u3 - 2 * u2 + u) * h * m[j] + (-2 * u3 + 3 * u2) * schluesselwerte[j + 1][1] + (u3 - u2) * h * m[j + 1];
  };
}

// stuetzpunkte([[t, v], ...]) ohne Steigung an den Enden: Es beginnt und endet ruhig. Die übliche Wahl für etwas, das sich
// zwischen Positionen bewegt und anhält.
export const stuetzpunkte = (liste) => kurve(liste, 0, 0);

// ---------------------------------------------------------------- Zufall mit Saat
// Nichts benutzt Math.random: Dieselbe Saat ergibt immer dasselbe, in jedem Bild und bei jedem Rendern.
export function zufall(saat) {
  let a = (saat >>> 0) || 1;
  return () => { a += 0x6d2b79f5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ---------------------------------------------------------------- Leinwände und Zeichnen
export const leinwand = (w, h) => createCanvas(Math.max(1, Math.round(w)), Math.max(1, Math.round(h ?? w)));
// Ein Bild, um seine Mitte gedreht.
export function gedreht(g, img, x, y, groesse, ang) { g.save(); g.translate(x, y); g.rotate(ang); g.drawImage(img, -groesse / 2, -groesse / 2, groesse, groesse); g.restore(); }
// Ein Rechteck mit abgerundeten Ecken (nur der Pfad: danach fill oder stroke).
export function gerundet(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r);
  g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}

// ---------------------------------------------------------------- Farben
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
// mischFarbe("#ff0000", "#0000ff", 0.5) → "rgb(128,0,128)"
export const mischFarbe = (a, b, u) => { const x = hex(a), y = hex(b); return `rgb(${Math.round(misch(x[0], y[0], u))},${Math.round(misch(x[1], y[1], u))},${Math.round(misch(x[2], y[2], u))})`; };
// mischRgb("255,0,0", "0,0,255", 0.5) → "128,0,128" (zum Einsetzen in "rgba(" + ... + ",0.5)")
export const mischRgb = (a, b, u) => { const x = a.split(","), y = b.split(","); return `${Math.round(misch(+x[0], +y[0], u))},${Math.round(misch(+x[1], +y[1], u))},${Math.round(misch(+x[2], +y[2], u))}`; };

// Eine Zahl, wie man sie auf Deutsch schreibt: 30000 → "30.000"; Dezimalstellen mit Komma.
export function fmt(v, dec = 0) { const s = Math.abs(v).toFixed(dec).split("."); return (v < 0 ? "-" : "") + s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (s[1] ? "," + s[1] : ""); }
