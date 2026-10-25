// Small helpers shared by the illustrated themes. ES2017-safe for old Fire tablet WebViews.
window.Art = {
  // Deterministic random numbers so procedural scenery looks the same on every load.
  rng: function (seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  },

  // Collect [data-k] elements under root into a lookup.
  refs: function (root) {
    var el = {}, all = root.querySelectorAll('[data-k]');
    for (var i = 0; i < all.length; i++) el[all[i].getAttribute('data-k')] = all[i];
    return el;
  },

  // Set text only when it changes (cheap on slow tablets).
  text: function (el, k, v) { if (el[k] && el[k].textContent !== v) el[k].textContent = v; },

  // Animate a dashed "flow" path: speed follows power, direction follows sign, hidden when idle.
  flow: function (path, kw, reverse) {
    if (!path) return;
    var s = fmt.flowSpeed(kw);
    path.style.opacity = s ? 1 : 0;
    if (s) { path.style.animationDuration = s + 's'; path.style.animationDirection = reverse ? 'reverse' : 'normal'; }
  },

  clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },

  // Run fn on every animation frame until root is removed from the page (theme switched).
  loop: function (root, fn) {
    var last = 0, raf = window.requestAnimationFrame || function (f) { return setTimeout(function () { f(Date.now()); }, 33); };
    function tick(t) {
      if (!document.body.contains(root.firstChild)) return;
      var dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
      last = t;
      fn(dt, t);
      raf(tick);
    }
    raf(tick);
  },
};
