// Die Untertitel des Hauses, über jedes Bild gezeichnet: ein paar Wörter auf einmal, oben; jedes Wort erscheint, wenn es
// gesagt wird (mit einer Unschärfe, die sich klärt), das Wort, das gerade gesagt wird, weiß und fett, die schon gesagten grau, und das
// Schlüsselwort jedes Satzes in seinem blauen Kasten mit zwei Griffen, wie eine Textauswahl.
// Die Wörter bewegen sich nicht, wenn sie von fett zu grau wechseln: Jedes hat seinen Platz ab dem Moment, in dem der Block erscheint.
import { GlobalFonts } from "@napi-rs/canvas";
import { join } from "node:path";
import { WURZEL } from "./gemeinsam.mjs";

for (const p of ["Medium", "Bold", "ExtraBold"]) GlobalFonts.registerFromPath(join(WURZEL, "schriften", `Figtree-${p}.ttf`), "Figtree");

export const STIL = {
  groesse: 74, zeile: 82, links: 170, breite: 740, oben: 318, unten: 1200, luecke: 19,
  tinte: "#ffffff", gesagt: "#7b818a", markierung: "#2f7cf6",
  vorgriff: 0.08, // das Wort erscheint kurz bevor man es hört, damit man es rechtzeitig liest
};
const E = STIL;

// Blöcke aus ein paar Wörtern (höchstens 6 Wörter oder 30 Buchstaben), ohne Sätze zu mischen.
export function bausteine(woerter, dauer) {
  const bs = [];
  for (const w of woerter) {
    const b = bs[bs.length - 1];
    const laenge = b ? b.woerter.map((p) => p.text).join(" ").length + w.text.length + 1 : 0;
    if (!b || b.satz !== w.satz || b.woerter.length >= 6 || laenge > 30) bs.push({ satz: w.satz, woerter: [w] });
    else b.woerter.push(w);
  }
  bs.forEach((b, i) => {
    b.anfang = Math.max(0, b.woerter[0].anfang - E.vorgriff);
    const naechst = bs[i + 1];
    b.ende = naechst ? Math.min(naechst.woerter[0].anfang - E.vorgriff, b.woerter[b.woerter.length - 1].ende + 0.6) : dauer;
  });
  return bs;
}

const ausblenden = (u) => 1 - Math.pow(1 - u, 2);                          // power2.out
const zurueckFedern = (u) => { const s = 2.5; u -= 1; return u * u * ((s + 1) * u + s) + 1; }; // back.out(2.5)
const rampe = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));

// Wohin jedes Wort eines Blocks kommt (einmal pro Block berechnet).
function anordnen(g, b, modus) {
  if (b.plaetze) return b.plaetze;
  g.font = `700 ${E.groesse}px Figtree`;
  const breiten = b.woerter.map((w) => g.measureText(w.text).width);
  const zeilen = [[]];
  let benutzt = 0;
  b.woerter.forEach((w, i) => {
    const extra = (zeilen[zeilen.length - 1].length ? E.luecke : 0) + breiten[i];
    if (benutzt + extra > E.breite && zeilen[zeilen.length - 1].length) { zeilen.push([]); benutzt = 0; }
    benutzt += (zeilen[zeilen.length - 1].length ? E.luecke : 0) + breiten[i];
    zeilen[zeilen.length - 1].push(i);
  });
  const oben = modus === "unten" ? E.unten : E.oben, plaetze = [];
  zeilen.forEach((l, j) => {
    const total = l.reduce((s, i, k) => s + breiten[i] + (k ? E.luecke : 0), 0);
    let x = E.links + (E.breite - total) / 2;
    for (const i of l) { plaetze[i] = { x, w: breiten[i], y: oben + j * E.zeile }; x += breiten[i] + E.luecke; }
  });
  return (b.plaetze = plaetze);
}

function gerundet(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r);
  g.quadraticCurveTo(x, y, x + r, y); g.closePath();
}

function kiste(g, s, u) {
  const sx = 0.6 + 0.4 * zurueckFedern(u), deck = Math.min(1, u * 1.6);
  const l = s.x - 0.14 * E.groesse, r = s.x + s.w + 0.14 * E.groesse, top = s.y + 0.02 * E.groesse, bot = s.y + E.zeile + 0.04 * E.groesse;
  const cx = (l + r) / 2, w = (r - l) * sx, x0 = cx - w / 2;
  g.save();
  g.globalAlpha = deck;
  gerundet(g, x0, top, w, bot - top, 10);
  g.fillStyle = "rgba(47,124,246,0.22)"; g.fill();
  gerundet(g, x0 + 2, top + 2, w - 4, bot - top - 4, 8);
  g.strokeStyle = E.markierung; g.lineWidth = 4; g.stroke();
  for (const [hx, hy] of [[x0 + 2, top + 2], [x0 + w - 2, bot - 2]]) {
    g.beginPath(); g.arc(hx, hy, 9, 0, Math.PI * 2); g.fillStyle = "#ffffff"; g.fill();
    g.beginPath(); g.arc(hx, hy, 6, 0, Math.PI * 2); g.fillStyle = E.markierung; g.fill();
  }
  g.restore();
}

export function zeichneUntertitel(g, t, bs, modus = "oben") {
  if (modus === "keine") return;
  const b = bs.find((x) => t >= x.anfang && t < x.ende);
  if (!b) return;
  const plaetze = anordnen(g, b, modus);
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = "source-over";
  g.textBaseline = "middle";
  b.woerter.forEach((w, i) => {
    const geht = w.anfang - E.vorgriff, u = rampe(t, geht, geht + 0.07);
    if (u <= 0) return;
    const s = plaetze[i], naechst = b.woerter[i + 1], gesagt = !w.schluessel && naechst && t >= naechst.anfang - E.vorgriff;
    if (w.schluessel) kiste(g, s, rampe(t, geht + 0.07, geht + 0.19));
    g.font = `${gesagt ? 500 : 700} ${E.groesse}px Figtree`;
    const breite = gesagt ? g.measureText(w.text).width : s.w;
    g.globalAlpha = ausblenden(u);
    g.filter = u < 1 ? `blur(${(8 * (1 - ausblenden(u))).toFixed(2)}px)` : "none";
    g.shadowColor = "rgba(0,0,0,0.55)"; g.shadowBlur = 14; g.shadowOffsetY = 2;
    g.fillStyle = gesagt ? E.gesagt : E.tinte;
    g.fillText(w.text, s.x + (s.w - breite) / 2, s.y + E.zeile / 2);
  });
  g.restore();
}
