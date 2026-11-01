// Das Handy und was auf seinem Bildschirm ist (die Uhrzeit, Sofias Anruf, der Home-Bildschirm, die Karte, das Foto, Teilen), und die
// Hand im Strickhandschuh, die es hält. Alles wird auf dem Bildschirm gezeichnet (keine 3D-Kamera): handy(g, x, y, esc, ...).
import * as k from "#kit";
import { tastatur } from "./base.js";
import { OHRHOERER, NAMEN, app } from "./apps.js";

const { zufall, leinwand, gerundet, misch } = k;

export const PW = 640, PH = 1300, SW = 600, SH = 1260;
const bildschirm = leinwand(SW, SH);

// Das Handy zentriert bei (x, y), im Maßstab esc und um ang gedreht. zeichneBildschirm(c, t): malt den Bildschirm auf eine Leinwand
// von SW × SH. Gibt die Transformation zurück, um Dinge auf den Bildschirm zu legen: zumBildschirm(px, py) → [x, y].
export function handy(g, x, y, esc, ang, zeichneBildschirm, t) {
  const c = bildschirm.getContext("2d");
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; c.clearRect(0, 0, SW, SH);
  zeichneBildschirm(c, t);
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(esc, esc);
  // der Schatten in der Luft und der Lichtschein dahinter
  g.save(); g.shadowColor = "rgba(0,0,0,0.8)"; g.shadowBlur = 120; g.shadowOffsetY = 60;
  gerundet(g, -PW / 2, -PH / 2, PW, PH, 100); g.fillStyle = "#121215"; g.fill(); g.restore();
  // die Seitentasten (Titan)
  const bot = (bx, by, bw, bh) => { gerundet(g, bx, by, bw, bh, 4); const bg = g.createLinearGradient(bx, 0, bx + bw, 0); bg.addColorStop(0, "#2a2b2f"); bg.addColorStop(0.5, "#8b8e95"); bg.addColorStop(1, "#2a2b2f"); g.fillStyle = bg; g.fill(); };
  bot(-PW / 2 - 7, -PH / 2 + 240, 9, 70); bot(-PW / 2 - 7, -PH / 2 + 340, 9, 110); bot(-PW / 2 - 7, -PH / 2 + 470, 9, 110); bot(PW / 2 - 2, -PH / 2 + 360, 9, 170);
  // der Titanrahmen: Bänder aus Licht und Schatten und ein heller Rand
  gerundet(g, -PW / 2, -PH / 2, PW, PH, 100); k.metal(g, -PW / 2, PW / 2, ["#1e1f23", "#6f7279", "#34363b", "#b9bcc3", "#3a3c41", "#1b1c20"]);
  // das gebürstete Titan: feine kleine Kratzer
  g.save(); gerundet(g, -PW / 2, -PH / 2, PW, PH, 100); g.clip(); g.globalCompositeOperation = "overlay"; g.globalAlpha = 0.18;
  for (let yy = -PH / 2; yy < PH / 2; yy += 3) { g.fillStyle = (Math.sin(yy * 12.9898) * 43758.5453) % 1 > 0 ? "#fff" : "#000"; g.fillRect(-PW / 2, yy, PW, 1); }
  g.restore();
  gerundet(g, -PW / 2 + 2, -PH / 2 + 2, PW - 4, PH - 4, 98); const fl = g.createLinearGradient(PW / 2, -PH / 2, -PW / 2, PH / 2); fl.addColorStop(0, "rgba(255,240,220,0.55)"); fl.addColorStop(0.5, "rgba(255,255,255,0.1)"); fl.addColorStop(1, "rgba(255,255,255,0.25)"); g.strokeStyle = fl; g.lineWidth = 2.5; g.stroke();
  // das schwarze Glas um den Bildschirm
  gerundet(g, -PW / 2 + 10, -PH / 2 + 10, PW - 20, PH - 20, 92); g.fillStyle = "#030304"; g.fill();
  g.save(); gerundet(g, -SW / 2, -SH / 2, SW, SH, 80); g.clip();
  g.drawImage(bildschirm, -SW / 2, -SH / 2, SW, SH);
  // die Spiegelung im Glas: ein weiches diagonales Band und ein Glanzpunkt in der Ecke
  const rg = g.createLinearGradient(-SW / 2, -SH / 2, SW / 2, SH / 2);
  rg.addColorStop(0.18, "rgba(255,255,255,0)"); rg.addColorStop(0.27, "rgba(255,255,255,0.06)"); rg.addColorStop(0.36, "rgba(255,255,255,0)");
  g.globalCompositeOperation = "screen"; g.fillStyle = rg; g.fillRect(-SW / 2, -SH / 2, SW, SH);
  const eg = g.createRadialGradient(-SW / 2, -SH / 2, 0, -SW / 2, -SH / 2, 420); eg.addColorStop(0, "rgba(255,255,255,0.07)"); eg.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = eg; g.fillRect(-SW / 2, -SH / 2, SW, SH);
  g.restore();
  gerundet(g, -78, -SH / 2 + 22, 156, 44, 22); g.fillStyle = "#000"; g.fill();
  g.fillStyle = "rgba(40,50,80,0.9)"; g.beginPath(); g.arc(42, -SH / 2 + 44, 9, 0, 6.2832); g.fill();
  g.restore();
}
// Wo ein Punkt (px, py) des Bildschirms (0..SW, 0..SH) eines Handys bei (x, y, esc, ang) im Bild landet.
export function zumBildschirm(x, y, esc, ang, px, py) {
  const lx = (px - SW / 2) * esc, ly = (py - SH / 2) * esc, c = Math.cos(ang), s = Math.sin(ang);
  return [x + lx * c - ly * s, y + lx * s + ly * c];
}

// ---------------------------------------------------------------- die Bildschirme (auf einer Leinwand von SW × SH)
// Gezeichnete Symbole (die Schrift hat keine Symbole): ein Hörer, eine Schneeflocke, ein Umschlag, eine Sonne, ein Kreis...
function icon(c, s, x, y, groesse, color = "#fff") {
  c.save(); c.translate(x, y); c.fillStyle = color; c.strokeStyle = color; c.lineCap = "round"; c.lineJoin = "round";
  const r = groesse / 2;
  if (s === "tel") { c.translate(-r, -r); c.scale(groesse / 24, groesse / 24); c.fill(OHRHOERER); }
  else if (s === "schneeflocke") { c.lineWidth = groesse * 0.08; for (let a = 0; a < 3; a++) { c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(-r, 0); c.lineTo(r, 0); c.stroke(); } }
  else if (s === "umschlag") { c.lineWidth = groesse * 0.08; c.strokeRect(-r * 0.75, -r * 0.5, r * 1.5, r); c.beginPath(); c.moveTo(-r * 0.75, -r * 0.5); c.lineTo(0, r * 0.1); c.lineTo(r * 0.75, -r * 0.5); c.stroke(); }
  else if (s === "sonne") { c.beginPath(); c.arc(0, 0, r * 0.45, 0, 6.2832); c.fill(); c.lineWidth = groesse * 0.07; for (let a = 0; a < 8; a++) { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(r * 0.62, 0); c.lineTo(r * 0.9, 0); c.stroke(); } }
  else if (s === "ring") { c.lineWidth = groesse * 0.1; c.beginPath(); c.arc(0, 0, r * 0.6, 0, 6.2832); c.stroke(); c.beginPath(); c.arc(0, 0, r * 0.2, 0, 6.2832); c.fill(); }
  else if (s === "play") { c.beginPath(); c.moveTo(-r * 0.35, -r * 0.5); c.lineTo(r * 0.55, 0); c.lineTo(-r * 0.35, r * 0.5); c.closePath(); c.fill(); }
  else if (s === "notiz") { c.beginPath(); c.arc(-r * 0.25, r * 0.45, r * 0.25, 0, 6.2832); c.fill(); c.fillRect(-r * 0.05, -r * 0.6, r * 0.14, r * 1.05); c.fillRect(-r * 0.05, -r * 0.6, r * 0.55, r * 0.18); }
  else if (s === "haus") { c.beginPath(); c.moveTo(-r * 0.7, 0); c.lineTo(0, -r * 0.7); c.lineTo(r * 0.7, 0); c.lineTo(r * 0.5, 0); c.lineTo(r * 0.5, r * 0.6); c.lineTo(-r * 0.5, r * 0.6); c.lineTo(-r * 0.5, 0); c.closePath(); c.fill(); }
  else if (s === "wolke") { c.beginPath(); c.arc(-r * 0.3, r * 0.1, r * 0.35, 0, 6.2832); c.arc(r * 0.15, -r * 0.1, r * 0.45, 0, 6.2832); c.arc(r * 0.5, r * 0.2, r * 0.3, 0, 6.2832); c.fill(); }
  else if (s === "stern") { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.35 : r * 0.8; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); }
  else { c.font = `800 ${groesse}px Figtree`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(s, 0, 2); }
  c.restore();
}
const T = (c, txt, x, y, groesse, gewicht = 700, color = "#fff", deck = "center") => { c.font = `${gewicht} ${groesse}px Figtree`; c.textAlign = deck; c.textBaseline = "middle"; c.fillStyle = color; c.fillText(txt, x, y); };
function balken(c, dunkel = false) {
  T(c, "7:42", 70, 42, 26, 800, dunkel ? "#111" : "#fff");
  c.fillStyle = dunkel ? "#111" : "#fff"; gerundet(c, SW - 100, 32, 44, 20, 6); c.fill();
}

// Der Sperrbildschirm: die große Uhr und der dunkle Hintergrund. hinweis: 0 bis 1, der verpasste Anruf.
export function sperre(c, t, o = {}) {
  const bg = c.createLinearGradient(0, 0, 0, SH); bg.addColorStop(0, "#2a2f3a"); bg.addColorStop(0.6, "#151820"); bg.addColorStop(1, "#0c0e12");
  c.fillStyle = bg; c.fillRect(0, 0, SW, SH);
  c.globalAlpha = 0.25; c.globalCompositeOperation = "screen"; c.drawImage(k.flecken, 0, 0, SW, SH); c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
  balken(c);
  T(c, "Samstag, 17. Januar", SW / 2, 200, 28, 700, "rgba(255,255,255,0.85)");
  T(c, "7:42", SW / 2, 300, 150, 800);
  icon(c, "schneeflocke", SW / 2, 410, 34, "rgba(255,255,255,0.8)");
  for (const [x] of [[110], [SW - 110]]) { c.fillStyle = "rgba(255,255,255,0.15)"; c.beginPath(); c.arc(x, SH - 130, 46, 0, 6.2832); c.fill(); }
  c.fillStyle = "rgba(255,255,255,0.8)"; gerundet(c, SW / 2 - 90, SH - 30, 180, 8, 4); c.fill();
  const av = o.hinweis || 0;
  if (av > 0.01) {
    c.save(); c.globalAlpha = av;
    const y = misch(SH * 0.62, SH * 0.55, av);
    gerundet(c, 26, y, SW - 52, 120, 30); c.fillStyle = "rgba(60,64,72,0.92)"; c.fill();
    c.fillStyle = "#2fbf5b"; gerundet(c, 50, y + 30, 60, 60, 14); c.fill(); icon(c, "tel", 80, y + 60, 36);
    T(c, "Sofia", 130, y + 42, 30, 800, "#fff", "left"); T(c, "Verpasster Anruf", 130, y + 82, 26, 600, "rgba(255,255,255,0.8)", "left");
    c.restore();
  }
}

// Sofias eingehender Anruf. gleitet: 0 bis 1, wo der grüne Knopf ist. answered: 0 bis 1, schon im Anruf.
export function anruf(c, t, o = {}) {
  const bg = c.createLinearGradient(0, 0, 0, SH); bg.addColorStop(0, "#cdb8a4"); bg.addColorStop(0.5, "#b9a2a5"); bg.addColorStop(1, "#9f8ea0");
  c.fillStyle = bg; c.fillRect(0, 0, SW, SH);
  c.globalAlpha = 0.18; c.globalCompositeOperation = "multiply"; c.drawImage(k.flecken, 0, 0, SW, SH); c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
  balken(c);
  // Sofias Gesicht und ihr Name
  avatar(c, 80, 140, 36);
  T(c, "mobil", 132, 124, 22, 600, "rgba(255,255,255,0.8)", "left"); T(c, "Sofia", 132, 156, 36, 800, "#fff", "left");
  // der Schieberegler
  const y = SH - 210, x0 = 40, x1 = SW - 40, d = o.gleitet || 0;
  gerundet(c, x0, y - 50, x1 - x0, 100, 50); c.fillStyle = "rgba(255,255,255,0.28)"; c.fill();
  c.globalAlpha = 1 - d; T(c, "Zum Annehmen streichen", SW / 2 + 40, y, 26, 600, "rgba(255,255,255,0.9)"); c.globalAlpha = 1;
  const bx = misch(x0 + 50, x1 - 50, d);
  c.fillStyle = "#fff"; c.beginPath(); c.arc(bx, y, 42, 0, 6.2832); c.fill();
  icon(c, "tel", bx, y, 42, "#2fbf5b");
  c.fillStyle = "rgba(255,255,255,0.8)"; gerundet(c, SW / 2 - 90, SH - 30, 180, 8, 4); c.fill();
}
// Im Anruf: Die Zeit läuft. seg: die Sekunden.
export function imAnruf(c, t, seg = 0) {
  const bg = c.createLinearGradient(0, 0, 0, SH); bg.addColorStop(0, "#3a3540"); bg.addColorStop(1, "#15141a");
  c.fillStyle = bg; c.fillRect(0, 0, SW, SH);
  balken(c);
  avatar(c, SW / 2, 260, 80);
  T(c, "Sofia", SW / 2, 400, 46, 800); T(c, `00:${String(Math.floor(seg)).padStart(2, "0")}`, SW / 2, 452, 30, 600, "rgba(255,255,255,0.75)");
  for (let i = 0; i < 6; i++) { const x = 130 + (i % 3) * 170, y = 720 + Math.floor(i / 3) * 170; c.fillStyle = "rgba(255,255,255,0.16)"; c.beginPath(); c.arc(x, y, 58, 0, 6.2832); c.fill(); c.fillStyle = "rgba(255,255,255,0.7)"; c.beginPath(); c.arc(x, y, 14, 0, 6.2832); c.fill(); }
  c.fillStyle = "#ec3b3b"; c.beginPath(); c.arc(SW / 2, SH - 200, 62, 0, 6.2832); c.fill(); icon(c, "tel", SW / 2, SH - 200, 54);
}
export function avatar(c, x, y, r) {
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.clip();
  c.fillStyle = "#f0b46a"; c.fillRect(x - r, y - r, r * 2, r * 2);
  c.fillStyle = "#3a2216"; c.beginPath(); c.arc(x, y - r * 0.05, r * 0.72, 0, 6.2832); c.fill();
  c.fillStyle = "#8a5638"; c.beginPath(); c.ellipse(x, y + r * 0.08, r * 0.45, r * 0.52, 0, 0, 6.2832); c.fill();
  c.fillStyle = "#6e4029"; c.beginPath(); c.ellipse(x, y + r * 1.05, r * 0.85, r * 0.5, 0, 0, 6.2832); c.fill();
  c.restore();
}

// Ein iPhone-Home-Bildschirm: seine üblichen Apps mit ihren Namen und das Dock. oeffnet: 0 bis 1, die Karte öffnet sich von selbst.
const BILDSCHIRM = ["kalender", "fotos", "kamera", "uhr", "mail", "karten", "wetter", "notizen", "appstore", "einstellungen", "health", "dateien", "podcasts", "rechner"];
const DOCK = ["telefon", "safari", "nachrichten", "musik"];
export function anfang(c, t, o = {}) {
  const bg = c.createLinearGradient(0, 0, SW, SH); bg.addColorStop(0, "#3c4a6b"); bg.addColorStop(0.5, "#5b4a6e"); bg.addColorStop(1, "#22283a");
  c.fillStyle = bg; c.fillRect(0, 0, SW, SH);
  c.globalAlpha = 0.25; c.globalCompositeOperation = "screen"; c.drawImage(k.flecken, 0, 0, SW, SH); c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
  balken(c);
  BILDSCHIRM.forEach((n, i) => {
    const x = 50 + (i % 4) * 134, y = 110 + Math.floor(i / 4) * 160, s = 104;
    app(c, n, x, y, s);
    T(c, NAMEN[n], x + s / 2, y + s + 22, 19, 600, "rgba(255,255,255,0.95)");
  });
  c.fillStyle = "rgba(255,255,255,0.28)"; gerundet(c, SW / 2 - 50, SH - 222, 100, 30, 15); c.fill(); T(c, "Suchen", SW / 2, SH - 207, 16, 600, "#fff");
  gerundet(c, 22, SH - 172, SW - 44, 142, 46); c.fillStyle = "rgba(255,255,255,0.24)"; c.fill();
  DOCK.forEach((n, i) => app(c, n, 50 + i * 134, SH - 153, 104));
  const ab = o.oeffnet || 0;
  if (ab > 0.01) {
    c.save(); const s = misch(0.2, 1, k.kommtRein(ab)), cx = misch(400, SW / 2, ab), cy = misch(450, SH / 2, ab);
    c.translate(cx, cy); c.scale(s, s); c.translate(-SW / 2, -SH / 2); c.globalAlpha = Math.min(1, ab * 2);
    gerundet(c, 0, 0, SW, SH, 80 / s); c.clip(); karte(c, t); c.restore();
  }
}
export function karte(c, t) {
  c.fillStyle = "#f2efe6"; c.fillRect(0, 0, SW, SH);
  c.fillStyle = "#cfe9c6"; gerundet(c, 330, 520, 220, 260, 20); c.fill(); gerundet(c, 40, 900, 200, 180, 20); c.fill();
  c.fillStyle = "#a9d4f5"; c.beginPath(); c.ellipse(120, 300, 110, 70, 0.3, 0, 6.2832); c.fill();
  c.strokeStyle = "#ffffff"; c.lineWidth = 18;
  for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(0, 150 + i * 170); c.lineTo(SW, 110 + i * 170 + 40); c.stroke(); }
  c.strokeStyle = "#f6c945"; c.lineWidth = 26; c.beginPath(); c.moveTo(250, 0); c.lineTo(300, SH); c.stroke(); c.beginPath(); c.moveTo(0, 640); c.lineTo(SW, 560); c.stroke();
  c.fillStyle = "#3b82f6"; c.beginPath(); c.arc(330, 700, 18, 0, 6.2832); c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 6; c.stroke();
  gerundet(c, 30, SH - 200, SW - 60, 150, 36); c.fillStyle = "rgba(255,255,255,0.95)"; c.fill();
  T(c, "Suchen", 90, SH - 160, 28, 600, "#888", "left");
}
// Ein Foto (ein Wald bei Sonnenuntergang), das hineinzoomt.
export function foto(c, t, zoom = 1) {
  c.save(); c.translate(SW / 2, SH / 2); c.scale(zoom, zoom); c.translate(-SW / 2, -SH / 2);
  const bg = c.createLinearGradient(0, 0, 0, SH); bg.addColorStop(0, "#2a2238"); bg.addColorStop(0.25, "#f39a4a"); bg.addColorStop(0.6, "#f6b26b"); bg.addColorStop(1, "#c86a2c");
  c.fillStyle = bg; c.fillRect(-SW, -SH, SW * 3, SH * 3);
  const sg = c.createRadialGradient(SW * 0.55, SH * 0.42, 0, SW * 0.55, SH * 0.42, 220); sg.addColorStop(0, "rgba(255,240,200,0.95)"); sg.addColorStop(1, "rgba(255,200,120,0)");
  c.fillStyle = sg; c.fillRect(-SW, -SH, SW * 3, SH * 3);
  c.strokeStyle = "#1a1210"; c.lineCap = "round";
  const zuf = zufall(8);
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 120 + zuf() * 40; c.lineWidth = 14;
    c.beginPath(); c.moveTo(x, SH); c.lineTo(x + 6, 260); c.stroke();
    for (let b = 0; b < 7; b++) { const y = 340 + b * 110, l = 50 + zuf() * 70, d = b % 2 ? 1 : -1; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 4, y); c.lineTo(x + d * l, y - l * 0.8); c.stroke(); }
  }
  c.fillStyle = "#3a1d10"; c.fillRect(-SW, SH * 0.86, SW * 3, SH);
  c.restore();
}


// ---------------------------------------------------------------- der Chat
// Nachrichten mit einem Freund und die Tastatur unten. o: { getippt (was im Feld steht), meldungen [[text, meine]],
// tastatur: Optionen von tastatur(), gesehen }
export function chat(c, t, o = {}) {
  c.fillStyle = "#000"; c.fillRect(0, 0, SW, SH);
  balken(c);
  // die Kopfzeile mit Lena
  c.fillStyle = "rgba(30,30,32,0.95)"; c.fillRect(0, 70, SW, 150);
  avatar(c, SW / 2, 125, 36); T(c, "Lena", SW / 2, 185, 22, 600, "#fff");
  c.strokeStyle = "#0a84ff"; c.lineWidth = 5; c.beginPath(); c.moveTo(42, 112); c.lineTo(28, 126); c.lineTo(42, 140); c.stroke();
  // die Nachrichten, von unten nach oben
  const yk = SH - 560;
  let y = yk - 190;
  (o.meldungen || []).slice().reverse().forEach(([txt, meine]) => {
    c.font = "500 30px Figtree"; const w = Math.min(SW - 140, c.measureText(txt).width + 50);
    const x = meine ? SW - 24 - w : 24;
    gerundet(c, x, y - 34, w, 68, 34); c.fillStyle = meine ? "#0a84ff" : "#2c2c2e"; c.fill();
    T(c, txt, x + 25, y, 30, 500, "#fff", "left");
    y -= 90;
  });
  // das Textfeld
  gerundet(c, 80, yk - 122, SW - 110, 64, 32); c.strokeStyle = "rgba(255,255,255,0.25)"; c.lineWidth = 2; c.stroke();
  c.fillStyle = "#3a3a3c"; c.beginPath(); c.arc(42, yk - 90, 26, 0, 6.2832); c.fill(); T(c, "+", 42, yk - 92, 36, 500, "#bbb");
  const txt = o.getippt || "";
  if (txt) { T(c, txt, 104, yk - 90, 30, 500, "#fff", "left"); }
  else T(c, "iMessage", 104, yk - 90, 28, 500, "rgba(255,255,255,0.35)", "left");
  c.font = "500 30px Figtree"; const cx = 106 + c.measureText(txt).width;
  if ((t * 2) % 1 < 0.6) { c.fillStyle = "#0a84ff"; c.fillRect(cx, yk - 110, 3, 40); }
  // die Tastatur
  c.save(); c.translate(12, yk + 60); c.scale((SW - 24) / 1000, (SW - 24) / 1000);
  tastatur(c, t, o.tastatur || {});
  c.restore();
  c.fillStyle = "rgba(255,255,255,0.8)"; gerundet(c, SW / 2 - 90, SH - 22, 180, 8, 4); c.fill();
}
// Wo auf dem Handybildschirm (0..SW, 0..SH) die Mitte einer Taste der Chat-Tastatur ist.
export const YK = SH - 560, KS = (SW - 24) / 1000;
export const tasteAufBildschirm = ([x, y]) => [12 + x * KS, YK + 60 + y * KS];
