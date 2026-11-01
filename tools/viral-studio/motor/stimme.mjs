#!/usr/bin/env node
// stimme.mjs: die Stimme des Videos, in einer einzigen Aufnahme, so wie ein Mensch spricht, und die genaue Sekunde jedes Worts.
import { createHash } from "node:crypto";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { argumente, hilfe, ladeSchluessel, projektOrdner, schreibeJson, fehler, ffmpeg, leseAudio, leseJson, r3 } from "./lib/gemeinsam.mjs";
import { schluessel } from "./lib/aktuelle-stimme.js";

hilfe(`
node motor/stimme.mjs <projekt> [--neu]

Liest die Sätze in skript.json und macht mit ElevenLabs:
  stimme/stimme.wav    die ganze Stimme, genau so, wie sie herauskommt: Sie wird nie geschnitten und ihre Pausen werden nie gekürzt
  stimme/zeiten.json   wann jeder Satz und jedes Wort beginnt und endet
und gibt jeden Satz mit der Sekunde seiner Wörter aus, um das Video um sie herum zu planen.
Wenn sich die Sätze und die Parameter nicht geändert haben, fragt es die Stimme nicht noch einmal an (sie kostet Geld). --neu fragt noch einmal an.
Parameter in skript.json, "stimme": { "id", "modell", "stabilitaet", "aehnlichkeit", "stil", "geschwindigkeit" }.
`);

const NACHLAUF = 0.8; // Stille am Ende, damit das letzte Bild atmen kann
const { lose, opt } = argumente();
const dir = projektOrdner(lose[0]);
const skript = leseJson(join(dir, "skript.json"));
const saetze = skript.saetze || fehler("skript.json hat keine «saetze».");
const V = { id: "851ejYcv2BoNPjrkw93G", modell: "eleven_v4", stabilitaet: 0.35, aehnlichkeit: 0.7, stil: 0, geschwindigkeit: 1, ...(skript.stimme || {}) };
const gesprocheneTexte = saetze.map((f) => String(f.gesprochen || f.text).trim());
const signatur = createHash("sha1").update(JSON.stringify([V, gesprocheneTexte])).digest("hex").slice(0, 12);
const faufnahme = join(dir, "stimme", "aufnahme.json"), waufnahme = join(dir, "stimme", "aufnahme.wav");
const woerterVon = (s) => s.split(/\s+/).filter((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length);

let aufnahme = existsSync(faufnahme) && existsSync(waufnahme) ? leseJson(faufnahme) : null;
if (!aufnahme || aufnahme.signatur !== signatur || opt.neu) {
  ladeSchluessel();
  const KEY = process.env.ELEVENLABS_API_KEY;
  if (!KEY) fehler("Es gibt keinen ElevenLabs-Schlüssel. Öffne die Seite zum Einfügen: node motor/schluessel.mjs (frag nie im Chat danach).");
  const nutzlast = {
    text: gesprocheneTexte.join(" "), model_id: V.modell,
    voice_settings: { stability: V.stabilitaet, similarity_boost: V.aehnlichkeit, style: V.stil, speed: V.geschwindigkeit, use_speaker_boost: true },
  };
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${V.id}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST", headers: { "xi-api-key": KEY, "content-type": "application/json" }, body: JSON.stringify(nutzlast),
  });
  if (!r.ok) fehler(`ElevenLabs sagte ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const mp3 = join(dir, "stimme", "aufnahme.mp3");
  schreibeJson(faufnahme, { ausstehend: true });
  writeFileSync(mp3, Buffer.from(j.audio_base64, "base64"));
  ffmpeg(["-i", mp3, "-ar", "48000", "-ac", "1", waufnahme]);
  rmSync(mp3);
  // von Buchstaben zu Wörtern
  const a = j.alignment || j.normalized_alignment, ws = [];
  let cur = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { if (cur) ws.push(cur); cur = null; return; }
    if (!cur) cur = { text: "", anfang: a.character_start_times_seconds[i] };
    cur.text += ch; cur.ende = a.character_end_times_seconds[i];
  });
  if (cur) ws.push(cur);
  aufnahme = { signatur, anbieter: "elevenlabs", parameter: V, woerter: ws.filter((w) => w.text.replace(/[^\p{L}\p{N}]/gu, "").length) };
  schreibeJson(faufnahme, aufnahme);
}

// Die Aufnahme, wie sie ist. Nur die Stille am Anfang wird entfernt (wenn es wirklich Stille ist), und am Ende bleibt ein Nachlauf.
const audio = leseAudio(waufnahme, 48000), SR = 48000;
const ws = aufnahme.woerter;
let kuerzen = Math.max(0, ws[0].anfang - 0.06);
if (kuerzen > 0) {
  let spitze = 0;
  for (let i = 0; i < Math.floor(kuerzen * SR); i++) spitze = Math.max(spitze, Math.abs(audio[i]));
  if (20 * Math.log10(spitze + 1e-9) > -45) kuerzen = 0; // dort klingt schon etwas: lass es in Ruhe
}
const ende = ws[ws.length - 1].ende - kuerzen, total = r3(Math.max(ende + NACHLAUF, audio.length / SR - kuerzen));
ffmpeg(["-i", waufnahme, "-af", `atrim=start=${kuerzen.toFixed(3)},asetpts=N/SR/TB,apad,atrim=0:${total}`, "-ar", "48000", "-ac", "1", join(dir, "stimme", "stimme.wav")]);

// Was gelesen und was gesagt wird, Wort für Wort. Die, die übereinstimmen, behalten ihre echte Sekunde; nur was anders gelesen
// als gesagt wird («KI» gesagt «ka i», «4.000» gesagt «viertausend»), nimmt an seiner Stelle den Abschnitt des Gesagten,
// nach Buchstaben verteilt. (Den ganzen Satz nach Buchstaben zu verteilen, verschob alle seine Wörter um bis zu 0,3 s.)
function ausrichten(geschrieben, gehoert) {
  const E = geschrieben.map(schluessel), O = gehoert.map((w) => schluessel(w.text)), n = E.length, m = O.length;
  const L = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = E[i] === O[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const paare = [];
  for (let i = 0, j = 0; i < n && j < m;) {
    if (E[i] === O[j]) { paare.push([i, j]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  paare.push([n, m]);
  const out = new Array(n);
  let i0 = 0, j0 = 0;
  for (const [i1, j1] of paare) {
    if (i1 > i0) {
      // was zwischen zwei übereinstimmenden Wörtern gelesen wird, im Abschnitt des dazwischen Gesagten
      const a = j1 > j0 ? gehoert[j0].anfang : j0 > 0 ? gehoert[j0 - 1].ende : gehoert[0].anfang, b = j1 > j0 ? gehoert[j1 - 1].ende : a;
      const gewichte = geschrieben.slice(i0, i1).map((w) => Math.max(2, w.length + 1)), tot = gewichte.reduce((x, y) => x + y, 0);
      let t = a;
      gewichte.forEach((p, q) => { const d = ((b - a) * p) / tot; out[i0 + q] = [t, t + d]; t += d; });
    }
    if (i1 < n) out[i1] = [gehoert[j1].anfang, gehoert[j1].ende];
    i0 = i1 + 1; j0 = j1 + 1;
  }
  return out;
}

// Die Wörter jedes Satzes, danach, wie viele Wörter das Gesagte hat.
const wl = [], fs = [];
let k = 0;
saetze.forEach((f, i) => {
  const gesagteWoerter = woerterVon(gesprocheneTexte[i]), geschrieben = woerterVon(f.text), gehoert = ws.slice(k, k + gesagteWoerter.length);
  k += gesagteWoerter.length;
  if (!gehoert.length) fehler(`Satz ${i + 1} kommt in der Stimme nicht vor: mach die Stimme neu mit --neu.`);
  const a = gehoert[0].anfang - kuerzen, b = gehoert[gehoert.length - 1].ende - kuerzen;
  const zeiten = ausrichten(geschrieben, gehoert).map(([x, y]) => [x - kuerzen, y - kuerzen]);
  geschrieben.forEach((w, j) => wl.push({ text: w, anfang: r3(zeiten[j][0]), ende: r3(zeiten[j][1]), satz: i + 1, schluessel: !!f.schluessel && schluessel(w) === schluessel(f.schluessel) }));
  fs.push({ n: i + 1, text: f.text, schluessel: f.schluessel || null, anfang: r3(a), ende: r3(b) });
});
if (k !== ws.length) console.log(`  Warnung: die Stimme hat ${ws.length} Wörter und die Sätze ${k}; wenn etwas nicht aufgeht, prüf «gesprochen» in skript.json.`);
for (const f of fs) if (f.schluessel && !wl.some((w) => w.satz === f.n && w.schluessel)) console.log(`  Warnung: das Schlüsselwort «${f.schluessel}» steht nicht in Satz ${f.n}.`);
schreibeJson(join(dir, "stimme", "zeiten.json"), { signatur, dauer: total, saetze: fs, woerter: wl });

console.log(`Stimme: ${join(dir, "stimme", "stimme.wav")} (${total.toFixed(2)} s, ${fs.length} Sätze, ${wl.length} Wörter)`);
for (const f of fs) {
  const ps = wl.filter((w) => w.satz === f.n);
  console.log(`${String(f.n).padStart(2)} ${f.anfang.toFixed(2).padStart(6)}–${f.ende.toFixed(2).padEnd(6)} ${ps.map((w) => `${w.text}@${w.anfang.toFixed(2)}`).join(" ")}`);
}
// Die seltsamen Dinge, damit du sie dir ansiehst (es wird nicht durch Schneiden der Stimme behoben: Der Satz wird geändert und neu gemacht).
for (let i = 1; i < wl.length; i++) {
  const luecke = wl[i].anfang - wl[i - 1].ende;
  if (luecke > 1.1) console.log(`  Warnung: ${luecke.toFixed(1)} s Stille zwischen «${wl[i - 1].text}» und «${wl[i].text}».`);
}
