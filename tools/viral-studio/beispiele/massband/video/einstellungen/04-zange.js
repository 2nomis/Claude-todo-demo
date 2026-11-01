// Satz 9, erste Hälfte: eine Zange quetscht die Nieten und der Haken bleibt fest (rot).
import * as k from "#kit";
import { v } from "#stimme";
import { T, szene, hintergrund, ansichtsRoute, kamera, zange, P, GRAU, ROT, fertig } from "../welt.js";

export const von = "squeeze";
const f9 = v.satz(9), T0 = f9.anfang, Ttight = f9.t("tight"), Tone = f9.t("two");
const A = { m: [10, -5, 0], yaw: -0.8, pitch: 0.55, dist: 170, esc: 23, dy: 70 };
const ansicht = ansichtsRoute([[T0, { ...A, yaw: -0.95, esc: 21 }], [Ttight, A], [Tone, { ...A, yaw: -0.72, esc: 23.6 }]]);
export const quetscht = Ttight - 0.02;

function male(g, t) {
  const c = kamera(ansicht(t));
  const roete = k.sanft(k.rampe(t, Ttight - 0.02, Ttight + 0.14));
  hintergrund(g, 540, 1100);
  szene(g, c, { tx: 0, s: -T, brett: 0, color: GRAU.map((x, i) => k.misch(x, ROT[i], roete)) });
  const p = P(c, [8.5, T + 1, 0]);
  if (!p) return;
  const kommtRein = k.kommtRein(k.rampe(t, T0 - 0.04, Ttight - 0.12)), geht = k.geht(k.rampe(t, Ttight + 0.25, Tone - 0.2));
  const off = 700 * (1 - kommtRein) + 1600 * geht, ang = -1.02;
  const oeffnet = 0.13 * (1 - k.sanft(k.rampe(t, Ttight - 0.12, Ttight))) + 0.13 * k.sanft(k.rampe(t, Ttight + 0.15, Ttight + 0.3));
  zange(g, p.x + Math.cos(ang) * off, p.y + Math.sin(ang) * off, ang, oeffnet, 1.25);
}

export function zeichne(g, t) { male(g, t); fertig(g, t); }
