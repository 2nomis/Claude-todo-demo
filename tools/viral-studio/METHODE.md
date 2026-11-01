# Wie ein Video entsteht

Was aus diesem Ordner kommt: ein vertikales Reel, in dem eine Stimme etwas Überraschendes erzählt, und auf dem Bildschirm
siehst du, was sie sagt, gezeichnet und mit jedem Wort in Bewegung. Seine Länge ist die aus `vorlieben.md`:
- **zum Monetarisieren:** länger als 1 Minute (zwischen 61 und 90 s), weil das Creator Rewards Program von TikTok nur
  Videos über einer Minute bezahlt. Prüf, dass die fertige Stimme länger als 60 s dauert; wenn nicht, braucht die
  Geschichte noch einen Schritt, kein Füllmaterial;
- **um den Account wachsen zu lassen:** 30 bis 60 s.

Wenn `vorlieben.md` nichts dazu sagt, frag einmal und speichere die Antwort dort. Keine statischen Diagramme mit
Beschriftungen: das echte Ding, groß, mit Licht und Volumen, und es tut, was die Stimme sagt. Auffällig, schnell, leicht
zu verstehen und unterhaltsam für jemanden, der auf Instagram durch Videos scrollt.

Das Niveau ist das der zwei Beispiele, die mit diesen Schritten gemacht wurden:
- `beispiele/gruener-stern/`: etwas Unmögliches (ein grüner Stern) und seine Geschichte, in einer Welt, durch die die
  Kamera reist.
- `beispiele/alkohol/`: eine Frage («Warum kannst du dich nicht erinnern?»), ohne berühmtes Ding zum Zeigen: Jede Idee
  hat ihre eigene Szene, mit Dingen aus dem Alltag.

**Vor dem ersten Video eines Gesprächs** lies diese ganze Methode und außerdem `anleitung/skript.md`,
`anleitung/zeichnen.md` und `anleitung/klang.md`. Sieh dir `anleitung/muster.jpg` an (was das Kit schon zeichnen kann)
und die Beispiele:
- die `plan.md` und die `notizen.md` von beiden;
- die Einstellungen (`video/einstellungen/*.js`) desjenigen, das deinem Video am ähnlichsten ist;
- ihre Blätter (`node motor/ansehen.mjs beispiele/alkohol saetze`, `... einstellungen` und `... schnitt 2`), und sieh
  sie dir an.

Die Beispiele sind dazu da, das Niveau zu sehen und wie die Dinge gebaut sind. Ihre Bilder gehören zu ihrem Thema und
werden nicht in ein anderes kopiert: nicht der Stern, nicht der Lichtertunnel, nicht der Erinnerungsfilm.

Nimm dir alle Zeit, die du brauchst. Jedes Beispiel hat etwa zwei Stunden und viele Runden aus Ansehen und Verbessern
gekostet. Was sie gut macht, ist das Prüfen in Bewegung, nicht der erste Versuch.

## 1. Die Idee und die Fakten

1. `node motor/neu.mjs "<die Idee>"` legt den Ordner des Videos in `projekte/` an.
2. Recherchier das Thema im Netz und lies die eigentliche Quelle (die Studie, die Pressemitteilung, die offizielle
   Seite). Bleib nicht bei einer Zusammenfassung stehen.
3. Schreib in `idee.md` jeden Fakt mit seiner Quelle auf. Such nach fünf Dingen:
   - **Die Überraschung:** was unmöglich scheint oder dem widerspricht, was alle glauben (der Stern, der grün ist).
   - **Die Regel, die sie bricht:** warum es nicht passieren dürfte (Sterne sind rot, gelb, weiß oder blau).
   - **Der Mechanismus, Schritt für Schritt:** jede Ursache mit ihrer Wirkung, der Reihe nach (er ist gestorben → seine
     Planeten sind zerbrochen → sie sind auf ihn gefallen → sie hatten Natrium dabei → seine Luft ist so dicht, dass
     das Natrium das Orange schluckt → ohne Orange: grün).
   - **Die Zahlen,** mit etwas, das man spüren kann (4.000 °C, 280 Lichtjahre entfernt).
   - **Zwei oder drei Vergleiche mit Alltagsdingen:** so groß wie die Erde, so schwer wie die halbe Sonne, dasselbe
     Zeug, das in deinem Salzstreuer ist, so dicht wie Wasser. Das sind die Bilder, die am besten ankommen.
4. Was das Video sagt, in einem Satz. Alles, was diesem Satz nicht dient, fliegt raus.

## 2. Das Skript, fürs Auge geschrieben

Lies `anleitung/skript.md`. Das Wichtigste:
- **Der Hook:** zwei oder drei kurze Sätze, etwa 8-10 s.
  - Der erste sagt, worum es im Video geht, so wie die Leute es sagen würden: die Frage, die das Video beantwortet
    («Warum...?»), oder die Überraschung direkt ausgesprochen («Wusstest du, dass...?», «Dieser Stern ist grün, und es
    dürfte ihn nicht geben»), mit dem Namen des Dings. Nie eine Szene, die nur darauf anspielt, und keine nackte Zahl
    am Anfang. Wenn der Creator das Video mit einer Frage bestellt hat, ist diese Frage, so gesagt, wie der Zuschauer
    sie sagen würde, meistens der Hook.
  - Man sieht ihn ab Bild 0 in seinem spektakulärsten Moment.
  - Danach, wenn nötig, die Regel, die er bricht, gezeigt, und die Frage, die er offen lässt («Was ist also mit
    diesem passiert?»).
- **Der Hauptteil:** Jeder Satz ist etwas, das passiert, oder ein Vergleich mit einem Alltagsding. Wenn sich ein Satz
  nicht als Geschehen zeigen lässt, wird er umgeschrieben.
- **Das Bild wird gleichzeitig mit dem Satz gedacht,** nicht danach: Wenn du «eine Kugel so groß wie die Erde»
  schreibst, weißt du schon, dass die Erde daneben auftauchen wird.
- **Die Auflösung** dreht den Hook um («Er ist nicht von Geburt an grün: Er ist grün wegen dem, was er gefressen hat»).
- **Der Abschluss** ist der des Creators (`vorlieben.md`), Wort für Wort.
- **Ein Schlüsselwort pro Satz** (das, was im Untertitel hervorgehoben wird).
- **Was gezeigt wird, braucht seine Zeit:**
  - eine Aufzählung, mit höchstens drei oder vier Dingen;
  - ein Vergleich, der woanders spielt (die Küche), mit einem ganzen eigenen Satz (2 s oder mehr);
  - nichts, was die Stimme schneller sagt, als es sich zeigen lässt.
- `skript.json`: `saetze`, jeder mit `text`, `schluessel` und `hook: true` für die Sätze des Hooks. `gesprochen` nur,
  wenn er anders gelesen als gesagt wird («KI» → «ka i»).

## 3. Die Stimme

`node motor/stimme.mjs <projekt>`.
- Sie entsteht in einer einzigen Aufnahme, so wie ein Mensch spricht, und sie wird nie geschnitten, und ihre Pausen
  werden nie entfernt: Die Stimme nach den Zeiten zu kürzen, die der Anbieter liefert, frisst Stücke von Wörtern.
- Es gibt jeden Satz mit der Sekunde jedes Worts aus: Damit wird geplant.
- Wenn ein Satz seltsam klingt, langsam wird oder sich überschlägt, wird der Satz geändert (andere Wörter, andere
  Zeichensetzung) und die Stimme neu gemacht. Das Audio wird nie geschnitten oder beschleunigt.

## 4. Der Plan: die Orte, die Einstellungen und wie man von einer zur anderen kommt

Schreib `plan.md`, bevor du irgendetwas zeichnest (die der Beispiele sind das Vorbild).

- **Die Orte.** Einer für jedes Ding, über das die Stimme spricht. Solange die Stimme bei diesem Ding bleibt, reist die
  Kamera durch seinen Ort (der Himmel mit dem Stern; das System des toten Sterns); wenn sie zu einem anderen übergeht,
  ein anderer Ort (die Küche mit dem Salzstreuer). Ein Thema mit vielen Dingen (die Party, das Blut, die Neuronen, das
  volle Handy) hat viele Orte.
- **Eine Einstellung ist ein Ort mit einer Kamera.** Innerhalb einer Einstellung gibt es keine Schnitte: Die Kamera geht
  mit der Stimme von einem Ding zum nächsten. Der Tod des Sterns, die Erde daneben, die halbe Sonne, die Planeten, die
  zerbrechen, und der Fels, der aufplatzt, sind eine einzige Einstellung von 17 s.
- **Satz für Satz, eine Zeile:**
  - was vom ersten bis zum letzten Wort zu sehen ist (was das große Ding die ganze Zeit tut, nicht nur bei seinem
    Wort);
  - das Wort, bei dem das Größte passiert;
  - wohin die Kamera geht;
  - wie es zur nächsten geht: weiter, oder Schnitt bei «soundso».
- Wer nur «was zu sehen ist» liest, sollte das Video erzählen können.

**Was zu sehen ist.** Diese Regeln kommen von dem, was in den Tests dieses Ordners falsch aussah:
1. **Was der Satz sagt, ist das, was zu sehen ist:** die Dinge und die Handlungen, die er nennt. Er sagt «du hast
   getanzt»: Es wird getanzt; er sagt «du trinkst»: das Glas. Der Ort des Mechanismus (das Gehirn, die Neuronen) kommt,
   wenn die Stimme darüber spricht, nicht vorher.
2. **Neue Idee, neues Bild.** Wenn die Stimme zu einer anderen Idee übergeht, ändert sich, was zu sehen ist: Etwas Neues
   kommt, das Ding verwandelt sich oder es wird zu seinem Ort geschnitten. Dasselbe Bild über mehrere Ideen hinweg:
   nein.
3. **Jede Idee ist eine ganze, große Szene.** Nie ein Hintergrund mit kleinen Zeichnungen darauf (ein Gehirn mit Fotos,
   Symbolen oder Emojis).
4. **Jedes Bild versteht man, ohne etwas zu wissen.** Wenn man zum Verstehen etwas braucht, was das Video nicht sagt
   (dass der Hippocampus wie ein Seepferdchen geformt ist), ist es das falsche Bild: Zeig, was er tut, nicht wie sein
   Name aussieht.
5. **Mit Farbe:** leuchtende Farben und Licht. Nichts Graues oder Stumpfes; wenn das Ding grau ist (ein Brett), trägt
   das, was drumherum ist, die Farbe.

**Einstellungswechsel.** Diese Regeln kommen von dem, was in den Tests dieses Ordners falsch aussah:
1. **Wenn die Stimme beim selben Ding oder am selben Ort bleibt, schneide nicht: Beweg die Kamera.** Sie zieht zurück,
   fährt heran, dreht sich oder geht mit etwas, das fällt, nach unten. Ein Schnitt zwischen zwei Bildausschnitten
   desselben Orts wirkt wie ein seltsamer Sprung, «ohne Übergang». Wenn etwas aus einem Vergleich (die Erde neben der
   kleinen Kugel) nicht mehr gebraucht wird, verlässt es das Bild, während sich die Kamera bewegt.
2. **Schneide nur, um an einen anderen Ort zu gehen, bei dem Wort, das ihn bringt.** Das kann mitten im Satz sein (die
   Küche kommt bei «dasselbe»: «dasselbe Zeug, das in deinem Salzstreuer ist»).
   **Eine andere Zeit desselben Dings (seine Vergangenheit, wie es bei seiner Geburt war) ist kein anderer Ort: nicht
   schneiden.** Das Ding verändert sich vor der Kamera: Es geht zurück, dreht sich rückwärts, wechselt Farbe und Größe.
   Ein Schnitt vom grünen Stern zum gelben, der er einmal war, wirkt, als wäre aus dem Nichts ein anderer aufgetaucht
   («kaputt», «mitten im Satz»). Und wenn die Stimme keine Pause lässt (eine Frage und ihre Antwort direkt
   hintereinander), schneidet auch das Bild nicht.
3. **Vor einem Schnitt ist das, was gerade passierte, fertig, und das Bild ruht einen Moment** (etwa 0,15-0,3 s). Nichts
   wird mitten im Fallen, mitten im Aufplatzen, mitten beim Salzstreuen oder mit noch fahrender Kamera abgeschnitten:
   Das wirkt wie ein fehlerhafter Schnitt. Wenn die Handlung nicht hineinpasst, fang sie früher an, mach sie kürzer
   oder schneide bei einem späteren Wort.
4. **Eine neue Einstellung dauert mindestens 1,5 s, und ihre Handlung beginnt und endet in ihr.** Wenn die Stimme diese
   Zeit nicht gibt, kommt das Bild in die vorige Einstellung oder bekommt einen eigenen Satz.
5. **Was die Stimme nennt, ist mindestens eine halbe Sekunde ganz und fast ruhig zu sehen.** In einer schnellen
   Aufzählung («rot, gelb, weiß oder blau») kommt jedes Ding, bremst und bleibt; sie summieren sich und fliegen nicht
   vorbei.
6. **Das erste Bild jeder Einstellung zeigt schon, was sie ist** (in der Küche das brennende Feuer und der Salzstreuer,
   der hereinkommt).
7. **Was leuchtet, pulsiert oder fällt, überquert keinen Schnitt:** Es endet vorher.

## 5. Zuerst der Hook, und zeig ihn

Wir haben eine Sekunde, bevor jemand weiterscrollt. Deshalb wird der Hook durchdacht, bevor er gezeichnet wird, und es
werden zwei gemacht.

1. **Zwei Ideen für die erste Sekunde, jede in einer Zeile:** was von Bild 0 bis Sekunde 1 zu sehen ist. In dieser
   Sekunde passiert etwas Großes, das den Bildschirm füllt: Die Kamera reist schnell zwischen riesigen Dingen, etwas
   flutet, kracht, platzt auf oder wird enthüllt. Wenn in einer Zeile «ein Standbild», «eine Zahl, die hochzählt» oder
   «die Kamera fährt langsam heran» steht, ändere die Idee, bevor du sie zeichnest: Polier sie nicht.
   - **Wenn das Thema eine Frage ist, sieht man die Frage passieren, übertrieben.** So liefen die, die in den Tests
     freigegeben wurden: das Sonnensystem verlassen → du schießt von der Erde los, fliegst an Jupiter und Saturn vorbei
     und krachst gegen eine unsichtbare Wand; Abwaschen von Hand verbraucht mehr Wasser → der Bildschirm wird unter
     einem riesigen Wasserhahn geflutet; trinken und sich nicht erinnern → ein Tunnel aus Clublichtern und ein
     überlaufendes Glas.
   - **Wenn sich die Überraschung prüfen lässt, prüf sie sofort, als Handlung:** Die Streifen werden entfernt und die
     drei Kugeln haben dieselbe Farbe; das Quadrat hebt ab, fliegt neben das andere und sie sind gleich.
   - **Der Hook kann einen anderen Stil haben als der Rest:** ein anderer Ort, übertriebener, wenn er dann ins Video
     übergeht.
   - **Nichts, was flackert oder in Sprüngen die Farbe wechselt:** Das wirkt wie ein Fehler.
2. Mach `video/welt.js` (was die Einstellungen teilen) und die Einstellungen des Hooks (`video/einstellungen/01-...js`)
   mit der ersten Idee. Die zweite kommt in `video/eroeffnungen/`, mit der Nummer der Einstellung, die sie ersetzt
   (`video/eroeffnungen/01-tunnel.js` statt `video/einstellungen/01-party.js`). Wie, steht in `anleitung/zeichnen.md`.
3. Prüf sie (Schritt 7), bis sie auf dem Niveau des Hooks der Beispiele sind: groß, ab Bild 0 in Bewegung, das Ding in
   seinem besten Moment. Mit `--eroeffnung 01-tunnel` zeigt `ansehen.mjs` die zweite.
4. `node motor/render.mjs <projekt> --entwurf --bis <Ende des Hooks + 1 s>` macht `pruefen/entwurf.mp4`, und mit
   `--eroeffnung 01-tunnel` `pruefen/entwurf-01-tunnel.mp4`.
5. Zeig dem Creator beide Videos und das ganze Skript als Text, in einer einzigen kurzen Nachricht, und frag, welches.
   Das, das er wählt, bleibt in `video/einstellungen/` (das andere fliegt raus). Wenn ihn keins überzeugt, werden die
   Worte und das Bild dessen, was sie sagen, zusammen neu gemacht.

## 6. Den Rest zeichnen

Eine Einstellung nach der anderen. Jede wird gemacht, geprüft und verbessert, bevor die nächste beginnt. Wie man
zeichnet (das Kit, die Kamera, das Licht, die Materialien), steht in `anleitung/zeichnen.md`. Was nicht fehlen darf:
- **groß:** Das Ding füllt den halben Bildschirm oder mehr;
- **mit Licht und Volumen:** Glanzlichter, Schatten, Textur, Tiefe;
- **ständig in Bewegung,** immer wegen dem, was die Stimme sagt.

## 7. In Bewegung prüfen (das Wichtigste)

- **Jedes Mal, wenn du etwas änderst, sieh es dir an:**
  - `node motor/ansehen.mjs <projekt> satz 5`
  - `... wort natrium`
  - `... schnitt 2`
  - `... 24-27 --fps 10`
  Das dauert Sekunden. Öffne immer das Bild, das es dir gibt. Was du dir nicht angesehen hast, ist nicht geprüft.
- **Wenn jede Einstellung fertig ist und am Ende,** `node motor/pruefen.mjs <projekt>`. Sieh dir `pruefen/saetze.jpg`
  und `pruefen/schnitte.jpg` ganz an und lies seine Warnungen:
  - ein Schnitt, der kommt, während die vorige Einstellung sich noch bewegt;
  - zwei Einstellungen, die sich ähneln;
  - eine Einstellung, die zu kurz ist;
  - Sekunden, die fast still sind;
  - der Untertitel über weißem Hintergrund;
  - Lücken ohne Klang.
  Sie zeigen, wo man hinschauen soll, sie sind keine Note: Behebe, was du falsch siehst, nicht die Zahl.
- **Worauf du achten musst,** weil es schon schiefgegangen ist:
  - ein Material, das nicht aussieht wie das, was es ist (ein Stern mit der dunklen Textur sieht aus wie ein Fels);
  - etwas, das von einem Bild zum nächsten springt (wenn eine Bewegung beginnt oder endet, wenn die Einstellung
    wechselt);
  - etwas Wichtiges, das in seinem Moment vom Bildschirmrand abgeschnitten wird;
  - mehr als eine Sekunde am Stück, in der sich nichts ändert, außer der Pause nach der Pointe;
  - Spuren oder Strahlen, so lang, dass sie wie Laser aussehen;
  - etwas Großes, das den Untertitel verdeckt (y 318-482);
  - eine graue oder flache Szene, wie eine Wand;
  - etwas, das plötzlich mit einer anderen Textur auftaucht (zeichne es separat und lass es als Ganzes erscheinen);
  - ein Schein oder ein Puls, der noch an ist, wenn die Einstellung wechselt;
  - Text, der weniger als eine halbe Sekunde dauert oder sich auf einem Handy nicht lesen lässt.
- **Ein Durchgang als jemand, der weiterscrollt:** In welcher Sekunde würde ich gehen? Dort fehlt etwas, das zur Stimme
  passt.
- **Bevor du es ganz zeigst, überleg, was du ändern würdest, um es unterhaltsamer oder visueller zu machen, und mach
  es.** Diese vier Fragen haben in den Tests ein Video verbessert:
  - Führt das Ende zum Anfang zurück? Lass das letzte Bild ins erste übergehen, damit man es zweimal schauen kann, ohne
    es zu merken.
  - Gibt es in der Mitte ein zweites «Wow», genau dann, wenn die Leute anfangen zu gehen?
  - Sieht irgendein Teil aus wie eine Unterrichtsstunde (ein Ding in zwei Hälften mit Beschriftungen, ein Diagramm)?
    Lass stattdessen Dinge passieren.
  - Ist das, was gesagt wird, im Bild bewiesen? Es heißt «halt das Handy weiter weg»: Man sieht das Kleine neben dem
    Großen.

## 8. Der Klang

Wenn der Creator Effekte will (frag einmal und notier es in `vorlieben.md`): Lies `anleitung/klang.md`, schreib
`klaenge.js` und führ `node motor/klang.mjs <projekt>` aus.
- Jeder Klang liegt auf dem, was sich bewegt, in seinem Bild.
- Keine Lücken über 2 s und kein Klang auf einem Schnitt.
- Die Momente werden aus den Einstellungen selbst genommen (wann jeder Fels aufschlägt), nicht von Hand abgeschrieben.

## 9. Das Rendern und die Abgabe

0. Wenn das Video zum Monetarisieren gedacht ist, prüf, dass es länger als 60 s dauert.
1. `node motor/render.mjs <projekt>` legt das Video in `ausgabe/<projekt>/` ab, mit `titelbild.jpg` und `posttext.txt`
   (aus der `posttext.txt` des Projekts: zwei Zeilen für den Post, die erste packt).
2. Sieh dir mit `ansehen.mjs` die Sprünge an, die es meldet: Entweder sind sie ein Blitz oder ein gewollter Aufprall,
   oder sie werden behoben.
3. Sieh dir das Titelbild an.
4. An den Creator: das Video und eine oder zwei Zeilen. Nichts darüber, wie es innen gemacht ist.

In der `notizen.md` des Projekts, in ein paar Zeilen: was gemacht wurde, was verbessert wurde und warum.
