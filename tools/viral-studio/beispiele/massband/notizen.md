# Why your tape measure hook is loose: wie es gemacht wurde

- Eine englische Fassung, eins zu eins, des spanischen Reels, das der Creator mitgebracht hat (Video-35122.mp4, 30 s):
  dasselbe Skript übersetzt (einschließlich des Abschlusses «Send this to that friend…») und dieselben Szenen: der
  Haken ganz nah mit einem goldenen Ring, das ganze Maßband, der rote Haken («broken»), das durchsichtige Profil mit der
  goldenen Lücke, das Brett und das Ziehen, die Wand und das Drücken, die türkise Null, die sich nicht bewegt, die
  Zange, die falsche Messung in Rot, der türkise Ring der 0 und das Handy, das es teilt. Stimme nPczCjzI2devNBz1zQrb mit
  1.12: 35 s.
- Alles ist echtes 3D in `welt.js`: Das L des Hakens ist ein extrudiertes Profil mit seiner abgerundeten Biegung, die
  Nieten bewegen sich mit dem Band und die Langlöcher mit dem Haken (man sieht sie gleiten), Band, Gehäuse, Brett und
  Wand mit perspektivisch gesetzten Texturen. Die Null des Bands ist immer bei x = tx: Deshalb bewegt sich die türkise
  Linie nicht, wenn es von der Wand zum Brett geht.
- Verbesserungen gegenüber dem Original: Der Haken klappert ab Bild 0, und das Ende geht zurück in den Bildschirm des
  Handys bis zum Bildausschnitt des Anfangs, damit das Video in einer Schleife läuft.
- Behoben: Ein Bogen von genau 2π wurde nicht gezeichnet (Ring), die Wand bedeckte den ganzen Hintergrund (jetzt ist sie
  ein Block), die Texturen der Kisten wurden nicht gestreckt und blieben leer.
- Feinschliff (der Creator bat um «einen saubereren Look»): gebürstetes Metall perspektivisch gesetzt statt der
  Fleckentextur, Langlöcher und Loch mit Tiefe, Nieten mit klarerem Glanz, weichgezeichnete Kontaktschatten (Platte auf
  dem Band, Lippe auf dem Hirnholz, Band auf dem Brett), Holz mit gerader Maserung und Hirnholz mit Ringen, glatter
  Beton mit Poren, Lichtränder an den Kanten, ein saubererer Hintergrund, Vignette und feines Korn in jedem Bild, ein
  dünnerer Pfeil, eine Zange mit Volumen und ein Handy mit poliertem Rand, Knöpfen und Spiegelung.
- Zweiter «Premium»-Durchgang (der Creator bat um weichere Bewegungen und realistischeres Metall): Die Kamera geht ohne
  zu bremsen durch ihre Stützpunkte (eine monotone Kurve pro Wert) und steht beim Warten nicht mehr still; der Haken
  spiegelt ein Studio (Softbox, Seitenstreifen, Fülllicht), für jede Fläche auf einem Raster berechnet und
  perspektivisch gesetzt, sodass der Glanz über das Metall wandert, wenn sich die Kamera bewegt; das Rot ist lackierte
  Farbe; Nieten mit einem Lichtpunkt; ein weiches Bloom auf den hellsten Teilen. Vorschau mit 24 fps.
