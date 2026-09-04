// =============================================================================
// app.js — die Vergleichsseite
// =============================================================================
// Nichts hier gehoert zum Entwurf. Das ist nur der Rahmen, der die sechs
// Zeichenwege nebeneinander stellt: gleiche Arten, gleiche Groessen, gleicher
// Hintergrund, gleicher Zeitpunkt im Schwanzschlag.

// Die Reihe ist von links nach rechts sortiert: vom heutigen, flachen Ton bis
// zum Realismus. Zwei fruehere Entwuerfe (Papierschnitt, Emblem) sind aus der
// Reihe genommen — sie gingen Richtung ABSTRAKTER, und die Richtung ist
// ausdruecklich nicht gefragt. Sie stehen unter „Verworfen" noch da, damit man
// sieht, was probiert wurde.
const ENTWUERFE = [
  { id: "ist", name: "IST", lang: "Ist-Zustand", zeichne: istFisch,
    ton: "Ausgangspunkt",
    kurz: "Unverändert aus fish.js. Alle Arten teilen sich EINE Körperlinie — das ist der eigentliche Befund." },
  { id: "a", name: "A", lang: "Vektor", zeichne: vektorFisch,
    ton: "flach, freundlich, nur reifer",
    kurz: "Flächen mit gewichteter Kontur aus der Motivfarbe. Kein Verlauf, Iris statt Comic-Auge. Der sichere Weg." },
  { id: "b", name: "B", lang: "Licht", zeichne: lichtFisch,
    ton: "weich, ohne Linie",
    kurz: "Keine einzige Kontur. Volumen nur aus vier Lichtbändern; die Bauchkante löst sich ins Wasser auf." },
  { id: "c", name: "C", lang: "Gouache", zeichne: gemaltFisch,
    ton: "gemalt, Handschrift",
    kurz: "Sichtbare Pinselzüge in gebrochenen Farben, abreissende Konturstücke, Auge ohne Weiss." },
  { id: "d", name: "D", lang: "Naturbuch", zeichne: naturbuchFisch,
    ton: "illustriert, korrekt",
    kurz: "Bestimmungsbuch-Tafel: echte Anatomie, ausgezählte Flossenstrahlen, feiner Strich, ruhige Modellierung." },
  { id: "e", name: "E", lang: "Fotoecht", zeichne: fotoFisch,
    ton: "so realistisch wie Canvas 2D kann",
    kurz: "Schuppentextur, nasser Glanz, Schillern, Streulicht, Hornhaut mit Reflex. Passt bewusst NICHT zum Rest." }
];
const VERWORFEN = [
  { id: "p", name: "V1", lang: "Papierschnitt", zeichne: papierFisch, ton: "verworfen: zu abstrakt",
    kurz: "Geschichtete matte Papiere mit hartem Versatzschatten, geschnittene Kanten." },
  { id: "m", name: "V2", lang: "Emblem", zeichne: emblemFisch, ton: "verworfen: zu abstrakt",
    kurz: "Drei Werte und EIN Akzent, Silhouette überzeichnet." }
];

// =============================================================================
// DIE UMFRAGE-ANSICHT
// =============================================================================
// Diese Seite wird Fremden hingehalten. Deshalb gilt hier anderes als in der
// Werkstatt-Ansicht:
//
//   * Die Varianten heissen A bis F. Keine Namen, keine Wertung, kein
//     "aktuell", kein "verbessert". Wer ein Etikett liest, bewertet das
//     Etikett.
//   * Die Reihenfolge sagt NICHTS. Sie ist hier festgeschrieben und mischt den
//     heutigen Zustand mitten hinein — er laeuft als Variante C mit, ohne
//     Sonderrolle. Waere er der erste oder der letzte, waere das schon eine
//     Aussage.
//   * Eine Variable je Vergleich: dieselbe Art, dieselbe Groesse, derselbe
//     Hintergrund, dieselbe Anordnung. Nur die Zeichnung unterscheidet sich.
//   * Kein erklaerender Text. Niemand steht daneben.
const UMFRAGE_ORDER = ["b", "d", "ist", "a", "e", "c"];
const UMFRAGE_HG = ["#4c86a2", "#1d4257"];   // fuer ALLE Varianten derselbe

const S = {
  umfrageArt: "hecht",
  umfrageModus: "einzeln",
  groesse: "spiel",
  animiert: true,
  grund: "wasser",
  welt: "w1",
  szeneEntwurf: "a",
  ansicht: "umfrage",
  t: 0
};

function el(tag, cls, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt != null) e.textContent = txt;
  return e;
}

// Eine Zelle: ein Canvas, das genau einen Fisch zeigt.
function zelle(art, entwurf, L, breiteF, hoeheF) {
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const w = Math.round(L * (breiteF || 3.5)), h = Math.round(L * (hoeheF || 2.9));
  const cv = el("canvas", "zelle");
  cv.width = w * dpr; cv.height = h * dpr;
  cv.style.width = w + "px"; cv.style.height = h + "px";
  const c = cv.getContext("2d");
  cv._male = (t) => {
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    const welt = WELTEN.find(x => x.id === S.welt);
    if (S.grund === "wasser") {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, shadeColor(welt.wasser, 0.22));
      g.addColorStop(1, shadeColor(welt.wasser, -0.25));
      c.fillStyle = g; c.fillRect(0, 0, w, h);
    } else if (S.grund === "hell") { c.fillStyle = "#e9e4d8"; c.fillRect(0, 0, w, h); }
    else if (S.grund === "dunkel") { c.fillStyle = "#151a20"; c.fillRect(0, 0, w, h); }
    entwurf.zeichne(c, art, w / 2 + L * 0.24, h / 2, L, 1, t, { wasser: welt.wasser, halo: true });
  };
  return cv;
}

const zellen = [];

function baueUmfrage() {
  const wrap = document.getElementById("inhalt");
  wrap.innerHTML = "";
  zellen.length = 0;

  const leiste = el("div", "unterleiste");
  for (const a of ARTEN) {
    const b = el("button", "chip" + (S.umfrageArt === a.id ? " an" : ""), a.name);
    b.onclick = () => { S.umfrageArt = a.id; baueUmfrage(); };
    leiste.appendChild(b);
  }
  wrap.appendChild(leiste);
  const leiste2 = el("div", "unterleiste");
  for (const [id, n] of [["einzeln", "einzeln"], ["klein", "klein"], ["szene", "im Wasser"]]) {
    const b = el("button", "chip" + (S.umfrageModus === id ? " an" : ""), n);
    b.onclick = () => { S.umfrageModus = id; baueUmfrage(); };
    leiste2.appendChild(b);
  }
  wrap.appendChild(leiste2);

  const art = ARTEN.find(a => a.id === S.umfrageArt);
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const breite = Math.min(980, (document.getElementById("inhalt").clientWidth || 380));
  const spalten = breite < 620 ? 2 : 3;
  const luecke = 8;
  const zw = Math.floor((breite - (spalten - 1) * luecke) / spalten);

  const gitter = el("div", "umfrage");
  gitter.style.gridTemplateColumns = "repeat(" + spalten + ", " + zw + "px)";
  gitter.style.gap = luecke + "px";

  UMFRAGE_ORDER.forEach((eid, i) => {
    const ent = ENTWUERFE.find(x => x.id === eid);
    const box = el("div", "ubox");
    const zh = S.umfrageModus === "szene" ? Math.round(zw * 1.3)
             : S.umfrageModus === "klein" ? Math.round(zw * 1.0)
             : Math.round(zw * 0.6);
    const cv = el("canvas");
    cv.width = zw * dpr; cv.height = zh * dpr;
    cv.style.width = zw + "px"; cv.style.height = zh + "px";
    const c = cv.getContext("2d");
    cv._male = (t) => {
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, zh);
      g.addColorStop(0, UMFRAGE_HG[0]); g.addColorStop(1, UMFRAGE_HG[1]);
      c.fillStyle = g; c.fillRect(0, 0, zw, zh);
      if (S.umfrageModus === "szene") {
        // derselbe Besatz, dieselbe Welt, nur die Zeichnung wechselt
        // Fester Besatz: gleiche Arten, gleiche Plaetze, gleiche Groessen in
        // JEDER Kachel. Nur die Zeichnung wechselt — sonst misst die Umfrage
        // den Zufall.
        const w4 = WELTEN.find(x => x.id === "w1");
        c.save(); c.beginPath(); c.rect(0, 0, zw, zh); c.clip();
        w4.zeichne(c, zw, zh, t, { horizont: 0.02 });
        const BESATZ = [
          ["hecht", 0.52, 0.20, 0.85, 1], ["brasse", 0.34, 0.42, 0.62, -1],
          ["kaiserfisch", 0.70, 0.55, 0.5, 1], ["neonfisch", 0.24, 0.68, 0.42, -1],
          ["scholle", 0.60, 0.83, 0.55, 1]
        ];
        for (let k = 0; k < BESATZ.length; k++) {
          const [id, fx, fy, fs, fd] = BESATZ[k];
          const a2 = ARTEN.find(a => a.id === id);
          const L = zw * 0.13 * fs * (0.7 + a2.len * 0.4);
          ent.zeichne(c, a2, zw * fx, zh * fy, L, fd, t * 2.6 + k * 1.7,
                      { wasser: w4.wasser, halo: true });
        }
        w4.vorn(c, zw, zh, t);
        c.restore();
      } else if (S.umfrageModus === "klein") {
        // dieselbe Art in vier Spielgroessen untereinander
        const Ls = [10, 16, 24, 36];
        let y = zh * 0.12;
        for (const L of Ls) { ent.zeichne(c, art, zw * 0.5 + L * 0.24, y, L, 1, t, { wasser: UMFRAGE_HG[1], halo: true }); y += zh * 0.25; }
      } else {
        // Der Fisch ist NICHT symmetrisch um seinen Mittelpunkt: die Schwanz-
        // fahne reicht bis -1,46 L, die Schnauze nur bis +1,0 L. Ohne den
        // Versatz stiess der Schwanz links an den Rand und die rechte Haelfte
        // stand leer.
        const L = Math.min(zw / 3.7, zh / 2.4);
        ent.zeichne(c, art, zw / 2 + L * 0.24, zh / 2, L, 1, t, { wasser: UMFRAGE_HG[1], halo: true });
      }
    };
    box.appendChild(cv);
    box.appendChild(el("div", "ulabel", String.fromCharCode(65 + i)));
    gitter.appendChild(box);
    zellen.push(cv);
  });
  wrap.appendChild(gitter);
}

function baueFische() {
  const wrap = document.getElementById("inhalt");
  wrap.innerHTML = "";
  zellen.length = 0;
  const G = GROESSEN.find(g => g.id === S.groesse);

  const kopf = el("div", "hinweis");
  kopf.innerHTML = "<b>" + G.name + "</b> — " + G.hinweis +
    ". Alle Spalten zeichnen dieselbe Art in derselben Größe, im selben Moment des Schwanzschlags." +
    (window.innerWidth < 700 ? " <i>Seitlich wischen, um alle sechs Spalten zu sehen.</i>" : "");
  wrap.appendChild(kopf);

  const tab = el("div", "gitter");
  const kopfzeile = el("div", "reihe kopfzeile");
  kopfzeile.appendChild(el("div", "artname", ""));
  for (const e of ENTWUERFE) {
    const z = el("div", "spaltenkopf");
    z.appendChild(el("b", null, e.name + " · " + e.lang));
    z.appendChild(el("span", "ton", e.ton));
    kopfzeile.appendChild(z);
  }
  tab.appendChild(kopfzeile);

  for (const art of ARTEN) {
    const r = el("div", "reihe");
    const nm = el("div", "artname");
    nm.appendChild(el("b", null, art.name));
    nm.appendChild(el("span", null, art.herkunft));
    r.appendChild(nm);
    for (const e of ENTWUERFE) {
      const box = el("div", "zellbox");
      const cv = zelle(art, e, G.L);
      box.appendChild(cv);
      zellen.push(cv);
      r.appendChild(box);
    }
    tab.appendChild(r);
  }
  wrap.appendChild(tab);

  const fuss = el("div", "notizen");
  for (const e of ENTWUERFE) {
    const d = el("div", "notiz");
    d.appendChild(el("b", null, e.name + " · " + e.lang));
    d.appendChild(el("p", null, e.kurz));
    fuss.appendChild(d);
  }
  wrap.appendChild(fuss);
}

// Der Kleintest: JEDER Entwurf in allen Spielgroessen untereinander. Das ist
// die Pruefung, an der Aufwertungen normalerweise scheitern.
function baueKlein() {
  const wrap = document.getElementById("inhalt");
  wrap.innerHTML = "";
  zellen.length = 0;
  wrap.appendChild(el("div", "hinweis"))
    .innerHTML = "<b>Der Kleintest.</b> Links die Größen, in denen ein Fisch im Spiel wirklich vorkommt. " +
      "Ein Entwurf, der erst bei L 90 gut ist, ist im Spiel nicht gut — die meisten Fische sind L 14 bis L 40. " +
      "Gezeigt sind Hecht (schlank), Brasse (hoch) und Neonfisch (winzig).";
  const arten = ARTEN.filter(a => ["hecht", "brasse", "neonfisch"].includes(a.id));
  for (const art of arten) {
    const h2 = el("h3", null, art.name);
    wrap.appendChild(h2);
    const tab = el("div", "gitter");
    const kopfzeile = el("div", "reihe kopfzeile");
    kopfzeile.appendChild(el("div", "artname", ""));
    for (const e of ENTWUERFE) kopfzeile.appendChild(el("div", "spaltenkopf", e.name + " · " + e.lang));
    tab.appendChild(kopfzeile);
    for (const G of GROESSEN.filter(g => g.id !== "lupe")) {
      const r = el("div", "reihe");
      const nm = el("div", "artname");
      nm.appendChild(el("b", null, "L " + G.L));
      nm.appendChild(el("span", null, G.hinweis));
      r.appendChild(nm);
      for (const e of ENTWUERFE) {
        const box = el("div", "zellbox");
        const cv = zelle(art, e, G.L, 3.6, 3.0);
        box.appendChild(cv); zellen.push(cv); r.appendChild(box);
      }
      tab.appendChild(r);
    }
    wrap.appendChild(tab);
  }
}

// Die Szene: ein Telefonbild mit Welt UND Fischen, im gewaehlten Entwurf.
// Erst hier entscheidet sich, ob Fisch und Welt zusammenpassen.
let szeneCv = null;
function baueSzene() {
  const wrap = document.getElementById("inhalt");
  wrap.innerHTML = "";
  zellen.length = 0;
  const leiste = el("div", "unterleiste");
  for (const w of WELTEN) {
    const b = el("button", "chip" + (S.welt === w.id ? " an" : ""), w.name);
    b.onclick = () => { S.welt = w.id; baueSzene(); };
    leiste.appendChild(b);
  }
  leiste.appendChild(el("span", "trenner", "·"));
  for (const e of ENTWUERFE) {
    const b = el("button", "chip" + (S.szeneEntwurf === e.id ? " an" : ""), e.name);
    b.onclick = () => { S.szeneEntwurf = e.id; baueSzene(); };
    leiste.appendChild(b);
  }
  wrap.appendChild(leiste);
  const welt = WELTEN.find(x => x.id === S.welt);
  const ent = ENTWUERFE.find(x => x.id === S.szeneEntwurf);
  const h = el("div", "hinweis");
  h.innerHTML = "<b>" + welt.name + "</b> mit <b>" + ent.lang + "</b>. " + welt.kurz;
  wrap.appendChild(h);

  const dpr = Math.min(3, window.devicePixelRatio || 1);
  const bw = Math.min(390, window.innerWidth - 24), bh = Math.round(bw * 844 / 390);
  const cv = el("canvas", "szene");
  cv.width = bw * dpr; cv.height = bh * dpr;
  cv.style.width = bw + "px"; cv.style.height = bh + "px";
  const c = cv.getContext("2d");
  // Ein fester Besatz, damit zwei Laeufe vergleichbar sind.
  const besatz = [];
  for (let i = 0; i < 9; i++) {
    const art = ARTEN[i % ARTEN.length];
    besatz.push({
      art, z: prnd(i, 5),
      y: 0.16 + prnd(i, 2) * 0.68,
      x0: prnd(i, 1), v: (prnd(i, 3) < 0.5 ? -1 : 1) * (0.012 + prnd(i, 4) * 0.02),
      ph: prnd(i, 6) * 6.28
    });
  }
  cv._male = (t) => {
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, bw, bh);
    // Himmel + Wasserlinie, damit das Bild wie am Angelplatz aussieht
    const sg = c.createLinearGradient(0, 0, 0, bh * 0.1);
    sg.addColorStop(0, "#bfe4f2"); sg.addColorStop(1, "#8fc8dd");
    c.fillStyle = sg; c.fillRect(0, 0, bw, bh * 0.1);
    welt.zeichne(c, bw, bh, t, {});
    // Tiefenstaffelung: erst die fernen Fische, dann EIN Schleier in
    // Wasserfarbe ueber das ganze Bild, dann die nahen. Das ist derselbe
    // Kunstgriff, den `drawFishShape` heute je Fisch macht — hier einmal fuer
    // die ganze Ebene, also ein `fillRect` statt einer Silhouette je Fisch.
    besatz.sort((a, b) => b.z - a.z);
    const male = (f) => {
      const L = (12 + (1 - f.z) * 26) * (f.art.len * 0.7 + 0.4);
      const x = ((f.x0 + t * f.v) % 1.3 - 0.15) * bw;
      const xx = f.v > 0 ? x : bw - x;
      ent.zeichne(c, f.art, xx, bh * f.y, L, f.v > 0 ? 1 : -1, t * 3 + f.ph,
                  { wasser: welt.wasser, halo: true });
    };
    for (const f of besatz) if (f.z > 0.45) male(f);
    const veil = c.createLinearGradient(0, bh * 0.1, 0, bh);
    veil.addColorStop(0, rgba(welt.wasser, 0.18));
    veil.addColorStop(1, rgba(welt.wasser, 0.42));
    c.fillStyle = veil; c.fillRect(0, bh * 0.1, bw, bh);
    for (const f of besatz) if (f.z <= 0.45) male(f);
    welt.vorn(c, bw, bh, t);
  };
  wrap.appendChild(cv);
  zellen.push(cv);
  szeneCv = cv;
}

// =============================================================================
// ANDERE WEGE — nicht gezeichnet, sondern anders erzeugt
// =============================================================================
// Alles, was hier live laeuft, ist echt und im Projekt machbar. Was nur als
// Text dasteht, ist entweder nicht in Canvas 2D zu zeigen oder verlangt
// Material von aussen (und damit eine Entscheidung, die Dustin treffen muss).

// 1. PIXEL: den fertigen Fisch klein rastern und hart vergroessern.
// Das ist kein Filter — die Zeichnung landet wirklich in einem Raster von
// z. B. 40 Pixeln, und danach wird ohne Glaettung aufgeblasen.
function pixelFisch(c, art, x, y, L, dir, phase, opts, raster) {
  const cv = document.createElement("canvas");
  const rw = raster, rh = Math.round(raster * 0.72);
  cv.width = rw; cv.height = rh;
  const cc = cv.getContext("2d");
  const l = rw / 3.4;
  fotoFisch(cc, art, rw / 2, rh / 2, l, 1, phase, opts);
  c.save();
  c.imageSmoothingEnabled = false;
  const k = (L * 3.4) / rw;
  c.translate(x, y); c.scale(dir >= 0 ? 1 : -1, 1);
  c.drawImage(cv, -rw * k / 2, -rh * k / 2, rw * k, rh * k);
  c.restore();
}

const WEGE_TEXT = [
  ["Prozedural in Canvas 2D <b>(heute, und alle sechs Spalten oben)</b>",
   "Jeder Fisch ist Zeichencode. Kein Speicherplatz, keine Ladezeit, jede Farbe zur Laufzeit " +
   "änderbar (Shiny, Boss, Nacht). Gebacken kostet er ein <code>drawImage</code> je Bild. " +
   "Grenze: alles muss von Hand konstruiert werden — 105 Arten sind 105 Datensätze."],
  ["Pixel-Raster <b>(unten live)</b>",
   "Dieselbe Zeichnung, aber in ein grobes Raster gebrannt und hart vergrössert. " +
   "Das ist ein eigener, sofort erkennbarer Look und die einzige Stilrichtung, die bei 18 Pixeln " +
   "BESSER wird statt schlechter. Kostet nichts extra (der Bake wird kleiner, nicht grösser). " +
   "Aber: das ganze Spiel müsste mit — Holz, Schrift, HUD. Ein halber Pixel-Look wirkt kaputt."],
  ["3D-Modelle, als Sprite-Blätter vorgerendert",
   "Fische in Blender modellieren, animieren und als PNG-Atlas ausgeben (z. B. 16 Schwimmphasen × " +
   "3 Blickwinkel je Art). Im Spiel bleibt es <code>drawImage</code> — die Laufzeit ändert sich nicht. " +
   "Das ist der Weg zu echtem Volumen, Drehung und Licht. Preis: eine Asset-Pipeline, " +
   "Downloadgrösse (105 Arten × Phasen sind schnell 20–60 MB), und die Farbtricks zur Laufzeit " +
   "(Shiny, Tiefenschleier) müssten anders gelöst werden. Zeitlich vor dem 10.09. unmöglich."],
  ["Gemalte oder gezeichnete Einzelbilder (Auftrag an eine Illustratorin)",
   "Der übliche Weg für ein Spiel, das schön aussehen soll. Höchste Qualität, volle Handschrift. " +
   "Preis: Geld, Vorlaufzeit, und 105 Arten sind ein grosser Auftrag. Machbar wäre eine Teilmenge — " +
   "die 20 wertvollsten Arten von Hand, der Rest prozedural."],
  ["KI-erzeugte Bilder",
   "Schnell und billig. Drei harte Probleme: Stilkonsistenz über 105 Arten, Silhouetten-Freistellung, " +
   "und die Rechtelage für einen bezahlten App-Store-Titel. Für Konzeptbilder brauchbar, " +
   "als Spielmaterial würde ich davon abraten."],
  ["Fisch als Textur auf der GPU (Phaser-Ebene)",
   "Die gebackene Kachel läge als Textur auf einem verformbaren Gitter: der Körper wellt sich " +
   "wirklich, statt in 16 Stufen zu springen, dazu Spiegelung und Schillern pro Pixel. " +
   "Kein zusätzlicher Vollbild-Durchgang, also regelkonform. Aber ein Umbau der Fischebene " +
   "und damit kein Thema für diesen Monat."],
  ["Streifen-Verformung <b>(die billige Variante davon)</b>",
   "EINE gebackene Kachel wird in 10–14 senkrechte Streifen zerlegt und jeder Streifen " +
   "leicht versetzt gezeichnet. Ergebnis: eine stufenlose Schwimmbewegung aus einem einzigen " +
   "Bild. Kostet 14 statt 1 <code>drawImage</code> je Fisch — messbar, aber weit billiger als " +
   "die 214 Zeichenbefehle von früher. Nebeneffekt: die 16 Phasen im Cache fallen weg, " +
   "der Speicherbedarf sinkt auf ein Sechzehntel."],
  ["Gelenkpuppe aus Einzelteilen",
   "Körper, jede Flosse, Kiemendeckel und Auge als eigene kleine Kacheln, jedes Bild neu " +
   "zusammengesetzt und einzeln gedreht (wie Spine/Live2D). Sehr lebendige Bewegung, " +
   "8–10 <code>drawImage</code> je Fisch. Erlaubt auch echtes Maulöffnen und Flossenfächern."]
];

function baueWege() {
  const wrap = document.getElementById("inhalt");
  wrap.innerHTML = "";
  zellen.length = 0;
  const h = el("div", "hinweis");
  h.innerHTML = "<b>Was ausser Zeichnen noch möglich wäre.</b> Live gezeigt ist, was ohne " +
    "fremdes Material geht. Der Rest steht als ehrliche Abwägung darunter.";
  wrap.appendChild(h);

  wrap.appendChild(el("h3", null, "Pixel-Raster — live, dieselbe Zeichnung, hart gerastert"));
  const tab = el("div", "gitter");
  const kz = el("div", "reihe kopfzeile");
  kz.appendChild(el("div", "artname", ""));
  for (const r of [0, 28, 40, 64]) kz.appendChild(el("div", "spaltenkopf", r ? r + " px Raster" : "ungerastert"));
  tab.appendChild(kz);
  for (const art of ARTEN.filter(a => ["hecht", "brasse", "anglerfisch", "kaiserfisch"].includes(a.id))) {
    const r = el("div", "reihe");
    const nm = el("div", "artname"); nm.appendChild(el("b", null, art.name)); r.appendChild(nm);
    for (const ras of [0, 28, 40, 64]) {
      const box = el("div", "zellbox");
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      const L = 60, w = Math.round(L * 3.5), hh = Math.round(L * 2.6);
      const cv = el("canvas", "zelle");
      cv.width = w * dpr; cv.height = hh * dpr;
      cv.style.width = w + "px"; cv.style.height = hh + "px";
      const cx = cv.getContext("2d");
      cv._male = (t) => {
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const g = cx.createLinearGradient(0, 0, 0, hh);
        g.addColorStop(0, "#2f7f9c"); g.addColorStop(1, "#123a51");
        cx.fillStyle = g; cx.fillRect(0, 0, w, hh);
        if (ras) pixelFisch(cx, art, w / 2, hh / 2, L, 1, t, {}, ras);
        else fotoFisch(cx, art, w / 2, hh / 2, L, 1, t, {});
      };
      box.appendChild(cv); zellen.push(cv); r.appendChild(box);
    }
    tab.appendChild(r);
  }
  wrap.appendChild(tab);

  wrap.appendChild(el("h3", null, "Verworfene Richtung: abstrakter statt realistischer"));
  const h2 = el("div", "hinweis");
  h2.innerHTML = "Zwei Entwürfe, die zuerst entstanden sind und dann aus der Reihe geflogen sind, " +
    "weil sie in die falsche Richtung zeigen. Zum Vergleich, nicht zur Auswahl.";
  wrap.appendChild(h2);
  const tab2 = el("div", "gitter");
  const kz2 = el("div", "reihe kopfzeile");
  kz2.appendChild(el("div", "artname", ""));
  for (const e of VERWORFEN) kz2.appendChild(el("div", "spaltenkopf", e.lang));
  tab2.appendChild(kz2);
  for (const art of ARTEN.filter(a => ["hecht", "brasse", "kaiserfisch"].includes(a.id))) {
    const r = el("div", "reihe");
    const nm = el("div", "artname"); nm.appendChild(el("b", null, art.name)); r.appendChild(nm);
    for (const e of VERWORFEN) {
      const box = el("div", "zellbox");
      const cv = zelle(art, e, 60);
      box.appendChild(cv); zellen.push(cv); r.appendChild(box);
    }
    tab2.appendChild(r);
  }
  wrap.appendChild(tab2);

  wrap.appendChild(el("h3", null, "Alle Wege, mit ihrem Preis"));
  const list = el("div", "notizen");
  for (const [t, txt] of WEGE_TEXT) {
    const d = el("div", "notiz");
    const b = el("b"); b.innerHTML = t; d.appendChild(b);
    const p = el("p"); p.innerHTML = txt; d.appendChild(p);
    list.appendChild(d);
  }
  wrap.appendChild(list);
}

function baueText() {
  const wrap = document.getElementById("inhalt");
  wrap.innerHTML = document.getElementById("beschreibung").innerHTML;
}

function bauen() {
  document.body.classList.toggle("umfrage-an", S.ansicht === "umfrage");
  if (S.ansicht === "umfrage") baueUmfrage();
  else if (S.ansicht === "fische") baueFische();
  else if (S.ansicht === "klein") baueKlein();
  else if (S.ansicht === "szene") baueSzene();
  else if (S.ansicht === "wege") baueWege();
  else baueText();
  malen();
}

function malen() { for (const cv of zellen) if (cv._male) cv._male(S.t); }

function schleife(ms) {
  if (S.animiert) { S.t = ms / 1000; malen(); }
  requestAnimationFrame(schleife);
}

window.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("nav");
  const knopf = (id, txt) => {
    const b = el("button", "tab" + (S.ansicht === id ? " an" : ""), txt);
    b.onclick = () => { S.ansicht = id; for (const x of nav.children) x.classList.remove("an"); b.classList.add("an"); bauen(); };
    nav.appendChild(b);
  };
  knopf("umfrage", "Umfrage");
  knopf("fische", "Werkstatt");
  knopf("klein", "Kleintest");
  knopf("szene", "Szene");
  knopf("wege", "Andere Wege");
  knopf("text", "Was jeder Entwurf tut");

  const st = document.getElementById("steuerung");
  const w1 = el("label", null, "Größe ");
  const sel = el("select");
  for (const g of GROESSEN) { const o = el("option", null, g.name); o.value = g.id; sel.appendChild(o); }
  sel.value = S.groesse;
  sel.onchange = () => { S.groesse = sel.value; bauen(); };
  w1.appendChild(sel); st.appendChild(w1);

  const w2 = el("label", null, "Grund ");
  const sel2 = el("select");
  for (const [v, n] of [["wasser", "Wasser"], ["hell", "hell"], ["dunkel", "dunkel"], ["leer", "leer"]]) {
    const o = el("option", null, n); o.value = v; sel2.appendChild(o);
  }
  sel2.value = S.grund;
  sel2.onchange = () => { S.grund = sel2.value; malen(); };
  w2.appendChild(sel2); st.appendChild(w2);

  const b = el("button", "chip an", "Bewegung: an");
  b.onclick = () => { S.animiert = !S.animiert; b.textContent = "Bewegung: " + (S.animiert ? "an" : "aus"); b.classList.toggle("an", S.animiert); };
  st.appendChild(b);

  bauen();
  requestAnimationFrame(schleife);
  void szeneCv;
});
