// Satz 9, zweite Hälfte: im Profil trifft der gequetschte Haken die Wand, gleitet nicht rein, und die Null landet weit weg: falsch.
import * as k from "#kit";
import { v } from "#stimme";
import { T, szene, hintergrund, ansichtsRoute, kamera, nullEbene, rahmen, pfeil, mischRGB, ROT, TUERKIS, ROT_RGB, fertig } from "../welt.js";

export const von = "two";
const f9 = v.satz(9), T0 = f9.t("two"), Talways = f9.t("always"), Twrong = f9.t("wrong");
const SEITE = { m: [6, -6, 0], yaw: 0, pitch: 0.1, dist: 900, esc: 40, dy: 260, dx: 150 };
const ansicht = ansichtsRoute([[T0, { ...SEITE, m: [20, -6, 0], esc: 30 }], [Talways, SEITE], [f9.ende + 0.3, { ...SEITE, m: [4, -8, 0], esc: 40 }]]);
export const aufprall = Talways - 0.04;

function male(g, t) {
  const c = kamera(ansicht(t));
  const tx = k.misch(16, T, k.kommtRein(k.rampe(t, T0 - 0.04, Talways - 0.04)) ** 1);
  hintergrund(g, 540, 1100);
  szene(g, c, { tx, s: -T, wand: 0, color: ROT });
  const falsch = k.sanft(k.rampe(t, Twrong - 0.08, Twrong + 0.12));
  const col = mischRGB(TUERKIS, ROT_RGB, falsch);
  nullEbene(g, c, tx, 1, col, 1, [-22, 2], 17);
  rahmen(g, c, 0, tx, -22, 2, 17, falsch, ROT_RGB, 4);
  const aF = k.sanft(k.rampe(t, T0, T0 + 0.2)) * (1 - k.sanft(k.rampe(t, Talways, Talways + 0.25)));
  pfeil(g, 840 - 50 * k.kommtRein(k.rampe(t, T0, Talways)), 640, -1, aF);
}

export function zeichne(g, t) { male(g, t); fertig(g, t); }
