// =============================================================================
// palette.js — Farbhaltung, je Entwurf eine eigene
// =============================================================================
//
// Die Ausgangsfarben stehen unveraendert in `arten.js` und stammen aus dem
// Spiel. Sie sind NICHT knallig — ein Hecht ist #5c7a3a, ein Zander #8b8f6c.
// Was im Spiel bonbonhaft wirkt, kommt fast nie von den Koerperfarben,
// sondern von drei anderen Stellen:
//
//   * die AKZENTE (Flossen) stehen oft in reiner Signalfarbe daneben:
//     Barsch #e07b39 auf #4f7942, Clownfisch #ffffff auf #ff7a1f,
//     Kaiserfisch #5ad4ff auf #2a3b8f — drei Vollfarben ohne Vermittler,
//   * die Muster liegen als reines Schwarz mit Deckkraft darauf
//     ("rgba(0,0,0,0.22)"), also als Grau statt als Farbe,
//   * das Weiss im Auge (#f4f6f2) ist der hellste Punkt des ganzen Fisches
//     und zieht deshalb den Blick auf das kindlichste Bauteil.
//
// Jeder Entwurf beantwortet das anders. Deshalb steht hier je Entwurf eine
// eigene Umrechnung, und keiner davon "korrigiert" die Ausgangsfarbe — sie
// nehmen alle DIESELBE und stellen sie in ihren eigenen Zusammenhang.

// A — freundlich, aber abgestimmt: leicht entsaettigt, der Akzent bleibt.
function palA(art) {
  return {
    color: hueShift(art.color, 0, 0.92, 1.0),
    belly: hueShift(art.belly, 0, 0.82, 1.0),
    fin:   hueShift(art.fin, 0, 0.85, 0.98),
    akzent: art.akzent
  };
}
// B — Licht: alles Richtung Wasser gezogen, eng beieinander, ein Akzent.
function palB(art) {
  return {
    color: hueShift(art.color, -6, 0.92, 0.98),
    belly: hueShift(art.belly, -8, 0.72, 1.02),
    fin:   hueShift(art.fin, -6, 0.8, 0.95),
    akzent: hueShift(art.akzent, 0, 0.95, 1.0)
  };
}
// C — Papier: heller, matter, in Wertstufen gerastert. Papier hat keine
// satten Farben, es hat Farbtoene mit Kreide drin.
function papier(col, hoch) {
  const c = hueShift(col, 4, 0.62, 1.0 + hoch * 0.1);
  const [r, g, b] = hexToRgb(c);
  const q = v => Math.round(lerp(v, 246, 0.14 + hoch * 0.06) / 8) * 8;
  return `rgb(${q(r)},${q(g)},${q(b)})`;
}
function palC(art) {
  return { color: papier(art.color, 0), belly: papier(art.belly, 1),
           fin: papier(art.fin, -0.3), akzent: papier(art.akzent, 0.4) };
}
// D — gemalt: gebrochene Farben. Schatten kuehlen ins Violette ab, Lichter
// waermen ins Gelbliche auf, die Grundfarbe wird entsaettigt. Nie derselbe
// Ton zweimal — deshalb liefert diese Palette Funktionen, keine Werte.
function palD(art) {
  const grund = hueShift(art.color, 0, 0.82, 0.96);
  return {
    color: grund,
    belly: hueShift(art.belly, 8, 0.5, 1.02),
    fin: hueShift(art.fin, -4, 0.55, 1.0),
    akzent: hueShift(art.akzent, -4, 0.78, 0.98),
    // i = Index eines Pinselzugs. Der Ausschlag ist klein (±14 Grad), sonst
    // faellt der Fisch in Einzelfarben auseinander.
    zug: (i, hell) => hueShift(art.color, (prnd(i, 31) - 0.5) * 28 + (hell > 0 ? 12 : -16),
                               0.5 + prnd(i, 32) * 0.3, 1 + hell * (0.1 + prnd(i, 33) * 0.14)),
    schatten: hueShift(art.color, -26, 0.55, 0.62),
    licht: hueShift(art.color, 16, 0.42, 1.45)
  };
}
// E — Emblem: drei Werte, weit auseinander, EIN Akzent in voller Saettigung.
// Der Kontrast kommt aus Hell/Dunkel, nicht aus Bunt.
function palE(art) {
  const b = hueShift(art.color, 0, 0.55, 1.0);
  return {
    dunkel: hueShift(art.color, -8, 0.5, 0.52),
    mitte: b,
    hell: hueShift(art.belly, 4, 0.34, 1.12),
    akzent: hueShift(art.akzent, 0, 1.12, 1.0),
    fin: hueShift(art.fin, -6, 0.46, 0.78)
  };
}
