// «Deshalb löschen sie ein Triebwerk aus, aber nicht die Person, die neben dir redet. Ein gleichmäßiger, tiefer Ton
// ist leicht vorherzusagen. Eine Stimme ändert sich zu schnell, um rechtzeitig umgedreht zu werden.»
// Ein anderer Ort: zwei Spuren übereinander, die zum Ohr laufen (rechts).
// - Oben das Triebwerk: seine regelmäßige goldene Welle; die blaue Vorhersage (umgekehrt) folgt ihr, und was das Ohr erreicht, ist eine
//   gerade Linie. «Triebwerk aus»: Die gerade Linie wird markiert.
// - «Person … redet»: Unten kommt eine Person herein; ihre Stimme ist eine goldene Welle, die sich ständig ändert.
// - «leicht vorherzusagen»: Oben passt die Vorhersage. «zu schnell»: Unten kommt das Blau zu spät, und was das
//   Ohr erreicht, zittert weiter.
import * as k from "#kit";
import { v } from "#stimme";
import { BLAU, GOLDTON, hintergrund, person, reactor, schleier, vignette } from "../welt.js";

export const von = (vz) => vz.satz(16).anfang;
const { sanft: su, rampe: tr, misch, gerundet } = k;
const f16 = v.satz(16), f17 = v.satz(17);
const T0 = f16.anfang, Tau = f16.t("aus"), Tpe = f16.t("person"), Tre = f16.t("redet"), Tle = f17.t("leicht"), Tst = f17.t("stimme"), Tsc = f17.t("schnell"), Tende2 = v.satz(18).anfang;
export const personKommt = Tpe - 0.1, scheitert = Tsc - 0.2;
const XA = 260, XB = 860, Y1 = 800, Y2 = 1280;
// die Stimme: mehrere Frequenzen, die sich ändern
const stimme = (x, t) => { const s = t * 1.0 - x * 0.004; return 0.55 * Math.sin(x * 0.05 - t * 9) * (0.6 + 0.4 * Math.sin(s * 3.1)) + 0.35 * Math.sin(x * 0.11 - t * 15 + Math.sin(s * 2)) + 0.25 * Math.sin(x * 0.023 - t * 5); };
const ton = (x, t) => Math.sin(x * 0.03 - t * 6);

function spur(g, t, y, f, pred, verzoegerung, deck, etikett) {
  if (deck <= 0.01) return;
  g.save(); g.globalAlpha *= deck; g.globalCompositeOperation = "lighter"; g.lineJoin = "round"; g.lineCap = "round";
  const zeile = (fn, col, a, w, h = 95) => { g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = w; g.beginPath(); for (let x = XA; x <= XB; x += 3) { const yy = y - h * fn(x); x === XA ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); };
  const schmutzig = (x) => f(x, t) - (pred > 0 ? pred * f(x, t - verzoegerung) : 0);
  // der Lärm (gold), die Vorhersage (blau, umgekehrt und mit ihrer Verzögerung) und was übrig bleibt (weiß)
  for (const [w, a] of [[14, 0.15], [4, 0.95]]) zeile((x) => f(x, t), GOLDTON, a * (1 - 0.6 * pred), w);
  if (pred > 0.01) for (const [w, a] of [[14, 0.12], [3, 0.8]]) zeile((x) => -f(x, t - verzoegerung), BLAU, a * pred, w);
  g.restore();
  // was das Ohr erreicht, im letzten Abschnitt
  g.save(); g.globalAlpha *= deck * pred; g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 4; g.beginPath();
  for (let x = XB + 40; x <= XB + 120; x += 3) { const yy = y - 95 * schmutzig(x - 120); x === XB + 40 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); g.restore();
  // das Ohr am Ende: eine senkrechte Linie
  g.save(); g.globalAlpha *= deck; g.strokeStyle = "rgba(255,210,190,0.8)"; g.lineWidth = 6; g.beginPath(); g.moveTo(XB + 140, y - 80); g.quadraticCurveTo(XB + 160, y, XB + 140, y + 80); g.stroke();
  g.font = "800 40px Figtree"; g.textAlign = "left"; g.fillStyle = "rgba(255,255,255,0.85)"; g.fillText(etikett, XA - 180, y - 150); g.restore();
}

export function zeichne(g, t) {
  hintergrund(g);
  const p1 = su(tr(t, Tle - 0.3, Tle + 0.2)), p2 = su(tr(t, Tst, Tst + 0.4));
  const a1 = k.kommtRein(tr(t, T0 - 0.05, T0 + 0.4)), a2 = su(tr(t, personKommt, personKommt + 0.4));
  // oben: das kleine Triebwerk und seine Spur
  reactor(g, 140, Y1, 95, t, 11);
  spur(g, t, Y1, ton, Math.max(p1, su(tr(t, T0 + 0.3, Tau))), 0, a1, "Triebwerk");
  // unten: die Person und ihre Stimme
  if (a2 > 0.01) { g.save(); g.globalAlpha = a2; person(g, 140, Y2 - 30, 0.75, Math.abs(stimme(XA, t))); g.restore(); }
  spur(g, t, Y2, stimme, p2, misch(0, 0.09, su(tr(t, scheitert, scheitert + 0.4))), a2, "Stimme");
  // die Urteile
  const v1 = su(tr(t, Tau - 0.1, Tau + 0.2)), v2 = su(tr(t, Tsc, Tsc + 0.3));
  const markierung = (y, ok, deck) => { if (deck < 0.01) return; g.save(); g.globalAlpha = deck; g.translate(XB + 150, y + 130); g.beginPath(); g.arc(0, 0, 30, 0, 6.2832); g.fillStyle = ok ? "#30c25a" : "#ff453a"; g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); if (ok) { g.moveTo(-12, 0); g.lineTo(-3, 10); g.lineTo(13, -10); } else { g.moveTo(-10, -10); g.lineTo(10, 10); g.moveTo(10, -10); g.lineTo(-10, 10); } g.stroke(); g.restore(); };
  markierung(Y1, true, v1); markierung(Y2, false, v2);
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
