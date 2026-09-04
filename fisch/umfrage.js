// =============================================================================
// DIE UMFRAGE — die Seite, die Fremden hingehalten wird
// =============================================================================
//
// Bewusst NICHT dieselbe Seite wie die Werkstatt (index.html). Dort stehen
// Dustins Zitate, meine Einschaetzungen, Aufwandszahlen und der Satz von seiner
// Freundin. Nichts davon gehoert vor jemanden, der abstimmen soll:
//
//   - Wer abstimmt, soll die BILDER bewerten, nicht eine Analyse lesen. Jede
//     Erklaerung daneben ist eine Vorgabe, wie zu urteilen waere.
//   - Interne Einschaetzungen und Terminplaene gehen Fremde nichts an.
//
// Deshalb: neutrale Buchstaben, je Teilnehmer neu gemischte Reihenfolge, kein
// Wort darueber, welcher Entwurf der heutige ist.
//
// Zweisprachig, weil Dustin die Bedingung gestellt hat: „nur dann, wenn die
// auch auf Englisch funktioniert."

const T = {
  de: {
    titel: "Welcher Fisch gefällt dir?",
    unter: "Ein kurzer Blick auf sechs Entwürfe für ein Angelspiel. Dauert eine Minute, keine Anmeldung.",
    los: "Los geht's",
    hinweisVor: "Du siehst gleich viermal denselben Fisch in sechs verschiedenen Zeichenstilen. Tippe jedes Mal den an, der dir am besten gefällt. Es gibt kein Richtig.",
    runde: "Frage",
    von: "von",
    tippe: "Tippe auf deinen Favoriten",
    weiter: "Weiter",
    zurueck: "Zurück",
    fertigTitel: "Danke!",
    fertigText: "Das war's. Hier ist, was du gewählt hast:",
    deinErgebnis: "Deine Auswahl",
    gesamt: "Ergebnis aller Antworten auf diesem Gerät",
    nochFragen: "Zwei kurze Fragen, freiwillig",
    spielerFrage: "Spielst du sonst Handyspiele?",
    ja: "Ja, regelmäßig",
    manchmal: "Ab und zu",
    nein: "Nein, eigentlich nie",
    kommentarFrage: "Willst du noch etwas dazu sagen?",
    kommentarPlatz: "Optional — was dir aufgefallen ist",
    absenden: "Absenden",
    gesendet: "Gesendet. Danke dir!",
    gesendetLokal: "Gespeichert. Danke dir!",
    nochmal: "Nochmal ansehen",
    fragen: [
      { id: "normal", art: "hecht",       fuell: 0.86, text: "Welcher Fisch gefällt dir am besten?" },
      { id: "bunt",   art: "kaiserfisch", fuell: 0.80, text: "Und bei einem bunten Fisch?" },
      { id: "klein",  art: "scholle",     echtL: 15,   text: "Klein — so groß sind die Fische im Spiel wirklich" },
      { id: "szene",  art: null,          fuell: 0,    text: "Und im Wasser, mit mehreren" }
    ],
    sprache: "English",
    schonTitel: "Du hast schon abgestimmt",
    schonText: "Danke! Du kannst dir das Ergebnis unten ansehen oder noch einmal von vorn beginnen.",
    nochmalStart: "Noch einmal abstimmen"
  },
  en: {
    titel: "Which fish do you like?",
    unter: "A quick look at six designs for a fishing game. Takes a minute, no sign-up.",
    los: "Start",
    hinweisVor: "You'll see the same fish four times, drawn in six different styles. Each time, tap the one you like best. There is no right answer.",
    runde: "Question",
    von: "of",
    tippe: "Tap your favourite",
    weiter: "Next",
    zurueck: "Back",
    fertigTitel: "Thank you!",
    fertigText: "That's it. Here's what you picked:",
    deinErgebnis: "Your picks",
    gesamt: "All answers given on this device",
    nochFragen: "Two quick questions, optional",
    spielerFrage: "Do you play mobile games otherwise?",
    ja: "Yes, regularly",
    manchmal: "Now and then",
    nein: "No, hardly ever",
    kommentarFrage: "Anything you'd like to add?",
    kommentarPlatz: "Optional — whatever stood out to you",
    absenden: "Send",
    gesendet: "Sent. Thank you!",
    gesendetLokal: "Saved. Thank you!",
    nochmal: "Look again",
    fragen: [
      { id: "normal", art: "hecht",       fuell: 0.86, text: "Which fish do you like best?" },
      { id: "bunt",   art: "kaiserfisch", fuell: 0.80, text: "And with a colourful one?" },
      { id: "klein",  art: "scholle",     echtL: 15,   text: "Small — this is how big fish really are in the game" },
      { id: "szene",  art: null,          fuell: 0,    text: "And in the water, with several of them" }
    ],
    sprache: "Deutsch",
    schonTitel: "You've already voted",
    schonText: "Thank you! You can look at the result below, or start over.",
    nochmalStart: "Vote again"
  }
};

// Die sechs Entwuerfe. `zeichne` kommt aus den Modulen, die schon geladen sind.
// Namen tauchen auf dieser Seite NIRGENDS auf — nur A bis F, und die Zuordnung
// wird je Teilnehmer neu gewuerfelt.
const U_ENTWUERFE = [
  { id: "ist", zeichne: istFisch },
  { id: "a",   zeichne: vektorFisch },
  { id: "b",   zeichne: lichtFisch },
  { id: "c",   zeichne: gemaltFisch },
  { id: "d",   zeichne: naturbuchFisch },
  { id: "e",   zeichne: fotoFisch }
];
const BUCHSTABEN = ["A", "B", "C", "D", "E", "F"];
const WASSER = "#2e6f96";

let sprache = "de";
let schritt = -1;            // -1 = Startseite, 0..3 = Fragen, 4 = Abschluss
let mischung = [];           // je Teilnehmer eine eigene Reihenfolge
let antworten = {};          // frage-id -> entwurf-id
let spielerAntwort = "";
let kommentarText = "";   // ueberlebt den Sprachwechsel
let laufend = null;

function t() { return T[sprache]; }

// Die Reihenfolge einmal je Teilnehmer festlegen und behalten. Wuerfelte sie
// bei jeder Frage neu, koennte niemand seine eigene Wahl wiedererkennen — und
// die Buchstaben waeren von Frage zu Frage etwas anderes.
function mischen() {
  try {
    const alt = localStorage.getItem("fd_mischung");
    if (alt) { mischung = JSON.parse(alt); if (mischung.length === 6) return; }
  } catch (e) {}
  mischung = U_ENTWUERFE.map((e, i) => i);
  for (let i = mischung.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mischung[i], mischung[j]] = [mischung[j], mischung[i]];
  }
  try { localStorage.setItem("fd_mischung", JSON.stringify(mischung)); } catch (e) {}
}

function artNach(id) { return ARTEN.find(a => a.id === id) || ARTEN[0]; }

// -----------------------------------------------------------------------------
// Zeichnen
// -----------------------------------------------------------------------------
function malFeld(cv, entwurf, frage, zeit) {
  const c = cv.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const b = cv.getBoundingClientRect();
  const w = Math.max(1, Math.round(b.width)), h = Math.max(1, Math.round(b.height));
  if (cv.width !== w * dpr || cv.height !== h * dpr) {
    cv.width = w * dpr; cv.height = h * dpr;
  }
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);

  // Wasser als Grund. Alle Felder bekommen exakt denselben — sonst misst die
  // Umfrage den Hintergrund statt den Fisch.
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#4a90b8"); g.addColorStop(1, "#1d4f6e");
  c.fillStyle = g; c.fillRect(0, 0, w, h);

  if (frage.art === null) {
    // Die Szene: mehrere Fische derselben Zeichnung, verteilt.
    const stell = [
      { a: "hecht",      x: 0.28, y: 0.26, L: 20, d:  1 },
      { a: "brasse",     x: 0.72, y: 0.44, L: 26, d: -1 },
      { a: "neonfisch",  x: 0.35, y: 0.66, L: 13, d:  1 },
      { a: "kaiserfisch", x: 0.74, y: 0.78, L: 17, d: -1 },
      { a: "scholle",    x: 0.20, y: 0.86, L: 15, d:  1 }
    ];
    const s = Math.min(w / 320, 1.5);
    for (let i = 0; i < stell.length; i++) {
      const st = stell[i];
      entwurf.zeichne(c, artNach(st.a), w * st.x, h * st.y, st.L * s, st.d,
                      zeit * 2.4 + i * 1.7, { wasser: WASSER, halo: true });
    }
  } else {
    const art = artNach(frage.art);
    let L;
    if (frage.echtL) {
      // Die Kleinfrage. Hier ist die Groesse der Punkt, nicht die Zeichnung:
      // so gross sind Fische im Spiel auf einem Telefon wirklich. Sie haengt
      // deshalb am GERAET und nicht an der Feldbreite — sonst zeigten wir auf
      // einem grossen Schirm einen grossen Fisch und behaupteten, er sei klein.
      L = frage.echtL * Math.min(window.devicePixelRatio || 1, 2) / 2 * 1.0;
      L = Math.max(9, frage.echtL);
    } else {
      // Sonst bildfuellend: `len` ist die Laenge in Einheiten von L, der Fisch
      // ist also rund 2*L*len breit. Wer eine Zeichnung beurteilen soll, muss
      // sie sehen — ein 20-Pixel-Fisch in einem 140-Pixel-Feld beantwortet
      // eine andere Frage.
      L = (w * frage.fuell) / (2 * (art.len || 1));
    }
    entwurf.zeichne(c, art, w / 2 + L * 0.12, h / 2, L, 1, zeit, { wasser: WASSER, halo: true });
  }
}

function alleMalen(zeit) {
  document.querySelectorAll("canvas[data-idx]").forEach(cv => {
    const frage = t().fragen[schritt];
    if (!frage) return;
    malFeld(cv, U_ENTWUERFE[mischung[+cv.dataset.idx]], frage, zeit);
  });
}

function schleife() {
  cancelAnimationFrame(laufend);
  const ab = performance.now();
  const tick = (n) => {
    alleMalen((n - ab) / 1000);
    laufend = requestAnimationFrame(tick);
  };
  laufend = requestAnimationFrame(tick);
}

// -----------------------------------------------------------------------------
// Oberflaeche
// -----------------------------------------------------------------------------
const el = (tag, klasse, text) => {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (text != null) e.textContent = text;
  return e;
};

function zeichneSeite() {
  // Was der Teilnehmer schon getippt hat, darf ein Neuzeichnen nicht fressen —
  // der Sprachknopf sitzt auf derselben Seite wie das Kommentarfeld.
  const kf = document.getElementById("kommentar");
  if (kf) kommentarText = kf.value;
  cancelAnimationFrame(laufend);
  const wurzel = document.getElementById("seite");
  wurzel.innerHTML = "";

  const kopf = el("div", "kopf");
  const sp = el("button", "sprachknopf", t().sprache);
  sp.onclick = () => { sprache = sprache === "de" ? "en" : "de"; zeichneSeite(); };
  kopf.appendChild(sp);
  wurzel.appendChild(kopf);

  if (schritt === -1) return startSeite(wurzel);
  if (schritt >= t().fragen.length) return abschluss(wurzel);
  frageSeite(wurzel);
}

function startSeite(wurzel) {
  const k = el("div", "karte mitte");
  k.appendChild(el("h1", null, t().titel));
  k.appendChild(el("p", "unter", t().unter));
  k.appendChild(el("p", "hinweis", t().hinweisVor));
  const b = el("button", "gross", t().los);
  b.onclick = () => { schritt = 0; zeichneSeite(); };
  k.appendChild(b);

  if (Stimmen.schonAbgestimmt()) {
    const n = el("p", "hinweis", t().schonText);
    k.appendChild(n);
  }
  wurzel.appendChild(k);
}

function frageSeite(wurzel) {
  const frage = t().fragen[schritt];

  const bal = el("div", "balken");
  for (let i = 0; i < t().fragen.length; i++) {
    bal.appendChild(el("span", "punkt" + (i <= schritt ? " an" : "")));
  }
  wurzel.appendChild(bal);

  const z = el("p", "zaehler", t().runde + " " + (schritt + 1) + " " + t().von + " " + t().fragen.length);
  wurzel.appendChild(z);
  wurzel.appendChild(el("h2", "fragetext", frage.text));
  wurzel.appendChild(el("p", "tippe", t().tippe));

  const gitter = el("div", frage.art === null ? "gitter szene" : "gitter");
  for (let i = 0; i < U_ENTWUERFE.length; i++) {
    const feld = el("button", "feld");
    if (antworten[frage.id] === U_ENTWUERFE[mischung[i]].id) feld.classList.add("gewaehlt");
    const cv = document.createElement("canvas");
    cv.dataset.idx = String(i);
    feld.appendChild(cv);
    feld.appendChild(el("span", "marke", BUCHSTABEN[i]));
    feld.onclick = () => {
      antworten[frage.id] = U_ENTWUERFE[mischung[i]].id;
      // Kurz stehen lassen, damit man die eigene Wahl noch sieht.
      feld.classList.add("gewaehlt");
      setTimeout(() => { schritt++; zeichneSeite(); }, 260);
    };
    gitter.appendChild(feld);
  }
  wurzel.appendChild(gitter);

  if (schritt > 0) {
    const zur = el("button", "klein", t().zurueck);
    zur.onclick = () => { schritt--; zeichneSeite(); };
    wurzel.appendChild(zur);
  }
  requestAnimationFrame(() => schleife());
}

function abschluss(wurzel) {
  const k = el("div", "karte");
  k.appendChild(el("h1", null, t().fertigTitel));
  k.appendChild(el("p", "unter", t().fertigText));

  // Die eigene Auswahl als Buchstaben — nicht als Entwurfsnamen. Wer die Namen
  // sieht, faengt an, sein Urteil zu begruenden statt es zu haben.
  const liste = el("div", "meins");
  t().fragen.forEach((f, i) => {
    const wahl = antworten[f.id];
    const idx = wahl ? mischung.findIndex(m => U_ENTWUERFE[m].id === wahl) : -1;
    const zeile = el("div", "meinsZeile");
    zeile.appendChild(el("span", "meinsNr", String(i + 1)));
    zeile.appendChild(el("span", "meinsText", f.text));
    zeile.appendChild(el("span", "meinsWahl", idx >= 0 ? BUCHSTABEN[idx] : "–"));
    liste.appendChild(zeile);
  });
  k.appendChild(el("h3", null, t().deinErgebnis));
  k.appendChild(liste);

  // Freiwillige Fragen
  k.appendChild(el("h3", null, t().nochFragen));
  k.appendChild(el("p", "hinweis", t().spielerFrage));
  const wahlreihe = el("div", "wahlreihe");
  [["ja", t().ja], ["manchmal", t().manchmal], ["nein", t().nein]].forEach(([id, txt]) => {
    const b = el("button", "wahl" + (spielerAntwort === id ? " gewaehlt" : ""), txt);
    // NICHT die ganze Seite neu zeichnen: wer erst seinen Kommentar tippt und
    // dann hier antippt, haette seinen Text sonst verloren. Nur die Markierung
    // umsetzen.
    b.onclick = () => {
      spielerAntwort = id;
      wahlreihe.querySelectorAll("button").forEach(x => x.classList.remove("gewaehlt"));
      b.classList.add("gewaehlt");
    };
    wahlreihe.appendChild(b);
  });
  k.appendChild(wahlreihe);

  k.appendChild(el("p", "hinweis", t().kommentarFrage));
  const feld = document.createElement("textarea");
  feld.placeholder = t().kommentarPlatz;
  feld.id = "kommentar";
  feld.rows = 3;
  feld.value = kommentarText;
  feld.oninput = () => { kommentarText = feld.value; };
  k.appendChild(feld);

  const senden = el("button", "gross", t().absenden);
  const status = el("p", "status");
  senden.onclick = async () => {
    senden.disabled = true;
    const kom = ((document.getElementById("kommentar") || {}).value || kommentarText || "").trim();
    const zeilen = t().fragen.map(f => ({
      teilnehmer: Stimmen.teilnehmer(),
      runde: f.id,
      wahl: antworten[f.id] || "keine",
      sprache: sprache,
      spieler: spielerAntwort || null,
      kommentar: kom || null
    }));
    const r = await Stimmen.ab(zeilen);
    Stimmen.merkeFertig();
    status.textContent = r.weg === "live" ? t().gesendet : t().gesendetLokal;
    zeigeGesamt(k);
  };
  k.appendChild(senden);
  k.appendChild(status);

  const nochmal = el("button", "klein", t().nochmal);
  nochmal.onclick = () => { schritt = 0; zeichneSeite(); };
  k.appendChild(nochmal);

  wurzel.appendChild(k);
}

// Die Auswertung dessen, was auf DIESEM Geraet abgegeben wurde. Die
// Gesamtauswertung ueber alle Teilnehmer liegt in der Datenbank — sie hier
// anzuzeigen hiesse, sie oeffentlich lesbar zu machen, und dann koennte jeder
// sehen, wie andere gestimmt haben, bevor er selbst stimmt.
function zeigeGesamt(k) {
  const alle = Stimmen.alleLokal();
  if (!alle.length) return;
  const zaehl = {};
  alle.forEach(z => { zaehl[z.wahl] = (zaehl[z.wahl] || 0) + 1; });
  const summe = Object.values(zaehl).reduce((a, b) => a + b, 0) || 1;

  const box = el("div", "gesamt");
  box.appendChild(el("h3", null, t().gesamt));
  U_ENTWUERFE.forEach((e, i) => {
    const idx = mischung.findIndex(m => m === i);
    const n = zaehl[e.id] || 0;
    const zeile = el("div", "bar");
    zeile.appendChild(el("span", "barName", BUCHSTABEN[idx >= 0 ? idx : i]));
    const spur = el("div", "spur");
    const fuell = el("div", "fuell");
    fuell.style.width = Math.round((n / summe) * 100) + "%";
    spur.appendChild(fuell);
    zeile.appendChild(spur);
    zeile.appendChild(el("span", "barZahl", String(n)));
    box.appendChild(zeile);
  });
  k.appendChild(box);
}

// -----------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
  const q = new URLSearchParams(location.search);
  const wunsch = q.get("lang") || q.get("sprache");
  if (wunsch === "en" || wunsch === "de") sprache = wunsch;
  else sprache = (navigator.language || "en").toLowerCase().startsWith("de") ? "de" : "en";
  mischen();
  zeichneSeite();
});
window.addEventListener("resize", () => { if (schritt >= 0 && schritt < 4) alleMalen(performance.now() / 1000); });
