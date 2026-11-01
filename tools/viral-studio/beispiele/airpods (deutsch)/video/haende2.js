// Zwei echte Hände, die ein Handy halten und mit den Daumen tippen. Echte Maße für ein Handy von 640 × 1300
// (7 cm breit: 1 cm ≈ 91 px): Der Daumen ist 2 cm breit, sein Mittelhandknochen 4,5 cm, das erste Glied 3 cm und die
// Spitze 2,8 cm. Der Daumen dreht sich von seiner Basis (neben dem Handgelenk) und beugt sich an seinen zwei Knöcheln, um die
// nahen Tasten zu erreichen; beim Drücken geht er runter und quetscht sich ein wenig, zwischen den Tasten hebt er sich (sein Schatten löst sich).
// Die anderen Finger halten das Handy von hinten: Sie schauen an den Rändern hervor.
import * as k from "#kit";
import { daumenGlatt } from "./daumen.js";

const { misch, sanft: su, rampe: tr } = k;
const HAUT = { licht: "#f3cbb5", mittig: "#dfa58f", schatten: "#b5766a" };

// ---------------------------------------------------------------- die Bewegung jedes Daumens
// beruehrungen: [[[x, y] auf dem Bildschirm (0..600, 0..1260), Sekunde], ...]. Jede Berührung macht der Daumen auf ihrer Seite.
// Gibt pro Daumen zurück { p: [x, y] (wo die Spitze ist, auf dem Bildschirm), heb (0 ruhend … 1 gehoben), quetscht }.
export function tippen(t, beruehrungen, ruhe = [[150, 1010], [450, 1010]]) {
  const out = [];
  for (const seite of [0, 1]) {
    const meineBeruehrungen = beruehrungen.filter(([p]) => (p[0] < 300 ? 0 : 1) === seite).sort((a, b) => a[1] - b[1]);
    let i = -1; for (let j = 0; j < meineBeruehrungen.length; j++) if (meineBeruehrungen[j][1] <= t) i = j;
    const prev = i >= 0 ? meineBeruehrungen[i] : null, next = meineBeruehrungen[i + 1] || null, R = ruhe[seite];
    // ein leichtes Schwanken, wie bei einer echten Hand
    const vx = 5 * Math.sin(t * 1.3 + seite * 2), vy = 4 * Math.sin(t * 1.7 + seite);
    let p = R, heb = 0.35, quetscht = 0;
    const von = prev && t - prev[1] < 1.1 ? prev[0] : R;
    if (next && next[1] - t < 0.5) {
      // auf dem Weg zur nächsten Taste: Er hebt sich, fliegt im Bogen und kommt genau auf der Berührung herunter
      const u = su(tr(t, next[1] - 0.5, next[1] - 0.04));
      p = [misch(von[0], next[0][0], u), misch(von[1], next[0][1], u) - Math.sin(Math.PI * u) * 22];
      heb = Math.sin(Math.PI * Math.min(1, u * 1.15)) * 0.9 + (von === R ? 0.35 * (1 - u) : 0);
      quetscht = k.puls(t, next[1], 0.035);
    } else if (prev && t - prev[1] < 1.1) {
      // er hat gerade gedrückt: Er bleibt einen Augenblick und geht, wenn keine weitere Berührung kommt, zurück in die Ruhe
      const u = su(tr(t, prev[1] + 0.55, prev[1] + 1.1));
      p = [misch(prev[0][0], R[0], u), misch(prev[0][1], R[1], u)];
      heb = misch(0.12 * su(tr(t, prev[1] + 0.04, prev[1] + 0.2)), 0.35, u);
      quetscht = k.puls(t, prev[1], 0.035);
    }
    out.push({ p: [p[0] + vx, p[1] + vy], heb, quetscht });
  }
  return out;
}

// ---------------------------------------------------------------- Zeichnen
function hautFuellung(g, ax, ay, bx, by, r) {
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const lg = g.createLinearGradient(ax + nx * r, ay + ny * r, ax - nx * r, ay - ny * r);
  lg.addColorStop(0, HAUT.schatten); lg.addColorStop(0.35, HAUT.mittig); lg.addColorStop(0.7, HAUT.licht); lg.addColorStop(1, HAUT.mittig);
  g.fillStyle = lg; g.fill();
}
// Die ganze Hand folgt dem Daumen ein wenig (wie im echten Leben bewegt sich nicht nur der Finger).
const weiter = (e, seite) => { const R = seite ? [450, 1010] : [150, 1010]; return [(e.p[0] - R[0]) * 0.1, (e.p[1] - R[1]) * 0.08]; };
// Was hinter dem Handy ist (bevor es gezeichnet wird): die Handfläche unter der unteren Ecke, der Ärmel und der Zeigefinger,
// der den Rand des Handys umschließt. In Handy-Koordinaten (Mitte 0, 0, Handy von 640 × 1300), im Maßstab esc.
export function haendeHinten(g, x, y, esc, zst) {
  g.save(); g.translate(x, y); g.scale(esc, esc);
  for (const s of [-1, 1]) {
    const [hx, hy] = zst ? weiter(zst[s > 0 ? 1 : 0], s > 0 ? 1 : 0) : [0, 0];
    g.save(); g.translate(hx, hy); g.scale(s, 1);
    // der Ärmel, unten
    const mg = g.createLinearGradient(-900, 0, -300, 0); mg.addColorStop(0, "#141822"); mg.addColorStop(0.6, "#2c3448"); mg.addColorStop(1, "#1a1f2c");
    g.beginPath(); g.moveTo(-430, 1060); g.bezierCurveTo(-470, 1250, -500, 1500, -540, 1800); g.lineTo(-1100, 1800); g.lineTo(-1100, 1100); g.bezierCurveTo(-900, 1040, -650, 1020, -430, 1060); g.closePath(); g.fillStyle = mg; g.fill();
    // die Handfläche: unter der Ecke, mit ihrem Schatten
    g.save(); g.filter = "blur(30px)"; g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.ellipse(-380, 860, 240, 260, -0.4, 0, 6.2832); g.fill(); g.restore();
    g.beginPath(); g.moveTo(-250, 640); g.bezierCurveTo(-200, 760, -230, 930, -330, 1060); g.bezierCurveTo(-420, 1150, -620, 1140, -700, 1040); g.bezierCurveTo(-760, 900, -640, 700, -470, 560); g.closePath();
    hautFuellung(g, -700, 850, -230, 850, 300);
    g.save(); g.clip(); const ph = g.createRadialGradient(-260, 700, 0, -260, 700, 420); ph.addColorStop(0, "rgba(40,20,15,0.5)"); ph.addColorStop(1, "rgba(40,20,15,0.1)"); g.fillStyle = ph; g.fillRect(-800, 500, 700, 700); g.restore();
    // der Zeigefinger: läuft außen den Rand hinauf und biegt sich oben ein wenig zurück
    const iw = 50;
    g.save(); g.filter = "blur(12px)"; g.fillStyle = "rgba(0,0,0,0.45)"; g.beginPath(); g.ellipse(-330, 420, 60, 300, 0, 0, 6.2832); g.fill(); g.restore();
    g.beginPath(); g.moveTo(-372, 720); g.bezierCurveTo(-380, 520, -372, 330, -350, 190); g.bezierCurveTo(-344, 150, -330, 132, -314, 136); g.bezierCurveTo(-298, 142, -296, 170, -298, 210); g.bezierCurveTo(-300, 360, -296, 540, -286, 720); g.closePath();
    hautFuellung(g, -390, 420, -280, 420, iw);
    // hinter dem Handy kommt weniger Licht an
    g.save(); g.clip(); const sh = g.createLinearGradient(-280, 0, -390, 0); sh.addColorStop(0, "rgba(40,20,15,0.55)"); sh.addColorStop(1, "rgba(40,20,15,0.15)"); g.fillStyle = sh; g.fillRect(-400, 90, 130, 640); g.restore();
    g.strokeStyle = "rgba(150,80,66,0.35)"; g.lineWidth = 3;
    for (const yy of [300, 470]) { g.beginPath(); g.moveTo(-382, yy); g.quadraticCurveTo(-338, yy + 6, -292, yy); g.stroke(); }
    g.restore();
  }
  g.restore();
}
// Was vorne ist (nach dem Handy): die Daumen. zst: was tippen() zurückgibt.
export function haendeVorne(g, x, y, esc, zst) {
  g.save(); g.translate(x, y); g.scale(esc, esc);
  const R = 78;
  zst.forEach((e, seite) => {
    const s = seite ? 1 : -1, [hx, hy] = weiter(e, seite);
    // die Basis des Daumens: an der unteren Ecke, außerhalb des Bildschirms; die ganze Hand geht ein wenig mit
    const B = [s * 300 + hx, 720 + hy];
    const T = [e.p[0] - 300, e.p[1] - 630];
    const dx = T[0] - B[0], dy = T[1] - B[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    // fast gerade: eine sehr weiche Kurve nach außen
    const nx = -uy * -s, ny = ux * -s, cv = 0.05 * d;
    const fingerkuppe = [T[0] + ux * R * 0.45, T[1] + uy * R * 0.45];
    const J = [B[0] + dx * 0.58 + nx * cv, B[1] + dy * 0.58 + ny * cv];
    const O = [B[0] - ux * 360 + s * 40, B[1] - uy * 360 + 140];
    const sc = 1 + 0.05 * e.heb - 0.025 * e.quetscht;
    daumenGlatt(g, [O, B, J, fingerkuppe], R * sc, { breiten: [2.5, 1.35, 1.1], seite: -s, schattenDeck: 0.5 - 0.2 * e.heb, schattenFern: 0.5 + 1.6 * e.heb });
    if (e.quetscht > 0.05) k.leuchten(g, T[0], T[1], 110, "255,255,255", 0.15 * e.quetscht);
  });
  g.restore();
}
