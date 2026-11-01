// «Ein Chip nimmt diese Welle und dreht sie auf den Kopf.»
// Ein anderer Ort: der Chip, groß. «Welle»: auf seinem Bildschirm die goldene Welle. «dreht … auf den Kopf»: Die Welle dreht sich um
// ihre Achse und kommt kopfüber heraus, in Blau.
import * as k from "#kit";
import { v } from "#stimme";
import { GOLDTON, BLAU, chip, hintergrund, wellenLinie, platte, schleier, vignette } from "../welt.js";

export const von = (vz) => vz.satz(8).anfang;
const { sanft: su, rampe: tr, misch } = k;
const f = v.satz(8);
const T0 = f.anfang, Twe = f.t("welle"), Tdr = f.t("dreht"), Tko = f.t("kopf"), Tende2 = v.satz(9).anfang;
export const dreht = Tdr - 0.05;

export function zeichne(g, t) {
  hintergrund(g);
  const z = misch(0.92, 1.04, su(tr(t, T0, Tende2))), uu = su(tr(t, dreht, Tko + 0.15));
  g.save(); g.translate(540, 1000); g.scale(z * 1.1, z * 1.1); g.translate(-540, -1000); platte(g, t, su(tr(t, T0, Twe)), k.mischRgb(GOLDTON, BLAU, uu)); g.restore();
  const ent = k.kommtRein(tr(t, T0 - 0.05, T0 + 0.5));
  g.save(); g.translate(540, 1050 + (1 - ent) * 300); g.scale(z, z); g.rotate(-0.05 * (1 - ent));
  const u = su(tr(t, dreht, Tko + 0.15));
  chip(g, 0, 0, 900, 600, t, (c, w, h) => {
    const ap = su(tr(t, Twe - 0.3, Twe + 0.2));
    c.save(); c.translate(0, h / 2); c.scale(1, Math.cos(u * Math.PI)); c.translate(0, -h / 2);
    wellenLinie(c, t, 0, w, h / 2, 120, { k: 0.028, w: 4, color: k.mischRgb(GOLDTON, BLAU, u) }, ap, 6);
    c.restore();
    // die Nulllinie
    c.strokeStyle = "rgba(255,255,255,0.15)"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
  });
  g.restore();
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
