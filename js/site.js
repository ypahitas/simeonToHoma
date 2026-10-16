(function(){
  // Language toggle. The language lives on <html data-lang>, set before first
  // paint by the inline script in index.html, and is saved as "site-lang".
  var root = document.documentElement;
  var langBtn = document.getElementById('lang');
  if (langBtn) langBtn.addEventListener('click', function(){
    var next = root.getAttribute('data-lang') === 'en' ? 'el' : 'en';
    root.setAttribute('data-lang', next);
    root.lang = next;
    try { localStorage.setItem('site-lang', next); } catch(e) { /* storage unavailable */ }
  });

  // The bar turns ochre once the cover has scrolled up under it. On a song
  // page the cover is hidden, so the bar is ochre there from the start.
  var bar = document.querySelector('.bar'), hero = document.querySelector('.hero');
  if (bar && hero) {
    var updateBar = function(){
      var r = hero.getBoundingClientRect();   // all zero while the cover is hidden
      bar.classList.toggle('solid', r.height === 0 || r.bottom <= bar.offsetHeight);
    };
    window.addEventListener('scroll', updateBar, { passive: true });
    window.addEventListener('resize', updateBar);
    // after songs.js has shown or hidden the cover for the current #hash
    window.addEventListener('hashchange', function(){ setTimeout(updateBar, 0); });
    setTimeout(updateBar, 0);
  }

  // Mobile menu
  var menu = document.getElementById('menu'), nav = document.getElementById('nav');
  if (menu && nav) {
    menu.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function(e){
      if (e.target.closest('a')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
    });
  }
})();
