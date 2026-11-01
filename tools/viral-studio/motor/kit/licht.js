// Licht: Schein, Blitze, Druckwellen und Strahlen. Fast alles wird addiert ("lighter"): Wo sich zwei Lichter treffen, mehr Licht.
import { leinwand } from "./base.js";

// Die Farben der Lichter, als "r,g,b" (für "rgba(" + FARBEN.gruen + ",0.5)").
export const FARBEN = {
  rot: "255,128,96", orange: "255,178,107", gelb: "255,231,163", weiss: "243,246,255", blau: "169,200,255",
  gruen: "150,255,100", natrium: "255,170,60", feuer: "255,140,40", tuerkis: "120,230,255", violett: "190,140,255",
};

const halos = new Map();
// Die Textur eines Scheins: eine weiße Mitte, ihre Farbe drumherum, nach außen auslaufend. color: ein Name aus FARBEN oder "r,g,b".
export function halo(color) {
  if (halos.has(color)) return halos.get(color);
  const rgb = FARBEN[color] || color, l = leinwand(64), cx = l.getContext("2d"), gr = cx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.1, `rgba(${rgb},1)`); gr.addColorStop(0.3, `rgba(${rgb},0.35)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64);
  halos.set(color, l);
  return l;
}

// Ein Schein bei (x, y), groesse Pixel im Durchmesser (Rand zu Rand), in einer Farbe und mit einer Stärke deck (0 bis 1).
export function leuchten(g, x, y, groesse, color = "weiss", deck = 1) {
  if (deck <= 0.003 || groesse < 1) return;
  const A = g.globalAlpha;
  g.save();
  g.globalCompositeOperation = "lighter"; g.globalAlpha = A * Math.max(0, Math.min(1, deck));
  g.drawImage(halo(color), x - groesse / 2, y - groesse / 2, groesse, groesse);
  g.restore();
}

// Ein Blitz mit seiner Druckwelle, u Sekunden nachdem er passiert: ein Lichtkreis, der sich öffnet und verblasst, und ein Ring, der
// nach außen wandert. groesse: wie weit die Welle reicht (px).
export function blitz(g, x, y, u, groesse = 1300, color = "255,236,210") {
  if (u < 0 || u > 1.6) return;
  const welle = 1 - Math.exp(-u * 2.6);
  g.save();
  g.globalCompositeOperation = "lighter";
  const R = groesse * 0.7 * (0.25 + welle), fg = g.createRadialGradient(x, y, 0, x, y, R);
  fg.addColorStop(0, `rgba(255,255,255,${0.95 * Math.exp(-u * 4)})`); fg.addColorStop(0.4, `rgba(${color},${0.35 * Math.exp(-u * 3)})`); fg.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = fg; g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2); g.fill();
  g.strokeStyle = `rgba(${color},${0.7 * Math.exp(-u * 2.2)})`; g.lineWidth = 10 * Math.exp(-u * 1.5) + 2;
  g.beginPath(); g.arc(x, y, 60 + groesse * welle, 0, Math.PI * 2); g.stroke();
  g.restore();
}

// Ein senkrechter Lichtstrahl (von unten nach oben): ein heller Kern und sein Halo, von y0 (unten) bis y1 (oben).
// dimmt: ob die Spitze ausläuft (damit sie nicht hart auf etwas trifft).
export function strahl(g, x, y0, y1, color, deck = 1, breite = 52, dimmt = false) {
  if (deck <= 0 || y1 >= y0) return;
  g.save();
  g.globalCompositeOperation = "lighter";
  const hg = g.createLinearGradient(0, y0, 0, y1);
  hg.addColorStop(0, `rgba(${color},${0.35 * deck})`); hg.addColorStop(1, `rgba(${color},${dimmt ? 0 : 0.2 * deck})`);
  g.fillStyle = hg; g.fillRect(x - breite * 1.2, y1, breite * 2.4, y0 - y1);
  const ng = g.createLinearGradient(0, y0, 0, y1);
  ng.addColorStop(0, `rgba(${color},${deck})`); ng.addColorStop(dimmt ? 0.6 : 1, `rgba(${color},${0.75 * deck})`); if (dimmt) ng.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = ng; g.fillRect(x - breite / 2, y1, breite, y0 - y1);
  g.restore();
}

// Lichtstrahlen, die schräg von oben herunterkommen (wie Sonnenlicht, das ins Wasser fällt), langsam in Bewegung.
export function strahlen(g, t, hoch, deck = 1, n = 7, color = "210,240,255") {
  if (deck <= 0.01) return;
  g.save();
  g.globalCompositeOperation = "lighter";
  for (let r = 0; r < n; r++) {
    const x0 = -120 + r * (1320 / n) + 50 * Math.sin(t * 0.6 + r * 1.7), ra = g.createLinearGradient(0, 0, 0, hoch);
    ra.addColorStop(0, `rgba(${color},${0.16 * deck})`); ra.addColorStop(1, `rgba(${color},0)`);
    g.fillStyle = ra; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 70, 0); g.lineTo(x0 + 290, hoch); g.lineTo(x0 + 160, hoch); g.closePath(); g.fill();
  }
  g.restore();
}
