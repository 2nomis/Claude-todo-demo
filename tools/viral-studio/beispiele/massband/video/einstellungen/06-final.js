// Sätze 10-11: der rote Haken löst sich und klappert; türkiser Ring mit der 0 («on purpose»). Dann zieht die Kamera zurück:
// Es ist ein Reel auf einem Handy; ein Finger teilt es mit einem Freund (Send → Sent) und die Kamera geht zurück in den Bildschirm.
import * as k from "#kit";
import { v } from "#stimme";
import { createCanvas } from "@napi-rs/canvas";
import { T, szene, hintergrund, ansichtsRoute, kamera, reif, null_, klappern, klapperTreffer, finger, P, GRAU, ROT, TUERKIS, fertig } from "../welt.js";
import { NAH } from "./01-hook.js";

export const von = "so#2";
const f10 = v.satz(10), f11 = v.satz(11);
const T0 = f10.anfang, Tloose = f10.t("loose"), Tpurpose = f10.t("purpose"), Tsend = f11.anfang, Tende = v.dauer;
const ANFANG = { ...NAH, yaw: -1.0, pitch: 0.36, esc: 21 };
const ansicht = ansichtsRoute([[T0, { ...NAH, yaw: -0.7, esc: 23 }], [Tpurpose + 0.6, NAH], [Tende - 0.9, { ...NAH, yaw: -0.9, esc: 22 }], [Tende, ANFANG]]);

// das Handy
const S = 0.66, PX = 540, PY = 960;                       // Maßstab und Mitte des Handybildschirms
const Tz0 = Tsend - 0.06, Tz1 = Tsend + 0.42;             // zieht zurück
const Tzurueck0 = Tende - 0.75, Tzurueck1 = Tende - 0.05;     // geht wieder rein
const Tshare = Tsend + 0.62, Tsheet = Tshare + 0.08, Tfreund = f11.t("friend") + 0.38, TsendenKnopf = f11.t("thinking") - 0.25;
export const momente = { entfernt: Tz0, teilen: Tshare, blatt: Tsheet, freund: Tfreund, senden: TsendenKnopf, kehrtZurueck: Tzurueck0 };
export const trefferListe = klapperTreffer(Tloose + 0.06, 5, 0.13);

const reel = createCanvas(1080, 1920), gr = reel.getContext("2d");

function hakenSzene(g, t) {
  const c = kamera(ansicht(t));
  const grau = k.sanft(k.rampe(t, Tloose - 0.06, Tloose + 0.12));
  hintergrund(g);
  szene(g, c, { tx: 0, s: klappern(t, Tloose + 0.06, 5, 0.13, -T), color: ROT.map((x, i) => k.misch(x, GRAU[i], grau)) });
  const p = P(c, [9, -5, 0]);
  const u = k.kommtRein(k.rampe(t, Tpurpose - 0.08, Tpurpose + 0.4)), deck = 1 - k.sanft(k.rampe(t, Tzurueck0, Tzurueck1 - 0.2));
  if (p) {
    const r = (c.F / k.laenge(k.teil(c.p, [9, -5, 0]))) * 17;
    reif(g, p.x, p.y, r, u, TUERKIS, deck);
    if (u > 0 && deck > 0.01) {
      g.save(); g.globalAlpha = deck * k.rampe(t, Tpurpose + 0.1, Tpurpose + 0.3); g.font = "600 92px Helvetica, Arial"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = "#0b0b0d"; g.beginPath(); g.arc(p.x, p.y - r, 52, 0, 7); g.fill();
      g.shadowColor = `rgba(${TUERKIS},0.8)`; g.shadowBlur = 18; g.fillStyle = `rgb(${TUERKIS})`; g.fillText("0", p.x, p.y - r + 4); g.restore();
    }
  }
}

// ---- Bedienung (in Reel-Koordinaten, 1080 x 1920) ----
function icon(g, typ, x, y) {
  g.save(); g.translate(x, y); g.strokeStyle = "#fff"; g.fillStyle = "#fff"; g.lineWidth = 7; g.lineJoin = "round"; g.lineCap = "round";
  g.shadowColor = "rgba(0,0,0,0.5)"; g.shadowBlur = 10;
  if (typ === "herz") { g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-60, -10, -30, -55, 0, -22); g.bezierCurveTo(30, -55, 60, -10, 0, 30); g.stroke(); }
  if (typ === "blase") { g.beginPath(); g.arc(0, 0, 34, 0.9, Math.PI * 2 + 0.5); g.lineTo(38, 36); g.closePath(); g.stroke(); }
  if (typ === "repost") { g.beginPath(); g.moveTo(-30, 8); g.lineTo(-30, -18); g.lineTo(26, -18); g.moveTo(14, -30); g.lineTo(28, -18); g.lineTo(14, -6); g.moveTo(30, -6); g.lineTo(30, 18); g.lineTo(-26, 18); g.moveTo(-14, 6); g.lineTo(-28, 18); g.lineTo(-14, 30); g.stroke(); }
  if (typ === "flugzeug") { g.beginPath(); g.moveTo(-36, -28); g.lineTo(38, -30); g.lineTo(2, 36); g.lineTo(-6, 0); g.closePath(); g.moveTo(-6, 0); g.lineTo(38, -30); g.stroke(); }
  if (typ === "mehr") { for (const yy of [-22, 0, 22]) { g.beginPath(); g.arc(0, yy, 5, 0, 7); g.fill(); } }
  g.restore();
}
function bedienung(g, deck) {
  if (deck <= 0.003) return;
  g.save(); g.globalAlpha = deck;
  const sg = g.createLinearGradient(0, 1400, 0, 1920); sg.addColorStop(0, "rgba(0,0,0,0)"); sg.addColorStop(1, "rgba(0,0,0,0.65)"); g.fillStyle = sg; g.fillRect(0, 1400, 1080, 520);
  const symbole = [["herz", 1130], ["blase", 1290], ["repost", 1440], ["flugzeug", 1590], ["mehr", 1720]];
  for (const [ti, y] of symbole) icon(g, ti, 995, y);
  g.font = "600 30px Helvetica, Arial"; g.textAlign = "center"; g.fillStyle = "#fff";
  g.fillText("2.4K", 995, 1188); g.fillText("318", 995, 1348); g.fillText("96", 995, 1498); g.fillText("1.1K", 995, 1648);
  // das Konto
  g.fillStyle = "#1f6feb"; g.beginPath(); g.arc(85, 1715, 38, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 4; g.stroke();
  g.fillStyle = "#fff"; g.font = "800 30px Helvetica, Arial"; g.fillText("G", 85, 1726);
  g.textAlign = "left"; g.font = "700 36px Helvetica, Arial"; g.fillText("gindumac", 140, 1727);
  g.strokeStyle = "#fff"; g.lineWidth = 3; k.gerundet(g, 330, 1690, 130, 52, 14); g.stroke(); g.font = "600 30px Helvetica, Arial"; g.fillText("Follow", 349, 1726);
  g.font = "400 30px Helvetica, Arial"; g.globalAlpha = deck * 0.9; g.fillText("♫  gindumac · Original audio", 70, 1800);
  g.restore();
}
const AV = [["Lucy", "#f2a65a", "#5a3a22"], ["Jake", "#4a7bd6", "#2a1d14"], ["Mia", "#5fbf8f", "#c27b2c"], ["Dan", "#e3b04b", "#1c1c1c"], ["Zoe", "#d35d8a", "#3b2318"], ["Sam", "#8d99ae", "#6b4b33"]];
const POS = AV.map((_, i) => [220 + (i % 3) * 320, 1360 + Math.floor(i / 3) * 290]);
function avatar(g, x, y, [name, hintergrundC, haar], markiert) {
  g.save();
  g.beginPath(); g.arc(x, y, 100, 0, 7); g.fillStyle = hintergrundC; g.fill(); g.clip();
  g.fillStyle = "#f1c6a5"; g.beginPath(); g.ellipse(x, y + 140, 85, 70, 0, 0, 7); g.fill();
  g.fillStyle = "#f6d0b2"; g.beginPath(); g.arc(x, y + 5, 46, 0, 7); g.fill();
  g.fillStyle = haar; g.beginPath(); g.arc(x, y - 6, 50, Math.PI * 1.05, Math.PI * 1.95); g.fill();
  g.fillStyle = "#2a2a2a"; g.beginPath(); g.arc(x - 16, y + 6, 5, 0, 7); g.arc(x + 16, y + 6, 5, 0, 7); g.fill();
  g.strokeStyle = "#9b5a46"; g.lineWidth = 4; g.beginPath(); g.arc(x, y + 18, 14, 0.3, Math.PI - 0.3); g.stroke();
  g.restore();
  if (markiert > 0) {
    g.save(); g.globalAlpha = markiert; g.strokeStyle = "#3797f0"; g.lineWidth = 8; g.beginPath(); g.arc(x, y, 108, 0, 7); g.stroke();
    g.fillStyle = "#3797f0"; g.beginPath(); g.arc(x + 72, y + 72, 28, 0, 7); g.fill(); g.strokeStyle = "#262626"; g.lineWidth = 6; g.stroke();
    g.strokeStyle = "#fff"; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.moveTo(x + 60, y + 72); g.lineTo(x + 69, y + 82); g.lineTo(x + 86, y + 62); g.stroke(); g.restore();
  }
  g.fillStyle = "#f2f2f2"; g.font = `${markiert > 0.5 ? 700 : 400} 34px Helvetica, Arial`; g.textAlign = "center"; g.fillText(name, x, y + 152);
}
function blatt(g, steigt, markiert, knopf, gesendet) {
  if (steigt <= 0.003) return;
  g.save();
  g.fillStyle = `rgba(0,0,0,${0.5 * steigt})`; g.fillRect(0, 0, 1080, 1920);
  g.translate(0, (1 - steigt) * 900);
  g.fillStyle = "#262626"; k.gerundet(g, 0, 1050, 1080, 1000, 56); g.fill();
  g.fillStyle = "#6b6b6b"; k.gerundet(g, 490, 1075, 100, 10, 5); g.fill();
  g.fillStyle = "#3a3a3a"; k.gerundet(g, 50, 1120, 860, 92, 22); g.fill();
  g.strokeStyle = "#a8a8a8"; g.lineWidth = 5; g.beginPath(); g.arc(102, 1163, 15, 0, 7); g.moveTo(113, 1174); g.lineTo(126, 1187); g.stroke();
  g.fillStyle = "#a8a8a8"; g.font = "400 36px Helvetica, Arial"; g.textAlign = "left"; g.fillText("Search", 145, 1178);
  g.strokeStyle = "#f2f2f2"; g.lineWidth = 5; g.beginPath(); g.arc(985, 1152, 16, 0, 7); g.moveTo(958, 1192); g.quadraticCurveTo(985, 1160, 1012, 1192); g.moveTo(1018, 1150); g.lineTo(1018, 1176); g.moveTo(1005, 1163); g.lineTo(1031, 1163); g.stroke();
  AV.forEach((a, i) => avatar(g, POS[i][0], POS[i][1], a, i === 1 ? markiert : 0));
  // der Knopf
  if (knopf > 0.003) {
    const y = 1915 - 175 * k.kommtRein(knopf);
    g.fillStyle = "#262626"; g.fillRect(0, y - 20, 1080, 300);
    g.fillStyle = gesendet > 0.5 ? "#3a3a3a" : "#0095f6"; k.gerundet(g, 50, y, 980, 112, 24); g.fill();
    g.fillStyle = "#fff"; g.font = "700 40px Helvetica, Arial"; g.textAlign = "center";
    g.fillText(gesendet > 0.5 ? "✓  Sent" : "Send", 540, y + 70);
  }
  g.restore();
}
// vom Reel zum Bildschirm
const zumBildschirm = (z, x, y) => ({ x: k.misch(x, PX + (x - 540) * S, z), y: k.misch(y, PY + (y - 960) * S, z), s: k.misch(1, S, z) });
const PUNKTE = { teilen: [995, 1590], freund: POS[1], senden: [540, 1800] };

function male(g, t) {
  const z = k.sanft(k.rampe(t, Tz0, Tz1)) * (1 - k.sanft(k.rampe(t, Tzurueck0, Tzurueck1)));
  if (z <= 0.0005) { hakenSzene(g, t); return; }
  // das Reel, mit seiner Bedienung und dem Teilen-Blatt
  gr.setTransform(1, 0, 0, 1, 0, 0); gr.globalAlpha = 1; gr.globalCompositeOperation = "source-over";
  hakenSzene(gr, t);
  bedienung(gr, k.rampe(z, 0.4, 1));
  const steigt = k.kommtRein(k.rampe(t, Tsheet, Tsheet + 0.32)) * (1 - k.sanft(k.rampe(t, Tzurueck0 - 0.35, Tzurueck0)));
  const markiert = k.kommtRein(k.rampe(t, Tfreund, Tfreund + 0.12)), knopf = k.rampe(t, Tfreund + 0.05, Tfreund + 0.3), gesendet = t > TsendenKnopf + 0.04 ? 1 : 0;
  blatt(gr, steigt, markiert, knopf, gesendet);
  // das Handy
  hintergrund(g, 540, 1000);
  const a = zumBildschirm(z, 0, 0), b = zumBildschirm(z, 1080, 1920), m = 30 * a.s / S * S, rad = 70 * a.s / S;
  g.save(); g.shadowColor = "rgba(0,0,0,0.7)"; g.shadowBlur = 60; g.shadowOffsetY = 30;
  const cg = g.createLinearGradient(a.x, 0, b.x, 0); cg.addColorStop(0, "#3a3c42"); cg.addColorStop(0.5, "#1b1c20"); cg.addColorStop(1, "#4a4c52");
  g.fillStyle = cg; k.gerundet(g, a.x - m, a.y - m, b.x - a.x + 2 * m, b.y - a.y + 2 * m, rad + m); g.fill(); g.restore();
  // Seitentasten
  g.save(); const bt = g.createLinearGradient(b.x + m - 2, 0, b.x + m + 8 * a.s / S, 0); bt.addColorStop(0, "#5a5d64"); bt.addColorStop(1, "#1d1e22"); g.fillStyle = bt;
  k.gerundet(g, b.x + m - 3, a.y + 330 * a.s, 9 * a.s / S, 170 * a.s, 4); g.fill();
  g.fillStyle = "#2c2e33"; k.gerundet(g, a.x - m - 6 * a.s / S, a.y + 260 * a.s, 9 * a.s / S, 110 * a.s, 4); g.fill(); k.gerundet(g, a.x - m - 6 * a.s / S, a.y + 410 * a.s, 9 * a.s / S, 110 * a.s, 4); g.fill(); g.restore();
  // polierte Metallkante
  g.save(); const rg = g.createLinearGradient(a.x, a.y, b.x, b.y); rg.addColorStop(0, "rgba(255,255,255,0.55)"); rg.addColorStop(0.3, "rgba(255,255,255,0.12)"); rg.addColorStop(0.7, "rgba(255,255,255,0.06)"); rg.addColorStop(1, "rgba(255,255,255,0.4)");
  g.strokeStyle = rg; g.lineWidth = 3; k.gerundet(g, a.x - m + 1.5, a.y - m + 1.5, b.x - a.x + 2 * m - 3, b.y - a.y + 2 * m - 3, rad + m - 1.5); g.stroke();
  g.strokeStyle = "rgba(0,0,0,0.8)"; g.lineWidth = 2; k.gerundet(g, a.x - 3, a.y - 3, b.x - a.x + 6, b.y - a.y + 6, rad + 3); g.stroke(); g.restore();
  g.save(); k.gerundet(g, a.x, a.y, b.x - a.x, b.y - a.y, rad); g.clip(); g.drawImage(reel, a.x, a.y, b.x - a.x, b.y - a.y);
  g.fillStyle = "#000"; k.gerundet(g, (a.x + b.x) / 2 - 70 * a.s, a.y + 22 * a.s, 140 * a.s, 40 * a.s, 20 * a.s); g.fill();
  const rf = g.createLinearGradient(a.x, a.y, b.x, b.y); rf.addColorStop(0, "rgba(255,255,255,0.07)"); rf.addColorStop(0.35, "rgba(255,255,255,0.02)"); rf.addColorStop(0.36, "rgba(255,255,255,0)"); rf.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = rf; g.fillRect(a.x, a.y, b.x - a.x, b.y - a.y); g.restore();
  // der Finger
  const route = [[Tshare - 0.4, [1250, 2300]], [Tshare, PUNKTE.teilen], [Tshare + 0.25, [960, 1700]], [Tfreund, PUNKTE.freund], [Tfreund + 0.35, [700, 1600]], [TsendenKnopf - 0.15, PUNKTE.senden], [TsendenKnopf, PUNKTE.senden], [TsendenKnopf + 0.6, [1200, 2400]]];
  if (t > route[0][0] && t < route[route.length - 1][0]) {
    const xs = k.stuetzpunkte(route.map(([tt, p]) => [tt, p[0]])), ys = k.stuetzpunkte(route.map(([tt, p]) => [tt, p[1]]));
    const p = zumBildschirm(z, xs(t), ys(t));
    const ap = Math.max(k.puls(t, Tshare, 0.07), k.puls(t, Tfreund, 0.07), k.puls(t, TsendenKnopf, 0.07));
    if (ap > 0.3) { g.save(); g.globalAlpha = 0.35 * ap; g.fillStyle = "#fff"; g.beginPath(); g.arc(p.x, p.y, 34 + 30 * (1 - ap), 0, 7); g.fill(); g.restore(); }
    finger(g, p.x + 6, p.y + 26, ap);
  }
}

export function zeichne(g, t) { male(g, t); fertig(g, t); }
