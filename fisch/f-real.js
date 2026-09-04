// =============================================================================
// ENTWURF D — „NATURBUCH"  und  ENTWURF E — „FOTOECHT"
// =============================================================================
// Die beiden realistischen Enden. D ist eine Bestimmungsbuch-Illustration:
// korrekt, sauber, mit sichtbarem Strich. E versucht, so weit Richtung Foto zu
// gehen, wie Canvas 2D ueberhaupt kommt — Schuppentextur, nasser Glanz,
// Schillern, Streulicht, ein echtes Auge mit Hornhautreflex.
//
// Beide sind teuer zu ZEICHNEN und kosten im laufenden Bild trotzdem nichts,
// weil sie in dieselbe Kachel gehen, die das Spiel heute schon backt.

// ---------- Schuppentextur ----------
// Einmal je Art und Groessenstufe in eine kleine Kachel gerastert und danach
// als `createPattern` benutzt. Im Spiel liefe das ohnehin nur einmal je
// gebackenem Fischbild; hier haelt ein Map es beim Bewegen billig.
const _schuppenCache = new Map();
function schuppenMuster(c, art, zellW, hell, dunkel) {
  const key = art.id + "|" + Math.round(zellW * 4) + "|" + hell + "|" + dunkel;
  let p = _schuppenCache.get(key);
  if (p) return p;
  const w = Math.max(4, Math.round(zellW)), h = Math.max(4, Math.round(zellW * 0.86));
  const cv = document.createElement("canvas");
  cv.width = w * 2; cv.height = h * 2;
  const cc = cv.getContext("2d");
  // zwei versetzte Reihen, damit die Kachel nahtlos sitzt
  for (let ry = 0; ry < 3; ry++) for (let rx = -1; rx < 3; rx++) {
    const x = rx * w + (ry % 2) * w * 0.5, y = ry * h;
    cc.beginPath();
    cc.arc(x + w * 0.5, y, w * 0.62, Math.PI * 0.18, Math.PI * 0.82);
    cc.strokeStyle = dunkel; cc.lineWidth = Math.max(0.6, w * 0.09); cc.stroke();
    cc.beginPath();
    cc.arc(x + w * 0.5, y - w * 0.06, w * 0.62, Math.PI * 0.24, Math.PI * 0.76);
    cc.strokeStyle = hell; cc.lineWidth = Math.max(0.4, w * 0.05); cc.stroke();
  }
  p = c.createPattern(cv, "repeat");
  _schuppenCache.set(key, p);
  return p;
}

// Flossenstrahlen: viele duenne Linien, die dem Flossenpfad folgen.
function strahlen(c, art, L, Hh, phase, biege, f, seite, farbe, n) {
  c.save();
  c.strokeStyle = farbe; c.lineCap = "round";
  c.lineWidth = Math.max(0.5, L * 0.012);
  for (let i = 1; i < n; i++) {
    const k = i / n;
    const t = lerp(f.t0, f.t1, k);
    const a = ankerAt(art, L, Hh, t, phase, biege);
    const by = seite > 0 ? a.unten : a.oben;
    let hk;
    if (f.form === "weich")        hk = Math.pow(Math.sin(k * Math.PI), 0.75);
    else if (f.form === "stachel") hk = Math.pow(Math.sin(clamp(k * 1.25, 0, 1) * Math.PI), 0.5);
    else if (f.form === "spitz")   hk = Math.pow(k, 1.6) * Math.pow(Math.sin(Math.min(1, k * 1.02) * Math.PI), 0.35);
    else                            hk = Math.pow(Math.sin(k * Math.PI), 0.35);
    const rueck = (f.form === "spitz" ? 0.22 : 0.08) * L * hk;
    c.globalAlpha = f.form === "stachel" ? 0.6 : 0.4;
    c.beginPath();
    c.moveTo(a.x, by);
    c.lineTo(a.x - rueck, by + (seite > 0 ? 1 : -1) * Hh * f.h * hk * 0.92);
    c.stroke();
  }
  c.restore();
}

// Ein realistisches Auge. Der wichtigste Unterschied zum Comic-Auge:
// die Hornhaut ist eine KUGEL ueber der Iris, und der Reflex sitzt darauf,
// nicht in der Iris. Dazu ein dunkler Rand (der Augapfel steht im Schaedel).
function echtesAuge(c, e, art, L, hell) {
  const R = e.r;
  // Hoehle: der Knochenrand ringsum
  const gh = c.createRadialGradient(e.x, e.y, R * 0.7, e.x, e.y, R * 1.5);
  gh.addColorStop(0, "rgba(0,0,0,0.35)"); gh.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = gh; c.beginPath(); c.arc(e.x, e.y, R * 1.5, 0, Math.PI * 2); c.fill();
  // Sklera/Ring
  c.fillStyle = shadeColor(art.color, -0.55);
  c.beginPath(); c.arc(e.x, e.y, R, 0, Math.PI * 2); c.fill();
  // Iris mit Streifung
  const iris = hueShift(art.akzent, 0, 0.85, hell ? 1.15 : 0.85);
  const gi = c.createRadialGradient(e.x - R * 0.18, e.y - R * 0.2, R * 0.05, e.x, e.y, R * 0.86);
  gi.addColorStop(0, hueShift(iris, 0, 0.7, 1.4));
  gi.addColorStop(0.55, iris);
  gi.addColorStop(1, shadeColor(iris, -0.45));
  c.fillStyle = gi; c.beginPath(); c.arc(e.x, e.y, R * 0.86, 0, Math.PI * 2); c.fill();
  if (R > 4) {
    c.save(); c.beginPath(); c.arc(e.x, e.y, R * 0.86, 0, Math.PI * 2); c.clip();
    c.strokeStyle = shadeColor(iris, -0.4); c.globalAlpha = 0.35; c.lineWidth = Math.max(0.4, R * 0.07);
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2;
      c.beginPath();
      c.moveTo(e.x + Math.cos(a) * R * 0.3, e.y + Math.sin(a) * R * 0.3);
      c.lineTo(e.x + Math.cos(a) * R * 0.86, e.y + Math.sin(a) * R * 0.86);
      c.stroke();
    }
    c.restore();
  }
  // Pupille
  c.fillStyle = "#080a0e";
  c.beginPath(); c.arc(e.x + R * 0.05, e.y + R * 0.03, R * 0.44, 0, Math.PI * 2); c.fill();
  // Hornhaut: ein breiter, sehr schwacher Bogen ueber dem GANZEN Auge …
  const gc = c.createRadialGradient(e.x - R * 0.35, e.y - R * 0.45, 0, e.x - R * 0.2, e.y - R * 0.2, R * 1.1);
  gc.addColorStop(0, "rgba(255,255,255,0.30)"); gc.addColorStop(0.55, "rgba(255,255,255,0.05)");
  gc.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = gc; c.beginPath(); c.arc(e.x, e.y, R, 0, Math.PI * 2); c.fill();
  // … und darauf EIN kleiner, harter Reflex. Klein ist hier alles.
  if (R > 2.4) {
    c.fillStyle = "rgba(255,255,255,0.92)";
    c.beginPath(); c.ellipse(e.x - R * 0.3, e.y - R * 0.36, R * 0.17, R * 0.13, -0.5, 0, Math.PI * 2); c.fill();
  }
  // Gegenlicht am unteren Rand — das laesst die Kugel rund werden
  if (R > 3.5) {
    c.strokeStyle = "rgba(190,225,240,0.4)"; c.lineWidth = Math.max(0.4, R * 0.1);
    c.beginPath(); c.arc(e.x, e.y, R * 0.82, 0.45, 1.9); c.stroke();
  }
}

// Muster, in beiden realistischen Entwuerfen dieselbe Anatomie, nur anders
// aufgetragen. `weich` = D (Naturbuch, klare Kanten), `false` = E (Fotoecht).
function realMuster(c, art, L, Hh, phase, biege, weich) {
  c.save();
  koerperPfad(c, art, L, Hh, phase, biege); c.clip();
  if (art.muster === "streifen-quer") {
    // Hecht: helle, unregelmaessige Baender mit ausgefransten Raendern —
    // beim echten Hecht sind es Punktreihen, die zu Baendern verschmelzen.
    for (let i = 0; i < 9; i++) {
      const t = -0.92 + i * 0.2 + (prnd(i, 51) - 0.5) * 0.06;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const n = weich ? 1 : 5;
      for (let j = 0; j < n; j++) {
        const jy = n === 1 ? 0 : (j / (n - 1) - 0.5) * 1.7;
        const yy = a.y + jy * a.ho * 0.9;
        c.globalAlpha = weich ? 0.5 : 0.30 + prnd(i * 5 + j, 52) * 0.3;
        c.fillStyle = art.akzent;
        c.save(); c.translate(a.x, yy);
        c.beginPath();
        c.ellipse(0, 0, L * (weich ? 0.035 : 0.028), a.ho * (weich ? 0.85 : 0.22), 0.12, 0, Math.PI * 2);
        c.fill(); c.restore();
      }
    }
  } else if (art.muster === "streifen-schraeg") {
    for (let i = 0; i < 7; i++) {
      const t = -0.8 + i * 0.28;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      c.globalAlpha = weich ? 0.85 : 0.7;
      c.fillStyle = art.akzent;
      c.save(); c.translate(a.x, a.y); c.rotate(0.22);
      c.fillRect(-L * 0.055, -Hh * 1.4, L * 0.11, Hh * 2.8);
      c.restore();
    }
    c.globalAlpha = 1;
  } else if (art.muster === "flecken-orange") {
    for (let i = 0; i < 16; i++) {
      const t = -0.88 + prnd(i, 3) * 1.65;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const yy = a.y + (prnd(i, 4) - 0.5) * (a.ho + a.hu) * 0.9;
      const r = Hh * (0.08 + prnd(i, 5) * 0.09);
      if (weich) {
        c.globalAlpha = 0.8; c.fillStyle = art.akzent;
        c.beginPath(); c.arc(a.x, yy, r, 0, Math.PI * 2); c.fill();
        c.globalAlpha = 0.5; c.strokeStyle = shadeColor(art.akzent, -0.4);
        c.lineWidth = Math.max(0.5, L * 0.008); c.stroke();
      } else {
        const g = c.createRadialGradient(a.x, yy, 0, a.x, yy, r * 1.25);
        g.addColorStop(0, rgba(art.akzent, 0.85)); g.addColorStop(0.6, rgba(art.akzent, 0.45));
        g.addColorStop(1, rgba(art.akzent, 0));
        c.fillStyle = g; c.beginPath(); c.arc(a.x, yy, r * 1.25, 0, Math.PI * 2); c.fill();
        // heller Hof, wie ihn Plattfische wirklich haben
        c.strokeStyle = "rgba(255,240,220,0.22)"; c.lineWidth = Math.max(0.4, L * 0.006);
        c.beginPath(); c.arc(a.x, yy, r * 1.35, 0, Math.PI * 2); c.stroke();
      }
    }
    c.globalAlpha = 1;
  } else if (art.muster === "warzen") {
    for (let i = 0; i < 14; i++) {
      const t = -0.75 + prnd(i, 8) * 1.5;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const yy = a.y + (prnd(i, 9) - 0.6) * (a.ho + a.hu) * 0.8;
      const r = Hh * (0.05 + prnd(i, 10) * 0.07);
      const g = c.createRadialGradient(a.x - r * 0.4, yy - r * 0.5, 0, a.x, yy, r);
      g.addColorStop(0, rgba(art.belly, 0.55)); g.addColorStop(0.7, "rgba(0,0,0,0.05)");
      g.addColorStop(1, "rgba(0,0,0,0.28)");
      c.fillStyle = g; c.beginPath(); c.arc(a.x, yy, r, 0, Math.PI * 2); c.fill();
    }
  } else if (art.muster === "neonband") {
    const g = c.createLinearGradient(0, -Hh * 0.55, 0, Hh * 0.1);
    g.addColorStop(0, rgba(art.color, 0)); g.addColorStop(0.45, rgba(art.color, 0.95));
    g.addColorStop(1, rgba(art.color, 0));
    c.fillStyle = g; c.fillRect(-L, -Hh, L * 2, Hh * 1.2);
    const g2 = c.createLinearGradient(0, Hh * 0.05, 0, Hh);
    g2.addColorStop(0, rgba(art.akzent, 0)); g2.addColorStop(0.55, rgba(art.akzent, 0.9));
    g2.addColorStop(1, rgba(art.akzent, 0.1));
    c.fillStyle = g2;
    bauchZone(c, art, L, Hh, phase, biege, 0.5, 0); c.fill();
  } else if (art.muster === "schuppen" && !weich) {
    // Brasse: ein bronzener Schimmer ueber der Flanke, kein Muster
    const g = c.createLinearGradient(-L, -Hh, L, Hh);
    g.addColorStop(0, rgba(art.akzent, 0)); g.addColorStop(0.45, rgba(art.akzent, 0.28));
    g.addColorStop(1, rgba(art.akzent, 0));
    c.fillStyle = g; c.fillRect(-L, -Hh, L * 2, Hh * 2);
  }
  c.restore();
}

// Kiemendeckel: eine Platte mit Lichtkante, darunter der dunkle Spalt.
function kiemendeckel(c, art, L, Hh, phase, biege, echt) {
  if (L < 12) return;
  const t = art.kiemeT;
  const a = ankerAt(art, L, Hh, t, phase, biege);
  c.save(); koerperPfad(c, art, L, Hh, phase, biege); c.clip();
  // Schatten HINTER der Platte
  const g = c.createLinearGradient(a.x - L * 0.14, 0, a.x + L * 0.02, 0);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,10,20,0.26)");
  c.fillStyle = g; c.fillRect(a.x - L * 0.16, -Hh * 1.1, L * 0.18, Hh * 2.2);
  // die Kante selbst
  c.strokeStyle = shadeColor(art.color, -0.42);
  c.lineWidth = Math.max(0.8, L * (echt ? 0.02 : 0.03));
  c.beginPath();
  c.moveTo(a.x + L * 0.02, a.y - a.ho * 0.96);
  c.quadraticCurveTo(a.x - L * 0.055, a.y, a.x + L * 0.05, a.y + a.hu * 0.9);
  c.stroke();
  c.strokeStyle = "rgba(255,255,255,0.3)"; c.lineWidth = Math.max(0.5, L * 0.012);
  c.beginPath();
  c.moveTo(a.x + L * 0.04, a.y - a.ho * 0.9);
  c.quadraticCurveTo(a.x - L * 0.035, a.y, a.x + L * 0.07, a.y + a.hu * 0.84);
  c.stroke();
  if (art.kiemenSpalten) {                     // Hai: fuenf Spalten
    c.strokeStyle = "rgba(10,20,30,0.5)"; c.lineWidth = Math.max(0.6, L * 0.014);
    for (let i = 0; i < art.kiemenSpalten; i++) {
      const tt = t - i * 0.045;
      const b = ankerAt(art, L, Hh, tt, phase, biege);
      c.beginPath();
      c.moveTo(b.x, b.y - b.ho * 0.55);
      c.quadraticCurveTo(b.x - L * 0.015, b.y, b.x + L * 0.005, b.y + b.hu * 0.3);
      c.stroke();
    }
  }
  c.restore();
}

// =============================================================================
// D — NATURBUCH
// =============================================================================
// HALTUNG
//   Die Tafel aus einem Bestimmungsbuch. Korrekte Anatomie, sauber gesetzte
//   Zeichnung, ruhige Modellierung, ein feiner dunkler Strich nur dort, wo er
//   etwas TRENNT — Flossenkante, Kiemendeckel, Maul. Kein Zauber, kein Glanz.
// SILHOUETTE  die echte der Art, nichts uebertrieben.
// KANTE       ein duenner, gleichmaessiger Strich in einem sehr dunklen Ton
//             der Koerperfarbe. Er umschliesst NICHT den ganzen Fisch, sondern
//             nur Flossen und Kopfteile.
// LICHT       flach und diffus, wie in einem Buch: leichte Gegenschattierung,
//             ein schmaler Rueckenkamm-Schatten, ein zurueckhaltender Bauchsaum.
// PALETTE     die Naturfarbe der Art, leicht abgedunkelt, ohne Buntheit.
// AUGE        anatomisch: Iris in Naturfarbe mit Streifung, runde Pupille,
//             ein kleiner Reflex. Deutlich kleiner als heute.
// FLOSSEN     mit ausgezaehlten Strahlen. Das ist der Punkt, an dem eine
//             Zeichnung „gekonnt" statt „gemacht" aussieht.
function naturbuchFisch(c, art0, x, y, L, dir, phase, opts = {}) {
  const art = Object.assign({}, art0, {
    color: hueShift(art0.color, 0, 0.78, 0.94),
    belly: hueShift(art0.belly, 0, 0.62, 1.0),
    fin: hueShift(art0.fin, 0, 0.7, 0.92),
    akzent: hueShift(art0.akzent, 0, 0.82, 0.95)
  });
  const Hh = L * art.h * 0.5;
  const biege = opts.biege == null ? 0.15 : opts.biege;
  const tinte = shadeColor(art.color, -0.62);
  c.save(); c.translate(x, y); c.scale(dir >= 0 ? 1 : -1, 1);

  const flosse = (pfad, f, seite, farbe) => {
    pfad(); c.fillStyle = farbe; c.fill();
    if (L >= 16 && f) strahlen(c, art, L, Hh, phase, biege, f, seite, shadeColor(farbe, -0.35), Math.round(clamp(L / 6, 4, 14)));
    if (L >= 12) { pfad(); c.strokeStyle = tinte; c.globalAlpha = 0.55; c.lineWidth = Math.max(0.5, L * 0.014); c.stroke(); c.globalAlpha = 1; }
  };

  flosse(() => brustPfad(c, art, L, Hh, phase, biege, -1), null, 0, shadeColor(art.fin, -0.3));
  flosse(() => schwanzPfad(c, art, L, Hh, phase, biege), null, 0, art.fin);
  if (L >= 16) {   // Strahlen im Schwanz von Hand, er hat keinen Flossen-Datensatz
    const a = ankerAt(art, L, Hh, -1, phase, biege);
    const w = L * art.schwanzW, s = Hh * art.schwanzH;
    // GECLIPPT auf die Flossenform. Ohne das laufen die Strahlen durch die
    // Kerbe der Gabelflosse hindurch und der Schwanz sieht zerfasert aus —
    // in der ersten Fassung war genau das der auffaelligste Fehler.
    c.save(); schwanzPfad(c, art, L, Hh, phase, biege); c.clip();
    c.strokeStyle = shadeColor(art.fin, -0.35); c.globalAlpha = 0.4;
    c.lineWidth = Math.max(0.5, L * 0.011);
    for (let i = -4; i <= 4; i++) {
      c.beginPath(); c.moveTo(a.x, a.y);
      c.quadraticCurveTo(a.x - w * 0.5, a.y + i * s * 0.11, a.x - w * 0.95, a.y + i * s * 0.24);
      c.stroke();
    }
    c.restore();
  }
  for (const f of rueckenFlossen(art)) flosse(() => rueckenPfad(c, f, art, L, Hh, phase, biege), f, -1, art.fin);
  for (const f of afterFlossen(art)) flosse(() => afterPfad(c, f, art, L, Hh, phase, biege), f, 1, art.fin);

  // Koerper: ruhige Gegenschattierung
  const koerper = () => koerperPfad(c, art, L, Hh, phase, biege);
  const g = c.createLinearGradient(0, -Hh, 0, Hh);
  g.addColorStop(0, shadeColor(art.color, -0.24));
  g.addColorStop(0.28, art.color);
  g.addColorStop(0.62, lerpColor(art.color, art.belly, 0.55));
  g.addColorStop(0.86, art.belly);
  g.addColorStop(1, shadeColor(art.belly, -0.1));
  koerper(); c.fillStyle = g; c.fill();

  c.save(); koerper(); c.clip();
  if (art.schuppen && art.schuppen !== "keine" && L >= 22) {
    c.globalAlpha = 0.28;
    c.fillStyle = schuppenMuster(c, art, Hh * (art.schuppen === "gross" ? 0.34 : 0.2),
                                 "rgba(255,255,255,0.5)", "rgba(0,0,0,0.4)");
    c.fillRect(-L, -Hh, L * 2, Hh * 2);
    c.globalAlpha = 1;
  }
  realMuster(c, art, L, Hh, phase, biege, true);
  if (art.seitenlinie != null && L >= 16) {
    c.strokeStyle = tinte; c.globalAlpha = 0.32; c.lineWidth = Math.max(0.5, L * 0.008);
    const li = zonenLinie(art, L, Hh, phase, biege, art.seitenlinie, 0.03);
    c.beginPath(); kurveDurch(c, li, false); c.stroke(); c.globalAlpha = 1;
  }
  c.restore();
  kiemendeckel(c, art, L, Hh, phase, biege, false);

  // Kontur nur an Kopf und Ruecken — nicht rundherum
  if (L >= 12) {
    c.save(); c.strokeStyle = tinte; c.globalAlpha = 0.45;
    c.lineWidth = Math.max(0.6, L * 0.016);
    koerper(); c.stroke(); c.restore();
  }

  flosse(() => brustPfad(c, art, L, Hh, phase, biege, 1), null, 0, art.fin);

  if (L >= 10) {
    const m = maulPfad(c, art, L, Hh, phase, biege, 1);
    if (art.raubtier) {
      c.beginPath();
      c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.55), m.wy + m.oeff * 0.9, m.sx - L * 0.01, m.sy + m.oeff * 0.75);
      c.closePath();
      c.fillStyle = "#3a1a1e"; c.fill();
      if (L >= 18) {
        c.save(); c.clip(); c.fillStyle = "#f0efe4";
        const n = 6, zw = Math.abs(m.wx - m.sx) / (n * 2.6);
        for (let i = 0; i < n; i++) {
          const k = (i + 0.5) / n;
          const tx = lerp(m.sx, m.wx, k), ty = lerp(m.sy, m.wy, k) - m.oeff * 0.4 * Math.sin(k * Math.PI);
          c.beginPath(); c.moveTo(tx - zw, ty); c.lineTo(tx + zw, ty); c.lineTo(tx, ty + m.oeff * 0.5); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(tx - zw, ty + m.oeff * 0.9); c.lineTo(tx + zw, ty + m.oeff * 0.9); c.lineTo(tx, ty + m.oeff * 0.42); c.closePath(); c.fill();
        }
        c.restore();
      }
      c.strokeStyle = tinte; c.lineWidth = Math.max(0.6, L * 0.016);
      c.beginPath(); c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy); c.stroke();
    } else {
      c.strokeStyle = tinte; c.lineWidth = Math.max(0.6, L * 0.018); c.lineCap = "round";
      c.beginPath(); c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy); c.stroke();
    }
  }
  if (art.angel) realAngel(c, art, L, Hh, phase, biege, art0.akzent);
  for (const e of augeOrte(art, L, Hh, phase, biege)) echtesAuge(c, { x: e.x, y: e.y, r: Math.max(1.2, e.r * 0.8) }, art, L, true);
  c.restore();
}

function realAngel(c, art, L, Hh, phase, biege, akzent) {
  const a = ankerAt(art, L, Hh, 0.45, phase, biege);
  const bx = a.x + L * 0.55 + Math.sin(phase * 0.8) * L * 0.05, by = a.y - a.ho - Hh * 1.05;
  c.save();
  c.strokeStyle = shadeColor(art.fin, -0.2); c.lineWidth = Math.max(0.9, L * 0.03); c.lineCap = "round";
  c.beginPath(); c.moveTo(a.x, a.y - a.ho * 0.95); c.quadraticCurveTo(a.x + L * 0.2, by - Hh * 0.4, bx, by); c.stroke();
  const gg = c.createRadialGradient(bx, by, 0, bx, by, Hh * 0.9);
  gg.addColorStop(0, rgba(akzent, 0.95)); gg.addColorStop(0.22, rgba(akzent, 0.55));
  gg.addColorStop(1, rgba(akzent, 0));
  c.fillStyle = gg; c.beginPath(); c.arc(bx, by, Hh * 0.9, 0, Math.PI * 2); c.fill();
  c.restore();
}

// =============================================================================
// E — FOTOECHT
// =============================================================================
// HALTUNG
//   So weit Richtung Foto, wie Canvas 2D kommt. Das ist ausdruecklich der
//   Entwurf, der NICHT zum uebrigen Spiel passt — er soll zeigen, wo die
//   Obergrenze liegt, damit man sie kennt.
//
//   Was ihn traegt, sind sieben Dinge, die dem heutigen Fisch alle fehlen:
//     1. eine Schuppentextur, die dem Koerper folgt (Muster statt Boegen)
//     2. NASSER Glanz: ein schmales, hartes Glanzband ueber der Flanke,
//        nicht der weiche Fleck von heute
//     3. Schillern: drei breite, farbverschobene Baender additiv uebereinander
//     4. Streulicht an duennen Stellen (Flossenansaetze, Bauchkante)
//     5. Verschattung dort, wo eine Flosse den Koerper trifft
//     6. Flossenstrahlen mit durchscheinender Membran dazwischen
//     7. ein echtes Auge: Hornhautkugel mit Reflex OBEN DRAUF, Iris darunter
// KANTE       keine gezeichnete. Nur ein schmales Kantenlicht am Ruecken und
//             ein dunkler Saum am Bauch.
// PALETTE     die Naturfarbe, aber mit Temperaturspreizung: Ruecken kuehl,
//             Flanke neutral, Bauch warm. Das ist der Unterschied zwischen
//             „gefaerbt" und „beleuchtet".
function fotoFisch(c, art0, x, y, L, dir, phase, opts = {}) {
  const art = Object.assign({}, art0);
  const Hh = L * art.h * 0.5;
  const biege = opts.biege == null ? 0.17 : opts.biege;
  c.save(); c.translate(x, y); c.scale(dir >= 0 ? 1 : -1, 1);

  // --- Flossen: Membran mit Strahlen ---------------------------------------
  const membran = (pfad, f, seite, basis) => {
    pfad();
    const rgbv = hexToRgb(basis);
    const g = seite === 0
      ? c.createLinearGradient(0, 0, -L * 1.3, 0)
      : c.createLinearGradient(0, 0, 0, seite * Hh * 2);
    // Die Membran ist duenn, aber nicht durchsichtig: am Ansatz voll deckend,
    // zur Kante hin noch bei gut der Haelfte. Der erste Anlauf ging auf 0,28
    // herunter — die Flossen verschwanden dann im Wasser und der Fisch sah
    // gerupft aus. Bei einem Fisch traegt die Flosse die Silhouette mit.
    g.addColorStop(0, `rgba(${rgbv[0]},${rgbv[1]},${rgbv[2]},1)`);
    g.addColorStop(0.55, `rgba(${rgbv[0]},${rgbv[1]},${rgbv[2]},0.88)`);
    g.addColorStop(1, `rgba(${rgbv[0]},${rgbv[1]},${rgbv[2]},0.6)`);
    c.fillStyle = g; c.fill();
    if (f && L >= 14) strahlen(c, art, L, Hh, phase, biege, f, seite, shadeColor(basis, -0.4), Math.round(clamp(L / 5, 5, 18)));
  };
  membran(() => brustPfad(c, art, L, Hh, phase, biege, -1), null, 0, shadeColor(art.fin, -0.35));
  membran(() => schwanzPfad(c, art, L, Hh, phase, biege), null, 0, art.fin);
  if (L >= 14) {
    const a = ankerAt(art, L, Hh, -1, phase, biege);
    const w = L * art.schwanzW, s = Hh * art.schwanzH;
    c.save(); schwanzPfad(c, art, L, Hh, phase, biege); c.clip();
    c.strokeStyle = shadeColor(art.fin, -0.42); c.globalAlpha = 0.45;
    c.lineWidth = Math.max(0.4, L * 0.009);
    for (let i = -6; i <= 6; i++) {
      c.beginPath(); c.moveTo(a.x, a.y);
      c.quadraticCurveTo(a.x - w * 0.5, a.y + i * s * 0.075, a.x - w * 0.95, a.y + i * s * 0.165);
      c.stroke();
    }
    c.restore();
  }
  for (const f of rueckenFlossen(art)) membran(() => rueckenPfad(c, f, art, L, Hh, phase, biege), f, -1, art.fin);
  for (const f of afterFlossen(art)) membran(() => afterPfad(c, f, art, L, Hh, phase, biege), f, 1, art.fin);

  // --- Koerper --------------------------------------------------------------
  const koerper = () => koerperPfad(c, art, L, Hh, phase, biege);
  // Temperaturspreizung: Ruecken kuehl, Bauch warm
  const g = c.createLinearGradient(0, -Hh * 1.02, 0, Hh * 1.02);
  g.addColorStop(0.00, hueShift(art.color, -14, 0.7, 1.28));
  g.addColorStop(0.10, hueShift(art.color, -8, 0.9, 0.96));
  g.addColorStop(0.40, art.color);
  g.addColorStop(0.66, hueShift(lerpColor(art.color, art.belly, 0.5), 4, 0.85, 0.8));
  g.addColorStop(0.88, hueShift(art.belly, 10, 0.8, 1.0));
  g.addColorStop(1.00, hueShift(art.belly, 14, 0.7, 0.78));
  koerper(); c.fillStyle = g; c.fill();

  c.save(); koerper(); c.clip();
  // Schuppen
  if (art.schuppen && art.schuppen !== "keine" && L >= 16) {
    c.globalAlpha = art.schuppen === "gross" ? 0.42 : 0.3;
    c.fillStyle = schuppenMuster(c, art, Hh * (art.schuppen === "gross" ? 0.3 : 0.17),
                                 "rgba(255,255,255,0.55)", "rgba(0,0,0,0.45)");
    c.fillRect(-L, -Hh, L * 2, Hh * 2);
    c.globalAlpha = 1;
  }
  // Laengsmodellierung: Kopf und Schwanzstiel treten zurueck
  const gl = c.createLinearGradient(-L, 0, L, 0);
  gl.addColorStop(0, "rgba(4,12,20,0.34)"); gl.addColorStop(0.3, "rgba(4,12,20,0.04)");
  gl.addColorStop(0.62, "rgba(4,12,20,0)"); gl.addColorStop(0.92, "rgba(4,12,20,0.16)");
  c.fillStyle = gl; c.fillRect(-L, -Hh, L * 2, Hh * 2);
  realMuster(c, art, L, Hh, phase, biege, false);

  // Schillern: drei breite Baender in verschobenen Farbtoenen, additiv
  if (L >= 14) {
    c.save(); c.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const hy = -Hh * 0.5 + i * Hh * 0.45;
      const gi = c.createLinearGradient(-L, hy - Hh * 0.3, L * 0.6, hy + Hh * 0.5);
      const ton = hueShift(art.color, -60 + i * 70, 0.9, 1.5);
      gi.addColorStop(0, rgba(ton, 0));
      gi.addColorStop(0.45, rgba(ton, 0.13));
      gi.addColorStop(1, rgba(ton, 0));
      c.fillStyle = gi; c.fillRect(-L, -Hh, L * 2, Hh * 2);
    }
    c.restore();
  }
  // NASSER GLANZ: ein schmales hartes Band, das der Ruecken-Woelbung folgt.
  // Genau das unterscheidet eine nasse von einer matten Oberflaeche.
  {
    const li = zonenLinie(art, L, Hh, phase, biege, 0.2, 0.02);
    const li2 = zonenLinie(art, L, Hh, phase, biege, 0.34, 0.02);
    c.save();
    c.beginPath(); kurveDurch(c, li.concat(li2.slice().reverse()), true);
    const gw = c.createLinearGradient(-L, 0, L, 0);
    gw.addColorStop(0, "rgba(255,255,255,0)");
    gw.addColorStop(0.35, "rgba(255,255,255,0.42)");
    gw.addColorStop(0.6, "rgba(255,255,255,0.18)");
    gw.addColorStop(0.85, "rgba(255,255,255,0.36)");
    gw.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = gw; c.fill();
    c.restore();
  }
  // Kernschatten und Reflexlicht am Bauch
  const gk = c.createLinearGradient(0, Hh * 0.1, 0, Hh * 1.02);
  gk.addColorStop(0, "rgba(0,0,0,0)"); gk.addColorStop(0.55, "rgba(4,10,18,0.24)");
  gk.addColorStop(0.85, "rgba(150,200,225,0.16)"); gk.addColorStop(1, "rgba(170,215,235,0.3)");
  c.fillStyle = gk; c.fillRect(-L, 0, L * 2, Hh * 1.1);
  // Verschattung, wo Flossen ansetzen (Umgebungsverdeckung)
  for (const f of rueckenFlossen(art)) {
    const am = ankerAt(art, L, Hh, (f.t0 + f.t1) / 2, phase, biege);
    const ga = c.createRadialGradient(am.x, am.oben, 0, am.x, am.oben, L * 0.3);
    ga.addColorStop(0, "rgba(0,8,16,0.3)"); ga.addColorStop(1, "rgba(0,8,16,0)");
    c.fillStyle = ga; c.fillRect(-L, -Hh, L * 2, Hh * 2);
  }
  // Seitenlinie: eine Reihe feiner Poren, nicht ein Strich
  if (art.seitenlinie != null && L >= 24) {
    const li = zonenLinie(art, L, Hh, phase, biege, art.seitenlinie, 0.03);
    c.save(); c.globalAlpha = 0.3;
    c.strokeStyle = shadeColor(art.color, -0.5); c.lineWidth = Math.max(0.5, L * 0.007);
    c.setLineDash([L * 0.018, L * 0.022]);
    c.beginPath(); kurveDurch(c, li, false); c.stroke();
    c.restore();
  }
  c.restore();

  kiemendeckel(c, art, L, Hh, phase, biege, true);

  // Kantenlicht am Ruecken — ersetzt jede Kontur
  if (L >= 12) {
    c.save();
    const ob = koerperPunkte(art, L, Hh, phase, biege).oben;
    c.beginPath(); kurveDurch(c, ob, false);
    c.strokeStyle = "rgba(215,240,255,0.5)"; c.lineWidth = Math.max(0.6, L * 0.014);
    c.stroke();
    c.restore();
  }

  membran(() => brustPfad(c, art, L, Hh, phase, biege, 1), null, 0, art.fin);

  if (L >= 10) {
    const m = maulPfad(c, art, L, Hh, phase, biege, 1);
    if (art.raubtier) {
      c.beginPath();
      c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.55), m.wy + m.oeff * 0.9, m.sx - L * 0.01, m.sy + m.oeff * 0.75);
      c.closePath();
      const gm = c.createLinearGradient(m.sx, 0, m.wx, 0);
      gm.addColorStop(0, "#5a2028"); gm.addColorStop(1, "#150a0e");
      c.fillStyle = gm; c.fill();
      if (L >= 16) {
        c.save(); c.clip();
        const n = 7;
        for (let i = 0; i < n; i++) {
          const k = (i + 0.5) / n;
          const tx = lerp(m.sx, m.wx, k), ty = lerp(m.sy, m.wy, k) - m.oeff * 0.4 * Math.sin(k * Math.PI);
          const zw = Math.abs(m.wx - m.sx) / (n * 2.8);
          const gz = c.createLinearGradient(0, ty, 0, ty + m.oeff * 0.6);
          gz.addColorStop(0, "rgba(250,250,242,0.98)"); gz.addColorStop(1, "rgba(190,200,196,0.55)");
          c.fillStyle = gz;
          c.beginPath(); c.moveTo(tx - zw, ty); c.lineTo(tx + zw, ty); c.lineTo(tx, ty + m.oeff * 0.62); c.closePath(); c.fill();
          c.beginPath(); c.moveTo(tx - zw, ty + m.oeff * 0.95); c.lineTo(tx + zw, ty + m.oeff * 0.95); c.lineTo(tx, ty + m.oeff * 0.42); c.closePath(); c.fill();
        }
        c.restore();
      }
    } else {
      // Lippe mit Dicke: ein dunkler Spalt und darunter eine Lichtkante
      c.strokeStyle = "rgba(10,16,22,0.45)"; c.lineWidth = Math.max(0.7, L * 0.02); c.lineCap = "round";
      c.beginPath(); c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy); c.stroke();
      c.strokeStyle = "rgba(255,240,230,0.3)"; c.lineWidth = Math.max(0.4, L * 0.009);
      c.beginPath(); c.moveTo(m.sx, m.sy + L * 0.012);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5 + L * 0.012, m.wx, m.wy + L * 0.008); c.stroke();
    }
  }
  if (art.angel) realAngel(c, art, L, Hh, phase, biege, art.akzent);
  for (const e of augeOrte(art, L, Hh, phase, biege)) echtesAuge(c, { x: e.x, y: e.y, r: Math.max(1.1, e.r * 0.82) }, art, L, false);
  c.restore();
}
