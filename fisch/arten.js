// =============================================================================
// arten.js — sieben Arten aus dem echten Spiel, hier anatomisch beschrieben
// =============================================================================
//
// Farben, Proportionen (`len`/`h`), Namen und Herkunft sind UNVERAENDERT aus
// fish.js bzw. locations.js. Dazugekommen ist die Anatomie: Koerperprofil,
// Sitz und Form JEDER Flosse, Sitz von Auge, Maul und Kiemendeckel, und was
// die Art auf der Haut traegt.
//
// Das ist der Teil, der im Spiel heute fehlt und ohne den kein Zeichenstil
// hilft: dort haben alle 105 Arten dieselbe Koerperlinie und denselben
// Flossensatz. Ein Hecht ist eine breitgezogene Brasse.
//
// Die Flossenangaben sind an echten Fischen abgelesen:
//   Hecht      Ruecken- und Afterflosse sitzen ganz WEIT HINTEN, fast am
//              Schwanz — das ist die Bauform eines Lauerjaegers, der aus dem
//              Stand beschleunigt. Genau daran erkennt man ihn.
//   Brasse     eine kurze, HOHE Hartstrahlflosse ueber der Koerpermitte, dazu
//              eine sehr lange Afterflosse. Hochrueckig, seitlich abgeflacht.
//   Scholle    Ruecken- und Afterflosse sind ein durchgehender SAUM rings um
//              den ganzen Koerper, und beide Augen sitzen auf einer Seite.
//   Anglerfisch  Ruecken klein und weit hinten, riesiger Brustflossen-"Fuss",
//              erster Rueckenstrahl zur Angel umgebaut.
//   Kaiserfisch hohe durchgehende Rueckenflosse aus Stacheln, tiefe
//              Afterflosse — beides zusammen macht die Scheibenform.
//   Hai        eine grosse spitze Rueckenfinne mit konkaver Hinterkante,
//              lange starre Brustflossen, Sichelschwanz mit langem Oberlappen.

const ARTEN = [
  {
    id: "hecht", name: "Hecht", herkunft: "See · ungewöhnlich",
    color: "#5c7a3a", belly: "#c9d39a", fin: "#8a6a2a", akzent: "#d9e37a",
    len: 1.6, h: 0.6, muster: "streifen-quer",
    form: "spindel", schwanz: "gabel", schwanzW: 0.44, schwanzH: 1.05,
    dorsal: [{ t0: -0.72, t1: -0.30, h: 0.62, form: "weich" }],
    anal:   [{ t0: -0.70, t1: -0.34, h: 0.52, form: "weich" }],
    brustT: 0.30, brustW: 0.28, brustH: 0.62, brustRot: 0.5,
    augeT: 0.74, augeR: 0.17, augeY: 0.46, maulT: 0.58, maulOeff: 0.24, maulY: 0.34,
    kiemeT: 0.48, raubtier: true, schuppen: "fein", seitenlinie: 0.42
  },
  {
    id: "brasse", name: "Brasse", herkunft: "See · gewöhnlich",
    color: "#a3a99a", belly: "#e6e6dc", fin: "#6f7566", akzent: "#c8b06a",
    len: 1.05, h: 1.3, muster: "schuppen",
    form: "hoch", schwanz: "gabel", schwanzW: 0.46, schwanzH: 1.45,
    dorsal: [{ t0: -0.30, t1: 0.08, h: 0.62, form: "stachel" }],
    anal:   [{ t0: -0.74, t1: -0.02, h: 0.5, form: "stachel" }],
    brustT: 0.22, brustW: 0.30, brustH: 0.95, brustRot: 0.6,
    augeT: 0.66, augeR: 0.18, augeY: 0.46, maulT: 0.80, maulOeff: 0.07, maulY: 0.14,
    kiemeT: 0.46, schuppen: "gross", seitenlinie: 0.36
  },
  {
    id: "scholle", name: "Scholle", herkunft: "Küste · gewöhnlich",
    color: "#8b6f47", belly: "#e8d9c0", fin: "#6a5334", akzent: "#e0603a",
    // BEFUND: das Spiel gibt der Scholle h = 0,8 — das ist keine Scholle,
    // das ist ein Doebel. Ein Plattfisch ist von seiner Augenseite aus fast
    // so hoch wie lang. Hier steht deshalb 1,45; im Spiel muesste dieser
    // Wert in locations.js korrigiert werden, sonst hilft kein Zeichenstil.
    len: 1.0, h: 1.45, muster: "flecken-orange",
    form: "platt", schwanz: "gerade", schwanzW: 0.24, schwanzH: 0.8,
    dorsal: [{ t0: -0.92, t1: 0.66, h: 0.20, form: "saum" }],
    anal:   [{ t0: -0.92, t1: 0.44, h: 0.18, form: "saum" }],
    brustT: 0.40, brustW: 0.18, brustH: 0.36, brustRot: 0.3,
    augeT: 0.66, augeR: 0.14, augeY: 0.52, auge2: { t: 0.58, y: 0.18, r: 0.9 },
    maulT: 0.84, maulOeff: 0.09, maulY: 0.10,
    kiemeT: 0.56, plattfisch: true, schuppen: "fein", seitenlinie: 0.5
  },
  {
    id: "anglerfisch", name: "Anglerfisch", herkunft: "See/Tiefsee · episch",
    color: "#3b3f5c", belly: "#6b6f8c", fin: "#2a2d45", akzent: "#9fffe0",
    len: 1.0, h: 1.2, muster: "warzen",
    form: "klotz", schwanz: "rund", schwanzW: 0.30, schwanzH: 0.85,
    dorsal: [{ t0: -0.62, t1: -0.24, h: 0.34, form: "weich" }],
    anal:   [{ t0: -0.58, t1: -0.26, h: 0.30, form: "weich" }],
    brustT: 0.02, brustW: 0.36, brustH: 0.85, brustRot: 0.75,
    augeT: 0.62, augeR: 0.16, augeY: 0.58, maulT: 0.24, maulOeff: 0.6, maulY: 0.18,
    kiemeT: 0.16, raubtier: true, leuchtet: true, angel: true, haut: "warzig"
  },
  {
    id: "kaiserfisch", name: "Kaiserfisch", herkunft: "Riff · selten",
    color: "#2a3b8f", belly: "#ffd23a", fin: "#5ad4ff", akzent: "#ffd23a",
    len: 0.9, h: 1.2, muster: "streifen-schraeg",
    form: "hoch", schwanz: "faecher", schwanzW: 0.30, schwanzH: 1.1,
    dorsal: [{ t0: -0.52, t1: 0.24, h: 0.66, form: "stachel" }],
    anal:   [{ t0: -0.62, t1: 0.02, h: 0.58, form: "stachel" }],
    brustT: 0.24, brustW: 0.26, brustH: 0.8, brustRot: 0.55,
    augeT: 0.70, augeR: 0.19, augeY: 0.42, maulT: 0.86, maulOeff: 0.05, maulY: 0.10,
    kiemeT: 0.52, schuppen: "gross", seitenlinie: 0.34
  },
  {
    id: "neonfisch", name: "Neonfisch", herkunft: "See · selten",
    color: "#2ee6ff", belly: "#ff3d8a", fin: "#1aa3b8", akzent: "#ff3d8a",
    len: 0.5, h: 0.8, muster: "neonband",
    form: "winzig", schwanz: "gabel", schwanzW: 0.44, schwanzH: 1.1,
    dorsal: [{ t0: -0.40, t1: -0.06, h: 0.42, form: "weich" }],
    anal:   [{ t0: -0.52, t1: -0.12, h: 0.40, form: "weich" }],
    brustT: 0.26, brustW: 0.22, brustH: 0.45, brustRot: 0.4,
    augeT: 0.66, augeR: 0.28, augeY: 0.30, maulT: 0.86, maulOeff: 0.05, maulY: 0.12,
    kiemeT: 0.50, leuchtet: true, schuppen: "keine"
  },
  {
    id: "hai", name: "Hai", herkunft: "Boot/Küste · legendär",
    color: "#6f8296", belly: "#e6edf3", fin: "#4d5d6d", akzent: "#2b3946",
    len: 2.8, h: 0.9, muster: "keins",
    form: "hai", schwanz: "sichel", schwanzW: 0.42, schwanzH: 1.25,
    dorsal: [{ t0: -0.34, t1: 0.10, h: 0.92, form: "spitz" },
             { t0: -0.74, t1: -0.60, h: 0.22, form: "spitz" }],
    anal:   [{ t0: -0.72, t1: -0.56, h: 0.20, form: "spitz" }],
    brustT: 0.26, brustW: 0.52, brustH: 1.05, brustRot: 0.72,
    augeT: 0.80, augeR: 0.12, augeY: 0.50, maulT: 0.60, maulOeff: 0.32, maulY: 0.46,
    kiemeT: 0.52, raubtier: true, kiemenSpalten: 5, schuppen: "keine", seitenlinie: 0.46
  }
];

// Die Groessen, in denen Fische im Spiel WIRKLICH vorkommen.
// `L` ist die halbe Koerperlaenge, genau wie in fish.js (`fishUnit`):
//   fishUnit = 18 * len * scale(0,8..1,3) * uiScale * (1 - 0,3*z)
const GROESSEN = [
  { id: "fern",  L: 8,   name: "fern (L 8)",        hinweis: "Schwarm hinten, 2.5D-Ebene" },
  { id: "becken", L: 14, name: "Becken (L 14)",     hinweis: "Aquarium, Schrägsicht" },
  { id: "spiel", L: 22,  name: "Angelplatz (L 22)", hinweis: "der Normalfall" },
  { id: "nah",   L: 40,  name: "nah (L 40)",        hinweis: "grosser Fisch vorn" },
  { id: "karte", L: 90,  name: "Fangkarte (L 90)",  hinweis: "Fangkarte / Bosskampf" },
  { id: "lupe",  L: 200, name: "Lupe (L 200)",      hinweis: "nur zum Prüfen der Zeichnung" }
];
