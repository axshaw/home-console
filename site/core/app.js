// The console app: picks the data source, scales the stage, switches themes and keeps the active
// theme fed with a fresh model.
(function (HC) {
  'use strict';

  var STAGE_W = 1280, STAGE_H = 800;
  var REDRAW_THROTTLE_MS = 400; // Sigen sensors update constantly; cap redraws on data changes
  var TICK_MS = 1000;           // clocks and demo data refresh once a second

  function createSource(cfg) {
    var factory = HC.sources[cfg.source || 'homeassistant'];
    if (!factory) throw new Error('Unknown data source "' + cfg.source + '"');
    return factory.create(cfg);
  }

  function start(win) {
    var doc = win.document;
    var cfg = HC.config.resolve(win);
    var stage = doc.getElementById('stage');
    var names = HC.themes.names(cfg.themes);
    var current = null, source;

    if ((cfg.source || 'homeassistant') === 'homeassistant') {
      var tok = HC.sources.homeassistant.resolveToken(cfg.token, win.HA_TOKEN, win.location.hash, win.localStorage);
      cfg.token = tok.token;
      if (tok.consumedHash && win.history.replaceState) win.history.replaceState(null, '', win.location.pathname + win.location.search);
    }
    source = createSource(cfg);

    function model() {
      return HC.model.build(source.read(), { now: new Date(), link: source.status(), site: cfg.site, max: cfg.scale });
    }

    function fit() {
      var s = Math.min(win.innerWidth / STAGE_W, win.innerHeight / STAGE_H);
      stage.style.transform = 'scale(' + s + ') translate(-50%, -50%)';
    }

    function show(name) {
      if (names.indexOf(name) < 0) name = names.indexOf(cfg.defaultTheme) >= 0 ? cfg.defaultTheme : names[0];
      current = HC.themes.get(name);
      stage.innerHTML = '';
      stage.className = 'theme-' + name;
      current.mount(stage);
      current.update(model());
      try { win.localStorage.setItem('theme', name); } catch (e) {}
    }

    function next() { show(names[(names.indexOf(current.name) + 1) % names.length]); }
    function refresh() { if (current) current.update(model()); }

    var saved = null;
    try { saved = win.localStorage.getItem('theme'); } catch (e) {}
    win.addEventListener('resize', fit);
    doc.getElementById('switch').addEventListener('click', next);
    fit();
    show(cfg.theme || saved || cfg.defaultTheme);

    if (cfg.rotateMinutes > 0) win.setInterval(next, cfg.rotateMinutes * 60000);
    win.setInterval(refresh, TICK_MS);

    var pending = false;
    source.start(function () {
      if (pending) return;
      pending = true;
      win.setTimeout(function () { pending = false; refresh(); }, REDRAW_THROTTLE_MS);
    });

    return { show: show, next: next, refresh: refresh, model: model };
  }

  HC.app = { start: start };
})(window.HC = window.HC || {});
