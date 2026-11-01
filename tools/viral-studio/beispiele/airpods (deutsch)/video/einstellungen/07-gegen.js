// «Wo das Triebwerk drückt, zieht der Lautsprecher in deinem Ohr, genau gleich stark. Apple nennt das Anti-Lärm.
// Die beiden Wellen treffen sich in deinem Ohr und heben sich auf. Dein Trommelfell bewegt sich kaum, und genau das
// hörst du als Stille.»
// Ein anderer Ort: das Ohr mit dem gläsernen AirPod, nah, mit beiden Wellen über dem Gang.
// - «drückt»: das Gold. «zieht der Lautsprecher»: Die Membran bewegt sich und das Blau kommt heraus, umgekehrt. «gleich stark»: zwei
//   gleiche Messungen. «Anti-Lärm»: Es bekommt ein Etikett.
// - «treffen sich … heben sich auf»: Die zwei Linien verschmelzen zu einer geraden; die Luft wird still und weiß.
// - «Trommelfell bewegt sich kaum»: Die Kamera fährt zum Trommelfell, still. «Stille»: die Geräuschkontrolle, auf
//   «Geräuschunterdrückung».
import * as k from "#kit";
import { v } from "#stimme";
import { ANTI, BLAU, OHR, GOLDTON, RAUSCHEN, pfad2D, ohrSzene, hintergrund, wellenLinie, aufschrift, ohneAnsicht, schleier, vignette, ansicht } from "../welt.js";

export const von = (vz) => vz.satz(9).anfang;
const { sanft: su, rampe: tr, misch, gerundet } = k;
const f9 = v.satz(9), f10 = v.satz(10), f11 = v.satz(11), f12 = v.satz(12);
const T0 = f9.anfang, Tdr = f9.t("druckt"), Tzi = f9.t("zieht"), Tgl = f9.t("gleich"), Tan = f10.t("anti-larm"), Ttr = f11.t("treffen"), Tau = f11.t("auf"), Tte = f12.t("trommelfell"), Tka = f12.t("kaum"), Tst = f12.t("stille"), Tende2 = v.satz(13).anfang;
export const zieht = Tzi - 0.05, verbindet = Ttr - 0.05, hebtAuf = Tau - 0.1, control = Tst - 0.15;
const cam = pfad2D([[T0, [1.18, 590, 940]], [Tgl, [1.22, 610, 930]], [Ttr, [1.2, 620, 960]], [Tte, [1.22, 640, 975]], [Tka, [1.9, 860, 1000]], [Tende2, [1.95, 870, 1000]]]);

export function zeichne(g, t) {
  hintergrund(g);
  const [Z, cx, cy] = cam(t);
  ansicht(g, Z, cx, cy);
  const zuf = su(tr(t, zieht, zieht + 0.4)), jun = su(tr(t, verbindet, hebtAuf + 0.2)), y = OHR.y - 230, sep = 70 * (1 - jun);
  // bevor sie verschmelzen, kommt das Blau allein aus dem Lautsprecher; danach hebt sich die Luft im Gang auf
  ohrSzene(g, t, {
    draussen: [RAUSCHEN(20)],
    wellen: [RAUSCHEN(16), ANTI(16 * zuf * misch(0.6, 1, jun))],
    ap: { schnitt: 0.9, chip: zuf > 0.1 ? "90,170,255" : null, lautsprecher: zuf * Math.sin(t * 7) },
    zeilen: () => {
      const xa = OHR.x0 + 40, xb = OHR.x1;
      wellenLinie(g, t, xa, xb, y - sep, 46 * (1 - jun * 0.999), RAUSCHEN(16), 1 - jun * 0.6);
      wellenLinie(g, t, xa, xa + (xb - xa) * zuf, y + sep, 46 * (1 - jun * 0.999), ANTI(16), zuf * (1 - jun * 0.6));
      // die Summe: eine gerade weiße Linie
      if (jun > 0.5) { g.save(); g.globalAlpha = tr(jun, 0.5, 1); g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 4; g.beginPath(); g.moveTo(xa, y); g.lineTo(xb, y); g.stroke(); g.restore(); }
      // «gleich stark»: die zwei gemessenen Höhen
      const gs = su(tr(t, Tgl - 0.15, Tgl + 0.2)) * (1 - su(tr(t, Ttr - 0.3, Ttr)));
      if (gs > 0.01) for (const [yy, col] of [[y - sep, GOLDTON], [y + sep, BLAU]]) { const xm = xa + 120; g.save(); g.globalAlpha = gs; g.strokeStyle = `rgb(${col})`; g.lineWidth = 3; g.beginPath(); g.moveTo(xm, yy - 46); g.lineTo(xm, yy + 46); g.moveTo(xm - 10, yy - 46); g.lineTo(xm + 10, yy - 46); g.moveTo(xm - 10, yy + 46); g.lineTo(xm + 10, yy + 46); g.stroke(); g.restore(); }
    },
  });
  aufschrift(g, OHR.x1 - 40, y - sep - 110, OHR.x1 - 70, y - sep - 44, "Triebwerk drückt", su(tr(t, Tdr - 0.1, Tdr + 0.2)) * (1 - jun), "255,205,120", 30);
  aufschrift(g, OHR.x0 + 150, y + sep + 120, OHR.x0 + 170, y + sep + 46, "Lautsprecher zieht", zuf * (1 - jun), "140,195,255", 30);
  // «Anti-Lärm»
  const deck = su(tr(t, Tan - 0.1, Tan + 0.25)) * (1 - su(tr(t, Ttr - 0.2, Ttr + 0.1)));
  if (deck > 0.01) { g.save(); g.globalAlpha = deck; const px = OHR.x0 + 330, py = y - 170; gerundet(g, px - 120, py - 34, 240, 68, 34); g.fillStyle = "rgba(20,40,70,0.9)"; g.fill(); g.strokeStyle = "rgba(140,195,255,0.9)"; g.lineWidth = 2.5; g.stroke(); g.font = "800 32px Figtree"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#cfe5ff"; g.fillText("Anti-Lärm", px, py + 1); g.restore(); }
  aufschrift(g, OHR.x1 - 30, OHR.y + OHR.r + 90, OHR.x1 + 20, OHR.y + 30, "fast still", su(tr(t, Tka - 0.1, Tka + 0.3)), "235,238,245", 26);
  ohneAnsicht(g);
  // die Geräuschkontrolle des iPhones, unten
  const c = su(tr(t, control, control + 0.35));
  if (c > 0.01) {
    g.save(); g.globalAlpha = c; g.translate(540, 1390 + (1 - c) * 40);
    gerundet(g, -360, -70, 720, 140, 70); g.fillStyle = "rgba(28,28,32,0.92)"; g.fill(); g.strokeStyle = "rgba(255,255,255,0.12)"; g.lineWidth = 2; g.stroke();
    const ops = ["Transparenz", "Adaptiv", "Geräusch-\nunterdrückung"];
    ops.forEach((o, i) => { const x = -240 + i * 240, on = i === 2; if (on) { gerundet(g, x - 110, -56, 220, 112, 56); g.fillStyle = "#0a84ff"; g.fill(); }
      g.fillStyle = on ? "#fff" : "rgba(255,255,255,0.75)"; g.font = "700 24px Figtree"; g.textAlign = "center"; g.textBaseline = "middle"; o.split("\n").forEach((l, j, a) => g.fillText(l, x, (j - (a.length - 1) / 2) * 28)); });
    g.restore();
  }
  schleier(g, 0.6);
  vignette(g, 0.55, t);
}
