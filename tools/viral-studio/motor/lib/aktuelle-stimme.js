// Die Stimme des Videos, das gerade gemacht wird: wann jedes Wort gesagt wird. Der Motor füllt sie aus, bevor er das Video lädt, damit jede
// Projektdatei `import { v } from "#stimme"` machen und v.t("wort") oben in der Datei benutzen kann.
//
//   v.t("sonne")              wann das erste «sonne» der ganzen Stimme beginnt (in Sekunden des Videos)
//   v.t("sonne", 2)           das zweite; auch v.t("sonne#2")
//   v.ende("sonne")           wann es endet
//   v.satz(5)                 der fünfte Satz: { n, text, anfang, ende, schluessel, woerter }
//   v.satz(5).t("ist")        das erste «ist» dieses Satzes (sicherer, als über die ganze Stimme zu zählen)
//   v.dauer                   wie lange das Video dauert
// Wörter werden ohne Akzente, Großbuchstaben und Satzzeichen verglichen: «Was?» ist "was" und «Erde,» ist "erde".

export const schluessel = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

export const v = {
  dauer: 0,
  woerter: [],
  saetze: [],
  t(wort, n) { return suchen(this.woerter, wort, n, "die Stimme").anfang; },
  ende(wort, n) { return suchen(this.woerter, wort, n, "die Stimme").ende; },
  wort(wort, n) { return suchen(this.woerter, wort, n, "die Stimme"); },
  satz(n) {
    const f = this.saetze[n - 1];
    if (!f) throw new Error(`Es gibt keinen Satz ${n}: die Stimme hat ${this.saetze.length}.`);
    return f;
  },
};

function suchen(liste, wort, n, wo) {
  let p = String(wort), k = n ?? 1;
  const m = p.match(/^(.*)#(\d+)$/);
  if (m) { p = m[1]; k = Number(m[2]); }
  const c = schluessel(p);
  let gesehen = 0;
  for (const w of liste) if (schluessel(w.text) === c && ++gesehen === k) return w;
  const aehnliche = [...new Set(liste.map((w) => schluessel(w.text)).filter((x) => x.startsWith(c.slice(0, 3))))].slice(0, 8);
  throw new Error(`Ich finde «${wort}»${k > 1 ? ` Nummer ${k}` : ""} in ${wo} nicht (es kommt ${gesehen} Mal vor).` + (aehnliche.length ? ` Ähnlich: ${aehnliche.join(", ")}.` : ""));
}

// Der Motor füllt sie aus stimme/zeiten.json aus.
export function laden(angaben) {
  v.dauer = angaben.dauer;
  v.woerter = angaben.woerter;
  v.saetze = angaben.saetze.map((f) => {
    const woerter = angaben.woerter.filter((w) => w.satz === f.n);
    return {
      ...f,
      woerter,
      t: (p, n) => suchen(woerter, p, n, `Satz ${f.n}`).anfang,
      endeVon: (p, n) => suchen(woerter, p, n, `Satz ${f.n}`).ende,
    };
  });
}
