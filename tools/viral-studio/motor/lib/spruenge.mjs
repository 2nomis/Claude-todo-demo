// Was sich von einem Bild zum nächsten ändert, gemessen an einem mp4: einzelne Sprünge (ein Bild, das sich viel mehr ändert als
// die drumherum) und wiederholte Bilder mitten in einer Bewegung (ein Ruckeln). Es ist keine Note: Es zeigt, wo man hinschauen soll.
import { execFileSync } from "node:child_process";

export function aenderungen(mp4, von = 0, bis = null) {
  const W = 90, H = 160, N = W * H;
  const args = ["-v", "error", ...(von ? ["-ss", String(von)] : []), "-i", mp4, ...(bis ? ["-t", String(bis - von)] : []), "-vf", `scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"];
  const raw = execFileSync("ffmpeg", args, { maxBuffer: 1 << 30 });
  const n = raw.length / N, d = [0];
  for (let k = 1; k < n; k++) { let s = 0; for (let i = 0; i < N; i++) s += Math.abs(raw[k * N + i] - raw[(k - 1) * N + i]); d.push(s / N); }
  return d;
}

// einzeln: [{ t, wechsel, ringsum, beimSchnitt }]; wiederholt: [t]. schnitte: die Sekunden, in denen eine Einstellung beginnt (dort wird ein Sprung erwartet).
export function spruenge(mp4, fps, schnitte = []) {
  const d = aenderungen(mp4), einzeln = [], wiederholt = [];
  for (let k = 2; k < d.length - 2; k++) {
    const v = [d[k - 2], d[k - 1], d[k + 1], d[k + 2]].sort((a, b) => a - b), med = (v[1] + v[2]) / 2, t = k / fps;
    if (d[k] > 4 && d[k] > 3 * med + 1) einzeln.push({ t, wechsel: d[k], ringsum: med, beimSchnitt: schnitte.some((c) => Math.abs(c - t) < 1.5 / fps) });
    if (d[k] < 0.05 && d[k - 1] > 1.5 && d[k + 1] > 1.5) wiederholt.push(t);
  }
  return { einzeln, wiederholt, proBild: d };
}
