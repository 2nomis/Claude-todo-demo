// Die App-Symbole eines iPhones, gezeichnet wie die echten (Telefon, Safari, Nachrichten, Kalender, Fotos,
// Kamera, Mail, Uhr, Karten, Wetter...): ihr Hintergrund, ihr Verlauf und ihr Zeichen. Jedes in einem Quadrat der Seite s.
import { Path2D } from "@napi-rs/canvas";
import * as k from "#kit";

const { gerundet } = k;
// der Telefonhörer (24 × 24)
export const OHRHOERER = new Path2D("M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z");

const hintergrund = (c, x, y, s, a, b) => { const g = c.createLinearGradient(0, y, 0, y + s); g.addColorStop(0, a); g.addColorStop(1, b); gerundet(c, x, y, s, s, s * 0.225); c.fillStyle = g; c.fill(); };
const weissC = "#ffffff";

export const SYMBOLE = {
  telefon(c, x, y, s) { hintergrund(c, x, y, s, "#6af27a", "#1bc23a"); c.save(); c.translate(x + s * 0.2, y + s * 0.2); c.scale(s * 0.6 / 24, s * 0.6 / 24); c.fillStyle = weissC; c.fill(OHRHOERER); c.restore(); },
  nachrichten(c, x, y, s) {
    hintergrund(c, x, y, s, "#6af27a", "#1bc23a");
    c.fillStyle = weissC; c.beginPath(); c.ellipse(x + s / 2, y + s * 0.47, s * 0.34, s * 0.28, 0, 0, 6.2832); c.fill();
    c.beginPath(); c.moveTo(x + s * 0.28, y + s * 0.62); c.quadraticCurveTo(x + s * 0.25, y + s * 0.76, x + s * 0.18, y + s * 0.8); c.quadraticCurveTo(x + s * 0.36, y + s * 0.78, x + s * 0.42, y + s * 0.7); c.fill();
  },
  safari(c, x, y, s) {
    hintergrund(c, x, y, s, "#ffffff", "#e8e8ec");
    const cx = x + s / 2, cy = y + s / 2, r = s * 0.4, g = c.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, "#1fc8ff"); g.addColorStop(1, "#1a6ef0");
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, 6.2832); c.fill();
    c.strokeStyle = "rgba(255,255,255,0.8)"; c.lineWidth = 1.5; for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; c.beginPath(); c.moveTo(cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.82); c.lineTo(cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95); c.stroke(); }
    c.save(); c.translate(cx, cy); c.rotate(Math.PI / 4);
    c.fillStyle = "#ff3b30"; c.beginPath(); c.moveTo(0, -r * 0.72); c.lineTo(r * 0.12, 0); c.lineTo(-r * 0.12, 0); c.closePath(); c.fill();
    c.fillStyle = weissC; c.beginPath(); c.moveTo(0, r * 0.72); c.lineTo(r * 0.12, 0); c.lineTo(-r * 0.12, 0); c.closePath(); c.fill(); c.restore();
  },
  musik(c, x, y, s) {
    hintergrund(c, x, y, s, "#ff6a7d", "#f5234a");
    c.fillStyle = weissC; c.save(); c.translate(x, y);
    c.beginPath(); c.ellipse(s * 0.36, s * 0.7, s * 0.1, s * 0.08, -0.3, 0, 6.2832); c.fill(); c.beginPath(); c.ellipse(s * 0.66, s * 0.62, s * 0.1, s * 0.08, -0.3, 0, 6.2832); c.fill();
    c.fillRect(s * 0.43, s * 0.26, s * 0.045, s * 0.44); c.fillRect(s * 0.73, s * 0.2, s * 0.045, s * 0.42);
    c.beginPath(); c.moveTo(s * 0.43, s * 0.26); c.lineTo(s * 0.775, s * 0.2); c.lineTo(s * 0.775, s * 0.3); c.lineTo(s * 0.43, s * 0.36); c.closePath(); c.fill(); c.restore();
  },
  kalender(c, x, y, s) {
    hintergrund(c, x, y, s, "#ffffff", "#f2f2f2");
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillStyle = "#ff3b30"; c.font = `700 ${s * 0.15}px Figtree`; c.fillText("SAMSTAG", x + s / 2, y + s * 0.2);
    c.fillStyle = "#1c1c1e"; c.font = `500 ${s * 0.5}px Figtree`; c.fillText("17", x + s / 2, y + s * 0.6);
  },
  fotos(c, x, y, s) {
    hintergrund(c, x, y, s, "#ffffff", "#f4f4f4");
    const cols = ["#ffb400", "#ff8a00", "#ff3a5e", "#c644fc", "#5b6cff", "#2fb6ff", "#33d17a", "#c8e130"];
    c.save(); c.translate(x + s / 2, y + s / 2); c.globalCompositeOperation = "multiply";
    cols.forEach((col, i) => { c.save(); c.rotate(i * Math.PI / 4); c.fillStyle = col; c.globalAlpha = 0.85; c.beginPath(); c.ellipse(0, -s * 0.17, s * 0.1, s * 0.18, 0, 0, 6.2832); c.fill(); c.restore(); });
    c.restore();
  },
  kamera(c, x, y, s) {
    hintergrund(c, x, y, s, "#e3e4e8", "#9a9ca3");
    c.fillStyle = "#2c2c2e"; gerundet(c, x + s * 0.16, y + s * 0.32, s * 0.68, s * 0.44, s * 0.08); c.fill();
    c.fillStyle = "#2c2c2e"; gerundet(c, x + s * 0.36, y + s * 0.26, s * 0.2, s * 0.1, s * 0.03); c.fill();
    const g = c.createRadialGradient(x + s * 0.48, y + s * 0.5, 0, x + s / 2, y + s * 0.54, s * 0.15); g.addColorStop(0, "#5a7cff"); g.addColorStop(0.6, "#1b1f3a"); g.addColorStop(1, "#000");
    c.fillStyle = "#9a9ca3"; c.beginPath(); c.arc(x + s / 2, y + s * 0.54, s * 0.17, 0, 6.2832); c.fill();
    c.fillStyle = g; c.beginPath(); c.arc(x + s / 2, y + s * 0.54, s * 0.13, 0, 6.2832); c.fill();
    c.fillStyle = "#ffcc00"; c.beginPath(); c.arc(x + s * 0.74, y + s * 0.4, s * 0.03, 0, 6.2832); c.fill();
  },
  mail(c, x, y, s) {
    hintergrund(c, x, y, s, "#3fb2ff", "#1a6ef0");
    c.fillStyle = weissC; gerundet(c, x + s * 0.17, y + s * 0.3, s * 0.66, s * 0.42, s * 0.05); c.fill();
    c.strokeStyle = "#5aa9f5"; c.lineWidth = s * 0.03; c.lineJoin = "round"; c.beginPath(); c.moveTo(x + s * 0.2, y + s * 0.33); c.lineTo(x + s / 2, y + s * 0.53); c.lineTo(x + s * 0.8, y + s * 0.33); c.stroke();
  },
  uhr(c, x, y, s) {
    hintergrund(c, x, y, s, "#1c1c1e", "#000000");
    const cx = x + s / 2, cy = y + s / 2, r = s * 0.38;
    c.fillStyle = weissC; c.beginPath(); c.arc(cx, cy, r, 0, 6.2832); c.fill();
    c.fillStyle = "#1c1c1e"; c.font = `600 ${s * 0.09}px Figtree`; c.textAlign = "center"; c.textBaseline = "middle";
    for (let i = 1; i <= 12; i++) { const a = i * Math.PI / 6 - Math.PI / 2; c.fillText(String(i), cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78); }
    c.strokeStyle = "#1c1c1e"; c.lineCap = "round"; c.lineWidth = s * 0.03;
    const hm = (a, l) => { c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); c.stroke(); };
    hm(-Math.PI / 2 + (7.7 / 12) * 2 * Math.PI, r * 0.45); hm(-Math.PI / 2 + (42 / 60) * 2 * Math.PI, r * 0.68);
    c.strokeStyle = "#ff9500"; c.lineWidth = s * 0.012; hm(Math.PI * 0.2, r * 0.75);
  },
  karten(c, x, y, s) {
    gerundet(c, x, y, s, s, s * 0.225); c.save(); c.clip();
    c.fillStyle = "#f1ecdf"; c.fillRect(x, y, s, s);
    c.fillStyle = "#b6e3a1"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 0.55, y); c.lineTo(x, y + s * 0.5); c.fill();
    c.fillStyle = "#8fd0ff"; c.beginPath(); c.moveTo(x + s, y + s * 0.55); c.lineTo(x + s, y + s); c.lineTo(x + s * 0.6, y + s); c.fill();
    c.strokeStyle = "#ffcf3d"; c.lineWidth = s * 0.09; c.beginPath(); c.moveTo(x - 5, y + s * 0.85); c.lineTo(x + s + 5, y + s * 0.15); c.stroke();
    c.strokeStyle = weissC; c.lineWidth = s * 0.05; c.beginPath(); c.moveTo(x + s * 0.3, y - 5); c.lineTo(x + s * 0.55, y + s + 5); c.stroke();
    c.fillStyle = "#1a7cf5"; c.beginPath(); c.moveTo(x + s * 0.5, y + s * 0.3); c.lineTo(x + s * 0.64, y + s * 0.66); c.lineTo(x + s * 0.5, y + s * 0.58); c.lineTo(x + s * 0.36, y + s * 0.66); c.closePath(); c.fill();
    c.restore();
  },
  wetter(c, x, y, s) {
    hintergrund(c, x, y, s, "#3aa0ff", "#1f5fd8");
    const sg = c.createRadialGradient(x + s * 0.38, y + s * 0.38, 0, x + s * 0.38, y + s * 0.38, s * 0.2); sg.addColorStop(0, "#fff6a8"); sg.addColorStop(1, "#ffd21f");
    c.fillStyle = sg; c.beginPath(); c.arc(x + s * 0.38, y + s * 0.38, s * 0.17, 0, 6.2832); c.fill();
    c.fillStyle = weissC; c.beginPath(); c.arc(x + s * 0.45, y + s * 0.64, s * 0.13, 0, 6.2832); c.arc(x + s * 0.6, y + s * 0.56, s * 0.16, 0, 6.2832); c.arc(x + s * 0.74, y + s * 0.66, s * 0.11, 0, 6.2832); c.fill();
    c.fillRect(x + s * 0.45, y + s * 0.64, s * 0.3, s * 0.13);
  },
  notizen(c, x, y, s) {
    gerundet(c, x, y, s, s, s * 0.225); c.save(); c.clip();
    c.fillStyle = "#fffdf6"; c.fillRect(x, y, s, s);
    const g = c.createLinearGradient(0, y, 0, y + s * 0.28); g.addColorStop(0, "#ffd84a"); g.addColorStop(1, "#ffc21a"); c.fillStyle = g; c.fillRect(x, y, s, s * 0.28);
    c.strokeStyle = "#d9d6cc"; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x + s * 0.1, y + s * (0.45 + i * 0.13)); c.lineTo(x + s * 0.9, y + s * (0.45 + i * 0.13)); c.stroke(); }
    c.restore();
  },
  appstore(c, x, y, s) {
    hintergrund(c, x, y, s, "#21b7ff", "#1a6ef0");
    c.strokeStyle = weissC; c.lineCap = "round"; c.lineWidth = s * 0.075;
    c.beginPath(); c.moveTo(x + s * 0.5, y + s * 0.22); c.lineTo(x + s * 0.3, y + s * 0.72); c.stroke();
    c.beginPath(); c.moveTo(x + s * 0.5, y + s * 0.22); c.lineTo(x + s * 0.7, y + s * 0.72); c.stroke();
    c.beginPath(); c.moveTo(x + s * 0.22, y + s * 0.58); c.lineTo(x + s * 0.78, y + s * 0.58); c.stroke();
  },
  einstellungen(c, x, y, s) {
    hintergrund(c, x, y, s, "#b8bcc4", "#7e838c");
    const cx = x + s / 2, cy = y + s / 2;
    c.fillStyle = "#4a4e55"; c.beginPath();
    for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12, r = i % 2 ? s * 0.32 : s * 0.38; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    c.closePath(); c.fill();
    c.fillStyle = "#d8dbe0"; c.beginPath(); c.arc(cx, cy, s * 0.26, 0, 6.2832); c.fill();
    c.fillStyle = "#4a4e55"; c.beginPath(); c.arc(cx, cy, s * 0.1, 0, 6.2832); c.fill();
  },
  rechner(c, x, y, s) {
    hintergrund(c, x, y, s, "#2c2c2e", "#000000");
    for (let i = 0; i < 9; i++) { const cx = x + s * (0.27 + (i % 3) * 0.23), cy = y + s * (0.27 + Math.floor(i / 3) * 0.23); c.fillStyle = i % 3 === 2 ? "#ff9f0a" : "#5a5a5e"; c.beginPath(); c.arc(cx, cy, s * 0.085, 0, 6.2832); c.fill(); }
  },
  health(c, x, y, s) {
    hintergrund(c, x, y, s, "#ffffff", "#f4f4f4");
    const cx = x + s * 0.68, cy = y + s * 0.3, r = s * 0.12;
    c.fillStyle = "#ff2d55"; c.beginPath(); c.moveTo(cx, cy + r * 1.3); c.bezierCurveTo(cx - r * 1.8, cy, cx - r, cy - r * 1.3, cx, cy - r * 0.3); c.bezierCurveTo(cx + r, cy - r * 1.3, cx + r * 1.8, cy, cx, cy + r * 1.3); c.fill();
  },
  podcasts(c, x, y, s) {
    hintergrund(c, x, y, s, "#d36cff", "#8a2be2");
    const cx = x + s / 2, cy = y + s * 0.45;
    c.strokeStyle = weissC; c.lineWidth = s * 0.05;
    for (const r of [0.28, 0.18]) { c.beginPath(); c.arc(cx, cy, s * r, Math.PI * 0.75, Math.PI * 2.25); c.stroke(); }
    c.fillStyle = weissC; c.beginPath(); c.arc(cx, cy, s * 0.07, 0, 6.2832); c.fill(); gerundet(c, cx - s * 0.05, cy + s * 0.1, s * 0.1, s * 0.3, s * 0.05); c.fill();
  },
  dateien(c, x, y, s) {
    hintergrund(c, x, y, s, "#ffffff", "#f2f2f2");
    c.fillStyle = "#1a8cff"; gerundet(c, x + s * 0.16, y + s * 0.28, s * 0.3, s * 0.12, s * 0.04); c.fill();
    const g = c.createLinearGradient(0, y + s * 0.34, 0, y + s * 0.76); g.addColorStop(0, "#4fb4ff"); g.addColorStop(1, "#1a8cff");
    c.fillStyle = g; gerundet(c, x + s * 0.16, y + s * 0.34, s * 0.68, s * 0.42, s * 0.06); c.fill();
  },
};
export const NAMEN = { telefon: "Telefon", nachrichten: "Nachrichten", safari: "Safari", musik: "Musik", kalender: "Kalender", fotos: "Fotos", kamera: "Kamera", mail: "Mail", uhr: "Uhr", karten: "Karten", wetter: "Wetter", notizen: "Notizen", appstore: "App Store", einstellungen: "Einstellungen", rechner: "Rechner", health: "Health", podcasts: "Podcasts", dateien: "Dateien" };

// Ein Symbol mit seinem weichen Schatten.
export function app(c, name, x, y, s) {
  c.save(); c.shadowColor = "rgba(0,0,0,0.25)"; c.shadowBlur = 10; c.shadowOffsetY = 4;
  gerundet(c, x, y, s, s, s * 0.225); c.fillStyle = "#000"; c.fill(); c.restore();
  c.save(); SYMBOLE[name](c, x, y, s); c.restore();
}
