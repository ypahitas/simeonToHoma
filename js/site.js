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
