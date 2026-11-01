// Text im Bild: eine Zahl in ihrer dunklen Pille (eine Temperatur, ein Preis, eine Entfernung) und ein kleines Etikett. Nur für
// das, was der Untertitel nicht schon sagt: eine Zahl, die hochzählt, der Name dessen, worauf gezeigt wird.
// Groß genug, um es auf einem Handy zu lesen, und mindestens eine halbe Sekunde ruhig.
import { gerundet } from "./base.js";

// Eine Zahl in ihrer dunklen Pille, zentriert bei (x, y). haupt: die schon geschriebene Zahl ("30.000"); einheit: "°C".
// color: "r,g,b" der Zahl (mit ihrem Schein drumherum). deck: Transparenz. groesse: die Höhe der Zahl.
export function pille(g, x, y, haupt, einheit = "", color = "255,255,255", deck = 1, groesse = 112) {
  if (deck <= 0.003) return;
  const A = g.globalAlpha;
  g.save();
  g.globalAlpha = A * deck;
  g.font = `800 ${groesse}px Figtree`;
  const w1 = g.measureText(haupt).width;
  g.font = `700 ${groesse / 2}px Figtree`;
  const w2 = einheit ? g.measureText(einheit).width + 12 : 0;
  const w = w1 + w2 + 88, h = groesse + 34, x0 = x - w / 2, y0 = y - h / 2;
  g.shadowColor = "rgba(0,0,0,0.55)"; g.shadowBlur = 44; g.shadowOffsetY = 16;
  gerundet(g, x0, y0, w, h, 40); g.fillStyle = "rgba(4,7,12,0.66)"; g.fill();
  g.shadowColor = "rgba(0,0,0,0)"; g.shadowBlur = 0; g.shadowOffsetY = 0;
  gerundet(g, x0 + 1.5, y0 + 1.5, w - 3, h - 3, 38.5); g.strokeStyle = "rgba(255,255,255,0.16)"; g.lineWidth = 3; g.stroke();
  g.textBaseline = "alphabetic";
  const base = y + groesse * 0.36;
  g.shadowColor = `rgba(${color},0.9)`; g.shadowBlur = 26;
  g.fillStyle = `rgb(${color})`;
  g.font = `800 ${groesse}px Figtree`; g.fillText(haupt, x0 + 44, base);
  if (einheit) { g.font = `700 ${groesse / 2}px Figtree`; g.fillText(einheit, x0 + 44 + w1 + 12, base); }
  g.restore();
}

// Ein kleines Etikett mit farbigem Rand, mit seiner oberen linken Ecke bei (x, y).
export function etikett(g, x, y, text, color = "184,255,122", deck = 1, groesse = 46) {
  if (deck <= 0.003) return;
  const A = g.globalAlpha;
  g.save();
  g.globalAlpha = A * deck;
  g.font = `800 ${groesse}px Figtree`;
  const w = g.measureText(text).width + 52, h = groesse + 24;
  gerundet(g, x, y, w, h, 26); g.fillStyle = "rgba(4,7,12,0.66)"; g.fill();
  gerundet(g, x + 1.5, y + 1.5, w - 3, h - 3, 24.5); g.strokeStyle = `rgba(${color},0.5)`; g.lineWidth = 3; g.stroke();
  g.textBaseline = "alphabetic"; g.fillStyle = `rgb(${color})`;
  g.fillText(text, x + 26, y + 10 + groesse * 0.86);
  g.restore();
  return w;
}
