// node projekte/<projekt>/overlays.mjs <projekt>  -> <projekt>/overlays/NN.mov (transparent) + overlays/liste.txt
// Liest <projekt>/overlays.json: Emojis und rote Pfeile, die in 0,2 s aufploppen und kurz vor "bis" ausblenden.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
const P = process.argv[2], F = 30, W = 1080, H = 1920;
GlobalFonts.registerFromPath("/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf", "Emoji");
const liste = JSON.parse(fs.readFileSync(`${P}/overlays.json`));
const backOut = (u) => { const s = 2.2; u -= 1; return u * u * ((s + 1) * u + s) + 1; };
const clip = (v) => Math.max(0, Math.min(1, v));
fs.mkdirSync(`${P}/overlays`, { recursive: true });
const tmp = fs.mkdtempSync("/tmp/claude-0/-home-user-Claude-todo-demo/0224d91f-daec-557f-8089-2fb16eee4311/scratchpad/ov-");
let txt = "";
liste.forEach((o, n) => {
  const N = Math.round((o.bis - o.von) * F), dir = `${tmp}/${n}`;
  fs.mkdirSync(dir);
  for (let f = 0; f < N; f++) {
    const t = f / F, c = createCanvas(W, H), g = c.getContext("2d");
    const s = backOut(clip(t / 0.2)), a = clip(t / 0.08) * clip((o.bis - o.von - t) / 0.12);
    g.globalAlpha = a;
    if (o.typ === "emoji") {
      g.translate(o.x, o.y); g.scale(s, s);
      g.font = `${o.groesse}px Emoji`; g.textAlign = "center"; g.textBaseline = "middle";
      g.shadowColor = "rgba(0,0,0,0.35)"; g.shadowBlur = 18; g.shadowOffsetY = 6;
      g.fillText(o.zeichen, 0, 0);
    } else {
      const dx = o.x1 - o.x0, dy = o.y1 - o.y0, L = Math.hypot(dx, dy);
      g.translate(o.x1, o.y1); g.rotate(Math.atan2(dy, dx)); g.scale(s, s);
      const kopf = 90, breit = 34, path = () => {
        g.beginPath(); g.moveTo(0, 0); g.lineTo(-kopf, -kopf * 0.62); g.lineTo(-kopf, -breit / 2); g.lineTo(-L, -breit / 2);
        g.lineTo(-L, breit / 2); g.lineTo(-kopf, breit / 2); g.lineTo(-kopf, kopf * 0.62); g.closePath();
      };
      g.shadowColor = "rgba(0,0,0,0.4)"; g.shadowBlur = 16; g.shadowOffsetY = 5;
      path(); g.lineJoin = "round"; g.lineWidth = 12; g.strokeStyle = "#ffffff"; g.stroke();
      g.shadowColor = "transparent"; path(); g.fillStyle = "#ff2b2b"; g.fill();
    }
    fs.writeFileSync(`${dir}/${String(f).padStart(4, "0")}.png`, c.toBuffer("image/png"));
  }
  const out = `${P}/overlays/${String(n + 1).padStart(2, "0")}.mov`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(F), "-i", `${dir}/%04d.png`, "-c:v", "qtrle", out]);
  txt += `${out} ${o.von}\n`;
});
fs.writeFileSync(`${P}/overlays/liste.txt`, txt);
fs.rmSync(tmp, { recursive: true });
console.log(txt);
