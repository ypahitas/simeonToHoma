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

  // Footnotes on static pages (e.g. the intro note on index.html).
  // songs.html has its own, richer footnote system in songs.js driven
  // by the embedded JSON data; this is the lightweight equivalent for
  // hardcoded prose pages, which only ever need a small, fixed set of
  // notes.
  var STATIC_FOOTNOTES = {
    el: { "1": "Δαμαί εννοώ τζ\u0306αι τον καλοφωνάρη τραγουδιστή με την κλασσική έννοια αλλά τζ\u0306αι κάποιον όι απαραίτητα καλλίφωνον: (α) που τσ\u0306αττίζει, δηλ. λέει αυτοσχέδιους στίχους «του καφκά» τζ\u0306αι «παλιώννει» με άλλον τραουδιστήν ή/τζ\u0306αι (β) συνθέτει τζ\u0306αι λέει ερωτικά δίστιχα ή ολιγόστιχα." },
    en: { "1": "Here I mean both the fine-voiced singer in the classical sense, and also someone who: (a) tsattizes, i.e. recites improvised verses \u201cout of the blue\u201d and \u2018spars\u2019 with another singer, and/or (b) composes and recites improvised love couplets or short verses." }
  };
  var fnPanel = document.getElementById("fn-panel");
  if (fnPanel) {
    var fnPanelNum = document.getElementById("fn-panel-num");
    var fnPanelText = document.getElementById("fn-panel-text");
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest ? e.target.closest("sup.fn[data-fn]") : null;
      if (!trigger) return;
      var n = trigger.getAttribute("data-fn");
      var lang = body.getAttribute("data-lang") === "en" ? "en" : "el";
      var text = (STATIC_FOOTNOTES[lang] && STATIC_FOOTNOTES[lang][n]) || (STATIC_FOOTNOTES.el && STATIC_FOOTNOTES.el[n]) || "";
      fnPanelNum.textContent = n;
      fnPanelText.textContent = text;
      fnPanel.classList.add("show");
    });
    var fnPanelClose = document.getElementById("fn-panel-close");
    if (fnPanelClose) {
      fnPanelClose.addEventListener("click", function () { fnPanel.classList.remove("show"); });
    }
  }
});