// Number and time formatting shared by every theme.
// Plain ES2017 with no modules: this runs on old Fire tablet WebViews (see CLAUDE.md).
(function (HC) {
  'use strict';

  function isNum(v) { return typeof v === 'number' && isFinite(v); }

  HC.format = {
    // kW with two decimals; tiny noise around zero shows as 0.00 rather than -0.00.
    kw: function (v) { return isNum(v) ? (Math.abs(v) < 0.005 ? 0 : v).toFixed(2) : '--'; },

    // Any number to `digits` decimals, or '--' when the value is missing.
    n: function (v, digits) { return isNum(v) ? v.toFixed(digits || 0) : '--'; },

    // Left-pad to `len` characters (String.padStart is missing on the oldest WebViews).
    pad: function (s, len, ch) {
      s = String(s);
      while (s.length < len) s = (ch || ' ') + s;
      return s;
    },

    // 24-hour HH:MM.
    time: function (d) { return HC.format.pad(d.getHours(), 2, '0') + ':' + HC.format.pad(d.getMinutes(), 2, '0'); },

    // Decimal hour (7.75) as H:MM.
    hourMinutes: function (h) {
      var mins = Math.round((h % 1) * 60);
      return Math.floor(h) + (mins === 60 ? 1 : 0) + ':' + HC.format.pad(mins === 60 ? 0 : mins, 2, '0');
    },

    // Seconds for a dot to travel one dash period of a flow line: faster with more power,
    // null when the flow is effectively idle (themes hide the line).
    flowSpeed: function (kw) {
      if (!isNum(kw) || Math.abs(kw) < 0.02) return null;
      return Math.max(0.4, 3 / (0.5 + Math.abs(kw)));
    },
  };
})(window.HC = window.HC || {});
