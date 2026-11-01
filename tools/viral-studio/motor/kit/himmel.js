// Der Weltraum: ein Hintergrund mit einem Nebel und Sternenstaub, Tausende Sterne in 3D (sie fliegen vorbei und ziehen Spuren, wenn die
// Kamera rast) und eine ganze Galaxie.
import { zufall, leinwand, pkt, teil, sum } from "./base.js";
import { F, projiziere } from "./kamera.js";
import { FARBEN, halo } from "./licht.js";
import { rauschen, toenen } from "./texturen.js";

const nebel = (() => {
  const n1 = rauschen(256, 31, 3, 4, "flecken"), n2 = rauschen(256, 37, 2.2, 4, "flecken");
  const l = leinwand(1400, 2400), cx = l.getContext("2d");
  cx.fillStyle = "#03050a"; cx.fillRect(0, 0, 1400, 2400);
  cx.globalCompositeOperation = "lighter";
  cx.globalAlpha = 0.55; cx.drawImage(toenen(n1, "#2c1a4c"), 0, 0, 1400, 2400);
  cx.globalAlpha = 0.45; cx.drawImage(toenen(n2, "#0d2c40"), -200, -150, 1800, 2700); // er muss alles bedecken: Beginnt er weiter unten, sieht man seinen Rand als Linie
  return l;
})();
const staub = (() => {
  const zuf = zufall(77), p = [];
  for (let q = 0; q < 4200; q++) {
    let x = zuf() * 1400, y = zuf() * 2400;
    if (q % 2 === 0) { const bx = zuf(); x = bx * 1400; y = 400 + bx * 1500 + (zuf() - 0.5) * (260 + 200 * zuf()); }
    p.push([x, y, 0.25 + zuf() * 0.6, zuf() < 0.14 ? "255,205,175" : zuf() < 0.24 ? "185,205,255" : "236,239,255", zuf() < 0.06 ? 2.4 : 1.5]);
  }
  return p;
})();

// Der Weltraumhintergrund: bläuliches Schwarz, ein weicher Nebel und der Staub ferner Sterne. Er bewegt sich nur ein wenig mit dem, wohin
// die Kamera schaut, wie etwas unendlich Fernes. leuchten: von 0 bis 1.
export function hintergrund(g, cam, leuchten = 1) {
  const mx = Math.max(-150, Math.min(150, cam.e.f[0] * -600)), my = Math.max(-230, Math.min(230, cam.e.f[1] * 900)), A = g.globalAlpha;
  g.save();
  g.globalCompositeOperation = "source-over";
  g.fillStyle = "#03050a"; g.fillRect(0, 0, 1080, 1920);
  g.globalAlpha = A * leuchten;
  g.drawImage(nebel, -160 + mx, -240 + my);
  for (const pv of staub) {
    const px = (((pv[0] - 160 + mx * 0.9) % 1400) + 1400) % 1400 - 160, py = (((pv[1] - 240 + my * 0.9) % 2400) + 2400) % 2400 - 240;
    g.fillStyle = `rgba(${pv[3]},${pv[2]})`; g.fillRect(px, py, pv[4], pv[4]);
  }
  g.restore();
}

const arten = ["rot", "rot", "rot", "orange", "orange", "gelb", "gelb", "weiss", "weiss", "blau"];
// n zufällige Sterne in einer Kiste der Seitenlänge `seite` um mitte, keiner näher als `luecke` daran.
// Jeder: { p: Position, c: Farbe, b: Helligkeit, r: Radius }. Füg { gross: true } bei denen hinzu, die riesig aussehen können müssen.
export function himmel(saat, n, mitte = [0, 0, 0], seite = 520, luecke = 30) {
  const zuf = zufall(saat), liste = [];
  while (liste.length < n) {
    const X = sum(mitte, [(zuf() - 0.5) * seite, (zuf() - 0.5) * seite, (zuf() - 0.5) * seite]), d = teil(X, mitte);
    if (pkt(d, d) < luecke * luecke) continue;
    liste.push({ p: X, c: arten[Math.floor(zuf() * arten.length)], b: 0.35 + Math.pow(zuf(), 3) * 2.4, r: 0.05 + zuf() * 0.08 });
  }
  return liste;
}

// Zeichnet die Sterne der Liste, von cam aus gesehen. vorher: die Kamera des vorigen Bildes (cam bei t - 1/60): Wenn die
// Kamera rast, zieht jeder Stern seine Spur (höchstens 110 px, damit sie nicht wie Strahlen aussehen). leuchten: von 0 bis 1.
export function sterne(g, cam, vorher, liste, leuchten = 1) {
  const A = g.globalAlpha;
  g.save();
  g.globalCompositeOperation = "lighter";
  for (const s of liste) {
    const a = projiziere(cam, s.p);
    if (!a || a.x < -80 || a.x > 1160 || a.y < -80 || a.y > 2000) continue;
    const groesse = Math.max(7, Math.min(s.gross ? 200 : 110, ((F * s.r) / a.z) * 7 + 8 * s.b)), deck = leuchten * Math.min(1, s.b * Math.min(1, 160 / a.z));
    const b0 = vorher && projiziere(vorher, s.p);
    if (b0) {
      const dx = a.x - b0.x, dy = a.y - b0.y, l = Math.sqrt(dx * dx + dy * dy);
      if (l > 3) {
        const schneidet = Math.min(1, 110 / l);
        g.globalAlpha = A;
        g.strokeStyle = `rgba(${FARBEN[s.c]},${deck * 0.7})`; g.lineWidth = Math.max(1.4, groesse * 0.15); g.lineCap = "round";
        g.beginPath(); g.moveTo(a.x - dx * schneidet, a.y - dy * schneidet); g.lineTo(a.x, a.y); g.stroke();
      }
    }
    g.globalAlpha = A * Math.min(1, deck); g.drawImage(halo(s.c), a.x - groesse / 2, a.y - groesse / 2, groesse, groesse);
  }
  g.restore();
}

// Eine Spiralgalaxie von vorne gesehen (1600 × 1600): Kern, zwei Arme mit ihren Sternen, rosa Wolken und Staub.
// Gedreht und abgeflacht zeichnen: g.translate(x, y); g.scale(1, 0.62); g.rotate(drehung); g.drawImage(galaxie(), -800*s, -800*s, 1600*s, 1600*s).
let dieGalaxie = null;
export function galaxie() {
  if (dieGalaxie) return dieGalaxie;
  const N = 1600, l = leinwand(N), cx = l.getContext("2d"), zuf = zufall(141);
  const h = cx.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  h.addColorStop(0, "rgba(255,236,200,0.9)"); h.addColorStop(0.08, "rgba(255,220,170,0.55)"); h.addColorStop(0.3, "rgba(170,180,230,0.12)"); h.addColorStop(1, "rgba(120,140,220,0)");
  cx.fillStyle = h; cx.fillRect(0, 0, N, N);
  cx.globalCompositeOperation = "lighter";
  for (let unterarm = 0; unterarm < 2; unterarm++) for (let k = 0; k < 15000; k++) {
    const th = Math.pow(zuf(), 0.7) * 3.4 * Math.PI, r = 70 * Math.exp(0.27 * th), ab = (zuf() + zuf() + zuf() - 1.5) * (24 + r * 0.16), a = th + unterarm * Math.PI;
    const x = N / 2 + (r + ab) * Math.cos(a) + (zuf() - 0.5) * 18, y = N / 2 + (r + ab) * Math.sin(a) + (zuf() - 0.5) * 18;
    const p = zuf(), col = p < 0.06 ? "255,150,200" : p < 0.5 ? "190,210,255" : "255,245,230";
    cx.fillStyle = `rgba(${col},${0.25 + zuf() * 0.6})`; const s = p < 0.06 ? 3 : zuf() < 0.05 ? 2.6 : 1.4; cx.fillRect(x, y, s, s);
  }
  for (let k = 0; k < 9000; k++) { const rr = Math.pow(zuf(), 2.2) * 640, aa = zuf() * 6.2832; cx.fillStyle = `rgba(255,240,220,${0.15 + zuf() * 0.4})`; cx.fillRect(N / 2 + rr * Math.cos(aa), N / 2 + rr * Math.sin(aa), 1.3, 1.3); }
  return (dieGalaxie = l);
}
