// Öffnet ein Projekt zum Zeichnen: sein Skript, seine Stimme (wann jedes Wort gesagt wird) und seine Einstellungen.
//
// Eine Einstellung ist eine Datei in video/einstellungen/, die exportiert:
//   von          wann sie beginnt: ein Wort ("natrium", "sonne#2"), eine Zahl in Sekunden oder eine Funktion, die es berechnet.
//                Die erste beginnt bei 0. Jede Einstellung dauert, bis die nächste beginnt.
//   uebergang    wie man von der vorigen hineinkommt: "schnitt" (das Übliche: ein anderer Ort), "weiter" (derselbe
//                Ort und dieselbe Kamera: Kein Wechsel ist zu sehen) oder "blende" (eine Überblendung von 0,3 s).
//   zeichne(g, t) zeichnet das Bild in Sekunde t des Videos (nicht der Einstellung) auf die Leinwand g, 1080 × 1920.
// Die Einstellungen werden danach sortiert, wann sie beginnen, nicht nach ihrem Namen.
//
// Eine Eröffnung ist eine andere Fassung einer Hook-Einstellung, in video/eroeffnungen/, mit derselben Nummer wie die Einstellung, die sie ersetzt
// (eroeffnungen/01-tunnel.js statt einstellungen/01-party.js). oeffnen(dir, { eroeffnung: "01-tunnel" }) benutzt sie.
import { existsSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { fehler, leseJson } from "./gemeinsam.mjs";
import { laden, v } from "./aktuelle-stimme.js";

export const VORLAUF = 0.04; // das neue Bild kommt zwei Bilder vor seinem Wort: So sieht man es, wenn man es hört

export async function oeffnen(dir, { eroeffnung = null } = {}) {
  const skript = leseJson(join(dir, "skript.json"));
  const ft = join(dir, "stimme", "zeiten.json");
  if (!existsSync(ft)) fehler(`Dieses Projekt hat noch keine Stimme: node motor/stimme.mjs ${dir}`);
  const zeiten = leseJson(ft);
  laden(zeiten);
  const ordner = join(dir, "video", "einstellungen");
  if (!existsSync(ordner)) fehler(`Dieses Projekt hat noch keine Einstellungen: lege ${ordner} an, mit einer Datei pro Einstellung.`);
  let dateiliste = readdirSync(ordner).filter((f) => /\.m?js$/.test(f)).sort().map((f) => join(ordner, f));
  if (eroeffnung) {
    const andere = [".js", ".mjs"].map((x) => join(dir, "video", "eroeffnungen", eroeffnung + x)).find((r) => existsSync(r));
    if (!andere) fehler(`Es gibt keine Eröffnung «${eroeffnung}» in ${join(dir, "video", "eroeffnungen")}.`);
    const num = eroeffnung.match(/^(\d+)-/)?.[1];
    if (!num) fehler(`Die Eröffnung «${eroeffnung}» muss mit der Nummer der Einstellung beginnen, die sie ersetzt (01-...).`);
    dateiliste = dateiliste.filter((a) => !basename(a).startsWith(num + "-")).concat(andere);
  }
  const einstellungen = [];
  for (const route of dateiliste) {
    const f = basename(route);
    let m;
    try { m = await import(pathToFileURL(route).href); }
    catch (e) { fehler(`Die Einstellung ${f} lässt sich nicht laden:\n${e.stack || e}`); }
    if (typeof m.zeichne !== "function") fehler(`Die Einstellung ${f} exportiert kein zeichne(g, t).`);
    let von;
    try { von = wann(m.von ?? 0); }
    catch (e) { fehler(`Die Einstellung ${f}: ${e.message}`); }
    const uebergang = m.uebergang || "schnitt";
    if (!["schnitt", "weiter", "blende"].includes(uebergang)) fehler(`Die Einstellung ${f}: Übergang «${uebergang}» gibt es nicht (schnitt, weiter oder blende).`);
    einstellungen.push({ id: f.replace(/\.m?js$/, ""), von, uebergang, zeichne: m.zeichne, abGesagt: m.von });
  }
  if (!einstellungen.length) fehler(`Es gibt keine Einstellungen in ${ordner}.`);
  einstellungen.sort((a, b) => a.von - b.von);
  einstellungen[0].von = 0;
  for (let i = 1; i < einstellungen.length; i++) if (einstellungen[i].von - einstellungen[i - 1].von < 0.2)
    fehler(`Die Einstellungen ${einstellungen[i - 1].id} und ${einstellungen[i].id} beginnen fast gleichzeitig (${einstellungen[i - 1].von.toFixed(2)} und ${einstellungen[i].von.toFixed(2)} s).`);
  einstellungen.forEach((p, i) => (p.bis = i + 1 < einstellungen.length ? einstellungen[i + 1].von : v.dauer));
  return { dir, skript, v, einstellungen, dauer: v.dauer };
}

// Ein Wort, eine Zahl oder eine Funktion → Sekunden des Videos.
function wann(d) {
  if (typeof d === "number") return d;
  if (typeof d === "function") return d(v);
  if (typeof d === "string") return Math.max(0, v.t(d) - VORLAUF);
  throw new Error(`von muss ein Wort, eine Zahl oder eine Funktion sein (es ist ${typeof d}).`);
}
