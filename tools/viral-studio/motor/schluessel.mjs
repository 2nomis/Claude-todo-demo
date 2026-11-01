#!/usr/bin/env node
// schluessel.mjs: öffnet auf diesem Computer eine Seite, um den ElevenLabs-Schlüssel einzufügen. Es speichert ihn in .env.local und schließt sich. Der
// Schlüssel geht nie durch den Chat und verlässt nie den Computer.
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import { WURZEL } from "./lib/gemeinsam.mjs";

const ENV = join(WURZEL, ".env.local");
const webseite = (msg = "") => `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Dein Stimmen-Schlüssel · Viral Studio Folder</title><style>body{margin:0;background:#08090a;color:#f7f8f8;font:17px/1.55 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:560px;margin:0 auto;padding:56px 16px}.brand{display:flex;align-items:center;gap:10px;font-weight:600;font-size:15px;margin-bottom:40px}
.mark{width:22px;height:22px;border-radius:6px;background:linear-gradient(135deg,#7c5cff,#ff5ca8)}h1{font-size:32px;line-height:1.15;font-weight:500;letter-spacing:-.025em;margin:0 0 12px}
p{color:#8a8f98;margin:0 0 20px}code{font-family:ui-monospace,Menlo,monospace;color:#f7f8f8}
input{width:100%;font:16px ui-monospace,Menlo,monospace;padding:12px 14px;border:1px solid #232428;border-radius:12px;background:#111214;color:#f7f8f8;box-sizing:border-box}
input:focus{outline:none;border-color:#7c5cff}button{margin-top:14px;font:500 15px Inter,-apple-system,sans-serif;height:42px;padding:0 20px;border:0;border-radius:9999px;background:#e5e5e6;color:#08090a;cursor:pointer}
button:hover{opacity:.88}.ok{color:#5fe0a0}</style><main><div class="brand"><span class="mark"></span>Viral Studio Folder</div><h1>Dein ElevenLabs-Schlüssel</h1><p>Füg ihn hier ein, nicht im Chat. Er beginnt mit <code>sk_</code> und wird nur auf diesem Computer gespeichert.
Du findest ihn auf elevenlabs.io → dein Profil → API Keys.</p>
<form method="post"><input name="k" placeholder="sk_..." autocomplete="off" spellcheck="false" autofocus><button>Speichern</button></form><p>${msg}</p></main></html>`;

const srv = createServer((req, res) => {
  if (req.method !== "POST") { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(webseite()); }
  let b = "";
  req.on("data", (c) => (b += c));
  req.on("end", () => {
    const k = new URLSearchParams(b).get("k")?.trim() || "";
    if (!/^sk_[A-Za-z0-9]{20,}$/.test(k)) { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(webseite("Das sieht nicht wie der Schlüssel aus: Er beginnt mit sk_ und ist lang.")); }
    const vorher = existsSync(ENV) ? readFileSync(ENV, "utf8").split(/\r?\n/).filter((l) => l && !l.startsWith("ELEVENLABS_API_KEY=")) : [];
    writeFileSync(ENV, [...vorher, `ELEVENLABS_API_KEY=${k}`].join("\n") + "\n");
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(webseite('<span class="ok">Gespeichert. Du kannst diesen Tab schließen und zum Chat zurückgehen.</span>'));
    console.log("Schlüssel in .env.local gespeichert");
    setTimeout(() => process.exit(0), 300);
  });
});
srv.listen(0, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${srv.address().port}/`;
  console.log(`Schlüsselseite: ${url}`);
  const oeffnen = process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : process.platform === "darwin" ? ["open", [url]] : ["xdg-open", [url]];
  spawn(oeffnen[0], oeffnen[1], { detached: true, stdio: "ignore" }).unref();
});
setTimeout(() => { console.log("die Seite wurde ohne Schlüssel geschlossen (10 min)"); process.exit(1); }, 10 * 60 * 1000);
