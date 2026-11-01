// Was die Werkzeuge teilen: der Ordner, die Argumente, die Fehler, ffmpeg und die Schlüssel.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const BREITE = 1080, HOEHE = 1920;

export function fehler(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

// node motor/x.mjs <projekt> [rest] [--schluessel wert] [--flag]
export function argumente() {
  const a = process.argv.slice(2), lose = [], opt = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith("--")) {
      const k = a[i].slice(2);
      if (i + 1 < a.length && !a[i + 1].startsWith("--")) opt[k] = a[++i];
      else opt[k] = true;
    } else lose.push(a[i]);
  }
  return { lose, opt };
}

export function hilfe(text) {
  if (process.argv.includes("--help")) { console.log(text.trim()); process.exit(0); }
}

// Das Projekt: ein Pfad oder der Name eines Ordners in projekte/ (oder der Anfang seines Namens).
export function projektOrdner(name) {
  if (!name) fehler("Das Projekt fehlt: der Ordner des Videos, zum Beispiel projekte/2026-10-20-blauer-himmel");
  for (const c of [resolve(name), join(WURZEL, "projekte", name), join(WURZEL, name)]) if (existsSync(join(c, "skript.json"))) return c;
  fehler(`Ich finde das Projekt «${name}» nicht (ein Ordner mit skript.json).`);
}

export const leseJson = (f) => JSON.parse(readFileSync(f, "utf8"));
export const schreibeJson = (f, d) => { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, JSON.stringify(d, null, 2) + "\n"); };
export const r3 = (x) => Math.round(x * 1000) / 1000;

export function ffmpeg(args, optionen = {}) {
  try {
    return execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { maxBuffer: 1 << 30, ...optionen });
  } catch (e) {
    fehler(`ffmpeg ist gescheitert: ${String(e.stderr || e.message).slice(-600)}`);
  }
}

export function dauer(datei) {
  const s = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", datei]).toString();
  return Number(s.trim());
}

// Audio zu Samples: mono, float, in der verlangten Rate.
export function leseAudio(datei, sr = 48000) {
  const b = execFileSync("ffmpeg", ["-v", "error", "-i", datei, "-f", "f32le", "-ac", "1", "-ar", String(sr), "-"], { maxBuffer: 1 << 30 });
  const ab = new ArrayBuffer(b.length);
  new Uint8Array(ab).set(b);
  return new Float32Array(ab);
}

// Ein 16-Bit-Mono-wav. (Mono mit Absicht: Wenn ffmpeg eine Stereodatei mit L = R als mono liest, kommen 3 dB dazu.)
export function schreibeWav(route, mono, sr = 48000) {
  const n = mono.length, buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mono[i])) * 32767), 44 + i * 2);
  mkdirSync(dirname(route), { recursive: true });
  writeFileSync(route, buf);
}

// Die Schlüssel liegen in .env.local (motor/schluessel.mjs schreibt sie). Sie werden nie gezeigt oder irgendwohin kopiert.
export function ladeSchluessel() {
  const f = join(WURZEL, ".env.local");
  if (!existsSync(f)) return;
  for (const l of readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// Ein ffmpeg-Prozess, der Bilder bekommt (RGBA, 1080 × 1920) und ein mp4 schreibt.
export function kodierer(ausgabe, fps, qualitaet = "final") {
  const crf = qualitaet === "final" ? "16" : "23", preset = qualitaet === "final" ? "medium" : "veryfast";
  const p = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", `${BREITE}x${HOEHE}`, "-r", String(fps), "-i", "-",
    "-c:v", "libx264", "-preset", preset, "-crf", crf, "-pix_fmt", "yuv420p", "-g", String(fps * 2), "-movflags", "+faststart", ausgabe], { stdio: ["pipe", "ignore", "pipe"] });
  let err = "";
  p.stderr.on("data", (d) => (err += d));
  const ende = new Promise((ok, falsch) => p.on("close", (c) => (c === 0 ? ok() : falsch(new Error("ffmpeg: " + err.slice(-500))))));
  return {
    async schreibt(buf) { if (!p.stdin.write(buf)) await new Promise((r) => p.stdin.once("drain", r)); },
    async schliesst() { p.stdin.end(); await ende; },
  };
}
