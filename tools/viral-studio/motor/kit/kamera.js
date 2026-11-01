// Die Kamera: ein Punkt in der Welt, der auf einen anderen schaut, mit Perspektive. Was weit weg ist, wirkt klein, was nah ist,
// wirkt groß, und wenn sich die Kamera bewegt, bewegt sich alles wie in einem Film. Die Welteinheiten sind beliebig; was zählt,
// ist das Verhältnis zwischen der Entfernung der Kamera und der Größe jedes Dings.
import { stuetzpunkte, kreuz, pkt, teil, einh } from "./base.js";

export const CX = 540, CY = 960; // die Mitte des Bildes
export const F = 1400;           // die Brennweite: in der Entfernung d wird etwas der Größe s zu F·s/d Pixeln

const achsen = (f) => { const r = einh(kreuz(f, [0, 1, 0])); return { f, r, u: kreuz(r, f) }; };

// Die Kamera bei P, die auf ziel schaut (y = oben).
export const blicktAuf = (P, ziel) => ({ p: P, e: achsen(einh(teil(ziel, P))) });

// Wo ein Weltpunkt X im Bild landet: { x, y, z } (z, die Entfernung geradeaus), oder null, wenn er dahinter liegt.
export function projiziere(cam, X) {
  const d = teil(X, cam.p), z = pkt(d, cam.e.f);
  if (z < 0.05) return null;
  return { x: CX + (F * pkt(d, cam.e.r)) / z, y: CY - (F * pkt(d, cam.e.u)) / z, z };
}

// Die Größe in Pixeln von etwas mit Radius s in der Entfernung z.
export const groesseBei = (s, z) => (F * s) / z;

// Ein Punkt um eine Mitte: Winkel (Radiant, 0 = vorne, Richtung +z), Entfernung und Höhe.
export const umlaufbahn = (winkel, dist, hoch = 0, mitte = [0, 0, 0]) => [mitte[0] + dist * Math.sin(winkel), mitte[1] + hoch, mitte[2] + dist * Math.cos(winkel)];

// Eine Kamerafahrt: Stützpunkte aus [Sekunde, { pos, blicktAuf }]. Zwischen den Stützpunkten bewegt sich die Kamera ohne Ruckeln und ohne
// anzuhalten (jede Koordinate auf einer stetigen Kurve); beim ersten beginnt sie ruhig und beim letzten hält sie an.
// Gibt cam(t) zurück. Für Spuren ist das vorige Bild cam(t - 1/60).
//   const cam = route([[v.t("grün"), { pos: [0, 0, 40], blicktAuf: [0, 0, 0] }], [v.t("geben"), { pos: [0, 0, 400], blicktAuf: [0, 0, 0] }]]);
export function route(liste) {
  const ks = liste.slice().sort((a, b) => a[0] - b[0]);
  const c = (sel, i) => stuetzpunkte(ks.map(([t, k]) => [t, sel(k)[i]]));
  const P = [0, 1, 2].map((i) => c((k) => k.pos, i)), O = [0, 1, 2].map((i) => c((k) => k.blicktAuf, i));
  return (t) => blicktAuf([P[0](t), P[1](t), P[2](t)], [O[0](t), O[1](t), O[2](t)]);
}

// Sortiert, was gezeichnet wird, von fern nach nah: dinge = [{ z, zeichne() }].
export function vonFernNachNah(dinge) {
  dinge.sort((a, b) => b.z - a.z);
  for (const c of dinge) c.zeichne();
}
