// Holographic HUD: glowing nodes on a dark grid, energy streams whose speed follows the power.
(function (HC) {
  'use strict';
  var fmt = HC.format, Art = HC.art;
  var C = { cyan: '#39e6ff', solar: '#ffc94d', batt: '#4dffb0', grid: '#ff5ce1', home: '#39e6ff' };
  var R = 78, CIRC = 2 * Math.PI * R;

  var NODES = {
    solar: { x: 640, y: 150, label: 'SOLAR ARRAY', color: C.solar },
    grid:  { x: 230, y: 390, label: 'GRID UPLINK', color: C.grid },
    home:  { x: 1050, y: 390, label: 'HABITAT', color: C.home },
    batt:  { x: 640, y: 650, label: 'CELL BANK', color: C.batt },
  };
  var LINKS = {
    solar: 'M640 228 L640 352',
    grid:  'M308 390 L602 390',
    home:  'M678 390 L972 390',
    batt:  'M640 428 L640 572',
  };

  var CSS =
    '.theme-hud { background: radial-gradient(ellipse at 50% 45%, #0b2233 0%, #050b14 60%, #020409 100%); font-family: "Rajdhani", "Segoe UI", "Roboto", sans-serif; color: ' + C.cyan + '; }' +
    '.theme-hud .grid { position:absolute; left:0; top:0; right:0; bottom:0; background-image: linear-gradient(rgba(57,230,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(57,230,255,.06) 1px, transparent 1px); background-size: 40px 40px; }' +
    '.theme-hud .scan { position:absolute; left:0; right:0; height:140px; background: linear-gradient(transparent, rgba(57,230,255,.07), transparent); animation: hudscan 7s linear infinite; pointer-events:none; }' +
    '@keyframes hudscan { from { top:-140px } to { top:800px } }' +
    '.theme-hud svg { position:absolute; left:0; top:0; }' +
    '.theme-hud .base { fill:none; stroke: rgba(57,230,255,.18); stroke-width:2; }' +
    '.theme-hud .flow { fill:none; stroke-width:10; stroke-linecap:round; stroke-dasharray: 0.1 28; animation: hudflow 1s linear infinite; transition: opacity .6s; }' +
    '@keyframes hudflow { to { stroke-dashoffset: -28.1; } }' +
    '.theme-hud .val { font-size: 40px; font-weight: 600; fill: #fff; text-anchor: middle; }' +
    '.theme-hud .unit { font-size: 16px; fill: rgba(255,255,255,.6); text-anchor: middle; letter-spacing: 3px; }' +
    '.theme-hud .lbl { font-size: 15px; text-anchor: middle; letter-spacing: 4px; }' +
    '.theme-hud .stat { font-size: 13px; text-anchor: middle; letter-spacing: 3px; fill: rgba(255,255,255,.75); }' +
    '.theme-hud .top { position:absolute; left:40px; right:40px; top:22px; display:flex; justify-content:space-between; align-items:baseline; letter-spacing:5px; font-size:18px; }' +
    '.theme-hud .top b { color:#fff; font-size:30px; letter-spacing:3px; font-weight:600; }' +
    '.theme-hud .top .dot { display:inline-block; width:10px; height:10px; border-radius:50%; background:' + C.batt + '; box-shadow:0 0 10px ' + C.batt + '; margin-right:10px; animation: hudblink 2s infinite; }' +
    '@keyframes hudblink { 50% { opacity:.3 } }' +
    '.theme-hud .panel { position:absolute; width:300px; padding:14px 18px; background: rgba(8,30,45,.45); border:1px solid rgba(57,230,255,.25); font-size:15px; letter-spacing:2px; }' +
    '.theme-hud .panel:before, .theme-hud .panel:after { content:""; position:absolute; width:14px; height:14px; border-color:' + C.cyan + '; border-style:solid; }' +
    '.theme-hud .panel:before { left:-1px; top:-1px; border-width:2px 0 0 2px; }' +
    '.theme-hud .panel:after { right:-1px; bottom:-1px; border-width:0 2px 2px 0; }' +
    '.theme-hud .panel h4 { margin:0 0 10px; font-size:13px; letter-spacing:5px; font-weight:400; opacity:.7; }' +
    '.theme-hud .row { display:flex; justify-content:space-between; margin:5px 0; color: rgba(255,255,255,.8); }' +
    '.theme-hud .row span:last-child { color:#fff; font-weight:600; }' +
    '.theme-hud .bar { height:8px; background: rgba(57,230,255,.12); margin:3px 0 9px; }' +
    '.theme-hud .bar i { display:block; height:100%; background:' + C.solar + '; box-shadow: 0 0 8px ' + C.solar + '; transition: width .8s; }' +
    '.theme-hud .big { font-size:34px; color:#fff; font-weight:600; letter-spacing:1px; }';

  function node(key) {
    var n = NODES[key];
    var arc = key === 'batt'
      ? '<circle r="' + R + '" fill="none" stroke="' + n.color + '" stroke-width="6" stroke-linecap="round" transform="rotate(-90)" stroke-dasharray="0 ' + CIRC + '" data-k="socArc" filter="url(#hudglow)" style="transition: stroke-dasharray 1s"/>'
      : '';
    return '<g transform="translate(' + n.x + ' ' + n.y + ')">' +
      '<circle r="' + R + '" fill="url(#hudfill)" stroke="' + n.color + '" stroke-opacity=".35" stroke-width="2"/>' + arc +
      '<circle r="94" fill="none" stroke="' + n.color + '" stroke-opacity=".55" stroke-width="2" stroke-dasharray="3 9">' +
        '<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="' + (24 + key.length * 4) + 's" repeatCount="indefinite"/></circle>' +
      '<circle r="104" fill="none" stroke="' + n.color + '" stroke-opacity=".2" stroke-width="1" stroke-dasharray="60 40">' +
        '<animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="40s" repeatCount="indefinite"/></circle>' +
      '<text class="val" y="6" data-k="' + key + 'Val">--</text>' +
      '<text class="unit" y="30" data-k="' + key + 'Unit">KW</text>' +
      '<text class="lbl" y="-' + (R + 34) + '" fill="' + n.color + '">' + n.label + '</text>' +
      '<text class="stat" y="' + (R + 42) + '" data-k="' + key + 'Stat"></text>' +
      '</g>';
  }

  function link(key) {
    return '<path class="base" d="' + LINKS[key] + '"/>' +
      '<path class="flow" d="' + LINKS[key] + '" stroke="' + NODES[key].color + '" filter="url(#hudglowline)" data-k="' + key + 'Flow"/>';
  }

  var el = {};

  HC.themes.register('hud', {
    label: 'Holographic HUD',

    mount: function (root) {
      root.innerHTML = '<style>' + CSS + '</style><div class="grid"></div>' +
        '<svg width="1280" height="800" viewBox="0 0 1280 800"><defs>' +
          '<filter id="hudglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
          '<filter id="hudglowline" filterUnits="userSpaceOnUse" x="0" y="0" width="1280" height="800"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
          '<radialGradient id="hudfill"><stop offset="0" stop-color="#0e3348" stop-opacity=".9"/><stop offset="1" stop-color="#06131f" stop-opacity=".9"/></radialGradient>' +
        '</defs>' +
        link('solar') + link('grid') + link('home') + link('batt') +
        '<g transform="translate(640 390)">' +
          '<polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" fill="#08202e" stroke="' + C.cyan + '" stroke-width="2" filter="url(#hudglow)"/>' +
          '<circle r="52" fill="none" stroke="' + C.cyan + '" stroke-opacity=".4"><animate attributeName="r" values="46;62;46" dur="3s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".5;0;.5" dur="3s" repeatCount="indefinite"/></circle>' +
          '<text class="stat" y="5" style="font-size:12px">CORE</text>' +
        '</g>' +
        node('solar') + node('grid') + node('home') + node('batt') +
        '</svg>' +
        '<div class="top"><div><span class="dot" data-k="dot"></span>POWER CORE // <span data-k="site"></span> // <span data-k="state"></span></div><div><span data-k="date"></span> &nbsp; <b data-k="clock"></b></div></div>' +
        '<div class="panel" style="left:40px; top:90px"><h4>EXTERNAL</h4><div class="big" data-k="outTemp"></div><div class="row"><span data-k="outCond"></span><span></span></div>' +
          '<div class="row"><span>HABITAT</span><span data-k="inTemp"></span></div><div class="row"><span>AIR</span><span data-k="air"></span></div></div>' +
        '<div class="panel" style="right:40px; top:90px"><h4>CELL DIAGNOSTICS</h4>' +
          '<div class="row"><span>CAPACITY</span><span data-k="cap"></span></div><div class="row"><span>HEALTH</span><span data-k="soh"></span></div>' +
          '<div class="row"><span>CELL TEMP</span><span data-k="cell"></span></div><div class="row"><span>GRID LINK</span><span data-k="gridStatus"></span></div></div>' +
        '<div class="panel" style="left:40px; bottom:40px"><h4>ARRAY STRINGS</h4><div data-k="strings"></div></div>' +
        '<div class="panel" style="right:40px; bottom:40px"><h4>TODAY</h4>' +
          '<div class="row"><span>GENERATED</span><span data-k="dPv"></span></div><div class="row"><span>CONSUMED</span><span data-k="dLoad"></span></div>' +
          '<div class="row"><span>IMPORTED</span><span data-k="dImp"></span></div><div class="row"><span>EXPORTED</span><span data-k="dExp"></span></div>' +
          '<div class="row"><span>COST</span><span data-k="cost"></span></div><div class="row"><span>SELF-SUFFICIENT</span><span data-k="self"></span></div></div>' +
        '<div class="scan"></div>';
      el = Art.refs(root);
    },

    update: function (m) {
      function t(k, v) { Art.text(el, k, v); }
      function flow(k, kw, reverse) { Art.flow(el[k + 'Flow'], kw, reverse); }
      var gridNet = m.gridIn - m.gridOut;

      t('solarVal', fmt.kw(m.pv)); t('solarStat', m.pv > 0.02 ? 'GENERATING' : 'STANDBY');
      t('gridVal', fmt.kw(Math.abs(gridNet))); t('gridStat', gridNet > 0.02 ? 'IMPORTING' : gridNet < -0.02 ? 'EXPORTING' : 'IDLE');
      t('homeVal', fmt.kw(m.load)); t('homeStat', 'DEMAND');
      t('battVal', fmt.n(m.soc) + '%'); t('battUnit', (m.batt >= 0 ? '+' : '') + fmt.kw(m.batt) + ' KW');
      t('battStat', m.batt > 0.02 ? 'CHARGING' : m.batt < -0.02 ? 'DISCHARGING' : 'HOLDING');
      el.socArc.setAttribute('stroke-dasharray', (CIRC * m.soc / 100) + ' ' + CIRC);

      flow('solar', m.pv, false);
      flow('grid', gridNet, gridNet < 0);
      flow('home', m.load, false);
      flow('batt', m.batt, m.batt < 0);

      t('site', m.site);
      t('clock', fmt.time(m.now) + ':' + fmt.pad(m.now.getSeconds(), 2, '0'));
      t('date', m.now.toDateString().toUpperCase());
      t('state', (m.link === 'ok' || m.link === 'demo' ? m.state : 'LINK ' + m.link).toUpperCase());
      el.dot.style.background = el.dot.style.boxShadow = '';
      if (m.link !== 'ok' && m.link !== 'demo') { el.dot.style.background = C.grid; }

      t('outTemp', fmt.n(m.outTemp) + '°C'); t('outCond', m.outCond.toUpperCase());
      t('inTemp', fmt.n(m.inTemp, 1) + '°C'); t('air', m.iaqClass.toUpperCase());
      t('cap', fmt.n(m.capacity, 1) + ' KWH'); t('soh', fmt.n(m.soh) + '%'); t('cell', fmt.n(m.cellTemp, 1) + '°C');
      t('gridStatus', m.gridStatus.toUpperCase());
      t('dPv', fmt.n(m.dailyPv, 1) + ' KWH'); t('dLoad', fmt.n(m.dailyLoad, 1) + ' KWH');
      t('dImp', fmt.n(m.dailyImport, 1) + ' KWH'); t('dExp', fmt.n(m.dailyExport, 1) + ' KWH');
      t('cost', '£' + fmt.n(m.cost, 2)); t('self', fmt.n(m.selfSufficiency) + '%');

      if (!el.strings.firstChild) {
        el.strings.innerHTML = [1, 2, 3, 4].map(function (i) {
          return '<div class="row"><span>PV-' + i + '</span><span data-s="' + i + '"></span></div><div class="bar"><i data-b="' + i + '"></i></div>';
        }).join('');
      }
      m.strings.forEach(function (kw, i) {
        el.strings.querySelector('[data-s="' + (i + 1) + '"]').textContent = fmt.kw(kw) + ' KW';
        el.strings.querySelector('[data-b="' + (i + 1) + '"]').style.width = Math.min(100, kw / (m.max.pv / m.strings.length) * 100) + '%';
      });
    },
  });
})(window.HC);
