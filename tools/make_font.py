from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.ttLib.tables import otTables as ot
from fontTools import subset
import copy

SRC = {'normal': 'source/Alegreya[wght].ttf', 'italic': 'source/Alegreya-Italic[wght].ttf'}
BASES = {'ζ': 'α', 'σ': 'α', 'ξ': 'α', 'ψ': 'α', 'Σ': 'Ζ'}   # base -> reference letter with a real anchor

def pts(font, g):
    gs = font.getGlyphSet(); pen = DecomposingRecordingPen(gs); gs[g].draw(pen)
    return [p for _, args in pen.value for p in args]

def mark_subtables(font):
    for lk in font['GPOS'].table.LookupList.Lookup:
        for st in lk.SubTable:
            if lk.LookupType == 9: st = st.ExtSubTable
            if type(st).__name__ == 'MarkBasePos' and 'uni0306' in st.MarkCoverage.glyphs:
                yield st

def patch(font, italic):
    cm = font.getBestCmap(); order = font.getReverseGlyphMap()
    for st in mark_subtables(font):
        mi = st.MarkCoverage.glyphs.index('uni0306')
        cls = st.MarkArray.MarkRecord[mi].Class
        bases = list(st.BaseCoverage.glyphs); recs = list(st.BaseArray.BaseRecord)
        for ch, ref in BASES.items():
            g, rg = cm[ord(ch)], cm[ord(ref)]
            if g in bases or rg not in bases: continue
            ra = recs[bases.index(rg)].BaseAnchor[cls]
            rp = pts(font, rg); ry = max(y for x, y in rp)
            p = pts(font, g); top = max(y for x, y in p); bot = min(y for x, y in p)
            # horizontal centre of the glyph's top band, so the mark sits over the stroke people see
            band = [x for x, y in p if y > top - (top - bot) * 0.22]
            x = (min(band) + max(band)) / 2
            # same clearance above the glyph as the reference letter has
            y = top + (ra.YCoordinate - ry)
            if ch == 'ζ' or ch == 'ξ': y -= 10      # their tops are thin hairlines; sit a touch closer
            a = ot.Anchor(); a.Format = 1; a.XCoordinate = round(x); a.YCoordinate = round(y)
            r = ot.BaseRecord(); r.BaseAnchor = [None] * st.ClassCount; r.BaseAnchor[cls] = a
            bases.append(g); recs.append(r)
        pairs = sorted(zip(bases, recs), key=lambda t: order[t[0]])
        st.BaseCoverage.glyphs = [b for b, _ in pairs]
        st.BaseArray.BaseRecord = [r for _, r in pairs]; st.BaseArray.BaseCount = len(pairs)

def rename(font, style, weight):
    fam = 'Alegreya Choman'
    for rec in font['name'].names:
        if rec.nameID in (1, 16): rec.string = fam
        elif rec.nameID in (4,): rec.string = f'{fam} {style}'
        elif rec.nameID in (6,): rec.string = f'AlegreyaChoman-{style.replace(" ","")}'
        elif rec.nameID == 3: rec.string = f'AlegreyaChoman-{style.replace(" ","")};{weight}'

UNI = '0020-007E,00A0-00FF,0131,0152-0153,02BC,02C6,02DA,02DC,0300-036F,0370-03FF,1F00-1FFF,2000-206F,20AC,2122,2190-2193,2212,25CF'
for style, src in SRC.items():
    for w in (400, 700):
        f = TTFont(src); f = instancer.instantiateVariableFont(f, {'wght': w}, updateFontNames=False)
        patch(f, style == 'italic')
        name = {400: 'Regular', 700: 'Bold'}[w] + (' Italic' if style == 'italic' else '')
        if name == 'Regular Italic': name = 'Italic'
        rename(f, name, w)
        tmp = f'tmp-{w}-{style}.ttf'; f.save(tmp)
        opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
        s = subset.Subsetter(opts); ft = subset.load_font(tmp, opts)
        s.populate(unicodes=[c for r in UNI.split(',') for c in (range(int(r.split('-')[0],16), int(r.split('-')[-1],16)+1))])
        s.subset(ft); out = f'../fonts/alegreya-choman-{w}-{style}.woff2'; subset.save_font(ft, out, opts); print(out)
