// «(der erste Satz)»
// Was zu sehen ist, Satz für Satz, vom ersten bis zum letzten Wort (so wie es in plan.md steht).
import * as k from "#kit";
import { v } from "#stimme";

export const von = 0; // die erste Einstellung beginnt bei 0; die anderen beim Wort, das das Neue bringt ("wort" oder "wort#2")

export function zeichne(g, t) {
  // t: die Sekunde des Videos. Alles wird aus t berechnet (nichts wird von einem Bild zum nächsten aufbewahrt).
  // v.t("wort"): wann dieses Wort gesagt wird.
  g.fillStyle = "#03050a"; g.fillRect(0, 0, 1080, 1920);
}
