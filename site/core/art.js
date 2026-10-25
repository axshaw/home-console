// Small helpers shared by themes: seeded randomness, element lookup, flow lines, animation loop.
(function (HC) {
  'use strict';

  HC.art = {
    // Deterministic random numbers (mulberry32) so procedural scenery is identical on every load.
    rng: function (seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },

    // Collect every [data-k="name"] element under root into { name: element }.
    refs: function (root) {
      var el = {}, all = root.querySelectorAll('[data-k]');
      for (var i = 0; i < all.length; i++) el[all[i].getAttribute('data-k')] = all[i];
      return el;
    },

    // Set text only when it changes; DOM writes are the expensive part on slow tablets.
    text: function (el, k, v) { if (el[k] && el[k].textContent !== v) el[k].textContent = v; },

    // Animate a dashed "flow" path: speed follows power, direction follows sign, hidden when idle.
    // The path needs a CSS animation on stroke-dashoffset (see any theme's .flow rule).
    flow: function (path, kw, reverse) {
      if (!path) return;
      var s = HC.format.flowSpeed(kw);
      path.style.opacity = s ? 1 : 0;
      if (s) { path.style.animationDuration = s + 's'; path.style.animationDirection = reverse ? 'reverse' : 'normal'; }
    },

    clamp: function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); },

    // Fraction 0..1 of a gauge's full scale.
    frac: function (v, max) { return HC.art.clamp(Math.abs(v) / max, 0, 1); },

    // Run fn(dt, t) every animation frame until the theme's DOM is replaced (theme switched).
    loop: function (root, fn) {
      var marker = root.firstChild, last = 0;
      var raf = window.requestAnimationFrame || function (f) { return setTimeout(function () { f(Date.now()); }, 33); };
      function tick(t) {
        if (!marker || !document.body.contains(marker)) return;
        var dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
        last = t;
        fn(dt, t);
        raf(tick);
      }
      raf(tick);
    },
  };
})(window.HC = window.HC || {});
