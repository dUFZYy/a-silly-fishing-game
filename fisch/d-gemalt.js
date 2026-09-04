// =============================================================================
// ENTWURF D — „GOUACHE"   (das erwachsene Ende der Reihe)
// =============================================================================
// HALTUNG
//   Gemalt statt konstruiert. Der Koerper entsteht aus uebereinandergesetzten
//   Pinselzuegen in gebrochenen Farben; die Zuege bleiben SICHTBAR. Manche
//   laufen ueber die Silhouette hinaus, andere bleiben darunter, so dass die
//   Grundierung durchblitzt. Nichts ist symmetrisch, nichts schliesst sauber.
//
//   Das ist bewusst der Entwurf, bei dem Dustin sagen darf: zu ernst.
//   Er markiert das Ende der Achse, damit die Mitte eine Wahl wird und keine
//   Verlegenheit.
//
// SILHOUETTE   je Art eigen und ABSICHTLICH ungenau. Es gibt keine exakte
//              Kante — die Form ergibt sich daraus, wo die Zuege aufhoeren.
// KANTE        keine durchgehende Kontur. Statt dessen ein nachgezogener
//              dunkler Strich, der an drei, vier Stellen abreisst: an der
//              Ruecken-, der Kiefer- und der Schwanzstielkante. Wo er fehlt,
//              traegt der Farbsprung.
// LICHT        aus der Farbe, nicht aus dem Wert: Schatten kippen ins
//              Violette/Blaue, Lichter ins Gelbliche. Ein einziger trockener
//              heller Zug ueber dem Ruecken, eine nasse dunkle Zone am Bauch.
// PALETTE      entsaettigt und gebrochen. Kein Zug hat dieselbe Farbe wie ein
//              anderer (Streuung ±14 Grad Farbton). Der Akzent kommt genau
//              einmal vor, als kleiner satter Fleck.
// AUGE         das erwachsenste Bauteil des Prototyps: ein dunkler, leicht
//              unrunder Fleck, KEIN Ring, KEIN Weiss. Der Lichtpunkt ist ein
//              einzelner Tupfer, absichtlich NEBEN der Mitte gesetzt und
//              kleiner als ein Fuenftel des Auges.
// FLOSSEN      wenige breite Zuege, an den Enden ausfransend, halb
//              durchscheinend — Flossen sind duenn, das soll man sehen.
// MUSTER       getupft und unregelmaessig verteilt, nie gerastert. Die
//              Zeichnung ist auf einer Seite dichter als auf der anderen.

// Ein Pinselzug: ein Band mit verlaufender Breite und weichen Enden.
function pinsel(c, pts, w0, w1, farbe, alpha) {
  const n = pts.length;
  if (n < 2) return;
  const links = [], rechts = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const k = i / (n - 1);
    // Breite laeuft an beiden Enden aus (sin-Umschlag) — das ist der
    // Unterschied zwischen einem Pinselzug und einem Balken.
    const w = lerp(w0, w1, k) * Math.pow(Math.sin(Math.PI * clamp(k * 1.08 + 0.02, 0, 1)), 0.42);
    links.push([p[0] + nx * w, p[1] + ny * w]);
    rechts.push([p[0] - nx * w, p[1] - ny * w]);
  }
  c.save();
  c.globalAlpha = alpha == null ? 1 : alpha;
  c.beginPath(); kurveDurch(c, links.concat(rechts.reverse()), true);
  c.fillStyle = farbe; c.fill();
  c.restore();
}

// Eine Zugbahn entlang des Koerpers auf Hoehe `k` (0 Ruecken .. 1 Bauch),
// von t0 bis t1, mit Handzittern.
function bahn(art, L, Hh, phase, biege, k, t0, t1, salt, zit) {
  const pts = [];
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const t = lerp(t0, t1, i / n);
    const a = ankerAt(art, L, Hh, t, phase, biege);
    const y = lerp(a.y - a.ho, a.y + a.hu, clamp(k + (prnd(i, salt) - 0.5) * (zit || 0.06), 0.02, 0.98));
    pts.push([a.x + (prnd(i, salt + 3) - 0.5) * L * 0.03, y]);
  }
  return pts;
}

function dMuster(c, art, L, Hh, phase, biege, P) {
  // Die Zeichnung liegt ABSICHTLICH nicht mittig: rechts dichter als links.
  const dichte = (t) => 0.45 + 0.55 * clamp((t + 1) / 2, 0, 1);
  if (art.muster === "streifen-quer") {
    for (let i = 0; i < 9; i++) {
      const t = -0.9 + i * 0.2 + (prnd(i, 51) - 0.5) * 0.08;
      if (prnd(i, 52) > dichte(t) + 0.35) continue;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      pinsel(c, [[a.x - L * 0.02, a.y - a.ho * 0.92], [a.x + L * 0.01, a.y], [a.x + L * 0.03, a.y + a.hu * 0.45]],
             L * 0.035 * (0.7 + prnd(i, 53)), L * 0.02, P.zug(i, 0.5), 0.55 + prnd(i, 54) * 0.3);
    }
  } else if (art.muster === "streifen-schraeg") {
    for (let i = 0; i < 6; i++) {
      const t = -0.75 + i * 0.32 + (prnd(i, 55) - 0.5) * 0.07;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      pinsel(c, [[a.x - L * 0.09, a.y - a.ho * 1.0], [a.x + L * 0.04, a.y], [a.x + L * 0.17, a.y + a.hu * 1.0]],
             L * 0.05, L * 0.035, P.zug(i + 10, 0.6), 0.6 + prnd(i, 56) * 0.25);
    }
  } else if (art.muster === "schuppen") {
    // Schuppen NICHT als Raster, sondern als drei, vier angedeutete Reihen
    for (let r = 0; r < 4; r++) {
      const y0 = -Hh * 0.55 + r * Hh * 0.36;
      for (let i = 0; i < 7; i++) {
        if (prnd(r * 9 + i, 57) < 0.32) continue;
        const x = -L * 0.72 + i * L * 0.24 + (r % 2) * L * 0.12 + (prnd(i, 58) - 0.5) * L * 0.04;
        pinsel(c, [[x - Hh * 0.18, y0 + Hh * 0.06], [x, y0 - Hh * 0.06], [x + Hh * 0.18, y0 + Hh * 0.06]],
               Hh * 0.05, Hh * 0.03, P.zug(r * 7 + i, r % 2 ? 0.4 : -0.3), 0.4);
      }
    }
  } else if (art.muster === "flecken-orange") {
    for (let i = 0; i < 13; i++) {
      const t = -0.85 + prnd(i, 3) * 1.6;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const y = a.y + (prnd(i, 4) - 0.5) * (a.ho + a.hu) * 0.9;
      const r = Hh * (0.09 + prnd(i, 5) * 0.1);
      c.save(); c.globalAlpha = 0.5 + prnd(i, 61) * 0.45;
      c.fillStyle = i % 3 === 0 ? P.akzent : hueShift(art.akzent, -22, 0.6, 0.8);
      c.beginPath();
      const pts = [];
      for (let k = 0; k < 6; k++) {
        const w = k / 6 * Math.PI * 2, rr = r * (0.7 + prnd(i * 6 + k, 62) * 0.6);
        pts.push([a.x + Math.cos(w) * rr, y + Math.sin(w) * rr * 0.85]);
      }
      kurveDurch(c, pts, true); c.fill(); c.restore();
    }
  } else if (art.muster === "warzen") {
    for (let i = 0; i < 11; i++) {
      const t = -0.7 + prnd(i, 8) * 1.45;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const y = a.y + (prnd(i, 9) - 0.6) * (a.ho + a.hu) * 0.8;
      c.save(); c.globalAlpha = 0.42;
      c.fillStyle = prnd(i, 63) > 0.5 ? P.schatten : P.licht;
      c.beginPath(); c.arc(a.x, y, Hh * (0.06 + prnd(i, 10) * 0.07), 0, Math.PI * 2); c.fill(); c.restore();
    }
  } else if (art.muster === "neonband") {
    pinsel(c, bahn(art, L, Hh, phase, biege, 0.42, -0.9, 0.9, 71, 0.04), Hh * 0.3, Hh * 0.12,
           hueShift(art.color, 0, 0.85, 1.05), 0.9);
    pinsel(c, bahn(art, L, Hh, phase, biege, 0.78, -0.7, 0.75, 72, 0.05), Hh * 0.22, Hh * 0.1,
           hueShift(art.akzent, 0, 0.8, 1.0), 0.85);
  }
}

function gemaltFisch(c, art0, x, y, L, dir, phase, opts = {}) {
  const P = palD(art0);
  const art = Object.assign({}, art0, { color: P.color, belly: P.belly, fin: P.fin, akzent: P.akzent });
  const Hh = L * art.h * 0.5;
  const biege = opts.biege == null ? 0.2 : opts.biege;
  c.save();
  c.translate(x, y);
  c.scale(dir >= 0 ? 1 : -1, 1);

  // --- Flossen: wenige breite Zuege, ausfransend ---------------------------
  const flosse = (pfad, farbe, alpha) => { c.save(); c.globalAlpha = alpha; pfad(); c.fillStyle = farbe; c.fill(); c.restore(); };
  flosse(() => brustPfad(c, art, L, Hh, phase, biege, -1), P.schatten, 0.75);
  flosse(() => schwanzPfad(c, art, L, Hh, phase, biege), P.zug(2, -0.2), 0.85);
  // ueber den Schwanz ein paar Strahlen als eigene Zuege — sie geben ihm Halt
  {
    const a = ankerAt(art, L, Hh, -1, phase, biege);
    const w = L * (art.schwanzW || 0.42), s = Hh * (art.schwanzH || 1.6);
    for (let i = -2; i <= 2; i++) {
      if (i === 0 && (art.schwanz === "gabel" || art.schwanz === "sichel")) continue;
      pinsel(c, [[a.x, a.y], [a.x - w * 0.55, a.y + i * s * 0.3], [a.x - w * 0.98, a.y + i * s * 0.48]],
             L * 0.02, L * 0.012, P.zug(20 + i, 0.3), 0.4);
    }
  }
  for (const f of rueckenFlossen(art))
    flosse(() => rueckenPfad(c, f, art, L, Hh, phase, biege), P.zug(4, 0.1), 0.82);
  for (const f of afterFlossen(art))
    flosse(() => afterPfad(c, f, art, L, Hh, phase, biege), P.zug(5, -0.1), 0.8);

  // --- Grundierung: eine matte, entsaettigte Flaeche ------------------------
  // Die Grundierung stand zuerst bei Saettigung 0,45 und Helligkeit 0,9 — im
  // Wasser verschwand der Fisch damit fast. Gebrochene Farben heisst
  // verschoben, nicht blass.
  koerperPfad(c, art, L, Hh, phase, biege);
  c.fillStyle = hueShift(art0.color, -6, 0.72, 0.86); c.fill();

  // --- Die Zuege. Sie sind NICHT geclippt: das ist der ganze Punkt. --------
  // Ein Teil laeuft ueber die Silhouette hinaus, ein Teil bleibt darunter.
  const zugZahl = L >= 60 ? 9 : L >= 26 ? 6 : 4;
  for (let i = 0; i < zugZahl; i++) {
    const k = 0.12 + (i / (zugZahl - 1)) * 0.78;
    const hell = 1 - k * 1.7;                       // oben hell, unten dunkel
    const t0 = -0.95 + (prnd(i, 81) - 0.5) * 0.25;
    const t1 = 0.9 + (prnd(i, 82) - 0.5) * 0.25;
    pinsel(c, bahn(art, L, Hh, phase, biege, k, t0, t1, 90 + i, 0.05),
           Hh * (0.16 + prnd(i, 83) * 0.1), Hh * (0.1 + prnd(i, 84) * 0.08),
           P.zug(i, hell), 0.55 + prnd(i, 85) * 0.35);
  }
  // die nasse dunkle Zone am Bauch: ein einziger breiter Zug, kalt
  pinsel(c, bahn(art, L, Hh, phase, biege, 0.86, -0.8, 0.85, 101, 0.03),
         Hh * 0.3, Hh * 0.18, P.schatten, 0.6);
  // der trockene helle Zug ueber dem Ruecken — laeuft absichtlich nur ueber
  // zwei Drittel des Fisches und reisst dann ab
  pinsel(c, bahn(art, L, Hh, phase, biege, 0.14, -0.35, 0.78, 102, 0.02),
         Hh * 0.14, Hh * 0.05, P.licht, 0.55);

  dMuster(c, art, L, Hh, phase, biege, P);

  // --- Der abreissende Strich ---------------------------------------------
  // Drei Bruchstuecke, keine Kontur: Ruecken (lang), Kiefer (kurz),
  // Schwanzstiel (kurz). Farbe aus dem Motiv, nie Schwarz.
  if (L >= 12) {
    c.save();
    c.strokeStyle = P.schatten;
    c.lineCap = "round"; c.lineJoin = "round";
    const strich = (t0, t1, k, w, alpha) => {
      c.globalAlpha = alpha; c.lineWidth = Math.max(0.8, L * w);
      const pts = bahn(art, L, Hh, phase, biege, k, t0, t1, 111, 0.02);
      c.beginPath(); kurveDurch(c, pts, false); c.stroke();
    };
    strich(-0.55, 0.35, 0.005, 0.028, 0.7);      // Ruecken
    strich(0.52, 0.95, 0.72, 0.022, 0.55);       // Kiefer/Kehle
    strich(-1.0, -0.72, 0.5, 0.03, 0.5);         // Schwanzstiel
    c.restore();
  }

  // --- vordere Brustflosse -------------------------------------------------
  flosse(() => brustPfad(c, art, L, Hh, phase, biege, 1), P.zug(7, 0.2), 0.8);

  // --- Maul ----------------------------------------------------------------
  if (L >= 10) {
    const m = maulPfad(c, art, L, Hh, phase, biege, 1);
    if (art.raubtier) {
      c.beginPath();
      c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.55), m.wy + m.oeff * 0.9, m.sx - L * 0.01, m.sy + m.oeff * 0.75);
      c.closePath();
      c.fillStyle = hueShift(art0.color, -30, 0.5, 0.3); c.fill();
      if (L >= 20) {
        c.save(); c.clip();
        const n = 5;
        for (let i = 0; i < n; i++) {
          const k = (i + 0.5 + (prnd(i, 121) - 0.5) * 0.4) / n;
          const tx = lerp(m.sx, m.wx, k), ty = lerp(m.sy, m.wy, k) - m.oeff * 0.4 * Math.sin(k * Math.PI);
          pinsel(c, [[tx, ty], [tx + m.oeff * 0.06, ty + m.oeff * (0.4 + prnd(i, 122) * 0.3)]],
                 Math.abs(m.wx - m.sx) / (n * 2.6), Math.abs(m.wx - m.sx) / (n * 8),
                 hueShift("#efe6d2", 0, 0.4, 1), 0.9);
        }
        c.restore();
      }
    } else {
      c.save(); c.globalAlpha = 0.65;
      pinsel(c, [[m.sx, m.sy], [lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.4], [m.wx, m.wy]],
             L * 0.016, L * 0.01, P.schatten, 0.7);
      c.restore();
    }
  }

  // --- Leuchtangel ----------------------------------------------------------
  if (art.angel) {
    const a = ankerAt(art, L, Hh, 0.45, phase, biege);
    const bx = a.x + L * 0.55 + Math.sin(phase * 0.8) * L * 0.05, by = a.y - a.ho - Hh * 1.05;
    c.save(); c.globalAlpha = 0.85;
    c.strokeStyle = P.schatten; c.lineWidth = Math.max(0.9, L * 0.028); c.lineCap = "round";
    c.beginPath(); c.moveTo(a.x, a.y - a.ho * 0.95); c.quadraticCurveTo(a.x + L * 0.2, by - Hh * 0.4, bx, by); c.stroke();
    c.restore();
    const gg = c.createRadialGradient(bx, by, 0, bx, by, Hh * 0.8);
    gg.addColorStop(0, rgba(art0.akzent, 0.9)); gg.addColorStop(0.3, rgba(art0.akzent, 0.4));
    gg.addColorStop(1, rgba(art0.akzent, 0));
    c.fillStyle = gg; c.beginPath(); c.arc(bx, by, Hh * 0.8, 0, Math.PI * 2); c.fill();
  }

  // --- DAS AUGE: ein Fleck, kein Bauteil ------------------------------------
  const e = augeOrt(art, L, Hh, phase, biege);
  const R = Math.max(1.1, e.r * 0.68);
  c.fillStyle = hueShift(art0.color, -20, 0.55, 0.24);
  const pts = [];
  for (let k = 0; k < 6; k++) {
    const w = k / 6 * Math.PI * 2, rr = R * (0.85 + prnd(k, 131) * 0.3);
    pts.push([e.x + Math.cos(w) * rr, e.y + Math.sin(w) * rr]);
  }
  c.beginPath(); kurveDurch(c, pts, true); c.fill();
  // eine schmale Iris — nur bei grossen Groessen, und in gebrochenem Ton
  if (L >= 30) {
    c.save(); c.globalAlpha = 0.55;
    c.strokeStyle = hueShift(art0.akzent, -10, 0.7, 0.8); c.lineWidth = Math.max(0.7, R * 0.2);
    c.beginPath(); c.arc(e.x, e.y, R * 0.78, 0.6, 4.2); c.stroke(); c.restore();
  }
  // EIN Tupfer, absichtlich neben der Mitte, klein
  if (L >= 16) {
    c.fillStyle = "rgba(246,244,236,0.9)";
    c.beginPath(); c.ellipse(e.x + R * 0.28, e.y - R * 0.34, R * 0.2, R * 0.15, -0.5, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}
