// Feuer, Dampf und Ausbrüche: flackernde Flammenzungen, eine Wolke, die aufplatzt, und ihre Stücke, die davonfliegen.
import { zufall, mischRgb } from "./base.js";
import { fels } from "./koerper.js";
import { leuchten } from "./licht.js";

// Eine Flammenzunge, die von (x, y) aufsteigt, h hoch und w breit, flackernd mit der Zeit t.
// fuss und tip: "r,g,b"-Farben ihrer Basis und ihres Körpers. phase: damit jede Zunge anders flackert.
export function zunge(g, x, y, h, w, t, phase, fuss = "60,110,255", spitzenFarbe = "120,170,255") {
  const flackert = 0.85 + 0.25 * Math.sin(t * 17 + phase) + 0.12 * Math.sin(t * 29 + phase * 2), hoch = h * flackert;
  g.save();
  g.globalCompositeOperation = "lighter";
  const lg = g.createLinearGradient(x, y, x, y - hoch);
  lg.addColorStop(0, `rgba(${fuss},0.95)`); lg.addColorStop(0.35, `rgba(${spitzenFarbe},0.8)`); lg.addColorStop(1, `rgba(${spitzenFarbe},0)`);
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x - w * 0.7, y - hoch * 0.5, x + 4 * Math.sin(t * 9 + phase), y - hoch); g.quadraticCurveTo(x + w * 0.7, y - hoch * 0.5, x + w / 2, y); g.closePath(); g.fill();
  g.restore();
}

// Ein Flammenring (ein Gasbrenner in der Küche), zentriert bei (cx, cy) mit den Radien rx, ry, ein wenig von oben gesehen.
// orange von 0 bis 1: von der blauen Gasflamme zur orangen (Salz, Natrium, Holz). vorne: true zeichnet die Zungen
// vorne und false die hinten (erst die hinten zeichnen, dann den Brenner, dann die vorne).
export function flammenring(g, cx, cy, rx, ry, t, orange = 0, vorne = true, n = 30, hoch = 105) {
  const zuf = zufall(73);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, f = zuf() * 10, k = 0.8 + zuf() * 0.4;
    if ((Math.sin(a) > 0) !== vorne) continue;
    const fuss = mischRgb("60,110,255", "255,140,40", orange), spitzenFarbe = mischRgb("120,170,255", "255,196,90", orange);
    zunge(g, cx + rx * Math.cos(a), cy + ry * Math.sin(a), (hoch + 70 * orange) * k, 30 + 14 * orange, t, f, fuss, spitzenFarbe);
  }
}

// Etwas, das bei (x, y) aufplatzt, u Sekunden später: ein Blitz, eine Wolke aus n Bäuschen, die sich öffnet und ein wenig fällt, und
// Stücke, die davonfliegen. color: die der Wolke (ein Name aus FARBEN). massstab: wie groß es ist (1 = der halbe Bildschirm).
// brocken: wie viele Felsbrocken davonfliegen (0, keine).
export function ausbruch(g, x, y, u, color = "natrium", massstab = 1, saat = 12, n = 150, brocken = 9) {
  if (u < 0) return;
  const zuf = zufall(saat);
  leuchten(g, x, y, 2400 * massstab * (0.4 + u), color, 1.3 * Math.exp(-u * 2.2));
  for (let i = 0; i < n; i++) {
    const a = zuf() * Math.PI * 2, v = (120 + zuf() * 620) * massstab, s = (20 + zuf() * 70) * massstab, k = zuf();
    const e = (1 - Math.exp(-u * 2.2)) / 2.2;
    const px = x + Math.cos(a) * v * 1.4 * e, py = y + (Math.sin(a) * v * 0.8 + 120 * massstab) * 1.4 * e + 140 * massstab * u * u;
    leuchten(g, px, py, s * 1.5 * (1 + u), color, (0.95 - 0.45 * k) * Math.exp(-u * 0.8));
  }
  for (let i = 0; i < brocken; i++) {
    const b = zuf() * Math.PI * 2, w = (260 + zuf() * 380) * massstab, s = (40 + zuf() * 60) * massstab, dreht = (zuf() - 0.5) * 8;
    const e = 1 - Math.exp(-u * 3), rr = s * Math.exp(-u * 1.8);
    if (rr > 2) fels(g, x + (Math.cos(b) * w * e) / 3, y + (Math.sin(b) * w * e) / 3, rr, dreht * u, 400 + i, 0, 1, Math.exp(-u * 1.2));
  }
}
