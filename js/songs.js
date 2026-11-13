(function(){
  "use strict";
  // Builds the song index and the 17 song "pages" from js/album-data.js,
  // then shows one song at a time, routed by #song-N.
  var DATA = window.__ALBUM_DATA__;
  var root = document.documentElement;
  var LANGS = ['el', 'en'];
  var STR = {
    el: { all: 'Όλα τα τραγούδια', prev: 'Προηγούμενο', next: 'Επόμενο', sources: 'Πηγές', note: 'σημείωση ' },
    en: { all: 'All songs', prev: 'Previous', next: 'Next', sources: 'Sources', note: 'note ' }
  };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  // The Cypriot breve (U+0306) is passed through untouched: the Alegreya Choman
  // font positions it over the letter itself. Never wrap it in its own element,
  // or the letter+mark cluster splits and the mark floats.
  // Escape, then turn the data's {i}…{/i} italics (used in the English) into <em>.
  function fmt(s){ return esc(s).replace(/\{i\}/g, '<em>').replace(/\{\/i\}/g, '</em>'); }
  function linkify(h){ return h.replace(/https?:\/\/[^\s<]+/g, function(u){ return '<a href="'+u+'" rel="noopener">'+u+'</a>'; }); }
  function both(el, en){ return '<span lang="el">'+esc(el)+'</span><span lang="en">'+esc(en)+'</span>'; }
  function songData(l, i){ return DATA[l].songs[i]; }
  // Only the songs of the current release (js/release.js) are built.
  var REL = window.__RELEASE__ || {};
  var LIST = DATA.meta.filter(function(m){ return !REL.songs || REL.songs.indexOf(m.id) > -1; });

  function withNotes(text, id, l, used){
    return fmt(text).replace(/\[\^(\d+)\]/g, function(m, n){
      if (used.indexOf(n) < 0) used.push(n);
      var a = id+'-fn'+n+(l==='en'?'-en':'');
      return '<sup class="fn"><a href="#'+a+'" aria-label="'+STR[l].note+n+'">'+n+'</a></sup>';
    });
  }

  // Ordinals as in the booklet: 1ο, 3η, 1st, 2nd with the ending raised.
  function ordinals(h){
    return h.replace(/(\d)(ο|η|ον|ης|st|nd|rd|th)(?![A-Za-zͰ-Ͽἀ-῿])/g, '$1<sup class="ord">$2</sup>');
  }

  function credits(l, list){
    return (list||[]).map(function(line){
      var i = line.indexOf(':');
      var inner = i > -1
        ? '<span class="k">'+esc(line.slice(0, i+1))+'</span> <span class="v">'+ordinals(esc(line.slice(i+1).trim()))+'</span>'
        : ordinals(esc(line));
      return '<li lang="'+l+'">'+inner+'</li>';
    }).join('');
  }

  function sourceBlock(l, items){
    return '<div class="srcs"><p class="src-label">'+STR[l].sources+'</p>'+
      items.map(function(s){ return '<p class="src">'+linkify(fmt(s))+'</p>'; }).join('')+'</div>';
  }

  // A photo with its caption in the current language.
  function figure(p, l){
    var cap = esc(p[l] || p.el);
    return '<figure class="ph'+(p.h > p.w ? ' tall' : '')+'"><img src="'+p.src+'" width="'+p.w+'" height="'+p.h+'" loading="lazy" alt="'+cap+'">'+
      '<figcaption>'+cap+'</figcaption></figure>';
  }

  // figs: [{at: index of the body item the photo goes before, p: photo}]
  function body(l, song, id, used, figs){
    var out = [], pending = [];
    figs = figs || [];
    function flush(){ if (pending.length){ out.push(sourceBlock(l, pending)); pending = []; } }
    function photosAt(k){ figs.forEach(function(f){ if (f.at === k){ flush(); out.push(figure(f.p, l)); } }); }
    (song.body||[]).forEach(function(b, k){
      photosAt(k);
      if (b.type === 'source'){ pending.push(b.text); return; }
      flush();
      if (b.type === 'p') out.push('<p>'+withNotes(b.text, id, l, used)+'</p>');
      else if (b.type === 'heading') out.push('<h4>'+fmt(b.text)+'</h4>');
      else if (b.type === 'verse') b.lines.forEach(function(ln, k){
        var cls = 'verse' + (k===0 ? ' vs' : '') + (k===b.lines.length-1 ? ' ve' : '');
        out.push('<p class="'+cls+'">'+withNotes(ln, id, l, used)+'</p>');
      });
    });
    figs.forEach(function(f){ if (f.at >= (song.body||[]).length){ flush(); out.push(figure(f.p, l)); } });
    flush();
    return out.join('\n');
  }

  // Footnotes live with each song (song.notes): the Greek numbered per song as in
  // the booklet, the English with the translation's own numbering.
  function notes(l, id, used, own){
    if (!used.length) return '';
    return '<ol class="notes">'+used.map(function(n){
      var t = (own && own[n]) || '';
      return '<li id="'+id+'-fn'+n+(l==='en'?'-en':'')+'" value="'+n+'">'+linkify(fmt(t))+'</li>';
    }).join('')+'</ol>';
  }

  // Lyrics: the Greek always shows; in English mode each Greek stanza is followed
  // by its translation (DATA.lyricsEn, one stanza per Greek stanza). Each language
  // has its own lyric footnotes (#song-N-lfnM and #song-N-lfnM-en).
  function lyricLines(lines, id, l, used){
    var suf = l === 'en' ? '-en' : '';
    return lines.map(function(ln){
      return fmt(ln).replace(/\[\^(\d+)\]/g, function(m, n){
        if (used.indexOf(n) < 0) used.push(n);
        return '<sup class="fn"><a href="#'+id+'-lfn'+n+suf+'" aria-label="'+STR[l].note+n+'">'+n+'</a></sup>';
      });
    }).join('<br>');
  }
  function lyricNotes(id, l, used, own){
    var suf = l === 'en' ? '-en' : '';
    // Greek lyric notes show in both languages, like the Greek lyrics themselves
    return used.length ? '<ol class="notes"'+(l === 'en' ? ' lang="en"' : '')+'>'+used.map(function(n){
      return '<li id="'+id+'-lfn'+n+suf+'" value="'+n+'">'+fmt(own[n]||'')+'</li>';
    }).join('')+'</ol>' : '';
  }
  function lyrics(id){
    var st = DATA.lyrics && DATA.lyrics[id];
    if (!st) return '';
    var tr = (DATA.lyricsEn && DATA.lyricsEn[id]) || [], usedEl = [], usedEn = [];
    // stanzas set as a centred couplet in the booklet (DATA.lyricsCentered)
    var centred = (DATA.lyricsCentered && DATA.lyricsCentered[id]) || [];
    var html = st.map(function(lines, k){
      var c = centred.indexOf(k) > -1 ? ' class="c"' : '';
      var en = tr[k] && tr[k].length ? '<p class="tr'+(c ? ' c' : '')+'" lang="en">'+lyricLines(tr[k], id, 'en', usedEn)+'</p>' : '';
      return '<p'+c+'>'+lyricLines(lines, id, 'el', usedEl)+'</p>'+en;
    }).join('');
    // .lyr shrinks to the longest line, so a centred couplet sits centred under the verses
    return '<div class="lyrics" lang="el"><div class="lyr">'+html+'</div>'+
      lyricNotes(id, 'el', usedEl, (DATA.lyricNotes && DATA.lyricNotes[id]) || {})+
      lyricNotes(id, 'en', usedEn, (DATA.lyricNotesEn && DATA.lyricNotesEn[id]) || {})+'</div>';
  }

  // k: position in LIST, so the pager only links released songs
  function pager(k){
    var prev = LIST[k-1], next = LIST[k+1];
    return '<nav class="pager" aria-label="tracks">'+
      (prev ? '<a class="pn prev" href="#'+prev.id+'">'+both(prev.title_el, prev.title_en)+'</a>' : '<span></span>')+
      (next ? '<a class="pn next" href="#'+next.id+'">'+both(next.title_el, next.title_en)+'</a>'
        // a single release: say more is coming where the next song would be
        : REL.songs ? '<span class="pn soon">'+both('Έρχονται κι άλλα τραγούδια', 'More songs coming soon')+'</span>' : '<span></span>')+
      '</nav>';
  }

  function track(m, k){
    var i = DATA.meta.indexOf(m), id = m.id, total = DATA.meta.length;
    var text = '', cr = '', fns = '';
    // Photos are placed by their position in the Greek text (as in the booklet);
    // the English text is laid out differently, so it gets the same relative spot.
    var photos = (DATA.photos && DATA.photos[id]) || [], elLen = songData('el', i).body.length;
    LANGS.forEach(function(l){
      var s = songData(l, i), used = [], n = (s.body||[]).length;
      var figs = photos.map(function(p){
        var at = l === 'el' ? p.at : Math.round(p.at * n / elLen);
        if (l === 'en') while (at > 0 && s.body[at-1] && s.body[at-1].type === 'source') at--;
        // never split a lead-in ("…he told me:") from the quote that follows it
        while (at < n && s.body[at-1] && /:\s*$/.test(s.body[at-1].text || '')) at++;
        return { at: at, p: p };
      });
      cr += credits(l, s.credits);
      text += '<div lang="'+l+'">'+body(l, s, id, used, figs)+'</div>';
      fns += '<div lang="'+l+'">'+notes(l, id, used, s.notes)+'</div>';
    });
    return '<article class="track" id="'+id+'" aria-labelledby="'+id+'-h">'+
      '<a class="back" href="#songs">'+both(STR.el.all, STR.en.all)+'</a>'+
      // the song's ornament from the booklet (an orange dot where the designer has none yet)
      '<header class="track-head">'+(m.orn
        ? '<span class="song-orn" aria-hidden="true" style="-webkit-mask-image:url(images/ornaments/'+m.orn+'.png);mask-image:url(images/ornaments/'+m.orn+'.png)"></span>'
        : '<span class="song-orn dot" aria-hidden="true"></span>')+
      '<p class="count">'+m.n+' / '+total+'</p>'+
      '<h3 id="'+id+'-h">'+both(songData('el', i).title, songData('en', i).title)+'</h3></header>'+
      '<div class="spread"><aside class="credits"><ul>'+cr+'</ul></aside>'+
      '<div class="text">'+lyrics(id)+text+fns+'</div></div>'+
      pager(k)+'</article>';
  }

  document.getElementById('song-index').innerHTML = LIST.map(function(m){
    return '<li><a href="#'+m.id+'"><span class="no">'+m.n+'</span>'+
      '<span class="tt" lang="el">'+esc(m.title_el)+'</span><span class="tt" lang="en">'+esc(m.title_en)+'</span></a></li>';
  }).join('');
  document.getElementById('tracks').innerHTML = LIST.map(track).join('\n');

  // Routing: #song-N (or a footnote inside it, #song-N-fnM) shows that song;
  // anything else shows the main page.
  var tracks = [].slice.call(document.querySelectorAll('.track'));
  function route(){
    var h = decodeURIComponent(location.hash.slice(1)), cur = null;
    tracks.forEach(function(t){
      var hit = h === t.id || h.indexOf(t.id+'-fn') === 0 || h.indexOf(t.id+'-lfn') === 0;
      t.classList.toggle('on', hit);
      if (hit) cur = t;
    });
    root.classList.toggle('reading', !!cur);
    if (cur && h === cur.id){
      window.scrollTo(0, 0);
      var hd = cur.querySelector('h3'); hd.setAttribute('tabindex', '-1'); hd.focus({ preventScroll: true });
    } else {
      // The target may have been hidden when the browser tried to scroll to it.
      var target = h && document.getElementById(h);
      if (target) target.scrollIntoView(); else if (!h) window.scrollTo(0, 0);
    }
  }
  window.addEventListener('hashchange', route);
  route();
})();
