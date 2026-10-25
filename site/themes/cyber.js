// Neon city: a rain-soaked Blade Runner skyline, glass billboards with katakana, a holographic
// battery tower in the middle, a spinner crossing the sky and a scrolling news ticker.
(function (HC) {
  'use strict';
  var fmt = HC.format, Art = HC.art;
  var PINK = '#ff2a8a', CYAN = '#22e8ff', AMBER = '#ffb347', VIOLET = '#9b5cff';

  var CSS =
    '.theme-cyber { background: linear-gradient(#05000c 0%, #14062a 45%, #3a0d3d 72%, #5b1a2c 86%, #090008 100%); color:' + CYAN + ';' +
      ' font-family: "Roboto Condensed", "Arial Narrow", "Segoe UI", sans-serif; text-transform: uppercase; }' +
    '.theme-cyber .abs { position:absolute; }' +
    '.theme-cyber svg { position:absolute; left:0; top:0; }' +
    '.theme-cyber .rain i { position:absolute; top:-60px; width:1px; height:46px; background: linear-gradient(rgba(34,232,255,0), rgba(160,240,255,.45));' +
      ' animation: cyrain linear infinite; }' +
    '@keyframes cyrain { from { transform: translate(0, 0) } to { transform: translate(-90px, 900px) } }' +
    '.theme-cyber .neon-p { color:' + PINK + '; text-shadow: 0 0 4px ' + PINK + ', 0 0 14px ' + PINK + ', 0 0 30px rgba(255,42,138,.6); }' +
    '.theme-cyber .neon-c { color:' + CYAN + '; text-shadow: 0 0 4px ' + CYAN + ', 0 0 14px ' + CYAN + ', 0 0 30px rgba(34,232,255,.5); }' +
    '.theme-cyber .neon-a { color:' + AMBER + '; text-shadow: 0 0 4px ' + AMBER + ', 0 0 14px rgba(255,179,71,.8); }' +
    '.theme-cyber .flick { animation: cyflick 7s infinite; }' +
    '@keyframes cyflick { 0%, 41%, 43%, 45%, 100% { opacity:1 } 42%, 44% { opacity:.25 } }' +
    '.theme-cyber .glitch { animation: cyglitch 9s infinite; }' +
    '@keyframes cyglitch { 0%, 92%, 100% { transform:none } 93% { transform: translate(4px, -1px) skewX(-8deg) } 94% { transform: translate(-3px, 1px) } 95% { transform:none } }' +
    '.theme-cyber .title { left:46px; top:26px; font-size:34px; letter-spacing:6px; }' +
    '.theme-cyber .title small { font-size:18px; letter-spacing:4px; margin-left:16px; }' +
    '.theme-cyber .clock { right:52px; top:18px; text-align:right; font-size:64px; letter-spacing:4px; line-height:64px; }' +
    '.theme-cyber .clock small { display:block; font-size:18px; letter-spacing:6px; line-height:24px; }' +
    '.theme-cyber .panel { width:330px; padding:16px 20px 14px; background: rgba(12,2,28,.62); border:1px solid; }' +
    '.theme-cyber .panel .kat { float:right; font-size:22px; letter-spacing:2px; }' +
    '.theme-cyber .panel .lbl { font-size:18px; letter-spacing:5px; }' +
    '.theme-cyber .panel .val { font-size:58px; line-height:66px; color:#fff; letter-spacing:1px; }' +
    '.theme-cyber .panel .val small { font-size:22px; margin-left:8px; }' +
    '.theme-cyber .panel .sub { font-size:17px; letter-spacing:3px; opacity:.85; }' +
    '.theme-cyber .panel .bar { height:6px; margin-top:10px; background: rgba(255,255,255,.08); }' +
    '.theme-cyber .panel .bar i { display:block; height:100%; transition: width 1s; }' +
    '.theme-cyber .flow { fill:none; stroke-width:3; stroke-dasharray: 10 14; animation: cyflow 1s linear infinite; transition: opacity .6s; }' +
    '@keyframes cyflow { to { stroke-dashoffset:-24; } }' +
    '.theme-cyber .tick { left:0; right:0; bottom:0; height:44px; background: rgba(5,0,12,.85); border-top:2px solid ' + PINK + '; overflow:hidden; box-shadow: 0 -4px 20px rgba(255,42,138,.35); }' +
    '.theme-cyber .tick span { position:absolute; top:8px; white-space:nowrap; font-size:22px; letter-spacing:4px; animation: cytick 40s linear infinite; }' +
    '@keyframes cytick { from { transform: translateX(1300px) } to { transform: translateX(-3200px) } }';

  var el = {};

  function skyline() {
    var r = Art.rng(2049), s = '';
    // Far layer: tall hazy towers with sparse warm windows.
    for (var x = -20; x < 1300;) {
      var w = 40 + r() * 70, h = 180 + r() * 300, top = 690 - h;
      s += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" fill="#1c0b33"/>';
      for (var wy = top + 10; wy < 680; wy += 14) for (var wx = x + 6; wx < x + w - 6; wx += 10) {
        if (r() < 0.12) s += '<rect x="' + wx + '" y="' + wy + '" width="4" height="6" fill="' + (r() < 0.5 ? '#ffcf8a' : '#7fe9ff') + '" opacity="' + (0.25 + r() * 0.4) + '"/>';
      }
      x += w + r() * 14;
    }
    // A megatower with a blinking aviation light.
    s += '<path d="M1010 690 L1030 120 L1060 100 L1090 120 L1110 690 Z" fill="#12061f"/>' +
      '<rect x="1056" y="60" width="8" height="42" fill="#12061f"/>' +
      '<circle cx="1060" cy="58" r="4" fill="#ff3355"><animate attributeName="opacity" values="1;0;1" dur="1.6s" repeatCount="indefinite"/></circle>';
    for (var k = 0; k < 26; k++) s += '<rect x="' + (1036 + (k % 3) * 22) + '" y="' + (150 + Math.floor(k / 3) * 58) + '" width="10" height="3" fill="' + PINK + '" opacity=".7"/>';
    // Near layer: dark blocks, denser cool windows, rooftop antennas.
    for (x = -10; x < 1300;) {
      w = 60 + r() * 110; h = 90 + r() * 200; top = 760 - h;
      s += '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + h + '" fill="#08020f"/>';
      if (r() < 0.5) s += '<rect x="' + (x + w * 0.5) + '" y="' + (top - 30) + '" width="2" height="30" fill="#08020f"/>';
      for (wy = top + 8; wy < 750; wy += 12) for (wx = x + 5; wx < x + w - 5; wx += 9) {
        if (r() < 0.07) s += '<rect x="' + wx + '" y="' + wy + '" width="4" height="5" fill="' + (r() < 0.7 ? '#5fd8ff' : PINK) + '" opacity="' + (0.3 + r() * 0.5) + '"/>';
      }
      x += w + 4;
    }
    // Haze band above the horizon.
    s += '<rect x="0" y="520" width="1280" height="200" fill="url(#cyhaze)"/>';
    // Spinner: a small craft with a light trail drifting across the sky.
    s += '<g><path d="M-14 0 L14 0 L8 -6 L-6 -6 Z" fill="#2a1840"/><circle cx="12" cy="-1" r="2.5" fill="#fff"/><circle cx="-13" cy="-1" r="2" fill="#ff3355"/>' +
      '<rect x="-70" y="-1.5" width="56" height="2" fill="url(#cytrail)"/>' +
      '<animateMotion dur="26s" repeatCount="indefinite" path="M-120 300 C 300 250, 700 330, 1400 210"/></g>';
    return s;
  }

  function panel(key, x, y, color, cls, label, kat) {
    return '<div class="abs panel" style="left:' + x + 'px; top:' + y + 'px; border-color:' + color + '; box-shadow: 0 0 18px ' + color + '55, inset 0 0 22px ' + color + '22">' +
      '<span class="kat ' + cls + ' flick">' + kat + '</span><div class="lbl ' + cls + '">' + label + '</div>' +
      '<div class="val"><span data-k="' + key + 'Val"></span><small class="' + cls + '" data-k="' + key + 'Unit">KW</small></div>' +
      '<div class="sub ' + cls + '" data-k="' + key + 'Sub"></div><div class="bar"><i data-k="' + key + 'Bar" style="background:' + color + '; box-shadow:0 0 10px ' + color + '"></i></div></div>';
  }

  HC.themes.register('cyber', {
    label: 'Neon city',

    mount: function (root) {
      var rain = '';
      var r = Art.rng(7);
      for (var i = 0; i < 70; i++) {
        rain += '<i style="left:' + Math.round(r() * 1400) + 'px; animation-duration:' + (0.7 + r() * 0.6).toFixed(2) + 's; animation-delay:-' + (r() * 1.3).toFixed(2) + 's"></i>';
      }
      root.innerHTML = '<style>' + CSS + '</style>' +
        '<svg width="1280" height="800" viewBox="0 0 1280 800"><defs>' +
          '<linearGradient id="cyhaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6a3d" stop-opacity="0"/><stop offset=".7" stop-color="#ff6a3d" stop-opacity=".18"/><stop offset="1" stop-color="#ff2a8a" stop-opacity=".05"/></linearGradient>' +
          '<linearGradient id="cytrail"><stop offset="0" stop-color="#ffd27a" stop-opacity="0"/><stop offset="1" stop-color="#ffd27a" stop-opacity=".8"/></linearGradient>' +
          '<linearGradient id="cyliquid" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="' + CYAN + '" stop-opacity=".9"/><stop offset="1" stop-color="' + VIOLET + '" stop-opacity=".7"/></linearGradient>' +
        '</defs>' + skyline() +
        // Holographic battery tower in the centre.
        '<g transform="translate(640 200)">' +
          '<rect x="-90" y="0" width="180" height="380" rx="20" fill="rgba(10,0,30,.55)" stroke="' + CYAN + '" stroke-width="2"/>' +
          '<rect x="-30" y="-16" width="60" height="16" rx="4" fill="none" stroke="' + CYAN + '" stroke-width="2"/>' +
          '<rect x="-78" y="368" width="156" height="0" rx="12" fill="url(#cyliquid)" data-k="liquid" style="transition: all 1.2s"/>' +
          '<rect x="-84" y="0" width="168" height="3" fill="' + CYAN + '" opacity=".6"><animate attributeName="y" values="10;370;10" dur="4s" repeatCount="indefinite"/></rect>' +
          '<text x="0" y="200" text-anchor="middle" font-size="64" fill="#fff" style="text-shadow:none" data-k="soc"></text>' +
          '<text x="0" y="236" text-anchor="middle" font-size="20" fill="' + CYAN + '" letter-spacing="4" data-k="battState"></text>' +
          '<text x="0" y="420" text-anchor="middle" font-size="22" fill="' + PINK + '" letter-spacing="6">蓄電 CELL CORE</text>' +
        '</g>' +
        // Neon conduits from each billboard into the tower.
        '<path class="flow" stroke="' + AMBER + '" d="M400 230 L500 230 L550 290" data-k="pvFlow"/>' +
        '<path class="flow" stroke="' + PINK + '" d="M400 520 L500 520 L550 470" data-k="gridFlow"/>' +
        '<path class="flow" stroke="' + CYAN + '" d="M730 470 L780 520 L880 520" data-k="loadFlow"/>' +
        '<path class="flow" stroke="' + VIOLET + '" d="M880 230 L780 230 L730 290" data-k="battFlow"/>' +
        '</svg>' +
        '<div class="abs rain">' + rain + '</div>' +
        '<div class="abs title neon-p glitch">NEO-HOME 01<small class="neon-c">電力網 // POWER GRID</small></div>' +
        '<div class="abs clock neon-c"><span data-k="clock"></span><small class="neon-p" data-k="date"></small></div>' +
        panel('pv', 60, 140, AMBER, 'neon-a', 'SOLAR ARRAY', 'ソーラー') +
        panel('grid', 60, 430, PINK, 'neon-p', 'GRID LINK', '送電網') +
        panel('batt', 890, 140, VIOLET, 'neon-c', 'CELL FLOW', 'バッテリー') +
        panel('load', 890, 430, CYAN, 'neon-c', 'HABITAT DRAW', '居住区') +
        '<div class="abs tick"><span class="neon-a" data-k="ticker"></span></div>';
      el = Art.refs(root);
    },

    update: function (m) {
      var t = function (k, v) { Art.text(el, k, v); };
      var gridNet = m.gridIn - m.gridOut;
      t('pvVal', fmt.kw(m.pv)); t('pvSub', m.pv > 0.02 ? '▲ HARVESTING' : '■ ARRAY DORMANT'); el.pvBar.style.width = Art.frac(m.pv, m.max.pv) * 100 + '%';
      t('gridVal', fmt.kw(Math.abs(gridNet))); t('gridSub', gridNet > 0.02 ? '◀ IMPORTING FROM CITY' : gridNet < -0.02 ? '▶ SELLING TO CITY' : '■ LINK IDLE');
      el.gridBar.style.width = Art.frac(gridNet, m.max.grid) * 100 + '%';
      t('battVal', (m.batt > 0 ? '+' : '') + fmt.kw(m.batt)); t('battSub', 'HEALTH ' + fmt.n(m.soh) + '% · ' + fmt.n(m.cellTemp, 1) + '°C');
      el.battBar.style.width = Art.frac(m.batt, m.max.batt) * 100 + '%';
      t('loadVal', fmt.kw(m.load)); t('loadSub', 'HAB ' + fmt.n(m.inTemp, 1) + '°C · AIR ' + (m.iaqClass || '--'));
      el.loadBar.style.width = Art.frac(m.load, m.max.load) * 100 + '%';

      var h = 356 * Art.clamp(m.soc / 100, 0, 1);
      el.liquid.setAttribute('height', h); el.liquid.setAttribute('y', 368 - h);
      t('soc', fmt.n(m.soc) + '%');
      t('battState', m.batt > 0.02 ? 'CHARGING' : m.batt < -0.02 ? 'DISCHARGING' : 'STABLE');

      Art.flow(el.pvFlow, m.pv, false);
      Art.flow(el.gridFlow, gridNet, gridNet < 0);
      Art.flow(el.loadFlow, m.load, false);
      Art.flow(el.battFlow, m.batt, m.batt < 0);

      t('clock', fmt.time(m.now));
      t('date', '2049.' + fmt.pad(m.now.getMonth() + 1, 2, '0') + '.' + fmt.pad(m.now.getDate(), 2, '0') + ' · ' + (m.link === 'ok' || m.link === 'demo' ? 'NET ONLINE' : 'NET ' + m.link));
      t('ticker', '◆ SOLAR ' + fmt.kw(m.pv) + 'KW ◆ CELL CORE ' + fmt.n(m.soc) + '% ◆ GRID ' + (gridNet >= 0 ? 'DRAW ' : 'SELL ') + fmt.kw(Math.abs(gridNet)) + 'KW' +
        ' ◆ TODAY: HARVEST ' + fmt.n(m.dailyPv, 1) + 'KWH · CONSUMED ' + fmt.n(m.dailyLoad, 1) + 'KWH · CITY DRAW ' + fmt.n(m.dailyImport, 1) + 'KWH · COST £' + fmt.n(m.cost, 2) +
        ' ◆ SELF-SUFFICIENCY ' + fmt.n(m.selfSufficiency) + '% ◆ OUTSIDE ' + fmt.n(m.outTemp) + '°C ' + (m.outCond || '') + ' ◆ OFF-WORLD SOLAR CREDITS AVAILABLE NOW ◆');
    },
  });
})(window.HC);
