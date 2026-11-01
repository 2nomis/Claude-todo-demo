// «Folg mir und schick das jemandem, der seine AirPods nie herausnimmt.»
// Ein anderer Ort: das Handy in beiden Händen, mit genau diesem Video auf dem Bildschirm (das Ohr und seine Wellen).
// - «Folg mir»: Der Daumen tippt auf «Folgen» und es wird zu «Gefolgt». «schick das»: tippt auf Teilen und das Blatt mit den
//   Kontakten gleitet hoch. «jemandem … AirPods nie herausnimmt»: wählt jemanden (mit AirPods im Ohr) und «Senden» → «Gesendet».
// - Am Ende: Die Kamera fährt auf «Gesendet» zu und blendet in das erste Bild des Videos über.
import * as k from "#kit";
import { v } from "#stimme";
import { ANTI, OHR, RAUSCHEN, ohrSzene, hintergrund, schleier, vignette } from "../welt.js";
import { SH, SW, avatar, handy } from "../handy.js";
import { haendeVorne, haendeHinten, tippen } from "../haende2.js";
import { zeichne as nahaufnahme } from "./01-hook.js";

export const von = (vz) => vz.satz(21).anfang;
const { sanft: su, rampe: tr, misch, gerundet, kommtRein } = k;
const f = v.satz(21);
const T0 = f.anfang, Tfo = f.t("folg"), Tsc = f.t("schick"), Tje = f.t("jemandem"), Tni = f.t("nie"), Tende2 = v.dauer;
export const weiter = Tfo + 0.15, teilt = Tsc - 0.05, waehlt = Tje + 0.35, sendet = Tni + 0.25;
const FOLLOW = [150, 1010], SHARE = [SW - 56, 880], KONTAKT = [SW / 2, 830], SEND = [SW / 2, 1000];
const BERUEHRUNGEN = [[FOLLOW, weiter], [SHARE, teilt], [KONTAKT, waehlt], [SEND, sendet]];
const T = (c, txt, x, y, groesse, gewicht = 600, color = "#fff", deck = "left") => { c.font = `${gewicht} ${groesse}px Figtree`; c.textAlign = deck; c.textBaseline = "middle"; c.fillStyle = color; c.fillText(txt, x, y); };
const reel = k.leinwand(1080, 1920);
const anfang = k.leinwand(1080, 1920);

function bildschirm(c, t) {
  // das Reel: das Ohr und seine Wellen, bildschirmfüllend
  const r = reel.getContext("2d"); r.setTransform(1, 0, 0, 1, 0, 0); r.globalAlpha = 1; r.globalCompositeOperation = "source-over"; r.filter = "none";
  r.fillStyle = "#0b0b0d"; r.fillRect(0, 0, 1080, 1920);
  r.save(); r.translate(-80, -60); r.scale(1.1, 1.1); ohrSzene(r, t, { draussen: [RAUSCHEN(20)], wellen: [RAUSCHEN(16), ANTI(16)], ap: { schnitt: 0.5, chip: "90,170,255", lautsprecher: Math.sin(t * 7) }, n: 900 }); r.restore();
  c.drawImage(reel, 0, 0, SW, SH);
  const vg = c.createLinearGradient(0, SH * 0.55, 0, SH); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.8)"); c.fillStyle = vg; c.fillRect(0, 0, SW, SH);
  // der Creator und «Folgen»
  c.save(); c.beginPath(); c.arc(56, FOLLOW[1], 26, 0, 6.2832); c.fillStyle = "#f2b33d"; c.fill(); c.restore(); T(c, "Erklärt", 56, FOLLOW[1] + 1, 12, 800, "#1a1205", "center");
  T(c, "dein.kanal", 92, FOLLOW[1], 22, 700);
  const fg = su(tr(t, weiter, weiter + 0.2));
  gerundet(c, 214, FOLLOW[1] - 22, 120, 44, 12); c.fillStyle = fg > 0.5 ? "rgba(255,255,255,0.12)" : "#fff"; c.fill(); if (fg > 0.5) { c.strokeStyle = "rgba(255,255,255,0.5)"; c.lineWidth = 2; c.stroke(); }
  T(c, fg > 0.5 ? "Gefolgt" : "Folgen", 274, FOLLOW[1] + 1, 20, 800, fg > 0.5 ? "#fff" : "#111", "center");
  if (fg > 0.01 && fg < 1) k.leuchten(c, 274, FOLLOW[1], 200, "255,255,255", (1 - fg) * 0.6);
  T(c, "So löschen AirPods Lärm", 30, FOLLOW[1] + 50, 18, 500, "rgba(255,255,255,0.8)");
  // die Knöpfe des Reels
  c.strokeStyle = "#fff"; c.lineWidth = 3.5;
  c.beginPath(); c.moveTo(SW - 56, 720 + 22); c.bezierCurveTo(SW - 56 - 38, 720 - 2, SW - 56 - 18, 720 - 34, SW - 56, 720 - 12); c.bezierCurveTo(SW - 56 + 18, 720 - 34, SW - 56 + 38, 720 - 2, SW - 56, 720 + 22); c.stroke();
  c.beginPath(); c.ellipse(SW - 56, 800, 22, 19, 0, 0.35, 6.2); c.lineTo(SW - 78, 822); c.closePath(); c.stroke();
  const sh = k.puls(t, teilt, 0.15);
  c.save(); c.translate(SHARE[0], SHARE[1]); c.scale(1 + 0.3 * sh, 1 + 0.3 * sh); c.beginPath(); c.moveTo(-22, 2); c.lineTo(22, -18); c.lineTo(6, 22); c.lineTo(0, 6); c.closePath(); c.stroke(); c.restore();
  // das Teilen-Blatt
  const blatt = kommtRein(tr(t, teilt + 0.05, teilt + 0.4));
  if (blatt > 0.001) {
    const y0 = misch(SH, 560, blatt);
    c.save(); c.shadowColor = "rgba(0,0,0,0.6)"; c.shadowBlur = 40; gerundet(c, 0, y0, SW, SH, 34); c.fillStyle = "rgba(26,26,30,0.98)"; c.fill(); c.restore();
    c.fillStyle = "rgba(255,255,255,0.28)"; gerundet(c, SW / 2 - 36, y0 + 14, 72, 7, 4); c.fill();
    gerundet(c, 24, y0 + 40, SW - 48, 54, 16); c.fillStyle = "#2c2c30"; c.fill(); T(c, "Suchen", 56, y0 + 67, 20, 500, "rgba(255,255,255,0.45)");
    const sel = su(tr(t, waehlt, waehlt + 0.25)), namen = ["Mia", "Jonas", "Lea", "Ben", "Emma"];
    namen.forEach((nm, i) => {
      const cxp = 60 + i * 120, cyp = y0 + 200, mitte = i === 2;
      const zz = mitte ? misch(1, 1.9, sel) : 1, dx = mitte ? misch(0, SW / 2 - cxp, sel) : (i < 2 ? -sel * 40 : sel * 40);
      c.save(); c.globalAlpha = mitte ? 1 : 1 - 0.55 * sel; c.translate(cxp + dx, cyp + (mitte ? 70 * sel : 0)); c.scale(zz, zz);
      avatar(c, 0, 0, 40);
      if (mitte) { c.fillStyle = "#f4f4f6"; c.beginPath(); c.ellipse(-26, 6, 7, 10, 0, 0, 6.2832); c.fill(); c.fillRect(-29, 12, 5, 16); }
      if (mitte && sel > 0.5) { c.strokeStyle = "#0a84ff"; c.lineWidth = 4 / zz; c.beginPath(); c.arc(0, 0, 46, 0, 6.2832); c.stroke(); c.fillStyle = "#0a84ff"; c.beginPath(); c.arc(30, 30, 12, 0, 6.2832); c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 3; c.beginPath(); c.moveTo(24, 30); c.lineTo(29, 35); c.lineTo(37, 25); c.stroke(); }
      c.restore();
      if (!mitte || sel < 0.5) T(c, nm, cxp + dx, cyp + 64, 18, 600, `rgba(255,255,255,${mitte ? 0.85 : 0.85 - 0.5 * sel})`, "center");
      else T(c, "Lea", SW / 2, cyp + 70 + 92, 26, 800, "#fff", "center");
    });
    const env = su(tr(t, sendet, sendet + 0.25));
    gerundet(c, 30, SEND[1] - 36, SW - 60, 72, 18); c.fillStyle = env > 0.5 ? "#1f7a3a" : "#0a84ff"; c.fill();
    T(c, env > 0.5 ? "Gesendet" : "Senden", SW / 2 + (env > 0.5 ? 18 : 0), SEND[1] + 1, 26, 800, "#fff", "center");
    if (env > 0.5) { c.strokeStyle = "#fff"; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(SW / 2 - 92, SEND[1]); c.lineTo(SW / 2 - 82, SEND[1] + 10); c.lineTo(SW / 2 - 64, SEND[1] - 10); c.stroke(); }
    if (env > 0.01 && env < 1) k.leuchten(c, SW / 2, SEND[1], SW, "120,255,160", 0.5 * (1 - env));
  }
  c.fillStyle = "rgba(255,255,255,0.8)"; gerundet(c, SW / 2 - 90, SH - 22, 180, 8, 4); c.fill();
}

export function zeichne(g, t) {
  hintergrund(g, "255,185,90", { tisch: true, horizont: 760 });
  const ac = su(tr(t, sendet + 0.3, sendet + 1.0)), zf = su(tr(t, Tende2 - 1.5, Tende2 - 0.1));
  let esc = misch(0.98, 1.6, ac), X = 540, Y = misch(930, 930 + (SH / 2 - 830) * 1.6 - 60, ac);
  // das Ende: fährt auf «Lea» und «Gesendet» zu
  const EF = 3.0; X = misch(X, 540, zf); Y = misch(Y, 960 - (900 - SH / 2) * EF, zf); esc = misch(esc, EF, zf);
  // beim Senden senken die Hände das Handy ein wenig und entfernen sich: Die Kamera bleibt beim Bildschirm
  const draussen = su(tr(t, sendet + 0.3, sendet + 0.9));
  const zst = tippen(t, BERUEHRUNGEN);
  if (draussen < 0.999) { g.save(); g.translate(0, draussen * 1100); haendeHinten(g, X, Y, esc, zst); g.restore(); }
  handy(g, X, Y, esc, 0, bildschirm, t);
  if (draussen < 0.999) { g.save(); g.translate(0, draussen * 1100); haendeVorne(g, X, Y, esc, zst); g.restore(); }
  schleier(g, 0.5);
  vignette(g, 0.5, t);
  // und blendet in das erste Bild über, damit man die Schleife nicht bemerkt
  const fu = su(tr(t, Tende2 - 0.75, Tende2 - 0.03));
  if (fu > 0.001) { const c = anfang.getContext("2d"); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; c.filter = "none"; c.fillStyle = "#000"; c.fillRect(0, 0, 1080, 1920); nahaufnahme(c, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = fu; g.drawImage(anfang, 0, 0); g.restore(); }
}
