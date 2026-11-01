#!/usr/bin/env node
// muster.mjs: zeichnet ein Blatt mit jedem Teil des Kits und seinem Namen (anleitung/muster.jpg), um zu sehen, was zur Hand ist.
import { createCanvas } from "@napi-rs/canvas";
import { join } from "node:path";
import * as k from "#kit";
import { WURZEL } from "./lib/gemeinsam.mjs";
import { speichereJpg } from "./lib/blaetter.mjs";
import "./lib/untertitel.mjs"; // registriert die Schrift

const L = 1080, T = 360, C = 3;
const proben = [
  ["stern(g, palette, x, y, rad, dreht, leuchten)", (g) => { k.hintergrund(g, k.blicktAuf([0, 0, 30], [0, 0, 0])); [["gruen", 260, 380], ["gelb", 640, 300], ["rot", 860, 640], ["blau", 300, 780], ["zwerg", 700, 800]].forEach(([p, x, y], i) => k.stern(g, p, x, y, 120 + 20 * (i % 2), i, 0.2)); }],
  ["planet(...) · erde(...)", (g) => { k.hintergrund(g, k.blicktAuf([0, 0, 30], [0, 0, 0])); k.planet(g, 330, 540, 230, 0.4, 1, -0.4); k.erde(g, 790, 560, 200, 0.2, -1, -0.15); }],
  ["fels(g, x, y, rad, ang, saat, lx, ly, hitze)", (g) => { k.hintergrund(g, k.blicktAuf([0, 0, 30], [0, 0, 0])); for (let i = 0; i < 6; i++) k.fels(g, 200 + (i % 3) * 340, 330 + Math.floor(i / 3) * 420, 130, i, i + 3, 1, -1, i === 5 ? 0.9 : i === 4 ? 0.4 : 0); }],
  ["leuchten(g, x, y, groesse, color, deck)", (g) => { g.fillStyle = "#03050a"; g.fillRect(0, 0, L, L); Object.keys(k.FARBEN).forEach((c, i) => k.leuchten(g, 160 + (i % 4) * 250, 260 + Math.floor(i / 4) * 330 + 80, 300, c, 1)); }],
  ["blitz(g, x, y, u) · u = 0.15 / 0.5", (g) => { g.fillStyle = "#03050a"; g.fillRect(0, 0, L, L); k.blitz(g, 300, 540, 0.15, 700); k.blitz(g, 780, 540, 0.5, 600); }],
  ["strahl(g, x, unten, oben, color, deck)", (g) => { g.fillStyle = "#06102a"; g.fillRect(0, 0, L, L); ["255,80,70", "255,150,40", "255,220,70", "130,255,100", "100,235,255", "130,150,255"].forEach((c, i) => k.strahl(g, 160 + i * 150, 980, 200 + (i % 2) * 260, c, 1, 52, i % 2 === 0)); }],
  ["ausbruch(g, x, y, u, color, massstab)", (g) => { k.hintergrund(g, k.blicktAuf([0, 0, 30], [0, 0, 0])); k.ausbruch(g, 300, 540, 0.12, "natrium", 0.45); k.ausbruch(g, 780, 540, 0.7, "feuer", 0.45, 3); }],
  ["flammenring(g, cx, cy, rx, ry, t, orange)", (g) => { g.fillStyle = "#0d0b0a"; g.fillRect(0, 0, L, L); for (const [cx, n] of [[300, 0], [790, 1]]) { k.flammenring(g, cx, 640, 200, 64, 1.3, n, false); g.fillStyle = "#1c1a18"; g.beginPath(); g.ellipse(cx, 640, 186, 56, 0, 0, 6.28); g.fill(); k.flammenring(g, cx, 640, 200, 64, 1.3, n, true); } }],
  ["oberflaeche(g, horizont, t)", (g) => { k.hintergrund(g, k.blicktAuf([0, 0, 30], [0, 0, 0])); k.oberflaeche(g, 520, 2.0); }],
  ["hintergrund · himmel · sterne (mit Spuren)", (g) => { const c = k.himmel(5, 2600, [0, 0, 0], 520, 30), cam = k.blicktAuf([0, 0, 60], [0, 0, 0]), vorher = k.blicktAuf([1.2, 0, 60], [0, 0, 0]); k.hintergrund(g, cam); k.sterne(g, cam, vorher, c); }],
  ["galaxie()", (g) => { g.fillStyle = "#03050a"; g.fillRect(0, 0, L, L); g.save(); g.translate(540, 540); g.scale(1, 0.62); g.rotate(-0.35); g.globalCompositeOperation = "lighter"; g.drawImage(k.galaxie(), -560, -560, 1120, 1120); g.restore(); }],
  ["pille(...) · etikett(...)", (g) => { g.fillStyle = "#101826"; g.fillRect(0, 0, L, L); k.pille(g, 540, 380, "5.500", "°C", "255,224,130", 1, 112); k.etikett(g, 330, 640, "280 Lichtjahre entfernt"); }],
  ["glas · glanzpunkt · metall (auf einem Pfad)", (g) => { g.fillStyle = "#0d0b0a"; g.fillRect(0, 0, L, L); k.gerundet(g, 380, 330, 320, 560, 46); g.fillStyle = "#d9dde4"; g.fill(); k.gerundet(g, 360, 300, 360, 620, 50); k.glas(g, 360, 720); k.glanzpunkt(g, 640, 340, 18, 500); g.beginPath(); g.moveTo(350, 300); g.lineTo(350, 240); g.quadraticCurveTo(540, 140, 730, 240); g.lineTo(730, 300); g.closePath(); k.metal(g, 350, 730); }],
  ["kaustik · strahlen (unter Wasser)", (g) => { const mg = g.createLinearGradient(0, 0, 0, L); mg.addColorStop(0, "#102260"); mg.addColorStop(1, "#5aa6e6"); g.fillStyle = mg; g.fillRect(0, 0, L, L); g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 0.35; k.gedreht(g, k.kaustik, 540, 540, 1700, 0.2); g.restore(); k.strahlen(g, 1, L, 1); }],
  ["sternBlass(..., deck) · deck = 0.4", (g) => { k.hintergrund(g, k.blicktAuf([0, 0, 30], [0, 0, 0])); k.stern(g, "blau", 400, 540, 230, 0, 0); k.sternBlass(g, "gruen", 680, 540, 230, 1, 0, 0.4); }],
];
const reihen = Math.ceil(proben.length / C), blatt = createCanvas(C * T + (C + 1) * 6, reihen * (T + 34) + 6), gh = blatt.getContext("2d");
gh.fillStyle = "#ffffff"; gh.fillRect(0, 0, blatt.width, blatt.height);
const tile = createCanvas(L, 1920), gt = tile.getContext("2d");
proben.forEach(([name, zeichne], i) => {
  gt.setTransform(1, 0, 0, 1, 0, 0); gt.globalAlpha = 1; gt.globalCompositeOperation = "source-over"; gt.clearRect(0, 0, L, 1920);
  zeichne(gt);
  const x = 6 + (i % C) * (T + 6), y = 6 + Math.floor(i / C) * (T + 34);
  gh.drawImage(tile, 0, 0, L, L, x, y, T, T);
  gh.fillStyle = "#111"; gh.font = "700 15px Figtree"; gh.textBaseline = "top"; gh.fillText(name, x + 2, y + T + 6);
});
console.log(speichereJpg(blatt, join(WURZEL, "anleitung", "muster.jpg")));
