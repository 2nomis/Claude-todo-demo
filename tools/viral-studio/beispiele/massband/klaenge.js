// Die Effekte: jeder auf dem, was sich bewegt, in dem Bild, in dem es sich bewegt (siehe anleitung/klang.md).
import { v } from "#stimme";
import * as p1 from "./video/einstellungen/01-hook.js";
import * as p2 from "./video/einstellungen/02-brett.js";
import * as p3 from "./video/einstellungen/03-wand.js";
import * as p4 from "./video/einstellungen/04-zange.js";
import * as p5 from "./video/einstellungen/05-falsch.js";
import * as p6 from "./video/einstellungen/06-final.js";

const e = [];
const setze = (klang, t, o = {}) => e.push({ klang, t, ...o });
const f = (n) => v.satz(n);

// 1-3: der Hook
setze("wusch", 0, { anker: "anfang", db: -15, tempo: 0.8, was: "die Kamera dreht sich zum Haken" });
p1.trefferListe.forEach((t, i) => setze("einrasten", t, { db: i % 2 ? -15 : -13, tempo: i % 2 ? 1.08 : 0.95, was: "der Haken klappert" }));
setze("klick", f(1).t("hook") + 0.02, { db: -14, was: "der goldene Ring" });
setze("wusch", p1.momente.rausZoomen, { anker: "anfang", db: -11, was: "zieht zurück aufs ganze Maßband" });
setze("wusch", p1.momente.reinZoomen, { anker: "anfang", db: -12, tempo: 1.1, was: "zurück zum Haken" });
setze("metall", p1.momente.roete + 0.04, { db: -12, tempo: 1.1, was: "wird rot" });
setze("wusch", p1.momente.drehung, { anker: "anfang", db: -13, tempo: 0.7, was: "dreht sich ins Profil" });
setze("anstieg", p1.momente.strahlen, { anker: "anfang", db: -15, was: "wird durchsichtig" });
setze("klick", f(3).t("thickness") + 0.05, { db: -14, was: "die Lücke so dick wie der Haken" });

// 4-5: das Brett
setze("holz", p2.steigt + 0.42, { db: -11, was: "das Brett erreicht den Haken" });
setze("wusch", f(4).t("pull") - 0.05, { anker: "anfang", db: -15, tempo: 1.1, was: "der Pfeil" });
setze("gleiten", p2.zieht + 0.05, { anker: "anfang", db: -10, was: "das Band zieht und der Haken gleitet raus" });
setze("einrasten", p2.zieht + 0.32, { db: -13, was: "der Haken schlägt am Anschlag an" });
setze("klick", f(5).t("zero"), { db: -13, was: "die Nullebene" });
setze("wusch", f(5).t("touches") - 0.05, { anker: "anfang", db: -16, tempo: 0.9, was: "die Linie läuft die Kante entlang" });

// 6-8: die Wand
setze("wusch", f(6).anfang + 0.08, { anker: "anfang", db: -13, tempo: 0.8, was: "die Wand kommt rein" });
setze("wand", p3.aufprall, { db: -10, was: "die Wand trifft den Haken" });
setze("gleiten", p3.steckt - 0.05, { anker: "anfang", db: -11, tempo: 1.1, was: "der Haken gleitet rein" });
setze("einrasten", p3.steckt + 0.28, { db: -13, was: "der Anschlag" });
setze("klick", f(7).t("zero"), { db: -13, was: "die Nullebene" });
setze("wusch", f(7).t("touches") - 0.05, { anker: "anfang", db: -16, tempo: 0.9, was: "die Linie" });
setze("wusch", f(7).ende, { anker: "anfang", db: -13, tempo: 0.7, was: "dreht sich ins Profil" });
setze("wusch", p3.wandRaus, { anker: "anfang", db: -13, was: "die Wand geht weg" });
setze("gleiten", p3.hakenRaus, { anker: "anfang", db: -12, tempo: 1.15, was: "der Haken gleitet raus" });
setze("holz", p3.brettSteigt + 0.38, { db: -12, was: "das Brett steigt" });
setze("klick", f(8).t("thickness"), { db: -14, was: "die Dicke" });
setze("anstieg", f(8).t("never"), { anker: "anfang", db: -14, was: "die Linie läuft das Band entlang" });

// 9: Quetschen
setze("wusch", f(9).anfang + 0.14, { anker: "anfang", db: -13, was: "die Zange kommt rein" });
setze("knirschen", p4.quetscht, { db: -9, was: "sie quetscht die Nieten" });
setze("wusch", f(9).t("tight") + 0.3, { anker: "anfang", db: -15, tempo: 1.2, was: "die Zange geht" });
setze("wusch", f(9).t("two") + 0.05, { anker: "anfang", db: -13, tempo: 0.8, was: "der Haken fährt auf die Wand zu" });
setze("metall", p5.aufprall, { db: -10, was: "trifft und gleitet nicht rein" });
setze("dumpf", f(9).t("wrong"), { db: -12, was: "die Null wird rot" });

// 10-11: mit Absicht, und das Handy
setze("gleiten", f(10).t("loose") - 0.02, { anker: "anfang", db: -15, tempo: 1.2, was: "er löst sich" });
p6.trefferListe.forEach((t, i) => setze("einrasten", t, { db: i % 2 ? -15 : -13, tempo: i % 2 ? 1.08 : 0.95, was: "klappert" }));
setze("anstieg", f(10).t("purpose") - 0.05, { anker: "anfang", db: -13, was: "der türkise Ring" });
setze("klick", f(10).t("purpose") + 0.2, { db: -14, was: "die 0" });
setze("wusch", p6.momente.entfernt, { anker: "anfang", db: -11, was: "zieht zurück: es ist ein Handy" });
setze("tipp", p6.momente.teilen, { db: -11, was: "tippt auf Teilen" });
setze("anstieg", p6.momente.blatt, { anker: "anfang", db: -17, tempo: 1.2, was: "das Blatt gleitet hoch" });
setze("tipp", p6.momente.freund, { db: -11, was: "wählt den Freund" });
setze("tipp", p6.momente.senden, { db: -11, was: "tippt auf Senden" });
setze("hinweiston", p6.momente.senden + 0.08, { db: -13, was: "Sent" });
setze("wusch", p6.momente.kehrtZurueck, { anker: "anfang", db: -12, tempo: 0.8, was: "geht zurück in den Bildschirm" });

export default e;
