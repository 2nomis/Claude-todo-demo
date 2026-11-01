// node projekte/2026-11-01-kruemel-halsfrei/untertitel.mjs projekte/2026-11-01-kruemel-halsfrei  -> untertitel.ass (mittig, 2-4 Wörter, weiß fett, dünne schwarze Kontur, gelbe Wörter aus skript.gelb)
import fs from "node:fs";
const P = process.argv[2];
const z = JSON.parse(fs.readFileSync(`${P}/stimme/zeiten.json`));
const sk = JSON.parse(fs.readFileSync(`${P}/skript.json`));
const norm = (s) => s.replace(/[.,;:!?…–"„“']/g, "").toLowerCase();
const gelb = new Set((sk.gelb || []).map(norm));
// Höhe pro Zeitraum, wo der Untertitel sonst etwas Wichtiges verdeckt: [von, bis, y]
const HOEHEN = fs.existsSync(`${P}/untertitel-hoehen.json`) ? JSON.parse(fs.readFileSync(`${P}/untertitel-hoehen.json`)) : [];
const VOR = 0.08, MAXW = 4, MAXZ = 20;
const W = z.woerter.filter((w) => norm(w.text) !== "");
const bs = [];
const saetze = [...new Set(W.map((w) => w.satz))];
for (const s of saetze) {
  const ws = W.filter((w) => w.satz === s);
  // Phrasen an Satzzeichen
  const ph = [[]];
  ws.forEach((w, i) => { ph.at(-1).push(w); if (/[.?!:,–]$/.test(w.text) && i < ws.length - 1) ph.push([]); });
  // Phrasen mit 1 Wort an die Nachbarin hängen, wenn es zusammen höchstens 4 sind
  for (let i = 0; i < ph.length; i++) if (ph[i].length === 1 && ph.length > 1) {
    const j = i > 0 && ph[i - 1].length < MAXW ? i - 1 : (i + 1 < ph.length && ph[i + 1].length < MAXW ? i + 1 : -1);
    if (j >= 0) { ph[j] = j < i ? [...ph[j], ...ph[i]] : [...ph[i], ...ph[j]]; ph.splice(i, 1); i = -1; }
  }
  for (const p of ph) {
    const k = Math.ceil(p.length / MAXW), g = p.length / k;
    for (let j = 0; j < k; j++) bs.push({ satz: s, w: p.slice(Math.round(j * g), Math.round((j + 1) * g)) });
  }
}
// Einzelwort-Reste an den vorigen Block hängen, wenn es passt
const ts = (t) => { t = Math.max(0, t); const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60; return `${h}:${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`; };
const zeig = (t) => t.replace(/[.,;]$/, "").replace(/^…\s*/, "");
let out = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: U,Figtree ExtraBold,100,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,5,2,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
bs.forEach((b, i) => {
  const a = b.w[0].anfang - VOR, n = bs[i + 1];
  const e = n ? Math.min(n.w[0].anfang - VOR, b.w.at(-1).ende + 0.5) : Math.min(z.dauer, b.w.at(-1).ende + 0.8);
  const txt = b.w.map((w) => { const t = zeig(w.text); return gelb.has(norm(w.text)) ? `{\\c&H00D7FF&}${t}{\\c&HFFFFFF&}` : t; }).join(" ");
  out += `Dialogue: 0,${ts(a)},${ts(e)},U,,0,0,0,,{\\pos(540,${(HOEHEN.find(([v, b]) => a + 0.1 >= v && a + 0.1 < b) || [0, 0, 1120])[2]})\\fscx82\\fscy82\\t(0,120,\\fscx100\\fscy100)}${txt}\n`;
});
fs.writeFileSync(`${P}/untertitel.ass`, out);
console.log(bs.length, "Blöcke");
for (const b of bs.slice(0, 14)) console.log(b.w[0].anfang.toFixed(2), b.w.map((w) => w.text).join(" "));
