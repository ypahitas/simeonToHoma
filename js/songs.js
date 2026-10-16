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
  function linkify(h){ return h.replace(/https?:\/\/[^\s<]+/g, function(u){ return '<a href="'+u+'" rel="noopener">'+u+'</a>'; }); }
  function both(el, en){ return '<span lang="el">'+esc(el)+'</span><span lang="en">'+esc(en)+'</span>'; }
  function songData(l, i){ return DATA[l].songs[i]; }

  function withNotes(text, id, l, used){
    return esc(text).replace(/\[\^(\d+)\]/g, function(m, n){
      if (used.indexOf(n) < 0) used.push(n);
      var a = id+'-fn'+n+(l==='en'?'-en':'');
      return '<sup class="fn"><a href="#'+a+'" aria-label="'+STR[l].note+n+'">'+n+'</a></sup>';
    });
  }

  function credits(l, list){
    return (list||[]).map(function(line){
      var i = line.indexOf(':');
      var inner = i > -1
        ? '<span class="k">'+esc(line.slice(0, i+1))+'</span> <span class="v">'+esc(line.slice(i+1).trim())+'</span>'
        : esc(line);
      return '<li lang="'+l+'">'+inner+'</li>';
    }).join('');
  }

  function sourceBlock(l, items){
    return '<div class="srcs"><p class="src-label">'+STR[l].sources+'</p>'+
      items.map(function(s){ return '<p class="src">'+linkify(esc(s))+'</p>'; }).join('')+'</div>';
  }

  function body(l, song, id, used){
    var out = [], pending = [];
    function flush(){ if (pending.length){ out.push(sourceBlock(l, pending)); pending = []; } }
    (song.body||[]).forEach(function(b){
      if (b.type === 'source'){ pending.push(b.text); return; }
      flush();
      if (b.type === 'p') out.push('<p>'+withNotes(b.text, id, l, used)+'</p>');
      else if (b.type === 'heading') out.push('<h4>'+esc(b.text)+'</h4>');
      else if (b.type === 'verse') b.lines.forEach(function(ln, k){
        var cls = 'verse' + (k===0 ? ' vs' : '') + (k===b.lines.length-1 ? ' ve' : '');
        out.push('<p class="'+cls+'">'+withNotes(ln, id, l, used)+'</p>');
      });
    });
    flush();
    // The English data keeps its sources in a separate list.
    if (song.sources && song.sources.length) out.push(sourceBlock(l, song.sources));
    return out.join('\n');
  }

  function notes(l, id, used){
    if (!used.length) return '';
    return '<ol class="notes">'+used.map(function(n){
      var t = (DATA.footnotes[l] && DATA.footnotes[l][n]) || DATA.footnotes.el[n] || '';
      return '<li id="'+id+'-fn'+n+(l==='en'?'-en':'')+'" value="'+n+'">'+linkify(esc(t))+'</li>';
    }).join('')+'</ol>';
  }

  function lyrics(id){
    var st = DATA.lyrics && DATA.lyrics[id];
    if (!st) return '';
    return '<div class="lyrics" lang="el">'+st.map(function(lines){
      return '<p>'+lines.map(esc).join('<br>')+'</p>';
    }).join('')+'</div>';
  }

  function pager(i){
    var prev = DATA.meta[i-1], next = DATA.meta[i+1];
    return '<nav class="pager" aria-label="tracks">'+
      (prev ? '<a class="pn prev" href="#'+prev.id+'">'+both(prev.title_el, prev.title_en)+'</a>' : '<span></span>')+
      (next ? '<a class="pn next" href="#'+next.id+'">'+both(next.title_el, next.title_en)+'</a>' : '<span></span>')+
      '</nav>';
  }

  function track(m, i){
    var id = m.id, total = DATA.meta.length;
    var text = '', cr = '', fns = '';
    LANGS.forEach(function(l){
      var s = songData(l, i), used = [];
      cr += credits(l, s.credits);
      text += '<div lang="'+l+'">'+body(l, s, id, used)+'</div>';
      fns += '<div lang="'+l+'">'+notes(l, id, used)+'</div>';
    });
    return '<article class="track" id="'+id+'" aria-labelledby="'+id+'-h">'+
      '<a class="back" href="#songs">'+both(STR.el.all, STR.en.all)+'</a>'+
      '<header class="track-head"><p class="count">'+m.n+' / '+total+'</p>'+
      '<h3 id="'+id+'-h">'+both(songData('el', i).title, songData('en', i).title)+'</h3></header>'+
      '<div class="spread"><aside class="credits"><ul>'+cr+'</ul></aside>'+
      '<div class="text">'+lyrics(id)+text+fns+'</div></div>'+
      pager(i)+'</article>';
  }

  document.getElementById('song-index').innerHTML = DATA.meta.map(function(m){
    return '<li><a href="#'+m.id+'"><span class="no">'+m.n+'</span>'+
      '<span class="tt" lang="el">'+esc(m.title_el)+'</span><span class="tt" lang="en">'+esc(m.title_en)+'</span></a></li>';
  }).join('');
  document.getElementById('tracks').innerHTML = DATA.meta.map(track).join('\n');

  // Routing: #song-N (or a footnote inside it, #song-N-fnM) shows that song;
  // anything else shows the main page.
  var tracks = [].slice.call(document.querySelectorAll('.track'));
  function route(){
    var h = decodeURIComponent(location.hash.slice(1)), cur = null;
    tracks.forEach(function(t){
      var hit = h === t.id || h.indexOf(t.id+'-fn') === 0;
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
