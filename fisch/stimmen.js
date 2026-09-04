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
// EINGERICHTET am 04.09.2026 — was in der Datenbank steht
// -----------------------------------------------------------------------------
//
// Angelegt ueber die MCP-Anbindung, Migration `stimmen_umfrage_fischdesign`:
//
//   create table public.stimmen (
//     id bigserial primary key,
//     wann timestamptz not null default now(),
//     teilnehmer text not null,   -- zufaellige ID aus dem Browser, keine Person
//     runde text not null,        -- welche der vier Fragen
//     wahl text not null,         -- welcher Entwurf gewonnen hat
//     sprache text, spieler text, kommentar text,
//     constraint stimmen_kurz check (...)   -- Laengengrenzen, s. Migration
//   );
//   alter table public.stimmen enable row level security;
//   create policy "eintragen erlaubt" on public.stimmen
//     for insert to anon, authenticated with check (true);
//
// DIE REGEL IST DER GANZE SCHUTZ: eintragen ja, lesen/aendern/loeschen nein.
// Nachgeprueft, nicht angenommen — mit dem oeffentlichen Schluessel:
//
//   POST   -> 201, die Zeile steht drin
//   GET    -> 200 mit LEERER Liste (fremde Antworten sind unsichtbar)
//   DELETE -> 204, aber es wird nichts geloescht
//   PATCH  -> 204, aber es wird nichts geaendert
//
// Schlimmstenfalls traegt also jemand Unsinn ein. Das ist bei einer Umfrage
// ohne Anmeldung ohnehin nicht zu verhindern und im Zweifel per SQL zu
// bereinigen.
//
// AUSWERTEN geht nur mit dem Dienstschluessel, also ueber die MCP-Anbindung
// oder den Tabelleneditor — nie aus dem Browser. Beispiel:
//
//   select wahl, count(*) from stimmen where runde = 'normal'
//   group by wahl order by 2 desc;
//
// Dieselbe Tabelle ist der Probelauf fuer die spaetere Bestenliste. Die
// braucht dann eine eigene Tabelle mit eigener Regel — und dort wird Lesen
// erlaubt sein muessen, Schreiben aber begrenzt.
//
const STIMMEN_ZIEL = {
  url:        "https://gxqoyyicwczmqttcsant.supabase.co",
  schluessel: "sb_publishable_Zd8gkAdnP4LRxmewjaDyJw_5330_hE-"
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
