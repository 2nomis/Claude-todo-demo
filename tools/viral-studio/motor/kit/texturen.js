// Texturen aus Rauschen, einmal und mit einer Saat: die Körnung einer Oberfläche, eine Fleckung, das Lichtnetz am Grund
// eines Schwimmbeckens, ein Nebel. Sie werden über eine Form gemalt (mit "multiply" dunkeln sie ab, mit "screen" oder "lighter"
// hellen sie auf), damit nichts eine flache Farbe ist.
import { zufall, leinwand } from "./base.js";

const gespeichert = new Map();

// rauschen(n, saat, massstab, oktaven, modus): ein Graustufenbild von n × n.
//   modus "roh": das Rauschen, wie es ist · "flecken": kontrastreiche Fleckung · "linien": ein Netz aus feinen dunklen Linien
//   (Körnung, Fels, Haut) · "licht": helle Linien auf Schwarz (Licht im Wasser, Adern aus Licht).
// Das Bild trägt .rohwerte: die Werte von 0 bis 1, um eigene Karten zu machen (wie die der Erde).
export function rauschen(n, saat, massstab, oktaven, modus = "roh") {
  const k = [n, saat, massstab, oktaven, modus].join("-");
  if (gespeichert.has(k)) return gespeichert.get(k);
  const r = zufall(saat), G = 256, raster = new Float32Array(G * G);
  for (let i = 0; i < G * G; i++) raster[i] = r();
  const val = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, x0 = xi & 255, y0 = yi & 255, x1 = (xi + 1) & 255, y1 = (yi + 1) & 255;
    const a = raster[y0 * G + x0], b = raster[y0 * G + x1], c = raster[y1 * G + x0], e = raster[y1 * G + x1], u = xf * xf * (3 - 2 * xf), w = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * w + (a - b - c + e) * u * w;
  };
  const l = leinwand(n), cx = l.getContext("2d"), img = cx.createImageData(n, n), rohwerte = new Float32Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let s = 0, amp = 1, fr = massstab, tot = 0;
    for (let o = 0; o < oktaven; o++) { s += val((x * fr) / n, (y * fr) / n) * amp; tot += amp; amp *= 0.55; fr *= 2; }
    s /= tot; rohwerte[y * n + x] = s;
    const v = modus === "linien" ? 1 - 0.5 * Math.pow(1 - Math.min(1, Math.abs(2 * s - 1) * 4.5), 2)
      : modus === "flecken" ? Math.max(0, Math.min(1, (s - 0.5) * 2.2 + 0.5))
      : modus === "licht" ? Math.pow(Math.max(0, 1 - Math.abs(2 * s - 1) * 5), 2.2) : s;
    const q = (y * n + x) * 4;
    img.data[q] = img.data[q + 1] = img.data[q + 2] = Math.round(255 * v); img.data[q + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  l.rohwerte = rohwerte;
  gespeichert.set(k, l);
  return l;
}

// Eine graue Textur mit einer Farbe tönen ("multiply"): nützlich, um Licht oder Flecken Farbe zu geben.
export function toenen(src, color) {
  const t = leinwand(src.width, src.height), c = t.getContext("2d");
  c.drawImage(src, 0, 0); c.globalCompositeOperation = "multiply"; c.fillStyle = color; c.fillRect(0, 0, src.width, src.height);
  return t;
}

// Die üblichen, schon fertig.
export const netz = rauschen(768, 11, 15, 3, "linien");       // feine Maserung
export const netz2 = rauschen(512, 17, 24, 2, "linien");      // noch feiner, zum Mischen mit dem anderen
export const flecken = rauschen(384, 23, 6, 4, "flecken"); // Fleckung
// Das Lichtnetz, das sich am Grund eines Schwimmbeckens bewegt (oder in einer dichten Atmosphäre), bläulich weiß auf Schwarz.
export const kaustik = toenen(rauschen(640, 51, 7, 3, "licht"), "rgb(170,225,255)");
