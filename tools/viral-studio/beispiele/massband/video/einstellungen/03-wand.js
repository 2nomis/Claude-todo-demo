// Sätze 6-8: die Wand kommt rein, der Haken trifft sie und gleitet rein; die Null auf der Außenfläche. Dann im Profil: die Wand
// geht weg, der Haken gleitet raus, das Brett steigt, und die Null hat sich nicht bewegt: Seine Dicke kommt nie in die Ablesung.
import * as k from "#kit";
import { v } from "#stimme";
import { T, szene, hintergrund, ansichtsRoute, kamera, nullEbene, zeile, rahmen, pfeil, TUERKIS, GOLDTON, fertig } from "../welt.js";

export const von = "but";
const f6 = v.satz(6), f7 = v.satz(7), f8 = v.satz(8);
const T0 = f6.anfang, Tpush = f6.t("push"), Twall = f6.t("wall"), Tin = f6.t("slides");
const Tzero = f7.t("zero"), Ttouch = f7.t("touches"), Tmeasure = f8.t("measure"), Tthick = f8.t("thickness"), Tnever = f8.t("never"), Tsneaks = f8.t("sneaks");

const A = { m: [10, -5, 0], yaw: 0.22, pitch: 0.36, dist: 170, esc: 24, dy: 80 };
const B = { m: [8, -6, 0], yaw: 0.16, pitch: 0.32, dist: 170, esc: 26, dy: 80 };
const SEITE = { m: [10, -6, 0], yaw: 0, pitch: 0.1, dist: 900, esc: 32, dy: 170, dx: 60 };
const ansicht = ansichtsRoute([[T0, { ...A, yaw: 0.4, esc: 21 }], [Twall, A], [Tzero, B], [f7.ende, { ...B, yaw: 0.0, esc: 31 }], [f7.ende + 0.55, SEITE], [Tthick, { ...SEITE, esc: 33.5 }], [Tnever + 0.2, { ...SEITE, m: [18, -6, 0], esc: 27 }]]);

export const aufprall = Twall - 0.02, steckt = Tin + 0.05, wandRaus = Tmeasure - 0.15, brettSteigt = Tmeasure + 0.35, hakenRaus = Tmeasure + 0.12;

export function zustand(t) {
  // 1. die Wand kommt und trifft den Haken (raus, s = -T); 2. das Band drückt und der Haken gleitet rein
  let tx = k.misch(T, 0, k.sanft(k.rampe(t, Tin - 0.05, Tin + 0.3)));
  let s = -tx; // die Außenfläche, an der Wand (x = 0)
  // 3. im Profil: die Wand geht weg, der Haken gleitet raus (s -> -T), das Brett steigt
  const geht = k.sanft(k.rampe(t, Tmeasure + 0.12, Tmeasure + 0.38));
  s = k.misch(s, -T, geht);
  const wandX = t < Twall ? k.misch(-90, 0, k.kommtRein(k.rampe(t, T0 + 0.05, Twall - 0.02)) ** 1) : k.misch(0, -160, k.geht(k.rampe(t, Tmeasure - 0.15, Tmeasure + 0.25)));
  const brettY = k.misch(-90, 0, k.kommtRein(k.rampe(t, Tmeasure + 0.35, Tmeasure + 0.75)));
  return { tx, s, wand: wandX > -150 ? wandX : null, wandZ: 0, brett: t > Tmeasure + 0.3 ? 0 : null, brettY };
}

function male(g, t) {
  const c = kamera(ansicht(t)), e = zustand(t);
  hintergrund(g, 540, 1100);
  szene(g, c, e);
  // die Null: an der Wand (Außenfläche); im Profil sieht sie aus wie eine Linie, die sich nicht bewegt
  const uZ = k.rampe(t, Tzero - 0.05, Tzero + 0.35);
  nullEbene(g, c, 0, uZ, TUERKIS, 1, [-22, 8], 17);
  const uL = k.sanft(k.rampe(t, Ttouch - 0.1, Ttouch + 0.4)) * (1 - k.sanft(k.rampe(t, f7.ende, f7.ende + 0.3)));
  zeile(g, c, [0, -14, 17], [0, 30, 17], uL, TUERKIS, 5);
  // die Dicke
  const uM = k.sanft(k.rampe(t, Tthick - 0.05, Tthick + 0.25));
  rahmen(g, c, -T, 0, -15.5, T + 0.4, 12, uM, GOLDTON, 4);
  // kommt nie in die Ablesung: die Linie läuft das Band entlang ab der Null
  zeile(g, c, [0, 0.9, 12], [70, 0.9, 12], k.sanft(k.rampe(t, Tnever, Tsneaks + 0.55)), TUERKIS, 6);
  // der Pfeil: drücken
  const aF = k.sanft(k.rampe(t, Tpush - 0.08, Tpush + 0.15)) * (1 - k.sanft(k.rampe(t, Tin + 0.35, Tin + 0.6)));
  pfeil(g, 820 - 40 * k.kommtRein(k.rampe(t, Tpush, Tin + 0.3)), 640, -1, aF);
}

export function zeichne(g, t) { male(g, t); fertig(g, t); }
