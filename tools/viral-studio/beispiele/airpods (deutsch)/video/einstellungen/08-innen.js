// «Aber die Kopie ist nie perfekt. Deshalb gibt es ein zweites Mikrofon, innen, das auf dein Ohr zeigt. Es hört den
// Lärm, der übrig bleibt, und löscht auch den.»
// Ein anderer Ort: der Ohrstöpsel und der Gang, ganz nah.
// - «nie perfekt»: Der Gegenschall bleibt um ein Haar zu kurz: Ein goldenes Zittern bleibt und das Trommelfell zittert ein wenig.
// - «zweites Mikrofon, innen»: Am Ohrstöpsel leuchtet das innere Mikro auf, in Blau, und bekommt ein Etikett.
// - «hört den Lärm, der übrig bleibt»: ein Strahl vom Mikro zum goldenen Rest. «löscht auch den»: Der Rest blendet aus.
import * as k from "#kit";
import { v } from "#stimme";
import { AP, ANTI, OHR, RAUSCHEN, pfad2D, ohrSzene, hintergrund, aufschrift, ohneAnsicht, schleier, vignette, ansicht } from "../welt.js";

export const von = (vz) => vz.satz(13).anfang;
const { sanft: su, rampe: tr, misch } = k;
const f13 = v.satz(13), f14 = v.satz(14);
const T0 = f13.anfang, Tpe = f13.t("perfekt"), Tmi = f14.t("mikrofon"), Tin = f14.t("innen"), Tub = f14.t("ubrig"), Tlo = f14.t("loscht"), Tende2 = v.satz(15).anfang;
export const rest = Tpe - 0.1, mikro = Tin - 0.1, loescht = Tlo - 0.05;
const MX = AP.x + 232 * AP.s, MY = AP.y + 52 * AP.s;
const cam = pfad2D([[T0, [2.6, MX + 60, MY - 10]], [T0 + 1.5, [2.3, MX + 80, MY - 20]], [Tmi, [2.2, MX + 90, MY - 20]], [Tub, [1.7, 680, 1000]], [Tende2, [1.7, 690, 1000]]]);

export function zeichne(g, t) {
  hintergrund(g);
  const [Z, cx, cy] = cam(t);
  ansicht(g, Z, cx, cy);
  const kurz = su(tr(t, rest, rest + 0.4)) * (1 - su(tr(t, loescht, loescht + 0.6)));
  const mic = su(tr(t, mikro, mikro + 0.3));
  ohrSzene(g, t, {
    draussen: [RAUSCHEN(20)],
    wellen: [RAUSCHEN(16), ANTI(16 * (1 - 0.28 * kurz))],
    ap: { schnitt: 0.9, chip: "90,170,255", micIn: mic, lautsprecher: Math.sin(t * 7) },
  });
  // der Strahl vom inneren Mikro zum Rest
  const hz = su(tr(t, Tub - 0.2, Tub + 0.2)) * (1 - su(tr(t, loescht + 0.3, loescht + 0.7)));
  if (hz > 0.01) { g.save(); g.globalCompositeOperation = "lighter"; const gg = g.createLinearGradient(MX, 0, OHR.x1, 0); gg.addColorStop(0, `rgba(140,195,255,${0.45 * hz})`); gg.addColorStop(1, "rgba(140,195,255,0)"); g.fillStyle = gg; g.beginPath(); g.moveTo(MX, MY); g.lineTo(OHR.x1, OHR.y - OHR.r + 20); g.lineTo(OHR.x1, OHR.y + OHR.r - 20); g.closePath(); g.fill(); g.restore(); }
  aufschrift(g, MX + 40, MY + 130, MX + 2, MY + 14, "zweites Mikrofon", mic * (1 - su(tr(t, Tub, Tub + 0.3))), "140,195,255", 22);
  aufschrift(g, OHR.x1 - 180, OHR.y + OHR.r + 60, OHR.x1 - 160, OHR.y + 30, "Rest", kurz * (1 - mic * 0.0), "255,205,120", 30);
  ohneAnsicht(g);
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
