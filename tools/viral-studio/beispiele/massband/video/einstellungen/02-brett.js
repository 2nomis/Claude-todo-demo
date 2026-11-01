// Sätze 4-5: der Haken an der Kante eines Bretts eingehakt; das Band zieht und der Haken gleitet raus; die Null genau an der Kante.
import * as k from "#kit";
import { v } from "#stimme";
import { T, szene, hintergrund, ansichtsRoute, kamera, nullEbene, zeile, pfeil, P, TUERKIS, fertig } from "../welt.js";

export const von = "hook#2";
const f4 = v.satz(4), f5 = v.satz(5);
const T0 = f4.anfang, Tpull = f4.t("pull"), Tslides = f4.t("slides"), Tzero = f5.t("zero"), Ttouch = f5.t("touches");

const A = { m: [8, -6, 0], yaw: -0.72, pitch: 0.5, dist: 170, esc: 24, dy: 60 };
const B = { m: [8, -6, 0], yaw: -0.86, pitch: 0.5, dist: 170, esc: 25, dy: 60 };
const C = { m: [6, -7, 0], yaw: -1.02, pitch: 0.46, dist: 170, esc: 23, dy: 60 };
const ansicht = ansichtsRoute([[T0 - 0.1, { ...A, pitch: 0.5, esc: 22 }], [T0 + 0.6, A], [Tslides, B], [Tzero, { ...B, yaw: -0.92, esc: 25.5 }], [f5.ende + 0.2, C]]);
export const steigt = T0 + 0.05, zieht = Tslides - 0.05;

export function zustand(t) {
  const tx = k.misch(-T, 0, k.sanft(k.rampe(t, Tslides - 0.05, Tslides + 0.3)));
  return { tx, s: -T - tx, brett: 0, brettY: k.misch(-70, 0, k.kommtRein(k.rampe(t, T0 - 0.05, T0 + 0.45))) };
}

function male(g, t) {
  const c = kamera(ansicht(t)), e = zustand(t);
  hintergrund(g, 540, 1100);
  szene(g, c, e);
  // die Null, auf der Innenfläche des Hakens, die die Kante berührt
  const uZ = k.rampe(t, Tzero - 0.05, Tzero + 0.35);
  nullEbene(g, c, 0, uZ, TUERKIS, 1, [-22, 8], 17);
  const uL = k.sanft(k.rampe(t, Ttouch - 0.1, Ttouch + 0.45));
  zeile(g, c, [0, -0.6, 0], [0, -0.6, 40], uL, TUERKIS, 5);
  zeile(g, c, [0, -0.6, 0], [0, -0.6, -40], uL, TUERKIS, 5);
  // der Pfeil: ziehen
  const aF = k.sanft(k.rampe(t, Tpull - 0.08, Tpull + 0.15)) * (1 - k.sanft(k.rampe(t, Tslides + 0.4, Tslides + 0.65)));
  pfeil(g, 800 + 40 * k.kommtRein(k.rampe(t, Tpull - 0.08, Tslides + 0.3)), 640, 1, aF);
}

export function zeichne(g, t) { male(g, t); fertig(g, t); }
