// Sätze 1-3: der Haken ganz nah; zieht zurück aufs ganze Maßband und kommt wieder; klappert; wird rot («broken»); die Kamera
// dreht sich ins Profil, er wird durchsichtig und man sieht, dass er sich genau um seine eigene Dicke bewegt.
import * as k from "#kit";
import { v } from "#stimme";
import { T, szene, hintergrund, ansichtsRoute, kamera, reif, rahmen, P, klappern, klapperTreffer, mitUnschaerfe, geschwindigkeit, unschaerfeVon, GRAU, ROT, GOLDTON, fertig } from "../welt.js";

export const von = 0;
const f1 = v.satz(1), f2 = v.satz(2), f3 = v.satz(3);
const Thook = f1.t("hook"), Ttape = f1.t("tape"), Tloose = f1.t("loose"), Tbroken = f2.t("broken");
const Tmoves = f3.t("moves"), Tthick = f3.t("thickness"), Tnot = f3.t("not");

export const NAH = { m: [9, -4, 0], yaw: -0.82, pitch: 0.42, dist: 120, esc: 25, dy: 60 };
const ANFANG = { ...NAH, yaw: -1.0, pitch: 0.36, esc: 21 };
const FERN = { m: [70, 22, 0], yaw: -0.6, pitch: 0.42, dist: 420, esc: 6.6, dy: 60 };
const SEITE = { m: [9, -5, 0], yaw: 0, pitch: 0.16, dist: 700, esc: 36, dy: 40 };
const SEITE2 = { m: [6, -6, 0], yaw: 0, pitch: 0.12, dist: 700, esc: 44, dy: 40 };
const ansicht = ansichtsRoute([
  [0, ANFANG], [Thook + 0.2, NAH], [Ttape - 0.22, NAH], [Ttape + 0.08, FERN], [Tloose - 0.3, FERN], [Tloose - 0.02, NAH],
  [Tbroken + 0.5, { ...NAH, yaw: -0.92, esc: 26.5 }], [Tbroken + 1.05, SEITE], [Tthick - 0.1, { ...SEITE, esc: 39 }], [Tthick + 0.6, SEITE2],
]);
export const cam = (t) => kamera(ansicht(t));

export const trefferListe = [
  ...klapperTreffer(0.06, 2, 0.17), ...klapperTreffer(Tloose + 0.08, 6, 0.13),
  ...klapperTreffer(Tmoves + 0.05, 2, 0.28), ...klapperTreffer(Tnot - 0.05, 3, 0.26),
];
export const momente = { rausZoomen: Ttape - 0.22, reinZoomen: Tloose - 0.3, roete: Tbroken - 0.04, drehung: Tbroken + 0.5, strahlen: Tthick - 0.12 };

function rutsch(t) {
  if (t < Tloose) return klappern(t, 0.06, 2, 0.17);
  if (t < Tmoves) return klappern(t, Tloose + 0.08, 6, 0.13);
  if (t < Tnot - 0.05) return klappern(t, Tmoves + 0.05, 2, 0.28);
  return klappern(t, Tnot - 0.05, 3, 0.26);
}

function male(g, t) {
  const c = cam(t), c0 = cam(t - 1 / 30);
  const bl = unschaerfeVon(geschwindigkeit(c0, c, [10, 0, 0], 30));
  const roete = k.sanft(k.rampe(t, Tbroken - 0.04, Tbroken + 0.1)) * (1 - k.sanft(k.rampe(t, Tbroken + 0.55, Tbroken + 1.0)));
  const color = GRAU.map((x, i) => k.misch(x, ROT[i], roete));
  const strahlen = k.sanft(k.rampe(t, Tthick - 0.12, Tthick + 0.2));
  mitUnschaerfe(g, bl, (h) => {
    hintergrund(h);
    szene(h, c, { tx: 0, s: rutsch(t), color, strahlen, massbandGehaeuse: t > Ttape - 0.3 && t < Tloose + 0.1 ? 1 : 0 });
    // die Lücke so dick wie der Haken
    const uM = k.sanft(k.rampe(t, Tthick - 0.05, Tthick + 0.25));
    rahmen(h, c, -T, 0, -15.6, 2.6, 12, uM, GOLDTON, 4);
  });
  // goldener Ring um den Haken
  const p = P(c, [9, -5, 0]);
  if (p) {
    const u = k.kommtRein(k.rampe(t, Thook - 0.05, Thook + 0.35)), deck = 1 - k.sanft(k.rampe(t, Tloose - 0.3, Tloose - 0.05));
    reif(g, p.x, p.y, (c.F / k.laenge(k.teil(c.p, [9, -5, 0]))) * 15.5, u, GOLDTON, deck);
  }
}

export function zeichne(g, t) { male(g, t); fertig(g, t); }
