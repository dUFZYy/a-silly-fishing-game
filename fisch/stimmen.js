// =============================================================================
// STIMMEN — wo die Antworten landen
// =============================================================================
//
// Diese Seite liegt auf GitHub Pages, und dort laeuft kein Server. Die Stimmen
// muessen also woandershin. Dustins Entscheidung (04.09.): ein Fremddienst,
// „weil wir eh ne Datenbank frueher oder spaeter brauchen fuer ne Topliste."
// Damit ist diese Umfrage der Probelauf fuer die Bestenliste im Spiel.
//
// GEWAEHLT: SUPABASE, und zwar ueber die nackte REST-Schnittstelle.
//
//   - Es ist Postgres. Eine Bestenliste ist dort ein einziges
//     `select ... order by punkte desc limit 100` — bei Firestore waeren das
//     hundert einzeln abgerechnete Lesevorgaenge. Fuer genau unseren spaeteren
//     Zweck ist das der billigere und natuerlichere Weg.
//   - Man erreicht es mit `fetch`. KEINE Bibliothek, kein SDK, kein Bundle
//     groesser. Fuer ein Spiel, das um jedes Kilobyte kaempft, ist das kein
//     Nebenaspekt.
//   - Der oeffentliche Schluessel (`anon`) ist dafuer GEMACHT, im Client zu
//     stehen. Was er darf, entscheidet nicht er, sondern Row Level Security in
//     der Datenbank. Siehe die Anleitung unten: nur INSERT, kein Lesen, kein
//     Aendern, kein Loeschen.
//
// SOLANGE KEIN SCHLUESSEL DA IST, laeuft alles lokal weiter (localStorage).
// Die Seite ist damit ab der ersten Minute benutzbar und wird spaeter live,
// ohne dass eine Zeile Oberflaeche sich aendert.
//
// -----------------------------------------------------------------------------
// EINRICHTEN — Dustins drei Schritte, danach ist es live
// -----------------------------------------------------------------------------
//
// 1. supabase.com, kostenloses Projekt anlegen.
//
// 2. Im SQL-Editor einmal das hier ausfuehren:
//
//      create table stimmen (
//        id          bigserial primary key,
//        wann        timestamptz not null default now(),
//        teilnehmer  text        not null,     -- zufaellige ID aus dem Browser
//        runde       text        not null,     -- welche Frage
//        wahl        text        not null,     -- welcher Entwurf gewonnen hat
//        sprache     text,
//        spieler     text,                     -- spielt Handyspiele: ja/nein
//        kommentar   text
//      );
//
//      alter table stimmen enable row level security;
//
//      -- Jeder darf eintragen, NIEMAND darf lesen, aendern oder loeschen.
//      -- Das ist der ganze Missbrauchsschutz, den ein oeffentlicher
//      -- Schluessel braucht: im schlimmsten Fall traegt jemand Unsinn ein,
//      -- aber er sieht keine fremden Antworten und kann keine loeschen.
//      create policy "eintragen erlaubt" on stimmen
//        for insert to anon with check (true);
//
//    Die Auswertung liest Dustin im Supabase-Tabelleneditor oder ich per
//    Service-Schluessel — der gehoert NICHT hierher und NICHT ins Repo.
//
// 3. Unten die zwei Zeilen ausfuellen. Beides steht in Supabase unter
//    Project Settings -> API. Der `anon`-Schluessel, nicht der `service_role`.
//
const STIMMEN_ZIEL = {
  url:      "",   // z. B. "https://abcdefgh.supabase.co"
  schluessel: ""  // der oeffentliche anon-Key
};

const Stimmen = {
  TABELLE: "stimmen",

  // Eine zufaellige, anonyme Kennung je Browser. Sie sagt nichts ueber die
  // Person; sie sorgt nur dafuer, dass die vier Antworten EINES Teilnehmers
  // zusammengehoeren und dass ein zweiter Durchgang erkennbar bleibt.
  teilnehmer() {
    try {
      let t = localStorage.getItem("fd_teilnehmer");
      if (!t) {
        t = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
        localStorage.setItem("fd_teilnehmer", t);
      }
      return t;
    } catch (e) { return "ohne-speicher"; }
  },

  live() { return !!(STIMMEN_ZIEL.url && STIMMEN_ZIEL.schluessel); },

  // Eine Antwort abgeben. Sie geht IMMER zuerst in den lokalen Speicher —
  // damit die eigene Auswertung sofort steht und nichts verloren geht, wenn
  // das Netz gerade weg ist — und danach, falls eingerichtet, nach oben.
  async ab(zeilen) {
    this._lokal(zeilen);
    if (!this.live()) return { weg: "lokal" };
    try {
      const a = await fetch(STIMMEN_ZIEL.url + "/rest/v1/" + this.TABELLE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": STIMMEN_ZIEL.schluessel,
          "Authorization": "Bearer " + STIMMEN_ZIEL.schluessel,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(zeilen)
      });
      if (!a.ok) return { weg: "lokal", fehler: a.status + " " + (await a.text()).slice(0, 120) };
      return { weg: "live" };
    } catch (e) {
      // Kein Netz, gesperrt, Tippfehler in der URL — egal: lokal liegt es schon.
      return { weg: "lokal", fehler: String(e).slice(0, 120) };
    }
  },

  _lokal(zeilen) {
    try {
      const alt = JSON.parse(localStorage.getItem("fd_stimmen") || "[]");
      localStorage.setItem("fd_stimmen", JSON.stringify(alt.concat(zeilen)));
    } catch (e) {}
  },

  alleLokal() {
    try { return JSON.parse(localStorage.getItem("fd_stimmen") || "[]"); } catch (e) { return []; }
  },

  vergessen() {
    try { localStorage.removeItem("fd_stimmen"); localStorage.removeItem("fd_fertig"); } catch (e) {}
  },

  schonAbgestimmt() {
    try { return !!localStorage.getItem("fd_fertig"); } catch (e) { return false; }
  },
  merkeFertig() {
    try { localStorage.setItem("fd_fertig", "1"); } catch (e) {}
  }
};
