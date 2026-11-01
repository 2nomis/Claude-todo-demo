// «Nirgendwohin. Denn deine AirPods entfernen den Lärm gar nicht: Sie spielen einen zweiten Ton darüber. Sie hören
// dem Lärm zu und spielen sein genaues Gegenteil.»
// Ein anderer Ort: der AirPod im Ohr, nah und aus Glas, mit beiden Wellen über dem Gang gezeichnet.
// - «Nirgendwohin»: Die goldene Welle (der Lärm) ist noch ganz im Gang.
// - «zweiten Ton»: Die blaue Welle kommt aus dem Lautsprecher, über der goldenen.
// - «hören … zu»: Das äußere Mikro leuchtet golden auf und das Signal geht hinunter zum Chip. «Gegenteil»: die blaue, gespiegelt.
import * as k from "#kit";
import { v } from "#stimme";
import { ANTI, OHR, RAUSCHEN, pfad2D, ohrSzene, hintergrund, wellenLinie, aufschrift, ohneAnsicht, schleier, vignette, ansicht } from "../welt.js";

export const von = (vz) => vz.satz(3).anfang;
export const uebergang = "weiter";
const { sanft: su, rampe: tr } = k;
const f3 = v.satz(3), f4 = v.satz(4);
const T0 = f3.anfang, Tzw = f3.t("zweiten"), Tho = f4.t("horen"), Tge = f4.t("gegenteil"), Tende2 = v.satz(5).anfang;
export const geht = Tzw - 0.1, hoert = Tho - 0.05, spiegel = Tge - 0.1;
const cam = pfad2D([[T0 - 0.6, [1.25, 660, 1000]], [T0 + 1.2, [1.2, 600, 960]], [Tzw, [1.22, 610, 950]], [Tho, [1.3, 470, 980]], [Tende2, [1.2, 600, 960]]]);

export function zeichne(g, t) {
  hintergrund(g);
  const [Z, cx, cy] = cam(t);
  ansicht(g, Z, cx, cy);
  const zuf = su(tr(t, geht, geht + 0.5)), mic = su(tr(t, hoert, hoert + 0.3)), esp = su(tr(t, spiegel, spiegel + 0.4));
  const y = OHR.y - 230;
  ohrSzene(g, t, {
    draussen: [RAUSCHEN(22)],
    wellen: [RAUSCHEN(16), ANTI(16 * Math.max(zuf, 1 - su(tr(t, T0 + 0.1, T0 + 0.9))))],
    ap: { schnitt: 0.85, mic, chip: mic > 0.1 ? "255,190,80" : null, lautsprecher: zuf * Math.sin(t * 7) },
    zeilen: () => {
      wellenLinie(g, t, OHR.x0 + 40, OHR.x1, y, 46, RAUSCHEN(16), su(tr(t, T0 + 0.3, T0 + 0.9)));
      wellenLinie(g, t, OHR.x0 + 40, OHR.x0 + 40 + (OHR.x1 - OHR.x0 - 40) * zuf, y, 46, ANTI(16), zuf);
    },
  });
  aufschrift(g, OHR.x1 - 60, y - 110, OHR.x1 - 90, y - 40, "Lärm", su(tr(t, T0 + 0.3, T0 + 0.6)), "255,205,120", 38);
  aufschrift(g, OHR.x0 + 120, y - 110, OHR.x0 + 150, y - 40, esp > 0.5 ? "Gegenteil" : "zweiter Ton", zuf, "140,195,255", 38);
  ohneAnsicht(g);
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
