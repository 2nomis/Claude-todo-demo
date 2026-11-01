// «AirPods können ein Flugzeugtriebwerk verstummen lassen, und sie blockieren den Schall nicht einmal. Wohin geht
// also der Lärm?»
// Eine einzige Welt in einer Reihe: das Triebwerk (links), die Luft, der AirPod im Ohr und das Trommelfell (rechts).
// - Bild 0: ganz nah am sich drehenden Triebwerk; der Lärm kommt golden heraus. Die Kamera rast mit dem Lärm zum Ohr.
// - «verstummen»: Im Ohr wird die Luft still und das Trommelfell hält an.
// - «blockieren … nicht»: Der AirPod wird zu Glas: Der Lärm geht durch ihn hindurch (er blockiert ihn nicht), und die blaue Welle kommt heraus.
// - «Wohin geht also der Lärm?»: Die Kamera fährt in den Gang; das Gold draußen geht weiter, das Gold drinnen ist weg.
import * as k from "#kit";
import { v } from "#stimme";
import { ANTI, RAUSCHEN, pfad2D, ohrSzene, hintergrund, reactor, aufschrift, ohneAnsicht, schleier, vignette, ansicht } from "../welt.js";

export const von = 0;
const { sanft: su, rampe: tr, misch } = k;
const f1 = v.satz(1), f2 = v.satz(2);
const Tve = f1.t("verstummen"), Tbl = f1.t("blockieren"), Tni = f1.t("nicht"), Two = f2.t("wohin"), Tla = f2.t("larm"), Tende2 = v.satz(3).anfang;
export const verstummt = Tve - 0.05, glasig = Tbl - 0.1;

const cam = pfad2D([[0, [1.15, -560, 1000]], [1.7, [0.62, 120, 1000]], [Tve + 0.4, [0.64, 200, 1000]], [Tni, [0.7, 380, 1000]], [Two, [0.75, 420, 1000]], [Tende2, [1.25, 660, 1000]]]);

export function zeichne(g, t) {
  hintergrund(g);
  const [Z, cx, cy] = cam(t);
  ansicht(g, Z, cx, cy);
  const anti = su(tr(t, verstummt, verstummt + 0.35));
  reactor(g, -880, 1000, 520, t, 11);
  const m = ohrSzene(g, t, {
    draussen: [RAUSCHEN(22)],
    wellen: [RAUSCHEN(16), ANTI(16 * anti)],
    ap: { schnitt: 0.85 * su(tr(t, glasig, glasig + 0.4)), lautsprecher: anti * Math.sin(t * 7) },
  });
  // die Etiketten des Hooks
  aufschrift(g, 760, 790, 760, 900, "Trommelfell", su(tr(t, 1.2, 1.5)) * (1 - su(tr(t, Two, Two + 0.3))), "235,238,245", 40);
  aufschrift(g, -200, 760, -200, 900, "Triebwerk", su(tr(t, 0.3, 0.6)) * (1 - su(tr(t, Tve, Tve + 0.3))), "255,214,140", 44);
  ohneAnsicht(g);
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
