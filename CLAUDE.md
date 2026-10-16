# Το χώμαν / To Homan: album website

Static bilingual (Greek/English) site for the album **Το χώμαν** ("To Homan"), traditional songs of Cyprus by **Συμεών Μερκούρης / Simon Mercouris** with **Στέλιος Παπαμιχαήλ / Stelios Papamichael**. It works as a digital booklet: an introductory note, 17 songs with credits, notes, interviews, sources and footnotes, contributors, and contact. Plain HTML/CSS/JS with no backend and no build step. Hosted from this repo: https://github.com/ypahitas/simeonToHoma

This file is the handoff for any new Claude session. Read it before changing anything.

## Fixed decisions (don't change without asking)

- **Names.** In English: **Simon Mercouris** and **To Homan**. In Greek: **Συμεών Μερκούρης** and **Το χώμαν** (lowercase χ). Never use "Symeon Merkouris" or "The Soil" as the title. The cover itself says "soil", which is fine.
- **Text is final-ish and owned by the artist.** Greek comes from the Word file `Κείμενα Δίσκου «Το χώμαν» (ΝΔ - ΣΜ) 01-09-26.docx`, written in Cypriot dialect; keep it verbatim. The English is Claude's translation, already reviewed in places. Don't rewrite either one unless asked.
- **Layout is a single page** (chosen by the owner on 16 Oct, replacing the old 4-page site): `index.html` has a sticky bar, the ochre cover band, "Ο δίσκος" (intro note plus an artists column), the two-column song index, the song reader (one song at a time, routed by `#song-N`, credits in a sticky left column, notes and sources under the text), "Συντελεστές" and "Επικοινωνία". Keep it. It is based on the designer-matched prototype `index-singlefile.html` (kept outside the repo), with its Google font, base64 images, "Symeon" names, and its own copy and translation removed.
- `songs.html`, `contributors.html` and `contact.html` are now only redirects to `index.html#…` (keeping the hash), so old links keep working.
- **Contact email:** simon.mercouris@gmail.com

## How the code works

- `js/album-data.js`: all album text as `window.__ALBUM_DATA__` (`meta`, `el`, `en`, `footnotes`, `lyrics`). Song bodies are lists of `p`, `heading`, `verse` and `source` items; the English songs keep their sources in a separate `sources` list. Footnotes appear as `[^N]` in the text (Greek only; the English has no markers). `lyrics` maps a song id to stanzas (lists of lines), shown in Greek in both languages.
- `js/songs.js`: builds the song index and all 17 song articles from that data, with both languages in the DOM, and handles routing (`#song-N` or `#song-N-fnM` shows that song; anything else shows the main page). Footnotes are listed under each song and linked from the superscripts.
- `js/site.js`: language toggle (`html[data-lang]`, saved in localStorage as `site-lang`, default `el`; the inline script in `index.html` sets it before first paint, and `?lang=en` also works) and the mobile menu.
- The intro note, its footnote, contributors and contact are static HTML in `index.html`.
- Bilingual text uses paired `lang="el"` and `lang="en"` elements, toggled by the rules at the top of `css/style.css`. `.lyrics[lang="el"]` is exempt, so lyrics show in English mode too.

## The Cypriot breve (U+0306): read this before touching fonts

The dialect marks consonants with a combining breve: ζ̆ (~1,360 times), σ̆ (~260), Σ̆ (20), ξ̆ (8) and ψ̆ (2). It is always stored as base letter + U+0306.

History of attempts:
1. **Newsreader/Fraunces/Noto (5 Sep):** the breve floated. These fonts lack U+0306, so the browser drew it from another font and the letter and mark came apart.
2. **Manual CSS positioning (`position:absolute`):** broke when justified, hyphenated text reflowed. This is a dead end.
3. **Gentium Plus plus `<span class="brv">` with `vertical-align` and negative-margin nudges (9–11 Sep):** looked right on the developer's machine only. Google Fonts' subsets of Gentium Plus (and Alegreya) **don't include U+0306**, so the mark still came from each device's fallback font, and the nudge values were tuned to one particular fallback. A HarfBuzz test on 5 Sep also showed that no stock font (Gentium Plus or Book Plus, Noto, PT Serif, Cormorant) has anchors that position a breve over Greek consonants.
4. **Current fix (16 Oct, "first styling draft"):** a self-hosted, modified Alegreya named **"Alegreya Choman"** (`fonts/alegreya-choman-{400,700}-{normal,italic}.woff2`). Full Alegreya does contain U+0306 and has mark anchors on Greek vowels and Ζ. `tools/make_font.py` adds breve anchors to **ζ σ ξ ψ** (copied from α's clearance) and **Σ** (copied from Ζ), then instances the weights, renames the font (as the OFL requires; licence in `fonts/OFL.txt`) and subsets it to woff2. The browser's own shaping now centres the breve, the same way Word does.

**Rules that follow from this:**
- **Never wrap U+0306 in its own element.** A span splits the letter+mark cluster and disables the anchors. `songs.js` passes text through untouched (only HTML-escaped).
- **Every text font must be "Alegreya Choman"** (`var(--serif)`). Don't load Google Fonts for text that can contain the breve.
- **Adding a weight or letter:** download `Alegreya[wght].ttf` and `Alegreya-Italic[wght].ttf` from https://github.com/google/fonts/tree/main/ofl/alegreya into `tools/source/`, edit `BASES` or the weights in `tools/make_font.py`, then run `pip install fonttools brotli` and `cd tools && python3 make_font.py`.
- **Still to verify:** confirmed in Chrome only. Check Safari on iPhone and Firefox.

## Visual style (matched to the designer's booklet, `pages_draft4.pdf`)

- The booklet uses **Alegreya** only (Regular, Medium, Bold, ExtraBold, Italic).
- **Palette** (sampled from the PDF; tokens in `:root` of `css/style.css`):
  - Ochre `#BD7431`: cover background and footer.
  - Sun `#FCC443`.
  - Soil brown `#3B2000`.
  - Cream `#EFE5D8`.
  - Heading orange `#B86A28`.
  - Small orange text `#9A531B`: the booklet orange darkened for legibility.
  - White paper `#FFFEFB`.
- Dark mode has its own tokens (`prefers-color-scheme`).
- **Ornaments** (`images/ornament-leaves.png`, `ornament-flower.png`) were cut from the PDF and are used as CSS masks on `.orn.a` and `.orn.b` above each section title. The vertical "το χώμαν" in the left margin of a song page copies the booklet's running head.
- **Cover:** `images/cover.jpg` is a placeholder, a render of PDF page 1. Replace it with the original artwork when the designer sends it.
- Credits follow the booklet's "**Μουσική:** Παραδοσιακό" style in orange. Person subheadings are underlined orange. Verse is black italic. Lyrics are bold italic, as in the booklet.
- The designer's PDF itself drops the breve in its bold italic lyrics (the text has U+0306, the font can't draw it). Alegreya Choman draws it.

## Conversation history (claude.ai)

1. **"Website text integration with Greek characters"** (5 Sep 2026), https://claude.ai/chat/e67fdd5c-8a33-45f3-bdd2-bce3e3afee4b. First build from the Word file: structure, the 17 songs, full English translation, footnotes, name corrections (Simon Mercouris / To Homan), the intro note added, the first breve attempts, and the HarfBuzz font test. Became the "Multipage Draft 1" commit.
2. **"Cypriot breve characters display issues"** (9–11 Sep 2026), https://claude.ai/chat/c7be4658-f74a-4544-8637-2782c63d760b. Why Word renders the breve and browsers don't; the move to Gentium Plus plus `.brv` nudges (the "breve" commits); contributors and footnote fixes; sidebar scrollbar styling; advice for the designer on breves in InDesign (Glyphs panel U+0306, a GREP style applying a character style).
3. **Booklet styling thread** (16 Oct 2026). Matched the site to the designer's PDF, diagnosed the U+0306 subset problem, built the patched Alegreya Choman font, and produced the commit **"first styling draft"** on top of "sidebar styling". The same thread also made a separate single-page prototype (`index-singlefile.html`).
4. **Single-page layout** (16 Oct 2026, Claude Code). The owner preferred that prototype's layout, so the site was rebuilt on it (commit "single page layout"), with the site's own text. The text of `pages draft4.pdf` was compared word for word (PyMuPDF extracts it with breves; `pdftotext` doesn't): the intro note and Μανές Μπάλος Πρώτος match the site exactly. Φωνή Κοτροφίσιμη got the PDF's lyrics and its reworded credits, but the owner chose to keep the site's notes, because the PDF's version has no breves, drops -ν endings, and has typos. The 134 word differences are in `kotrofisimi-pdf-differences.md` (outside the repo) for Simon to decide. The PDF's Μπάλος lyrics are a layout-filler copy of the Κοτροφίσιμη ones, so they were not used.

## Open items

- The real cover artwork (waiting on the designer), and possibly the artwork without lettering, so the title can be live text.
- Lyrics: only Φωνή Κοτροφίσιμη has them (from the PDF draft). Add the others to `lyrics` in `js/album-data.js` as the booklet pages arrive.
- Φωνή Κοτροφίσιμη: Simon to go through `kotrofisimi-pdf-differences.md`. Also the name: the PDF says "Χριστόφορος Πριγγόπουλος" (now used in the credits), the Word notes say "Χρίστος Πριγκόπουλλος" (his nickname there is Ττοφή).
- Booklet page references in the text ("σ. [39]", "[●]") mean nothing on the web. Ask whether to remove them or turn them into links to the right song.
- Source typos left as-is, pending the author: "Κάρπαθονν", "Ελλάδαςν", "Χουρμούζιο.ν", and "Νοεβρίου". (The missing "(" in the Φωνή Κοτροφίσιμη vocals credit is fixed by the PDF wording.)
- Possible extras: social-preview (Open Graph) image tags once the domain is known, and a desktop TTF of Alegreya Choman for the designer's InDesign work, since the same anchors would fix the breve there too.

## Workflow

The owner works on Windows (`C:\Users\y.pahitas\Downloads\simeon\git`) and pushes to `main`. Commit messages are short and lowercase (e.g. "breve", "footnote", "first styling draft"). Preview locally with `python3 -m http.server 8000`. Test a song page and the breve on both desktop and phone after every change.
