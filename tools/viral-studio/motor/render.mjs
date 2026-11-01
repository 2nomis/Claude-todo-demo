#!/usr/bin/env node
// render.mjs: das echte Video, mit seiner Stimme und seinen Effekten.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { basename, join } from "node:path";
import { Worker } from "node:worker_threads";
import { WURZEL, argumente, hilfe, projektOrdner, schreibeWav, fehler, ffmpeg, leseAudio } from "./lib/gemeinsam.mjs";
import { SR } from "./lib/mischung.mjs";
import { oeffnen } from "./lib/projekt.mjs";
import { spruenge } from "./lib/spruenge.mjs";

hilfe(`
node motor/render.mjs <projekt> [--entwurf] [--von s] [--bis s] [--eroeffnung name] [--ausgabe datei.mp4] [--threads N]

Ohne alles: das fertige Video, mit 60 fps, in ausgabe/<projekt>/, mit Titelbild (titelbild.jpg) und Posttext
(posttext.txt, aus der posttext.txt des Projekts). Am Ende listet es die einzelnen Sprünge auf, die es findet: Sieh sie dir mit ansehen.mjs an.
--entwurf: mit 30 fps und schneller, in <projekt>/pruefen/entwurf.mp4, um es in Bewegung zu sehen.
--von und --bis: nur dieser Abschnitt (mit --entwurf, um den Hook zu zeigen: --bis 10).
--eroeffnung 01-tunnel: mit --entwurf, der Hook mit der anderen Eröffnung (video/eroeffnungen/01-tunnel.js statt Einstellung 01),
  in <projekt>/pruefen/entwurf-01-tunnel.mp4. Nur Stimme: Die Effekte gehören zur anderen Eröffnung.
Stimme und Effekte werden gemischt wie in den Videos, die funktioniert haben (die Effekte unter der Stimme), und in ihrer Lautstärke.
`);

const LAUTSTAERKE = -21;      // LUFS des Videos (in Stereo), die der freigegebenen Videos; Stimme und Effekte, 1 zu 1
const { lose, opt } = argumente();
const dir = projektOrdner(lose[0]);
const eroeffnung = opt.eroeffnung ? String(opt.eroeffnung) : null;
if (eroeffnung && !opt.entwurf) fehler("--eroeffnung ist dafür da, den Hook zu zeigen: benutze es mit --entwurf.");
const proj = await oeffnen(dir, { eroeffnung });
const entwurf = !!opt.entwurf, fps = Number(opt.fps || (entwurf ? 30 : 60));
const von = Math.max(0, Number(opt.von || 0)), bis = Math.min(proj.dauer, Number(opt.bis || proj.dauer));
const erstes = Math.round(von * fps), letztes = Math.round(bis * fps);
const name = basename(dir);
const ausgabe = opt.ausgabe ? String(opt.ausgabe) : entwurf ? join(dir, "pruefen", eroeffnung ? `entwurf-${eroeffnung}.mp4` : "entwurf.mp4") : join(WURZEL, "ausgabe", name, `${name}.mp4`);
const tmp = join(dir, "pruefen", ".render");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(join(ausgabe, ".."), { recursive: true });

// --- das Bild, in Stücken, jedes in einem Thread
const nh = Math.max(1, Math.min(Number(opt.threads || Math.min(8, cpus().length - 1)), Math.ceil((letztes - erstes) / 60)));
const t0 = Date.now(), total = letztes - erstes, erledigt = new Array(nh).fill(0);
let gemeldet = 0;
const brocken = [];
for (let i = 0; i < nh; i++) {
  const a = erstes + Math.floor((total * i) / nh), b = erstes + Math.floor((total * (i + 1)) / nh), seg = join(tmp, `stueck-${String(i).padStart(2, "0")}.mp4`);
  const w = new Worker(new URL("./lib/arbeiter.mjs", import.meta.url), { workerData: { dir, erstes: a, letztes: b, fps, ausgabe: seg, qualitaet: entwurf ? "entwurf" : "final", eroeffnung } });
  brocken.push({ seg, ende: new Promise((ok, falsch) => {
    w.on("message", (m) => {
      erledigt[i] = m.erledigt;
      const pct = Math.floor((100 * erledigt.reduce((x, y) => x + y, 0)) / total);
      if (pct >= gemeldet + 20) { gemeldet = pct - (pct % 20); console.log(`  ${gemeldet} %`); }
      if (m.ende) ok();
    });
    w.on("error", falsch);
    w.on("exit", (c) => (c ? falsch(new Error(`Thread ${i} beendet mit ${c}`)) : ok()));
  }) });
}
await Promise.all(brocken.map((x) => x.ende));
const liste = join(tmp, "liste.txt");
writeFileSync(liste, brocken.map((x) => `file '${x.seg.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n") + "\n");
const bild = join(tmp, "bild.mp4");
ffmpeg(["-f", "concat", "-safe", "0", "-i", liste, "-c", "copy", bild]);

// --- der Klang: die Stimme und die Effekte, in ihrer Lautstärke
const stimme = leseAudio(join(dir, "stimme", "stimme.wav"), SR), fx = join(dir, "klaenge", "effekte.wav");
const effekte = existsSync(fx) && !eroeffnung ? leseAudio(fx, SR) : null;
const a0 = Math.round(von * SR), a1 = Math.min(stimme.length, Math.round(bis * SR)), abmischung = new Float32Array(Math.max(0, a1 - a0));
for (let i = 0; i < abmischung.length; i++) abmischung[i] = stimme[a0 + i] + (effekte ? effekte[a0 + i] || 0 : 0);
const rohklang = join(tmp, "klang.wav");
schreibeWav(rohklang, abmischung, SR);
// wie laut es in Stereo klingt (derselbe Klang auf beiden Seiten, ohne ihn leiser zu machen), in integrierten LUFS; ffmpeg schreibt
// es am Ende seiner Fehlerausgabe
const STEREOBILD = "pan=stereo|c0=c0|c1=c0";
let lufs = LAUTSTAERKE;
const gemessen = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", rohklang, "-af", `${STEREOBILD},ebur128`, "-f", "null", "-"], { encoding: "utf8" });
const I = [...String(gemessen.stderr).matchAll(/I:\s+(-?\d+(\.\d+)?) LUFS/g)].pop();
if (I) lufs = Number(I[1]);
const verstaerkung = Math.max(-12, Math.min(18, LAUTSTAERKE - lufs));
ffmpeg(["-i", bild, "-i", rohklang, "-filter_complex", `[1:a]${STEREOBILD},volume=${verstaerkung.toFixed(2)}dB,alimiter=limit=0.89:level=false[a]`, "-map", "0:v", "-map", "[a]",
  "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", ausgabe]);
rmSync(tmp, { recursive: true, force: true });
const seg = ((Date.now() - t0) / 1000).toFixed(0);
console.log(`${ausgabe} (${(bis - von).toFixed(2)} s, ${fps} fps, ${total} Bilder, ${nh} Threads, ${seg} s)`);

if (!entwurf && !opt.von && !opt.bis) {
  const titelbild = join(ausgabe, "..", "titelbild.jpg");
  ffmpeg(["-ss", String(Math.min(1, proj.dauer / 2)), "-i", ausgabe, "-frames:v", "1", "-q:v", "2", titelbild]);
  console.log(titelbild);
  if (existsSync(join(dir, "posttext.txt"))) { copyFileSync(join(dir, "posttext.txt"), join(ausgabe, "..", "posttext.txt")); console.log(join(ausgabe, "..", "posttext.txt")); }
}
// --- die Sprünge: wo man hinschauen soll
if (!entwurf) {
  const schnitte = proj.einstellungen.slice(1).map((p) => p.von);
  const s = spruenge(ausgabe, fps, schnitte);
  const seltsame = s.einzeln.filter((x) => !x.beimSchnitt);
  if (seltsame.length) console.log(`Einzelne Sprünge außerhalb der Schnitte (sieh sie dir mit ansehen.mjs an; wenn sie kein Blitz und kein gewollter Aufprall sind, behebe sie): ${seltsame.map((x) => (von + x.t).toFixed(2)).join(", ")} s`);
  if (s.wiederholt.length) console.log(`Wiederholte Bilder mitten in einer Bewegung (ein Ruckeln): ${s.wiederholt.map((t) => (von + t).toFixed(2)).join(", ")} s`);
}
