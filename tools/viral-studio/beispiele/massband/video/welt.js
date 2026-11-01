// Was die Einstellungen teilen: der Haken des Maßbands in 3D (ein L aus Blech mit drei Nieten in Langlöchern), das Band, das
// Gehäuse des Maßbands, das Brett, die Wand, die Markierungen (die Nullebene, die Lücke so dick wie der Haken, Pfeile, Ringe) und die Kamera.
// Einheiten: Millimeter. Das Band läuft nach +x; die Null des Bands ist bei x = tx (sein Versatz in der Welt).
import * as k from "#kit";
import { createCanvas } from "@napi-rs/canvas";

export const T = 2;                 // Dicke des Hakens (ein wenig übertrieben, damit man sie sieht)
const W = 24, L = 22, H = 15, R = 2.6;
export const RIV = [[6.5, -5.5], [6.5, 5.5], [13.5, 0]]; // Nieten, auf dem Band (x, z)
const RR = 1.75;

// ---------- Kamera ----------
// Eine Ansicht: worauf sie schaut (m), aus welchem Winkel (yaw um y, 0 = von +z; pitch nach oben), in welcher
// Entfernung und mit welchem Maßstab (px pro mm am angeschauten Punkt). Sie werden Zahl für Zahl ohne Ruckeln gemischt.
export function kamera(s) {
  const d = [Math.sin(s.yaw) * Math.cos(s.pitch), Math.sin(s.pitch), Math.cos(s.yaw) * Math.cos(s.pitch)];
  const pos = k.sum(s.m, k.mal(d, s.dist));
  const c = k.blicktAuf(pos, s.m); c.F = s.esc * s.dist; c.dx = s.dx ?? 0; c.dy = s.dy ?? 0;
  return c;
}
export function mischAnsicht(a, b, u) {
  return {
    m: k.mischV(a.m, b.m, u), yaw: k.misch(a.yaw, b.yaw, u), pitch: k.misch(a.pitch, b.pitch, u),
    dist: Math.exp(k.misch(Math.log(a.dist), Math.log(b.dist), u)), esc: Math.exp(k.misch(Math.log(a.esc), Math.log(b.esc), u)),
    dx: k.misch(a.dx ?? 0, b.dx ?? 0, u), dy: k.misch(a.dy ?? 0, b.dy ?? 0, u),
  };
}
// Ansichtsroute: [[t, ansicht], ...]. Geht durch jeden Stützpunkt, ohne dazwischen zu bremsen (monotone Kurve: kein Überschwingen); sie
// hält nur, wo zwei aufeinanderfolgende Stützpunkte gleich sind, und am Anfang und am Ende.
export function ansichtsRoute(liste) {
  const feld = (f) => k.stuetzpunkte(liste.map(([t, v]) => [t, f(v)]));
  const m = [0, 1, 2].map((i) => feld((v) => v.m[i])), yaw = feld((v) => v.yaw), pitch = feld((v) => v.pitch);
  const dist = feld((v) => Math.log(v.dist)), esc = feld((v) => Math.log(v.esc)), dx = feld((v) => v.dx ?? 0), dy = feld((v) => v.dy ?? 0);
  const t0 = liste[0][0], t1 = liste[liste.length - 1][0];
  return (t) => {
    const u = Math.max(t0, Math.min(t1, t));
    return { m: m.map((f) => f(u)), yaw: yaw(u), pitch: pitch(u), dist: Math.exp(dist(u)), esc: Math.exp(esc(u)), dx: dx(u), dy: dy(u) };
  };
}
const cs = (c, X) => { const d = k.teil(X, c.p); return [k.pkt(d, c.e.r), k.pkt(d, c.e.u), k.pkt(d, c.e.f)]; };
const pc = (c, q) => ({ x: 540 + c.dx + (c.F * q[0]) / q[2], y: 960 + c.dy - (c.F * q[1]) / q[2], z: q[2] });
export function P(c, X) { const q = cs(c, X); return q[2] < 1 ? null : pc(c, q); }
// Projiziert ein Polygon und schneidet es vor der Kamera ab.
function poli(c, pts) {
  const q = pts.map((X) => cs(c, X)), out = [], N = 2;
  for (let i = 0; i < q.length; i++) {
    const a = q[i], b = q[(i + 1) % q.length];
    if (a[2] >= N) out.push(a);
    if ((a[2] >= N) !== (b[2] >= N)) { const u = (N - a[2]) / (b[2] - a[2]); out.push([k.misch(a[0], b[0], u), k.misch(a[1], b[1], u), N]); }
  }
  return out.map((p) => pc(c, p));
}
const pfad = (g, ps) => { g.beginPath(); ps.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); };

// ---------- Licht ----------
const LICHT = k.einh([-0.45, 0.85, 0.55]), RIM = k.einh([0.85, 0.25, -0.5]);
function ton(c, X, n, col, leuchten = 0.5, haerte = 40) {
  const lam = Math.max(0, k.pkt(n, LICHT)), rim = Math.max(0, k.pkt(n, RIM));
  const ansicht = k.einh(k.teil(c.p, X)), h = k.einh(k.sum(LICHT, ansicht));
  const sp = Math.pow(Math.max(0, k.pkt(n, h)), haerte) * leuchten;
  const f = 0.36 + 0.68 * lam;
  return [col[0] * f + 255 * sp + 45 * rim, col[1] * f + 255 * sp + 34 * rim, col[2] * f + 255 * sp + 20 * rim].map((x) => Math.min(255, Math.round(x)));
}
const rgb = (a, deck = 1) => `rgba(${a[0]},${a[1]},${a[2]},${deck})`;
const lum = (a) => a[0] * 0.3 + a[1] * 0.59 + a[2] * 0.11;

// ---------- Metall: eine Studiospiegelung ----------
const sm = (a, b, x) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
const S1 = k.einh([0.25, 0.8, -0.5]), S2 = k.einh([-0.8, 0, -0.6]), S3 = k.einh([0.8, 0, -0.6]), S4 = k.einh([0.05, 0.3, 1]), S5 = k.einh([0.75, 0.3, 0.6]);
// Was sich in Richtung R spiegelt (0-1 pro Kanal): grauer Himmel, eine große Softbox oben links, ein
// senkrechter Streifen links hinten, ein warmer Streifen rechts hinten und ein weiches Fülllicht vorne.
function umfeld(R) {
  const y = R[1];
  let v = 0.09 + 0.36 * sm(-0.3, 0.95, y);
  const zuf = Math.hypot(R[0], R[2]) || 1, hx = R[0] / zuf, hz = R[2] / zuf;
  const vert = sm(-0.35, 0.05, y) * (1 - sm(0.55, 0.85, y));
  const s1 = sm(0.72, 0.97, k.pkt(R, S1)) * 1.25;
  const s2 = sm(0.88, 0.975, hx * S2[0] + hz * S2[2]) * vert * 1.0;
  const s3 = sm(0.95, 0.99, hx * S3[0] + hz * S3[2]) * sm(-0.3, 0, y) * (1 - sm(0.2, 0.45, y)) * 0.55;
  const s4 = sm(0.55, 0.95, k.pkt(R, S4)) * 0.3;
  const s5 = sm(0.45, 0.95, k.pkt(R, S5)) * 0.28;
  const boden = y < 0 ? 0.04 * sm(0, -0.6, y) : 0;
  return [v + s1 + s2 + s3 * 1.0 + s4 + s5 + boden * 1.4, v + s1 + s2 + s3 * 0.72 + s4 + s5 + boden, v * 1.04 + s1 + s2 * 1.02 + s3 * 0.42 + s4 * 1.02 + s5 * 1.04 + boden * 0.6];
}
function metallton(c, X, n, col) {
  const V = k.einh(k.teil(X, c.p)), R = k.teil(V, k.mal(n, 2 * k.pkt(V, n)));
  const e = umfeld(R), lam = Math.max(0, k.pkt(n, LICHT));
  const roete = Math.max(0, Math.min(1, (col[0] - col[2] + 11) / 139));
  const fres = 0.75 + 0.25 * Math.pow(1 - Math.abs(k.pkt(V, n)), 3);
  const stahl = e.map((x, i) => (x * fres * 0.88 + 0.07 + lam * 0.1) * (col[i] / 182));
  const malC = e.map((x, i) => (col[i] / 255) * (0.16 + 0.72 * lam) + Math.max(0, x - 0.5) * 0.5 + 0.02);
  return stahl.map((x, i) => Math.max(0, Math.min(255, Math.round(255 * k.misch(x, malC[i], roete)))));
}
const pool = new Map();
function leinwandPool(w, h) { const kk = w + "x" + h; let cv = pool.get(kk); if (!cv) { cv = createCanvas(w, h); pool.set(kk, cv); } return cv; }
// Eine Metallfläche: ihre Spiegelung auf einem Raster berechnet und perspektivisch gesetzt (glatt, ohne Stufen).
function maleMetall(g, c, f, col, deck, rect) {
  const q = rect ?? f.p, pq = q.map((X) => P(c, X));
  if (pq.some((p) => !p)) return false;
  const su = Math.max(Math.hypot(pq[1].x - pq[0].x, pq[1].y - pq[0].y), Math.hypot(pq[2].x - pq[3].x, pq[2].y - pq[3].y));
  const sv = Math.max(Math.hypot(pq[3].x - pq[0].x, pq[3].y - pq[0].y), Math.hypot(pq[2].x - pq[1].x, pq[2].y - pq[1].y));
  const nu = Math.max(2, Math.min(48, Math.round(su / 12))), nv = Math.max(2, Math.min(48, Math.round(sv / 12)));
  const cv = leinwandPool(nu, nv), h = cv.getContext("2d"), im = h.createImageData(nu, nv), d = im.data;
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const u = i / (nu - 1), v = j / (nv - 1);
    const X = k.mischV(k.mischV(q[0], q[1], u), k.mischV(q[3], q[2], u), v);
    const n = f.vn && !rect ? k.einh(k.mischV(f.vn[0], f.vn[1], u)) : f.n;
    const t = metallton(c, X, n, col), o = (j * nu + i) * 4;
    d[o] = t[0]; d[o + 1] = t[1]; d[o + 2] = t[2]; d[o + 3] = 255;
  }
  h.putImageData(im, 0, 0);
  g.save(); g.globalAlpha *= deck;
  if (rect) { pfad(g, poli(c, f.p)); g.clip(); }
  // das Bild geht von Pixelmitte zu Pixelmitte
  texQuad(g, c, cv, q, 3, 3, 0.5 / nu, 1 - 0.5 / nu, 0.5 / nv, 1 - 0.5 / nv);
  g.restore();
  return true;
}

// Malt eine Fläche mit ihrem Licht: ein Verlauf von der hellsten Ecke zur dunkelsten.
function maleFlaeche(g, c, f, col, deck = 1, leuchten = 0.5, textur = 0.12, rect = null) {
  const ps = poli(c, f.p);
  if (ps.length < 3) return;
  const ts = f.p.map((X, i) => ton(c, X, f.vn ? f.vn[i] : f.n, col, leuchten));
  const p2 = f.p.map((X) => P(c, X));
  let iM = 0, im = 0;
  ts.forEach((x, i) => { if (lum(x) > lum(ts[iM])) iM = i; if (lum(x) < lum(ts[im])) im = i; });
  g.save(); g.globalAlpha *= deck;
  pfad(g, ps);
  if (p2[iM] && p2[im] && (Math.abs(p2[iM].x - p2[im].x) + Math.abs(p2[iM].y - p2[im].y)) > 2) {
    const gr = g.createLinearGradient(p2[iM].x, p2[iM].y, p2[im].x, p2[im].y);
    gr.addColorStop(0, rgb(ts[iM])); gr.addColorStop(1, rgb(ts[im]));
    g.fillStyle = gr; g.strokeStyle = gr;
  } else { g.fillStyle = rgb(ts[0]); g.strokeStyle = rgb(ts[0]); }
  g.fill(); g.lineWidth = 1.2; g.stroke();
  if (textur > 0 && area(ps) > 1500) {
    g.clip(); g.globalCompositeOperation = "soft-light"; g.globalAlpha = textur * deck;
    texQuad(g, c, gebuerstet, rect ?? f.p, 4, 3);
  }
  g.restore();
}
function area(ps) { let a = 0; for (let i = 0; i < ps.length; i++) { const p = ps[i], q = ps[(i + 1) % ps.length]; a += p.x * q.y - q.x * p.y; } return Math.abs(a / 2); }
function kiste(ps) { return { x0: Math.min(...ps.map((p) => p.x)), x1: Math.max(...ps.map((p) => p.x)), y0: Math.min(...ps.map((p) => p.y)), y1: Math.max(...ps.map((p) => p.y)) }; }
const blicktAuf_ = (c, f) => k.pkt(f.n, k.teil(c.p, f.p[0])) > 0;

// ---------- Texturen ----------
function tri(g, img, s0, s1, s2, d0, d1, d2) {
  const den = s0[0] * (s1[1] - s2[1]) + s1[0] * (s2[1] - s0[1]) + s2[0] * (s0[1] - s1[1]);
  if (Math.abs(den) < 1e-6) return;
  const a = (d0.x * (s1[1] - s2[1]) + d1.x * (s2[1] - s0[1]) + d2.x * (s0[1] - s1[1])) / den;
  const b = (d0.y * (s1[1] - s2[1]) + d1.y * (s2[1] - s0[1]) + d2.y * (s0[1] - s1[1])) / den;
  const cc = (d0.x * (s2[0] - s1[0]) + d1.x * (s0[0] - s2[0]) + d2.x * (s1[0] - s0[0])) / den;
  const d = (d0.y * (s2[0] - s1[0]) + d1.y * (s0[0] - s2[0]) + d2.y * (s1[0] - s0[0])) / den;
  const e = (d0.x * (s1[0] * s2[1] - s2[0] * s1[1]) + d1.x * (s2[0] * s0[1] - s0[0] * s2[1]) + d2.x * (s0[0] * s1[1] - s1[0] * s0[1])) / den;
  const f = (d0.y * (s1[0] * s2[1] - s2[0] * s1[1]) + d1.y * (s2[0] * s0[1] - s0[0] * s2[1]) + d2.y * (s0[0] * s1[1] - s1[0] * s0[1])) / den;
  const cx = (d0.x + d1.x + d2.x) / 3, cy = (d0.y + d1.y + d2.y) / 3, ex = (p) => ({ x: p.x + (p.x - cx) * 0.03 + Math.sign(p.x - cx) * 0.7, y: p.y + (p.y - cy) * 0.03 + Math.sign(p.y - cy) * 0.7 });
  const e0 = ex(d0), e1 = ex(d1), e2 = ex(d2);
  g.save(); g.beginPath(); g.moveTo(e0.x, e0.y); g.lineTo(e1.x, e1.y); g.lineTo(e2.x, e2.y); g.closePath(); g.clip();
  g.transform(a, b, cc, d, e, f); g.drawImage(img, 0, 0); g.restore();
}
// Ein Bild, gesetzt auf das 3D-Viereck q (q0 = Ecke (0,0) des Bildes, q1 = (w,0), q2 = (w,h), q3 = (0,h)).
// u0..u1, v0..v1: das Stück des Bildes (0-1).
export function texQuad(g, c, img, q, nu = 8, nv = 2, u0 = 0, u1 = 1, v0 = 0, v1 = 1) {
  const W_ = img.width, H_ = img.height;
  const pt = (u, v) => k.mischV(k.mischV(q[0], q[1], u), k.mischV(q[3], q[2], u), v);
  const pr = [];
  for (let j = 0; j <= nv; j++) { pr.push([]); for (let i = 0; i <= nu; i++) pr[j].push(P(c, pt(i / nu, j / nv))); }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const a = pr[j][i], b = pr[j][i + 1], cc = pr[j + 1][i + 1], d = pr[j + 1][i];
    if (!a || !b || !cc || !d) continue;
    const su = (x) => (u0 + (u1 - u0) * x) * W_, sv = (y) => (v0 + (v1 - v0) * y) * H_;
    const A = [su(i / nu), sv(j / nv)], B = [su((i + 1) / nu), sv(j / nv)], C = [su((i + 1) / nu), sv((j + 1) / nv)], D = [su(i / nu), sv((j + 1) / nv)];
    tri(g, img, A, B, C, a, b, cc); tri(g, img, A, C, D, a, cc, d);
  }
}
// Der Schatten einer texturierten Fläche: ein schwarzer Schleier je nach ihrem Licht.
function schleier(g, c, f, deck = 1) {
  const ps = poli(c, f.p); if (ps.length < 3) return;
  const ts = f.p.map((X) => { const lam = Math.max(0, k.pkt(f.n, LICHT)), vv = k.einh(k.teil(c.p, X)), sp = Math.pow(Math.max(0, k.pkt(f.n, k.einh(k.sum(LICHT, vv)))), 30) * 0.1; const x = Math.min(255, Math.round(255 * (0.5 + 0.55 * lam + sp))); return [x, x, x]; });
  const p2 = f.p.map((X) => P(c, X));
  let iM = 0, im = 0; ts.forEach((x, i) => { if (lum(x) > lum(ts[iM])) iM = i; if (lum(x) < lum(ts[im])) im = i; });
  g.save(); g.globalCompositeOperation = "multiply"; g.globalAlpha *= deck; pfad(g, ps);
  if (p2[iM] && p2[im]) { const gr = g.createLinearGradient(p2[iM].x, p2[iM].y, p2[im].x, p2[im].y); gr.addColorStop(0, rgb(ts[iM])); gr.addColorStop(1, rgb(ts[im])); g.fillStyle = gr; }
  else g.fillStyle = rgb(ts[0]);
  g.fill(); g.restore();
}

// Das Band: gelb, mit Millimetern und den Zahlen für jeden Zentimeter.
const MMPX = 12, LAENGE = 420;
export const bandBild = (() => {
  const w = LAENGE * MMPX, h = 19 * MMPX, cv = createCanvas(w, h), g = cv.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#f2cf3c"); gr.addColorStop(0.5, "#fbe25a"); gr.addColorStop(1, "#e9c22e");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.globalAlpha = 0.18; g.globalCompositeOperation = "multiply"; g.drawImage(k.netz2, 0, 0, w, h); g.drawImage(k.netz2, 512, 0, w, h);
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.fillStyle = "#1d1a12";
  for (let mm = 0; mm <= LAENGE; mm++) {
    const x = mm * MMPX, l = mm % 10 === 0 ? 0.42 : mm % 5 === 0 ? 0.3 : 0.18;
    g.fillRect(x - 1.2, 0, 2.4, h * l); g.fillRect(x - 1.2, h * (1 - l), 2.4, h * l);
  }
  g.font = `bold ${Math.round(h * 0.36)}px Helvetica, Arial`; g.textAlign = "center"; g.textBaseline = "middle";
  for (let cm = 1; cm * 10 <= LAENGE; cm++) { g.fillStyle = cm % 10 === 0 ? "#c4161c" : "#1d1a12"; g.fillText(String(cm), cm * 10 * MMPX - (cm < 10 ? 0 : 0) + 16, h / 2); }
  return cv;
})();

function rauschLeinwand(w, h, saat, fn) {
  const cv = createCanvas(w, h), g = cv.getContext("2d"); fn(g, k.zufall(saat), w, h); return cv;
}
// Gebürstetes Metall: feine Kratzer in Längsrichtung, mittelgrau (aufgetragen mit "soft-light").
export const gebuerstet = (() => {
  const w = 1024, h = 512, cv = createCanvas(w, h), g = cv.getContext("2d"), r = k.zufall(31);
  g.fillStyle = "#808080"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) {
    const y = r() * h, l = 80 + r() * 700, x = r() * w - 100, v = Math.round(128 + (r() - 0.5) * 120);
    g.fillStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.4})`; g.fillRect(x, y, l, 0.6 + r() * 1.2);
  }
  return cv;
})();
// Feines Pixelrauschen (für Beton und Holz).
function koernung(g, w, h, r, staerke) {
  const d = g.getImageData(0, 0, w, h), a = d.data;
  for (let i = 0; i < a.length; i += 4) { const n = (r() - 0.5) * staerke; a[i] += n; a[i + 1] += n; a[i + 2] += n; }
  g.putImageData(d, 0, 0);
}
// Holz: lange Maserung.
export const holzLang = rauschLeinwand(2048, 512, 7, (g, r, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#ecd2a2"); gr.addColorStop(0.3, "#e4c48f"); gr.addColorStop(0.55, "#efd6a8"); gr.addColorStop(0.8, "#e2c08a"); gr.addColorStop(1, "#ead0a0");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  // Bänder aus Jahresringen (dunkler), weich
  for (let i = 0; i < 26; i++) {
    const y0 = r() * h, a = 1 + r() * 4, f = 0.0012 + r() * 0.002, ph = r() * 9, an = 3 + r() * 9;
    g.strokeStyle = `rgba(176,122,62,${0.12 + r() * 0.16})`; g.lineWidth = an;
    g.beginPath(); for (let x = 0; x <= w; x += 16) { const y = y0 + Math.sin(x * f + ph) * a; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }
  // feine Maserung
  for (let i = 0; i < 220; i++) {
    const y0 = r() * h, a = 0.5 + r() * 2.5, f = 0.0015 + r() * 0.003, ph = r() * 9;
    g.strokeStyle = `rgba(150,98,48,${0.08 + r() * 0.2})`; g.lineWidth = 0.5 + r() * 1.1;
    g.beginPath(); for (let x = 0; x <= w; x += 16) { const y = y0 + Math.sin(x * f + ph) * a; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }
  // Poren
  for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(120,80,40,${0.1 + r() * 0.2})`; g.fillRect(r() * w, r() * h, 2 + r() * 6, 0.8); }
  koernung(g, w, h, r, 10);
});
// Holz: das Hirnholz, in Schichten.
export const holzStirn = rauschLeinwand(800, 800, 9, (g, r, w, h) => {
  g.fillStyle = "#e9cf9f"; g.fillRect(0, 0, w, h);
  // Jahresringe: Bögen um eine Mitte unterhalb des Stücks
  const cx = w * 0.35, cy = h * 1.9;
  for (let rad = 60; rad < 2400; rad += 9 + r() * 16) {
    g.strokeStyle = `rgba(170,115,58,${0.16 + r() * 0.22})`; g.lineWidth = 1 + r() * 3;
    g.beginPath(); g.arc(cx + (r() - 0.5) * 6, cy, rad, 0, Math.PI * 2); g.stroke();
  }
  const vg = g.createLinearGradient(0, 0, 0, h); vg.addColorStop(0, "rgba(255,240,210,0.25)"); vg.addColorStop(1, "rgba(120,80,40,0.12)");
  g.fillStyle = vg; g.fillRect(0, 0, w, h);
  koernung(g, w, h, r, 12);
});
// Heller Beton mit Poren.
export const beton = rauschLeinwand(900, 900, 13, (g, r, w, h) => {
  g.fillStyle = "#d3d6da"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h, rr = 60 + r() * 180, gg = g.createRadialGradient(x, y, 0, x, y, rr); const v = r() < 0.5 ? "255,255,255" : "120,125,132"; gg.addColorStop(0, `rgba(${v},0.06)`); gg.addColorStop(1, `rgba(${v},0)`); g.fillStyle = gg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  koernung(g, w, h, r, 16);
  for (let i = 0; i < 160; i++) { const x = r() * w, y = r() * h, rr = 0.8 + r() * 2.2; g.fillStyle = `rgba(90,95,102,${0.35 + r() * 0.4})`; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.arc(x + rr * 0.4, y + rr * 0.5, rr * 0.6, 0, 7); g.fill(); }
});

// ---------- der Haken ----------
function profil() {
  const pts = [], N = 7;
  pts.push({ x: L, y: T });
  for (let i = 0; i <= N; i++) { const a = Math.PI / 2 + (Math.PI / 2) * i / N; pts.push({ x: R + R * Math.cos(a), y: T - R + R * Math.sin(a), n: [Math.cos(a), Math.sin(a)] }); }
  pts.push({ x: 0, y: -H }); pts.push({ x: T, y: -H });
  for (let i = 0; i <= N; i++) { const a = Math.PI - (Math.PI / 2) * i / N; pts.push({ x: R + (R - T) * Math.cos(a), y: T - R + (R - T) * Math.sin(a), n: [-Math.cos(a), -Math.sin(a)] }); }
  pts.push({ x: L, y: 0 });
  return pts;
}
const PROFIL = profil();
const GESICHTER = (() => {
  const f = [], z0 = -W / 2, z1 = W / 2;
  for (let i = 0; i < PROFIL.length; i++) {
    const a = PROFIL[i], b = PROFIL[(i + 1) % PROFIL.length];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy); if (l < 1e-6) continue;
    const n = [dy / l, -dx / l, 0];
    const na = a.n && b.n ? [a.n[0], a.n[1], 0] : n, nb = a.n && b.n ? [b.n[0], b.n[1], 0] : n;
    f.push({ p: [[a.x, a.y, z0], [b.x, b.y, z0], [b.x, b.y, z1], [a.x, a.y, z1]], n, vn: [na, nb, nb, na], seite: i });
  }
  f.push({ p: PROFIL.map((q) => [q.x, q.y, z1]), n: [0, 0, 1], deckel: true });
  f.push({ p: PROFIL.map((q) => [q.x, q.y, z0]).reverse(), n: [0, 0, -1], deckel: true });
  return f;
})();
const bewegt = (p, d) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];

export const GRAU = [176, 180, 187], ROT = [222, 64, 76], STRAHLEN = [150, 225, 215];

// Die Szene: o = { tx (Null des Bands), s (Spiel des Hakens, -T..0), color, strahlen (0-1, durchsichtig),
//   brett: x seiner Kante | null, wand: x ihrer Fläche | null, massbandGehaeuse (0-1), ohneBand }
export function szene(g, c, o) {
  const tx = o.tx ?? 0, s = o.s ?? 0, hx = tx + s, col = o.color ?? GRAU, xr = o.strahlen ?? 0;
  if (o.wand != null) wand(g, c, o.wand, o.wandZ ?? 0);
  if (o.brett != null) brett(g, c, o.brett, o.brettY ?? 0);
  if (!o.ohneBand) {
    if (o.brett != null) schatten(g, c, [[tx + 3, -0.45, -10.5], [tx + 400, -0.45, -10.5], [tx + 400, -0.45, 11.5], [tx + 3, -0.45, 11.5]], 0.35, 0.8);
    band(g, c, tx, o.massbandGehaeuse ? 112 : LAENGE - 5);
  }
  if (o.massbandGehaeuse) massbandGehaeuse(g, c, tx);
  // Kontaktschatten: unter der Platte und, wenn es ein Brett oder eine Wand gibt, der Schatten der Lippe auf ihrer Fläche
  if (xr < 0.98) {
    const so = 1 - xr;
    schatten(g, c, [[hx - 0.6, 0.01, -W / 2 - 0.8], [hx + L + 1.2, 0.01, -W / 2 - 0.8], [hx + L + 1.2, 0.01, W / 2 + 0.8], [hx - 0.6, 0.01, W / 2 + 0.8]], 0.45 * so, 0.9);
    if (o.brett != null) schatten(g, c, [[o.brett - 0.02, 0, -W / 2 - 1], [o.brett - 0.02, 0, W / 2 + 1.5], [o.brett - 0.02, -H - 1.5, W / 2 + 1.5], [o.brett - 0.02, -H - 1.5, -W / 2 - 1]], 0.5 * so, 1.2);
  }
  // der Haken
  const flaechen = GESICHTER.map((f) => ({ ...f, p: f.p.map((p) => bewegt(p, [hx, 0, 0])) }))
    .filter((f) => xr > 0.02 || blicktAuf_(c, f))
    .map((f) => ({ f, z: f.p.reduce((a, p) => a + cs(c, p)[2], 0) / f.p.length }));
  flaechen.sort((a, b) => b.z - a.z);
  const deck = 1 - 0.62 * xr, cc = col.map((x, i) => k.misch(x, STRAHLEN[i], xr));
  for (const { f } of flaechen) {
    if (xr > 0.02 && !blicktAuf_(c, f)) { maleFlaeche(g, c, f, cc, deck * 0.6, 0.2, 0); continue; }
    const rect = f.deckel ? (f.n[2] > 0 ? [[hx, T, W / 2], [hx + L, T, W / 2], [hx + L, -H, W / 2], [hx, -H, W / 2]] : [[hx + L, T, -W / 2], [hx, T, -W / 2], [hx, -H, -W / 2], [hx + L, -H, -W / 2]]) : null;
    if (xr > 0.02) maleFlaeche(g, c, f, cc, deck * xr, 0.6, 0, rect);
    if (xr < 0.98 && !maleMetall(g, c, f, col, deck * (1 - xr), rect)) maleFlaeche(g, c, f, cc, deck, 0.6, 0, rect);
    // das Bürsten, obendrauf
    if (xr < 0.98 && f.p.length === 4 || rect) {
      const ps = poli(c, f.p);
      if (ps.length > 2 && area(ps) > 1500) { g.save(); pfad(g, ps); g.clip(); g.globalCompositeOperation = "soft-light"; g.globalAlpha *= 0.45 * deck * (1 - xr); texQuad(g, c, gebuerstet, rect ?? f.p, 4, 3); g.restore(); }
    }
  }
  // helle Kanten der Deckel
  g.save(); g.lineJoin = "round";
  for (const { f } of flaechen) if (f.deckel && blicktAuf_(c, f)) {
    const ps = poli(c, f.p); pfad(g, ps);
    g.strokeStyle = `rgba(255,252,246,${0.35 + 0.4 * xr})`; g.lineWidth = 2.2; g.stroke();
    g.strokeStyle = `rgba(255,255,255,${0.12})`; g.lineWidth = 6; g.stroke();
  }
  g.restore();
  // das Nagelloch, auf der Außenfläche
  const draussen = { n: [-1, 0, 0], p: [[hx, 0, 0]] };
  if (blicktAuf_(c, draussen) || xr > 0.02) {
    const pts = [], rr = 1.25;
    for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (Math.PI * i) / 12; pts.push([hx - 0.02, -9.5 + Math.sin(a) * rr, -2.4 + Math.cos(a) * rr]); }
    for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 12; pts.push([hx - 0.02, -9.5 + Math.sin(a) * rr, 2.4 + Math.cos(a) * rr]); }
    luecke(g, c, pts, [hx - 0.02, -9.5 + rr, 0], [hx - 0.02, -9.5 - rr, 0], deck);
  }
  // Langlöcher und Nieten (die Nieten bewegen sich mit dem Band; die Langlöcher mit dem Haken)
  const oben = c.p[1] > T;
  for (const [rx, rz] of RIV) {
    if (oben || xr > 0.02) {
      const pts = [], ya = T + 0.02, m = RR + 0.18; // das Langloch bewegt sich mit dem Haken: Die Niete passt von einem Ende zum anderen
      for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (Math.PI * i) / 12; pts.push([hx + rx + Math.cos(a) * m, ya, rz + Math.sin(a) * m]); }
      for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 12; pts.push([hx + rx + T + Math.cos(a) * m, ya, rz + Math.sin(a) * m]); }
      luecke(g, c, pts, [hx + rx + T / 2, ya, rz - m], [hx + rx + T / 2, ya, rz + m], deck);
    }
    niete(g, c, [tx + rx, T, rz]);
  }
}

// Ein Loch im Blech: tief und dunkel, mit Schatten an der beleuchteten Kante und einem Lichtrand an der gegenüberliegenden.
function luecke(g, c, pts, Alicht, Aschatten, deck) {
  const ps = poli(c, pts); if (ps.length < 3) return;
  const a = P(c, Alicht), b = P(c, Aschatten);
  g.save(); g.globalAlpha *= deck; pfad(g, ps);
  if (a && b) { const gr = g.createLinearGradient(a.x, a.y, b.x, b.y); gr.addColorStop(0, "#15171a"); gr.addColorStop(0.55, "#2c2f34"); gr.addColorStop(1, "#4a4e55"); g.fillStyle = gr; } else g.fillStyle = "#2a2d31";
  g.fill(); g.clip();
  g.strokeStyle = "rgba(0,0,0,0.55)"; g.lineWidth = 5; g.stroke();
  g.restore();
  g.save(); g.globalAlpha *= deck; pfad(g, ps); g.strokeStyle = "rgba(255,255,255,0.32)"; g.lineWidth = 1.2; g.stroke(); g.restore();
}
// Ein weicher Schatten auf dem Boden: das Polygon, weichgezeichnet.
function schatten(g, c, pts, deck, mm = 1) {
  const ps = poli(c, pts); if (ps.length < 3 || deck <= 0.003) return;
  const cen = P(c, pts[0]); if (!cen) return;
  const px = Math.max(2, Math.min(40, (c.F / cen.z) * mm));
  g.save(); g.filter = `blur(${px.toFixed(1)}px)`; g.globalAlpha *= deck; pfad(g, ps); g.fillStyle = "#000"; g.fill(); g.restore();
}

function niete(g, c, B) {
  const ring = (rho, y) => { const out = []; for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; const p = P(c, [B[0] + Math.cos(a) * RR * rho, B[1] + y, B[2] + Math.sin(a) * RR * rho]); if (p) out.push(p); } return out; };
  const pts = [...ring(1, 0), ...ring(0.8, 0.6), ...ring(0.45, 1.0), ...ring(0.05, 1.15)];
  if (pts.length < 6) return;
  const hull = huellkurve(pts);
  const cen = P(c, [B[0], B[1] + 0.6, B[2]]), licht = P(c, [B[0] + LICHT[0] * RR * 0.6, B[1] + 0.9, B[2] + LICHT[2] * RR * 0.6]);
  if (!cen || !licht) return;
  const rad = Math.max(...hull.map((p) => Math.hypot(p.x - cen.x, p.y - cen.y)));
  g.save(); pfad(g, hull);
  const gr = g.createRadialGradient(licht.x, licht.y, 0, cen.x, cen.y, rad * 1.05);
  gr.addColorStop(0, "#fffbe6"); gr.addColorStop(0.12, "#ffe58a"); gr.addColorStop(0.4, "#e3ad35"); gr.addColorStop(0.78, "#9a6512"); gr.addColorStop(1, "#4d3008");
  g.fillStyle = gr; g.fill(); g.strokeStyle = "rgba(60,36,6,0.7)"; g.lineWidth = 1.2; g.stroke();
  g.clip(); g.globalCompositeOperation = "lighter";
  const bri = g.createRadialGradient(licht.x, licht.y, 0, licht.x, licht.y, rad * 0.32); bri.addColorStop(0, "rgba(255,255,245,0.95)"); bri.addColorStop(0.4, "rgba(255,240,200,0.35)"); bri.addColorStop(1, "rgba(255,230,180,0)");
  g.fillStyle = bri; g.fillRect(licht.x - rad, licht.y - rad, rad * 2, rad * 2);
  const ab = P(c, [B[0] + RR * 0.55, B[1] + 0.3, B[2] - RR * 0.55]);
  if (ab) { const r2 = g.createRadialGradient(ab.x, ab.y, 0, ab.x, ab.y, rad * 0.5); r2.addColorStop(0, "rgba(255,190,110,0.35)"); r2.addColorStop(1, "rgba(255,190,110,0)"); g.fillStyle = r2; g.fillRect(ab.x - rad, ab.y - rad, rad * 2, rad * 2); }
  g.restore();
}
function huellkurve(ps) {
  const p = ps.slice().sort((a, b) => a.x - b.x || a.y - b.y), cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

function band(g, c, tx, laenge) {
  const y = 0, z = 9.5, xa = tx + 3, xb = tx + laenge;
  // Kante
  const brettkante = { n: [0, 0, 1], p: [[xa, y - 0.5, z], [xb, y - 0.5, z], [xb, y, z], [xa, y, z]] };
  if (blicktAuf_(c, brettkante)) maleFlaeche(g, c, brettkante, [190, 150, 30], 1, 0.2, 0);
  const sup = { n: [0, 1, 0], p: [[xa, y, -z], [xb, y, -z], [xb, y, z], [xa, y, z]] };
  if (!blicktAuf_(c, sup)) { maleFlaeche(g, c, { ...sup, n: [0, -1, 0] }, [170, 135, 30], 1, 0.1, 0); return; }
  const u0 = 3 / LAENGE, u1 = laenge / LAENGE;
  texQuad(g, c, bandBild, [[xa, y, -z], [xb, y, -z], [xb, y, z], [xa, y, z]], Math.max(8, Math.round(laenge / 8)), 2, u0, u1, 0, 1);
  schleier(g, c, sup, 0.6);
  for (const zz of [-z, z]) { const a = P(c, [xa, y, zz]), b = P(c, [xb, y, zz]); if (a && b) { g.save(); g.strokeStyle = "rgba(120,88,10,0.6)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.restore(); } }
  // Glanz auf der Wölbung des Bands
  const ps = poli(c, [[xa, y, -1.5], [xb, y, -1.5], [xb, y, 2.5], [xa, y, 2.5]]);
  if (ps.length > 2) { g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha = 0.18; pfad(g, ps); g.fillStyle = "#fff8d0"; g.fill(); g.restore(); }
}

// Eine Kiste mit texturierten Flächen: x0..x1, y0..y1, z0..z1; tex: { "+x": img, ... }
function baustein(g, c, x0, x1, y0, y1, z0, z1, tex, groesse, col) {
  const flaechen = [
    { k: "+y", n: [0, 1, 0], p: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] },
    { k: "-x", n: [-1, 0, 0], p: [[x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [x0, y0, z0]] },
    { k: "+x", n: [1, 0, 0], p: [[x1, y1, z1], [x1, y1, z0], [x1, y0, z0], [x1, y0, z1]] },
    { k: "+z", n: [0, 0, 1], p: [[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1]] },
    { k: "-z", n: [0, 0, -1], p: [[x1, y1, z0], [x0, y1, z0], [x0, y0, z0], [x1, y0, z0]] },
  ];
  for (const f of flaechen) {
    if (!blicktAuf_(c, f)) continue;
    const img = tex[f.k] ?? tex.def;
    const ps = poli(c, f.p); if (ps.length < 3) continue;
    g.save(); pfad(g, ps); g.fillStyle = rgb(col); g.fill(); g.clip();
    const la = k.laenge(k.teil(f.p[1], f.p[0])), lb = k.laenge(k.teil(f.p[3], f.p[0]));
    const ru = la / groesse, rv = lb / groesse;
    texQuad(g, c, img, f.p, Math.max(6, Math.min(30, Math.round(ru * 6))), Math.max(4, Math.min(16, Math.round(rv * 6))), 0, Math.min(1, ru), 0, Math.min(1, rv));
    g.restore();
    schleier(g, c, f, 0.55);
    g.save(); pfad(g, ps); g.strokeStyle = "rgba(255,248,235,0.28)"; g.lineWidth = 1.6; g.stroke(); g.restore();
  }
}
// Das Brett: seine Kante bei x = xc; das Band liegt obendrauf.
function brett(g, c, xc, dy = 0) {
  baustein(g, c, xc, xc + 600, -45 + dy, -0.5 + dy, -38, 38, { "+y": holzLang, "+z": holzLang, "-z": holzLang, "-x": holzStirn, def: holzLang }, 600, [220, 180, 120]);
}
// Die Wand: ihre Fläche bei x = xc.
function wand(g, c, xc, dz = 0) {
  baustein(g, c, xc - 90, xc, -110, 110, -70 + dz, 14.5 + dz, { def: beton }, 300, [200, 203, 207]);
}

// Das Gehäuse des Maßbands (für wenn die Kamera zurückzieht).
const feldKiste = (() => {
  const cv = createCanvas(600, 600), g = cv.getContext("2d");
  g.fillStyle = "#f4cf2a"; k.gerundet(g, 40, 40, 520, 520, 90); g.fill();
  const gr = g.createLinearGradient(0, 0, 600, 600); gr.addColorStop(0, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(0,0,0,0.15)"); g.fillStyle = gr; k.gerundet(g, 40, 40, 520, 520, 90); g.fill();
  g.fillStyle = "#17181b"; g.beginPath(); g.arc(300, 300, 175, 0, 7); g.fill();
  g.strokeStyle = "#f4cf2a"; g.lineWidth = 10; g.beginPath(); g.arc(300, 300, 150, 0, 7); g.stroke();
  g.fillStyle = "#f4cf2a"; g.font = "bold 120px Helvetica, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("5m", 300, 305);
  return cv;
})();
function massbandGehaeuse(g, c, tx) {
  const x0 = tx + 108, x1 = x0 + 66, y0 = -6, y1 = 60, z0 = -20, z1 = 20, r = 12;
  const tiefe = []; const ecken = [[x1 - r, y1 - r, 0], [x0 + r, y1 - r, 1], [x0 + r, y0 + r, 2], [x1 - r, y0 + r, 3]];
  for (const [cx, cy, q] of ecken) for (let i = 0; i <= 5; i++) { const a = (q * Math.PI) / 2 + (i / 5) * (Math.PI / 2); tiefe.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), n: [Math.cos(a), Math.sin(a)] }); }
  const flaechen = [];
  for (let i = 0; i < tiefe.length; i++) { const a = tiefe[i], b = tiefe[(i + 1) % tiefe.length]; const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy); if (l < 1e-6) continue; flaechen.push({ p: [[a.x, a.y, z0], [b.x, b.y, z0], [b.x, b.y, z1], [a.x, a.y, z1]], n: [dy / l, -dx / l, 0], vn: [[a.n[0], a.n[1], 0], [b.n[0], b.n[1], 0], [b.n[0], b.n[1], 0], [a.n[0], a.n[1], 0]] }); }
  flaechen.push({ p: tiefe.map((q) => [q.x, q.y, z1]), n: [0, 0, 1], deckel: 1 });
  for (const f of flaechen) if (blicktAuf_(c, f)) maleFlaeche(g, c, f, [38, 39, 43], 1, 0.6, 0.2);
  texQuad(g, c, feldKiste, [[x0 + 3, y1 - 3, z1 + 0.05], [x1 - 3, y1 - 3, z1 + 0.05], [x1 - 3, y0 + 3, z1 + 0.05], [x0 + 3, y0 + 3, z1 + 0.05]], 6, 6);
  schleier(g, c, { n: [0, 0, 1], p: [[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1]] }, 0.4);
}

// ---------- der Hintergrund ----------
const staubkoerner = (() => { const r = k.zufall(5), m = []; for (let i = 0; i < 40; i++) m.push([r() * 1080, r() * 1920, 0.6 + r() * 1.2, 0.04 + r() * 0.1]); return m; })();
export function hintergrund(g, cx = 540, cy = 1000, deck = 1) {
  const bg = g.createLinearGradient(0, 0, 0, 1920); bg.addColorStop(0, "#0c0c0f"); bg.addColorStop(1, "#08080a");
  g.fillStyle = bg; g.fillRect(0, 0, 1080, 1920);
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 980);
  gr.addColorStop(0, `rgba(132,92,44,${0.42 * deck})`); gr.addColorStop(0.35, `rgba(84,56,26,${0.26 * deck})`); gr.addColorStop(0.7, `rgba(30,22,14,${0.12 * deck})`); gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
  g.fillStyle = "#fff"; for (const [x, y, r, a] of staubkoerner) { g.globalAlpha = a * deck; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } g.globalAlpha = 1;
}
// Das Finish jedes Bildes: eine weiche Vignette und eine sehr feine Körnung.
const koernungBild = rauschLeinwand(540, 960, 77, (g, r, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); koernung(g, w, h, r, 26); });
const bloomA = createCanvas(270, 480), bloomB = createCanvas(270, 480);
export function fertig(g, t = 0) {
  // weiches Bloom: die hellsten Teile, weichgezeichnet und darübergelegt
  const a = bloomA.getContext("2d"); a.globalCompositeOperation = "copy"; a.drawImage(g.canvas, 0, 0, 270, 480);
  const im = a.getImageData(0, 0, 270, 480), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const l = Math.max(d[i], d[i + 1], d[i + 2]), f = Math.max(0, (l - 175) / 80); d[i] *= f; d[i + 1] *= f; d[i + 2] *= f; }
  a.putImageData(im, 0, 0);
  const b = bloomB.getContext("2d"); b.globalCompositeOperation = "copy"; b.filter = "blur(7px)"; b.drawImage(bloomA, 0, 0); b.filter = "none";
  g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha = 0.5; g.drawImage(bloomB, 0, 0, 1080, 1920); g.restore();
  g.save();
  const vg = g.createRadialGradient(540, 980, 520, 540, 980, 1250); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.42)");
  g.fillStyle = vg; g.fillRect(0, 0, 1080, 1920);
  g.globalCompositeOperation = "soft-light"; g.globalAlpha = 0.18;
  const o = Math.floor(t * 24) % 4; g.drawImage(koernungBild, -(o % 2) * 3, -Math.floor(o / 2) * 3, 1086, 1926);
  g.restore();
}

// ---------- Markierungen ----------
const TUERKIS = "110,255,215", GOLDTON = "232,182,70", ROT_RGB = "255,72,72";
export { TUERKIS, GOLDTON, ROT_RGB };
// Die Nullebene: senkrecht bei x = zx, mit ihrer «0» obendrauf.
export function nullEbene(g, c, zx, u, color = TUERKIS, etikett = 1, hoch = [-20, 7], breite = 16) {
  if (u <= 0.003) return;
  const y0 = hoch[0], y1 = k.misch(y0, hoch[1], k.kommtRein(Math.min(1, u * 1.4)));
  const q = [[zx, y1, -breite], [zx, y1, breite], [zx, y0, breite], [zx, y0, -breite]];
  const ps = poli(c, q); if (ps.length < 3) return;
  g.save(); g.globalAlpha *= Math.min(1, u * 2);
  pfad(g, ps); g.fillStyle = `rgba(${color},0.16)`; g.fill();
  g.lineJoin = "round"; g.strokeStyle = `rgba(${color},0.35)`; g.lineWidth = 12; g.stroke();
  g.strokeStyle = `rgba(${color},1)`; g.lineWidth = 4.5; g.stroke();
  g.restore();
  if (etikett > 0) null_(g, c, [zx, hoch[1] + 4, -breite + 4], Math.min(1, u * 2) * etikett, color);
}
export function null_(g, c, X, deck, color = TUERKIS, groesse = 92) {
  const p = P(c, X); if (!p || deck <= 0.003) return;
  g.save(); g.globalAlpha *= deck; g.font = `600 ${groesse}px Helvetica, Arial`; g.textAlign = "center"; g.textBaseline = "middle";
  g.shadowColor = `rgba(${color},0.8)`; g.shadowBlur = 18; g.fillStyle = `rgba(${color},1)`; g.fillText("0", p.x, p.y);
  g.restore();
}
// Eine helle Linie zwischen zwei Punkten der Welt, gezeichnet von a nach b (u).
export function zeile(g, c, a, b, u, color = TUERKIS, breite = 5) {
  if (u <= 0.003) return;
  const pa = P(c, a), pb = P(c, k.mischV(a, b, Math.min(1, u))); if (!pa || !pb) return;
  g.save(); g.lineCap = "round"; g.strokeStyle = `rgba(${color},0.35)`; g.lineWidth = breite * 3; g.beginPath(); g.moveTo(pa.x, pa.y); g.lineTo(pb.x, pb.y); g.stroke();
  g.strokeStyle = `rgba(${color},1)`; g.lineWidth = breite; g.stroke(); g.restore();
}
// Ein Umriss-Rechteck auf der Ebene z = zz (die Lücke so dick wie der Haken).
export function rahmen(g, c, x0, x1, y0, y1, zz, u, color = GOLDTON, breite = 4) {
  if (u <= 0.003) return;
  const ps = poli(c, [[x0, y1, zz], [x1, y1, zz], [x1, y0, zz], [x0, y0, zz]]); if (ps.length < 3) return;
  g.save(); g.globalAlpha *= Math.min(1, u); pfad(g, ps); g.fillStyle = `rgba(${color},0.12)`; g.fill();
  g.strokeStyle = `rgba(${color},0.3)`; g.lineWidth = breite * 3; g.stroke(); g.strokeStyle = `rgba(${color},1)`; g.lineWidth = breite; g.stroke(); g.restore();
}
// Ein Ring, gezeichnet um (x, y).
export function reif(g, x, y, r, u, color = GOLDTON, deck = 1) {
  if (u <= 0.003 || deck <= 0.003) return;
  g.save(); g.globalAlpha *= deck; g.lineCap = "round";
  const a0 = -Math.PI / 2 - 0.4, a1 = a0 + Math.PI * 2 * Math.min(0.9999, u);
  g.strokeStyle = `rgba(${color},0.25)`; g.lineWidth = 16; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke();
  g.strokeStyle = `rgba(${color},1)`; g.lineWidth = 5; g.beginPath(); g.arc(x, y, r, a0, a1); g.stroke();
  g.restore();
}
// Ein weißer Pfeil, der in Richtung dir zeigt (dir: 1 rechts, -1 links).
export function pfeil(g, x, y, dir, deck) {
  if (deck <= 0.003) return;
  g.save(); g.globalAlpha *= deck; g.translate(x, y); g.scale(dir, 1);
  g.shadowColor = "rgba(0,0,0,0.55)"; g.shadowBlur = 18; g.shadowOffsetY = 4;
  const lg = g.createLinearGradient(-80, 0, 70, 0); lg.addColorStop(0, "rgba(255,255,255,0)"); lg.addColorStop(0.45, "rgba(255,255,255,0.95)"); lg.addColorStop(1, "#fff");
  g.strokeStyle = lg; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(-80, 0); g.lineTo(40, 0); g.stroke();
  g.fillStyle = "#fff"; g.lineJoin = "round"; g.beginPath(); g.moveTo(74, 0); g.lineTo(30, -28); g.quadraticCurveTo(40, 0, 30, 28); g.closePath(); g.fill();
  g.restore();
}

// ---------- Bewegung ----------
// Der Haken geht n Mal zwischen raus (-T) und rein (0) hin und her, ab t0, jede halbe Periode p. Gibt s und die Treffer zurück.
export function klappern(t, t0, n, p = 0.16, von = 0) {
  if (t <= t0) return von;
  const i = Math.floor((t - t0) / p), u = ((t - t0) % p) / p;
  if (i >= n) return n % 2 === 0 ? von : (von === 0 ? -T : 0);
  const a = i % 2 === 0 ? von : (von === 0 ? -T : 0), b = a === 0 ? -T : 0;
  return k.misch(a, b, k.sanft(Math.min(1, u * 1.6)));
}
export const klapperTreffer = (t0, n, p = 0.16) => Array.from({ length: n }, (_, i) => t0 + i * p + p / 1.6);

// Malt mit Unschärfe (für schnelle Kamerabewegungen).
const abseits = createCanvas(1080, 1920);
export function mitUnschaerfe(g, px, zeichnung) {
  if (px < 0.6) { zeichnung(g); return; }
  const h = abseits.getContext("2d"); h.setTransform(1, 0, 0, 1, 0, 0); h.globalAlpha = 1; h.globalCompositeOperation = "source-over"; h.filter = "none";
  h.fillStyle = "#000"; h.fillRect(0, 0, 1080, 1920); zeichnung(h);
  g.save(); g.filter = `blur(${px.toFixed(1)}px)`; g.drawImage(abseits, 0, 0); g.restore();
}
// Wie sehr sich ein Punkt auf dem Bildschirm zwischen zwei Kameras bewegt (für die Unschärfe).
export function geschwindigkeit(c0, c1, X, r = 20) {
  let m = 0;
  for (const d of [[0, 0, 0], [r, 0, 0], [0, r, 0], [-r, -r, 0]]) { const a = P(c0, k.sum(X, d)), b = P(c1, k.sum(X, d)); if (a && b) m = Math.max(m, Math.hypot(a.x - b.x, a.y - b.y)); }
  return m;
}
export const unschaerfeVon = (px) => Math.min(22, Math.max(0, (px - 10) * 0.35));

// ---------- Zange ----------
// Eine Spitzzange: die Spitzen bei (x, y), die Achse in Richtung ang (Radiant), geöffnet um oeffnet (Radiant).
export function zange(g, x, y, ang, oeffnet, esc = 1, deck = 1) {
  if (deck <= 0.003) return;
  g.save(); g.globalAlpha *= deck; g.translate(x, y); g.rotate(ang); g.scale(esc, esc);
  g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 30; g.shadowOffsetY = 18;
  for (const sg of [1, -1]) {
    g.save(); g.translate(300, 0); g.rotate(-sg * oeffnet); g.translate(-300, 0);
    // der Griff (auf der anderen Seite), rot
    g.beginPath(); g.moveTo(300, -sg * 6); g.bezierCurveTo(480, -sg * 30, 700, -sg * 70, 960, -sg * 96);
    g.bezierCurveTo(1000, -sg * 104, 1006, -sg * 168, 968, -sg * 178); g.bezierCurveTo(700, -sg * 150, 470, -sg * 84, 300, -sg * 46); g.closePath();
    const mg = g.createLinearGradient(0, -sg * 40, 0, -sg * 180); mg.addColorStop(0, "#ff6a6a"); mg.addColorStop(0.45, "#e0222b"); mg.addColorStop(1, "#8c0d14");
    g.fillStyle = mg; g.fill();
    g.save(); g.shadowColor = "transparent"; g.strokeStyle = "rgba(255,210,210,0.55)"; g.lineWidth = 4; g.beginPath(); g.moveTo(420, -sg * 32); g.bezierCurveTo(600, -sg * 60, 760, -sg * 84, 940, -sg * 106); g.stroke(); g.restore();
    // die Backen, aus Stahl
    g.beginPath(); g.moveTo(-4, sg * 1); g.lineTo(300, sg * 3); g.lineTo(340, sg * 58); g.bezierCurveTo(220, sg * 40, 90, sg * 26, 4, sg * 20); g.quadraticCurveTo(-8, sg * 12, -4, sg * 1); g.closePath();
    const ag = g.createLinearGradient(0, 0, 0, sg * 50); ag.addColorStop(0, "#fbfcfd"); ag.addColorStop(0.25, "#c9ced6"); ag.addColorStop(0.6, "#7d848e"); ag.addColorStop(1, "#3c4047");
    g.fillStyle = ag; g.fill();
    g.save(); g.shadowColor = "transparent"; g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(6, sg * 4); g.lineTo(296, sg * 6); g.stroke();
    g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(8, sg * 19); g.bezierCurveTo(90, sg * 25, 220, sg * 39, 336, sg * 56); g.stroke(); g.restore();
    g.restore();
  }
  g.shadowColor = "transparent";
  const pg = g.createRadialGradient(290, -10, 2, 300, 0, 36); pg.addColorStop(0, "#ffffff"); pg.addColorStop(0.5, "#a7adb6"); pg.addColorStop(1, "#4a4f57");
  g.fillStyle = pg; g.beginPath(); g.arc(300, 0, 34, 0, 7); g.fill(); g.strokeStyle = "rgba(0,0,0,0.4)"; g.lineWidth = 2; g.stroke();
  g.restore();
}

// Eine Farbe zwischen zwei "r,g,b".
export const mischRGB = (a, b, u) => { const x = a.split(","), y = b.split(","); return x.map((v, i) => Math.round(k.misch(+v, +y[i], u))).join(","); };

// ---------- der Finger ----------
// Die Spitze bei (x, y); der Finger kommt von unten rechts. quetscht: 0-1.
export function finger(g, x, y, quetscht = 0, deck = 1) {
  if (deck <= 0.003) return;
  g.save(); g.globalAlpha *= deck; g.translate(x, y); g.rotate(-0.42); const e = 1 - 0.05 * quetscht; g.scale(e, e);
  g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 40; g.shadowOffsetX = 18; g.shadowOffsetY = 26;
  const w = 66;
  g.beginPath(); g.moveTo(-w, 40); g.bezierCurveTo(-w, -40, -40, -70, 0, -70); g.bezierCurveTo(40, -70, w, -40, w, 40);
  g.lineTo(w + 14, 1100); g.lineTo(-w - 14, 1100); g.closePath();
  const sg = g.createLinearGradient(-w, 0, w, 0); sg.addColorStop(0, "#b8735a"); sg.addColorStop(0.3, "#e9a98c"); sg.addColorStop(0.62, "#f2bda2"); sg.addColorStop(1, "#a9624a");
  g.fillStyle = sg; g.fill(); g.shadowColor = "transparent";
  // der Nagel
  g.beginPath(); g.moveTo(-38, 0); g.bezierCurveTo(-38, -44, -20, -56, 0, -56); g.bezierCurveTo(20, -56, 38, -44, 38, 0); g.lineTo(34, 70); g.bezierCurveTo(10, 78, -10, 78, -34, 70); g.closePath();
  const ng = g.createLinearGradient(-38, 0, 38, 0); ng.addColorStop(0, "rgba(255,225,215,0.75)"); ng.addColorStop(0.5, "rgba(255,240,235,0.95)"); ng.addColorStop(1, "rgba(220,170,160,0.8)");
  g.fillStyle = ng; g.fill(); g.strokeStyle = "rgba(150,80,60,0.35)"; g.lineWidth = 2.5; g.stroke();
  // Knöchelfalten
  g.strokeStyle = "rgba(140,70,50,0.35)"; g.lineWidth = 3;
  for (const yy of [260, 280, 300]) { g.beginPath(); g.moveTo(-34, yy); g.quadraticCurveTo(0, yy + 10, 34, yy); g.stroke(); }
  g.restore();
}
