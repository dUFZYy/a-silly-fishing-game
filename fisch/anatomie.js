// =============================================================================
// anatomie.js — die gemeinsame Grundlage aller fuenf Entwuerfe
// =============================================================================
//
// WAS HIER PASSIERT, UND WARUM ES DER EIGENTLICHE PUNKT IST
//
// Im Spiel haben ALLE Fische exakt dieselbe Koerperlinie (`fishBodyPath` in
// fish.js). Unterschiedlich sind nur zwei Zahlen: `len` und `h`. Ein Hecht ist
// dieselbe Form wie eine Brasse, nur breitgezogen. Das ist der Grund, warum
// die Fische "alle gleich aussehen" — noch vor jeder Frage nach Schattierung.
//
// Hier bekommt jede Art ein PROFIL: eine Kette von Stuetzpunkten fuer Ruecken-
// und Bauchlinie, dazu ein Flossensatz. Alle fuenf Entwuerfe zeichnen dasselbe
// Profil — sie behandeln es nur voellig verschieden. So vergleicht man
// Designsprachen und nicht Zufaelle.
//
// Der Koerper haengt an einer WIRBELSAEULE, die sich biegt. Damit schlaegt
// nicht nur die Schwanzfahne, sondern der ganze Fisch schwimmt. Kostet nichts,
// weil in gebackenen Phasen (siehe Fussnote in jedem Entwurf).

// ---------- kleine Helfer (aus dem Spiel uebernommen) ----------
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function hexToRgb(h) {
  if (h[0] !== "#") { const m = h.match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2]]; }
  const n = parseInt(h.length === 4 ? h[1] + h[1] + h[2] + h[2] + h[3] + h[3] : h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shadeColor(col, amt) {
  let r, g, b, a = 1;
  if (col[0] === "#") { const n = parseInt(col.slice(1), 16); r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255; }
  else { const m = col.match(/[\d.]+/g) || [0, 0, 0]; r = +m[0]; g = +m[1]; b = +m[2]; if (m[3] != null) a = +m[3]; }
  const f = v => Math.round(clamp(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt, 0, 255));
  return `rgba(${f(r)},${f(g)},${f(b)},${a})`;
}
function lerpColor(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`;
}
function rgba(col, a) { const c = hexToRgb(col); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
// Farbe im HSL-Raum drehen: fuer "gebrochene Farben" (Entwurf D) und
// Schillern (Entwurf B). Schatten ins Kalte, Lichter ins Warme.
function hueShift(col, deg, sat, lum) {
  let [r, g, b] = hexToRgb(col); r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0; const l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  h = (h + deg + 360) % 360;
  const s2 = clamp(s * (sat == null ? 1 : sat), 0, 1);
  const l2 = clamp(l * (lum == null ? 1 : lum), 0, 1);
  const C = (1 - Math.abs(2 * l2 - 1)) * s2, X = C * (1 - Math.abs((h / 60) % 2 - 1)), m = l2 - C / 2;
  let rr, gg, bb;
  if (h < 60) [rr, gg, bb] = [C, X, 0]; else if (h < 120) [rr, gg, bb] = [X, C, 0];
  else if (h < 180) [rr, gg, bb] = [0, C, X]; else if (h < 240) [rr, gg, bb] = [0, X, C];
  else if (h < 300) [rr, gg, bb] = [X, 0, C]; else [rr, gg, bb] = [C, 0, X];
  return `rgb(${Math.round((rr + m) * 255)},${Math.round((gg + m) * 255)},${Math.round((bb + m) * 255)})`;
}
// deterministisches Rauschen — wie `prnd` im Spiel. Nichts hier darf zur
// Laufzeit wuerfeln, sonst flackert jede gebackene Kachel.
function prnd(i, salt = 0) { const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453; return v - Math.floor(v); }

// ---------- Kurve durch Stuetzpunkte (Catmull-Rom -> Bezier) ----------
// Eine weiche Linie durch gegebene Punkte. Der Unterschied zu von Hand
// gesetzten Bezierkurven: man kann die SILHOUETTE beschreiben, statt sie zu
// konstruieren — und damit ueberhaupt erst pro Art eine eigene bauen.
function kurveDurch(c, pts, schliessen) {
  const n = pts.length;
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i > 0 ? i - 1 : 0], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2 < n ? i + 2 : n - 1];
    c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
                    p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
                    p2[0], p2[1]);
  }
  if (schliessen) c.closePath();
}

// =============================================================================
// DIE PROFILE — hier steckt die Arbeit
// =============================================================================
// Jedes Profil ist eine Liste [t, oben, unten]:
//   t      -1 = Schwanzwurzel ... +1 = Schnauzenspitze
//   oben   Abstand der Rueckenlinie von der Wirbelsaeule, in Hh
//   unten  dasselbe fuer die Bauchlinie
// Ruecken und Bauch sind getrennt, weil genau darin die Arten sich
// unterscheiden: ein Hecht ist oben fast gerade und unten flach, eine Brasse
// hat einen hohen Bogen oben UND einen tiefen unten, ein Anglerfisch ist vorn
// ein Kopf und hinten fast nichts mehr.
const PROFILE = {
  // Raeuber: langer flacher Kopf, Ruecken erst weit hinten hoch, kraeftiger
  // Schwanzstiel. Die Schnauze ist ein KEIL, keine Kugel.
  spindel: [
    [-1.00, 0.30, 0.28], [-0.80, 0.42, 0.38], [-0.50, 0.62, 0.55],
    [-0.10, 0.82, 0.70], [ 0.25, 0.88, 0.72], [ 0.55, 0.80, 0.62],
    [ 0.80, 0.60, 0.40], [ 0.94, 0.34, 0.20], [ 1.00, 0.06, 0.02]
  ],
  // Friedfisch, hochrueckig: steile Stirn, hoechster Punkt VOR der Mitte,
  // tiefer Bauch, duenner Schwanzstiel. Fast eine Raute.
  hoch: [
    [-1.00, 0.22, 0.20], [-0.78, 0.46, 0.44], [-0.45, 0.80, 0.78],
    [-0.05, 1.00, 0.96], [ 0.30, 0.98, 0.88], [ 0.58, 0.82, 0.66],
    [ 0.80, 0.56, 0.40], [ 0.93, 0.28, 0.18], [ 1.00, 0.08, 0.04]
  ],
  // Plattfisch: eine Scheibe mit einem kleinen Kopf dran. Oben und unten fast
  // gleich, die Kanten laufen als duenner Saum aus (dort sitzt der Flossensaum).
  platt: [
    [-1.00, 0.30, 0.28], [-0.82, 0.62, 0.60], [-0.50, 0.90, 0.88],
    [-0.10, 0.98, 0.98], [ 0.30, 0.94, 0.92], [ 0.62, 0.78, 0.74],
    [ 0.85, 0.50, 0.42], [ 0.96, 0.26, 0.18], [ 1.00, 0.10, 0.06]
  ],
  // Allerweltsfisch (Barsch, Karpfen): der Kompromiss, dem alles im Spiel
  // heute gleicht. Bleibt drin, damit man den Unterschied sieht.
  rund: [
    [-1.00, 0.26, 0.24], [-0.80, 0.46, 0.44], [-0.45, 0.72, 0.68],
    [-0.05, 0.90, 0.84], [ 0.30, 0.92, 0.80], [ 0.60, 0.80, 0.62],
    [ 0.82, 0.56, 0.38], [ 0.94, 0.30, 0.18], [ 1.00, 0.08, 0.03]
  ],
  // Tiefsee-Lauerjaeger: der Kopf IST der Fisch. Riesiger Vorderkoerper,
  // Maulspalt bis fast zum Auge, Rest ein Stummel.
  klotz: [
    [-1.00, 0.16, 0.14], [-0.82, 0.30, 0.26], [-0.55, 0.52, 0.48],
    [-0.20, 0.78, 0.80], [ 0.15, 0.96, 1.02], [ 0.48, 1.00, 0.98],
    [ 0.74, 0.86, 0.72], [ 0.92, 0.52, 0.34], [ 1.00, 0.18, 0.08]
  ],
  // Hai: langer spitzer Kegel, breite Schulter kurz hinter dem Kopf,
  // Unterseite fast gerade. Der Ruecken faellt zum Schwanz kaum ab.
  hai: [
    [-1.00, 0.28, 0.24], [-0.78, 0.44, 0.34], [-0.45, 0.62, 0.48],
    [-0.05, 0.78, 0.62], [ 0.30, 0.84, 0.64], [ 0.58, 0.76, 0.56],
    [ 0.80, 0.56, 0.36], [ 0.94, 0.30, 0.16], [ 1.00, 0.04, 0.00]
  ],
  // Winzling: alles rund und kurz, riesiges Auge, kaum Schnauze.
  winzig: [
    [-1.00, 0.24, 0.22], [-0.78, 0.50, 0.48], [-0.42, 0.80, 0.76],
    [ 0.00, 0.94, 0.90], [ 0.36, 0.92, 0.82], [ 0.66, 0.78, 0.62],
    [ 0.86, 0.52, 0.34], [ 0.96, 0.26, 0.14], [ 1.00, 0.10, 0.04]
  ]
};

// =============================================================================
// DIE WIRBELSAEULE
// =============================================================================
// `phase` laeuft 0..2pi. `biege` ist die Staerke. Die Auslenkung waechst zum
// Schwanz hin (Umschlag `env`) und ist am Kopf fast null — so schwimmt ein
// Fisch, statt zu wackeln.
function spineY(t, Hh, phase, biege) {
  const env = Math.pow((1 - t) / 2, 1.35);
  return Math.sin(2.1 * t - phase) * Hh * biege * env;
}
function spineTangente(t, Hh, phase, biege) {
  const d = 0.02;
  return (spineY(Math.min(1, t + d), Hh, phase, biege) - spineY(Math.max(-1, t - d), Hh, phase, biege)) / (2 * d * 1);
}

// Punktketten fuer Ruecken und Bauch, in Weltkoordinaten des Fisches
// (x = t*L, y relativ zur Mittellinie).
function koerperPunkte(art, L, Hh, phase, biege) {
  const P = PROFILE[art.form] || PROFILE.rund;
  const oben = [], unten = [];
  for (const [t, o, u] of P) {
    const sy = spineY(t, Hh, phase, biege);
    oben.push([t * L, sy - o * Hh]);
    unten.push([t * L, sy + u * Hh]);
  }
  return { oben, unten };
}

// Der geschlossene Koerperpfad. Ruecken vorwaerts, Bauch rueckwaerts.
function koerperPfad(c, art, L, Hh, phase, biege) {
  const { oben, unten } = koerperPunkte(art, L, Hh, phase, biege);
  const ring = oben.concat(unten.slice().reverse());
  c.beginPath();
  kurveDurch(c, ring, true);
}

// Wo sitzt was? Alle Anbauten fragen hier nach, damit sie bei jeder Art und in
// jeder Schwimmphase am richtigen Fleck haengen.
function ankerAt(art, L, Hh, t, phase, biege) {
  const P = PROFILE[art.form] || PROFILE.rund;
  // lineare Interpolation im Profil reicht fuer Ankerpunkte
  let o = P[0][1], u = P[0][2];
  for (let i = 0; i < P.length - 1; i++) {
    if (t >= P[i][0] && t <= P[i + 1][0]) {
      const k = (t - P[i][0]) / (P[i + 1][0] - P[i][0]);
      o = lerp(P[i][1], P[i + 1][1], k); u = lerp(P[i][2], P[i + 1][2], k);
      break;
    }
  }
  const sy = spineY(t, Hh, phase, biege);
  return { x: t * L, y: sy, oben: sy - o * Hh, unten: sy + u * Hh, ho: o * Hh, hu: u * Hh,
           neig: spineTangente(t, Hh, phase, biege) };
}

// =============================================================================
// FLOSSENFORMEN — als PFADE, nicht als Fuellungen
// =============================================================================
// Jeder Entwurf fuellt sie anders (flach, Verlauf, Papier, Pinsel). Deshalb
// liefern diese Funktionen nur Geometrie.

// Schwanzflosse. `typ`: gabel | sichel | rund | gerade | faecher
function schwanzPfad(c, art, L, Hh, phase, biege) {
  const a = ankerAt(art, L, Hh, -1, phase, biege);
  const w = L * (art.schwanzW || 0.42);          // Laenge der Fahne nach hinten
  const s = Hh * (art.schwanzH || 1.6);          // halbe Spannweite
  const kipp = a.neig * 0.55;                    // die Fahne schleppt nach
  const x0 = a.x, y0 = a.y;
  const typ = art.schwanz || "gabel";
  c.beginPath();
  if (typ === "gabel") {
    c.moveTo(x0, y0 - a.ho * 0.6);
    c.quadraticCurveTo(x0 - w * 0.5, y0 - s * 0.5 + kipp * 0.4, x0 - w, y0 - s + kipp);
    c.quadraticCurveTo(x0 - w * 0.55, y0 - s * 0.22 + kipp * 0.7, x0 - w * 0.48, y0 + kipp * 0.8);
    c.quadraticCurveTo(x0 - w * 0.55, y0 + s * 0.22 + kipp * 0.7, x0 - w, y0 + s + kipp);
    c.quadraticCurveTo(x0 - w * 0.5, y0 + s * 0.5 + kipp * 0.4, x0, y0 + a.hu * 0.6);
  } else if (typ === "sichel") {              // Hai, Thun: steife Mondsichel
    c.moveTo(x0, y0 - a.ho * 0.5);
    c.quadraticCurveTo(x0 - w * 0.35, y0 - s * 0.8 + kipp * 0.5, x0 - w * 0.75, y0 - s * 1.35 + kipp);
    c.quadraticCurveTo(x0 - w * 0.62, y0 - s * 0.35 + kipp * 0.7, x0 - w * 0.34, y0 + kipp * 0.8);
    c.quadraticCurveTo(x0 - w * 0.6, y0 + s * 0.3 + kipp * 0.7, x0 - w * 0.85, y0 + s * 0.85 + kipp);
    c.quadraticCurveTo(x0 - w * 0.4, y0 + s * 0.45 + kipp * 0.4, x0, y0 + a.hu * 0.5);
  } else if (typ === "rund") {                // Blob, Anglerfisch: Faecher ohne Kerbe
    c.moveTo(x0, y0 - a.ho * 0.7);
    c.quadraticCurveTo(x0 - w * 0.9, y0 - s * 0.95 + kipp, x0 - w * 1.05, y0 + kipp * 1.1);
    c.quadraticCurveTo(x0 - w * 0.9, y0 + s * 0.95 + kipp, x0, y0 + a.hu * 0.7);
  } else if (typ === "gerade") {              // Plattfisch: kurzer Spatel
    c.moveTo(x0, y0 - a.ho * 0.8);
    c.quadraticCurveTo(x0 - w * 0.7, y0 - s * 0.7 + kipp, x0 - w * 0.82, y0 - s * 0.55 + kipp);
    c.lineTo(x0 - w * 0.82, y0 + s * 0.55 + kipp);
    c.quadraticCurveTo(x0 - w * 0.7, y0 + s * 0.7 + kipp, x0, y0 + a.hu * 0.8);
  } else {                                    // faecher: breit, weich, Koi/Riff
    c.moveTo(x0, y0 - a.ho * 0.6);
    c.quadraticCurveTo(x0 - w * 0.7, y0 - s * 1.1 + kipp, x0 - w * 1.15, y0 - s * 0.75 + kipp * 1.2);
    c.quadraticCurveTo(x0 - w * 0.7, y0 - s * 0.1 + kipp, x0 - w * 0.72, y0 + kipp);
    c.quadraticCurveTo(x0 - w * 0.7, y0 + s * 0.1 + kipp, x0 - w * 1.15, y0 + s * 0.75 + kipp * 1.2);
    c.quadraticCurveTo(x0 - w * 0.7, y0 + s * 1.1 + kipp, x0, y0 + a.hu * 0.6);
  }
  c.closePath();
}

// ---------- Ruecken- und Afterflossen ----------
//
// Eine Flosse sitzt AUF der Ruecken- bzw. Bauchlinie: ihre Basis ist ein
// Stueck dieser Linie, ihre Oberkante liegt darueber. Der erste Anlauf hier
// hat statt dessen einen Bogen zwischen zwei Punkten gespannt — dabei loeste
// sich die Flosse bei hochrueckigen Arten vom Koerper und stand als
// freischwebendes Dreieck im Bild. Sichtbar geworden ist das erst bei L 90.
//
// `form`:
//   weich    gerundete Fahne, hoechster Punkt in der Mitte (Hecht, Aal, Wels)
//   stachel  Hartstrahler: gerade Vorderkante, gezackte Oberkante (Barsch,
//            Brasse, Kaiserfisch)
//   spitz    nach hinten gestrichene Sichel (Hai) — gerade Vorderkante,
//            konkave Hinterkante
//   saum     durchgehender niedriger Saum ringsum (Plattfisch, Aal)
function _flossenBand(c, art, L, Hh, phase, biege, f, seite) {
  const n = 12;
  const basis = [], oben = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const t = lerp(f.t0, f.t1, k);
    const a = ankerAt(art, L, Hh, t, phase, biege);
    const by = seite > 0 ? a.unten : a.oben;
    basis.push([a.x, by]);
    let hk;
    if (f.form === "weich")        hk = Math.pow(Math.sin(k * Math.PI), 0.75);
    else if (f.form === "stachel") hk = Math.pow(Math.sin(clamp(k * 1.25, 0, 1) * Math.PI), 0.5) * (1 - 0.12 * (i % 2));
    else if (f.form === "spitz")   hk = Math.pow(k, 1.6) * Math.pow(Math.sin(Math.min(1, k * 1.02) * Math.PI), 0.35);
    else                            hk = Math.pow(Math.sin(k * Math.PI), 0.35) * (0.82 + 0.18 * Math.sin(k * 19));
    // Die Fahne schleppt nach hinten: je hoeher, desto weiter zurueck.
    const rueck = (f.form === "spitz" ? 0.22 : 0.08) * L * hk;
    oben.push([a.x - rueck, by + (seite > 0 ? 1 : -1) * Hh * f.h * hk]);
  }
  c.beginPath();
  kurveDurch(c, basis.concat(oben.reverse()), true);
}

function rueckenFlossen(art) {
  return art.dorsal || [{ t0: -0.5, t1: 0.05, h: 0.45, form: "weich" }];
}
function rueckenPfad(c, f, art, L, Hh, phase, biege) {
  _flossenBand(c, art, L, Hh, phase, biege, f, -1);
}
function afterFlossen(art) {
  return art.anal || [{ t0: -0.62, t1: -0.18, h: 0.4, form: "weich" }];
}
function afterPfad(c, f, art, L, Hh, phase, biege) {
  _flossenBand(c, art, L, Hh, phase, biege, f, 1);
}

// Brustflosse. `seite` = 1 (uns zugewandt) oder -1 (abgewandt, liegt hinten).
function brustPfad(c, art, L, Hh, phase, biege, seite) {
  const a = ankerAt(art, L, Hh, art.brustT == null ? 0.30 : art.brustT, phase, biege);
  const rot = (art.brustRot == null ? 0.4 : art.brustRot) + Math.sin(phase * 1.0 + (seite > 0 ? 1.2 : 2.6)) * 0.26;
  const w = L * (art.brustW || 0.34) * (seite > 0 ? 1 : 0.82);
  const h = Hh * (art.brustH || 0.75) * (seite > 0 ? 1 : 0.85);
  const bx = a.x, by = a.y + a.hu * (seite > 0 ? 0.42 : 0.22);
  c.save(); c.translate(bx, by); c.rotate(rot * seite > 0 ? rot : rot * 0.8);
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(-w * 0.75, h * 0.28, -w, h);
  c.quadraticCurveTo(-w * 0.35, h * 0.72, 0, 0);
  c.closePath();
  c.restore();
  return { x: bx, y: by, w, h, rot };
}

// Bauchflossen (klein, unter der Brust) — nur bei Arten, die sie tragen
function bauchPfad(c, art, L, Hh, phase, biege) {
  const a = ankerAt(art, L, Hh, 0.02, phase, biege);
  const w = L * 0.2, h = Hh * 0.5;
  c.beginPath();
  c.moveTo(a.x, a.unten - Hh * 0.03);
  c.quadraticCurveTo(a.x - w * 0.6, a.unten + h * 0.5, a.x - w, a.unten + h);
  c.quadraticCurveTo(a.x - w * 0.2, a.unten + h * 0.45, a.x, a.unten - Hh * 0.03);
  c.closePath();
}

// Wo sitzt das Auge, und wie gross ist es? Der wichtigste Punkt am ganzen
// Fisch — deshalb steht er hier zentral und nicht fuenfmal verstreut.
function augeOrt(art, L, Hh, phase, biege) {
  const t = art.augeT == null ? 0.62 : art.augeT;
  const a = ankerAt(art, L, Hh, t, phase, biege);
  const r = Hh * (art.augeR == null ? 0.26 : art.augeR);
  return { x: a.x, y: a.y - a.ho * (art.augeY == null ? 0.34 : art.augeY), r };
}
// Plattfische haben BEIDE Augen auf derselben Koerperseite. Das ist ihr
// auffaelligstes Merkmal und der Grund, warum eine Scholle mit einem Auge
// immer wie ein schlecht gezeichneter Karpfen aussieht.
function augeOrte(art, L, Hh, phase, biege) {
  const e = augeOrt(art, L, Hh, phase, biege);
  if (!art.auge2) return [e];
  const a = ankerAt(art, L, Hh, art.auge2.t, phase, biege);
  return [e, { x: a.x, y: a.y + a.hu * art.auge2.y, r: e.r * (art.auge2.r || 0.92) }];
}

// Der Maulspalt als Pfad — von der Schnauze zum Mundwinkel.
function maulPfad(c, art, L, Hh, phase, biege, offen) {
  const s = ankerAt(art, L, Hh, 0.99, phase, biege);
  const w = ankerAt(art, L, Hh, art.maulT == null ? 0.66 : art.maulT, phase, biege);
  const oeff = Hh * (art.maulOeff == null ? 0.1 : art.maulOeff) * (offen == null ? 1 : offen);
  const wy = w.y + w.hu * (art.maulY == null ? 0.28 : art.maulY);
  c.beginPath();
  c.moveTo(s.x, s.y + s.hu * 0.3);
  c.quadraticCurveTo(lerp(s.x, w.x, 0.5), lerp(s.y + s.hu * 0.3, wy, 0.5) - oeff * 0.5, w.x, wy);
  return { sx: s.x, sy: s.y + s.hu * 0.3, wx: w.x, wy, oeff };
}

// =============================================================================
// ZONEN — Ruecken, Bauch, Flanke als eigene Flaechen
// =============================================================================
// Gegenschattierung (oben dunkel, unten hell) ist bei Fischen kein Effekt,
// sondern das Hauptmerkmal. Die Entwuerfe brauchen sie in drei Formen:
// als harte Kante (A, C, E), als weicher Uebergang (B) und als Malzone (D).
// Deshalb liegt die Geometrie hier und nur die Behandlung dort.
//
// `k` = 0 an der Ruecken-, 1 an der Bauchlinie. `welle` biegt die Trennlinie,
// damit sie nicht wie ein Lineal ueber dem Fisch liegt.
function zonenLinie(art, L, Hh, phase, biege, k, welle) {
  const P = PROFILE[art.form] || PROFILE.rund;
  const pts = [];
  for (let i = 0; i < P.length; i++) {
    const [t, o, u] = P[i];
    const sy = spineY(t, Hh, phase, biege);
    const oben = sy - o * Hh, unten = sy + u * Hh;
    const kk = clamp(k + (welle || 0) * Math.sin(t * 3.1 + 1.2) * 0.5, 0.02, 0.98);
    pts.push([t * L, lerp(oben, unten, kk)]);
  }
  return pts;
}
// Flaeche zwischen einer Zonenlinie und der Bauchkante
function bauchZone(c, art, L, Hh, phase, biege, k, welle) {
  const linie = zonenLinie(art, L, Hh, phase, biege, k, welle);
  const { unten } = koerperPunkte(art, L, Hh, phase, biege);
  c.beginPath();
  kurveDurch(c, linie.concat(unten.slice().reverse()), true);
}
// Flaeche zwischen Rueckenkante und einer Zonenlinie
function rueckenZone(c, art, L, Hh, phase, biege, k, welle) {
  const linie = zonenLinie(art, L, Hh, phase, biege, k, welle);
  const { oben } = koerperPunkte(art, L, Hh, phase, biege);
  c.beginPath();
  kurveDurch(c, oben.concat(linie.slice().reverse()), true);
}

// Ein Pfad mit gezitterten Stuetzpunkten — fuer den Scherenschnitt (C) und
// den Pinsel (D). `salt` haelt es deterministisch: dieselbe Kachel, dieselbe
// Kante, immer.
function zittern(pts, amp, salt) {
  return pts.map((p, i) => [p[0] + (prnd(i, salt) - 0.5) * amp,
                            p[1] + (prnd(i, salt + 7) - 0.5) * amp]);
}

// Kiemendeckel-Kante
function kiemePfad(c, art, L, Hh, phase, biege) {
  const t = art.kiemeT == null ? 0.42 : art.kiemeT;
  const a = ankerAt(art, L, Hh, t, phase, biege);
  const ao = ankerAt(art, L, Hh, t + 0.14, phase, biege);
  c.beginPath();
  c.moveTo(ao.x, ao.oben + Hh * 0.04);
  c.quadraticCurveTo(a.x - L * 0.02, a.y, ao.x, ao.unten - Hh * 0.04);
}
