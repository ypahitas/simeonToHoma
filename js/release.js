// Which release the site shows. Only one is live at a time: change RELEASE,
// commit and push. Loaded in <head>, so hidden parts never flash on screen.
//
//   single1  intro, the first single, contact
//   single2  intro, both singles, contact
//   full     the whole album (contributors, thanks, photos, all 17 songs)
//
// To preview another release locally, add ?release=full (or single1, single2)
// to the address.
(function(){
  var RELEASE = 'single1';

  var RELEASES = {
    single1: ['song-6'],              // Τα στεφανώματα
    single2: ['song-6' /*, 'song-N' (to be decided) */],
    full: null                        // null = every song
  };

  try {
    var q = new URLSearchParams(location.search).get('release');
    if (q && q in RELEASES) RELEASE = q;
  } catch(e) {}

  window.__RELEASE__ = { name: RELEASE, songs: RELEASES[RELEASE] };
  // html.partial hides [data-full] (sections and menu links of the full album)
  // and shows .soon (the "more coming" notes).
  if (RELEASES[RELEASE]) document.documentElement.classList.add('partial');
})();
