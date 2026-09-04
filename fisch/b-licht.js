// =============================================================================
// ENTWURF B — „LICHT"
// =============================================================================
// HALTUNG
//   Volumen allein aus Licht. In diesem Entwurf gibt es KEINE EINZIGE LINIE —
//   keine Kontur, keinen Strich, keine Umrandung. Was rund aussieht, ist rund
//   geleuchtet. Das ist die direkteste Antwort auf „zu einfach": eine Kontur
//   ist eine Behauptung, Licht ist eine Beobachtung.
//
// SILHOUETTE   je Art eigen, mit weichem Auslauf nach unten: die Bauchkante
//              loest sich ins Wasser auf, statt abzuschneiden. Der Fisch hat
//              damit oben eine harte und unten eine weiche Kante — genau wie
//              ein Koerper unter Wasser mit Licht von oben.
// KANTE        keine. Der Uebergang zum Hintergrund ist Kontrast, nicht Linie.
//              Damit das klein noch traegt, ist der RUECKEN deutlich dunkler
//              als jedes Wasser, in dem der Fisch vorkommt.
// LICHT        eine Quelle, oben, leicht von vorn. Vier Baender: Kantenlicht
//              auf dem Ruecken, Mittelton, Kernschatten knapp ueber der
//              Bauchkante, Reflexlicht darunter (das Sandlicht von unten).
//              Dazu ein Laengsverlauf: Kopf und Schwanz dunkler als die Mitte.
// PALETTE      eng und entsaettigt, alles Richtung Wasserfarbe gezogen. Der
//              Akzent ist die EINZIGE gesaettigte Stelle am ganzen Fisch.
// AUGE         klein, dunkel, nass. Keine weisse Kugel, keine Comic-Blende:
//              eine dunkle Kuppel mit einer schmalen hellen Iris darunter und
//              einem laenglichen, weichen Reflex an der OBERKANTE — dort, wo
//              die Wasseroberflaeche sich spiegeln wuerde.
// FLOSSEN      Membranen: innen in Koerperfarbe, nach aussen durchsichtig.
//              Sie haben keine eigene Farbe, sie haben eine Dichte.
// MUSTER       liegt UNTER der Haut: weiche Zonen im Koerperverlauf, nie eine
//              aufgesetzte Form. Deshalb wirkt es bei jeder Groesse gleich.

function bMembran(c, pfad, farbe, L, ax, ay, bx, by, dichte) {
  const rgb = hexToRgb(farbe);
  const g = c.createLinearGradient(ax, ay, bx, by);
  g.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${dichte})`);
  g.addColorStop(0.55, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${dichte * 0.55})`);
  g.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
  pfad(); c.fillStyle = g; c.fill();
  void L;
}

function bMuster(c, art, L, Hh, phase, biege, P) {
  c.save();
  koerperPfad(c, art, L, Hh, phase, biege); c.clip();
  if (art.muster === "streifen-quer") {
    // Hecht: die hellen Baender sind LICHT auf der Flanke, kein Aufkleber.
    for (let i = 0; i < 8; i++) {
      const t = -0.9 + i * 0.22 + (prnd(i, 12) - 0.5) * 0.05;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const g = c.createRadialGradient(a.x, a.y - a.ho * 0.2, 0, a.x, a.y - a.ho * 0.2, Hh * 0.9);
      g.addColorStop(0, rgba(P.akzent, 0.34));
      g.addColorStop(1, rgba(P.akzent, 0));
      c.fillStyle = g;
      c.save(); c.translate(a.x, a.y - a.ho * 0.2); c.scale(0.32, 1.35);
      c.beginPath(); c.arc(0, 0, Hh * 0.9, 0, Math.PI * 2); c.fill(); c.restore();
    }
  } else if (art.muster === "streifen-schraeg") {
    for (let i = 0; i < 6; i++) {
      const t = -0.8 + i * 0.32;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const g = c.createLinearGradient(a.x - L * 0.14, 0, a.x + L * 0.14, 0);
      g.addColorStop(0, rgba(P.akzent, 0)); g.addColorStop(0.5, rgba(P.akzent, 0.5));
      g.addColorStop(1, rgba(P.akzent, 0));
      c.fillStyle = g;
      c.save(); c.translate(a.x, a.y); c.rotate(0.28);
      c.fillRect(-L * 0.16, -Hh * 1.3, L * 0.32, Hh * 2.6); c.restore();
    }
  } else if (art.muster === "schuppen") {
    // Schuppen als SCHIMMER, nicht als Boegen: ein feines Gitter aus Licht
    for (let r = 0; r < 6; r++) for (let i = 0; i < 9; i++) {
      const x = -L * 0.82 + i * L * 0.2 + (r % 2) * L * 0.1;
      const y = -Hh * 0.75 + r * Hh * 0.3;
      const g = c.createRadialGradient(x, y, 0, x, y, Hh * 0.16);
      g.addColorStop(0, "rgba(255,255,255,0.16)"); g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g; c.beginPath(); c.arc(x, y, Hh * 0.16, 0, Math.PI * 2); c.fill();
    }
  } else if (art.muster === "flecken-orange") {
    for (let i = 0; i < 12; i++) {
      const t = -0.85 + prnd(i, 3) * 1.6;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const y = a.y + (prnd(i, 4) - 0.5) * (a.ho + a.hu) * 0.85;
      const r = Hh * (0.11 + prnd(i, 5) * 0.09);
      const g = c.createRadialGradient(a.x, y, 0, a.x, y, r);
      g.addColorStop(0, rgba(P.akzent, 0.62)); g.addColorStop(0.6, rgba(P.akzent, 0.3));
      g.addColorStop(1, rgba(P.akzent, 0));
      c.fillStyle = g; c.beginPath(); c.arc(a.x, y, r, 0, Math.PI * 2); c.fill();
    }
  } else if (art.muster === "warzen") {
    for (let i = 0; i < 10; i++) {
      const t = -0.7 + prnd(i, 8) * 1.4;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const y = a.y + (prnd(i, 9) - 0.6) * (a.ho + a.hu) * 0.8;
      const r = Hh * (0.09 + prnd(i, 10) * 0.08);
      const g = c.createRadialGradient(a.x - r * 0.3, y - r * 0.4, 0, a.x, y, r);
      g.addColorStop(0, rgba(P.belly, 0.4)); g.addColorStop(1, "rgba(0,0,0,0.18)");
      c.fillStyle = g; c.beginPath(); c.arc(a.x, y, r, 0, Math.PI * 2); c.fill();
    }
  } else if (art.muster === "neonband") {
    const mid = zonenLinie(art, L, Hh, phase, biege, 0.44, 0);
    const g = c.createLinearGradient(0, -Hh * 0.4, 0, Hh * 0.4);
    g.addColorStop(0, rgba(art.color, 0)); g.addColorStop(0.5, rgba(art.color, 0.95));
    g.addColorStop(1, rgba(art.color, 0));
    c.fillStyle = g;
    c.beginPath(); kurveDurch(c, mid.concat(zonenLinie(art, L, Hh, phase, biege, 0.62, 0).reverse()), true); c.fill();
    const g2 = c.createLinearGradient(0, Hh * 0.3, 0, Hh);
    g2.addColorStop(0, rgba(art.akzent, 0)); g2.addColorStop(1, rgba(art.akzent, 0.9));
    c.fillStyle = g2;
    bauchZone(c, art, L, Hh, phase, biege, 0.66, 0); c.fill();
  }
  c.restore();
}

function lichtFisch(c, art0, x, y, L, dir, phase, opts = {}) {
  const P = palB(art0);
  const art = Object.assign({}, art0, P);
  const Hh = L * art.h * 0.5;
  const biege = opts.biege == null ? 0.18 : opts.biege;
  const wasser = opts.wasser || "#20506b";
  c.save();
  c.translate(x, y);
  c.scale(dir >= 0 ? 1 : -1, 1);

  // --- Flossen hinten: Membranen ohne Kontur ------------------------------
  const aT = ankerAt(art, L, Hh, -1, phase, biege);
  bMembran(c, () => brustPfad(c, art, L, Hh, phase, biege, -1), shadeColor(P.fin, -0.35), L,
           0, 0, -L * 0.4, Hh * 0.9, 0.7);
  bMembran(c, () => schwanzPfad(c, art, L, Hh, phase, biege), P.fin, L,
           aT.x, 0, aT.x - L * (art.schwanzW || 0.42) * 1.2, 0, 0.92);
  for (const f of rueckenFlossen(art))
    bMembran(c, () => rueckenPfad(c, f, art, L, Hh, phase, biege), P.fin, L, 0, 0, 0, -Hh * (1 + f.h), 0.9);
  for (const f of afterFlossen(art))
    bMembran(c, () => afterPfad(c, f, art, L, Hh, phase, biege), P.fin, L, 0, 0, 0, Hh * (1 + f.h), 0.85);

  // --- Der Koerper: vier Lichtbaender ------------------------------------
  const koerper = () => koerperPfad(c, art, L, Hh, phase, biege);
  const g = c.createLinearGradient(0, -Hh * 1.02, 0, Hh * 1.02);
  g.addColorStop(0.00, hueShift(P.color, -4, 0.7, 1.45));   // Kantenlicht Ruecken
  g.addColorStop(0.13, P.color);
  g.addColorStop(0.46, hueShift(P.color, 2, 0.85, 0.86));   // Flanke
  g.addColorStop(0.74, hueShift(P.color, -14, 0.7, 0.55));  // Kernschatten
  g.addColorStop(0.90, P.belly);
  g.addColorStop(1.00, hueShift(P.belly, -8, 0.5, 1.18));   // Reflexlicht von unten
  koerper(); c.fillStyle = g; c.fill();

  c.save(); koerper(); c.clip();
  // Laengsverlauf: Kopf und Schwanz treten zurueck, die Schulter kommt vor
  const gl = c.createLinearGradient(-L, 0, L, 0);
  gl.addColorStop(0, "rgba(6,16,26,0.30)"); gl.addColorStop(0.32, "rgba(6,16,26,0.05)");
  gl.addColorStop(0.62, "rgba(6,16,26,0)"); gl.addColorStop(1, "rgba(6,16,26,0.22)");
  c.fillStyle = gl; c.fillRect(-L * 1.1, -Hh * 1.2, L * 2.2, Hh * 2.4);
  // Schulterlicht: die einzige Stelle mit echtem Weiss, und sehr schwach
  const sx = L * 0.22, sy = -Hh * 0.48;
  const gs = c.createRadialGradient(sx, sy, 0, sx, sy, L * 0.62);
  gs.addColorStop(0, "rgba(255,255,255,0.20)"); gs.addColorStop(0.5, "rgba(255,255,255,0.06)");
  gs.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = gs; c.fillRect(-L * 1.1, -Hh * 1.2, L * 2.2, Hh * 2.4);
  // Kiemenbogen als weiche Wertkante, nicht als Strich
  if (L >= 12) {
    const a = ankerAt(art, L, Hh, art.kiemeT, phase, biege);
    const gk = c.createLinearGradient(a.x - L * 0.1, 0, a.x + L * 0.12, 0);
    gk.addColorStop(0, "rgba(0,0,0,0)"); gk.addColorStop(0.5, "rgba(0,8,16,0.20)");
    gk.addColorStop(1, "rgba(255,255,255,0.10)");
    c.fillStyle = gk; c.fillRect(a.x - L * 0.12, -Hh * 1.2, L * 0.26, Hh * 2.4);
  }
  c.restore();

  bMuster(c, art, L, Hh, phase, biege, P);

  // --- Die weiche Unterkante: der Bauch loest sich ins Wasser auf ---------
  // Das ist der eigentliche Kunstgriff dieses Entwurfs. Ohne ihn haette der
  // Fisch unten doch wieder eine harte Kante, und die ganze Haltung faellt.
  c.save(); koerper(); c.clip();
  // Der erste Anlauf stand hier bei 0,55 — damit loeste sich nicht nur die
  // Kante auf, sondern der halbe Fisch. Eine weiche Kante darf man SEHEN,
  // aber der Koerper muss stehen bleiben.
  const gw = c.createLinearGradient(0, Hh * 0.62, 0, Hh * 1.05);
  gw.addColorStop(0, rgba(wasser, 0)); gw.addColorStop(1, rgba(wasser, 0.3));
  c.fillStyle = gw; c.fillRect(-L * 1.1, 0, L * 2.2, Hh * 1.2);
  c.restore();

  // --- vordere Brustflosse ------------------------------------------------
  const bb = brustPfad(c, art, L, Hh, phase, biege, 1);
  bMembran(c, () => brustPfad(c, art, L, Hh, phase, biege, 1), P.fin, L,
           bb.x, bb.y, bb.x - bb.w, bb.y + bb.h, 0.86);

  // --- Maul: eine Wertkante, bei Raubtieren ein dunkler Spalt -------------
  if (L >= 10) {
    const m = maulPfad(c, art, L, Hh, phase, biege, 1);
    if (art.raubtier) {
      c.beginPath();
      c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.55), m.wy + m.oeff * 0.9, m.sx - L * 0.01, m.sy + m.oeff * 0.75);
      c.closePath();
      const gm = c.createLinearGradient(m.sx, 0, m.wx, 0);
      gm.addColorStop(0, "rgba(60,20,26,0.95)"); gm.addColorStop(1, "rgba(12,6,10,0.98)");
      c.fillStyle = gm; c.fill();
      if (L >= 18) {   // Zaehne als Lichtkeile, ohne Kontur
        c.save(); c.clip();
        const n = 5;
        for (let i = 0; i < n; i++) {
          const k = (i + 0.6) / n;
          const tx = lerp(m.sx, m.wx, k), ty = lerp(m.sy, m.wy, k) - m.oeff * 0.4 * Math.sin(k * Math.PI);
          const zw = Math.abs(m.wx - m.sx) / (n * 2.4);
          const gz = c.createLinearGradient(0, ty, 0, ty + m.oeff * 0.6);
          gz.addColorStop(0, "rgba(240,244,236,0.95)"); gz.addColorStop(1, "rgba(200,210,200,0.5)");
          c.fillStyle = gz;
          c.beginPath(); c.moveTo(tx - zw, ty); c.lineTo(tx + zw, ty); c.lineTo(tx, ty + m.oeff * 0.6); c.closePath(); c.fill();
        }
        c.restore();
      }
    } else {
      c.strokeStyle = "rgba(8,16,24,0.32)"; c.lineWidth = Math.max(0.8, L * 0.026); c.lineCap = "round";
      c.beginPath();
      c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy);
      c.stroke();
    }
  }

  // --- Leuchtangel --------------------------------------------------------
  if (art.angel) {
    const a = ankerAt(art, L, Hh, 0.45, phase, biege);
    const bx = a.x + L * 0.55 + Math.sin(phase * 0.8) * L * 0.05, by = a.y - a.ho - Hh * 1.05;
    c.strokeStyle = rgba(P.fin, 0.9); c.lineWidth = Math.max(0.9, L * 0.035); c.lineCap = "round";
    c.beginPath(); c.moveTo(a.x, a.y - a.ho * 0.95); c.quadraticCurveTo(a.x + L * 0.2, by - Hh * 0.4, bx, by); c.stroke();
    const gg = c.createRadialGradient(bx, by, 0, bx, by, Hh * 0.85);
    gg.addColorStop(0, rgba(art0.akzent, 0.95)); gg.addColorStop(0.28, rgba(art0.akzent, 0.5));
    gg.addColorStop(1, rgba(art0.akzent, 0));
    c.fillStyle = gg; c.beginPath(); c.arc(bx, by, Hh * 0.85, 0, Math.PI * 2); c.fill();
  }

  // --- DAS AUGE: klein, dunkel, nass --------------------------------------
  const e = augeOrt(art, L, Hh, phase, biege);
  const R = Math.max(1.2, e.r * 0.74);
  const ge = c.createRadialGradient(e.x - R * 0.3, e.y - R * 0.35, R * 0.1, e.x, e.y, R);
  ge.addColorStop(0, hueShift(P.akzent, 0, 0.7, 0.9));
  ge.addColorStop(0.45, shadeColor(art0.color, -0.62));
  ge.addColorStop(1, "rgba(6,10,16,0.98)");
  c.fillStyle = ge; c.beginPath(); c.arc(e.x, e.y, R, 0, Math.PI * 2); c.fill();
  // Reflex: ein LAENGLICHER Streifen an der Oberkante, kein Punkt
  if (L >= 14) {
    c.save(); c.translate(e.x - R * 0.1, e.y - R * 0.46); c.rotate(-0.35); c.scale(1, 0.38);
    const gr = c.createRadialGradient(0, 0, 0, 0, 0, R * 0.62);
    gr.addColorStop(0, "rgba(255,255,255,0.8)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = gr; c.beginPath(); c.arc(0, 0, R * 0.62, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  c.restore();
}
