// node projekte/<projekt>/ki-label.mjs <projekt> -> <projekt>/overlays/ki-generiert.png (klein oben rechts, über das ganze Video)
import fs from "node:fs";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
const P = process.argv[2];
GlobalFonts.registerFromPath(new URL("../../schriften/Figtree-Bold.ttf", import.meta.url).pathname, "FigtreeB");
const c = createCanvas(1080, 1920), g = c.getContext("2d");
g.font = "34px FigtreeB"; g.textAlign = "right"; g.textBaseline = "middle";
const t = "KI-generiert", w = g.measureText(t).width, x = 1080 - 36, y = 84;
g.beginPath(); g.roundRect(x - w - 22, y - 26, w + 44, 52, 26); g.fillStyle = "rgba(0,0,0,0.45)"; g.fill();
g.fillStyle = "rgba(255,255,255,0.95)"; g.fillText(t, x, y + 1);
fs.mkdirSync(`${P}/overlays`, { recursive: true });
fs.writeFileSync(`${P}/overlays/ki-generiert.png`, c.toBuffer("image/png"));
