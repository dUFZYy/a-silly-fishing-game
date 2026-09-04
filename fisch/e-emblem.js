// =============================================================================
// ENTWURF E — „EMBLEM"
// =============================================================================
// HALTUNG
//   Plakat. Drei Flaechen und Schluss, dazu genau EIN Akzent. Der Fisch wird
//   nicht dargestellt, er wird BEHAUPTET: die Silhouette ist ueberzeichnet,
//   die Zeichnung auf ein Zeichen reduziert. Das ist erwachsen ohne duester
//   zu sein — dieselbe Haltung, aus der ein gutes Vereinswappen oder ein
//   Nationalpark-Plakat lebt.
//
// SILHOUETTE   UEBERZEICHNET, und zwar je nach Art in eine andere Richtung:
//              der Raeuber wird laenger und spitzer, der hochrueckige Fisch
//              hoeher und runder, der Plattfisch flacher. Das ist der stille
//              Hebel gegen „kindlich": nicht der grosse Kopf mit dem runden
//              Bauch (die Niedlichkeitsformel), sondern die eigenwillige,
//              artgerechte Proportion.
// KANTE        keine. Und keine Verlaeufe. Was aussieht wie eine Kante, ist
//              der Sprung zwischen zwei Werten.
// LICHT        gibt es nicht. Es gibt HELL und DUNKEL, drei Stufen, weit
//              auseinander. Die Rueckenflaeche ist der dunkelste Wert im
//              Bild, die Bauchflaeche der hellste — das reicht fuer Volumen.
// PALETTE      drei Werte einer entsaettigten Farbe plus EIN Akzent in voller
//              Saettigung, der pro Art an einer ANDEREN Stelle sitzt (Auge,
//              Kiemenkeil, Schwanzsaum, Flossenspitze, Streifen). Diese
//              Wanderung ist das, was die Arten unterscheidbar macht, wenn
//              sonst alles Flaeche ist.
// AUGE         eine dunkle Mandel mit einem hellen Keil — abstrakt, nicht
//              anatomisch, und deutlich kleiner als heute. Es ist der Punkt,
//              an dem sich zwei Flaechen treffen, nicht ein aufgesetztes Ding.
// FLOSSEN      grosse, entschiedene Formen im dunkelsten Wert. Keine Strahlen,
//              keine Membran, keine Transparenz.
// MUSTER       hoechstens EINE zusaetzliche Flaeche. Bei kleinen Groessen
//              faellt auch die weg.

// Die Ueberzeichnung: welche Art wird in welche Richtung uebertrieben?
const E_UEBER = {
  spindel: { sx: 1.14, sy: 0.86 },   // Raeuber: laenger, flacher
  hoch:    { sx: 0.92, sy: 1.16 },   // Friedfisch: hoeher, kuerzer
  platt:   { sx: 1.06, sy: 0.82 },   // Plattfisch: noch flacher
  klotz:   { sx: 0.94, sy: 1.10 },   // Lauerjaeger: noch klotziger
  hai:     { sx: 1.12, sy: 0.90 },
  winzig:  { sx: 0.96, sy: 1.04 },
  rund:    { sx: 1.0,  sy: 1.0 }
};

// Wo sitzt der Akzent? Pro Art woanders — das ist die Systematik dieses
// Entwurfs und zugleich seine Merkhilfe fuer den Spieler.
const E_AKZENT = {
  hecht: "kiemenkeil", brasse: "schwanzsaum", scholle: "tupfen",
  anglerfisch: "koeder", kaiserfisch: "streifen", neonfisch: "band", hai: "auge"
};

function emblemFisch(c, art0, x, y, L, dir, phase, opts = {}) {
  const P = palE(art0);
  const u = E_UEBER[art0.form] || E_UEBER.rund;
  const art = Object.assign({}, art0);
  const Hh = L * art.h * 0.5 * u.sy;
  const LL = L * u.sx;
  const biege = opts.biege == null ? 0.13 : opts.biege;
  c.save();
  c.translate(x, y);
  c.scale(dir >= 0 ? 1 : -1, 1);

  const flaeche = (pfad, farbe) => { pfad(); c.fillStyle = farbe; c.fill(); };
  const akz = E_AKZENT[art.id];

  // 1. Flossen: alle im dunkelsten Wert, als grosse Formen
  flaeche(() => brustPfad(c, art, LL, Hh, phase, biege, -1), P.dunkel);
  flaeche(() => schwanzPfad(c, art, LL, Hh, phase, biege), P.fin);
  for (const f of rueckenFlossen(art)) flaeche(() => rueckenPfad(c, f, art, LL, Hh, phase, biege), P.fin);
  for (const f of afterFlossen(art)) flaeche(() => afterPfad(c, f, art, LL, Hh, phase, biege), P.fin);

  if (akz === "schwanzsaum") {
    // ein schmaler Saum an der Hinterkante des Schwanzes
    c.save(); schwanzPfad(c, art, LL, Hh, phase, biege); c.clip();
    const a = ankerAt(art, LL, Hh, -1, phase, biege);
    c.fillStyle = P.akzent;
    c.fillRect(a.x - LL * (art.schwanzW || 0.42) * 1.4, -Hh * 3, LL * (art.schwanzW || 0.42) * 0.42, Hh * 6);
    c.restore();
  }

  // 2. Der Koerper in drei Werten
  const koerper = () => koerperPfad(c, art, LL, Hh, phase, biege);
  flaeche(koerper, P.mitte);
  c.save(); koerper(); c.clip();
  rueckenZone(c, art, LL, Hh, phase, biege, 0.34, 0.14); c.fillStyle = P.dunkel; c.fill();
  bauchZone(c, art, LL, Hh, phase, biege, 0.72, 0.1); c.fillStyle = P.hell; c.fill();

  // 3. Der eine Akzent — pro Art an einer anderen Stelle
  if (akz === "kiemenkeil") {
    const a = ankerAt(art, LL, Hh, art.kiemeT, phase, biege);
    const b = ankerAt(art, LL, Hh, art.kiemeT + 0.24, phase, biege);
    c.fillStyle = P.akzent;
    c.beginPath();
    c.moveTo(a.x, a.y - a.ho); c.lineTo(b.x, b.y - b.ho * 0.9);
    c.lineTo(b.x, b.y + b.hu * 0.5); c.lineTo(a.x, a.y + a.hu * 0.2);
    c.closePath(); c.fill();
  } else if (akz === "streifen") {
    c.fillStyle = P.akzent;
    for (let i = 0; i < 3; i++) {
      const t = -0.42 + i * 0.42;
      const a = ankerAt(art, LL, Hh, t, phase, biege);
      c.beginPath();
      c.moveTo(a.x - LL * 0.09, a.y - a.ho * 1.1); c.lineTo(a.x + LL * 0.02, a.y - a.ho * 1.1);
      c.lineTo(a.x + LL * 0.16, a.y + a.hu * 1.1); c.lineTo(a.x + LL * 0.05, a.y + a.hu * 1.1);
      c.closePath(); c.fill();
    }
  } else if (akz === "tupfen" && L >= 14) {
    c.fillStyle = P.akzent;
    for (let i = 0; i < 5; i++) {
      const t = -0.6 + i * 0.32;
      const a = ankerAt(art, LL, Hh, t, phase, biege);
      const yy = a.y + (prnd(i, 71) - 0.5) * (a.ho + a.hu) * 0.7;
      c.beginPath(); c.arc(a.x, yy, Hh * 0.15, 0, Math.PI * 2); c.fill();
    }
  } else if (akz === "band") {
    c.fillStyle = P.akzent;
    const o = zonenLinie(art, LL, Hh, phase, biege, 0.58, 0);
    const uu = zonenLinie(art, LL, Hh, phase, biege, 0.86, 0);
    c.beginPath(); kurveDurch(c, o.concat(uu.slice().reverse()), true); c.fill();
  }
  c.restore();

  // 4. Maul: eine Kerbe aus dem hellsten Wert oder ein dunkler Keil
  if (L >= 12) {
    const m = maulPfad(c, art, LL, Hh, phase, biege, 1);
    c.save(); koerper(); c.clip();
    c.beginPath();
    c.moveTo(m.sx, m.sy);
    c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy);
    c.quadraticCurveTo(lerp(m.sx, m.wx, 0.55), m.wy + m.oeff * (art.raubtier ? 0.95 : 0.3),
                       m.sx, m.sy + m.oeff * (art.raubtier ? 0.85 : 0.28));
    c.closePath();
    c.fillStyle = art.raubtier ? P.dunkel : shadeColor(P.dunkel, 0.12); c.fill();
    if (art.raubtier && L >= 22) {     // Zaehne: eine einzige Zackenreihe, hell
      c.save(); c.clip();
      c.fillStyle = P.hell;
      const n = 4, zw = Math.abs(m.wx - m.sx) / (n * 2.2);
      for (let i = 0; i < n; i++) {
        const k = (i + 0.6) / n;
        const tx = lerp(m.sx, m.wx, k), ty = lerp(m.sy, m.wy, k) - m.oeff * 0.4 * Math.sin(k * Math.PI);
        c.beginPath(); c.moveTo(tx - zw, ty); c.lineTo(tx + zw, ty); c.lineTo(tx, ty + m.oeff * 0.6); c.closePath(); c.fill();
      }
      c.restore();
    }
    c.restore();
  }

  // 5. zugewandte Brustflosse — im mittleren Wert, damit sie sich abhebt
  flaeche(() => brustPfad(c, art, LL, Hh, phase, biege, 1), shadeColor(P.dunkel, 0.16));

  // 6. Koeder
  if (art.angel) {
    const a = ankerAt(art, LL, Hh, 0.45, phase, biege);
    const bx = a.x + LL * 0.55 + Math.sin(phase * 0.8) * LL * 0.05, by = a.y - a.ho - Hh * 1.05;
    c.strokeStyle = P.dunkel; c.lineWidth = Math.max(1, LL * 0.035); c.lineCap = "round";
    c.beginPath(); c.moveTo(a.x, a.y - a.ho * 0.95); c.quadraticCurveTo(a.x + LL * 0.2, by - Hh * 0.4, bx, by); c.stroke();
    c.fillStyle = akz === "koeder" ? P.akzent : P.hell;
    c.beginPath(); c.arc(bx, by, Hh * 0.22, 0, Math.PI * 2); c.fill();
  }

  // 7. DAS AUGE: eine Mandel und ein Keil
  const e = augeOrt(art, LL, Hh, phase, biege);
  const R = Math.max(1.2, e.r * 0.72);
  c.save(); c.translate(e.x, e.y); c.rotate(-0.12);
  c.fillStyle = akz === "auge" ? P.akzent : P.dunkel;
  c.beginPath(); c.ellipse(0, 0, R * 1.22, R * 0.86, 0, 0, Math.PI * 2); c.fill();
  if (L >= 16) {
    c.fillStyle = P.hell;
    c.beginPath();
    c.moveTo(-R * 1.1, -R * 0.2); c.lineTo(-R * 0.15, -R * 0.62); c.lineTo(-R * 0.3, -R * 0.05);
    c.closePath(); c.fill();
  }
  c.restore();
  c.restore();
}
