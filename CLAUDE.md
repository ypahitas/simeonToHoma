# το χώμαν / To Homan: album website

Static bilingual (Greek/English) site for the album **το χώμαν** ("To Homan"), traditional songs of Cyprus by **Συμεών Μερκούρης / Symeon Mercouris** with **Στέλιος Παπαμιχαήλ / Stelios Papamichael**. It works as a digital version of the printed booklet: an introductory note, 17 songs (lyrics, credits, notes, interviews, sources, footnotes, photos), contributors, acknowledgements, interview photos and contact. Plain HTML/CSS/JS with no backend and no build step. Hosted from this repo: https://github.com/ypahitas/simeonToHoma

This file is the handoff for any new Claude session. Read it before changing anything.

## Sources of truth

Since 12 Nov 2026 the site follows the designer's booklet and the artist's English files. **None of them are in the repo** (it is public, and they are the unpublished booklet and the artist's own files), and as of 21 Nov they are no longer on the owner's machine either. Everything taken from them is already in the site's data; if a change needs a source again, ask the owner to send it:

- **Greek:** `to homan draft8.pdf` (140 pages), the booklet. Greek text, lyrics, credits, photo captions, contributors page, thanks, dedication and the legal notice all come from it. It replaced the earlier Word file `Κείμενα Δίσκου «Το χώμαν» (ΝΔ - ΣΜ) 01-09-26.docx`.
- **English:** the artist's own translation in `Kείμενα Δίσκου_το χώμαν_ΑΓΓΛΙΚΑ.docx` (intro and songs), `Στίχοι_το χώμαν ΑΓΓΛΙΚΑ.docx` (lyrics), `Συντελεστές Δίσκου_…ΑΓΓΛΙΚΑ.docx` (contributors), `Ευχαριστίες Δίσκου_…ΑΓΓΛΙΚΑ.docx` (thanks) and `Legal disclaimer + copyright_το χώμαν.docx`. It replaced Claude's earlier translation.
- **Photos:** `Track photos-….zip` (song photos, with a caption index .docx in Greek and English) and `Photos for back-….zip` (interview photos, also with an index).

Keep the text verbatim. It is in Cypriot dialect; spellings that look like typos are usually intentional. Fix only mechanical problems from extraction and list them for the owner.

## Fixed decisions (don't change without asking)

- **Names.** English: **Symeon Mercouris** (the artist's own spelling; the site used "Simon" until 12 Nov 2026) and **To Homan**. Greek: **Συμεών Μερκούρης** and **το χώμαν** (lowercase, as in the booklet; the nav bar uses "το χώμαν"). Never "Merkouris" with a k, or "The Soil" as the title. The email stays **simon.mercouris@gmail.com**.
- **«γιώργος Α. Κωνσταντίνου»** (the engraver, in Συντελεστές and Ευχαριστίες) is lowercase on purpose (owner, 27 Nov). Don't capitalise it. The surname is Κωνσταντίνου with ν in both places.
- **Single-page layout** (chosen 16 Oct): `index.html` has a sticky bar, the ochre cover band, "Ο δίσκος" (the dedication «Στον παπάν μου, Σπύρον (1954-2011)», bold, italic and right-aligned above the ornament, then the intro note; the artists column was removed on 13 Nov), the two-column song index, the song reader (one song at a time, routed by `#song-N`, credits in a sticky left column), then the sections Συντελεστές, Ευχαριστίες, Φωτογραφίες, Προ-παραγγελία (`#buy`) and Επικοινωνία, and the footer. Menu order: Ο δίσκος, Τραγούδια, Συντελεστές, Ευχαριστίες, Φωτογραφίες, Προ-παραγγελία, Επικοινωνία. Below 940px the menu collapses to ☰ (the seven Greek links need about 920px on one line).
- `songs.html`, `contributors.html` and `contact.html` are only redirects to `index.html#…`, so old links keep working.
- **Lyrics are bold, not italic** (owner's request). In English mode each Greek stanza is followed by its English translation in lighter text; in Greek mode only the Greek shows. No comma at the end of a lyric line (owner, 14 Nov). Lyric footnotes follow the language: in English mode the Greek lyric markers and notes are hidden (they carry `lang="el"`) and only `lyricNotesEn` shows.
- **Full album live** since the release date, 27 Nov 2026. The two singles came first (song 6 from 16 Nov, then songs 6 and 12 from 23 Nov), with `js/release.js` hiding the rest; that mechanism (`release.js`, `?release=`, `html.partial`, `data-full`, the "more coming" notes) was removed on 27 Nov. Every song and section now always shows.
- **Ordinals** (1ο, 3η, 4ον, 5ος, 1st, 2nd…) are shown with the ending in superscript everywhere: credits, song text, notes and lyrics (owner, 25 Nov; credits only before that). This is done at render time in `songs.js` (`ordinals()`, also called from `fmt()`); the data stays plain. Static HTML in `index.html` uses `<sup class="ord">` by hand (the intro's "20th").
- **No breaks inside names or after ordinals in credits** (designer, 18 Nov): `keep()` in `songs.js` puts non-breaking spaces between capitalised words of a name, after an ordinal ("2η στροφή", "1η, 3η"), after "και/and" before an ordinal, and before " ·". In Συντελεστές the same is done by hand with `&nbsp;` in `index.html` (names in the role lines, "Δ1 κομ. 2" / "D1 track 2").

## How the code works

- `js/album-data.js`: all song text as `window.__ALBUM_DATA__`:
  - `meta[i]`: `{id: 'song-N', n, title_el, title_en}` for the index and pager.
  - `el.songs[i]` / `en.songs[i]`: `{id, title, credits[], body[], notes{}}`. `body` items are `{type:'p'|'heading'|'source', text}` or `{type:'verse', lines[]}`. Sources sit in the body where they appear (the reader groups consecutive ones under a "Πηγές/Sources" label).
  - Footnotes: markers `[^N]` in the text, notes in that song's `notes`. **Greek** footnotes are numbered per song, as in the booklet. **English** footnotes keep the translation's own numbering (1–38 across the album), because the English text refers to them by number ("See fn. 10").
  - English text marks italics as `{i}…{/i}`; `songs.js` turns them into `<em>`. The Greek has none.
  - Cross-references `{a song-N}Title{/a}` (or `{a song-6-pittatzis}` for a sub-section) replace the booklet's page numbers (owner's feedback, 13 Nov); headings with an `anchor` get the id `song-N-anchor` (`-en` in English).
  - `q: 1` on a body paragraph marks an interview passage, inset on both sides as in the booklet; `q: 2` is dialogue inside one (song 6, Ξενής Πάτσαλος). Mapped from the PDF's inset paragraphs; the English was mapped by hand.
  - `lyrics[id]`: Greek stanzas (lists of lines); `lyricsEn[id]`: English, **one stanza per Greek stanza** (five songs needed hand grouping because the translation breaks lines differently: 2, 6, 10, 14, 15). `lyricNotes` / `lyricNotesEn`: lyric footnotes, numbered per song. `lyricsCentered[id]`: indexes of stanzas set as a centred couplet (empty: song 16's last couplet was centred like the booklet, but the owner preferred it left-aligned, 13 Nov).
  - `photos[id]`: `[{src, w, h, el, en, at}]`; `at` is the index of the Greek body item the photo goes before. English placement is proportional to the English body (the texts differ in length), and a photo never goes between a line ending in ":" and the quote it introduces.
  - `el.intro` / `en.intro` mirror the intro paragraphs but are not rendered; the intro shown is the static HTML in `index.html`.
- `js/songs.js`: builds the song index and all 17 articles (both languages in the DOM) and handles routing: `#song-N`, `#song-N-fnM`, `#song-N-lfnM` (lyric note) show that song; anything else shows the main page.
- `js/site.js`: language toggle (`html[data-lang]`, saved in localStorage as `site-lang`, default `el`; the inline script in `index.html` sets it before first paint, and `?lang=en` works), the ochre `.bar.solid` header after the cover scrolls away, the copyright popup (`<dialog id="legal">`, opened from the footer link), and the mobile menu.
- Static HTML in `index.html`: intro note, Συντελεστές (separate `lang="el"` and `lang="en"` blocks, built from booklet pp. 10–11 and the contributors docx), Ευχαριστίες (the dedication moved from here to the top of "Ο δίσκος" on 27 Nov; its English is Claude's translation), Φωτογραφίες (gallery of `images/interviews/`, captions from the zip index), Προ-παραγγελία (`#buy`, the pre-order section: a note that the CD and booklet are expected in February 2027 and a button to a Stripe Payment Link, hosted checkout, no backend; the wording is Claude's), contact, footer and the legal dialog.
- Bilingual text uses paired `lang="el"` / `lang="en"` elements, toggled by the rules at the top of `css/style.css`. `.lyrics[lang="el"]` is exempt, so the Greek lyrics show in English mode too.
- Images: `images/cover.jpg` (the designer's final booklet cover, 18 Nov, white print edge trimmed), `images/songs/` (23 track photos, max 1400px, as cropped in the booklet by the designer; 02a, 02b, 06a and 06b are transparent `.webp` with the print's uneven edge, marked `cut: true` in `photos`, which drops the grey placeholder background), `images/interviews/` (17 interview photos, max 1600px), `images/ornament-*.png` (the two used as section ornaments) and `images/ornaments/` (ornaments extracted from the booklet plus the cover stone engraving; each song's is set by `orn` in `meta` and shown above its title. Songs 5 `branches` and 7 `star-flower` were added on 25 Nov from the `to homan book.pdf` proof, pp. 19 and 28).

## The Cypriot breve (U+0306): read this before touching fonts

The dialect marks consonants with a combining breve: ζ̆, σ̆, Σ̆, ξ̆, ψ̆. It is always stored as base letter + U+0306 (about 1,100 in the Greek data). There are also a few U+032E (breve below), e.g. τζ̆ει̮αμαί, which are intentional.

History of attempts:
1. **Newsreader/Fraunces/Noto (5 Sep):** the breve floated; those fonts lack U+0306.
2. **Manual CSS positioning:** broke with justified, hyphenated text. Dead end.
3. **Gentium Plus plus `<span class="brv">` nudges (9–11 Sep):** only looked right on one machine, because Google Fonts' subsets don't include U+0306.
4. **Current fix (16 Oct):** a self-hosted, modified Alegreya named **"Alegreya Choman"** (`fonts/alegreya-choman-{400,700}-{normal,italic}.woff2`). `tools/make_font.py` adds breve anchors to **ζ σ ξ ψ** and **Σ**, instances the weights, renames the font (OFL, licence in `fonts/OFL.txt`) and subsets it.

**Rules:**
- **Never wrap U+0306 in its own element.** `songs.js` only escapes text.
- **Every text font must be "Alegreya Choman"** (`var(--serif)`).
- Adding a weight or letter: download `Alegreya[wght].ttf` and `Alegreya-Italic[wght].ttf` from https://github.com/google/fonts/tree/main/ofl/alegreya into `tools/source/`, edit `make_font.py`, then `pip install fonttools brotli` and `cd tools && python3 make_font.py`.
- **Browsers:** confirmed in Chrome and in Safari on iPhone (owner, 27 Nov). Firefox not checked yet.

**Extracting Greek from the PDF:** use PyMuPDF (`import fitz`); `pdftotext` drops breves. Known PDF quirks: some breves come out as a spacing breve U+02D8 with stray spaces ("Χατ ζ˘ ήκυριακου"), one as a precomposed ῐ on the wrong letter, a few `τζ’` lack the breve, soft hyphens (U+00AD) mark line-end hyphenation, and footnote markers are small-size digit spans. The 12 Nov import cleaned all of these; the scripts were one-off and are not in the repo.

## Visual style (matched to the designer's booklet)

- **Alegreya** only (as Alegreya Choman). Palette tokens in `:root` of `css/style.css`: ochre `#BD7431` (cover, header, footer), sun `#FCC443`, soil `#3B2000`, cream `#EFE5D8`, heading orange `#B86A28`, small orange text `#9A531B`, white paper `#FFFEFB`. Dark mode has its own tokens.
- Ornaments are CSS masks on `.orn.a` / `.orn.b` above section titles. The vertical "το χώμαν" in the left margin of song pages copies the booklet's running head.
- **Text widths:** sections are 72rem wide; running text is capped for line length. The intro, Ευχαριστίες and Προ-παραγγελία all use `.prose.wide` (50rem, 1.2rem text on wide screens; unified 27 Nov). The song index, Συντελεστές, Φωτογραφίες and song pages use the full width.
- Credits in orange ("**Μουσική:** Παραδοσιακό"), person subheadings underlined orange, verse in the notes black italic, lyrics bold upright, photo captions small italic.

## Conversation history

1. **"Website text integration with Greek characters"** (5 Sep 2026, claude.ai), https://claude.ai/chat/e67fdd5c-8a33-45f3-bdd2-bce3e3afee4b. First build from the Word file, first English translation, first breve attempts.
2. **"Cypriot breve characters display issues"** (9–11 Sep 2026, claude.ai), https://claude.ai/chat/c7be4658-f74a-4544-8637-2782c63d760b. Gentium Plus and `.brv` nudges; advice for the designer on breves in InDesign.
3. **Booklet styling thread** (16 Oct 2026). Matched the site to the designer's PDF draft 4, built Alegreya Choman ("first styling draft").
4. **Single-page layout** (16 Oct 2026, Claude Code). Rebuilt on the single-page prototype ("single page layout", then "contributors rename, remove cover button", "orange header").
5. **Booklet draft 8** (12 Nov 2026, Claude Code). Commit "booklet draft 8 text, translation, photos": all Greek from draft 8 (titles, credits, notes, sources, per-song footnotes, lyrics for all 17 songs), English from the artist's Word files (replacing Claude's translation), new Ευχαριστίες and Φωτογραφίες sections, rebuilt Συντελεστές, copyright popup, track photos inside the songs, ornaments extracted, name switched to Symeon, lyrics made upright, superscript ordinals in credits, song 16's centred couplet (undone 13 Nov). Then the nav bar title was lowercased to "το χώμαν".
6. **Single releases** (13 Nov 2026, Claude Code). Added `js/release.js` and the "more coming" notes; site set to the full album at first, switched to `single1` (song 6 only) on 16 Nov, and to `single2` (songs 6 and 12) on 23 Nov.
7. **Album release** (27 Nov 2026, Claude Code). Full album live; single-release gating removed.
7. **Consolidated feedback** (13 Nov 2026, Claude Code, from the email "comments: to homan"): justified text, inset interview passages, page numbers turned into song links, two-disc index, sign-off on two lines, lowercase "to homan" in nav and footer, "Acknowledgements" in the nav, merged English artwork/photography credits, interview photo 32 removed, footnote target no longer recoloured, song 16 couplet no longer centred.
8. **Feedback part 4** (15 Nov 2026, Claude Code, from "Re: comments: to homan" of 14 Nov): Margarita "right" in photo 23, no line-final commas in lyrics, Greek lyric notes hidden in English, song 4's last couplet one stanza, footnote cross-references linked (`{a song-6-fn13-en}`). The translator's "See fn. 10" / "fn. 11" pointed at the tourkópoulos and glentzés notes, which are 13 and 14 on the site, so the text now says 13 and 14; the Greek "(σ. 40)" in song 12's note 5 was dropped; only "υποσημείωση 1" is linked, not the song title (owner, 16 Nov).

9. **Feedback part 5** (25 Nov 2026, Claude Code, from "Re: comments: to homan" of 25 Nov): Andreas Siantanis added to the thanks (Greek "τον Αντρέαν Σιαντάνη," with the list's article), ordinals raised in all text, song 6's note rewritten in both languages (the RIK recording, the Cypriot Music Archive; English title "Syrtos from Paphos"; the Greek mention of «Η Λενού» is linked to song 8), ornaments for songs 5 and 7.

## Conversation history addendum

9. **Designer's feedback** (19 Nov 2026, Claude Code, from Popi's email "gia to site" of 18 Nov): booklet photo crops, final cover, no line breaks inside names or after ordinals in credits.

## Open items

- **Designer's files of 18 Nov** (`wetransfer_for-site_2026-11-18_1157.zip`, not in the repo; ask the owner or the designer): cover, photo crops and two interview recrops (`interviews/17.jpg`, `25.jpg`) are in. Not used yet: `to homan no text.jpg` (artwork without text), `to homan title.png` / `title caramel.png` (title lettering) and the 3000px Spotify square (Open Graph candidate). The designer asks to do any resizing/recomposition of artwork herself.
- **Track numbering:** the index and song pages follow the booklet's two CDs (Δίσκος 1: songs 1–8, Δίσκος 2: 9–17, numbered per disc; `DISC1` in `songs.js`). The `#song-N` ids still run 1–17.
- **Possible PDF typos left as-is** for the artist: "τζ̆ιαι Πόλην" (song 13 lyrics), "Συγεγκριμένα" (song 16), "εκουβένγκιασα" (intro); "Κάτω στη Ρόδον" on the song page vs "Κάτω στην Ρόδον" in the booklet's track list. Latin look-alike letters inside some Greek words (e.g. "Aντώνης" with a Latin A) are also as in the source.
- **Caption differences** between the photo index and the booklet: photo 23 (Μαργαρίτα is "δεξιά"/"right", as in the booklet; owner confirmed 14 Nov), photo 17 ("Μαζί με" vs "Με"). The interview-section subtitle fixes the booklet's misspelling "συνεντέυξεις".
- **English spellings** follow the translator and sometimes differ from captions or credits (e.g. "Pittyris" in the text, "Pittiris" in captions; "Nicoletta Demetriou" vs Greek "Νικολέττα Δημητρίου").
- The ornaments in `images/ornaments/` are not used yet; they could replace or vary the two section ornaments.
- **Listen links:** `LISTEN_LINKS` in `js/site.js` point to the album on Spotify (27 Nov) and the YouTube playlist. Strip the `?si=` share parameter from any link the owner sends.
- **Social links** (27 Nov): Facebook (`facebook.com/simon.mercouris`) and Instagram (`instagram.com/smercour`) icons under the email in Επικοινωνία, labelled «Ακολουθήστε / Follow». Plain links in `index.html` (not `LISTEN_LINKS`), styled like the listen icons (`.listen.social`).
- **Social preview:** Open Graph tags in `index.html` use `https://tohoman.eu/` and `images/og.jpg` (27 Nov): the owner's wide banner (`banner.jpg`, 1709×650, kept in the parent folder, not in the repo) scaled to 1200 wide and padded above and below with its own ochre (rgb 187,117,48) to 1200×630, so Facebook and WhatsApp show it uncropped. Made with Pillow; remake it the same way if the banner changes. `cover.jpg` stays the album image in the structured data.
- A desktop TTF of Alegreya Choman for the designer's InDesign work.

## Workflow

The owner works on Windows in a clone of this repo and pushes to `main`. Open Claude Code in the repo root so this file is loaded. Commit messages are short and lowercase. Preview locally with `python -m http.server 8000` from the repo (`.claude/launch.json` in the repo has a "site" config for this). The album masters (MP3s) are not in the repo and must never be added: the repo is public. Browsers cache the JS and CSS hard; reload without cache after changes. Test a song page, English mode and the breve on desktop and phone after every change.
