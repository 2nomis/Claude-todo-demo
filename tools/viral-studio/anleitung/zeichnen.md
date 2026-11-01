# Wie gezeichnet wird

Alles wird in Code gezeichnet, auf einer Leinwand von 1080 × 1920, Bild für Bild. Kein Filmmaterial und keine
Vorlagen: Die Welt jedes Videos wird für dieses Video gebaut. Sieh dir zuerst `anleitung/muster.jpg` an (was das Kit
schon zeichnet) und die Einstellungen der Beispiele (`beispiele/gruener-stern/video/` und `beispiele/alkohol/video/`).

## Wie ein Video aufgebaut ist

```
video/welt.js                   was die Einstellungen teilen: dasselbe Objekt, derselbe Himmel, deine eigenen Zeichnungen (ein Salzstreuer)
video/einstellungen/01-himmel.js eine Datei pro Einstellung; sie werden danach sortiert, wann sie beginnen
video/einstellungen/02-...js
video/eroeffnungen/01-...js     die andere Eröffnung des Hooks, mit der Nummer der Einstellung, die sie ersetzt (METHODE, Schritt 5)
klaenge.js                      die Effekte (anleitung/klang.md)
```

Eine Einstellung exportiert:
- `von`: wann sie beginnt.
  - Ein Wort: `"dasselbe"`, `"sonne#2"` (die zweite «sonne» in der Stimme).
  - Eine Zahl in Sekunden.
  - Eine Funktion `(v) => sekunden`.

  Das Bild kommt zwei Bilder vor dem Wort. Die erste beginnt bei 0. Jede Einstellung dauert, bis die nächste beginnt.
- `uebergang`: wie man von der vorigen hineinkommt.
  - `"schnitt"`, das Übliche: ein anderer Ort.
  - `"weiter"`: derselbe Ort mit derselben Kamera, nur der Ordnung halber auf zwei Dateien aufgeteilt; man sieht nichts.
  - `"blende"`: selten.
- `zeichne(g, t)`: zeichnet das Bild in Sekunde `t` des Videos (nicht der Einstellung) auf die Leinwand `g`. Der Motor
  leert sie vorher (schwarz, ohne Transparenz oder Schatten) und legt die Untertitel darüber: Zeichne sie nicht selbst.
- Was der Klang braucht, exportiert: `export const aufpraelle = [...]` mit der Sekunde jedes Aufpralls. `klaenge.js`
  importiert es, und so folgt der Klang dem Bild, auch wenn es sich ändert.

```js
import * as k from "#kit";
import { v } from "#stimme";
import { himmel } from "../welt.js";

export const von = "luft";
const Tnatrium = v.satz(8).t("natrium");   // ein Wort innerhalb seines Satzes: sicherer, als über die ganze Stimme zu zählen

export function zeichne(g, t) {
  const cam = k.blicktAuf([0, 0, 30], [0, 0, 0]);
  k.hintergrund(g, cam);
  k.sterne(g, cam, null, himmel);
  const leuchtetAuf = k.sanft(k.rampe(t, Tnatrium - 0.12, Tnatrium + 0.25));
  k.leuchten(g, 540, 1000, 300, "natrium", leuchtetAuf);
}
```

**Regeln, die nie gebrochen werden:**
- **Alles kommt aus `t`:** Nichts wird von einem Bild zum nächsten aufbewahrt. Jedes Bild lässt sich für sich zeichnen,
  weil das Rendern Stücke des Videos gleichzeitig zeichnet.
- **Zufall, immer mit Saat:** `k.zufall(saat)`. Nie `Math.random`.
- **Das Schwere, einmal,** oben in der Datei: Texturen, Listen von Sternen, Felsen oder Körnern. Jedes Bild muss in
  unter 0,1 s gezeichnet sein (die des Beispiels zwischen 30 und 50 ms).
- **Das Timing der Stimme:** `v.t("wort")`, `v.t("wort", 2)`, `v.ende("wort")` und `v.satz(n)` (mit seinem `anfang`,
  `ende`, `woerter` und `t()`).
  Wörter werden ohne Akzente und Satzzeichen gesucht: «Was?» ist `"was"`.

## Der Bildschirm

- **Der Untertitel steht oben,** zwischen y 318 und 482. Dort kommt nichts Wichtiges hin. Wenn dahinter etwas sehr
  Helles ist, leg einen weichen dunklen Schleier darüber (wie im Hook des Beispiels, wenn die Oberfläche den
  Bildschirm füllt).
- **Was Instagram verdeckt:** über y 270, unter y 1440 und die Spalte mit den Knöpfen (x > 950 ab y 1050). Das
  Wichtige, innerhalb.
- **Groß:** Das Hauptding füllt den halben Bildschirm oder mehr. Nie etwas Kleines mitten auf einem leeren Hintergrund.

## Die Kamera und die Welt

Die Welt ist 3D, auch wenn sie in 2D gezeichnet wird: Jedes Ding hat einen Ort `[x, y, z]` und die Kamera projiziert es.

- `k.blicktAuf(position, ziel)`: eine Kamera bei `position`, die auf `ziel` schaut.
- `k.projiziere(cam, X)` → `{ x, y, z }` auf dem Bildschirm (oder `null`, wenn es dahinter liegt). Etwas mit Radius `s`
  wird `k.F * s / z` Pixel groß.
- `k.route([[t, { pos, blicktAuf }], ...])`: eine Kamera, die ohne Ruckeln durch diese Stützpunkte geht (auf den
  Wörtern).
- `k.umlaufbahn(winkel, entfernung, hoehe)`: ein Punkt um die Mitte, um etwas zu umkreisen.
- **Um ohne Schnitt von einer Kamera zur anderen zu gehen,** misch sie:
  `pos = k.mischV(A.pos, B.pos, k.sanft(k.rampe(t, t0, t1)))`, und dasselbe mit `blicktAuf` (so läuft die Einstellung
  `02-system.js` des Beispiels: von vorne → umkreisen → hinter einem Felsen hinabsinken).
- **Spuren:** Gib `k.sterne` die Kamera des vorigen Bildes (`cam(t - 1/60)`).
- **Von fern nach nah:** Sammle, was gezeichnet wird, in `[{ z, zeichne() }]` und `k.vonFernNachNah(dinge)`.
- **Etwas, das an einem Ding in der Welt hängt, aber auf den Bildschirm gezeichnet wird** (ein Umriss, eine Zahl, eine
  halbe Sonne, die sich hineinquetscht): Benutze seine projizierte Position.

**Die Kamera bewegt sich nur, wenn die Stimme es verlangt:**
- sie fährt heran, um zu sehen, was genannt wird;
- sie zieht zurück, um das Ganze zu sehen;
- sie dreht sich, um zu zeigen, was dahinter ist;
- sie geht mit dem nach unten, was fällt.

Sie treibt nie von selbst, wackelt nie und zoomt nie ohne Grund.

## Das Timing der Bewegung

- `k.rampe(t, a, b)`: von 0 bis 1 zwischen a und b. `k.sanft(u)`: beginnt und endet ohne Ruckeln. `k.kommtRein(u)`:
  kommt schnell und bremst lange (was hereinkommt). `k.geht(u)`: beginnt langsam und geht schnell (was sich entfernt).
  `k.puls(t, t0, breite)`: ein Schlag. `k.stuetzpunkte([[t, wert], ...])`: geht durch mehrere Werte, ohne dazwischen
  anzuhalten.
- **Jede Bewegung beginnt und endet auf einem Wort und dauert so lange wie ihr Satz.** Ein Aufprall oder eine Zahl,
  schnell und auf ihrem Wort; was gebaut wird, während es erklärt wird, die ganze Erklärung.
- **Das große Ding tut während des ganzen Satzes etwas,** nicht nur bei seinem Wort: Es dreht sich, brodelt, fällt,
  wächst oder erlischt. Ein Bild, das erscheint und still bleibt, ist eine Folie.
- **Was die Stimme nennt, kommt und bleibt:** mindestens eine halbe Sekunde, ganz und fast ruhig. In einer schnellen
  Aufzählung kommt jedes Ding und summiert sich zu den vorigen.
- **Vor einem Schnitt ist alles fertig:** Kein Schein, kein Puls und kein Fallen überquert den Schnitt, und das Bild
  ruht einen Moment.

## Licht und Volumen: was verhindert, dass es wie ein Diagramm aussieht

- **Ein Hintergrund mit Tiefe,** nie eine flache Farbe.
  - Im Weltraum: `k.hintergrund` + `k.sterne`.
  - Anderswo: ein Verlauf, eine weiche Textur und der Schein des Lichts, das ihn beleuchtet (die dunkle Küche mit der
    Spiegelung der Flamme).
- **Jedes Objekt hat:**
  - einen Verlauf danach, woher das Licht kommt;
  - eine Textur darauf (`k.netz` oder `k.flecken`, mit `"multiply"` zum Abdunkeln und `"screen"` zum Aufhellen);
  - seine Schattenseite;
  - seinen Schein oder seinen Lichtrand.
- **Licht addiert sich:** `g.globalCompositeOperation = "lighter"` für Schein, Flammen, Strahlen und Blitze
  (`k.leuchten`, `k.blitz`, `k.strahl`).
- **Materialien im Kit:**
  - `k.glas`, `k.glanzpunkt` und `k.metal` für Gegenstände;
  - `k.fels`, mit `hitze`, um ihn rotglühend zu machen;
  - `k.oberflaeche` für einen riesigen Boden;
  - `k.kaustik` und `k.strahlen` für Wasser oder eine dichte Atmosphäre;
  - `k.ausbruch` und `k.flammenring` für Feuer.
- **Das Unsichtbare, in einer Farbe,** die für nichts anderes benutzt wird (Natrium, orange; was falsch ist, rot).
- **Transparenz:** Die Teile des Kits respektieren `g.globalAlpha`. Damit etwas Komplexes als Ganzes erscheint oder
  ausblendet, zeichne es auf eine eigene Leinwand und setz es mit Transparenz (`k.sternBlass`, oder
  `k.leinwand(1080, 1920)` und `g.drawImage`). Sonst wird jede Schicht für sich durchsichtig und es entsteht ein Geist
  mit einer anderen Textur.
- **Text im Bild,** nur was der Untertitel nicht sagt (eine Zahl, die hochzählt, eine Entfernung): `k.pille` oder
  `k.etikett`, groß und mindestens eine halbe Sekunde ruhig.

## Wenn das Kit nicht hat, was du brauchst

Das passiert fast jedes Mal: Jedes Thema hat seine eigenen Dinge. Sie werden gezeichnet wie der Salzstreuer des
Beispiels (`video/welt.js`) oder das Küchenfeuer (`03-kueche.js`):
1. **Die Form,** mit Pfaden (`beginPath`, `quadraticCurveTo`, `k.gerundet`) und ihren echten Proportionen. Such ein
   Foto, um zu wissen, wie es aussieht.
2. **Das Licht:** ein Verlauf auf der Lichtseite, der Schatten auf der anderen, eine starke Spiegelung.
3. **Die Textur,** damit es nicht flach ist.
4. **Sieh es dir in voller Größe an** (`node motor/ansehen.mjs <projekt> <sekunde>`), bevor du es bewegst. Wenn es wie
   ein Symbol, ein Emoji oder ein Spielzeug aussieht, zeichne es neu.

Wenn etwas in mehr als einer Einstellung vorkommt, kommt es einmal in `welt.js`: So ist es immer dasselbe Ding und in
derselben Größe. Wenn es für andere Videos nützlich ist, kann es ins Kit (`motor/kit/`), mit seinem Muster in
`motor/muster.mjs`.

Wenn das Thema eine echte Person, Marke oder ein echter Ort ist, ist ein echtes Foto (mit seiner Lizenz, notiert in
`notizen.md`), in die Welt gesetzt, besser als eine gezeichnete Puppe: `import { loadImage } from "@napi-rs/canvas"`
einmal oben in der Datei und `g.drawImage`.

## Ansehen, was du zeichnest

Was du dir nicht angesehen hast, ist nicht geprüft. Jedes Mal, wenn du etwas änderst:

```
node motor/ansehen.mjs <projekt> 12.4             ein großes Bild
node motor/ansehen.mjs <projekt> 9-11.5 --fps 10  ein Abschnitt
node motor/ansehen.mjs <projekt> satz 5           ein Satz, vom ersten bis zum letzten Wort
node motor/ansehen.mjs <projekt> wort natrium     um ein Wort herum, mit 30 fps
node motor/ansehen.mjs <projekt> schnitt 2        ein Einstellungswechsel, mit 30 fps
node motor/ansehen.mjs <projekt> einstellungen    Anfang, Mitte und Ende jeder Einstellung
```

Jeder dauert Sekunden und legt ein `.jpg` in `pruefen/` ab: Öffne es immer. Worauf du achten musst, steht in
`METHODE.md`, Schritt 7.
