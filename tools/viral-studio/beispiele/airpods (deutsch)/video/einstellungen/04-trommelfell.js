// «Schall ist nur Luft, die an deinem Trommelfell drückt und zieht, hunderte Male pro Sekunde.»
// Ein anderer Ort: der Gang ohne AirPod, nah; die Luft sind winzige Punkte. «Luft»: die Punkte ruhig. «drückt»: Das
// Gold drückt und das Trommelfell sinkt ein; «zieht»: Es wölbt sich nach außen. «hunderte»: Der Zähler läuft.
import * as k from "#kit";
import { v } from "#stimme";
import { OHR, RAUSCHEN, luft, pfad2D, hintergrund, ohr, aufschrift, ohneAnsicht, trommelfell, schleier, vignette, ansicht } from "../welt.js";

export const von = (vz) => vz.satz(6).anfang;
const { sanft: su, rampe: tr, misch } = k;
const f = v.satz(6);
const T0 = f.anfang, Tlu = f.t("luft"), Tdr = f.t("druckt"), Tzi = f.t("zieht"), Thu = f.t("hunderte"), Tse = f.t("sekunde"), Tende2 = v.satz(7).anfang;
export const schiebt = Tdr - 0.1, zaehlung = Thu - 0.1;
const cam = pfad2D([[T0, [1.35, 560, 1000]], [Tdr, [1.55, 760, 1000]], [Tende2, [1.6, 800, 1000]]]);

export function zeichne(g, t) {
  hintergrund(g);
  const [Z, cx, cy] = cam(t);
  ansicht(g, Z, cx, cy);
  const A = 18 * su(tr(t, schiebt, schiebt + 0.4));
  // erst ein langsames Drücken und dann immer schneller
  const w = misch(3, 9, su(tr(t, Thu - 0.2, Tse)));
  const q = RAUSCHEN(A, { w, k: 0.03 });
  ohr(g, t);
  luft(g, t, [OHR.x0 - 300, OHR.y - OHR.r + 12, OHR.x1 - 4, OHR.y + OHR.r - 12], [q], { n: 2000, groesse: 3.4 });
  trommelfell(g, t, A / 18 * Math.sin(q.k * OHR.x1 - q.w * t));
  aufschrift(g, OHR.x0 + 200, OHR.y - 200, OHR.x0 + 220, OHR.y - 60, "Luft", su(tr(t, Tlu - 0.1, Tlu + 0.2)) * (1 - su(tr(t, Thu, Thu + 0.3))), "235,238,245", 32);
  aufschrift(g, OHR.x1 + 40, OHR.y - 220, OHR.x1 + 24, OHR.y - 70, "Trommelfell", su(tr(t, Tdr - 0.6, Tdr - 0.3)), "255,210,190", 32);
  ohneAnsicht(g);
  // der Zähler
  const c = su(tr(t, zaehlung, zaehlung + 0.3));
  if (c > 0.01) { const n = Math.round(misch(2, 260, su(tr(t, zaehlung, Tse + 0.3)))); k.pille(g, 540, 1420, String(n), "× pro Sekunde", "255,210,122", c, 96); }
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
