// Demo data source: a sunny afternoon that gently wobbles, so every flow and gauge animates.
// Used with ?demo=1, for previews, screenshots and theme development.
(function (HC) {
  'use strict';

  // Pure: readings for a given moment (milliseconds), so tests can pin the clock.
  function readingsAt(ms) {
    var t = ms / 1000;
    var pv = 6.2 + Math.sin(t / 7) * 0.8;
    var load = 1.6 + Math.sin(t / 3) * 0.4;
    var batt = 3.1 + Math.sin(t / 11) * 0.5;
    var spare = pv - load - batt;
    return {
      pv: pv, load: load, batt: batt,
      gridIn: spare < 0 ? -spare : 0, gridOut: spare > 0 ? spare : 0,
      soc: 64 + Math.sin(t / 20) * 2, soh: 100, capacity: 27.12, cellTemp: 21.4,
      strings: [1.7, 1.6, 1.5, 1.4].map(function (s, i) { return s + Math.sin(t / (5 + i)) * 0.2; }),
      dailyPv: 18.4, dailyLoad: 14.2, dailyImport: 1.3, dailyExport: 4.9, cost: 0.31,
      state: 'Running', gridStatus: 'On Grid', outTemp: 19, outCond: 'sunny', inTemp: 21.2,
      iaqClass: 'Good', sunrise: 7.7, sunset: 17.4,
    };
  }

  HC.sources = HC.sources || {};
  HC.sources.demo = {
    readingsAt: readingsAt,
    create: function () {
      return {
        start: function () {},
        read: function () { return readingsAt(Date.now()); },
        status: function () { return 'demo'; },
      };
    },
  };
})(window.HC = window.HC || {});
