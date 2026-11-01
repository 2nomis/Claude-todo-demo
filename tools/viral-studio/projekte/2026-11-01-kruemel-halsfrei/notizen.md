# Krümel und das HalsFrei-Geschirr (Hook B, 3D-Clips extern)

Gewünscht am 2026-11-01.

- Stimme: ElevenLabs „Will“ (bIHbv24MWmeRgasZH58o, jung, locker), Stabilität 0.4, Tempo 1.05; 67,9 s, 22 Sätze. Vorher „Liam“ und „Callum“, auf Wunsch ersetzt. Wunschstimme „Albert“ (deutsch, verspielt) geht erst ab Creator-Tarif.
- Plan: 17 Clips statt 22; Satzpaare am selben Ort (4+5, 6+7, 9+10, 17+18, 19+20) laufen durch, Satz 4 allein wäre 1,4 s. Schnitte kurz vor dem ersten Wort des nächsten Satzes; prompts.md auf echte Längen umgestellt.
- Clips 1-4: Standbild + Kamerafahrt (Zoom/Schwenk mit Easing, ruhiges Ende), 30 fps, 1080x1920, je 0,3 s länger als im Plan. Clips 5-17 fehlen: Canva-Kontingent leer.
- Entwurf Clips 1-4 auf der Stimme: pruefen/entwurf-clips-1-4.mp4 (0-13,8 s), Schnitte bei 3,17 / 5,50 / 9,33 s, jeweils vor dem ersten Wort; noch ohne Untertitel, Overlays und Geräusche.
- Untertitel nach der Vorgabe aus prompts.md: mittig (y 1120), 2-4 Wörter, Figtree ExtraBold 100 px, weiß mit 5-px-Kontur, Ring/Riemchen/Polster/HalsFrei gelb; erzeugt mit untertitel.mjs -> untertitel.ass. In Clip 2 höher (y 860, untertitel-hoehen.json), sonst über Krümels Kopf. Entwurf: pruefen/entwurf-clips-1-4-ut.mp4.
- Overlays (overlays.json -> overlays.mjs -> overlays/*.mov, transparent): 🤨 neben Krümels Kopf ab „bequem“ (7,44-9,28 s), roter Pfeil aufs Riemchen ab „Riemchen“ (11,84-13,76 s); ploppen in 0,2 s auf, blenden vor dem Schnitt aus. Reihenfolge: Clips, Overlays, Untertitel.
