// Zeichnet das Bild in Sekunde t: die Einstellung, zu der es gehört, und darüber die Untertitel.
import { createCanvas } from "@napi-rs/canvas";
import { HOEHE, BREITE } from "./gemeinsam.mjs";
import { bausteine, zeichneUntertitel } from "./untertitel.mjs";

export const BLENDE = 0.3;

export function vorbereiten(proj) {
  const leinwand = createCanvas(BREITE, HOEHE), g = leinwand.getContext("2d");
  const abseits = createCanvas(BREITE, HOEHE);
  const subs = bausteine(proj.v.woerter, proj.dauer);
  const modus = proj.skript.untertitel || "oben";
  return { leinwand, g, abseits, subs, modus };
}

export function einstellungBei(proj, t) {
  const ps = proj.einstellungen;
  let i = 0;
  while (i + 1 < ps.length && t >= ps[i + 1].von) i++;
  return i;
}

function leeren(g) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = "source-over"; g.filter = "none";
  g.shadowBlur = 0; g.shadowColor = "rgba(0,0,0,0)"; g.shadowOffsetX = 0; g.shadowOffsetY = 0;
  g.setLineDash([]); g.lineCap = "butt"; g.lineJoin = "miter";
  g.fillStyle = "#000000"; g.fillRect(0, 0, BREITE, HOEHE);
}

function einstellung(p, g, t) {
  leeren(g);
  g.save();
  try { p.zeichne(g, t); }
  catch (e) { e.message = `Einstellung ${p.id}, Sekunde ${t.toFixed(3)}: ${e.message}`; throw e; }
  g.restore();
}

// optionen: { untertitel: false }, um es ohne sie zu sehen.
export function zeichneBild(proj, zst, t, optionen = {}) {
  const i = einstellungBei(proj, t), p = proj.einstellungen[i];
  einstellung(p, zst.g, t);
  if (p.uebergang === "blende" && i > 0 && t < p.von + BLENDE) {
    const ga = zst.abseits.getContext("2d");
    einstellung(proj.einstellungen[i - 1], ga, t);
    const u = (t - p.von) / BLENDE, k = u * u * (3 - 2 * u);
    // die vorige Einstellung obendrauf, beim Ausblenden
    zst.g.globalAlpha = 1 - k; zst.g.drawImage(zst.abseits, 0, 0); zst.g.globalAlpha = 1;
  }
  if (optionen.untertitel !== false) zeichneUntertitel(zst.g, t, zst.subs, zst.modus);
  return zst.leinwand;
}
