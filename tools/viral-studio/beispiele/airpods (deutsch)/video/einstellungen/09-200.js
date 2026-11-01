// «Bei den ersten AirPods Pro wurde das laut Apple 200 Mal pro Sekunde korrigiert.»
// Ein anderer Ort: der ganze AirPod, weiß und glänzend, der sich langsam in seinem Licht dreht. «AirPods Pro»: «AirPods Pro · 2019».
// «200»: Die Zahl zählt hoch; um sie herum pulsiert ein Lichtring immer schneller.
import * as k from "#kit";
import { v } from "#stimme";
import { airpod, hintergrund, schleier, vignette } from "../welt.js";

export const von = (vz) => vz.satz(15).anfang;
const { sanft: su, rampe: tr, misch } = k;
const f = v.satz(15);
const T0 = f.anfang, Tpr = f.t("pro"), T200 = f.t("200"), Tko = f.t("korrigiert"), Tende2 = v.satz(16).anfang;
export const ziffer = T200 - 0.1;

export function zeichne(g, t) {
  hintergrund(g, "255,200,140", { tisch: true, horizont: 1180 });
  const ent = k.kommtRein(tr(t, T0 - 0.05, T0 + 0.6));
  // der Studiospot, der von oben herunterkommt, und der Schatten auf dem Tisch
  g.save(); g.globalCompositeOperation = "lighter"; const fz = g.createLinearGradient(0, 0, 0, 1400); fz.addColorStop(0, "rgba(255,235,210,0.16)"); fz.addColorStop(1, "rgba(255,235,210,0)");
  g.fillStyle = fz; g.beginPath(); g.moveTo(420, 0); g.lineTo(700, 0); g.lineTo(980, 1400); g.lineTo(140, 1400); g.closePath(); g.fill(); g.restore();
  g.save(); g.filter = "blur(30px)"; g.fillStyle = "rgba(0,0,0,0.6)"; g.beginPath(); g.ellipse(560, 1350, 260, 40, 0, 0, 6.2832); g.fill(); g.restore();
  const s = misch(1.25, 1.45, su(tr(t, T0, Tende2)));
  airpod(g, 560 - (1 - ent) * 600, 980, s, { ang: -0.15 + 0.08 * Math.sin(t * 0.8) });
  // die Korrekturringe
  const c = su(tr(t, ziffer, ziffer + 0.3));
  if (c > 0.01) { g.save(); g.globalCompositeOperation = "lighter"; const fr = misch(1.2, 5, su(tr(t, ziffer, Tko))); for (let i = 0; i < 5; i++) { const u = ((t * fr + i / 5) % 1); g.strokeStyle = `rgba(140,195,255,${0.5 * c * (1 - u)})`; g.lineWidth = 3; g.beginPath(); g.arc(640, 960, 240 + u * 260, 0, 6.2832); g.stroke(); } g.restore(); }
  // das Modell-Etikett
  const la = su(tr(t, Tpr - 0.2, Tpr + 0.2));
  if (la > 0.01) { g.save(); g.globalAlpha = la; g.font = "700 40px Figtree"; g.textAlign = "left"; g.fillStyle = "rgba(255,255,255,0.85)"; g.fillText("AirPods Pro · 2019", 120, 640); g.restore(); }
  if (c > 0.01) { const n = Math.round(misch(0, 200, su(tr(t, ziffer, ziffer + 0.8)))); k.pille(g, 540, 1500, String(n), "× pro Sekunde", "190,220,255", c, 110); }
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
