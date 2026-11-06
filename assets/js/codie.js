/* codie.js — vanilla JS for the post-codie layout. Every feature is a no-op
   when its target elements are missing. */
(function () {
  'use strict';

  var STORAGE_KEY = 'marktube-theme';
  var root = document.documentElement;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function headerOffset() {
    var header = document.querySelector('.site-header');
    return (header ? header.offsetHeight : 0) + 16;
  }

  /* ---------- theme toggle ---------- */
  function initTheme() {
    var btn = document.getElementById('theme-toggle');
    if (!root.getAttribute('data-theme')) root.setAttribute('data-theme', 'light');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* storage blocked */ }
      reloadDisqus();
    });
  }

  // Disqus (Auto colour scheme) picks light/dark from the text colour it
  // inherits from the host page when the thread LOADS, and never listens to
  // data-theme. So after a toggle we re-run the embed in place (no page
  // reload); it re-samples the now-updated inherited colour. No-op when
  // Disqus is absent or not loaded yet (it will sample the right colour then).
  function reloadDisqus() {
    if (!document.getElementById('disqus_thread')) return;
    if (!window.DISQUS || typeof window.DISQUS.reset !== 'function') return;
    window.setTimeout(function () { // let the new CSS variables apply first
      window.DISQUS.reset({
        reload: true,
        config: function () {
          this.page.url = window.location.href.split('#')[0];
          if (window.disqus_identifier) this.page.identifier = window.disqus_identifier;
        }
      });
    }, 50);
  }

  /* ---------- progress bar ---------- */
  function initProgress() {
    var bar = document.getElementById('progress');
    if (!bar) return;
    var ticking = false;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, Math.max(0, (window.pageYOffset / max) * 100)) : 0;
      bar.style.width = pct + '%';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- TOC ---------- */
  // Keeps ASCII letters/digits and CJK; everything else collapses to "-".
  // Duplicates (and ids already present in the document) get -2, -3, ...
  function slugify(text, used) {
    var base = String(text).trim().toLowerCase()
      .replace(/[^a-z0-9\u3400-\u4dbf\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';
    var slug = base, n = 2;
    while (used[slug] || document.getElementById(slug)) { slug = base + '-' + n++; }
    used[slug] = true;
    return slug;
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  // One shared builder: collects the .prose h2-h6 list once (assigning
  // unique ids), then fills every TOC container (desktop sidebar + mobile
  // <details>). Indent depth (0-4) is relative to the shallowest level present.
  function buildToc(containers) {
    var prose = document.querySelector('.prose');
    if (!prose || !containers.length) return;
    // Direct prose headings only: skip those inside .lab cards / interactive blocks.
    var heads = Array.prototype.filter.call(prose.querySelectorAll('h2, h3, h4, h5, h6'), function (h) {
      return !(h.closest && h.closest('.lab, .lab-note, .equation'));
    });
    if (!heads.length) return; // containers stay empty -> CSS shows "暂无目录"
    var minLevel = 6;
    heads.forEach(function (h) { minLevel = Math.min(minLevel, parseInt(h.tagName.charAt(1), 10)); });

    var used = {};
    var items = [];
    Array.prototype.forEach.call(heads, function (h) {
      // Reassign when the id is missing or already taken by an earlier heading.
      if (!h.id || used[h.id]) {
        h.removeAttribute('id');
        h.id = slugify(h.textContent, used);
      } else {
        used[h.id] = true;
      }
      items.push({ head: h, depth: parseInt(h.tagName.charAt(1), 10) - minLevel, links: [] });
    });

    containers.forEach(function (container) {
      container.textContent = '';
      items.forEach(function (item) {
        var a = document.createElement('a');
        a.href = '#' + item.head.id;
        a.textContent = item.head.textContent;
        a.setAttribute('data-depth', String(item.depth));
        a.addEventListener('click', function (e) {
          e.preventDefault();
          scrollToId(item.head.id);
          if (history.replaceState) history.replaceState(null, '', '#' + item.head.id);
          var details = container.closest ? container.closest('details') : null;
          if (details) details.removeAttribute('open');
        });
        container.appendChild(a);
        item.links.push(a);
      });
    });

    var ticking = false;
    function highlight() {
      var line = headerOffset() + 8;
      var current = items[0];
      items.forEach(function (item) {
        if (item.head.getBoundingClientRect().top <= line) current = item;
      });
      items.forEach(function (item) {
        item.links.forEach(function (a) { a.classList.toggle('active', item === current); });
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(highlight); }
    }, { passive: true });
    highlight();
  }

  function initToc() {
    var containers = [];
    ['toc', 'toc-mobile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) containers.push(el);
    });
    buildToc(containers);
  }

  /* ---------- smooth scroll for in-page anchors (offset for sticky header) ---------- */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a || a.closest('.toc')) return; // TOC links handle themselves
      var id = a.getAttribute('href').slice(1);
      try { id = decodeURIComponent(id); } catch (err) { /* keep raw id */ }
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      scrollToId(id);
      if (history.replaceState) history.replaceState(null, '', '#' + id);
    });
  }

  // Each feature is isolated so one failure can never take down the others
  // (in particular, the TOC).
  function safe(fn) {
    try { fn(); } catch (e) { if (window.console) console.error('codie.js:', e); }
  }

  function init() {
    safe(initToc);
    safe(initTheme);
    safe(initProgress);
    safe(initAnchors);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
