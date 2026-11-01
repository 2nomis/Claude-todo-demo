// Ein Daumen von oben, glatt und aus einem Stück: Er folgt einer Kurve (von der Hand, außerhalb des Bildes, bis zur Spitze),
// wird nach und nach schmaler und endet in der runden Kuppe mit ihrem Nagel. Das Volumen kommt von weichgezeichnetem Licht und
// Schatten, nicht von Einzelteilen: So sieht er aus wie ein Finger und nicht wie eine Puppe.
import * as k from "#kit";

// die Poren und die kleinen Unterschiede der Haut (einmal)
const POREN = (() => {
  const n = 384, l = k.leinwand(n, n), c = l.getContext("2d"), zuf = k.zufall(88);
  c.fillStyle = "#808080"; c.fillRect(0, 0, n, n);
  for (let i = 0; i < 3200; i++) { c.fillStyle = `rgba(${zuf() < 0.5 ? "70,45,40" : "255,240,230"},${0.2 + zuf() * 0.3})`; c.beginPath(); c.arc(zuf() * n, zuf() * n, 0.5 + zuf() * 0.9, 0, 6.2832); c.fill(); }
  return l;
})();

// Die Kurve durch die Punkte (Catmull-Rom), in n Stücken abgetastet.
function kurve(pts, n = 48) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const m = Math.ceil(n / (pts.length - 1));
    for (let j = 0; j < m; j++) {
      const t = j / m, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// pts: das Rückgrat, von der Hand (außerhalb des Bildes) bis zur Spitze, in Reihenfolge. R: der Radius an der Kuppe.
// breiten: [an der Hand, an der Basis, am Knöchel] (in Radien). seite: von welcher Seite das Licht fällt (1 oder -1).
export function daumenGlatt(g, pts, R, { breiten = [2.3, 1.25, 1.05], seite = 1, schattenDeck = 0.45, schattenFern = 1 } = {}) {
  const sp = kurve(pts);
  // aufsummierte Länge, ab der Spitze
  const L = [0]; for (let i = 1; i < sp.length; i++) L.push(L[i - 1] + Math.hypot(sp[i][0] - sp[i - 1][0], sp[i][1] - sp[i - 1][1]));
  const tot = L[L.length - 1];
  const breite = (i) => {
    const dt = tot - L[i]; // Abstand zur Spitze
    const a = [[0, 0.95], [R * 2.6, breiten[2]], [R * 5.2, breiten[1]], [R * 9, breiten[0]]];
    for (let j = 0; j < a.length - 1; j++) if (dt <= a[j + 1][0]) { const u = (dt - a[j][0]) / (a[j + 1][0] - a[j][0]); const s = u * u * (3 - 2 * u); return R * (a[j][1] + (a[j + 1][1] - a[j][1]) * s); }
    return R * breiten[0];
  };
  const nor = (i) => { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(sp.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
  const links = sp.map((p, i) => { const n = nor(i), w = breite(i); return [p[0] + n[0] * w, p[1] + n[1] * w]; });
  const rechts = sp.map((p, i) => { const n = nor(i), w = breite(i); return [p[0] - n[0] * w, p[1] - n[1] * w]; });
  const P = sp[sp.length - 1], nP = nor(sp.length - 1), dir = [nP[1], -nP[0]], rP = breite(sp.length - 1);
  const pfad = (c, dx = 0, dy = 0) => {
    c.beginPath(); links.forEach((p, i) => (i ? c.lineTo(p[0] + dx, p[1] + dy) : c.moveTo(p[0] + dx, p[1] + dy)));
    const a0 = Math.atan2(nP[1], nP[0]);
    c.arc(P[0] + dx, P[1] + dy, rP, a0, a0 - Math.PI, true);
    for (let i = rechts.length - 1; i >= 0; i--) c.lineTo(rechts[i][0] + dx, rechts[i][1] + dy);
    c.closePath();
  };
  const zeile = (c, f) => { c.beginPath(); sp.forEach((p, i) => { const n = nor(i), w = breite(i) * f; i ? c.lineTo(p[0] + n[0] * w, p[1] + n[1] * w) : c.moveTo(p[0] + n[0] * w, p[1] + n[1] * w); }); };
  // der Schatten, den er auf den Bildschirm wirft
  g.save(); g.filter = `blur(${Math.round(R * (0.3 + 0.2 * schattenFern))}px)`; pfad(g, R * 0.22 * schattenFern, R * 0.38 * schattenFern); g.fillStyle = `rgba(0,0,0,${schattenDeck})`; g.fill(); g.restore();
  // die Haut
  pfad(g); g.fillStyle = "#e7b19b"; g.fill();
  g.save(); pfad(g); g.clip(); g.lineCap = "round"; g.lineJoin = "round";
  // der Schatten auf der unteren Seite und das Licht auf der oberen, weichgezeichnet (das Volumen)
  g.filter = `blur(${Math.round(R * 0.4)}px)`;
  zeile(g, -0.85 * seite); g.strokeStyle = "rgba(160,84,66,0.65)"; g.lineWidth = R * 1.1; g.stroke();
  zeile(g, 0.35 * seite); g.strokeStyle = "rgba(255,226,212,0.75)"; g.lineWidth = R * 0.6; g.stroke();
  // der Rand, etwas dunkler und rötlich (das Licht, das durch die Haut scheint)
  g.filter = `blur(${Math.round(R * 0.12)}px)`;
  pfad(g); g.strokeStyle = "rgba(196,98,78,0.55)"; g.lineWidth = R * 0.28; g.stroke();
  // die Hautstruktur und ihre Rötung (rosiger an der Spitze und am Knöchel)
  g.filter = "none";
  g.globalCompositeOperation = "overlay"; g.globalAlpha = 0.08;
  const bb = [Math.min(...links.map((p) => p[0]), P[0] - R), Math.min(...links.map((p) => p[1]), ...rechts.map((p) => p[1]), P[1] - R)];
  for (let x = bb[0]; x < Math.max(...rechts.map((p) => p[0]), P[0] + R); x += R * 4) for (let y = bb[1]; y < Math.max(...rechts.map((p) => p[1]), ...links.map((p) => p[1]), P[1] + R); y += R * 4) g.drawImage(POREN, x, y, R * 4, R * 4);
  g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
  g.filter = `blur(${Math.round(R * 0.5)}px)`;
  g.fillStyle = "rgba(225,110,100,0.22)"; g.beginPath(); g.arc(P[0] - dir[0] * R * 0.2, P[1] - dir[1] * R * 0.2, R * 0.9, 0, 6.2832); g.fill();
  // die Knöchelfalten, weich, zweieinhalb Radien von der Spitze
  let iJ = sp.length - 1; while (iJ > 0 && tot - L[iJ] < R * 2.7) iJ--;
  const pJ = sp[iJ], nJ = nor(iJ), dJ = [nJ[1], -nJ[0]], wJ = breite(iJ);
  g.fillStyle = "rgba(215,105,95,0.2)"; g.beginPath(); g.ellipse(pJ[0], pJ[1], wJ * 0.8, wJ * 0.55, Math.atan2(dJ[1], dJ[0]), 0, 6.2832); g.fill();
  g.filter = "blur(1.5px)";
  g.strokeStyle = "rgba(150,78,62,0.45)"; g.lineWidth = Math.max(2, R * 0.04);
  for (const d of [-0.12, 0.05, 0.2]) {
    const cx = pJ[0] + dJ[0] * R * d, cy = pJ[1] + dJ[1] * R * d;
    g.beginPath(); g.moveTo(cx + nJ[0] * wJ * 0.55, cy + nJ[1] * wJ * 0.55); g.quadraticCurveTo(cx + dJ[0] * R * 0.12, cy + dJ[1] * R * 0.12, cx - nJ[0] * wJ * 0.55, cy - nJ[1] * wJ * 0.55); g.stroke();
  }
  g.filter = "none";
  g.restore();
  // der Nagel: an der Spitze, in einer Linie mit dem Finger
  const a = Math.atan2(dir[1], dir[0]);
  g.save(); g.translate(P[0] - dir[0] * R * 0.38, P[1] - dir[1] * R * 0.38); g.rotate(a);
  const ul = R * 0.95, uw = R * 0.55;
  const eineHand = () => { g.beginPath(); g.moveTo(-ul * 0.55, -uw * 0.9); g.lineTo(ul * 0.3, -uw); g.quadraticCurveTo(ul * 0.72, -uw * 0.85, ul * 0.74, 0); g.quadraticCurveTo(ul * 0.72, uw * 0.85, ul * 0.3, uw); g.lineTo(-ul * 0.55, uw * 0.9); g.quadraticCurveTo(-ul * 0.72, 0, -ul * 0.55, -uw * 0.9); g.closePath(); };
  // die Hautfalte um den Nagel
  g.save(); g.filter = `blur(${Math.round(R * 0.06)}px)`; eineHand(); g.strokeStyle = "rgba(170,90,74,0.55)"; g.lineWidth = R * 0.14; g.stroke(); g.restore();
  eineHand(); const ug = g.createLinearGradient(-ul * 0.6, 0, ul * 0.75, 0); ug.addColorStop(0, "#f0bfb0"); ug.addColorStop(0.65, "#f7d6cb"); ug.addColorStop(1, "#fff1ec"); g.fillStyle = ug; g.fill();
  g.save(); eineHand(); g.clip();
  g.filter = `blur(${Math.round(R * 0.08)}px)`;
  g.fillStyle = "rgba(255,246,242,0.7)"; g.beginPath(); g.ellipse(-ul * 0.62, 0, ul * 0.28, uw * 0.7, 0, 0, 6.2832); g.fill();
  g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(ul * 0.02, -uw * 0.42, ul * 0.42, uw * 0.13, 0, 0, 6.2832); g.fill();
  g.fillStyle = "rgba(255,252,250,0.85)"; g.fillRect(ul * 0.6, -uw, ul * 0.2, uw * 2);
  // die feinen Rillen den Nagel entlang
  g.filter = "none"; g.strokeStyle = "rgba(200,140,128,0.09)"; g.lineWidth = Math.max(1, R * 0.015);
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(-ul * 0.5, i * uw * 0.24); g.lineTo(ul * 0.6, i * uw * 0.27); g.stroke(); }
  g.restore();
  g.restore();
}
