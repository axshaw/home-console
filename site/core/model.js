// The energy model: the single object every theme renders.
//
// A data source produces *readings* (whatever it can measure). build() turns readings into a
// complete, normalised model so themes never have to guard against missing fields:
//   - power and energy fields are always finite numbers (missing -> 0)
//   - environment fields are a number or undefined (themes print '--' via HC.format)
//   - text fields are always strings
//   - derived values (gridNet, selfSufficiency, ...) are computed once, here
(function (HC) {
  'use strict';

  // Every reading a source may supply. Units: kW for power, kWh for energy, % for soc/soh.
  var NUMBERS = ['pv', 'load', 'gridIn', 'gridOut', 'batt', 'soc', 'soh', 'capacity', 'cellTemp',
    'dailyPv', 'dailyLoad', 'dailyImport', 'dailyExport', 'cost'];
  var OPTIONAL_NUMBERS = ['outTemp', 'inTemp'];
  var TEXT = { state: 'Unknown', gridStatus: 'Unknown', outCond: '', iaqClass: '' };
  var STRINGS = 4; // PV strings drawn by themes; extra are dropped, missing ones read 0

  // Default full-scale values for gauges, in kW. Override with HC_CONFIG.scale.
  var DEFAULT_MAX = { pv: 10, grid: 8, load: 6, batt: 8 };

  function num(v) {
    var x = typeof v === 'string' ? parseFloat(v) : v;
    return typeof x === 'number' && isFinite(x) ? x : undefined;
  }

  function build(readings, opts) {
    readings = readings || {};
    opts = opts || {};
    var m = {};

    NUMBERS.forEach(function (k) { var v = num(readings[k]); m[k] = v === undefined ? 0 : v; });
    OPTIONAL_NUMBERS.forEach(function (k) { m[k] = num(readings[k]); });
    Object.keys(TEXT).forEach(function (k) { m[k] = readings[k] ? String(readings[k]) : TEXT[k]; });

    var strings = Array.isArray(readings.strings) ? readings.strings : [];
    m.strings = [];
    for (var i = 0; i < STRINGS; i++) { var s = num(strings[i]); m.strings.push(s === undefined ? 0 : s); }

    m.soc = Math.max(0, Math.min(100, m.soc));
    m.sunrise = num(readings.sunrise) !== undefined ? num(readings.sunrise) : 7;
    m.sunset = num(readings.sunset) !== undefined ? num(readings.sunset) : 17.5;

    // Derived values.
    m.gridNet = m.gridIn - m.gridOut; // > 0 importing, < 0 exporting
    m.selfSufficiency = m.dailyLoad > 0 ? Math.max(0, Math.min(100, (1 - m.dailyImport / m.dailyLoad) * 100)) : 0;
    m.home = m.pv > 0.01 || m.batt < 0 ? 'solar' : 'grid';

    // Context from the app.
    m.now = opts.now || new Date();
    m.link = opts.link || 'connecting';
    m.site = opts.site || 'HOME-01';
    m.max = {};
    Object.keys(DEFAULT_MAX).forEach(function (k) {
      var v = opts.max && num(opts.max[k]);
      m.max[k] = v && v > 0 ? v : DEFAULT_MAX[k];
    });
    return m;
  }

  // True when the source is delivering data (live or demo), for "LINK …" status displays.
  function isLive(m) { return m.link === 'ok' || m.link === 'demo'; }

  HC.model = { build: build, isLive: isLive, DEFAULT_MAX: DEFAULT_MAX };
})(window.HC = window.HC || {});
