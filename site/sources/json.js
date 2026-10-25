// Generic JSON data source: polls a URL that returns readings in the shape HC.model.build()
// expects (see CLAUDE.md, "Readings"). Use it to feed the console from anything that isn't Home
// Assistant, e.g. a small bridge reading a Sigen gateway over Modbus, Node-RED, or a cloud API.
//
//   HC_CONFIG.source = 'json';
//   HC_CONFIG.json = { url: '/readings.json', intervalMs: 5000 };
//
// Serve the endpoint from the same origin as the page (or with CORS headers) so the browser may
// read it.
(function (HC) {
  'use strict';

  function create(cfg) {
    var opts = cfg.json || {}, readings = {}, status = 'connecting', onChange = function () {};

    function poll() {
      fetch(opts.url, { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) { readings = data || {}; status = 'ok'; onChange(); })
        .catch(function () { status = 'unreachable'; onChange(); })
        .then(function () { setTimeout(poll, opts.intervalMs || 5000); });
    }

    return {
      start: function (cb) {
        onChange = cb;
        if (!opts.url) { status = 'no url'; cb(); return; }
        poll();
      },
      read: function () { return readings; },
      status: function () { return status; },
    };
  }

  HC.sources = HC.sources || {};
  HC.sources.json = { create: create };
})(window.HC = window.HC || {});
