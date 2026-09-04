// =============================================================================
// welt.js — drei Haltungen fuer die Unterwasserwelt am Angelplatz
// =============================================================================
//
// WAS DIE WELT HEUTE SCHON TUT (nachgesehen, bevor hier etwas erfunden wird)
//
//   world-frag.js  Ein Vollbild-Shader auf der Phaser-Ebene macht: Brechung an
//                  der Wasserlinie, Spiegelung, ein Kaustik-Netz (1-2 Oktaven),
//                  Beer-Lambert-Truebung mit der Tiefe, Lichtschaechte,
//                  Plankton, Glitzern, Schaum, Vignette, Bloom. Das ist viel,
//                  und es ist gut. Es liegt nur ueber einer Szene, die dem
//                  wenig anbietet.
//   backdrop.js    Unter Wasser gibt es: einen Sedimentboden mit welliger
//                  Oberkante (`drawSeaBed`), neun Steine (`drawLakeRocks`),
//                  sieben Anemonen am Riff, vier Lichtstrahlen
//                  (`drawSunShafts`) und Schwebeteilchen
//                  (`drawDriftParticles`). Zusammen sind das rund fuenf
//                  Elemente auf ganzer Bildhoehe.
//
// DAS EIGENTLICHE PROBLEM IST NICHT DER MANGEL AN DETAIL, SONDERN DER MANGEL
// AN EBENEN. Zwischen Wasseroberflaeche und Grund liegt NICHTS — kein
// Mittelgrund, kein Vordergrund. Deshalb schwimmt jeder Fisch, egal wie gut
// gezeichnet, vor einer leeren Wand. Alle drei Entwuerfe hier setzen zuerst
// daran an und erst danach an Farbe und Licht.
//
// Alle drei kommen ohne `shadowBlur`, ohne Hilfsleinwand und ohne einen
// zusaetzlichen bildschirmfuellenden Durchgang aus.

// Ein Pflanzenbueschel — die Grundform aller drei Welten, nur anders gefaerbt.
function wPflanze(c, x, y, hoehe, breite, farbe, t, wind, halme) {
  c.fillStyle = farbe;
  for (let i = 0; i < halme; i++) {
    const k = (i / (halme - 1 || 1) - 0.5) * 2;
    const h = hoehe * (0.55 + prnd(i, 3 + x) * 0.6);
    const w = breite * (0.5 + prnd(i, 4 + x) * 0.7);
    const sway = Math.sin(t * 0.6 + i * 0.9 + x * 0.01) * wind * (h / hoehe);
    c.beginPath();
    c.moveTo(x + k * breite - w * 0.16, y);
    c.quadraticCurveTo(x + k * breite + sway * 0.4, y - h * 0.55, x + k * breite + sway, y - h);
    c.quadraticCurveTo(x + k * breite + sway * 0.5, y - h * 0.5, x + k * breite + w * 0.16, y);
    c.closePath(); c.fill();
  }
}

// Eine Bodenwelle: die Silhouette einer Duene oder eines Felsruecken.
function wGrundband(c, w, yTop, amp, farbe, salt, links, rechts) {
  c.fillStyle = farbe;
  c.beginPath();
  c.moveTo(-2, 4000);
  c.lineTo(-2, yTop);
  for (let i = 0; i <= 18; i++) {
    const x = (i / 18) * w;
    const y = yTop - Math.sin(i * 0.7 + salt) * amp - prnd(i, salt) * amp * 0.8;
    c.lineTo(x, y);
  }
  c.lineTo(w + 2, yTop); c.lineTo(w + 2, 4000);
  c.closePath(); c.fill();
  void links; void rechts;
}

// Schwebeteilchen in zwei Tiefen: die nahen gross und schnell, die fernen
// klein und langsam. Das ist der billigste Tiefenhinweis, den es gibt.
function wStaub(c, w, h, y0, t, n, farbe, nah) {
  c.save(); c.fillStyle = farbe;
  for (let i = 0; i < n; i++) {
    const sp = nah ? 16 : 5;
    const x = ((prnd(i, 41) * w + t * (sp + prnd(i, 42) * sp)) % (w + 30)) - 15;
    const y = y0 + prnd(i, 43) * (h - y0) + Math.sin(t * 0.5 + i) * (nah ? 9 : 4);
    c.globalAlpha = (nah ? 0.28 : 0.16) + 0.3 * prnd(i, 44);
    const r = (nah ? 1.4 : 0.7) + prnd(i, 45) * (nah ? 2.0 : 0.9);
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  c.restore();
}

// Lichtschaechte: additiv, weich, ohne shadowBlur. Sie sind der einzige Posten
// hier, der jedes Bild laeuft — vier Verlaeufe und vier Polygone.
function wSchaechte(c, w, h, y0, t, n, farbe, staerke, neig) {
  c.save(); c.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) {
    const x = w * (0.08 + i * (0.84 / (n - 1 || 1))) + Math.sin(t * 0.18 + i * 1.7) * w * 0.05;
    const br = w * (0.045 + prnd(i, 51) * 0.05);
    const g = c.createLinearGradient(x, y0, x + neig * h, h * 0.95);
    g.addColorStop(0, rgba(farbe, staerke));
    g.addColorStop(0.45, rgba(farbe, staerke * 0.42));
    g.addColorStop(1, rgba(farbe, 0));
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(x - br, y0); c.lineTo(x + br, y0);
    c.lineTo(x + neig * h + br * 3.2, h * 0.95); c.lineTo(x + neig * h - br * 2.4, h * 0.95);
    c.closePath(); c.fill();
  }
  c.restore();
}

// =============================================================================
// WELT 1 — „TIEFENBUEHNE"
// =============================================================================
// HALTUNG
//   Dieselbe Farbwelt wie heute, aber als BUEHNE gebaut statt als Wand.
//   Fuenf Ebenen von hinten nach vorn, jede eine Wertstufe naeher am Betrachter:
//   ferne Pflanzenwand, Ruecken-Duene, Grund, Nahpflanzen, Vordergrundblatt.
//   Der Fisch schwimmt zwischen Ebene 3 und 4 — er hat damit zum ersten Mal
//   etwas HINTER und etwas VOR sich.
// LICHT      von oben, sechs Schaechte, leicht schraeg. Der Grund faengt sie
//            als heller Fleck auf, statt gleichmaessig hell zu sein.
// FARBE      der Verlauf hat jetzt fuenf Stuetzen statt zwei, mit einer
//            spuerbaren Verdunkelung in der unteren Bildhaelfte. Die Farbe
//            KIPPT dabei leicht ins Gruene — Wasser wird mit der Tiefe nicht
//            nur dunkler, sondern auch anders.
// TIEFE      Dunst: jede Ebene bekommt einen Schleier in Wasserfarbe. Das ist
//            derselbe Kunstgriff, den `drawFishShape` fuer den Fisch schon
//            benutzt — hier nur auf die Kulisse angewandt.
// PASST ZU   A und E. Freundlich, klar, ruhig.
function welt1(c, w, h, t, opt) {
  const y0 = h * (opt.horizont == null ? 0.10 : opt.horizont);
  const boden = h * 0.86;
  const g = c.createLinearGradient(0, y0, 0, h);
  g.addColorStop(0.00, "#7cc9e0");
  g.addColorStop(0.18, "#4fa6c4");
  g.addColorStop(0.46, "#2b7a97");
  g.addColorStop(0.74, "#1a5470");
  g.addColorStop(1.00, "#123a51");
  c.fillStyle = g; c.fillRect(0, y0, w, h - y0);

  // Ebene 1: ferne Pflanzenwand, fast im Wasserton
  for (let i = 0; i < 14; i++) {
    const x = (i + 0.5) / 14 * w + Math.sin(i * 2.1) * 12;
    wPflanze(c, x, boden - h * 0.02, h * (0.10 + prnd(i, 11) * 0.10), w * 0.022,
             "rgba(23,84,110,0.75)", t, 2.5, 4);
  }
  // Ebene 2: eine Duene, dunkler
  wGrundband(c, w, boden + h * 0.005, h * 0.022, "#16465f", 2.2);
  // Ebene 3: der Grund
  wGrundband(c, w, boden + h * 0.045, h * 0.016, "#2c5163", 5.1);
  const gg = c.createLinearGradient(0, boden, 0, h);
  gg.addColorStop(0, "rgba(120,178,190,0.28)"); gg.addColorStop(1, "rgba(10,34,50,0.5)");
  c.fillStyle = gg; c.fillRect(0, boden, w, h - boden);
  // Steine auf dem Grund, mit Auflagepunkt
  for (let i = 0; i < 8; i++) {
    const x = prnd(i, 9) * w, r = w * (0.018 + prnd(i, 10) * 0.05);
    const base = boden + h * 0.05 + prnd(i, 12) * h * 0.03;
    const sg = c.createLinearGradient(x - r, base - r * 0.7, x + r, base);
    sg.addColorStop(0, "rgba(126,158,164,0.7)"); sg.addColorStop(1, "rgba(30,58,74,0.85)");
    c.fillStyle = sg;
    c.beginPath(); c.ellipse(x, base, r, r * 0.6, prnd(i, 13) * 0.5 - 0.25, Math.PI, 0); c.fill();
  }
  wSchaechte(c, w, h, y0, t, 6, "#bff2ff", 0.10, 0.16);
  wStaub(c, w, h, y0, t, 26, "#cfeef8", false);
}
// Vordergrund von Welt 1 — wird NACH den Fischen gezeichnet
function welt1Vorn(c, w, h, t) {
  const boden = h * 0.86;
  for (let i = 0; i < 5; i++) {
    const x = w * (-0.05 + i * 0.27) + Math.sin(i * 1.3) * 10;
    wPflanze(c, x, h * 1.02, h * (0.22 + prnd(i, 21) * 0.16), w * 0.05,
             "rgba(11,38,52,0.88)", t, 7, 5);
  }
  void boden;
  const v = c.createRadialGradient(w / 2, h * 0.5, h * 0.28, w / 2, h * 0.5, h * 0.72);
  v.addColorStop(0, "rgba(6,24,38,0)"); v.addColorStop(1, "rgba(6,24,38,0.34)");
  c.fillStyle = v; c.fillRect(0, 0, w, h);
}

// =============================================================================
// WELT 2 — „WARMES WASSER"
// =============================================================================
// HALTUNG
//   Aus dem kuehlen Blau wird ein warmes, hohes Wasser: Tuerkis oben, Sand
//   unten, und dazwischen ein GEGENLICHT. Alles Feste steht als Silhouette
//   gegen das Licht, statt selbst beleuchtet zu sein. Das ist der groesste
//   Stimmungsunterschied bei der kleinsten Zahl neuer Bauteile.
// LICHT      von oben und HINTEN. Der Grund ist heller als das Wasser
//            darueber — dadurch bekommen die Fische eine Kontur aus Licht, wo
//            heute nur Wasser ist.
// FARBE      Tuerkis (#3fd0c9, die Riff-Farbe des Spiels) nach Sandgelb, mit
//            einem warmen Kern in der Bildmitte. Kaustiknetz als grosse weiche
//            Flecken auf dem Sand, nicht als Linien.
// TIEFE      drei Riffbaenke in abnehmendem Kontrast, dazwischen Wasser.
// PASST ZU   B und C. Weich, freundlich, sommerlich.
function welt2(c, w, h, t, opt) {
  const y0 = h * (opt.horizont == null ? 0.10 : opt.horizont);
  const boden = h * 0.80;
  const g = c.createLinearGradient(0, y0, 0, h);
  g.addColorStop(0.00, "#63dcd2");
  g.addColorStop(0.30, "#37b3b4");
  g.addColorStop(0.62, "#2b8fa0");
  g.addColorStop(0.82, "#4e9d9a");
  g.addColorStop(1.00, "#c8b78a");
  c.fillStyle = g; c.fillRect(0, y0, w, h - y0);
  // warmer Kern: die Sonne steht hinter der Szene
  const k = c.createRadialGradient(w * 0.62, y0 + h * 0.1, 0, w * 0.62, y0 + h * 0.1, h * 0.62);
  k.addColorStop(0, "rgba(255,246,200,0.30)"); k.addColorStop(0.5, "rgba(255,240,190,0.10)");
  k.addColorStop(1, "rgba(255,240,190,0)");
  c.save(); c.globalCompositeOperation = "lighter"; c.fillStyle = k; c.fillRect(0, y0, w, h - y0); c.restore();

  // drei Riffbaenke, jede naeher und dunkler
  const bank = (yy, farbe, amp, salt, koepfe) => {
    wGrundband(c, w, yy, amp, farbe, salt);
    for (let i = 0; i < koepfe; i++) {
      const x = prnd(i, salt * 3) * w;
      const r = w * (0.02 + prnd(i, salt * 5) * 0.05);
      c.fillStyle = farbe;
      c.beginPath(); c.arc(x, yy - prnd(i, salt) * amp, r, Math.PI, 0); c.fill();
      // Fingerkorallen
      for (let j = 0; j < 3; j++) {
        c.beginPath();
        c.ellipse(x + (j - 1) * r * 0.55, yy - r * (0.6 + prnd(j, salt + i) * 0.6),
                  r * 0.2, r * (0.5 + prnd(j, salt) * 0.5), (j - 1) * 0.3, 0, Math.PI * 2);
        c.fill();
      }
    }
  };
  bank(boden - h * 0.11, "rgba(42,124,138,0.55)", h * 0.015, 3.1, 9);
  bank(boden - h * 0.045, "rgba(28,94,110,0.75)", h * 0.018, 6.4, 7);
  // Sandgrund
  const sg = c.createLinearGradient(0, boden, 0, h);
  sg.addColorStop(0, "#8fbfa8"); sg.addColorStop(0.4, "#c3bd8e"); sg.addColorStop(1, "#a89a6c");
  c.fillStyle = sg;
  c.beginPath(); c.moveTo(0, h); c.lineTo(0, boden);
  for (let i = 0; i <= 16; i++) c.lineTo(i / 16 * w, boden - Math.sin(i * 0.8 + 1.1) * h * 0.008 - prnd(i, 77) * h * 0.01);
  c.lineTo(w, h); c.closePath(); c.fill();
  // Kaustik auf dem Sand: grosse weiche Flecken, additiv
  c.save(); c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 10; i++) {
    const x = ((prnd(i, 81) * w + t * 6) % (w + 80)) - 40;
    const y = boden + h * 0.02 + prnd(i, 82) * h * 0.16;
    const r = w * (0.06 + prnd(i, 83) * 0.1);
    const cg = c.createRadialGradient(x, y, 0, x, y, r);
    cg.addColorStop(0, `rgba(255,252,222,${0.14 + 0.1 * Math.sin(t * 0.8 + i)})`);
    cg.addColorStop(1, "rgba(255,252,222,0)");
    c.fillStyle = cg;
    c.save(); c.translate(x, y); c.scale(1, 0.42);
    c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); c.restore();
  }
  c.restore();
  wSchaechte(c, w, h, y0, t, 4, "#fff6cc", 0.09, 0.1);
  wStaub(c, w, h, y0, t, 22, "#fffbe8", false);
}
function welt2Vorn(c, w, h, t) {
  // Vordergrund: zwei grosse Korallenfaecher links und rechts, als
  // Silhouette. Sie rahmen das Bild und geben ihm eine vorderste Ebene.
  for (const s of [-1, 1]) {
    const x = s < 0 ? -w * 0.04 : w * 1.04;
    c.fillStyle = "rgba(16,52,58,0.85)";
    for (let i = 0; i < 7; i++) {
      const a = (-0.9 + i * 0.28) * s;
      const len = h * (0.2 + prnd(i, 91) * 0.16);
      const sway = Math.sin(t * 0.5 + i) * 6;
      c.save(); c.translate(x, h * 0.98); c.rotate(a);
      c.beginPath();
      c.moveTo(-w * 0.02, 0);
      c.quadraticCurveTo(sway, -len * 0.6, sway * 1.4, -len);
      c.quadraticCurveTo(w * 0.02 + sway, -len * 0.5, w * 0.02, 0);
      c.closePath(); c.fill(); c.restore();
    }
  }
  wStaub(c, w, h, h * 0.1, t, 12, "#ffffff", true);
}

// =============================================================================
// WELT 3 — „KAMMER"   (das erwachsene Ende, passt zu D)
// =============================================================================
// HALTUNG
//   Fast einfarbig. EIN Licht von oben links, alles andere Silhouette. Das
//   Wasser ist dunkel und schwer, die Fische sind das Hellste im Bild — sie
//   werden dadurch zum Motiv, statt vor einer Kulisse zu haengen.
//   Das ist die stimmungsvollste und die riskanteste der drei: sie aendert den
//   Ton des Spiels spuerbar, und sie schluckt Farbe.
// LICHT      ein einziger breiter Schacht, schraeg, mit sichtbaren Staubkoernern
//            NUR darin. Alles ausserhalb bleibt im Halbdunkel.
// FARBE      ein Blaugruen in vier Werten, plus die Fischfarben. Der ganze
//            Rest des Bildes ist entsaettigt.
// TIEFE      vier Silhouettenbaender, jedes dunkler als das davor — verkehrt
//            herum zur Gewohnheit: hier wird es nach VORN dunkler, weil das
//            Licht von hinten oben kommt.
// PASST ZU   D. Und ausdruecklich nicht zu allen anderen.
function welt3(c, w, h, t, opt) {
  const y0 = h * (opt.horizont == null ? 0.10 : opt.horizont);
  const g = c.createLinearGradient(0, y0, 0, h);
  g.addColorStop(0.00, "#3b7b84");
  g.addColorStop(0.22, "#245863");
  g.addColorStop(0.55, "#143a48");
  g.addColorStop(1.00, "#0a2130");
  c.fillStyle = g; c.fillRect(0, y0, w, h - y0);
  // der eine Schacht
  c.save(); c.globalCompositeOperation = "lighter";
  const sx = w * 0.3 + Math.sin(t * 0.12) * w * 0.02;
  const sg = c.createLinearGradient(sx, y0, sx + w * 0.55, h);
  sg.addColorStop(0, "rgba(190,236,240,0.20)");
  sg.addColorStop(0.5, "rgba(170,224,232,0.08)");
  sg.addColorStop(1, "rgba(170,224,232,0)");
  c.fillStyle = sg;
  c.beginPath();
  c.moveTo(sx - w * 0.1, y0); c.lineTo(sx + w * 0.12, y0);
  c.lineTo(sx + w * 0.72, h); c.lineTo(sx + w * 0.2, h);
  c.closePath(); c.fill();
  c.restore();
  // vier Silhouettenbaender
  const baender = [
    [0.72, "rgba(14,52,62,0.55)", 0.020, 2.0, 10],
    [0.79, "rgba(11,42,52,0.75)", 0.024, 4.4, 8],
    [0.87, "rgba(8,30,40,0.9)",   0.028, 7.7, 6]
  ];
  for (const [yy, farbe, amp, salt, pfl] of baender) {
    wGrundband(c, w, h * yy, h * amp, farbe, salt);
    for (let i = 0; i < pfl; i++) {
      const x = prnd(i, salt * 2) * w;
      wPflanze(c, x, h * yy + h * 0.01, h * (0.06 + prnd(i, salt) * 0.12), w * 0.02, farbe, t, 3, 4);
    }
  }
  // Staub nur IM Schacht — die Koerner ausserhalb bleiben aus.
  c.save();
  c.beginPath();
  c.moveTo(sx - w * 0.1, y0); c.lineTo(sx + w * 0.12, y0);
  c.lineTo(sx + w * 0.72, h); c.lineTo(sx + w * 0.2, h);
  c.closePath(); c.clip();
  wStaub(c, w, h, y0, t, 34, "#eaf8fb", false);
  c.restore();
}
function welt3Vorn(c, w, h, t) {
  // Vordergrund: ein dunkles Blattwerk oben links und unten rechts — ein
  // Rahmen, der das Motiv einschliesst.
  c.fillStyle = "rgba(4,16,24,0.92)";
  for (let i = 0; i < 6; i++) {
    const x = w * (0.02 + prnd(i, 61) * 0.3), y = h * (0.02 + prnd(i, 62) * 0.12);
    const len = h * (0.1 + prnd(i, 63) * 0.12);
    const a = 0.6 + prnd(i, 64) * 1.0 + Math.sin(t * 0.4 + i) * 0.05;
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.ellipse(0, len * 0.5, w * 0.02, len * 0.5, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  for (let i = 0; i < 5; i++) {
    const x = w * (0.7 + prnd(i, 65) * 0.3);
    wPflanze(c, x, h * 1.03, h * (0.18 + prnd(i, 66) * 0.2), w * 0.045, "rgba(4,16,24,0.92)", t, 6, 4);
  }
  const v = c.createRadialGradient(w * 0.42, h * 0.42, h * 0.2, w * 0.42, h * 0.42, h * 0.8);
  v.addColorStop(0, "rgba(2,10,18,0)"); v.addColorStop(1, "rgba(2,10,18,0.55)");
  c.fillStyle = v; c.fillRect(0, 0, w, h);
}

// =============================================================================
// WELT 4 — „NATURSEE"   (die Obergrenze, und die Welt zum realistischen Fisch)
// =============================================================================
// HALTUNG
//   Ein echter See von innen. Kein Tuerkis, kein Postkartenblau: das Wasser
//   ist gruenbraun, es traegt Schwebstoff, und die Sicht endet nach ein paar
//   Metern. Genau das ist der Grund, warum ein realistischer Fisch hier
//   funktioniert und in einer Cartoon-Welt nicht — er bekommt eine Umgebung
//   aus demselben Material.
//
//   ACHT EBENEN, von hinten nach vorn:
//     1  der Sichtabbruch      — eine Wand aus Trueb, keine Kulisse dahinter
//     2  Fernkrautwald         — nur noch Wertunterschied, keine Farbe
//     3  Mittelkraut           — erste erkennbare Halme
//     4  Grundhang mit Mulde   — der Boden ist nicht flach
//     5  Totholz               — ein liegender Ast, das staerkste Tiefenzeichen
//     6  Nahkraut              — hier zeigt sich Farbe
//     7  die Fischebene
//     8  Vordergrundkraut, unscharf gehalten, und der Lichtschleier
//
// LICHT      Mittagslicht durch bewegtes Wasser: ein Kaustiknetz auf allem
//            Horizontalen, weiche Schaechte, und eine helle Zone direkt unter
//            der Oberflaeche, die nach unten in Dunkelheit uebergeht.
// FARBE      Olive nach Torfbraun. Der einzige gesaettigte Ton im Bild sind
//            die Fische — dadurch werden sie zum Motiv, ohne dass man sie
//            aufhellen muss.
// PREIS      das ist die aufwendigste der vier und der einzige Entwurf hier,
//            der auch den Steg, das Boot, den Angler und das HUD mitziehen
//            wuerde. Siehe Bericht.
function welt4(c, w, h, t, opt) {
  const y0 = h * (opt.horizont == null ? 0.10 : opt.horizont);
  const boden = h * 0.88;
  // Wasserkoerper: hell unter der Oberflaeche, dann schnell weg
  const g = c.createLinearGradient(0, y0, 0, h);
  g.addColorStop(0.00, "#8fae7e");
  g.addColorStop(0.10, "#6b9273");
  g.addColorStop(0.30, "#456f61");
  g.addColorStop(0.58, "#2b4c46");
  g.addColorStop(0.82, "#1c332f");
  g.addColorStop(1.00, "#182a26");
  c.fillStyle = g; c.fillRect(0, y0, w, h - y0);

  // 1. Sichtabbruch: eine senkrechte Truebwand, die die Ferne schluckt
  const sicht = c.createLinearGradient(0, y0, 0, boden);
  sicht.addColorStop(0, "rgba(120,150,120,0.0)");
  sicht.addColorStop(0.55, "rgba(70,100,88,0.28)");
  sicht.addColorStop(1, "rgba(40,64,58,0.45)");
  c.fillStyle = sicht; c.fillRect(0, y0, w, boden - y0);

  // 2./3. Krautwald in zwei Tiefen
  for (let i = 0; i < 22; i++) {
    const x = (i / 22) * w + prnd(i, 31) * w * 0.05;
    wPflanze(c, x, boden - h * 0.04, h * (0.12 + prnd(i, 32) * 0.14), w * 0.014,
             "rgba(46,74,62,0.55)", t, 3, 5);
  }
  for (let i = 0; i < 14; i++) {
    const x = prnd(i, 33) * w;
    wPflanze(c, x, boden + h * 0.005, h * (0.14 + prnd(i, 34) * 0.16), w * 0.02,
             "rgba(38,66,50,0.78)", t, 5, 6);
  }

  // 4. Grundhang: zwei Baender, das vordere mit einer Mulde
  wGrundband(c, w, boden, h * 0.014, "#2c4038", 3.3);
  c.fillStyle = "#3a4a38";
  c.beginPath(); c.moveTo(0, h); c.lineTo(0, boden + h * 0.03);
  for (let i = 0; i <= 20; i++) {
    const k = i / 20;
    const dip = Math.exp(-Math.pow((k - 0.55) * 4.2, 2)) * h * 0.035;   // die Mulde
    c.lineTo(k * w, boden + h * 0.03 - Math.sin(i * 0.6) * h * 0.008 + dip);
  }
  c.lineTo(w, h); c.closePath(); c.fill();
  // Schlick darueber
  const sg = c.createLinearGradient(0, boden, 0, h);
  sg.addColorStop(0, "rgba(120,132,96,0.22)"); sg.addColorStop(1, "rgba(20,28,24,0.6)");
  c.fillStyle = sg; c.fillRect(0, boden, w, h - boden);
  // Steine, halb im Schlick
  for (let i = 0; i < 7; i++) {
    const x = prnd(i, 41) * w, r = w * (0.02 + prnd(i, 42) * 0.05);
    const base = boden + h * 0.045 + prnd(i, 43) * h * 0.04;
    const rg = c.createLinearGradient(x - r, base - r * 0.8, x + r * 0.6, base);
    rg.addColorStop(0, "rgba(122,128,104,0.8)"); rg.addColorStop(0.6, "rgba(74,82,68,0.85)");
    rg.addColorStop(1, "rgba(34,42,36,0.9)");
    c.fillStyle = rg;
    c.beginPath(); c.ellipse(x, base, r, r * 0.55, prnd(i, 44) * 0.4 - 0.2, Math.PI, 0); c.fill();
    // Auflageschatten — ohne ihn schwebt jeder Stein
    const ag = c.createLinearGradient(x, base - r * 0.1, x, base + r * 0.3);
    ag.addColorStop(0, "rgba(10,18,16,0.35)"); ag.addColorStop(1, "rgba(10,18,16,0)");
    c.fillStyle = ag; c.beginPath(); c.ellipse(x, base, r * 1.25, r * 0.3, 0, 0, Math.PI * 2); c.fill();
  }

  // 5. Totholz: ein liegender Ast quer durchs Bild. Ein einzelnes grosses
  //    Objekt in mittlerer Tiefe tut fuer die Raeumlichkeit mehr als zwanzig
  //    kleine — es ueberschneidet die Fische und den Grund zugleich.
  c.save();
  c.strokeStyle = "#2a2620"; c.lineCap = "round";
  c.lineWidth = w * 0.035;
  c.beginPath();
  c.moveTo(-w * 0.05, boden - h * 0.005);
  c.quadraticCurveTo(w * 0.4, boden - h * 0.07, w * 0.82, boden - h * 0.02);
  c.stroke();
  c.strokeStyle = "#4a4234"; c.lineWidth = w * 0.012;
  c.beginPath();
  c.moveTo(-w * 0.05, boden - h * 0.012);
  c.quadraticCurveTo(w * 0.4, boden - h * 0.079, w * 0.82, boden - h * 0.028);
  c.stroke();
  for (const [ax, ay, bx, by] of [[0.22, 0.03, 0.16, 0.10], [0.55, 0.045, 0.63, 0.115]]) {
    c.strokeStyle = "#2a2620"; c.lineWidth = w * 0.012;
    c.beginPath();
    c.moveTo(w * ax, boden - h * ay);
    c.quadraticCurveTo(w * (ax + bx) / 2, boden - h * (ay + by) * 0.7, w * bx, boden - h * by);
    c.stroke();
  }
  c.restore();

  // 6. Nahkraut mit Farbe
  for (let i = 0; i < 9; i++) {
    const x = prnd(i, 51) * w;
    wPflanze(c, x, boden + h * 0.06, h * (0.16 + prnd(i, 52) * 0.14), w * 0.026,
             "rgba(52,84,52,0.9)", t, 7, 5);
  }

  // Kaustiknetz auf dem Grund und auf dem Ast
  c.save(); c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 14; i++) {
    const x = ((prnd(i, 61) * w + t * 8) % (w + 60)) - 30;
    const y = boden - h * 0.02 + prnd(i, 62) * h * 0.14;
    const r = w * (0.04 + prnd(i, 63) * 0.07);
    const cg = c.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.06 + 0.06 * Math.sin(t * 1.1 + i * 1.7);
    cg.addColorStop(0, `rgba(226,240,180,${a})`); cg.addColorStop(1, "rgba(226,240,180,0)");
    c.fillStyle = cg;
    c.save(); c.translate(x, y); c.scale(1, 0.34);
    c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); c.restore();
  }
  c.restore();
  wSchaechte(c, w, h, y0, t, 5, "#dff0b8", 0.07, 0.12);
  wStaub(c, w, h, y0, t, 40, "#dfe8c4", false);
}
function welt4Vorn(c, w, h, t) {
  // Vordergrund: Kraut, das ueber den unteren Bildrand hereinwaechst. Es ist
  // ABSICHTLICH nur als Silhouette gehalten — ein scharfer Vordergrund zoege
  // den Blick von den Fischen weg.
  for (let i = 0; i < 7; i++) {
    const x = w * (-0.06 + i * 0.19) + Math.sin(i * 2.2) * 8;
    wPflanze(c, x, h * 1.05, h * (0.16 + prnd(i, 71) * 0.22), w * 0.05,
             "rgba(14,26,22,0.82)", t, 9, 5);
  }
  // ein Blatt oben links, das ins Bild haengt
  c.fillStyle = "rgba(12,24,20,0.8)";
  for (let i = 0; i < 4; i++) {
    const x = w * (0.04 + prnd(i, 72) * 0.22), y = h * (0.09 + prnd(i, 73) * 0.05);
    c.save(); c.translate(x, y); c.rotate(1.1 + prnd(i, 74) * 0.8 + Math.sin(t * 0.35 + i) * 0.04);
    c.beginPath(); c.ellipse(0, h * 0.05, w * 0.022, h * 0.05, 0, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  // Lichtschleier: unter der Oberflaeche hell, nach unten dunkel. Das ist der
  // letzte Handgriff, der aus einer Kulisse ein Bild macht.
  const v = c.createLinearGradient(0, h * 0.08, 0, h);
  v.addColorStop(0, "rgba(210,235,180,0.14)"); v.addColorStop(0.35, "rgba(120,160,120,0)");
  v.addColorStop(1, "rgba(6,16,14,0.42)");
  c.fillStyle = v; c.fillRect(0, 0, w, h);
  const vg = c.createRadialGradient(w * 0.5, h * 0.45, h * 0.26, w * 0.5, h * 0.45, h * 0.75);
  vg.addColorStop(0, "rgba(8,18,16,0)"); vg.addColorStop(1, "rgba(8,18,16,0.4)");
  c.fillStyle = vg; c.fillRect(0, 0, w, h);
}

// Der heutige Zustand als Vergleich: zwei Farbstopps, ein Boden, neun Steine,
// vier Strahlen, Schwebeteilchen. Nachgebaut aus backdrop.js.
function welt0(c, w, h, t, opt) {
  const y0 = h * (opt.horizont == null ? 0.10 : opt.horizont);
  const g = c.createLinearGradient(0, y0, 0, h);
  g.addColorStop(0, "#5fa8c9"); g.addColorStop(1, "#1c4f6b");
  c.fillStyle = g; c.fillRect(0, y0, w, h - y0);
  const boden = h * 0.9;
  c.beginPath(); c.moveTo(0, h); c.lineTo(0, boden);
  for (let i = 0; i <= 16; i++) c.lineTo(i / 16 * w, boden - 4 + Math.sin(i * 0.9 + 1.3) * 5 + prnd(i, 91) * 7);
  c.lineTo(w, h); c.closePath();
  const bg = c.createLinearGradient(0, boden - 10, 0, h);
  bg.addColorStop(0, "rgba(52,66,58,0.85)"); bg.addColorStop(0.45, "rgba(52,66,58,0.85)");
  bg.addColorStop(1, "rgba(22,34,34,0.95)");
  c.fillStyle = bg; c.fill();
  for (let i = 0; i < 9; i++) {
    const x = prnd(i, 9) * w, r = 8 + prnd(i, 10) * 20;
    const base = boden - 2 + Math.sin(i * 0.9 + 1.3) * 5 + prnd(i, 91) * 7;
    const sg2 = c.createLinearGradient(x - r, base - r * 0.7, x + r, base);
    sg2.addColorStop(0, "rgba(96,108,102,0.75)"); sg2.addColorStop(0.55, "rgba(62,74,70,0.75)");
    sg2.addColorStop(1, "rgba(34,44,42,0.8)");
    c.fillStyle = sg2;
    c.beginPath(); c.ellipse(x, base, r, r * 0.62, prnd(i, 12) * 0.5 - 0.25, Math.PI, 0); c.fill();
  }
  c.save(); c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 4; i++) {
    const x = w * (0.12 + i * 0.26) + Math.sin(t * 0.25 + i) * 18;
    const sg3 = c.createLinearGradient(x, y0, x, h * 0.8);
    sg3.addColorStop(0, "rgba(190,255,250,0.09)"); sg3.addColorStop(1, "rgba(190,255,250,0)");
    c.fillStyle = sg3;
    c.beginPath(); c.moveTo(x - 14, y0); c.lineTo(x + 14, y0);
    c.lineTo(x + 52, h * 0.8); c.lineTo(x - 34, h * 0.8); c.closePath(); c.fill();
  }
  c.restore();
  wStaub(c, w, h, y0, t, 18, "#cfeef8", false);
}
function welt0Vorn() {}

const WELTEN = [
  { id: "w0", name: "Ist-Zustand", zeichne: welt0, vorn: welt0Vorn, wasser: "#1c4f6b",
    kurz: "Zwei Farbstopps, ein Boden, neun Steine, vier Strahlen. Kein Mittel-, kein Vordergrund." },
  { id: "w1", name: "Tiefenbühne", zeichne: welt1, vorn: welt1Vorn, wasser: "#1a5470",
    kurz: "Dieselbe Farbwelt, aber fünf Ebenen von hinten nach vorn. Der Fisch hat etwas hinter UND vor sich." },
  { id: "w2", name: "Warmes Wasser", zeichne: welt2, vorn: welt2Vorn, wasser: "#2b8fa0",
    kurz: "Türkis nach Sand, Gegenlicht von hinten oben. Alles Feste ist Silhouette, der Grund ist heller als das Wasser." },
  { id: "w3", name: "Kammer", zeichne: welt3, vorn: welt3Vorn, wasser: "#143a48",
    kurz: "Fast einfarbig, ein Lichtschacht, alles andere Halbdunkel. Die Fische sind das Hellste im Bild." },
  { id: "w4", name: "Natursee", zeichne: welt4, vorn: welt4Vorn, wasser: "#2b4c46",
    kurz: "Die Obergrenze. Acht Ebenen, grünbraunes Wasser mit Schwebstoff, Sichtabbruch statt Kulisse, " +
          "Totholz quer durchs Bild, Kaustiknetz auf dem Grund. Die einzige Welt, die einen realistischen Fisch trägt." }
];
