// «In den Einstellungen deines iPhones gibt es einen Test dafür: den Ohreinsatz-Passformtest.»
// Ein anderer Ort: ein iPhone auf dem Tisch mit den AirPods-Einstellungen. «Einstellungen»: der Bildschirm der AirPods Pro;
// «Test»: Die Zeile «Ohreinsatz-Passformtest» wird hervorgehoben und angetippt; «Passformtest»: der Test, mit beiden AirPods
// und «Gute Abdichtung» in Grün.
import * as k from "#kit";
import { v } from "#stimme";
import { airpod, hintergrund, schleier, vignette } from "../welt.js";
import { SH, SW, zumBildschirm, handy } from "../handy.js";

export const von = (vz) => vz.satz(19).anfang;
const { sanft: su, rampe: tr, misch, gerundet } = k;
const f = v.satz(19);
const T0 = f.anfang, Tei = f.t("einstellungen"), Tte = f.t("test"), Tpa = f.t("ohreinsatz-passformtest"), Tende2 = v.satz(20).anfang;
export const drueckt = Tte + 0.15, oeffnet = Tpa - 0.1, ergebnis = Tpa + 0.7;
const T = (c, txt, x, y, groesse, gewicht = 600, color = "#fff", deck = "left") => { c.font = `${gewicht} ${groesse}px Figtree`; c.textAlign = deck; c.textBaseline = "middle"; c.fillStyle = color; c.fillText(txt, x, y); };
const ROW = 700;

function parameter(c, t) {
  c.fillStyle = "#000"; c.fillRect(0, 0, SW, SH);
  T(c, "9:41", 60, 42, 26, 800); c.fillStyle = "#fff"; gerundet(c, SW - 100, 32, 44, 20, 6); c.fill();
  T(c, "‹ Einstellungen", 30, 110, 24, 600, "#0a84ff");
  c.save(); c.translate(SW / 2 - 60, 250); airpod(c, 0, 0, 0.32, { ang: -0.2 }); c.restore();
  c.save(); c.translate(SW / 2 + 80, 250); c.scale(-1, 1); airpod(c, 0, 0, 0.32, { ang: -0.2 }); c.restore();
  T(c, "AirPods Pro", SW / 2, 400, 34, 800, "#fff", "center");
  const reihe = (y, txt, sub, on) => { gerundet(c, 24, y - 40, SW - 48, 80, 18); c.fillStyle = on ? "#2c3a52" : "#1c1c1e"; c.fill(); T(c, txt, 50, y, 24, 600, on ? "#fff" : "rgba(255,255,255,0.9)"); if (sub) T(c, sub, SW - 70, y, 22, 500, "rgba(255,255,255,0.45)", "right"); T(c, "›", SW - 44, y, 30, 500, "rgba(255,255,255,0.35)", "right"); };
  reihe(500, "Geräuschkontrolle", "Geräuschunterdr.");
  reihe(600, "Gedrückt halten", "");
  const m = su(tr(t, Tte - 0.2, Tte + 0.1));
  reihe(ROW, "Ohreinsatz-Passformtest", "", m > 0.5);
  if (m > 0.01) { c.save(); c.globalAlpha = m; gerundet(c, 24, ROW - 40, SW - 48, 80, 18); c.strokeStyle = "#0a84ff"; c.lineWidth = 3; c.stroke(); c.restore(); }
  reihe(800, "Automatische Ohrerkennung", "");
  reihe(900, "Mikrofon", "Automatisch");
}
function probe(c, t) {
  c.fillStyle = "#000"; c.fillRect(0, 0, SW, SH);
  T(c, "9:41", 60, 42, 26, 800);
  T(c, "Ohreinsatz-", SW / 2, 160, 36, 800, "#fff", "center"); T(c, "Passformtest", SW / 2, 205, 36, 800, "#fff", "center");
  const r = su(tr(t, ergebnis, ergebnis + 0.4));
  T(c, r > 0.5 ? "Ergebnis" : "Setze beide AirPods ein und starte den Test", SW / 2, 270, 20, 500, "rgba(255,255,255,0.6)", "center");
  for (const [x, flip] of [[SW / 2 - 110, false], [SW / 2 + 110, true]]) {
    c.save(); c.translate(x, 560); if (flip) c.scale(-1, 1); airpod(c, 0, 0, 0.62, { ang: -0.3 }); c.restore();
    if (r > 0.01) { c.save(); c.globalAlpha = r; c.fillStyle = "#30c25a"; c.beginPath(); c.arc(x, 820, 18, 0, 6.2832); c.fill(); T(c, "Gute", x, 868, 24, 700, "#30c25a", "center"); T(c, "Abdichtung", x, 898, 24, 700, "#30c25a", "center"); c.restore(); }
  }
  // der Klangbalken, während er testet
  if (r < 0.99) { for (let i = 0; i < 24; i++) { const h = 10 + 30 * Math.abs(Math.sin(t * 9 + i)); c.fillStyle = "rgba(10,132,255,0.8)"; gerundet(c, SW / 2 - 180 + i * 15, 980 - h / 2, 8, h, 4); c.fill(); } }
  gerundet(c, 40, SH - 170, SW - 80, 84, 20); c.fillStyle = "#0a84ff"; c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(SW / 2 - 12, SH - 146); c.lineTo(SW / 2 + 16, SH - 128); c.lineTo(SW / 2 - 12, SH - 110); c.closePath(); c.fill();
}

export function zeichne(g, t) {
  hintergrund(g, "255,190,120", { tisch: true, horizont: 760 });
  const ent = k.kommtRein(tr(t, T0 - 0.05, T0 + 0.5)), X = 540, Y = 960 + (1 - ent) * 500, esc = misch(1.0, 1.08, su(tr(t, T0, Tende2))), ang = -0.04;
  const ab = su(tr(t, oeffnet, oeffnet + 0.35));
  handy(g, X, Y, esc, ang, (c, tt) => { parameter(c, tt); if (ab > 0.01) { c.save(); c.globalAlpha = ab; c.translate((1 - ab) * SW, 0); probe(c, tt); c.restore(); } }, t);
  // das Tippen auf die Zeile
  const u = tr(t, drueckt, drueckt + 0.5);
  if (u > 0 && u < 1) { const [px, py] = zumBildschirm(X, Y, esc, ang, SW / 2, ROW); g.save(); g.strokeStyle = `rgba(255,255,255,${0.9 * (1 - u)})`; g.lineWidth = 4; g.beginPath(); g.arc(px, py, 30 + 90 * u, 0, 6.2832); g.stroke(); g.restore(); }
  schleier(g, 0.5);
  vignette(g, 0.5, t);
}
