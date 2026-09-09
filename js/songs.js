
(function(){
  "use strict";
  var DATA = window.__ALBUM_DATA__;
  var body = document.body;
  var state = { songId: DATA.meta[0].id };

  var STR = {
    el: { track: 'Κομμάτι ', sources: 'Πηγές', prev: '\u2190 ', next: ' \u2192' },
    en: { track: 'Track ', sources: 'Sources', prev: '\u2190 ', next: ' \u2192' }
  };

  function lang(){ return body.getAttribute('data-lang') === 'en' ? 'en' : 'el'; }
  function currentDict(){ return DATA[lang()]; }
  function songMeta(id){ return DATA.meta.filter(function(m){ return m.id===id; })[0]; }
  function songData(id){
    var idx = DATA.meta.findIndex(function(m){ return m.id===id; });
    var d = currentDict().songs;
    return Array.isArray(d) ? d[idx] : d[id];
  }

  function $(sel, ctx){ return (ctx||document).querySelector(sel); }
  function $all(sel, ctx){ return Array.prototype.slice.call((ctx||document).querySelectorAll(sel)); }
  function el(tag, attrs, children){
    var n = document.createElement(tag);
    if(attrs) for(var k in attrs){
      if(k === 'class') n.className = attrs[k];
      else if(k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (children||[]).forEach(function(c){
      if(c==null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }
  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function linkifyFootnotes(text){
    return text.replace(/\[\^(\d+)\]/g, function(m, n){
      return '<sup class="fn" data-fn="'+n+'" tabindex="0" role="button" aria-label="footnote '+n+'">'+n+'</sup>';
    });
  }
  // The combining breve (U+0306) marks a Cypriot-dialect sound on
  // consonants (σ̆, ζ̆) — a combination no Greek font, however good,
  // has anchor data for, since standard Greek only ever marks vowels
  // this way. We can't rely on font shaping to place it, so we nudge
  // it with plain, in-flow CSS (shrink + vertical-align) rather than
  // position:absolute — absolute positioning was tried before and
  // broke once these justified, hyphenated paragraphs reflowed, since
  // it takes the mark out of normal text flow. vertical-align never
  // leaves that flow, so it reflows and hyphenates safely along with
  // everything else. Must run on already-escaped text so the regex
  // only ever matches plain characters, not markup.
  function stackBreves(escapedText){
    return escapedText.replace(/\u0306/g, '<span class="brv">\u0306</span>');
  }
  function rich(s){ return stackBreves(escapeHtml(s)); }
  function richBody(s){ return linkifyFootnotes(stackBreves(escapeHtml(s))); }

  function renderParas(container, bodyItems){
    bodyItems.forEach(function(item){
      if(item.type === 'p'){
        container.appendChild(el('p', { html: richBody(item.text) }));
      } else if(item.type === 'heading'){
        container.appendChild(el('h3', { class:'subheading', html: rich(item.text) }));
      } else if(item.type === 'source'){
        // rendered separately below
      } else if(item.type === 'verse'){
        var bq = el('blockquote');
        item.lines.forEach(function(ln){ bq.appendChild(el('div', { html: richBody(ln) })); });
        container.appendChild(bq);
      }
    });
  }

  function renderNav(){
    var ol = $('#songs-nav-list'); ol.innerHTML = '';
    var strip = $('#songs-mobile-strip'); strip.innerHTML = '';
    DATA.meta.forEach(function(m){
      var title = lang()==='el' ? m.title_el : m.title_en;
      ol.appendChild(el('li', {}, [
        el('a', { href:'#'+m.id, class: m.id===state.songId?'active':'' }, [
          el('span', { class:'num' }, [String(m.n).padStart(2,'0')]),
          el('span', { html: rich(title) })
        ])
      ]));
      strip.appendChild(el('a', { href:'#'+m.id, class: m.id===state.songId?'active':'' }, [ String(m.n) ]));
    });
  }

  function renderSong(){
    var s = STR[lang()];
    var data = songData(state.songId);
    var meta = songMeta(state.songId);
    if(!data) return;

    $('#song-index').textContent = s.track + meta.n + ' / 17';
    $('#song-title').innerHTML = rich(data.title);

    var credits = $('#song-credits'); credits.innerHTML = '';
    (data.credits||[]).forEach(function(line){
      var idx = line.indexOf(':');
      var li = document.createElement('li');
      li.innerHTML = idx>-1 ? '<b>'+rich(line.slice(0,idx+1))+'</b> '+rich(line.slice(idx+1).trim()) : rich(line);
      credits.appendChild(li);
    });

    var bodyEl = $('#song-body'); bodyEl.innerHTML = '';
    renderParas(bodyEl, data.body);

    var sourceItems = (data.body||[]).filter(function(b){ return b.type==='source'; });
    var srcBlock = $('#song-sources'); srcBlock.innerHTML = '';
    if(sourceItems.length){
      srcBlock.appendChild(el('span', { class:'src-label' }, [s.sources]));
      sourceItems.forEach(function(it){ srcBlock.appendChild(el('div', { html: rich(it.text) })); });
    }

    var idx = DATA.meta.findIndex(function(m){ return m.id===state.songId; });
    var prev = DATA.meta[idx-1], next = DATA.meta[idx+1];
    var pager = $('#song-pager'); pager.innerHTML = '';
    pager.appendChild(prev ? el('a', { href:'#'+prev.id, html: s.prev+rich(lang()==='el'?prev.title_el:prev.title_en) }) : el('span'));
    pager.appendChild(next ? el('a', { href:'#'+next.id, html: rich(lang()==='el'?next.title_el:next.title_en)+s.next }) : el('span'));
  }

  function renderAll(){ renderNav(); renderSong(); }
  window.onLangChange = renderAll;

  function parseHash(){
    var id = location.hash.replace(/^#/, '');
    if(DATA.meta.some(function(m){ return m.id===id; })) state.songId = id;
  }

  window.addEventListener('hashchange', function(){
    parseHash();
    renderAll();
    window.scrollTo({top:0});
  });

  var fnPanel = $('#fn-panel');
  document.addEventListener('click', function(e){
    var t = e.target;
    if(t.classList && t.classList.contains('fn')){
      var n = t.dataset.fn;
      var text = DATA.footnotes[lang()][n] || DATA.footnotes.el[n] || '';
      $('#fn-panel-num').textContent = n;
      $('#fn-panel-text').innerHTML = rich(text);
      fnPanel.classList.add('show');
    } else if(!fnPanel.contains(t)){
      fnPanel.classList.remove('show');
    }
  });
  $('#fn-panel-close').addEventListener('click', function(){ fnPanel.classList.remove('show'); });

  parseHash();
  renderAll();
})();
