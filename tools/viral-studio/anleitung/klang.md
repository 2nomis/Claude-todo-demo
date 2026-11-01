# Der Klang

Einen Effekt gibt es nur, weil etwas im Bild genau das tut, in genau diesem Bild, und er dauert so lange wie das. Richtig
gemacht, wirkt das Video lebendig; falsch gemacht oder mit langen Lücken, wirkt es seltsam. Weder du noch irgendeine KI
kann hören: Deshalb werden nur die Klänge aus `klaenge/` benutzt, die der Creator schon in seinen eigenen Videos gehört
hat, und sie werden nach dem gesetzt, was zu sehen ist, mit diesen Regeln.

## Welcher Klang wofür

| Was zu sehen ist | Der Klang | Beispiel |
|---|---|---|
| Die Kamera bewegt sich schnell, etwas fliegt nah vorbei oder kommt herein | `wusch`, weich (langsamer, `tempo` 0.5-0.8, wenn die Bewegung lang ist) | die Kamera zieht zurück; die Erde kommt herein |
| Etwas schießt los, fällt in sich zusammen oder quetscht sich und endet abrupt | `stoss` (der lauteste Teil am Ende der Bewegung) | die Kamera schießt los; der Stern schrumpft |
| Etwas platzt oder stirbt mit einem Blitz | `explosion` (tief mit `lp` 1400; wenn seine Einstellung geschnitten wird, `schneidet`) | der Tod des Sterns; das Stück, das aufplatzt |
| Etwas aus Stein zerbricht | `fels` (tiefer und lauter, wenn es größer ist) | die Planeten, die zerbrechen |
| Etwas schlägt ein | `dumpf`; der größte, `dumpf-tief` | jeder Fels, der auf die kleine Kugel fällt |
| Etwas erscheint, wird markiert oder bleibt an seinem Platz stehen | `klick` | der Umriss der Sonne; die Erde hält an; die Markierung «280 Lichtjahre entfernt» |
| Eine Zahl, die hochzählt | `tick`, einer pro Viertel ihres Wegs | die Temperatur jedes Sterns |
| Etwas, das klappert (Salz, lose Teile) | `tick` bei jedem Schütteln, gedämpft (`lp` 6000) | der Salzstreuer |
| Etwas, das steigt oder nach oben geht | `anstieg` | die Strahlen in allen Farben |
| Das Hauptding pulsiert | immer derselbe (`schlag`): Er ist seine Signatur | der grüne, jedes Mal, wenn er pulsiert |
| Etwas geht in der Zeit zurück oder wird eingesaugt | der Klang rückwärts (`umgekehrt: true`); eine rückwärts gespielte Explosion ist ein tiefer Anstieg | das Zurückspulen bis zu seiner Geburt |
| Ein bestimmtes Material | `metall`, `holz`, `glas`, `wand`, `papier`, `ball`, `barren`, `rahmen`, `hohl`... (`klaenge/LIESMICH.md`) | |

## Die Regeln

- **Über das ganze Video, ohne Lücken:** nie mehr als etwa 2 s ohne irgendeinen Effekt. Ein Video mit vielen Effekten
  in einem Teil und keinem während 15 s wirkt seltsam. Wenn es eine Lücke gibt, sieh dir an, was sich dort bewegt, und
  gib ihm seinen Klang.
- **Nichts auf einem Schnitt,** auch nicht auf der Nummer eines Schritts oder auf einem Titel: Der Schnitt macht kein
  Geräusch. Der Klang gehört zu dem, was sich bewegt (wenn genau auf dem Schnitt etwas hereinkommt, auf seine Bewegung,
  etwas später).
- **Jeder so lange, wie sein Ding dauert:** Ein Aufprall ist kurz; eine lange Bewegung bekommt ein langsameres Wusch.
  Wenn die Einstellung geschnitten wird, blendet ihr Klang mit ihr aus (`schneidet`).
- **Unter der Stimme,** immer. Der Pegel (`db`) ist relativ zur Stimme, die um ihn herum läuft: -7 für die lauten (eine
  Explosion, der Stoß des Hooks), -10/-12 für die normalen, -14/-17 für die kleinen (Ticks, kleine Schläge, ein Wusch
  im Hintergrund).
- **Viele Aufpralle hintereinander:** nicht einer für jedes einzelne Ding. Die sichtbarsten, nie zwei innerhalb von
  0,1 s, mit leicht wechselnder Tonhöhe (`tempo`) und Pegel.
- **Die Momente kommen aus den Einstellungen,** die sie exportieren (`aufpraelle`, `ausbrueche`, `schuetteln`...), und
  aus `v.t()`. Sekunden werden nie von Hand abgeschrieben: Wenn sich das Bild ändert, folgt ihm der Klang.

## klaenge.js

```js
import { v } from "#stimme";
import { aufpraelle } from "./video/einstellungen/02-system.js";

const e = [];
const setze = (klang, t, o = {}) => e.push({ klang, t, ...o });

setze("wusch", 0, { anker: "anfang", db: -11, tempo: 0.8, was: "die Kamera zieht zurück" });
setze("klick", v.t("erde") - 0.02, { db: -14, was: "die Erde hält an" });
for (const c of aufpraelle) setze(c.gross ? "dumpf-tief" : "dumpf", c.t, { db: c.gross ? -8 : -15 });

export default e;
```

Jeder Effekt:
- `t`: die Sekunde, in der der lauteste Teil des Klangs spielt.
- `anker: "anfang"`: `t` ist, wann er beginnt.
- `db`: der Pegel relativ zur Stimme.
- `tempo`: über 1 höher und kürzer; unter 1 tiefer und länger.
- `lp`: entfernt die Höhen über so vielen Hz.
- `umgekehrt`: rückwärts abgespielt.
- `schneidet`: die Sekunde, in der er ganz ausblendet.
- `was`: was er tut (es erscheint im Bericht).

`node motor/klang.mjs <projekt>` macht die Spur und listet die Lücken auf und was auf einen Schnitt fällt. `render.mjs`
mischt sie mit der Stimme, in derselben Lautstärke wie die freigegebenen Videos.
