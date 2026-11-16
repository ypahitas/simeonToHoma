# το χώμαν / To Homan: album website

Static bilingual (Greek/English) site for the album **το χώμαν** ("To Homan"), traditional songs of Cyprus by **Συμεών Μερκούρης / Symeon Mercouris** with **Στέλιος Παπαμιχαήλ / Stelios Papamichael**. It works as a digital version of the printed booklet: an introductory note, 17 songs (lyrics, credits, notes, interviews, sources, footnotes, photos), contributors, acknowledgements, interview photos and contact. Plain HTML/CSS/JS with no backend and no build step. Hosted from this repo: https://github.com/ypahitas/simeonToHoma

This file is the handoff for any new Claude session. Read it before changing anything.

## Sources of truth

Since 12 Nov 2026 the site follows the designer's booklet and the artist's English files, all kept in the parent folder (`C:\Users\y.pahitas\Downloads\simeon`, outside the repo):

- **Greek:** `to homan draft8.pdf` (140 pages), the booklet. Greek text, lyrics, credits, photo captions, contributors page, thanks, dedication and the legal notice all come from it. It replaced the earlier Word file `Κείμενα Δίσκου «Το χώμαν» (ΝΔ - ΣΜ) 01-09-26.docx`.
- **English:** the artist's own translation in `Kείμενα Δίσκου_το χώμαν_ΑΓΓΛΙΚΑ.docx` (intro and songs), `Στίχοι_το χώμαν ΑΓΓΛΙΚΑ.docx` (lyrics), `Συντελεστές Δίσκου_…ΑΓΓΛΙΚΑ.docx` (contributors), `Ευχαριστίες Δίσκου_…ΑΓΓΛΙΚΑ.docx` (thanks) and `Legal disclaimer + copyright_το χώμαν.docx`. It replaced Claude's earlier translation.
- **Photos:** `Track photos-….zip` (song photos, with a caption index .docx in Greek and English) and `Photos for back-….zip` (interview photos, also with an index).

Keep the text verbatim. It is in Cypriot dialect; spellings that look like typos are usually intentional. Fix only mechanical problems from extraction and list them for the owner.

## Fixed decisions (don't change without asking)

- **Names.** English: **Symeon Mercouris** (the artist's own spelling; the site used "Simon" until 12 Nov 2026) and **To Homan**. Greek: **Συμεών Μερκούρης** and **το χώμαν** (lowercase, as in the booklet; the nav bar uses "το χώμαν"). Never "Merkouris" with a k, or "The Soil" as the title. The email stays **simon.mercouris@gmail.com**.
- **Single-page layout** (chosen 16 Oct): `index.html` has a sticky bar, the ochre cover band, "Ο δίσκος" (the intro note; the artists column was removed on 13 Nov), the two-column song index, the song reader (one song at a time, routed by `#song-N`, credits in a sticky left column), then the sections Συντελεστές, Ευχαριστίες, Φωτογραφίες, Αγορά and Επικοινωνία, and the footer. Menu order: Ο δίσκος, Τραγούδια, Συντελεστές, Ευχαριστίες, Φωτογραφίες, Αγορά, Επικοινωνία. Below 940px the menu collapses to ☰ (the seven Greek links need about 920px on one line).
- `songs.html`, `contributors.html` and `contact.html` are only redirects to `index.html#…`, so old links keep working.
- **Lyrics are bold, not italic** (owner's request). In English mode each Greek stanza is followed by its English translation in lighter text; in Greek mode only the Greek shows. No comma at the end of a lyric line (owner, 14 Nov). Lyric footnotes follow the language: in English mode the Greek lyric markers and notes are hidden (they carry `lang="el"`) and only `lyricNotesEn` shows.
- **Releases** (decided 13 Nov): two singles come out before the album, and the site follows them, one version live at a time, all from `main` (no release branches). `js/release.js` sets `RELEASE` to `single1` (intro, song 6 «Τα στεφανώματα», contact), `single2` (intro, song 6 plus a second song still to be decided, contact) or `full`. Moving to the next release is a one-line commit. Unreleased songs are only hidden; their text is still in `album-data.js`, which the owner is fine with.
- **Ordinals in song credits** (1ο, 3η, 1st, 2nd…) are shown with the ending in superscript. This is done at render time in `songs.js` (`ordinals()`); the data stays plain.

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
- `js/release.js` (loaded in `<head>`): sets `window.__RELEASE__ = {name, songs}` (`songs` is null for the full album) and adds `html.partial` for a single. `?release=full|single1|single2` overrides it for previewing. In partial mode CSS hides everything marked `data-full` (the Συντελεστές, Ευχαριστίες and Φωτογραφίες sections and their menu links; Αγορά stays, and its ornament switches to leaves so the ornaments still alternate) and shows `p.soon`, the "more coming" note under the song index; the pager of the last released song shows "More songs coming soon". The "N / 17" count and the song numbers stay as on the album.
- `js/songs.js`: builds the song index and the articles of the current release's songs (both languages in the DOM) and handles routing: `#song-N`, `#song-N-fnM`, `#song-N-lfnM` (lyric note) show that song; anything else shows the main page.
- `js/site.js`: language toggle (`html[data-lang]`, saved in localStorage as `site-lang`, default `el`; the inline script in `index.html` sets it before first paint, and `?lang=en` works), the ochre `.bar.solid` header after the cover scrolls away, the copyright popup (`<dialog id="legal">`, opened from the footer link), and the mobile menu.
- Static HTML in `index.html`: intro note, Συντελεστές (separate `lang="el"` and `lang="en"` blocks, built from booklet pp. 10–11 and the contributors docx), Ευχαριστίες (dedication «Στον παπάν μου, Σπύρον (1954-2011)» on top; the English dedication is Claude's translation), Φωτογραφίες (gallery of `images/interviews/`, captions from the zip index), Αγορά (buy section, shown in every release including the singles: a button to a Stripe Payment Link, hosted checkout, no backend; the wording is Claude's), contact, footer and the legal dialog.
- Bilingual text uses paired `lang="el"` / `lang="en"` elements, toggled by the rules at the top of `css/style.css`. `.lyrics[lang="el"]` is exempt, so the Greek lyrics show in English mode too.
- Images: `images/cover.jpg` (placeholder render of the cover), `images/songs/` (23 track photos, max 1400px), `images/interviews/` (17 interview photos, max 1600px), `images/ornament-*.png` (the two used as section ornaments) and `images/ornaments/` (16 ornaments extracted from draft 8 plus the cover stone engraving; not used on the page yet).

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
- **Still to verify:** confirmed in Chrome only. Check Safari on iPhone and Firefox.

**Extracting Greek from the PDF:** use PyMuPDF (`import fitz`); `pdftotext` drops breves. Known PDF quirks: some breves come out as a spacing breve U+02D8 with stray spaces ("Χατ ζ˘ ήκυριακου"), one as a precomposed ῐ on the wrong letter, a few `τζ’` lack the breve, soft hyphens (U+00AD) mark line-end hyphenation, and footnote markers are small-size digit spans. The 12 Nov import cleaned all of these; the scripts were one-off and are not in the repo.

## Visual style (matched to the designer's booklet)

- **Alegreya** only (as Alegreya Choman). Palette tokens in `:root` of `css/style.css`: ochre `#BD7431` (cover, header, footer), sun `#FCC443`, soil `#3B2000`, cream `#EFE5D8`, heading orange `#B86A28`, small orange text `#9A531B`, white paper `#FFFEFB`. Dark mode has its own tokens.
- Ornaments are CSS masks on `.orn.a` / `.orn.b` above section titles. The vertical "το χώμαν" in the left margin of song pages copies the booklet's running head.
- Credits in orange ("**Μουσική:** Παραδοσιακό"), person subheadings underlined orange, verse in the notes black italic, lyrics bold upright, photo captions small italic.

## Conversation history

1. **"Website text integration with Greek characters"** (5 Sep 2026, claude.ai), https://claude.ai/chat/e67fdd5c-8a33-45f3-bdd2-bce3e3afee4b. First build from the Word file, first English translation, first breve attempts.
2. **"Cypriot breve characters display issues"** (9–11 Sep 2026, claude.ai), https://claude.ai/chat/c7be4658-f74a-4544-8637-2782c63d760b. Gentium Plus and `.brv` nudges; advice for the designer on breves in InDesign.
3. **Booklet styling thread** (16 Oct 2026). Matched the site to the designer's PDF draft 4, built Alegreya Choman ("first styling draft").
4. **Single-page layout** (16 Oct 2026, Claude Code). Rebuilt on the single-page prototype ("single page layout", then "contributors rename, remove cover button", "orange header").
5. **Booklet draft 8** (12 Nov 2026, Claude Code). Commit "booklet draft 8 text, translation, photos": all Greek from draft 8 (titles, credits, notes, sources, per-song footnotes, lyrics for all 17 songs), English from the artist's Word files (replacing Claude's translation), new Ευχαριστίες and Φωτογραφίες sections, rebuilt Συντελεστές, copyright popup, track photos inside the songs, ornaments extracted, name switched to Symeon, lyrics made upright, superscript ordinals in credits, song 16's centred couplet (undone 13 Nov). Then the nav bar title was lowercased to "το χώμαν".
6. **Single releases** (13 Nov 2026, Claude Code). Added `js/release.js` and the "more coming" notes; site set to the full album at first, switched to `single1` (song 6 only) on 16 Nov.
7. **Consolidated feedback** (13 Nov 2026, Claude Code, from the email "comments: to homan"): justified text, inset interview passages, page numbers turned into song links, two-disc index, sign-off on two lines, lowercase "to homan" in nav and footer, "Acknowledgements" in the nav, merged English artwork/photography credits, interview photo 32 removed, footnote target no longer recoloured, song 16 couplet no longer centred.
8. **Feedback part 4** (15 Nov 2026, Claude Code, from "Re: comments: to homan" of 14 Nov): Margarita "right" in photo 23, no line-final commas in lyrics, Greek lyric notes hidden in English, song 4's last couplet one stanza, footnote cross-references linked (`{a song-6-fn13-en}`). The translator's "See fn. 10" / "fn. 11" pointed at the tourkópoulos and glentzés notes, which are 13 and 14 on the site, so the text now says 13 and 14; the Greek "(σ. 40)" in song 12's note 5 was dropped; only "υποσημείωση 1" is linked, not the song title (owner, 16 Nov).

## Open items

- **Real cover artwork** (waiting on the designer); `images/cover.jpg` is a render of the PDF cover. The stone engraving alone is in `images/ornaments/cover-stone.png` if the title should become live text.
- **Track numbering:** the index and song pages follow the booklet's two CDs (Δίσκος 1: songs 1–8, Δίσκος 2: 9–17, numbered per disc; `DISC1` in `songs.js`). The `#song-N` ids still run 1–17.
- **Possible PDF typos left as-is** for the artist: "τζ̆ιαι Πόλην" (song 13 lyrics), "Συγεγκριμένα" (song 16), "εκουβένγκιασα" (intro); "Κάτω στη Ρόδον" on the song page vs "Κάτω στην Ρόδον" in the booklet's track list. Latin look-alike letters inside some Greek words (e.g. "Aντώνης" with a Latin A) are also as in the source.
- **Caption differences** between the photo index and the booklet: photo 23 (Μαργαρίτα is "δεξιά"/"right", as in the booklet; owner confirmed 14 Nov), photo 17 ("Μαζί με" vs "Με"). The interview-section subtitle fixes the booklet's misspelling "συνεντέυξεις".
- **English spellings** follow the translator and sometimes differ from captions or credits (e.g. "Pittyris" in the text, "Pittiris" in captions; "Nicoletta Demetriou" vs Greek "Νικολέττα Δημητρίου").
- The ornaments in `images/ornaments/` are not used yet; they could replace or vary the two section ornaments.
- **Second single:** not chosen yet; add its id to `single2` in `js/release.js`. The "more coming" wording (Greek and English) is Claude's; the owner may want to change it.
- Social-preview (Open Graph) tags (probably different per release) once the domain is known; a desktop TTF of Alegreya Choman for the designer's InDesign work.

## Workflow

The owner works on Windows (`C:\Users\y.pahitas\Downloads\simeon\git`) and pushes to `main`. Commit messages are short and lowercase. Preview locally with `python -m http.server 8000` from the repo (the parent folder's `.claude/launch.json` has a "site" config for this). Browsers cache the JS and CSS hard; reload without cache after changes. Test a song page, English mode and the breve on desktop and phone after every change.
