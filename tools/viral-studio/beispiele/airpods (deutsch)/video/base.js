// Was die Einstellungen teilen: die deutsche iPhone-Tastatur (QWERTZ, dunkler Modus) flach und in 3D, mit ihren unsichtbaren
// goldenen Zonen unter jedem Buchstaben; der Daumen; der Hintergrund.
import * as k from "#kit";

const { gerundet, misch, zufall, leinwand } = k;
// mischt zwei "#rrggbb"-Farben und gibt wieder ein "#rrggbb" zurück (es lässt sich erneut mischen)
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mischHex = (a, b, u) => { u = Math.max(0, Math.min(1, u)); const x = hx(a), y = hx(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * u).toString(16).padStart(2, "0")).join(""); };

// ---------------------------------------------------------------- Texturen (einmal)
// Der matte Kunststoff der Tasten: eine sehr feine Körnung.
export const KUNSTSTOFF = (() => {
  const n = 256, l = leinwand(n, n), c = l.getContext("2d"), img = c.createImageData(n, n), zuf = zufall(321);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (zuf() - 0.5) * 70; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  c.putImageData(img, 0, 0); return l;
})();
// Ein dunkler Nussbaumtisch, unscharf, perspektivisch gesehen (für unter das Handy und die Tastatur).
const TISCH = (() => {
  const W = 1080, H = 1100, l = leinwand(W, H), c = l.getContext("2d");
  const base = c.createLinearGradient(0, 0, 0, H); base.addColorStop(0, "#1a120c"); base.addColorStop(1, "#0d0906"); c.fillStyle = base; c.fillRect(0, 0, W, H);
  const maserung = k.rauschen(512, 61, 3, 4, "linien"), zuf = zufall(62);
  c.save(); c.globalCompositeOperation = "overlay"; c.globalAlpha = 0.5;
  // die Holzmaserung, in Längsrichtung gestreckt und nach vorne hin aufgehend (Perspektive)
  for (let y = 0; y < H; y += 20) { const sy = 0.6 + (y / H) * 2.2; c.drawImage(maserung, 0, (y / H) * 400, 512, 30 / sy, -200 * sy, y, W + 400 * sy, 20); }
  c.restore();
  c.save(); c.globalCompositeOperation = "screen"; c.globalAlpha = 0.12; c.drawImage(k.flecken, 0, 0, W, H); c.restore();
  // der Schein des Lichts auf dem Tisch
  const br = c.createRadialGradient(W * 0.75, H * 0.15, 0, W * 0.75, H * 0.15, W * 0.9); br.addColorStop(0, "rgba(255,190,120,0.22)"); br.addColorStop(1, "rgba(255,190,120,0)");
  c.fillStyle = br; c.fillRect(0, 0, W, H);
  const out = leinwand(W, H), o = out.getContext("2d"); o.filter = "blur(5px)"; o.drawImage(l, 0, 0); return out;
})();

// ---------------------------------------------------------------- der Hintergrund und das Finish
// Ein dunkles Studio: warmes Schwarz, ein Bernsteinlicht oben rechts und ein kühles unten links, sehr weich, und
// ein spiegelnder Boden. farbton: die Farbe des Hauptlichts.
export function hintergrund(g, farbton = "255,170,80", { tisch = false, horizont = 860 } = {}) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const bg = g.createLinearGradient(0, 0, 0, 1920); bg.addColorStop(0, "#0a0a0c"); bg.addColorStop(0.55, "#0d0d10"); bg.addColorStop(1, "#060607");
  g.fillStyle = bg; g.fillRect(0, 0, 1080, 1920);
  const l1 = g.createRadialGradient(900, 420, 0, 900, 420, 1100); l1.addColorStop(0, `rgba(${farbton},0.16)`); l1.addColorStop(1, `rgba(${farbton},0)`);
  g.fillStyle = l1; g.fillRect(0, 0, 1080, 1920);
  const l2 = g.createRadialGradient(120, 1650, 0, 120, 1650, 1000); l2.addColorStop(0, "rgba(90,120,255,0.10)"); l2.addColorStop(1, "rgba(90,120,255,0)");
  g.fillStyle = l2; g.fillRect(0, 0, 1080, 1920);
  // unscharfer Lichtstaub
  const zuf = zufall(9);
  g.globalCompositeOperation = "lighter";
  for (let i = 0; i < 14; i++) { const x = zuf() * 1080, y = zuf() * 1920, r = 40 + zuf() * 120, a = 0.025 + zuf() * 0.04; const gg = g.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, `rgba(${farbton},${a})`); gg.addColorStop(1, `rgba(${farbton},0)`); g.fillStyle = gg; g.fillRect(x - r, y - r, r * 2, r * 2); }
  if (tisch) {
    g.globalCompositeOperation = "source-over";
    g.drawImage(TISCH, 0, horizont, 1080, 1920 - horizont);
    // die ferne Tischkante verschwindet im Dunkel
    const fg = g.createLinearGradient(0, horizont, 0, horizont + 520); fg.addColorStop(0, "rgba(11,10,12,1)"); fg.addColorStop(0.5, "rgba(11,10,12,0.55)"); fg.addColorStop(1, "rgba(11,10,12,0)");
    g.fillStyle = fg; g.fillRect(0, horizont - 2, 1080, 522);
  }
  g.restore();
}
export function schleier(g, deck = 0.6) {
  if (deck <= 0.01) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const vg = g.createLinearGradient(0, 150, 0, 640);
  vg.addColorStop(0, `rgba(8,8,10,${deck})`); vg.addColorStop(0.6, `rgba(8,8,10,${deck * 0.65})`); vg.addColorStop(1, "rgba(8,8,10,0)");
  g.fillStyle = vg; g.fillRect(0, 0, 1080, 640); g.restore();
}
// Filmkorn: vier Schichten feines Rauschen, eine pro Bild (es kommt aus t).
const KORN = [0, 1, 2, 3].map((n) => {
  const l = leinwand(540, 960), c = l.getContext("2d"), img = c.createImageData(540, 960), zuf = zufall(700 + n);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (zuf() - 0.5) * 120; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  c.putImageData(img, 0, 0); return l;
});
// Das Finish jeder Einstellung: die Vignette, die Farbe (warme Lichter, kühle Schatten) und das Korn.
const BLOOM = leinwand(270, 480);
export function vignette(g, deck = 0.55, t = 0) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  // das Bloom: die hellsten Teile, in einem Viertel der Größe, weichgezeichnet und darübergelegt (wie Licht in einer Linse)
  const b = BLOOM.getContext("2d"); b.setTransform(1, 0, 0, 1, 0, 0); b.globalCompositeOperation = "source-over"; b.filter = "none";
  b.clearRect(0, 0, 270, 480); b.filter = "brightness(0.36) contrast(4.5) blur(8px)"; b.drawImage(g.canvas, 0, 0, 270, 480); b.filter = "none";
  g.globalCompositeOperation = "screen"; g.globalAlpha = 0.28; g.drawImage(BLOOM, 0, 0, 1080, 1920); g.globalAlpha = 1;
  // die Vignette
  g.globalCompositeOperation = "source-over";
  const vg = g.createRadialGradient(540, 960, 480, 540, 960, 1250);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, `rgba(0,0,0,${deck + 0.1})`);
  g.fillStyle = vg; g.fillRect(0, 0, 1080, 1920);
  // die Farbe des ganzen Videos: warme goldene Lichter, leicht kühle Schatten und tiefes Schwarz mit Zeichnung
  g.globalCompositeOperation = "soft-light";
  const cg = g.createLinearGradient(1080, 0, 0, 1920); cg.addColorStop(0, "rgba(255,196,120,0.42)"); cg.addColorStop(0.55, "rgba(128,128,128,0)"); cg.addColorStop(1, "rgba(70,95,190,0.3)");
  g.fillStyle = cg; g.fillRect(0, 0, 1080, 1920);
  g.globalCompositeOperation = "lighten"; g.fillStyle = "rgb(10,9,11)"; g.fillRect(0, 0, 1080, 1920);
  g.globalCompositeOperation = "overlay"; g.globalAlpha = 0.07;
  g.drawImage(KORN[Math.floor(t * 30) % 4], 0, 0, 1080, 1920);
  g.restore();
}

// ---------------------------------------------------------------- die Tastatur
// In Tastatur-Einheiten: 1000 breit; jede Reihe ist 130 hoch (die Taste 112). Buchstaben klein.
export const KW = 1000, TASTENREIHE = 130, TH = 112;
const TASTENREIHEN = ["qwertzuiopü", "asdfghjklöä", "yxcvbnm"];
// Die Tasten: { c (der Buchstabe oder der Name), x, y, w, h } (x, y: die obere linke Ecke).
export const TASTEN = (() => {
  const t = [], schritt = KW / 11, w = schritt - 10;
  TASTENREIHEN[0].split("").forEach((c, i) => t.push({ c, x: i * schritt + 5, y: 0, w, h: TH }));
  TASTENREIHEN[1].split("").forEach((c, i) => t.push({ c, x: i * schritt + 5, y: TASTENREIHE, w, h: TH }));
  t.push({ c: "shift", x: 5, y: TASTENREIHE * 2, w: schritt * 1.5 - 14, h: TH, grau: true });
  TASTENREIHEN[2].split("").forEach((c, i) => t.push({ c, x: schritt * 1.5 + 4 + i * schritt + 5, y: TASTENREIHE * 2, w, h: TH }));
  t.push({ c: "loeschen", x: KW - schritt * 1.5 + 9, y: TASTENREIHE * 2, w: schritt * 1.5 - 14, h: TH, grau: true });
  t.push({ c: "123", x: 5, y: TASTENREIHE * 3, w: 140, h: TH, grau: true });
  t.push({ c: "Leerzeichen", x: 155, y: TASTENREIHE * 3, w: KW - 155 - 215, h: TH });
  t.push({ c: "Return", x: KW - 205, y: TASTENREIHE * 3, w: 200, h: TH, grau: true });
  return t;
})();
export const taste = (c) => TASTEN.find((q) => q.c === c);
export const mitte = (c) => { const q = taste(c); return [q.x + q.w / 2, q.y + q.h / 2]; };
// Die Nachbarn von E: die, die gequetscht werden, wenn es wächst.
export const NACHBARN_E = ["w", "r", "s", "d", "f", "3"];

const T = (g, txt, x, y, groesse, gewicht = 500, color = "#fff", deck = "center") => { g.font = `${gewicht} ${groesse}px Figtree`; g.textAlign = deck; g.textBaseline = "middle"; g.fillStyle = color; g.fillText(txt, x, y); };

function zeichen(g, q, color) {
  const cx = q.x + q.w / 2, cy = q.y + q.h / 2;
  g.save(); g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 5; g.lineJoin = "round";
  if (q.c === "shift") { g.beginPath(); g.moveTo(cx, cy - 26); g.lineTo(cx + 26, cy + 2); g.lineTo(cx + 12, cy + 2); g.lineTo(cx + 12, cy + 24); g.lineTo(cx - 12, cy + 24); g.lineTo(cx - 12, cy + 2); g.lineTo(cx - 26, cy + 2); g.closePath(); g.stroke(); }
  else if (q.c === "loeschen") { g.beginPath(); g.moveTo(cx - 32, cy); g.lineTo(cx - 14, cy - 20); g.lineTo(cx + 30, cy - 20); g.lineTo(cx + 30, cy + 20); g.lineTo(cx - 14, cy + 20); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(cx - 2, cy - 9); g.lineTo(cx + 16, cy + 9); g.moveTo(cx + 16, cy - 9); g.lineTo(cx - 2, cy + 9); g.stroke(); }
  else T(g, q.c, cx, cy + 1, q.c.length > 3 ? 32 : 46, 400, color);
  g.restore();
}

// Die goldenen Zonen jedes Buchstabens (was wirklich berührt wird), wie Bernsteinglas mit Licht darin. esc(c): wie sehr die
// von c wächst oder schrumpft (1 normal). deck: Transparenz. Zuerst die gequetschten, die wachsenden zuletzt, obendrauf.
export function zonen(g, deck, esc = () => 1, licht = () => 0) {
  if (deck <= 0.01) return;
  g.save(); g.globalAlpha *= deck;
  const ls = TASTEN.filter((q) => q.c.length === 1).map((q) => ({ q, s: esc(q.c) })).sort((a, b) => a.s - b.s);
  for (const { q, s } of ls) {
    const cx = q.x + q.w / 2, cy = q.y + q.h / 2, w = (q.w + 10) * s - 6, h = TASTENREIHE * s - 6, l = licht(q.c), gr = s > 1.05;
    gerundet(g, cx - w / 2, cy - h / 2, w, h, 16 + (s - 1) * 26);
    const gg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.7);
    gg.addColorStop(0, `rgba(255,${gr ? 205 : 170},${gr ? 90 : 60},${0.55 + 0.35 * l + (gr ? 0.25 : 0)})`); gg.addColorStop(1, `rgba(200,120,30,${0.32 + 0.3 * l + (gr ? 0.2 : 0)})`);
    g.fillStyle = gg; g.fill();
    g.strokeStyle = `rgba(255,${gr ? 235 : 205},${gr ? 160 : 120},${gr ? 0.95 : 0.6})`; g.lineWidth = gr ? 4 : 2.5; g.stroke();
    if (gr || l > 0.05) { g.save(); g.globalCompositeOperation = "lighter"; k.leuchten(g, cx, cy, w * 2.2, "natrium", 0.45 * Math.max(l, gr ? 1 : 0)); g.restore(); }
  }
  g.restore();
}

// Die flache Tastatur: der Hintergrund, die Tasten und, wenn verlangt, die Zonen darunter (durch fast
// durchsichtige Tasten gesehen). o: { zonen (0 bis 1), esc, licht, drueckt (Buchstabe mit seiner Blase), blase (0 bis 1), markierung(c) → 0..1 (beleuchtete
// Taste), prozente { c: "86%" }, durchsichtig (0 bis 1: die Tasten werden zu Glas), vorschlaege [3 Texte] }
export function tastatur(g, t, o = {}) {
  g.save();
  // die Vorschlagsleiste und der Tastaturhintergrund
  const sug = o.vorschlaege;
  gerundet(g, -30, sug ? -150 : -30, KW + 60, TASTENREIHE * 4 + (sug ? 180 : 60), 40);
  const fg = g.createLinearGradient(0, -150, 0, TASTENREIHE * 4 + 30); fg.addColorStop(0, "#2a2a2d"); fg.addColorStop(1, "#1d1d20"); g.fillStyle = fg; g.fill();
  g.strokeStyle = "rgba(255,255,255,0.06)"; g.lineWidth = 2; g.stroke();
  if (sug) {
    sug.forEach((s, i) => {
      const x = KW * (i + 0.5) / 3, sel = o.sugSel === i;
      if (sel) { gerundet(g, KW * i / 3 + 20, -130, KW / 3 - 40, 76, 18); g.fillStyle = "#3a3a3e"; g.fill(); }
      T(g, s, x, -92, 40, sel ? 700 : 500, "#f2f2f4");
      if (i < 2) { g.fillStyle = "rgba(255,255,255,0.15)"; g.fillRect(KW * (i + 1) / 3 - 1, -120, 2, 56); }
    });
  }
  zonen(g, o.zonen || 0, o.esc, o.licht);
  const tr = o.durchsichtig || 0;
  for (const q of TASTEN) {
    const m = o.markierung ? o.markierung(q.c) : 0;
    // der dünne Schatten darunter, die Taste mit ihrem Verlauf und ein Lichtrand oben
    const opt = 1 - tr * (q.grau ? 0.85 : 0.8);
    g.save(); g.globalAlpha *= opt; gerundet(g, q.x, q.y + 3, q.w, q.h, 13); g.fillStyle = "rgba(0,0,0,0.55)"; g.fill(); g.restore();
    gerundet(g, q.x, q.y, q.w, q.h, 13);
    const a = q.grau ? "#46464a" : "#717175", b = q.grau ? "#3a3a3e" : "#626266";
    const kg = g.createLinearGradient(0, q.y, 0, q.y + q.h); kg.addColorStop(0, mischHex(a, "#ffffff", m)); kg.addColorStop(1, mischHex(b, "#e8e8ec", m));
    g.save(); g.globalAlpha *= m > 0.01 ? 1 : opt; g.fillStyle = kg; g.fill(); g.restore();
    g.save(); gerundet(g, q.x + 1, q.y + 1, q.w - 2, q.h - 2, 12); g.strokeStyle = `rgba(255,255,255,${0.08 + 0.3 * tr})`; g.lineWidth = 1.5; g.stroke(); g.restore();
    zeichen(g, q, m > 0.5 ? "#111" : "#f4f4f6");
    if (o.prozente && o.prozente[q.c]) { T(g, o.prozente[q.c], q.x + q.w / 2, q.y + q.h - 20, 28, 800, "#ffd27a"); }
  }
  // die Blase des gedrückten Buchstabens, über dem Finger
  if (o.drueckt && (o.blase || 0) > 0.01) blase(g, o.drueckt, o.blase);
  g.restore();
}
// Die Blase einer Taste: der große Buchstabe, der aufploppt (wie auf dem iPhone).
export function blase(g, c, u) {
  const q = taste(c); if (!q) return;
  const s = k.kommtRein(Math.min(1, u)), cx = q.x + q.w / 2, w = q.w * 1.55, h = q.h * 2.15 * s + q.h * (1 - s);
  g.save(); g.globalAlpha *= Math.min(1, u * 3);
  g.shadowColor = "rgba(0,0,0,0.6)"; g.shadowBlur = 24; g.shadowOffsetY = 8;
  g.beginPath();
  const top = q.y + q.h - h, r = 22;
  g.moveTo(q.x, q.y + q.h - 8); g.lineTo(q.x, q.y + q.h * 0.15); g.quadraticCurveTo(q.x, q.y - 4, cx - w / 2, q.y - 30 * s);
  g.lineTo(cx - w / 2, top + r); g.quadraticCurveTo(cx - w / 2, top, cx - w / 2 + r, top); g.lineTo(cx + w / 2 - r, top); g.quadraticCurveTo(cx + w / 2, top, cx + w / 2, top + r);
  g.lineTo(cx + w / 2, q.y - 30 * s); g.quadraticCurveTo(q.x + q.w, q.y - 4, q.x + q.w, q.y + q.h * 0.15); g.lineTo(q.x + q.w, q.y + q.h - 8);
  g.quadraticCurveTo(q.x + q.w, q.y + q.h, q.x + q.w - 8, q.y + q.h); g.lineTo(q.x + 8, q.y + q.h); g.quadraticCurveTo(q.x, q.y + q.h, q.x, q.y + q.h - 8); g.closePath();
  g.fillStyle = "#6c6c71"; g.fill();
  g.shadowColor = "rgba(0,0,0,0)";
  T(g, c, cx, top + (q.y - top) * 0.45 + 10, 92 * (0.6 + 0.4 * s), 500, "#fff");
  g.restore();
}

// ---------------------------------------------------------------- die Strickwolle (für den Handschuh)
export function gewebe(n = 1, color = ["#8b929c", "#4b515a", "#262a30"]) {
  const W = 1080, H = 2100, l = leinwand(W, H), c = l.getContext("2d");
  c.fillStyle = color[2]; c.fillRect(0, 0, W, H);
  const pw = 54, ph = 46;
  for (let y = -ph, reihe = 0; y < H + ph; y += ph, reihe++) for (let x = -pw; x < W + pw; x += pw) {
    for (const seite of [-1, 1]) {
      c.save(); c.translate(x + pw / 2 + seite * pw * 0.22, y + ph / 2); c.rotate(seite * 0.55);
      const gr = c.createLinearGradient(-pw * 0.25, 0, pw * 0.25, 0);
      gr.addColorStop(0, color[1]); gr.addColorStop(0.5, color[0]); gr.addColorStop(1, color[1]);
      c.fillStyle = gr; c.beginPath(); c.ellipse(0, 0, pw * 0.2, ph * 0.62, 0, 0, 6.2832); c.fill();
      c.strokeStyle = "rgba(0,0,0,0.35)"; c.lineWidth = 2; c.stroke();
      c.restore();
    }
  }
  c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.35; c.drawImage(k.flecken, 0, 0, W, H);
  return l;
}
