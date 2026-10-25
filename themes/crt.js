// Retro CRT terminal (Alien's Nostromo): amber phosphor text, ASCII bars and marching flow arrows.
window.Themes = window.Themes || {};

(function () {
  var W = 78; // characters per line
  var CSS =
    '.theme-crt { background: #0a0600; }' +
    '.theme-crt pre { position:absolute; left:46px; top:34px; margin:0; font: 26px/33px "Consolas", "Droid Sans Mono", "Roboto Mono", monospace; color:#ffb000;' +
      ' text-shadow: 0 0 6px rgba(255,176,0,.75), 0 0 18px rgba(255,120,0,.35); animation: crtflick 4s infinite; white-space:pre; }' +
    '.theme-crt .b { color:#ffe08a; } .theme-crt .d { color:#8a5c00; text-shadow:none; }' +
    '.theme-crt .i { background:#ffb000; color:#0a0600; text-shadow:none; }' +
    '.theme-crt .blink { animation: crtblink 1s steps(1) infinite; }' +
    '@keyframes crtblink { 50% { opacity:0 } }' +
    '@keyframes crtflick { 0%, 96%, 100% { opacity:1 } 97% { opacity:.82 } 98% { opacity:.95 } }' +
    '.theme-crt .lines { position:absolute; left:0; top:0; right:0; bottom:0; pointer-events:none;' +
      ' background: repeating-linear-gradient(rgba(0,0,0,0) 0, rgba(0,0,0,0) 2px, rgba(0,0,0,.35) 3px, rgba(0,0,0,0) 4px); }' +
    '.theme-crt .vig { position:absolute; left:0; top:0; right:0; bottom:0; pointer-events:none; background: radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,.75) 100%); }' +
    '.theme-crt .roll { position:absolute; left:0; right:0; height:90px; pointer-events:none; background: linear-gradient(rgba(255,176,0,0), rgba(255,176,0,.05), rgba(255,176,0,0)); animation: crtroll 9s linear infinite; }' +
    '@keyframes crtroll { from { top:-90px } to { top:800px } }';

  var BOOT = [
    'MU/TH/UR 182 MODEL 2.1 TERMINAL',
    'INTERFACE 2037 READY',
    '',
    '> LINK HABITAT POWER BUS ........... OK',
    '> POLL SOLAR ARRAY ................. OK',
    '> POLL CELL BANK ................... OK',
    '> POLL GRID UPLINK ................. OK',
    '> START TELEMETRY',
  ];

  var pre, tick = 0, bootUntil = 0, last = null, timer = null;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function span(cls, s) { return '<span class="' + cls + '">' + esc(s) + '</span>'; }
  function rpad(s, n) { s = String(s); while (s.length < n) s += ' '; return s.slice(0, n); }
  function dots(label, n) { var s = label + ' '; while (s.length < n) s += '.'; return s + ' '; }
  function bar(v, max, n) {
    var k = Math.round(Math.min(1, Math.abs(v) / max) * n), s = '';
    for (var i = 0; i < n; i++) s += i < k ? '█' : '░';
    return s;
  }
  function kw(v, sign) { return fmt.pad((sign && v > 0 ? '+' : '') + fmt.kw(v), 6) + ' KW'; }

  // A marching arrow: a run of chevrons with one bright head moving along it.
  function arrow(kwv, len, reverse) {
    if (Math.abs(kwv) < 0.02) return span('d', rpad(' ', len).replace(/ /g, '·'));
    var ch = reverse ? '<' : '>', speed = Math.max(1, Math.round(Math.abs(kwv) * 1.5)), head = (tick * speed) % len, out = '';
    for (var i = 0; i < len; i++) {
      var pos = reverse ? len - 1 - i : i;
      out += pos === head ? span('b', ch) : span('d', ch);
    }
    return out;
  }
  function down(kwv, reverse) {
    if (Math.abs(kwv) < 0.02) return span('d', '·');
    return tick % 2 ? span('b', reverse ? '^' : 'v') : span('d', reverse ? '^' : 'v');
  }

  function render() {
    var m = last;
    if (!m) return;
    var now = m.now, lines = [];
    var clock = fmt.time(now) + ':' + fmt.pad(now.getSeconds(), 2, '0');
    if (Date.now() < bootUntil) {
      var shown = Math.floor((Date.now() - (bootUntil - 2600)) / 300);
      for (var b = 0; b < Math.min(shown, BOOT.length); b++) lines.push(BOOT[b]);
      lines.push(span('blink', '█'));
      pre.innerHTML = lines.map(function (l) { return l.indexOf('<span') === 0 ? l : esc(l); }).join('\n');
      return;
    }
    var gridNet = m.gridIn - m.gridOut;
    var ok = m.link === 'ok' || m.link === 'demo';
    var rule = span('d', new Array(W + 1).join('─'));
    lines.push(span('i', rpad(' WEYLAND-YUTANI CORP  //  MU/TH/UR 6000', W - 10)) + span('i', rpad(clock + ' ', 10)));
    lines.push(rpad('HOME-01 POWER SUBSYSTEM', 48) + (ok ? 'STATUS: ' + span('b', m.state.toUpperCase()) : span('blink', 'STATUS: LINK ' + m.link.toUpperCase())));
    lines.push(rule);
    lines.push(dots('SOLAR ARRAY', 22) + span('b', kw(m.pv)) + '   ' + bar(m.pv, 10, 24) + '  ' + (m.pv > 0.02 ? 'GENERATING' : 'STANDBY'));
    lines.push(dots('CELL BANK', 22) + span('b', kw(m.batt, true)) + '   ' + bar(m.soc, 100, 24) + '  SOC ' + fmt.pad(fmt.n(m.soc), 3, '0') + '%');
    lines.push(dots('GRID UPLINK', 22) + span('b', kw(gridNet, true)) + '   ' + bar(gridNet, 8, 24) + '  ' + (gridNet > 0.02 ? 'IMPORTING' : gridNet < -0.02 ? 'EXPORTING' : 'STANDBY'));
    lines.push(dots('HABITAT LOAD', 22) + span('b', kw(m.load)) + '   ' + bar(m.load, 6, 24) + '  NOMINAL');
    lines.push(rule);
    lines.push('');
    lines.push('                ' + span('b', '[ SOLAR ]'));
    lines.push('                    ' + down(m.pv));
    lines.push('                    ' + down(m.pv));
    lines.push(span('b', '[ GRID ]') + ' ' + arrow(gridNet, 7, gridNet < 0) + ' ' + span('i', '[ CORE ]') + ' ' + arrow(m.load, 7) + ' ' + span('b', '[ HABITAT ]') +
      '    ' + span('d', 'EXT ') + fmt.n(m.outTemp) + '°C ' + m.outCond.toUpperCase());
    lines.push('                    ' + down(m.batt, m.batt < 0) + '                            ' + span('d', 'HAB ') + fmt.n(m.inTemp, 1) + '°C AIR ' + m.iaqClass.toUpperCase());
    lines.push('                    ' + down(m.batt, m.batt < 0));
    lines.push('                ' + span('b', '[ CELLS ]') + '  ' + (m.batt > 0.02 ? 'CHARGING' : m.batt < -0.02 ? 'DISCHARGING' : 'HOLDING'));
    lines.push('');
    lines.push(rule);
    lines.push('DAILY LOG     GEN ' + span('b', fmt.n(m.dailyPv, 1) + ' KWH') + '   USED ' + span('b', fmt.n(m.dailyLoad, 1) + ' KWH') +
      '   IMPORT ' + span('b', fmt.n(m.dailyImport, 1)) + '   EXPORT ' + span('b', fmt.n(m.dailyExport, 1)));
    lines.push('              COST ' + span('b', '£' + fmt.n(m.cost, 2)) + '   SELF-SUFFICIENCY ' + span('b', fmt.n(m.selfSufficiency) + '%') +
      '   CELL HEALTH ' + span('b', fmt.n(m.soh) + '%'));
    lines.push(rule);
    lines.push('> ' + span('blink', '█'));
    pre.innerHTML = lines.join('\n');
  }

  window.Themes.crt = {
    mount: function (root) {
      root.innerHTML = '<style>' + CSS + '</style><pre></pre><div class="roll"></div><div class="lines"></div><div class="vig"></div>';
      pre = root.querySelector('pre');
      bootUntil = Date.now() + 2600;
      if (timer) clearInterval(timer);
      // Arrows march faster than the 1 s data refresh; stop once another theme replaces us.
      timer = setInterval(function () {
        if (!document.body.contains(pre)) { clearInterval(timer); timer = null; return; }
        tick++;
        render();
      }, 250);
    },
    update: function (m) { last = m; render(); },
  };
})();
