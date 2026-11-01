// «Und deshalb ist der Sitz so wichtig. Wenn der Aufsatz dein Ohr nicht abdichtet, dringt der Lärm daran vorbei.»
// Ein anderer Ort: der Ohrstöpsel am Eingang des Ohrs, ganz nah.
// - «Sitz»: Der Ohrstöpsel dichtet ab und die Dichtung wird markiert (ein weißer Ring). «nicht abdichtet»: Der AirPod rutscht ein wenig heraus und
//   oben bleibt eine Lücke, in Rot. «dringt … vorbei»: Das Gold kommt durch die Lücke herein, ohne sein Gegenteil.
import * as k from "#kit";
import { v } from "#stimme";
import { AP, ANTI, OHR, RAUSCHEN, pfad2D, ohrSzene, hintergrund, aufschrift, ohneAnsicht, schleier, vignette, ansicht } from "../welt.js";

export const von = (vz) => vz.satz(18).anfang;
const { sanft: su, rampe: tr, misch } = k;
const f = v.satz(18);
const T0 = f.anfang, Tsi = f.t("sitz"), Tab = f.t("abdichtet"), Tdr = f.t("dringt"), Tende2 = v.satz(19).anfang;
export const geht = Tab - 0.4, leck = Tdr - 0.1;
const cam = pfad2D([[T0, [1.8, 500, 980]], [Tsi + 0.3, [2.1, 470, 960]], [Tdr, [1.7, 600, 980]], [Tende2, [1.65, 620, 980]]]);

export function zeichne(g, t) {
  hintergrund(g);
  const [Z, cx, cy] = cam(t);
  ansicht(g, Z, cx, cy);
  const salz = su(tr(t, geht, geht + 0.5)), fu = su(tr(t, leck, leck + 0.5));
  ohrSzene(g, t, {
    draussen: [RAUSCHEN(20)],
    // Lärm, den der AirPod nicht vorhergesagt hat, kommt durch die Lücke herein
    wellen: [RAUSCHEN(16 * (1 + 0.5 * fu)), ANTI(16)],
    ap: { schnitt: 0.4, chip: "90,170,255" },
    apX: -40 * salz, apY: 18 * salz, apAng: -0.12 * salz,
  });
  // die gute Dichtung: ein weißer Ring, wo der Ohrstöpsel den Gang berührt
  const abschluss = su(tr(t, Tsi - 0.1, Tsi + 0.2)) * (1 - salz);
  const ex = AP.x + 170 * AP.s + 70 * AP.s;
  if (abschluss > 0.01) { g.save(); g.globalAlpha = abschluss; g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 4; g.beginPath(); g.ellipse(ex - 30, OHR.y - 10, 22, OHR.r + 4, 0, 0, 6.2832); g.stroke(); g.restore(); }
  // die Lücke, oben, in Rot
  if (salz > 0.01) {
    g.save(); g.globalAlpha = salz; g.fillStyle = "rgba(255,69,58,0.85)"; g.beginPath(); g.ellipse(ex - 40, OHR.y - OHR.r + 4, 34, 9, 0, 0, 6.2832); g.fill(); k.leuchten(g, ex - 40, OHR.y - OHR.r, 160, "255,69,58", 0.5 * salz); g.restore();
    // das Gold, das durch die Lücke hereindringt
    if (fu > 0.01) { g.save(); g.globalCompositeOperation = "lighter"; const zuf = k.zufall(5); for (let i = 0; i < 80; i++) { const u = (zuf() + t * 0.6) % 1, x = misch(ex - 120, ex + 120, u), yy = OHR.y - OHR.r - 30 + Math.sin(u * 3.14) * 60 + (zuf() - 0.5) * 20; g.fillStyle = `rgba(255,200,90,${0.8 * fu})`; g.fillRect(x, yy, 4, 4); } g.restore(); }
  }
  aufschrift(g, ex - 40, OHR.y - OHR.r - 120, ex - 40, OHR.y - OHR.r - 6, "undicht", salz, "255,120,110", 30);
  aufschrift(g, ex + 90, OHR.y + OHR.r + 110, ex - 20, OHR.y + OHR.r - 10, "Aufsatz", su(tr(t, T0 + 0.2, T0 + 0.5)) * (1 - su(tr(t, Tsi + 0.4, Tsi + 0.7))), "235,238,245", 28);
  ohneAnsicht(g);
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
