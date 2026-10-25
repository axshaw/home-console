// Configuration layering: defaults (site/config.js) <- local overrides (config.local.js) <- URL.
(function (HC) {
  'use strict';

  function isPlainObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

  // Recursively merge `over` into a copy of `base`. Arrays and scalars replace; objects merge.
  function merge(base, over) {
    var out = {};
    Object.keys(base || {}).forEach(function (k) { out[k] = base[k]; });
    Object.keys(over || {}).forEach(function (k) {
      out[k] = isPlainObject(out[k]) && isPlainObject(over[k]) ? merge(out[k], over[k]) : over[k];
    });
    return out;
  }

  // Read ?key=value from a query string.
  function param(search, key) {
    var m = (search || '').match(new RegExp('[?&]' + key + '=([^&]*)'));
    return m ? decodeURIComponent(m[1]) : undefined;
  }

  // The effective configuration for this page load.
  function resolve(win) {
    var cfg = merge(win.HC_CONFIG || {}, win.HC_CONFIG_LOCAL || {});
    var search = win.location ? win.location.search : '';
    if (param(search, 'demo') === '1') cfg.source = 'demo';
    var theme = param(search, 'theme');
    if (theme) cfg.theme = theme;
    return cfg;
  }

  HC.config = { merge: merge, param: param, resolve: resolve };
})(window.HC = window.HC || {});
