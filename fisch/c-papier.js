// =============================================================================
// ENTWURF C — „PAPIERSCHNITT"
// =============================================================================
// HALTUNG
//   Der Fisch ist aus Tonpapier geschnitten und geschichtet. Jedes Teil ist
//   EINE matte Farbe, jedes liegt ueber oder unter einem anderen, und jedes
//   wirft einen kurzen harten Schatten auf das darunter. Es gibt keine
//   Verlaeufe und keine Konturen; getrennt wird durch Schatten und Farbsprung.
//
// SILHOUETTE   je Art eigen, aber mit SCHERE geschnitten: die Kanten haben
//              ein feines Zittern, Ecken sind leicht daneben. Genau das nimmt
//              dem Ganzen das Malbuchhafte — eine perfekte Kurve liest sich
//              als einfach, eine minimal krumme als gemacht.
// KANTE        keine gezeichnete. Die Kante ist die Schnittkante: dort trifft
//              eine Farbe auf einen Schatten.
// LICHT        eine einzige Richtung, oben links, und sie zeigt sich NUR als
//              Versatz der Schatten. Kein Verlauf, keine Glanzstelle.
//              Dadurch wirkt der Fisch koerperlich, ohne modelliert zu sein.
// PALETTE      Papier: entsaettigt, aufgehellt, in Achterschritten gerastert.
//              Nebeneinander liegende Schichten unterscheiden sich um eine
//              spuerbare Wertstufe — sonst verschwindet die Schichtung.
// AUGE         eine aufgeklebte dunkle Scheibe mit eigenem Schatten, darauf
//              eine kleinere in fast Schwarz. KEIN Weiss, KEIN Glanzpunkt.
//              Das Auge ist das kleinste Teil des Fisches, nicht das groesste.
// FLOSSEN      liegen sichtbar HINTER dem Koerper (die abgewandten) oder
//              DAVOR (die zugewandten), mit Schatten dazwischen. Man sieht die
//              Reihenfolge, und darin steckt die Raeumlichkeit.
// MUSTER       ausgestanzt: eigene Formen aus einem dritten Papier, an der
//              Koerperkante wirklich abgeschnitten, mit eigenem Mini-Schatten.

const C_LICHT = { dx: -0.055, dy: 0.075 };   // Schattenversatz in L

// Ein Teil legen: erst sein Schatten, dann seine Flaeche.
function cLegen(c, pfad, farbe, L, tiefe) {
  const dx = L * C_LICHT.dx * tiefe, dy = L * C_LICHT.dy * tiefe;
  c.save(); c.translate(dx, dy);
  pfad(); c.fillStyle = `rgba(24,30,38,${0.20 + 0.06 * tiefe})`; c.fill();
  c.restore();
  pfad(); c.fillStyle = farbe; c.fill();
}

// Geschnittene Koerperkante: dieselbe Anatomie, aber die Stuetzpunkte
// zittern. `salt` haengt an der Art, damit jeder Fisch seinen eigenen
// Scherenschnitt behaelt und nicht in jedem Bild neu geschnitten wird.
function cKoerperPfad(c, art, L, Hh, phase, biege, salt) {
  const { oben, unten } = koerperPunkte(art, L, Hh, phase, biege);
  const ring = zittern(oben.concat(unten.slice().reverse()), L * 0.035, salt);
  c.beginPath(); kurveDurch(c, ring, true);
}

function cMuster(c, art, L, Hh, phase, biege, P) {
  c.save();
  cKoerperPfad(c, art, L, Hh, phase, biege, 3); c.clip();
  const stanz = (pfad, farbe) => {
    c.save(); c.translate(L * C_LICHT.dx * 0.5, L * C_LICHT.dy * 0.5);
    pfad(); c.fillStyle = "rgba(24,30,38,0.16)"; c.fill(); c.restore();
    pfad(); c.fillStyle = farbe; c.fill();
  };
  if (art.muster === "streifen-quer") {
    for (let i = 0; i < 6; i++) {
      const t = -0.82 + i * 0.28;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const b = ankerAt(art, L, Hh, t + 0.11, phase, biege);
      stanz(() => {
        const pts = zittern([[a.x, a.y - a.ho * 0.95], [b.x, b.y - b.ho * 0.9],
                             [b.x + L * 0.04, b.y + b.hu * 0.3], [a.x + L * 0.03, a.y + a.hu * 0.35]],
                            L * 0.03, 20 + i);
        c.beginPath(); kurveDurch(c, pts, true);
      }, P.akzent);
    }
  } else if (art.muster === "streifen-schraeg") {
    for (let i = 0; i < 5; i++) {
      const t = -0.7 + i * 0.36;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      stanz(() => {
        const pts = zittern([[a.x - L * 0.11, a.y - a.ho * 1.05], [a.x + L * 0.04, a.y - a.ho * 1.05],
                             [a.x + L * 0.20, a.y + a.hu * 1.05], [a.x + L * 0.05, a.y + a.hu * 1.05]],
                            L * 0.025, 30 + i);
        c.beginPath(); kurveDurch(c, pts, true);
      }, P.akzent);
    }
  } else if (art.muster === "schuppen") {
    // Schuppen als einzeln gelegte Halbmonde — nur wenige, gross, versetzt.
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) {
      const x = -L * 0.66 + i * L * 0.33 + (r % 2) * L * 0.16;
      const y = -Hh * 0.42 + r * Hh * 0.44;
      stanz(() => { c.beginPath(); c.arc(x, y, Hh * 0.3, Math.PI * 0.05, Math.PI * 0.95); c.closePath(); },
            r % 2 ? P.belly : shadeColor(P.color, 0.1));
    }
  } else if (art.muster === "flecken-orange") {
    for (let i = 0; i < 9; i++) {
      const t = -0.8 + prnd(i, 3) * 1.55;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const y = a.y + (prnd(i, 4) - 0.5) * (a.ho + a.hu) * 0.85;
      const r = Hh * (0.13 + prnd(i, 5) * 0.08);
      stanz(() => {
        const pts = [];
        for (let k = 0; k < 7; k++) {
          const w = k / 7 * Math.PI * 2;
          const rr = r * (0.82 + prnd(i * 7 + k, 6) * 0.36);
          pts.push([a.x + Math.cos(w) * rr, y + Math.sin(w) * rr * 0.9]);
        }
        c.beginPath(); kurveDurch(c, pts, true);
      }, P.akzent);
    }
  } else if (art.muster === "warzen") {
    for (let i = 0; i < 7; i++) {
      const t = -0.6 + prnd(i, 8) * 1.3;
      const a = ankerAt(art, L, Hh, t, phase, biege);
      const y = a.y + (prnd(i, 9) - 0.6) * (a.ho + a.hu) * 0.75;
      stanz(() => { c.beginPath(); c.arc(a.x, y, Hh * (0.1 + prnd(i, 10) * 0.07), 0, Math.PI * 2); },
            shadeColor(P.color, -0.16));
    }
  } else if (art.muster === "neonband") {
    stanz(() => {
      const o = zittern(zonenLinie(art, L, Hh, phase, biege, 0.3, 0), L * 0.03, 40);
      const u = zittern(zonenLinie(art, L, Hh, phase, biege, 0.55, 0), L * 0.03, 41);
      c.beginPath(); kurveDurch(c, o.concat(u.slice().reverse()), true);
    }, art.color);
    stanz(() => {
      const o = zittern(zonenLinie(art, L, Hh, phase, biege, 0.68, 0), L * 0.03, 42);
      const u = zittern(zonenLinie(art, L, Hh, phase, biege, 0.94, 0), L * 0.03, 43);
      c.beginPath(); kurveDurch(c, o.concat(u.slice().reverse()), true);
    }, art.akzent);
  }
  c.restore();
}

function papierFisch(c, art0, x, y, L, dir, phase, opts = {}) {
  const P = palC(art0);
  const art = Object.assign({}, art0, P);
  const Hh = L * art.h * 0.5;
  const biege = opts.biege == null ? 0.14 : opts.biege;
  c.save();
  c.translate(x, y);
  c.scale(dir >= 0 ? 1 : -1, 1);

  // Schicht 1 (ganz hinten): abgewandte Brustflosse, dunkelstes Papier
  cLegen(c, () => brustPfad(c, art, L, Hh, phase, biege, -1), shadeColor(P.fin, -0.3), L, 1.4);
  // Schicht 2: Schwanz, Ruecken-, Afterflosse
  cLegen(c, () => schwanzPfad(c, art, L, Hh, phase, biege), P.fin, L, 1.2);
  for (const f of rueckenFlossen(art))
    cLegen(c, () => rueckenPfad(c, f, art, L, Hh, phase, biege), shadeColor(P.fin, 0.06), L, 1.1);
  for (const f of afterFlossen(art))
    cLegen(c, () => afterPfad(c, f, art, L, Hh, phase, biege), P.fin, L, 1.1);
  if (art.form !== "platt") cLegen(c, () => bauchPfad(c, art, L, Hh, phase, biege), shadeColor(P.fin, -0.1), L, 1.0);

  // Schicht 3: der Koerper
  cLegen(c, () => cKoerperPfad(c, art, L, Hh, phase, biege, 3), P.color, L, 1.0);

  // Schicht 4: die Bauchplatte, ein eigenes Blatt AUF dem Koerper
  c.save(); cKoerperPfad(c, art, L, Hh, phase, biege, 3); c.clip();
  const bp = () => {
    const linie = zittern(zonenLinie(art, L, Hh, phase, biege, 0.58, 0.12), L * 0.03, 5);
    const { unten } = koerperPunkte(art, L, Hh, phase, biege);
    c.beginPath(); kurveDurch(c, linie.concat(zittern(unten.slice().reverse(), L * 0.035, 6)), true);
  };
  cLegen(c, bp, P.belly, L, 0.75);
  c.restore();

  // Schicht 5: das Muster, ausgestanzt
  cMuster(c, art, L, Hh, phase, biege, P);

  // Schicht 6: der Kiemendeckel — ein eigenes Blatt, das den Kopf abtrennt
  if (L >= 12 && art.form !== "platt") {
    c.save(); cKoerperPfad(c, art, L, Hh, phase, biege, 3); c.clip();
    const kd = () => {
      const t = art.kiemeT;
      const pts = [];
      for (let i = 0; i <= 6; i++) {
        const k = i / 6;
        const tt = lerp(t, 1.0, k);
        const a = ankerAt(art, L, Hh, tt, phase, biege);
        pts.push([a.x + (prnd(i, 12) - 0.5) * L * 0.02, a.y - a.ho * 1.05]);
      }
      const a0 = ankerAt(art, L, Hh, t, phase, biege);
      const a1 = ankerAt(art, L, Hh, 1.0, phase, biege);
      pts.push([a1.x, a1.y + a1.hu * 1.05]);
      for (let i = 6; i >= 0; i--) {
        const k = i / 6, tt = lerp(t, 1.0, k);
        const a = ankerAt(art, L, Hh, tt, phase, biege);
        pts.push([a.x - L * 0.03 * (1 - k), a.y + a.hu * 1.05]);
      }
      void a0;
      c.beginPath(); kurveDurch(c, pts, true);
    };
    cLegen(c, kd, shadeColor(P.color, 0.07), L, 0.8);
    c.restore();
  }

  // Schicht 7: vordere Brustflosse, ganz oben, mit dem laengsten Schatten
  cLegen(c, () => brustPfad(c, art, L, Hh, phase, biege, 1), shadeColor(P.fin, 0.12), L, 1.6);

  // Maul: ein ausgeschnittener Spalt, dunkles Papier dahinter
  if (L >= 10) {
    const m = maulPfad(c, art, L, Hh, phase, biege, 1);
    const spalt = () => {
      c.beginPath();
      c.moveTo(m.sx, m.sy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.5), lerp(m.sy, m.wy, 0.5) - m.oeff * 0.5, m.wx, m.wy);
      c.quadraticCurveTo(lerp(m.sx, m.wx, 0.55), m.wy + m.oeff * (art.raubtier ? 0.95 : 0.35),
                         m.sx - L * 0.01, m.sy + m.oeff * (art.raubtier ? 0.8 : 0.3));
      c.closePath();
    };
    c.save(); cKoerperPfad(c, art, L, Hh, phase, biege, 3); c.clip();
    spalt(); c.fillStyle = "#3c2a30"; c.fill();
    if (art.raubtier && L >= 18) {
      c.save(); spalt(); c.clip();
      c.fillStyle = "#efe8dc";
      const n = 5;
      for (let i = 0; i < n; i++) {
        const k = (i + 0.55) / n;
        const tx = lerp(m.sx, m.wx, k), ty = lerp(m.sy, m.wy, k) - m.oeff * 0.4 * Math.sin(k * Math.PI);
        const zw = Math.abs(m.wx - m.sx) / (n * 2.3);
        c.beginPath(); c.moveTo(tx - zw, ty); c.lineTo(tx + zw, ty); c.lineTo(tx + zw * 0.2, ty + m.oeff * 0.62); c.closePath(); c.fill();
      }
      c.restore();
    }
    c.restore();
  }

  // Leuchtangel: Draht aus einem duennen Papierstreifen, Kugel als Scheibe
  if (art.angel) {
    const a = ankerAt(art, L, Hh, 0.45, phase, biege);
    const bx = a.x + L * 0.55 + Math.sin(phase * 0.8) * L * 0.05, by = a.y - a.ho - Hh * 1.05;
    c.strokeStyle = shadeColor(P.fin, -0.2); c.lineWidth = Math.max(1, L * 0.035); c.lineCap = "round";
    c.beginPath(); c.moveTo(a.x, a.y - a.ho * 0.95); c.quadraticCurveTo(a.x + L * 0.2, by - Hh * 0.4, bx, by); c.stroke();
    cLegen(c, () => { c.beginPath(); c.arc(bx, by, Hh * 0.22, 0, Math.PI * 2); }, P.akzent, L, 1.0);
  }

  // DAS AUGE: zwei Scheiben, kein Weiss
  const e = augeOrt(art, L, Hh, phase, biege);
  const R = Math.max(1.2, e.r * 0.78);
  cLegen(c, () => { c.beginPath(); c.arc(e.x, e.y, R, 0, Math.PI * 2); }, shadeColor(P.akzent, -0.28), L, 0.9);
  c.fillStyle = "#241f24";
  c.beginPath(); c.arc(e.x + R * 0.14, e.y + R * 0.06, R * 0.5, 0, Math.PI * 2); c.fill();
  c.restore();
}
