// Client-side filtering for papers.html: free-text search, type, and tags (AND).
// Filters are mirrored in the URL (?q=…&type=…&tag=a,b) so a filtered view can be shared.
(function () {
  'use strict';
  var q = document.getElementById('q');
  var typeSel = document.getElementById('type');
  var count = document.getElementById('count');
  var empty = document.getElementById('empty');
  var items = Array.prototype.slice.call(document.querySelectorAll('.paper'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.year-group'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-tag]'));
  var active = new Set();

  function readURL() {
    var p = new URLSearchParams(location.search);
    q.value = p.get('q') || '';
    typeSel.value = p.get('type') || '';
    (p.get('tag') || '').split(',').filter(Boolean).forEach(function (t) { active.add(t); });
  }

  function writeURL() {
    var p = new URLSearchParams();
    if (q.value.trim()) p.set('q', q.value.trim());
    if (typeSel.value) p.set('type', typeSel.value);
    if (active.size) p.set('tag', Array.from(active).join(','));
    var s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }

  function apply() {
    var terms = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var t = typeSel.value, shown = 0;
    items.forEach(function (li) {
      var tags = li.dataset.tags ? li.dataset.tags.split('|') : [];
      var ok = terms.every(function (w) { return li.dataset.search.indexOf(w) !== -1; }) &&
               (!t || li.dataset.type === t) &&
               Array.from(active).every(function (a) { return tags.indexOf(a) !== -1; });
      li.hidden = !ok;
      if (ok) shown++;
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector('.paper:not([hidden])'); });
    chips.forEach(function (c) { c.setAttribute('aria-pressed', active.has(c.dataset.tag) ? 'true' : 'false'); });
    count.textContent = 'Showing ' + shown + ' of ' + items.length + (shown === items.length ? '' : ' — clear filters to see all');
    empty.hidden = shown !== 0;
    writeURL();
  }

  function toggle(tag) { if (active.has(tag)) active.delete(tag); else active.add(tag); apply(); }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-tag]');
    if (el && (el.classList.contains('chip') || el.classList.contains('tag'))) { toggle(el.dataset.tag); }
  });
  q.addEventListener('input', apply);
  typeSel.addEventListener('change', apply);
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); }
  });

  readURL();
  apply();
})();
