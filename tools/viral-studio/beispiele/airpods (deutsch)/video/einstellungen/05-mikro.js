// «Außen an jedem AirPod sitzt ein winziges Mikrofon, und es hört dieses Dröhnen einen Sekundenbruchteil, bevor es
// dein Ohr erreicht.»
// Ein anderer Ort: der AirPod nah, von außen. «Mikrofon»: Sein Gitter leuchtet auf und bekommt ein Etikett. «hört … Dröhnen»: Das
// Gold kommt von links und die Kamera zieht zurück, um das Ohr zu zeigen. «Sekundenbruchteil»: Das Signal läuft im
// AirPod zum Lautsprecher (aus Glas), während der Lärm noch den Gang hinunterwandert. «Ohr erreicht»: Es erreicht das Trommelfell.
import * as k from "#kit";
import { v } from "#stimme";
import { AP, OHR, RAUSCHEN, airpod, pfad2D, ohrSzene, hintergrund, aufschrift, ohneAnsicht, schleier, vignette, ansicht } from "../welt.js";

export const von = (vz) => vz.satz(7).anfang;
const { sanft: su, rampe: tr, misch } = k;
const f = v.satz(7);
const T0 = f.anfang, Tmi = f.t("mikrofon"), Thr = f.t("hort"), Tse = f.t("sekundenbruchteil"), Tbe = f.t("bevor"), Ter = f.t("erreicht"), Tende2 = v.satz(8).anfang;
export const leuchtetAuf = Tmi - 0.05, signal = Tse, kommtAn = Ter;
// das Gitter des Mikros, in Weltkoordinaten
const MX = AP.x + (-49 * Math.cos(0.52) - 188 * Math.sin(0.52)) * AP.s, MY = AP.y + (-49 * Math.sin(0.52) + 188 * Math.cos(0.52)) * AP.s;
const cam = pfad2D([[T0, [1.7, MX + 120, MY - 60]], [Tmi + 0.3, [2.0, MX + 90, MY - 30]], [Thr, [1.8, MX + 120, MY - 40]], [Tse, [1.15, 560, 1000]], [Tende2, [1.15, 600, 1000]]]);

export function zeichne(g, t) {
  hintergrund(g);
  const [Z, cx, cy] = cam(t);
  ansicht(g, Z, cx, cy);
  const mic = su(tr(t, leuchtetAuf, leuchtetAuf + 0.25));
  // die Lärmfront: erreicht das Mikro bei «hört» und wandert langsam den Gang hinunter bis zum Trommelfell bei «erreicht»
  const gegenueber = misch(MX - 40, OHR.x1 + 10, su(tr(t, Thr, kommtAn)));
  const schnitt = su(tr(t, signal - 0.3, signal));
  ohrSzene(g, t, {
    draussen: [RAUSCHEN(20, { bis: Math.min(gegenueber, AP.x) })],
    wellen: [RAUSCHEN(16, { bis: gegenueber })],
    ap: { schnitt: 0.88 * schnitt, mic: Math.max(mic * 0.6, k.puls(t, Thr + 0.1, 0.3)), chip: t > signal + 0.15 ? "255,190,80" : null },
  });
  // das Signal: ein goldener Funke, der vom Mikro zum Chip und zum Lautsprecher läuft (fast sofort)
  const u = tr(t, signal, signal + 0.35);
  if (u > 0 && u < 1) {
    const pts = [[MX, MY], [AP.x - 50 * AP.s, AP.y - 30 * AP.s], [AP.x + 85 * AP.s, AP.y - 10 * AP.s]];
    const seg = u < 0.5 ? 0 : 1, uu = (u % 0.5) * 2, a = pts[seg], b = pts[seg + 1];
    k.leuchten(g, misch(a[0], b[0], uu), misch(a[1], b[1], uu), 160, "255,200,90", 1);
  }
  // «noch unterwegs»: die Strecke, die der Lärm noch vor sich hat
  const nu = su(tr(t, Tbe - 0.2, Tbe + 0.2)) * (1 - su(tr(t, kommtAn - 0.3, kommtAn)));
  if (nu > 0.01) {
    g.save(); g.globalAlpha = nu; g.strokeStyle = "rgba(255,214,140,0.9)"; g.lineWidth = 3; const yb = OHR.y + OHR.r + 50;
    g.beginPath(); g.moveTo(gegenueber, yb - 12); g.lineTo(gegenueber, yb + 12); g.moveTo(gegenueber, yb); g.lineTo(OHR.x1, yb); g.moveTo(OHR.x1, yb - 12); g.lineTo(OHR.x1, yb + 12); g.stroke(); g.restore();
    aufschrift(g, (gegenueber + OHR.x1) / 2, OHR.y + OHR.r + 100, (gegenueber + OHR.x1) / 2, OHR.y + OHR.r + 52, "noch unterwegs", nu, "255,214,140", 30);
  }
  aufschrift(g, MX - 70, MY + 90, MX - 6, MY + 10, "Mikrofon", su(tr(t, leuchtetAuf + 0.1, leuchtetAuf + 0.4)) * (1 - su(tr(t, Tse - 0.3, Tse))), "255,214,140", 22);
  aufschrift(g, AP.x - 60, AP.y - 190, AP.x - 46, AP.y - 60, "Signal", su(tr(t, signal + 0.2, signal + 0.5)) * (1 - su(tr(t, Tende2 - 0.4, Tende2 - 0.1))), "255,214,140", 30);
  ohneAnsicht(g);
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
