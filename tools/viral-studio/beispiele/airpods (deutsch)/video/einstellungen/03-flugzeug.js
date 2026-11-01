// «Stell dir vor, du sitzt im Flugzeug, und das Triebwerk ist ein einziges, langes, tiefes Dröhnen.»
// Ein anderer Ort: das Flugzeugfenster, groß; draußen das Triebwerk. «Triebwerk»: Die Lärmringe kommen heraus;
// «Dröhnen»: Sie füllen die Kabine.
import * as k from "#kit";
import { v } from "#stimme";
import { hintergrund, schleier, bullauge, vignette } from "../welt.js";

export const von = (vz) => vz.satz(5).anfang;
const { sanft: su, rampe: tr, misch } = k;
const f = v.satz(5);
const T0 = f.anfang, Ttr = f.t("triebwerk"), Tdr = f.t("drohnen"), Tende2 = v.satz(6).anfang;
export const bruellt = Ttr - 0.05;

export function zeichne(g, t) {
  hintergrund(g, "180,200,255");
  // die Kabinenwand, hell und gewölbt
  const pg = g.createLinearGradient(0, 0, 1080, 0); pg.addColorStop(0, "#2b2d33"); pg.addColorStop(0.5, "#4a4d55"); pg.addColorStop(1, "#24262b");
  g.fillStyle = pg; g.fillRect(0, 560, 1080, 1360);
  const z = misch(1, 1.12, su(tr(t, T0, Tende2)));
  g.save(); g.translate(540, 1080); g.scale(z, z);
  bullauge(g, 0, 0, 860, t, su(tr(t, bruellt, bruellt + 0.5)) * (0.7 + 0.3 * su(tr(t, Tdr - 0.2, Tdr + 0.4))));
  g.restore();
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
