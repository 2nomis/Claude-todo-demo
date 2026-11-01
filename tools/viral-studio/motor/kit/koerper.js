// Runde Körper und Felsen, mit Licht und Volumen: eine leuchtende Kugel (ein Stern, eine Glühbirne, eine Sonne), ein Felsplanet mit
// seiner Nachtseite, die Erde und beleuchtete unregelmäßige Felsen, die rotglühend werden können.
import { zufall, gedreht, leinwand, misch, mischFarbe, mischRgb } from "./base.js";
import { leuchten } from "./licht.js";
import { flecken, netz, netz2, rauschen } from "./texturen.js";

// Paletten einer leuchtenden Kugel: [Mitte, Zwischenton, Rand, Saum, Kranz ("r,g,b")].
export const PALETTEN = {
  gruen: ["#e2ffb2", "#98e646", "#51b424", "#1c5a0e", "122,255,72"],
  rot: ["#ffd3b6", "#ff7244", "#d63f1a", "#7a1b0b", "255,96,60"],
  riese: ["#ffc9a0", "#ff6a36", "#c8341a", "#5e1408", "255,90,50"],
  gelb: ["#fff7d6", "#ffd96a", "#f0a535", "#a35e18", "255,206,96"],
  weiss: ["#ffffff", "#eef3ff", "#c9d5f1", "#8796c2", "222,232,255"],
  zwerg: ["#ffffff", "#f1f5ff", "#d7e2fb", "#9fb0dc", "214,228,255"],
  blau: ["#eef5ff", "#a2c6ff", "#5587e4", "#284ca4", "128,172,255"],
};

// Eine Palette auf halbem Weg zwischen zwei (damit etwas nach und nach die Farbe wechselt). u von 0 bis 1.
export function palette(a, b, u = 0) {
  const A = typeof a === "string" ? PALETTEN[a] : a, B = typeof b === "string" ? PALETTEN[b] : b || A;
  if (!b || u <= 0) return A;
  if (u >= 1) return B;
  return [mischFarbe(A[0], B[0], u), mischFarbe(A[1], B[1], u), mischFarbe(A[2], B[2], u), mischFarbe(A[3], B[3], u), mischRgb(A[4], B[4], u)];
}

// Eine leuchtende Kugel (ein Stern) mit Radius rad bei (x, y), mit ihrem Kranz drumherum und ihrer brodelnden Oberfläche.
// P: eine Palette (Name oder Liste). dreht: die Drehung der Oberfläche (Radiant; addier die Zeit, damit sie sich dreht).
// b: wie sehr sie zusätzlich leuchtet (0 normal; 1, ein Aufflackern).
export function stern(g, P, x, y, rad, dreht = 0, b = 0) {
  if (typeof P === "string") P = PALETTEN[P];
  if (rad < 0.5) return;
  const A = g.globalAlpha;
  g.save();
  const kranz = rad * (2.3 + 0.6 * b), gr = g.createRadialGradient(x, y, rad * 0.9, x, y, kranz);
  gr.addColorStop(0, `rgba(${P[4]},${Math.min(1, 0.55 + 0.35 * b)})`); gr.addColorStop(0.28, `rgba(${P[4]},0.18)`); gr.addColorStop(1, `rgba(${P[4]},0)`);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, kranz, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.clip();
  const dg = g.createRadialGradient(x - rad * 0.12, y - rad * 0.16, 0, x, y, rad);
  dg.addColorStop(0, P[0]); dg.addColorStop(0.45, P[1]); dg.addColorStop(0.84, P[2]); dg.addColorStop(1, P[3]);
  g.fillStyle = dg; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  g.globalCompositeOperation = "multiply";
  g.globalAlpha = A * 0.42; gedreht(g, netz, x, y, rad * 2.7, dreht);
  g.globalAlpha = A * 0.25; gedreht(g, netz2, x, y, rad * 2.5, -dreht * 0.8 + 0.7);
  g.globalCompositeOperation = "screen";
  g.globalAlpha = A * 0.3; gedreht(g, flecken, x, y, rad * 2.2, dreht * 0.5 + 2.1);
  g.globalCompositeOperation = "source-over"; g.globalAlpha = A;
  const lg = g.createRadialGradient(x, y, rad * 0.45, x, y, rad);
  lg.addColorStop(0, "rgba(0,0,0,0)"); lg.addColorStop(1, "rgba(0,0,0,0.5)");
  g.fillStyle = lg; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  g.restore();
}

// Dasselbe, aber für sich gezeichnet und mit der Transparenz deck (0 bis 1) gesetzt: damit sie als Ganzes erscheint oder ausblendet.
// (Sie direkt mit globalAlpha zu zeichnen, funktioniert nicht: Jede ihrer Schichten wird mit ihrer eigenen Transparenz gemalt.)
let abseits = null;
export function sternBlass(g, P, x, y, rad, dreht, b, deck) {
  if (deck >= 0.999) return stern(g, P, x, y, rad, dreht, b);
  if (deck <= 0.001) return;
  abseits = abseits || leinwand(1080, 1920);
  const ga = abseits.getContext("2d");
  ga.setTransform(1, 0, 0, 1, 0, 0); ga.globalAlpha = 1; ga.globalCompositeOperation = "source-over";
  ga.clearRect(0, 0, 1080, 1920);
  stern(ga, P, x, y, rad, dreht, b);
  g.save(); g.globalAlpha *= deck; g.drawImage(abseits, 0, 0); g.restore();
}

// Die Form eines Felsens: ein unregelmäßiges Polygon mit Radius 1, bei derselben Saat immer dasselbe.
const formen = new Map();
export function form(saat) {
  if (formen.has(saat)) return formen.get(saat);
  const zuf = zufall(1000 + saat), n = 9 + Math.floor(zuf() * 5), pts = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + (zuf() - 0.5) * 0.5, r = 0.62 + zuf() * 0.38; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  formen.set(saat, pts);
  return pts;
}

// Ein Fels mit Radius rad, gedreht um ang, beleuchtet aus der Richtung (lx, ly) des Bildschirms. hitze von 0 bis 1: Er wird rotglühend
// und leuchtet (wie etwas, das sehr schnell fällt oder brennt).
export function fels(g, x, y, rad, ang, saat, lx = 0, ly = -1, hitze = 0) {
  if (rad < 0.6) return;
  const pts = form(saat), c = hitze, l = Math.sqrt(lx * lx + ly * ly) || 1, A = g.globalAlpha;
  lx /= l; ly /= l;
  if (c > 0.02) leuchten(g, x, y, rad * (3 + 3 * c), "natrium", 0.55 * c);
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0] * rad, p[1] * rad) : g.moveTo(p[0] * rad, p[1] * rad))); g.closePath();
  g.clip();
  const ca = Math.cos(-ang), sa = Math.sin(-ang), llx = lx * ca - ly * sa, lly = lx * sa + ly * ca;
  const gr = g.createLinearGradient(llx * rad, lly * rad, -llx * rad, -lly * rad);
  gr.addColorStop(0, mischFarbe("#a99482", "#ffd27a", c)); gr.addColorStop(0.5, mischFarbe("#5e5045", "#ff8a2a", c)); gr.addColorStop(1, mischFarbe("#17120f", "#5a1a06", c));
  g.fillStyle = gr; g.fillRect(-rad, -rad, rad * 2, rad * 2);
  g.globalCompositeOperation = "multiply"; g.globalAlpha = A * 0.7; g.drawImage(flecken, -rad * 1.2, -rad * 1.2, rad * 2.4, rad * 2.4);
  g.globalAlpha = A * 0.35; g.drawImage(netz, -rad, -rad, rad * 2, rad * 2);
  g.restore();
}

// Ein Felsplanet mit seiner Nachtseite (das Licht kommt aus der Richtung (lx, ly) des Bildschirms).
// ton: [Licht, Mitte, Schatten] als "#rrggbb".
export function planet(g, x, y, rad, dreht, lx, ly, ton = ["#c9a27a", "#8a6346", "#3a2416"]) {
  if (rad < 0.6) return;
  const l = Math.sqrt(lx * lx + ly * ly) || 1, A = g.globalAlpha;
  lx /= l; ly /= l;
  g.save(); g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.clip();
  const gr = g.createRadialGradient(x + lx * rad * 0.45, y + ly * rad * 0.45, rad * 0.05, x, y, rad * 1.05);
  gr.addColorStop(0, ton[0]); gr.addColorStop(0.55, ton[1]); gr.addColorStop(1, ton[2]);
  g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  g.globalCompositeOperation = "multiply"; g.globalAlpha = A * 0.75; gedreht(g, flecken, x, y, rad * 2.8, dreht);
  g.globalAlpha = A * 0.5; gedreht(g, netz, x, y, rad * 2.6, dreht * 1.3 + 1);
  g.globalCompositeOperation = "source-over"; g.globalAlpha = A;
  const schatten = g.createLinearGradient(x + lx * rad, y + ly * rad, x - lx * rad, y - ly * rad);
  schatten.addColorStop(0, "rgba(0,0,0,0)"); schatten.addColorStop(0.55, "rgba(0,0,0,0.15)"); schatten.addColorStop(1, "rgba(0,0,0,0.88)");
  g.fillStyle = schatten; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  g.restore();
}

// die Karte läuft ohne Naht ganz herum: Die zweite Hälfte ist die erste, gespiegelt
const erdkarte = (() => {
  const t = rauschen(256, 41, 3, 5, "roh"), nb = rauschen(256, 43, 5, 4, "roh"), n = 256;
  const l = leinwand(n * 2, n), cx = l.getContext("2d"), img = cx.createImageData(n * 2, n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n * 2; x++) {
    const i = y * n + (x < n ? x : 2 * n - 1 - x), h = t.rohwerte[i], wolke = nb.rohwerte[i], k = (y * n * 2 + x) * 4, lat = Math.abs(y / n - 0.5) * 2;
    const col = h > 0.56 ? (lat > 0.82 ? [236, 240, 246] : h > 0.66 ? [124, 104, 72] : [62, 120, 58]) : [18 + 30 * h, 62 + 60 * h, 140 + 80 * h];
    const cl = Math.max(0, Math.min(1, (wolke - 0.55) * 4));
    img.data[k] = misch(col[0], 245, cl); img.data[k + 1] = misch(col[1], 248, cl); img.data[k + 2] = misch(col[2], 252, cl); img.data[k + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  return l;
})();

// Die Erde: ihre Meere, Kontinente und Wolken, die sich drehen (dreht von 0 bis 1 ist eine ganze Umdrehung), ihre Nachtseite und der blaue
// Rand ihrer Atmosphäre.
export function erde(g, x, y, rad, dreht, lx = -1, ly = -0.15) {
  if (rad < 0.6) return;
  const l = Math.sqrt(lx * lx + ly * ly) || 1;
  lx /= l; ly /= l;
  g.save();
  const halo = g.createRadialGradient(x, y, rad * 0.95, x, y, rad * 1.18);
  halo.addColorStop(0, "rgba(120,180,255,0.55)"); halo.addColorStop(1, "rgba(120,180,255,0)");
  g.fillStyle = halo; g.beginPath(); g.arc(x, y, rad * 1.18, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.clip();
  const w = rad * 4, h = rad * 2, off = ((((dreht % 1) + 1) % 1)) * w;
  g.drawImage(erdkarte, x - rad - off, y - rad, w, h); g.drawImage(erdkarte, x - rad - off + w, y - rad, w, h);
  const esf = g.createRadialGradient(x - rad * 0.3, y - rad * 0.35, rad * 0.1, x, y, rad);
  esf.addColorStop(0, "rgba(255,255,255,0.18)"); esf.addColorStop(0.7, "rgba(0,0,0,0)"); esf.addColorStop(1, "rgba(0,10,30,0.55)");
  g.fillStyle = esf; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  const schatten = g.createLinearGradient(x + lx * rad, y + ly * rad, x - lx * rad, y - ly * rad);
  schatten.addColorStop(0, "rgba(0,0,0,0)"); schatten.addColorStop(0.5, "rgba(0,0,0,0.1)"); schatten.addColorStop(1, "rgba(0,0,10,0.85)");
  g.fillStyle = schatten; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  g.restore();
}
