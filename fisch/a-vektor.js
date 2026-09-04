// =============================================================================
// ENTWURF A — „VEKTOR"
// =============================================================================
// HALTUNG
//   Wie ein gutes App-Icon. Alles ist Flaeche, jede Flaeche hat eine Kontur,
//   und die Kontur traegt den ganzen Kontrast. Kein einziger Verlauf.
//
// SILHOUETTE   je Art eigen, aber ruhig und geschlossen — keine ausgefransten
//              Flossenspitzen, jede Form ist von aussen in einem Zug lesbar.
// KANTE        Konturen in einer dunklen Variante der EIGENEN Farbe, nie
//              schwarz. Sie sind gewichtet: unten und hinten dick, oben und
//              vorn duenn. Das ist der Trick, der flache Formen plastisch
//              wirken laesst, ohne dass Licht im Spiel ist.
// LICHT        gibt es nicht. Volumen kommt aus der Kantendicke und aus der
//              einen harten Trennlinie zwischen Ruecken- und Bauchton.
// PALETTE      zwei Toene je Fisch (Ruecken, Bauch), dazu die Flossenfarbe.
//              Alle drei bleiben satt; entsaettigt wird nichts.
// AUGE         das groesste Einzelteil: weisser Kreis, dicker dunkler Ring,
//              grosse Pupille, EIN runder Glanzpunkt. Der Ring ist wichtiger
//              als das Weiss — er haelt das Auge auch bei 14 Pixeln zusammen.
// FLOSSEN      eigene Formen mit eigener Kontur, sichtbar UEBERLAPPEND. Wo
//              eine Flosse den Koerper kreuzt, bleibt ihre Kontur stehen.
// MUSTER       harte Formen, an der Silhouette abgeschnitten, in einer
//              dritten Farbe — nie als Schwarz-Transparenz wie heute.

const KONTUR_DUNKEL = -0.52;

function aStrich(c, col, w) {
  c.strokeStyle = shadeColor(col, KONTUR_DUNKEL);
  c.lineWidth = w; c.lineJoin = "round"; c.lineCap = "round";
}

// Gewichtete Kontur: erst die ganze Form duenn, dann die untere Haelfte dick.
// Canvas kann eine Strichstaerke nicht entlang eines Pfades veraendern —
// zweimal stroken mit einem Clip auf die untere Haelfte tut dasselbe und ist
// eine Zeichnung, kein Trick.
function aGewichtet(c, pfad, col, duenn, dick, L, Hh) {
  pfad(); aStrich(c, col, duenn); c.stroke();
  c.save();
  c.beginPath(); c.rect(-L * 2, 0, L * 4, Hh * 4); c.clip();
  pfad(); aStrich(c, col, dick); c.stroke();
  c.restore();
}

function aMuster(c, art, L, Hh, phase, biege) {
  c.save();
  koerperPfad(c, art, L, Hh, phase, biege); c.clip();
  const dunkel = shadeColor(art.color, -0.34);
  if (art.muster === "streifen-quer") {          // Hecht: helle Querbalken
    c.fillStyle = art.akzent;
    for (let i = 0; i < 7; i++) {
      const t = -0.85 + i * 0.24;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const b = ankerAt(art, L, Hh, t + 0.09, phase, biege);
      c.beginPath();
      c.moveTo(a.x, a.y - a.ho * 0.9); c.lineTo(b.x, b.y - b.ho * 0.9);
      c.lineTo(b.x + L * 0.03, b.y + b.hu * 0.25); c.lineTo(a.x + L * 0.03, a.y + a.hu * 0.25);
      c.closePath(); c.fill();
    }
  } else if (art.muster === "streifen-schraeg") { // Kaiserfisch: schraege Baender
    c.fillStyle = art.akzent;
    for (let i = 0; i < 6; i++) {
      const t = -0.75 + i * 0.3;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      c.beginPath();
      c.moveTo(a.x - L * 0.10, a.y - a.ho); c.lineTo(a.x + L * 0.05, a.y - a.ho);
      c.lineTo(a.x + L * 0.20, a.y + a.hu); c.lineTo(a.x + L * 0.05, a.y + a.hu);
      c.closePath(); c.fill();
    }
  } else if (art.muster === "schuppen") {         // Brasse: Bogenreihen
    aStrich(c, art.color, Math.max(0.7, L * 0.022));
    for (let r = 0; r < 5; r++) for (let i = 0; i < 8; i++) {
      const x = -L * 0.78 + i * L * 0.21 + (r % 2) * L * 0.105;
      const y = -Hh * 0.66 + r * Hh * 0.34;
      c.beginPath(); c.arc(x, y, Hh * 0.19, Math.PI * 0.12, Math.PI * 0.88); c.stroke();
    }
  } else if (art.muster === "flecken-orange") {   // Scholle: die roten Tupfen
    for (let i = 0; i < 11; i++) {
      const t = -0.8 + prnd(i, 3) * 1.5;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const y = a.y + (prnd(i, 4) - 0.5) * (a.ho + a.hu) * 0.9;
      const r = Hh * (0.10 + prnd(i, 5) * 0.07);
      c.fillStyle = art.akzent;
      c.beginPath(); c.arc(a.x, y, r, 0, Math.PI * 2); c.fill();
      aStrich(c, art.akzent, Math.max(0.6, L * 0.018)); c.stroke();
    }
  } else if (art.muster === "warzen") {           // Anglerfisch: Hautlappen
    c.fillStyle = dunkel;
    for (let i = 0; i < 9; i++) {
      const t = -0.7 + prnd(i, 8) * 1.3;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const y = a.y + (prnd(i, 9) - 0.6) * (a.ho + a.hu) * 0.8;
      c.beginPath(); c.arc(a.x, y, Hh * (0.07 + prnd(i, 10) * 0.06), 0, Math.PI * 2); c.fill();
    }
  } else if (art.muster === "neonband") {         // Neonfisch: das Leuchtband
    c.fillStyle = art.color;
    const o = zonenLinie(art, L, Hh, phase, biege, 0.34, 0);
    const u = zonenLinie(art, L, Hh, phase, biege, 0.56, 0);
    c.beginPath(); kurveDurch(c, o.concat(u.slice().reverse()), true); c.fill();
    c.fillStyle = art.akzent;
    const o2 = zonenLinie(art, L, Hh, phase, biege, 0.70, 0);
    const u2 = zonenLinie(art, L, Hh, phase, biege, 0.95, 0);
    c.beginPath(); kurveDurch(c, o2.concat(u2.slice().reverse()), true); c.fill();
  }
  c.restore();
}

function aFlosse(c, pfad, farbe, L) {
  pfad(); c.fillStyle = farbe; c.fill();
  pfad(); aStrich(c, farbe, Math.max(0.9, L * 0.05)); c.stroke();
}

function vektorFisch(c, art0, x, y, L, dir, phase, opts = {}) {
  const art = Object.assign({}, art0, palA(art0));
  const Hh = L * art.h * 0.5;
  const biege = opts.biege == null ? 0.16 : opts.biege;
  c.save();
  c.translate(x, y);
  c.scale(dir >= 0 ? 1 : -1, 1);

  const koerper = () => koerperPfad(c, art, L, Hh, phase, biege);
  const dickeK = Math.max(1.1, L * 0.075), duennK = Math.max(0.8, L * 0.042);

  // 1. abgewandte Brustflosse — liegt hinter allem, in einem dunkleren Ton
  aFlosse(c, () => brustPfad(c, art, L, Hh, phase, biege, -1), shadeColor(art.fin, -0.28), L);
  // 2. Schwanz, Ruecken-, Afterflosse
  aFlosse(c, () => schwanzPfad(c, art, L, Hh, phase, biege), art.fin, L);
  for (const f of rueckenFlossen(art)) aFlosse(c, () => rueckenPfad(c, f, art, L, Hh, phase, biege), art.fin, L);
  for (const f of afterFlossen(art)) aFlosse(c, () => afterPfad(c, f, art, L, Hh, phase, biege), art.fin, L);
  if (art.form !== "platt") aFlosse(c, () => bauchPfad(c, art, L, Hh, phase, biege), shadeColor(art.fin, -0.12), L);

  // 3. Koerper: Rueckenton, dann Bauchton mit HARTER Kante
  koerper(); c.fillStyle = art.color; c.fill();
  c.save(); koerper(); c.clip();
  bauchZone(c, art, L, Hh, phase, biege, 0.62, 0.1);
  c.fillStyle = art.belly; c.fill();
  // die Trennkante bekommt eine eigene, duenne Linie — sonst liest sie sich
  // als Fehler statt als Entscheidung
  const tl = zonenLinie(art, L, Hh, phase, biege, 0.62, 0.1);
  c.beginPath(); kurveDurch(c, tl, false);
  aStrich(c, art.color, Math.max(0.7, L * 0.028)); c.stroke();
  c.restore();

  // 4. Muster
  aMuster(c, art, L, Hh, phase, biege);

  // 5. Koerperkontur, gewichtet — der eigentliche Traeger dieses Entwurfs
  aGewichtet(c, koerper, art.color, duennK, dickeK, L, Hh);

  // 6. Kiemendeckel als eigene Flaeche mit Kontur (nicht als Schattenstrich)
  if (L >= 12 && art.form !== "platt") {
    c.save(); koerper(); c.clip();
    const t = art.kiemeT;
    const a = ankerAt(art, L, Hh, t, phase, biege);
    const vor = koerperPunkte(art, L, Hh, phase, biege);
    const kopf = vor.oben.filter(p => p[0] >= a.x).concat([[a.x, a.y - a.ho]]);
    c.beginPath();
    c.moveTo(a.x, a.y - a.ho * 0.98);
    c.quadraticCurveTo(a.x - L * 0.05, a.y, a.x + L * 0.02, a.y + a.hu * 0.98);
    aStrich(c, art.color, Math.max(0.9, L * 0.045)); c.stroke();
    void kopf;
    c.restore();
  }

  // 7. Maul
  if (L >= 10) {
    const m = maulPfad(c, art, L, Hh, phase, biege, 1);
    if (art.raubtier) {
      // Raubtiere bekommen ein GEOEFFNETES Maul als eigene Flaeche
      c.beginPath();
      c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.55), m.wy + m.oeff * 0.9, m.sx - L * 0.01, m.sy + m.oeff * 0.75);
      c.closePath();
      c.fillStyle = "#3a1218"; c.fill();
      aStrich(c, art.color, Math.max(0.9, L * 0.04)); c.stroke();
      if (L >= 16) {                       // Zaehne: gleichseitige Dreiecke, gleiche Groesse
        c.save();
        c.beginPath();
        c.moveTo(m.sx, m.sy);
        c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy);
        c.quadraticCurveTo(lerp(m.sx, m.wx, 0.55), m.wy + m.oeff * 0.9, m.sx - L * 0.01, m.sy + m.oeff * 0.75);
        c.closePath(); c.clip();
        c.fillStyle = "#fbfdf6";
        const n = 5, zw = Math.abs(m.wx - m.sx) / (n * 2.1);
        for (let i = 0; i < n; i++) {
          const k = (i + 0.6) / n;
          const tx = lerp(m.sx, m.wx, k), ty = lerp(m.sy, m.wy, k) - m.oeff * 0.42 * Math.sin(k * Math.PI);
          c.beginPath(); c.moveTo(tx - zw, ty); c.lineTo(tx + zw, ty); c.lineTo(tx, ty + m.oeff * 0.55); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(tx - zw, ty + m.oeff * 0.95); c.lineTo(tx + zw, ty + m.oeff * 0.95); c.lineTo(tx, ty + m.oeff * 0.45); c.closePath(); c.fill();
        }
        c.restore();
      }
    } else {
      c.beginPath();
      c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy);
      aStrich(c, art.color, Math.max(0.9, L * 0.045)); c.stroke();
    }
  }

  // 8. zugewandte Brustflosse — VOR dem Koerper, mit voller Kontur
  aFlosse(c, () => brustPfad(c, art, L, Hh, phase, biege, 1), art.fin, L);

  // 9. Leuchtangel
  if (art.angel) {
    const a = ankerAt(art, L, Hh, 0.45, phase, biege);
    const bx = a.x + L * 0.55 + Math.sin(phase * 0.8) * L * 0.05, by = a.y - a.ho - Hh * 1.05;
    aStrich(c, art.fin, Math.max(1.1, L * 0.05));
    c.beginPath(); c.moveTo(a.x, a.y - a.ho * 0.95);
    c.quadraticCurveTo(a.x + L * 0.2, by - Hh * 0.4, bx, by); c.stroke();
    c.fillStyle = art.akzent;
    c.beginPath(); c.arc(bx, by, Hh * 0.2, 0, Math.PI * 2); c.fill();
    aStrich(c, art.akzent, Math.max(0.8, L * 0.035)); c.stroke();
  }

  // 10. DAS AUGE
  //
  // Hier ist dieser Entwurf bewusst am dichtesten am heutigen Ton — er ist das
  // FREUNDLICHE Ende der Reihe. Aber die Cartoon-Formel (grosser weisser
  // Kreis, dicker schwarzer Punkt, Glanzfleck oben links) ist trotzdem raus:
  //   * kleiner als heute (0,82 statt 1,0 des heutigen Radius),
  //   * kein weisser Augapfel, sondern ein IRISRING in der Akzentfarbe,
  //   * die Pupille ist ein dunkler Ton der Koerperfarbe, nicht Schwarz,
  //   * der Glanz ist ein duenner Bogen an der Oberkante statt eines Punktes,
  //     und er kommt erst ab L 20, weil er darunter zum Klecks wird.
  const e = augeOrt(art, L, Hh, phase, biege);
  const R = Math.max(1.4, e.r * 0.82);
  c.fillStyle = shadeColor(art.akzent, -0.12);
  c.beginPath(); c.arc(e.x, e.y, R, 0, Math.PI * 2); c.fill();
  c.fillStyle = shadeColor(art.color, -0.78);
  c.beginPath(); c.arc(e.x + R * 0.10, e.y + R * 0.02, R * 0.62, 0, Math.PI * 2); c.fill();
  aStrich(c, art.color, Math.max(0.9, R * 0.28));
  c.beginPath(); c.arc(e.x, e.y, R, 0, Math.PI * 2); c.stroke();
  if (L >= 20) {
    c.strokeStyle = "rgba(255,255,255,0.75)"; c.lineWidth = Math.max(0.7, R * 0.2); c.lineCap = "round";
    c.beginPath(); c.arc(e.x, e.y, R * 0.62, Math.PI * 1.15, Math.PI * 1.62); c.stroke();
  }
  c.restore();
}
