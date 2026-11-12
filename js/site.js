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

  // Copyright popup, opened from the footer link
  var legal = document.getElementById('legal'), legalOpen = document.getElementById('legal-open');
  if (legal && legalOpen && legal.showModal) {
    legalOpen.addEventListener('click', function(){ legal.showModal(); });
    document.getElementById('legal-close').addEventListener('click', function(){ legal.close(); });
    // a click on the dimmed backdrop (outside the box) closes it too
    legal.addEventListener('click', function(e){
      var r = legal.getBoundingClientRect();
      if (e.target === legal && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) legal.close();
    });
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
