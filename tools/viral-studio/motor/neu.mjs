#!/usr/bin/env node
// neu.mjs: legt den Ordner für ein neues Video an, mit dem Nötigsten für den Anfang.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { WURZEL, argumente, hilfe, schreibeJson, fehler } from "./lib/gemeinsam.mjs";

hilfe(`
node motor/neu.mjs "<die Idee>" [--slug kurzer-name]

Legt projekte/<datum>-<name>/ an und gibt den Pfad aus:
  idee.md              die Idee, was sie in einem Satz sagt, und die Fakten mit Quelle (schreibst du)
  skript.json          die Sätze (schreibst du; siehe METHODE.md, Schritt 2)
  plan.md              Satz für Satz, was zu sehen ist (schreibst du; Schritt 4)
  video/welt.js        was die Einstellungen teilen (dasselbe Objekt, derselbe Himmel, dieselbe Kamera)
  video/einstellungen/ eine Datei pro Einstellung; fang mit 01-hook.js an
  klaenge.js           die Effekte (wenn das Video welche hat)
  notizen.md           was gemacht wurde und warum
`);

const { lose, opt } = argumente();
const idea = lose.join(" ").trim();
if (!idea) fehler('Die Idee fehlt: node motor/neu.mjs "warum der Himmel blau ist"');
const slug = String(opt.slug || idea).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "video";
const heute = new Date().toISOString().slice(0, 10), dir = join(WURZEL, "projekte", `${heute}-${slug}`);
if (existsSync(dir)) fehler(`${dir} gibt es schon. Wenn es ein anderes Video ist, gib ihm einen anderen --slug.`);
mkdirSync(join(dir, "video", "einstellungen"), { recursive: true });

writeFileSync(join(dir, "idee.md"), `# ${idea}

Gewünscht am ${heute}.

## Was sie in einem Satz sagt

## Die Fakten, jeder mit seiner Quelle
`);
schreibeJson(join(dir, "skript.json"), {
  titel: idea, sprache: "de", untertitel: "oben",
  saetze: [
    { text: "", schluessel: "", hook: true },
    { text: "", schluessel: "" },
  ],
});
writeFileSync(join(dir, "plan.md"), `# Plan: ${idea}

## Die Orte

## Satz für Satz

| # | Satz (und sein Schlüsselwort) | Was zu sehen ist, vom ersten bis zum letzten Wort | Wort, bei dem der große Moment passiert | Kamera | Wie es zur nächsten geht |
|---|---|---|---|---|---|
`);
writeFileSync(join(dir, "video", "welt.js"), `// Was die Einstellungen dieses Videos teilen: dasselbe Objekt, derselbe Himmel, dieselbe Kamera. Wenn etwas in mehr
// als einer Einstellung vorkommt, wird es hier einmal gebaut, damit es immer dasselbe ist, in derselben Größe.
import * as k from "#kit";
import { v } from "#stimme";
`);
writeFileSync(join(dir, "video", "einstellungen", "01-hook.js"), `// «(der erste Satz)»
// Was zu sehen ist, Satz für Satz, vom ersten bis zum letzten Wort (so wie es in plan.md steht).
import * as k from "#kit";
import { v } from "#stimme";

export const von = 0; // die erste Einstellung beginnt bei 0; die anderen beim Wort, das das Neue bringt ("wort" oder "wort#2")

export function zeichne(g, t) {
  // t: die Sekunde des Videos. Alles wird aus t berechnet (nichts wird von einem Bild zum nächsten aufbewahrt).
  // v.t("wort"): wann dieses Wort gesagt wird.
  g.fillStyle = "#03050a"; g.fillRect(0, 0, 1080, 1920);
}
`);
writeFileSync(join(dir, "klaenge.js"), `// Die Effekte: jeder auf dem, was sich bewegt, in dem Bild, in dem es sich bewegt (siehe anleitung/klang.md).
import { v } from "#stimme";

const e = [];
const setze = (klang, t, o = {}) => e.push({ klang, t, ...o });

export default e;
`);
writeFileSync(join(dir, "notizen.md"), `# ${idea}\n\nGewünscht am ${heute}.\n`);
console.log(dir);
