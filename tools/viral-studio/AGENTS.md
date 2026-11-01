# Viral Studio Folder

Dieser Ordner macht gezeichnete Erklär-Reels, auf dem Computer von dem, der ihn öffnet, mit der KI, die ihn gerade
liest. Du gibst ihm eine Idee («Mach mir ein Video darüber, warum der Himmel blau ist») und heraus kommt das Video,
fertig zum Posten. Nichts wird von selbst gepostet.

Das Niveau ist das der Beispiele: `beispiele/gruener-stern/gruener-stern.mp4` und `beispiele/alkohol/alkohol.mp4`.

## Wenn der Ordner geöffnet wird

- **«Richte mich ein», «set me up» oder es ist das erste Mal:**
  1. `node motor/doctor.mjs`, und installier selbst, was fehlt (`npm install` in diesem Ordner, ffmpeg, Node).
  2. Wenn es keinen Stimmen-Schlüssel gibt, `node motor/schluessel.mjs`, das eine Seite zum Einfügen öffnet.
  3. Wenn es `vorlieben.md` nicht gibt, frag in einer einzigen Nachricht: in welcher Sprache und für wen seine Videos
     sind, wie er sie abschließen will (zum Beispiel «Schick das dem Freund, der...»), ob er Soundeffekte will und wie
     lang seine Videos sein sollen: länger als eine Minute (zum Monetarisieren: Das Creator Rewards Program von TikTok
     bezahlt nur Videos über 1 Minute, siehe `MONETARISIERUNG.html`) oder 30-60 Sekunden (nur um seine Accounts wachsen
     zu lassen). Speichere es in `vorlieben.md`, mit seinen Worten.
  4. Sag ihm in einer Zeile, dass er jetzt ein Video bestellen kann.
- **Jede Anfrage nach einem Video, einem Reel, einem Skript oder Ideen für Videos:** Lies `METHODE.md` ganz und folge ihr
  Schritt für Schritt. Lies die Anleitungen, die sie nennt (`anleitung/`), bevor du anfängst.
- **«Doctor» oder etwas geht kaputt:** `node motor/doctor.mjs` und behebe, was es sagt.

## Der Ordner

```
METHODE.md            wie ein Video entsteht, Schritt für Schritt (vor jedem Video ganz lesen)
MONETARISIERUNG.html  für den Creator: wie man mit den Videos Geld verdient (TikTok, YouTube, Marken)
anleitung/            das Skript, das Zeichnen und der Klang; muster.jpg, was das Kit schon zeichnen kann
motor/                die Werkzeuge (jedes erklärt mit --help, wie man es benutzt) und das Zeichen-Kit (motor/kit/)
klaenge/              die freigegebenen Effekte (klaenge/LIESMICH.md)
beispiele/            Videos, die mit dieser Methode gemacht wurden, komplett: um das Niveau zu sehen und wie sie gebaut sind
projekte/             ein Video pro Ordner
ausgabe/              die fertigen Videos, mit ihrem Titelbild und dem Text für den Post
vorlieben.md          was für alle seine Videos gilt, mit seinen Worten
.env.local            der Stimmen-Schlüssel; wird nie gezeigt oder geteilt
```

## Regeln

- Frag nie im Chat nach einem Schlüssel: `node motor/schluessel.mjs`.
- **Bitte den Creator nie, einen Befehl auszuführen:** Du hast ein Terminal auf seinem Computer.
  - Node, ffmpeg oder die Pakete von `npm install` zu installieren, ist deine Aufgabe.
  - Seine Sache ist nur, ein Passwort einzugeben oder eine Erlaubnis zu erteilen, die das System niemand anderem
    erteilen lässt.
  - Wenn etwas wegen des Rechners scheitert, behebe es, ohne die Qualität zu senken, und notier es in `rechner.md`.
- Keine Subagenten und keine parallelen Agenten, außer der Creator sagt ja, wenn du ihn fragst.
- Poste oder sende nie etwas in seinem Namen.
- Jedes Video entsteht aus diesem Ordner. Um das Niveau zu sehen und wie eins gebaut ist, benutze `beispiele/`. Kopier
  keine anderen Projekte aus `projekte/`, außer der Creator bittet dich, eins davon zu ändern.
- Deine Testskripte kommen in deinen temporären Ordner, nicht hierher: `motor/`, `anleitung/` und `beispiele/` werden
  beim Machen eines Videos nicht angefasst.
- Was der Creator für alle seine Videos will («ab jetzt», «ich will nie»), kommt in `vorlieben.md`, mit seinen Worten.
  Deine Schlüsse sind nicht seine Vorlieben. Speichere nicht in deinem Gedächtnis, wie die Videos gemacht werden: Es
  steht alles hier.
- Kurz und klar in allem, was du ihm schreibst. Ein Satz, wo zwei gestanden hätten.
- Das Innere gehört dir: Erzähl ihm nicht, welche Werkzeuge du benutzt, was du misst oder wie geprüft wird. Zeig ihm das
  Skript und das Video und frag ihn nur, was nur er entscheiden kann.
- Ein Video pro Gespräch: das nächste in einem neuen Gespräch.
