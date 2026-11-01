// Ein Stück des Renderns, in seinem eigenen Thread: zeichnet die Bilder von `erstes` bis `letztes` und speichert sie in ein mp4.
import { parentPort, workerData } from "node:worker_threads";
import { kodierer } from "./gemeinsam.mjs";
import { zeichneBild, vorbereiten } from "./bild.mjs";
import { oeffnen } from "./projekt.mjs";

const { dir, erstes, letztes, fps, ausgabe, qualitaet, eroeffnung } = workerData;
const proj = await oeffnen(dir, { eroeffnung }), zst = vorbereiten(proj), kod = kodierer(ausgabe, fps, qualitaet);
for (let f = erstes; f < letztes; f++) {
  const leinwand = zeichneBild(proj, zst, f / fps);
  await kod.schreibt(Buffer.from(leinwand.data())); // eine Kopie: Die Leinwand wird für das nächste Bild wiederverwendet
  if ((f - erstes) % 30 === 0) parentPort.postMessage({ erledigt: f - erstes });
}
await kod.schliesst();
parentPort.postMessage({ ende: true, erledigt: letztes - erstes });
