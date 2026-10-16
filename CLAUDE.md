# Το χώμαν / To Homan: album website

Static bilingual (Greek/English) site for the album **Το χώμαν** ("To Homan"), traditional songs of Cyprus by **Συμεών Μερκούρης / Simon Mercouris** with **Στέλιος Παπαμιχαήλ / Stelios Papamichael**. It works as a digital booklet: an introductory note, 17 songs with credits, notes, interviews, sources and footnotes, contributors, and contact. Plain HTML/CSS/JS with no backend and no build step. Hosted from this repo: https://github.com/ypahitas/simeonToHoma

This file is the handoff for any new Claude session. Read it before changing anything.

## Fixed decisions (don't change without asking)

- **Names.** In English: **Simon Mercouris** and **To Homan**. In Greek: **Συμεών Μερκούρης** and **Το χώμαν** (lowercase χ). Never use "Symeon Merkouris" or "The Soil" as the title. The cover itself says "soil", which is fine.
- **Text is final-ish and owned by the artist.** Greek comes from the Word file `Κείμενα Δίσκου «Το χώμαν» (ΝΔ - ΣΜ) 01-09-26.docx`, written in Cypriot dialect; keep it verbatim. The English is Claude's translation, already reviewed in places. Don't rewrite either one unless asked.
- **Layout is the 4-page structure:** `index.html` (hero, cover, intro note), `songs.html` (sidebar list plus one song at a time, routed by `#song-N`), `contributors.html`, `contact.html`. Keep it.
- **Contact email:** simon.mercouris@gmail.com
- `indexTemplate2.html` is an old single-page template, kept for reference only.

## How the code works

- `js/site.js`: language toggle (`body[data-lang]`, saved in localStorage as `site-lang`, default `el`), mobile menu, and static footnotes for the intro note.
- `js/songs.js`: renders the songs page from the JSON in `<script id="album-data">` inside `songs.html` (`meta`, `el`, `en` and `footnotes`). Footnotes appear as `[^N]` in the text and open in the `#fn-panel` popup.
- Bilingual static text uses paired `lang="el"` and `lang="en"` elements, toggled by CSS rules at the end of `css/style.css`.

## The Cypriot breve (U+0306): read this before touching fonts

The dialect marks consonants with a combining breve: ζ̆ (~1,360 times), σ̆ (~260), Σ̆ (20), ξ̆ (8) and ψ̆ (2). It is always stored as base letter + U+0306.

History of attempts:
1. **Newsreader/Fraunces/Noto (5 Sep):** the breve floated. These fonts lack U+0306, so the browser drew it from another font and the letter and mark came apart.
2. **Manual CSS positioning (`position:absolute`):** broke when justified, hyphenated text reflowed. This is a dead end.
3. **Gentium Plus plus `<span class="brv">` with `vertical-align` and negative-margin nudges (9–11 Sep):** looked right on the developer's machine only. Google Fonts' subsets of Gentium Plus (and Alegreya) **don't include U+0306**, so the mark still came from each device's fallback font, and the nudge values were tuned to one particular fallback. A HarfBuzz test on 5 Sep also showed that no stock font (Gentium Plus or Book Plus, Noto, PT Serif, Cormorant) has anchors that position a breve over Greek consonants.
4. **Current fix (16 Oct, "first styling draft"):** a self-hosted, modified Alegreya named **"Alegreya Choman"** (`fonts/alegreya-choman-{400,700}-{normal,italic}.woff2`). Full Alegreya does contain U+0306 and has mark anchors on Greek vowels and Ζ. `tools/make_font.py` adds breve anchors to **ζ σ ξ ψ** (copied from α's clearance) and **Σ** (copied from Ζ), then instances the weights, renames the font (as the OFL requires; licence in `fonts/OFL.txt`) and subsets it to woff2. The browser's own shaping now centres the breve, the same way Word does.

**Rules that follow from this:**
- **Never wrap U+0306 in its own element.** A span splits the letter+mark cluster and disables the anchors. `stackBreves()` in `songs.js` is now a pass-through; the `.brv` CSS rule is a no-op kept for safety.
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
- The old tokens (`--wine`, `--sage`, `--paper`…) were kept and re-pointed to these colours. Booklet-specific overrides live in the "Booklet styling layer" at the end of `css/style.css`.
- **Ornaments** (`images/ornament-leaves.png`, `ornament-flower.png`) were cut from the PDF and are used as CSS masks on `hr.eyebrow-rule`.
- **Cover:** `images/cover.jpg` is a placeholder, a render of PDF page 1. Replace it with the original artwork when the designer sends it.
- Credits follow the booklet's "**Μουσική:** Παραδοσιακό" style in orange. Person subheadings are underlined orange. Verse is black italic.

## Conversation history (claude.ai)

1. **"Website text integration with Greek characters"** (5 Sep 2026), https://claude.ai/chat/e67fdd5c-8a33-45f3-bdd2-bce3e3afee4b. First build from the Word file: structure, the 17 songs, full English translation, footnotes, name corrections (Simon Mercouris / To Homan), the intro note added, the first breve attempts, and the HarfBuzz font test. Became the "Multipage Draft 1" commit.
2. **"Cypriot breve characters display issues"** (9–11 Sep 2026), https://claude.ai/chat/c7be4658-f74a-4544-8637-2782c63d760b. Why Word renders the breve and browsers don't; the move to Gentium Plus plus `.brv` nudges (the "breve" commits); contributors and footnote fixes; sidebar scrollbar styling; advice for the designer on breves in InDesign (Glyphs panel U+0306, a GREP style applying a character style).
3. **Booklet styling thread** (16 Oct 2026). Matched the site to the designer's PDF, diagnosed the U+0306 subset problem, built the patched Alegreya Choman font, and produced the commit **"first styling draft"** on top of "sidebar styling". The same thread also made a separate single-page prototype, which is now **superseded** and should be ignored.

## Open items

- The real cover artwork (waiting on the designer), and possibly the artwork without lettering, so the title can be live text.
- Lyrics: the Word file has notes but no lyrics. The booklet has them; add them when they're available.
- Booklet page references in the text ("σ. [39]", "[●]") mean nothing on the web. Ask whether to remove them or turn them into links to the right song.
- Source typos left as-is, pending the author: "Κάρπαθονν", "Ελλάδαςν", "Χουρμούζιο.ν", "Νοεβρίου", and a missing "(" in the Φωνή Κοτροφίσιμη vocals credit.
- Possible extras: social-preview (Open Graph) image tags once the domain is known, and a desktop TTF of Alegreya Choman for the designer's InDesign work, since the same anchors would fix the breve there too.

## Workflow

The owner works on Windows (`C:\Users\y.pahitas\Downloads\simeon\git`) and pushes to `main`. Commit messages are short and lowercase (e.g. "breve", "footnote", "first styling draft"). Preview locally with `python3 -m http.server 8000`. Test the songs page and the breve on both desktop and phone after every change.
