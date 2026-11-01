// Was die Einstellungen teilen: der AirPod (von außen und im Querschnitt), das Ohr im Querschnitt mit der schwingenden Luft, das
// Trommelfell, das Triebwerk des Flugzeugs, das Fenster, der Chip und die Wellen. Alles in 2D, mit Licht und Volumen.
// Feste Farben: der Triebwerkslärm, gold; der Gegenschall, blau; die ruhende Luft, blasses Weiß.
import * as k from "#kit";
export { hintergrund, schleier, vignette, mischHex } from "./base.js";

const { gerundet, misch, zufall, leinwand } = k;
export const GOLDTON = "255,190,80", BLAU = "90,170,255", LUFT = "225,230,240";

// ---------------------------------------------------------------- die 2D-Kamera
export function ansicht(g, Z, cx, cy) { g.setTransform(Z, 0, 0, Z, 540 - cx * Z, 960 - cy * Z); }
export const ohneAnsicht = (g) => g.setTransform(1, 0, 0, 1, 0, 0);
export function pfad2D(stuetzpunkte) {
  const Zs = k.stuetzpunkte(stuetzpunkte.map(([t, c]) => [t, Math.log(c[0])])), X = k.stuetzpunkte(stuetzpunkte.map(([t, c]) => [t, c[1]])), Y = k.stuetzpunkte(stuetzpunkte.map(([t, c]) => [t, c[2]]));
  return (t) => [Math.exp(Zs(t)), X(t), Y(t)];
}
const T = (g, txt, x, y, groesse, gewicht = 700, color = "#fff", deck = "center") => { g.font = `${gewicht} ${groesse}px Figtree`; g.textAlign = deck; g.textBaseline = "middle"; g.fillStyle = color; g.fillText(txt, x, y); };
export { T as text };

// Ein dünnes Etikett: kleiner Text mit seiner Linie zu dem, worauf er zeigt.
export function aufschrift(g, x, y, xa, ya, txt, deck = 1, color = "235,238,245", groesse = 34) {
  if (deck <= 0.01) return;
  g.save(); g.globalAlpha *= deck;
  g.strokeStyle = `rgba(${color},0.6)`; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y + (ya > y ? 16 : -16)); g.lineTo(xa, ya); g.stroke();
  g.fillStyle = `rgb(${color})`; g.beginPath(); g.arc(xa, ya, 4, 0, 6.2832); g.fill();
  g.shadowColor = "rgba(0,0,0,0.9)"; g.shadowBlur = 10; T(g, txt, x, y, groesse, 600, `rgb(${color})`);
  g.restore();
}

// ---------------------------------------------------------------- der AirPod (Seitenansicht)
// Der Ohrhörer im Profil: der Kopf, der Ohrstöpsel nach rechts (das Ohr) und der Stiel nach unten
// links. (x, y): die Mitte des Kopfes; s: Maßstab (1 = der Kopf ist etwa 330 px).
// o: { schnitt (0 massiv … 1 Glas, mit seinen Teilen sichtbar), mic (das äußere Mikro leuchtet), micIn (das
//      innere), chip ("r,g,b": der Chip leuchtet in dieser Farbe), lautsprecher (die Membran, -1..1), ang (Drehung) }
const kopfAP = (g) => { g.beginPath(); g.moveTo(-150, 10); g.bezierCurveTo(-172, -128, -42, -178, 60, -152); g.bezierCurveTo(150, -128, 176, -42, 150, 60); g.bezierCurveTo(130, 140, 20, 160, -60, 130); g.bezierCurveTo(-120, 110, -146, 70, -150, 10); g.closePath(); };
const stabAP = (g) => { g.beginPath(); g.save(); g.rotate(0.52); gerundet(g, -60, 40, 104, 430, 52); g.restore(); };
const tipAP = (g) => { g.beginPath(); g.moveTo(112, -112); g.bezierCurveTo(190, -150, 272, -96, 274, -10); g.bezierCurveTo(272, 76, 190, 130, 112, 92); g.bezierCurveTo(124, 40, 124, -60, 112, -112); g.closePath(); };
function langesLeuchten(g, form, x, y, rx, ry, rot, deck) { g.save(); form(g); g.clip(); g.filter = "blur(9px)"; g.fillStyle = `rgba(255,255,255,${deck})`; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.2832); g.fill(); g.restore(); }
export function airpod(g, x, y, s = 1, o = {}) {
  const c = Math.max(0, Math.min(1, o.schnitt || 0)), so = 1 - c;
  g.save(); g.translate(x, y); g.rotate(o.ang || 0); g.scale(s, s);
  // der Schatten, den er wirft
  if (so > 0.02) { g.save(); g.filter = "blur(34px)"; g.fillStyle = `rgba(0,0,0,${0.5 * so})`; g.beginPath(); g.ellipse(30, 70, 190, 150, 0, 0, 6.2832); g.fill(); g.beginPath(); g.ellipse(-150, 280, 70, 210, 0.5, 0, 6.2832); g.fill(); g.restore(); }
  // ---------- massiv: glänzender weißer Kunststoff
  if (so > 0.01) {
    g.save(); g.globalAlpha *= so;
    const weissC = (form, lx, ly) => { form(g); const gg = g.createRadialGradient(lx, ly, 8, lx + 60, ly + 80, 380); gg.addColorStop(0, "#ffffff"); gg.addColorStop(0.45, "#eceef2"); gg.addColorStop(0.8, "#c3c6ce"); gg.addColorStop(1, "#9a9ea8"); g.fillStyle = gg; g.fill(); };
    weissC(stabAP, -90, 60);
    // die Touch-Fläche des Stiels und sein Gitter unten
    g.save(); g.rotate(0.52); g.strokeStyle = "rgba(120,124,134,0.35)"; g.lineWidth = 3; gerundet(g, -30, 220, 44, 150, 22); g.stroke();
    gerundet(g, -30, 450, 44, 13, 6); g.fillStyle = "#4b4e57"; g.fill(); g.restore();
    weissC(kopfAP, -70, -110);
    langesLeuchten(g, kopfAP, -40, -112, 110, 22, -0.25, 0.85);
    langesLeuchten(g, stabAP, -150, 210, 10, 150, 0.52, 0.55);
    // der Kontaktschatten, wo der Ohrstöpsel auf den Kopf trifft
    g.save(); kopfAP(g); g.clip(); g.filter = "blur(14px)"; g.fillStyle = "rgba(60,62,70,0.45)"; g.beginPath(); g.ellipse(132, -10, 34, 110, 0, 0, 6.2832); g.fill(); g.restore();
    // der Ohrstöpsel: sehr hellgraues Silikon, matt und leicht durchscheinend
    tipAP(g); const tg = g.createRadialGradient(170, -70, 10, 190, -10, 170); tg.addColorStop(0, "#f7f7f9"); tg.addColorStop(0.6, "#dcdde2"); tg.addColorStop(1, "#a9acb4"); g.fillStyle = tg; g.fill();
    langesLeuchten(g, tipAP, 190, -86, 50, 14, 0.3, 0.6);
    g.beginPath(); g.ellipse(266, -10, 9, 44, 0, 0, 6.2832); g.fillStyle = "#6b6e77"; g.fill();
    g.restore();
  }
  // ---------- Glas: die durchsichtige Hülle und ihre Teile
  if (c > 0.01) {
    g.save(); g.globalAlpha *= c;
    const glasig = (form) => {
      form(g); const cg = g.createLinearGradient(-150, -150, 150, 150); cg.addColorStop(0, "rgba(220,228,240,0.16)"); cg.addColorStop(0.5, "rgba(160,170,190,0.05)"); cg.addColorStop(1, "rgba(200,210,230,0.12)"); g.fillStyle = cg; g.fill();
      g.save(); form(g); g.clip(); g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 14; form(g); g.stroke(); g.restore();
      g.strokeStyle = "rgba(240,245,255,0.75)"; g.lineWidth = 2.2; form(g); g.stroke();
    };
    glasig(stabAP); glasig(kopfAP);
    // der Akku: ein goldener Streifen mit seinen Zellen, den Stiel entlang
    g.save(); g.rotate(0.52); gerundet(g, -22, 150, 40, 300, 12); const bg = g.createLinearGradient(-22, 0, 18, 0); bg.addColorStop(0, "#6e521a"); bg.addColorStop(0.45, "#e2bd5e"); bg.addColorStop(1, "#6e521a"); g.fillStyle = bg; g.fill();
    for (let i = 0; i < 4; i++) { gerundet(g, -12, 190 + i * 64, 20, 30, 4); g.fillStyle = "#1c1d22"; g.fill(); }
    // das äußere Mikro: eine Kapsel mit ihrem Gitter, oben am Stiel
    gerundet(g, -64, 150, 30, 76, 14); g.fillStyle = "#26282e"; g.fill(); g.strokeStyle = "rgba(220,190,120,0.8)"; g.lineWidth = 2; g.stroke();
    g.restore();
    // der H1-Chip: ein weißes, glänzendes Teil, geneigt
    g.save(); g.translate(-72, -62); g.rotate(-0.22);
    gerundet(g, -64, -38, 128, 76, 16); const hg = g.createLinearGradient(-64, -38, 64, 38); hg.addColorStop(0, "#ffffff"); hg.addColorStop(0.6, "#d7dae0"); hg.addColorStop(1, "#9ea2ab"); g.fillStyle = hg; g.fill();
    g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = "rgba(120,124,134,0.55)"; g.font = "800 22px Figtree"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("H1", 0, 2);
    if (o.chip) { g.save(); gerundet(g, -64, -38, 128, 76, 16); g.clip(); g.globalCompositeOperation = "source-atop"; g.fillStyle = `rgba(${o.chip},0.45)`; g.fillRect(-70, -40, 140, 80); g.restore(); k.leuchten(g, 0, 0, 300, o.chip, 0.55); }
    g.restore();
    // die Drähte, golden und dünn
    g.strokeStyle = "rgba(225,185,95,0.9)"; g.lineWidth = 3; g.lineCap = "round";
    g.beginPath(); g.moveTo(-20, -50); g.bezierCurveTo(20, -20, 40, 40, 70, 40); g.stroke();
    g.beginPath(); g.moveTo(-110, -40); g.bezierCurveTo(-140, 20, -150, 80, -150, 130); g.stroke();
    // der Lautsprecher: Metallringe und seine Membran, zum Ohrstöpsel gerichtet
    const dx = 9 * (o.lautsprecher || 0);
    const randring = (cx, rx, ry, a, b) => { g.beginPath(); g.ellipse(cx, -10, rx, ry, 0, 0, 6.2832); const ag = g.createLinearGradient(cx - rx, -10 - ry, cx + rx, -10 + ry); ag.addColorStop(0, a); ag.addColorStop(0.5, b); ag.addColorStop(1, a); g.fillStyle = ag; g.fill(); };
    randring(80, 34, 104, "#3f4249", "#c9ccd3"); randring(86, 28, 92, "#6b6f78", "#f1f2f5"); randring(90, 22, 80, "#2a2c31", "#55585f");
    g.beginPath(); g.ellipse(96 + dx, -10, 16, 70, 0, 0, 6.2832); const mg = g.createRadialGradient(92 + dx, -40, 4, 96 + dx, -10, 80); mg.addColorStop(0, "#fbf7fa"); mg.addColorStop(0.6, "#d8c9d6"); mg.addColorStop(1, "#8a7d8c"); g.fillStyle = mg; g.fill();
    g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.ellipse(92 + dx, -48, 4, 18, 0, 0, 6.2832); g.fill();
    // der gläserne Ohrstöpsel, mit seinem Innenrand und dem Netz
    tipAP(g); const tc = g.createRadialGradient(200, -10, 30, 190, -10, 170); tc.addColorStop(0, "rgba(255,255,255,0.03)"); tc.addColorStop(1, "rgba(230,236,248,0.16)"); g.fillStyle = tc; g.fill();
    g.strokeStyle = "rgba(245,248,255,0.8)"; g.lineWidth = 2.2; tipAP(g); g.stroke();
    g.save(); tipAP(g); g.clip(); g.strokeStyle = "rgba(255,255,255,0.14)"; g.lineWidth = 16; tipAP(g); g.stroke(); g.restore();
    g.beginPath(); g.ellipse(262, -10, 8, 42, 0, 0, 6.2832); g.strokeStyle = "rgba(200,205,215,0.6)"; g.lineWidth = 2; g.stroke();
    // das innere Mikro, im Ohrstöpsel
    g.save(); g.translate(232, 52); gerundet(g, -9, -7, 18, 14, 4); g.fillStyle = "#c9a24e"; g.fill(); g.restore();
    g.restore();
  }
  // die Mikros, beleuchtet
  const mic = o.mic || 0; if (mic > 0.01) { g.save(); g.rotate(0.52); k.leuchten(g, -49, 188, 260, GOLDTON, mic); g.restore(); }
  const mi = o.micIn || 0; if (mi > 0.01) k.leuchten(g, 232, 52, 220, BLAU, mi);
  g.restore();
}

// ---------------------------------------------------------------- das Ohr im Querschnitt (grauer Ton)
// Der Gehörgang von der Seite, von links nach rechts: der Eingang (wo der AirPod hineinkommt), der Gang und das Trommelfell.
// Wie ein Modell aus grauem Ton unter Studiolicht: weiche, einfarbige Formen, damit das Gold und das Blau des Schalls
// das Einzige mit Farbe sind.
export const OHR = { x0: 420, x1: 930, y: 1000, r: 120 };
function masse(g, form, yLicht, ySchatten) {
  // der Rand zum Gang hin ist beleuchtet und verliert sich nach außen im Schwarz: Man sieht nicht, wo das Teil endet
  g.save(); g.filter = "blur(40px)"; g.fillStyle = "rgba(0,0,0,0.6)"; g.translate(0, 26); form(); g.fill(); g.restore();
  form(); const mg = g.createLinearGradient(0, yLicht, 0, ySchatten); mg.addColorStop(0, "#606167"); mg.addColorStop(0.18, "#46474c"); mg.addColorStop(0.6, "#1f2023"); mg.addColorStop(1, "#0b0b0d"); g.fillStyle = mg; g.fill();
  g.save(); form(); g.clip();
  const lz = g.createRadialGradient(700, yLicht, 0, 700, yLicht, 700); lz.addColorStop(0, "rgba(255,255,255,0.10)"); lz.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = lz; g.fillRect(-1000, -1000, 4000, 4000);
  // der beleuchtete Rand, nur nahe am Gang
  g.beginPath(); g.rect(-1000, yLicht - 90, 4000, 180); g.clip();
  g.filter = "blur(8px)"; g.strokeStyle = "rgba(225,228,236,0.35)"; g.lineWidth = 14; form(); g.stroke();
  g.filter = "none"; g.strokeStyle = "rgba(240,242,248,0.35)"; g.lineWidth = 2; form(); g.stroke();
  g.restore();
}
export function ohr(g, t, o = {}) {
  const { x0, x1, y, r } = { ...OHR, ...o };
  g.save();
  // das Ende des Gangs und das Mittelohr, dahinter
  g.fillStyle = "#050506"; g.beginPath(); g.moveTo(x0, y - r - 20); g.lineTo(x1 + 260, y - r - 80); g.lineTo(x1 + 260, y + r + 120); g.lineTo(x0, y + r + 20); g.closePath(); g.fill();
  const fg = g.createLinearGradient(x0, 0, x1 + 300, 0); fg.addColorStop(0, "rgba(40,40,46,0.6)"); fg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = fg; g.fill();
  // oben: ein langes Teil (der Tragus und die obere Wand), schwebend über dem Schwarz
  const oben = () => { g.beginPath(); g.moveTo(x0 - 140, y - r - 120);
    g.bezierCurveTo(x0 - 170, y - r - 230, x0 - 60, y - r - 300, x0 + 120, y - r - 290);
    g.bezierCurveTo(x0 + 320, y - r - 280, x1 - 80, y - r - 330, x1 + 120, y - r - 300);
    g.bezierCurveTo(x1 + 260, y - r - 280, x1 + 300, y - r - 150, x1 + 200, y - r - 60);
    g.bezierCurveTo(x1 + 120, y - r + 4, x1 + 40, y - r - 2, x1 + 6, y - r - 2);
    g.bezierCurveTo(x1 - 140, y - r + 12, (x0 + x1) / 2, y - r - 22, x0 + 60, y - r - 4);
    g.bezierCurveTo(x0 + 10, y - r - 20, x0 - 60, y - r - 40, x0 - 140, y - r - 120); g.closePath(); };
  // unten: die Ohrmuschel und die untere Wand, größer
  const unten = () => { g.beginPath(); g.moveTo(x0 - 260, y + r + 380);
    g.bezierCurveTo(x0 - 330, y + r + 200, x0 - 220, y + r + 70, x0 - 90, y + r + 40);
    g.bezierCurveTo(x0 - 20, y + r + 20, x0 + 20, y + r + 6, x0 + 70, y + r + 4);
    g.bezierCurveTo((x0 + x1) / 2, y + r + 24, x1 - 140, y + r - 10, x1 + 6, y + r + 2);
    g.bezierCurveTo(x1 + 80, y + r + 20, x1 + 200, y + r + 40, x1 + 260, y + r + 140);
    g.bezierCurveTo(x1 + 320, y + r + 300, x1 + 200, y + r + 480, x1 - 40, y + r + 500);
    g.bezierCurveTo(x0 + 200, y + r + 530, x0 - 120, y + r + 560, x0 - 260, y + r + 380); g.closePath(); };
  masse(g, unten, y + r, y + r + 520);
  masse(g, oben, y - r, y - r - 320);
  // der Schatten, der von oben in den Gang fällt
  const sg = g.createLinearGradient(0, y - r, 0, y - r + 70); sg.addColorStop(0, "rgba(0,0,0,0.6)"); sg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = sg; g.fillRect(x0 + 40, y - r - 10, x1 - x0, 80);
  g.restore();
}
// Das Trommelfell: eine weiße, glänzende Membran, leicht geneigt, mit den drei Gehörknöchelchen dahinter.
export function trommelfell(g, t, bewegt = 0, o = {}) {
  const { x1, y, r } = { ...OHR, ...o };
  g.save();
  const b = 22 * bewegt;
  // die Gehörknöchelchen (Hammer, Amboss und Steigbügel): glänzender weißer Knochen
  const knochen = (zeichne, w) => { g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#8e8a84"; g.lineWidth = w + 6; zeichne(); g.stroke(); const hg = g.createLinearGradient(x1, y - 200, x1 + 200, y); hg.addColorStop(0, "#ffffff"); hg.addColorStop(1, "#cfcac2"); g.strokeStyle = hg; g.lineWidth = w; zeichne(); g.stroke(); g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = w * 0.25; g.translate(-w * 0.15, -w * 0.15); zeichne(); g.stroke(); g.restore(); };
  knochen(() => { g.beginPath(); g.moveTo(x1 + 22 + b, y + 10); g.quadraticCurveTo(x1 + 40 + b * 0.7, y - 40, x1 + 52 + b * 0.5, y - 78); }, 18);
  g.save(); const kopf = g.createRadialGradient(x1 + 58 + b * 0.4, y - 100, 2, x1 + 62 + b * 0.4, y - 92, 26); kopf.addColorStop(0, "#ffffff"); kopf.addColorStop(1, "#bdb8b0"); g.fillStyle = kopf; g.beginPath(); g.ellipse(x1 + 62 + b * 0.4, y - 92, 20, 24, 0.4, 0, 6.2832); g.fill(); g.restore();
  knochen(() => { g.beginPath(); g.moveTo(x1 + 76 + b * 0.3, y - 100); g.quadraticCurveTo(x1 + 104, y - 96, x1 + 108 + b * 0.2, y - 60); }, 14);
  // die Membran
  const mem = () => { g.beginPath(); g.moveTo(x1 - 2, y - r - 6); g.quadraticCurveTo(x1 + 34 + b, y - 4, x1 + 6, y + r + 6); g.lineTo(x1 + 20, y + r + 6); g.quadraticCurveTo(x1 + 50 + b, y - 4, x1 + 14, y - r - 6); g.closePath(); };
  mem(); const mg = g.createLinearGradient(x1, y - r, x1 + 40, y + r); mg.addColorStop(0, "#ffffff"); mg.addColorStop(0.5, "#e6e6ea"); mg.addColorStop(1, "#a9aab0"); g.fillStyle = mg; g.fill();
  g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 2; mem(); g.stroke();
  k.leuchten(g, x1 + 18 + b, y - r * 0.4, 120, "255,255,255", 0.22);
  g.restore();
}

// ---------------------------------------------------------------- die schwingende Luft
// Tausende feiner Punkte (Luftmoleküle) in einer Kiste, jeder von den Wellen entlang x verschoben, und darunter
// ein weicher Dunst, der zeigt, wo die Luft zusammengedrückt wird (die Bänder). wellen: [{ A, k, w, phase, color, vorzeichen, von, bis }].
const PARTS = (() => { const zuf = zufall(515), p = []; for (let i = 0; i < 9000; i++) p.push([zuf(), zuf(), zuf()]); return p; })();
const grenze = (q, x) => (q.von !== undefined ? k.sanft(k.rampe(x, q.von - 60, q.von)) : 1) * (q.bis !== undefined ? 1 - k.sanft(k.rampe(x, q.bis, q.bis + 60)) : 1);
export function luft(g, t, kiste, wellen, o = {}) {
  const [x0, y0, x1, y1] = kiste, deck = o.deck ?? 1, area = (x1 - x0) * (y1 - y0), n = Math.min(PARTS.length, Math.round(o.n || area / 22));
  if (deck <= 0.01) return;
  const beiX = (x) => { let dx = 0, comp = 0, mag = 0, col = LUFT, best = 0; for (const q of wellen) { if (!q.A) continue; const L = grenze(q, x), A = q.A * L * (q.vorzeichen || 1), ph = q.k * x - q.w * t + (q.phase || 0); dx += A * Math.sin(ph); comp -= A * q.k * Math.cos(ph); const a = Math.abs(q.A * L); mag += a; if (a > best) { best = a; col = q.color; } } return { dx, comp, mag, col }; };
  g.save(); g.globalCompositeOperation = "lighter";
  // der Dunst: Bänder, wo die Luft zusammengedrückt wird
  const schritte = 60, bg = g.createLinearGradient(x0, 0, x1, 0);
  for (let i = 0; i <= schritte; i++) { const x = x0 + (i / schritte) * (x1 - x0), e = beiX(x), d = Math.max(0, e.comp) * 1.6; const c = e.mag > 0.5 ? k.mischRgb(LUFT, e.col, Math.min(1, Math.abs(e.dx) / Math.max(1, e.mag) + 0.3)) : LUFT; bg.addColorStop(i / schritte, `rgba(${c},${Math.min(0.16, d * 0.25) * deck})`); }
  g.save(); g.filter = "blur(10px)"; g.fillStyle = bg; g.fillRect(x0 + 6, y0 + 10, x1 - x0 - 12, y1 - y0 - 20); g.restore();
  // die Punkte
  for (let i = 0; i < n; i++) {
    const [u, v, w] = PARTS[i], bx = x0 + u * (x1 - x0), by = y0 + v * (y1 - y0), e = beiX(bx);
    const abmischung = e.mag > 0.5 ? Math.min(1, 0.2 + Math.abs(e.dx) / Math.max(1, e.mag)) : 0;
    const c = abmischung > 0.05 ? k.mischRgb(LUFT, e.col, abmischung) : LUFT;
    const b = Math.max(0.18, Math.min(1, 0.5 + e.comp * 1.8)) * (0.45 + 0.55 * w) * deck;
    const s = (o.groesse || 1.9) * (0.6 + 0.6 * w);
    g.fillStyle = `rgba(${c},${b})`; g.fillRect(bx + e.dx - s / 2, by - s / 2, s, s);
  }
  g.restore();
}

// Eine Welle als helle Linie gezeichnet: von xa bis xb in der Höhe y, mit der gezeichneten Amplitude h.
export function wellenLinie(g, t, xa, xb, y, h, q, deck = 1, dicke = 4) {
  if (deck <= 0.01) return;
  g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = "round"; g.lineJoin = "round";
  const pts = []; for (let x = xa; x <= xb; x += 4) { const lim = q.von !== undefined ? k.sanft(k.rampe(x, q.von - 40, q.von)) : 1; pts.push([x, y - h * lim * Math.sin(q.k * x - q.w * t + (q.phase || 0)) * (q.vorzeichen || 1)]); }
  for (const [w, a] of [[dicke * 4, 0.18], [dicke, 0.95]]) { g.strokeStyle = `rgba(${q.color},${a * deck})`; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); }
  g.restore();
}

// ---------------------------------------------------------------- das Triebwerk des Flugzeugs (Vorderansicht)
const SCHAUFELN = 22;
export function reactor(g, x, y, R, t, tempo = 9) {
  g.save(); g.translate(x, y);
  // die Gondel: ein dicker Metallring
  g.beginPath(); g.arc(0, 0, R * 1.14, 0, 6.2832); const ng = g.createLinearGradient(-R, -R, R, R); ng.addColorStop(0, "#e9ecf1"); ng.addColorStop(0.45, "#9aa0aa"); ng.addColorStop(1, "#3f434b"); g.fillStyle = ng; g.fill();
  g.beginPath(); g.arc(0, 0, R * 1.02, 0, 6.2832); g.fillStyle = "#0d0e11"; g.fill();
  // die Schaufeln, gebogen, sich drehend (mit etwas Bewegungsunschärfe)
  g.save(); g.beginPath(); g.arc(0, 0, R, 0, 6.2832); g.clip();
  const drehung = t * tempo;
  for (let pas = 0; pas < 3; pas++) {
    g.save(); g.rotate(drehung - pas * 0.035); g.globalAlpha = pas ? 0.25 : 1;
    for (let i = 0; i < SCHAUFELN; i++) {
      g.save(); g.rotate((i / SCHAUFELN) * 6.2832);
      g.beginPath(); g.moveTo(R * 0.28, -R * 0.02); g.bezierCurveTo(R * 0.55, -R * 0.09, R * 0.8, -R * 0.06, R * 1.0, -R * 0.12); g.lineTo(R * 1.0, R * 0.06); g.bezierCurveTo(R * 0.8, R * 0.06, R * 0.55, R * 0.07, R * 0.28, R * 0.06); g.closePath();
      const bg = g.createLinearGradient(0, -R * 0.1, 0, R * 0.08); bg.addColorStop(0, "#d3d7de"); bg.addColorStop(0.5, "#7d838d"); bg.addColorStop(1, "#33363c"); g.fillStyle = bg; g.fill();
      g.restore();
    }
    g.restore();
  }
  g.restore();
  // der Mittelkegel mit seiner weißen Spirale
  g.beginPath(); g.arc(0, 0, R * 0.3, 0, 6.2832); const sg = g.createRadialGradient(-R * 0.08, -R * 0.1, 0, 0, 0, R * 0.3); sg.addColorStop(0, "#f4f5f7"); sg.addColorStop(1, "#5b6068"); g.fillStyle = sg; g.fill();
  g.save(); g.rotate(drehung); g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = R * 0.03; g.beginPath(); for (let a = 0; a < 6.2832 * 1.4; a += 0.1) { const rr = R * 0.28 * (a / (6.2832 * 1.4)); a ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(0, 0); } g.stroke(); g.restore();
  // Schein auf dem Rand
  g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, R * 1.12, 3.6, 5.4); g.stroke();
  g.restore();
}

// ---------------------------------------------------------------- das Flugzeugfenster
// Das Fenster bei (x, y), h hoch: der Kunststoffrahmen der Kabine, der Himmel und das Triebwerk von der Seite.
// rauschen: 0 bis 1, die Schallringe, die aus dem Triebwerk kommen.
export function bullauge(g, x, y, h, t, rauschen = 0) {
  const w = h * 0.7;
  g.save(); g.translate(x, y);
  // die Kabinenwand
  g.save(); g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 50;
  gerundet(g, -w * 0.82, -h * 0.72, w * 1.64, h * 1.44, w * 0.7); const pg = g.createLinearGradient(0, -h, 0, h); pg.addColorStop(0, "#5a5d63"); pg.addColorStop(1, "#2a2c30"); g.fillStyle = pg; g.fill(); g.restore();
  gerundet(g, -w * 0.62, -h * 0.58, w * 1.24, h * 1.16, w * 0.55); g.fillStyle = "#1c1d21"; g.fill();
  // das Himmelslicht, das auf die Wand fällt, rund um das Fenster
  g.save(); g.globalCompositeOperation = "lighter"; const lw = g.createRadialGradient(0, h * 0.2, w * 0.4, 0, h * 0.2, h * 1.1); lw.addColorStop(0, "rgba(170,200,255,0.22)"); lw.addColorStop(1, "rgba(170,200,255,0)"); g.fillStyle = lw; g.fillRect(-w * 1.6, -h * 1.2, w * 3.2, h * 2.6); g.restore();
  // die innere Schräge, mit ihrem Licht
  gerundet(g, -w * 0.56, -h * 0.54, w * 1.12, h * 1.08, w * 0.5); const bv = g.createLinearGradient(0, -h * 0.54, 0, h * 0.54); bv.addColorStop(0, "#3a3c42"); bv.addColorStop(0.5, "#5d6068"); bv.addColorStop(1, "#7d8189"); g.fillStyle = bv; g.fill();
  // das Glas: der Himmel und das Triebwerk
  g.save(); gerundet(g, -w / 2, -h / 2, w, h, w * 0.46); g.clip();
  const cg = g.createLinearGradient(0, -h / 2, 0, h / 2); cg.addColorStop(0, "#5f8fcf"); cg.addColorStop(0.6, "#a9c8ec"); cg.addColorStop(1, "#e8eef6"); g.fillStyle = cg; g.fillRect(-w, -h, w * 2, h * 2);
  // vorbeiziehende Wolken
  const zuf = zufall(31);
  for (let i = 0; i < 9; i++) { const nx = ((zuf() * 2 * w - t * 60) % (2 * w) + 2 * w) % (2 * w) - w, ny = h * (0.15 + zuf() * 0.35), nr = w * (0.2 + zuf() * 0.25); g.save(); g.filter = "blur(8px)"; g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.ellipse(nx, ny, nr * 1.6, nr * 0.5, 0, 0, 6.2832); g.fill(); g.restore(); }
  // die Tragfläche, die oben quer läuft, und das Triebwerk, das an seinem Pylon hängt, von schräg vorne gesehen
  const wg = g.createLinearGradient(0, -h * 0.42, 0, -h * 0.22); wg.addColorStop(0, "#eef1f5"); wg.addColorStop(1, "#a9b0bb");
  g.fillStyle = wg; g.beginPath(); g.moveTo(-w * 0.9, -h * 0.36); g.lineTo(w * 0.9, -h * 0.5); g.lineTo(w * 0.9, -h * 0.4); g.lineTo(-w * 0.9, -h * 0.22); g.closePath(); g.fill();
  g.save(); g.translate(-w * 0.05, -h * 0.02);
  g.fillStyle = "#b9c0ca"; g.beginPath(); g.moveTo(-w * 0.1, -h * 0.27); g.lineTo(w * 0.25, -h * 0.3); g.lineTo(w * 0.2, -h * 0.1); g.lineTo(-w * 0.05, -h * 0.1); g.closePath(); g.fill();
  // die Gondel: ein Rohr, das nach hinten schmaler wird
  g.beginPath(); g.moveTo(-w * 0.36, -h * 0.15); g.bezierCurveTo(w * 0.05, -h * 0.17, w * 0.35, -h * 0.12, w * 0.48, -h * 0.05); g.lineTo(w * 0.48, h * 0.06); g.bezierCurveTo(w * 0.35, h * 0.13, w * 0.05, h * 0.17, -w * 0.36, h * 0.15); g.closePath();
  const mg = g.createLinearGradient(0, -h * 0.16, 0, h * 0.16); mg.addColorStop(0, "#ffffff"); mg.addColorStop(0.35, "#eceff3"); mg.addColorStop(0.75, "#b6bcc6"); mg.addColorStop(1, "#7f8692"); g.fillStyle = mg; g.fill();
  g.fillStyle = "rgba(255,255,255,0.7)"; g.fillRect(-w * 0.3, -h * 0.11, w * 0.6, h * 0.012);
  // der Einlass: ein Metallring und der dunkle Fan darin
  g.beginPath(); g.ellipse(-w * 0.36, 0, w * 0.075, h * 0.15, 0, 0, 6.2832); const bg = g.createLinearGradient(-w * 0.44, 0, -w * 0.28, 0); bg.addColorStop(0, "#d9dde3"); bg.addColorStop(1, "#6f7680"); g.fillStyle = bg; g.fill();
  g.beginPath(); g.ellipse(-w * 0.355, 0, w * 0.055, h * 0.125, 0, 0, 6.2832); g.fillStyle = "#1a1c20"; g.fill();
  g.save(); g.beginPath(); g.ellipse(-w * 0.355, 0, w * 0.055, h * 0.125, 0, 0, 6.2832); g.clip();
  for (let i = 0; i < 16; i++) { const a = t * 14 + i * 0.39; g.strokeStyle = "rgba(170,176,186,0.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(-w * 0.355, 0); g.lineTo(-w * 0.355 + Math.cos(a) * w * 0.05, Math.sin(a) * h * 0.12); g.stroke(); }
  g.restore();
  // die hintere Düse
  g.beginPath(); g.ellipse(w * 0.48, 0, w * 0.02, h * 0.055, 0, 0, 6.2832); g.fillStyle = "#3a3d43"; g.fill();
  g.restore();
  g.restore();
  // die Fensterblende, fast ganz hochgezogen, mit ihrem Griff
  g.save(); gerundet(g, -w / 2, -h / 2, w, h, w * 0.46); g.clip();
  const ps = g.createLinearGradient(0, -h / 2, 0, -h * 0.36); ps.addColorStop(0, "#d9d6cf"); ps.addColorStop(1, "#b9b5ad"); g.fillStyle = ps; g.fillRect(-w, -h, w * 2, h * 0.64);
  g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(-w, -h * 0.365, w * 2, 6); gerundet(g, -w * 0.12, -h * 0.385, w * 0.24, 14, 7); g.fillStyle = "#8f8b84"; g.fill();
  g.restore();
  // die Spiegelung des Glases und der Rahmen
  gerundet(g, -w / 2, -h / 2, w, h, w * 0.46); g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 6; g.stroke();
  g.save(); gerundet(g, -w / 2, -h / 2, w, h, w * 0.46); g.clip(); const rg = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); rg.addColorStop(0.2, "rgba(255,255,255,0)"); rg.addColorStop(0.3, "rgba(255,255,255,0.18)"); rg.addColorStop(0.4, "rgba(255,255,255,0)"); g.fillStyle = rg; g.fillRect(-w, -h, w * 2, h * 2); g.restore();
  g.restore();
  // die Lärmringe, die aus dem Triebwerk kommen und die Wand durchqueren
  if (rauschen > 0.01) {
    g.save(); g.globalCompositeOperation = "lighter";
    const mx = x - w * 0.02, my = y - h * 0.03;
    for (let i = 0; i < 7; i++) {
      const u = ((t * 0.55 + i / 7) % 1), R = 60 + u * h * 1.3, a = rauschen * (1 - u) * 0.75;
      g.strokeStyle = `rgba(${GOLDTON},${a * 0.3})`; g.lineWidth = 16; g.beginPath(); g.arc(mx, my, R, 0, 6.2832); g.stroke();
      g.strokeStyle = `rgba(${GOLDTON},${a})`; g.lineWidth = 3; g.setLineDash([3, 9]); g.beginPath(); g.arc(mx, my, R, 0, 6.2832); g.stroke(); g.setLineDash([]);
    }
    g.restore();
  }
}

// ---------------------------------------------------------------- der Chip
// Der Chip in Nahaufnahme: eine Metallplatte mit ihrem goldenen Rand und einem Bildschirm, der die Welle zeigt.
// welle(gc, w, h): zeichnet die Welle auf den Bildschirm des Chips (in Bildschirmkoordinaten).
// Die Platine, auf der der Chip sitzt: sehr dunkelgrün mit Kupferbahnen; licht (0..1) lässt sie golden leuchten,
// vom Rand zum Chip hin, wie ein Signal, das hereinkommt.
export function platte(g, t, licht = 0, color = "255,190,80") {
  g.save();
  const bg = g.createRadialGradient(540, 1000, 100, 540, 1000, 1100); bg.addColorStop(0, "#10231d"); bg.addColorStop(1, "#050a08"); g.fillStyle = bg; g.fillRect(0, 0, 1080, 1920);
  const zuf = zufall(77); g.lineCap = "round"; g.lineJoin = "round";
  for (let i = 0; i < 34; i++) {
    const seite = i % 4, off = (zuf() - 0.5) * 1400, pts = [];
    let px = seite === 0 ? -50 : seite === 1 ? 1130 : 540 + off * 0.6, py = seite < 2 ? 1000 + off : seite === 2 ? -50 : 1970;
    pts.push([px, py]);
    const tx = 540 + (zuf() - 0.5) * 760, ty = 1000 + (zuf() - 0.5) * 460;
    pts.push(seite < 2 ? [misch(px, tx, 0.5), py] : [px, misch(py, ty, 0.5)]); pts.push(seite < 2 ? [misch(px, tx, 0.5) + (ty - py) * 0.0, ty] : [tx, misch(py, ty, 0.5)]); pts.push([tx, ty]);
    g.strokeStyle = "rgba(150,110,50,0.35)"; g.lineWidth = 6; g.beginPath(); pts.forEach((p, n) => (n ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
    g.fillStyle = "rgba(190,150,80,0.5)"; g.beginPath(); g.arc(pts[0][0], pts[0][1], 7, 0, 6.2832); g.fill();
    if (licht > 0.01) {
      const u = (t * 0.9 + zuf()) % 1;
      g.save(); g.globalCompositeOperation = "lighter"; g.setLineDash([60, 600]); g.lineDashOffset = -u * 660;
      g.strokeStyle = `rgba(${color},${0.85 * licht})`; g.lineWidth = 5; g.beginPath(); pts.forEach((p, n) => (n ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke();
      g.strokeStyle = `rgba(${color},${0.25 * licht})`; g.lineWidth = 16; g.stroke(); g.restore();
    }
  }
  g.restore();
}
export function chip(g, x, y, w, h, t, welle) {
  g.save(); g.translate(x, y);
  // die Dicke des Chips, darunter
  gerundet(g, -w / 2 + 6, -h / 2 + 22, w, h, 40); g.fillStyle = "#2a2c31"; g.fill();
  g.save(); g.shadowColor = "rgba(0,0,0,0.7)"; g.shadowBlur = 60; g.shadowOffsetY = 30;
  gerundet(g, -w / 2, -h / 2, w, h, 40); const mg = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); mg.addColorStop(0, "#dfe2e7"); mg.addColorStop(0.4, "#8e939c"); mg.addColorStop(0.7, "#c9cdd4"); mg.addColorStop(1, "#5b6068"); g.fillStyle = mg; g.fill(); g.restore();
  // die goldenen Pins
  for (let i = 0; i < 14; i++) { const px = -w / 2 + 50 + i * ((w - 100) / 13); for (const sy of [-1, 1]) { gerundet(g, px - 8, sy * h / 2 - (sy > 0 ? 6 : 22), 16, 28, 4); const pg = g.createLinearGradient(px - 8, 0, px + 8, 0); pg.addColorStop(0, "#8a6418"); pg.addColorStop(0.5, "#f2cd6a"); pg.addColorStop(1, "#8a6418"); g.fillStyle = pg; g.fill(); } }
  // der dunkle Glasbildschirm
  gerundet(g, -w / 2 + 40, -h / 2 + 40, w - 80, h - 80, 22); g.fillStyle = "#07090d"; g.fill();
  g.save(); gerundet(g, -w / 2 + 40, -h / 2 + 40, w - 80, h - 80, 22); g.clip();
  g.strokeStyle = "rgba(255,255,255,0.06)"; g.lineWidth = 1.5; for (let gx = -w / 2 + 40; gx < w / 2; gx += 40) { g.beginPath(); g.moveTo(gx, -h); g.lineTo(gx, h); g.stroke(); } for (let gy = -h / 2 + 40; gy < h / 2; gy += 40) { g.beginPath(); g.moveTo(-w, gy); g.lineTo(w, gy); g.stroke(); }
  g.translate(-w / 2 + 40, -h / 2 + 40); welle(g, w - 80, h - 80);
  g.restore();
  T(g, "H1", w / 2 - 70, -h / 2 + 24, 26, 800, "rgba(40,42,48,0.8)");
  g.restore();
}

// ---------------------------------------------------------------- Menschen (allgemeine Silhouetten)
// Ein stilisierter Kopf im Profil (ohne Gesichtszüge): für «die Person, die neben dir redet».
export function person(g, x, y, s, spricht = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const profil = () => {
    g.beginPath(); g.moveTo(-60, 200);
    g.bezierCurveTo(-70, 140, -120, 120, -120, 40); g.bezierCurveTo(-125, -60, -80, -150, 10, -150); // Nacken und Scheitel
    g.bezierCurveTo(70, -150, 105, -100, 108, -40); // Stirn
    g.bezierCurveTo(110, -20, 106, -6, 122, 14); g.lineTo(108, 28); // die Nase
    g.bezierCurveTo(112, 40, 114, 50, 106, 58); g.bezierCurveTo(112, 66 + 6 * spricht, 110, 76 + 8 * spricht, 100, 84 + 8 * spricht); // die Lippen, die sich beim Reden öffnen
    g.bezierCurveTo(102, 104 + 6 * spricht, 90, 120 + 6 * spricht, 60, 126 + 6 * spricht); // das Kinn
    g.bezierCurveTo(40, 140, 30, 170, 34, 200); g.closePath();
  };
  profil(); const hg = g.createLinearGradient(-120, 0, 120, 0); hg.addColorStop(0, "#0c0c0f"); hg.addColorStop(0.75, "#1d1b20"); hg.addColorStop(1, "#2a2629"); g.fillStyle = hg; g.fill();
  // das goldene Gegenlicht vorne
  g.save(); profil(); g.clip(); g.filter = "blur(6px)"; g.strokeStyle = "rgba(255,200,130,0.9)"; g.lineWidth = 10; g.translate(-4, 0); profil(); g.stroke(); g.restore();
  g.strokeStyle = "rgba(255,220,170,0.7)"; g.lineWidth = 2; profil(); g.stroke();
  // die Schultern
  g.fillStyle = "#16161a"; g.beginPath(); g.ellipse(-20, 290, 190, 110, 0, Math.PI, 0); g.fill();
  g.restore();
}

// ---------------------------------------------------------------- die ganze Ohrszene
// Das Ohr im Querschnitt mit dem AirPod darin und der Luft im Gang. wellen: die im Gang (siehe luft()). ap: Optionen
// des AirPods. draussen: Wellen der Luft draußen (links vom AirPod). Gibt zurück, wie sehr sich das Trommelfell bewegt.
export const AP = { x: 268, y: 1000, s: 0.92 };
export function ohrSzene(g, t, { wellen = [], draussen = [], ap = {}, apX = 0, apY = 0, apAng = 0, n = 1500, inDerLuft = 1, zeilen = null, ablesung = 1 } = {}) {
  const { x0, x1, y, r } = OHR;
  // die Luft draußen
  if (draussen.length) luft(g, t, [-700, y - 320, x0 + 30, y + 320], draussen, { deck: inDerLuft });
  ohr(g, t);
  luft(g, t, [x0 + 50, y - r + 8, x1 - 2, y + r - 8], wellen, { deck: inDerLuft });
  if (zeilen) zeilen();
  // das Trommelfell bewegt sich mit dem, was es erreicht
  let m = 0; for (const q of wellen) if (q.A) m += (q.A / 16) * Math.sin(q.k * x1 - q.w * t + (q.phase || 0)) * (q.vorzeichen || 1);
  trommelfell(g, t, Math.max(-1, Math.min(1, m)));
  airpod(g, AP.x + apX, AP.y + apY, AP.s, { ...ap, ang: apAng });
  // die Anzeige des Trommelfells: was es wirklich erreicht, als dünne Linie darunter
  if (ablesung > 0.01) {
    g.save(); g.globalAlpha *= ablesung; const lx0 = x1 - 300, lx1 = x1 + 10, ly = y + r + 150;
    const amp = Math.min(1, Math.abs(m) + 0.0) ; let A = 0; for (const q of wellen) if (q.A) A += (q.A / 16) * (q.vorzeichen || 1) * 1; A = Math.abs(A);
    g.strokeStyle = `rgba(${A > 0.15 ? GOLDTON : LUFT},0.9)`; g.lineWidth = 2.5; g.beginPath();
    for (let xx = lx0; xx <= lx1; xx += 3) { const yy = ly - 26 * A * Math.sin((xx - lx1) * 0.06 - t * 7 + 1.2); xx === lx0 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(lx1, ly - 26 * A * Math.sin(-t * 7 + 1.2), 5, 0, 6.2832); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(lx1, ly - 40); g.lineTo(x1 + 12, y + r - 6); g.stroke();
    g.restore();
  }
  return m;
}
// Die Triebwerkswelle und ihr Gegenteil, mit denselben Zahlen, damit sie sich wirklich aufheben.
export const RAUSCHEN = (A = 16, extra = {}) => ({ A, k: 0.035, w: 7, color: GOLDTON, ...extra });
export const ANTI = (A = 16, extra = {}) => ({ A, k: 0.035, w: 7, color: BLAU, vorzeichen: -1, von: OHR.x0 + 40, ...extra });

// Ein kleiner, dezenter Hinweis unten links («Verlangsamt dargestellt», «Nicht maßstabsgetreu»...).
export function beschriftung(g, txt, deck = 1) {
  if (deck <= 0.01) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = deck * 0.55; g.font = "500 24px Figtree"; g.textAlign = "left"; g.textBaseline = "alphabetic"; g.fillStyle = "#e6e8ee"; g.fillText(txt, 60, 1400); g.restore();
}
