// Die Effekte: jeder auf dem, was sich bewegt, mit den Momenten, die die Einstellungen exportieren.
import { v } from "#stimme";
import { verstummt, glasig } from "./video/einstellungen/01-hook.js";
import { spiegel, hoert, geht } from "./video/einstellungen/02-zweiter.js";
import { bruellt } from "./video/einstellungen/03-flugzeug.js";
import { zaehlung, schiebt } from "./video/einstellungen/04-trommelfell.js";
import { leuchtetAuf, kommtAn, signal } from "./video/einstellungen/05-mikro.js";
import { dreht } from "./video/einstellungen/06-chip.js";
import { hebtAuf, control, verbindet, zieht } from "./video/einstellungen/07-gegen.js";
import { loescht, mikro, rest } from "./video/einstellungen/08-innen.js";
import { ziffer } from "./video/einstellungen/09-200.js";
import { personKommt, scheitert } from "./video/einstellungen/10-stimme.js";
import { leck, geht as gehtAp } from "./video/einstellungen/11-sitz.js";
import { oeffnet, drueckt, ergebnis } from "./video/einstellungen/12-test.js";
import { blau, nichts } from "./video/einstellungen/13-final.js";
import { teilt, waehlt, sendet, weiter } from "./video/einstellungen/14-cta.js";

const e = [];
const setze = (klang, t, o = {}) => e.push({ klang, t, ...o });
const f = (n) => v.satz(n);

// 1 · das Triebwerk und die Stille
setze("wusch", 0, { anker: "anfang", db: -8, tempo: 0.6, was: "das Triebwerk brüllt und die Kamera rast los" });
setze("wusch", 0.8, { anker: "anfang", db: -12, tempo: 0.5 });
setze("stoss", verstummt, { db: -9, tempo: 0.8, was: "plötzlich Stille im Ohr" });
setze("glas", glasig, { db: -13, was: "der AirPod wird zu Glas" });
setze("anstieg", f(1).t("einmal"), { db: -15 });
setze("wusch", f(2).t("wohin"), { anker: "anfang", db: -12, tempo: 0.7, was: "die Kamera fährt ins Ohr" });
// 2 · der zweite Klang
setze("tick", f(3).t("nirgendwohin") + 0.15, { db: -15, lp: 6000 });
setze("klick", f(3).t("entfernen"), { db: -16 });
setze("anstieg", geht, { db: -11, was: "die blaue Welle kommt heraus" });
setze("klick", hoert, { db: -12, was: "das Mikro leuchtet auf" });
setze("tick", hoert + 0.2, { db: -16, lp: 6000 });
setze("wusch", spiegel, { anker: "anfang", db: -13, tempo: 1.0, umgekehrt: true, was: "das Gegenteil" });
// 3 · das Flugzeug
setze("wusch", f(5).anfang + 0.1, { anker: "anfang", db: -12, tempo: 0.5, was: "das Flugzeugfenster" });
setze("explosion", bruellt, { db: -15, lp: 900, tempo: 0.6, was: "das Triebwerk brüllt" });
setze("wusch", f(5).t("langes"), { anker: "anfang", db: -13, tempo: 0.4 });
setze("kanone", f(5).t("drohnen"), { db: -18, lp: 700, was: "das Dröhnen" });
// 4 · das Trommelfell
setze("wusch", f(6).anfang + 0.1, { anker: "anfang", db: -15, tempo: 0.6 });
setze("quetsch", schiebt + 0.3, { db: -13, was: "die Luft drückt aufs Trommelfell" });
setze("quetsch", f(6).t("zieht") + 0.1, { db: -14, tempo: 1.15, umgekehrt: true, was: "und zieht" });
for (let i = 0; i < 6; i++) setze("tick", zaehlung + i * 0.18, { db: -16, lp: 6000, was: i ? undefined : "der Zähler" });
// 5 · das Mikrofon
setze("wusch", f(7).anfang + 0.18, { anker: "anfang", db: -15, tempo: 0.6 });
setze("klick", leuchtetAuf, { db: -11, was: "das Mikro leuchtet auf" });
setze("wusch", f(7).t("hort") - 0.2, { anker: "anfang", db: -13, tempo: 0.6, was: "das Dröhnen kommt an" });
setze("anstieg", signal, { db: -10, tempo: 1.3, was: "das Signal läuft zum Lautsprecher" });
setze("dumpf", kommtAn, { db: -15, was: "der Lärm erreicht das Ohr, zu spät" });
// 6 · der Chip
setze("wusch", f(8).anfang + 0.12, { anker: "anfang", db: -13, tempo: 0.8, was: "der Chip kommt rein" });
setze("metall", f(8).anfang + 0.45, { db: -16, was: "der Chip setzt sich" });
setze("wusch", dreht, { anker: "anfang", db: -11, tempo: 1.2, umgekehrt: true, was: "die Welle dreht sich um" });
setze("klick", f(8).t("kopf") + 0.15, { db: -12 });
// 7 · der Gegenschall
setze("wusch", f(9).anfang + 0.1, { anker: "anfang", db: -15, tempo: 0.6 });
setze("anstieg", zieht, { db: -11, was: "der Lautsprecher zieht: blau" });
setze("klick", f(9).t("gleich"), { db: -13, was: "gleich" });
setze("klick", f(10).t("anti-larm"), { db: -11, was: "Anti-Lärm" });
setze("wusch", verbindet, { anker: "anfang", db: -12, tempo: 0.7, was: "die Wellen treffen sich" });
setze("schlag", hebtAuf, { db: -11, was: "sie heben sich auf" });
setze("wusch", f(12).t("trommelfell"), { anker: "anfang", db: -15, tempo: 0.6, was: "die Kamera fährt zum Trommelfell" });
setze("klick", control + 0.2, { db: -11, was: "die Geräuschkontrolle" });
// 8 · das zweite Mikro
setze("tick", rest, { db: -14, lp: 6000, was: "ein Rest bleibt" });
setze("tick", rest + 0.5, { db: -16, lp: 6000 });
setze("wusch", f(14).anfang + 0.1, { anker: "anfang", db: -14, tempo: 0.7, was: "die Kamera fährt näher" });
setze("klick", mikro, { db: -11, was: "das innere Mikro" });
setze("anstieg", f(14).t("ubrig") - 0.2, { db: -13, was: "der Strahl" });
setze("schlag", loescht + 0.2, { db: -12, was: "der Rest blendet aus" });
// 9 · 200
setze("wusch", f(15).anfang + 0.12, { anker: "anfang", db: -12, tempo: 0.8, was: "der AirPod kommt rein" });
setze("klick", f(15).t("pro"), { db: -14 });
for (let i = 0; i < 8; i++) setze("tick", ziffer + i * 0.1, { db: -16, lp: 6000, was: i ? undefined : "die Zahl zählt hoch" });
setze("klick", ziffer + 0.85, { db: -11, was: "200" });
// 10 · die Stimme
setze("wusch", f(16).anfang + 0.12, { anker: "anfang", db: -14, tempo: 0.7 });
setze("klick", f(16).t("aus"), { db: -12, was: "das Triebwerk: aufgehoben" });
setze("wusch", personKommt, { anker: "anfang", db: -13, tempo: 0.9, was: "die Person kommt rein" });
setze("anstieg", f(17).t("leicht"), { db: -15 });
setze("tick", f(17).t("stimme"), { db: -15, lp: 6000 });
setze("dumpf", scheitert + 0.4, { db: -13, was: "die Stimme kommt durch" });
setze("klick", f(17).t("schnell"), { db: -14 });
// 11 · der Sitz
setze("wusch", f(18).anfang + 0.1, { anker: "anfang", db: -15, tempo: 0.6 });
setze("quetsch", f(18).t("sitz"), { db: -12, was: "der Ohrstöpsel dichtet ab" });
setze("gleiten", gehtAp, { db: -12, was: "der AirPod rutscht ein bisschen raus" });
setze("wusch", leck, { anker: "anfang", db: -11, tempo: 0.8, was: "der Lärm dringt ein" });
// 12 · der Test
setze("wusch", f(19).anfang + 0.12, { anker: "anfang", db: -13, tempo: 0.8, was: "das iPhone kommt rein" });
setze("tipp", drueckt, { db: -10, was: "tippt auf die Zeile" });
setze("gleiten", oeffnet, { db: -15, tempo: 1.3, was: "der Test öffnet sich" });
setze("glocke", ergebnis + 0.1, { db: -17, was: "Gute Abdichtung" });
// 13 · das Ende
setze("explosion", f(20).anfang + 0.2, { db: -17, lp: 900, tempo: 0.6, was: "das Triebwerk brüllt wieder" });
setze("anstieg", blau, { db: -12, was: "das Blau" });
setze("schlag", nichts, { db: -10, was: "nichts" });
setze("wusch", f(20).t("welt"), { anker: "anfang", db: -15, tempo: 0.5 });
// 14 · der Abschluss
setze("tipp", weiter, { db: -9, was: "Folgen" });
setze("klick", weiter + 0.12, { db: -13 });
setze("tipp", teilt, { db: -11, was: "teilen" });
setze("wusch", teilt + 0.05, { anker: "anfang", db: -14, tempo: 1.1, was: "das Blatt gleitet hoch" });
setze("tipp", waehlt, { db: -11, was: "wählt Lea" });
setze("tipp", sendet, { db: -9, was: "senden" });
setze("hinweiston", sendet + 0.2, { db: -13, was: "Gesendet" });
setze("wusch", v.dauer - 1.6, { anker: "anfang", db: -16, tempo: 0.5, was: "der letzte Zoom" });

// Schichten, die das Video befriedigender machen: ein Anstieg vor jeder Enthüllung und ein tiefer Schlag darauf
const enthuellt = (t, was) => { setze("anstieg", t - 0.35, { anker: "anfang", db: -15, tempo: 0.7, was: "steigt: " + was }); setze("dumpf-tief", t, { db: -15, lp: 2500, was }); };
enthuellt(verstummt, "stille");
enthuellt(spiegel + 0.1, "Gegenteil");
enthuellt(f(10).t("anti-larm"), "Anti-Lärm");
enthuellt(hebtAuf + 0.05, "sie heben sich auf");
enthuellt(ziffer + 0.85, "200");
enthuellt(nichts + 0.15, "nichts");
// der Hook: Das Triebwerk ist auch zu hören, wenn die Kamera daran vorbeifährt
setze("stoss", 1.55, { db: -11, tempo: 0.9, was: "die Kamera erreicht das Ohr" });
setze("tick", f(1).t("einmal") + 0.2, { db: -17, lp: 6000 });
// das Trommelfell: ein weicher Schlag bei jedem sichtbaren Drücken
for (let i = 0; i < 4; i++) setze("ball", schiebt + 0.4 + i * 0.55, { db: -19 - i, tempo: 1.4, lp: 1800 });
// der Chip: die Leiterbahnen leuchten auf
for (let i = 0; i < 5; i++) setze("tick", f(8).anfang + 0.25 + i * 0.12, { db: -18, lp: 6000, tempo: 1.2 });
setze("piep", f(8).t("welle"), { db: -20, was: "die Welle auf dem Chip" });
// die Geräuschkontrolle und der Sitztest
setze("anstieg", control - 0.1, { db: -16, tempo: 1.2 });
setze("piep", ergebnis + 0.05, { db: -18 });
// der Abschluss
setze("anstieg", sendet - 0.3, { anker: "anfang", db: -16, tempo: 1.1 });

// die Luft im Ohr bewegt sich immer: ein weicher Hauch, wo sonst nichts klingt
for (const [a, b] of [[7.6, 12.3], [14.4, 17.2], [30.4, 32.6], [35.4, 37.5], [43.5, 50.1], [53.4, 57.2], [57.7, 58.5], [62.0, 64.8], [76.0, 80.2], [83.5, 85.6], [102.3, 105.0]])
  for (let s = a + 0.6; s < b - 0.5; s += 1.7) setze("wusch", s, { anker: "anfang", db: -19, tempo: 0.45 });

export default e;
