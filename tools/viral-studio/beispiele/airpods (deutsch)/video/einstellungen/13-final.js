// «Deine AirPods blockieren also nicht die Welt. Sie spielen ihr genaues Gegenteil, und beides zusammen ergibt: nichts.»
// Ein anderer Ort: oben das Fenster mit dem brüllenden Triebwerk; unten das Ohr mit dem AirPod. Draußen klingt die Welt weiter.
// - «Welt»: Die goldenen Ringe füllen die Kabine und erreichen den AirPod. «Gegenteil»: Das Blau kommt heraus.
// - «ergibt: nichts»: Im Ohr wird die Luft still und weiß; «stille Luft».
import * as k from "#kit";
import { v } from "#stimme";
import { ANTI, OHR, RAUSCHEN, ohrSzene, hintergrund, aufschrift, schleier, bullauge, vignette } from "../welt.js";

export const von = (vz) => vz.satz(20).anfang;
const { sanft: su, rampe: tr, misch } = k;
const f = v.satz(20);
const T0 = f.anfang, Twe = f.t("welt"), Tge = f.t("gegenteil"), Tni = f.t("nichts"), Tende2 = v.satz(21).anfang;
export const blau = Tge - 0.2, nichts = Tni - 0.15;

export function zeichne(g, t) {
  hintergrund(g);
  const z = misch(1, 1.06, su(tr(t, T0, Tende2)));
  g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
  g.save(); g.beginPath(); g.rect(-200, 1030, 1500, 1200); g.clip();
  g.save(); g.translate(60, 500); g.scale(0.9, 0.9);
  const zuf = su(tr(t, blau, blau + 0.4));
  ohrSzene(g, t, { draussen: [RAUSCHEN(20)], wellen: [RAUSCHEN(16), ANTI(16 * zuf)], ap: { schnitt: 0.5, chip: zuf > 0.2 ? "90,170,255" : null, lautsprecher: zuf * Math.sin(t * 7) } });
  const n = su(tr(t, nichts, nichts + 0.3));
  aufschrift(g, OHR.x1 - 150, OHR.y + OHR.r + 110, OHR.x1 - 160, OHR.y + 20, "stille Luft", n, "235,238,245", 40);
  g.restore(); g.restore();
  bullauge(g, 540, 720, 470, t, su(tr(t, T0, Twe)));
  g.restore();
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
