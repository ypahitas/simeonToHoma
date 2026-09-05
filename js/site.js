document.addEventListener("DOMContentLoaded", function () {
  // Language toggle, persisted across pages
  var body = document.body;
  var saved = null;
  try { saved = localStorage.getItem("site-lang"); } catch(e) { /* storage unavailable, e.g. file:// or sandboxed preview */ }
  if (saved !== "en" && saved !== "el") saved = "el"; // this album's default reading language
  body.setAttribute("data-lang", saved);

  var langButtons = document.querySelectorAll(".lang-toggle");
  function updateButtons() {
    var lang = body.getAttribute("data-lang");
    langButtons.forEach(function (btn) {
      btn.textContent = lang === "en" ? "EL" : "EN";
      btn.setAttribute("aria-label", lang === "en" ? "Switch to Greek" : "Switch to English");
    });
  }
  updateButtons();

  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = body.getAttribute("data-lang") === "en" ? "el" : "en";
      body.setAttribute("data-lang", next);
      try { localStorage.setItem("site-lang", next); } catch(e) { /* storage unavailable */ }
      updateButtons();
      // Pages with dynamically-rendered content (e.g. songs.html) can
      // define this to re-render themselves in the new language.
      if (typeof window.onLangChange === "function") window.onLangChange();
    });
  });

  // Mobile nav toggle
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.querySelector(".main-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
});
