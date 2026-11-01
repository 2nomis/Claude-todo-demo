// Materialien echter Gegenstände, damit nichts eine flache Farbe ist: Glas, Metall und eine leuchtende Oberfläche mit ihrer Körnung.
// Jedes wird auf einen schon gezogenen Pfad (beginPath... closePath) oder auf ein Rechteck aufgetragen.
import { gerundet } from "./base.js";
import { flecken, netz } from "./texturen.js";

// Glas über dem aktuellen Pfad, der von x0 bis x1 geht: fast durchsichtig, mit einer starken Spiegelung auf einer Seite und
// einem hellen Rand. Was drinnen ist (das Salz, das Wasser), wird zuerst gezeichnet, damit es durchscheint.
export function glas(g, x0, x1, rand = 0.45) {
  g.save();
  const cg = g.createLinearGradient(x0, 0, x1, 0);
  cg.addColorStop(0, "rgba(255,255,255,0.22)"); cg.addColorStop(0.18, "rgba(255,255,255,0.05)"); cg.addColorStop(0.62, "rgba(255,255,255,0.12)");
  cg.addColorStop(0.82, "rgba(255,255,255,0.32)"); cg.addColorStop(1, "rgba(255,255,255,0.08)");
  g.fillStyle = cg; g.fill();
  g.strokeStyle = `rgba(255,255,255,${rand})`; g.lineWidth = 4; g.stroke();
  g.restore();
}

// Ein Glanzpunkt auf Glas: ein senkrechter Lichtstreifen.
export function glanzpunkt(g, x, y, w, h, deck = 0.35) {
  g.save(); g.fillStyle = `rgba(255,255,255,${deck})`; gerundet(g, x, y, w, h, w / 2); g.fill(); g.restore();
}

// Poliertes Metall über dem aktuellen Pfad, von x0 bis x1: Bänder aus Licht und Schatten, wie ein Deckel oder ein Rohr.
export function metal(g, x0, x1, ton = ["#6d737c", "#e8ecf1", "#9aa2ad", "#f4f6f9", "#5c626a"]) {
  g.save();
  const mg = g.createLinearGradient(x0, 0, x1, 0);
  ton.forEach((c, i) => mg.addColorStop(i / (ton.length - 1), c));
  g.fillStyle = mg; g.fill();
  g.restore();
}

// Eine riesige Oberfläche, knapp darüber hinweg gesehen (der Boden eines Planeten, die Haut eines Sterns, Sand), von der Horizontlinie yh
// nach unten: weiß, mit ihrer Körnung, die mit der Geschwindigkeit vel (px/s) darunter vorbeizieht. deck: Transparenz.
export function oberflaeche(g, yh, t, deck = 1, vel = 260, farben = ["#ffffff", "#eef4ff", "#c4d3f5"]) {
  if (deck <= 0.003) return;
  const A = g.globalAlpha * deck;
  g.save(); g.globalAlpha = A;
  g.beginPath(); g.moveTo(-40, yh + 50); g.quadraticCurveTo(540, yh - 50, 1120, yh + 50); g.lineTo(1120, 1960); g.lineTo(-40, 1960); g.closePath(); g.clip();
  const sg = g.createLinearGradient(0, yh - 50, 0, 1920);
  sg.addColorStop(0, farben[0]); sg.addColorStop(0.25, farben[1]); sg.addColorStop(1, farben[2]);
  g.fillStyle = sg; g.fillRect(0, yh - 60, 1080, 1980 - yh);
  const off = (t * vel) % 1500;
  g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.38 * A;
  g.drawImage(netz, -off, yh - 50, 1500, 1100); g.drawImage(netz, 1500 - off, yh - 50, 1500, 1100);
  g.globalCompositeOperation = "screen"; g.globalAlpha = 0.3 * A;
  g.drawImage(flecken, -off * 0.8, yh - 50, 1700, 1100); g.drawImage(flecken, 1700 - off * 0.8, yh - 50, 1700, 1100);
  g.restore();
}
