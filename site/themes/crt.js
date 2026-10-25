// Retro terminal, Fallout style: a green Pip-Boy STAT screen where the house stands in for the
// character, with "limb condition" bars for each power source, and a RobCo-style boot sequence.
// Theme key stays 'crt' so saved choices and ?theme=crt URLs keep working.
window.Themes = window.Themes || {};

(function () {
  var G = '#2bff88', DIM = '#127a42', BG = '#021a0b';

  var CSS =
    '.theme-crt { background: radial-gradient(ellipse at 50% 45%, #06301a 0%, ' + BG + ' 65%, #000 100%); color:' + G + ';' +
      ' font-family: "Monofonto", "Share Tech Mono", "Consolas", "Droid Sans Mono", "Roboto Mono", monospace; text-transform: uppercase; }' +
    '.theme-crt .glow { position:absolute; left:0; top:0; right:0; bottom:0; text-shadow: 0 0 6px rgba(43,255,136,.7), 0 0 16px rgba(43,255,136,.25); animation: fofl 5s infinite; }' +
    '@keyframes fofl { 0%, 95%, 100% { opacity:1 } 96% { opacity:.85 } 97% { opacity:.97 } }' +
    '.theme-crt .abs { position:absolute; }' +
    // Pip-Boy header: a rule with tab labels; the selected tab is boxed and breaks the line.
    '.theme-crt .tabs { left:50px; right:50px; top:34px; height:44px; border-bottom:2px solid ' + G + '; display:flex; align-items:flex-end; font-size:30px; letter-spacing:2px; }' +
    '.theme-crt .tabs span { padding:0 22px 4px; margin-right:18px; color:' + DIM + '; }' +
    '.theme-crt .tabs span.on { color:' + G + '; border:2px solid ' + G + '; border-bottom:none; margin-bottom:-2px; padding-bottom:6px; background:' + BG + '; }' +
    '.theme-crt .tabs .clock { margin-left:auto; margin-right:0; padding-right:0; color:' + G + '; font-size:24px; }' +
    '.theme-crt .subtabs { left:90px; top:94px; font-size:22px; letter-spacing:3px; }' +
    '.theme-crt .subtabs span { margin-right:46px; color:' + DIM + '; }' +
    '.theme-crt .subtabs span.on { color:' + G + '; }' +
    '.theme-crt svg { position:absolute; left:0; top:0; }' +
    '.theme-crt svg .ln { fill:none; stroke:' + G + '; stroke-width:3; stroke-linejoin:round; stroke-linecap:round; }' +
    '.theme-crt svg .dim { stroke:' + DIM + '; }' +
    '.theme-crt svg .flow { fill:none; stroke:' + G + '; stroke-width:5; stroke-dasharray: 2 16; stroke-linecap:round; animation: foflow 1s linear infinite; }' +
    '@keyframes foflow { to { stroke-dashoffset:-18; } }' +
    '.theme-crt svg text { fill:' + G + '; font-size:20px; letter-spacing:2px; }' +
    '.theme-crt svg text.big { font-size:26px; }' +
    '.theme-crt svg text.c { text-anchor:middle; }' +
    '.theme-crt .side { width:270px; font-size:19px; line-height:30px; letter-spacing:1px; }' +
    '.theme-crt .side h4 { margin:0 0 6px; font-weight:400; font-size:19px; border-bottom:2px solid ' + DIM + '; color:' + G + '; }' +
    '.theme-crt .side div { display:flex; justify-content:space-between; color:' + DIM + '; }' +
    '.theme-crt .side b { color:' + G + '; font-weight:400; }' +
    // Pip-Boy footer: three framed boxes (HP / LEVEL / AP).
    '.theme-crt .foot { left:50px; right:50px; bottom:34px; height:46px; display:flex; font-size:24px; letter-spacing:2px; }' +
    '.theme-crt .foot > div { background: rgba(43,255,136,.14); display:flex; align-items:center; padding:0 18px; margin-right:12px; }' +
    '.theme-crt .foot .mid { flex:1; }' +
    '.theme-crt .foot .meter { flex:1; height:18px; border:2px solid ' + G + '; margin-left:16px; }' +
    '.theme-crt .foot .meter i { display:block; height:100%; background:' + G + '; transition: width 1s; }' +
    '.theme-crt .foot > div:last-child { margin-right:0; }' +
    '.theme-crt .boot { left:60px; top:50px; right:60px; font-size:24px; line-height:34px; white-space:pre; }' +
    '.theme-crt .cursor { animation: foblink 1s steps(1) infinite; }' +
    '@keyframes foblink { 50% { opacity:0 } }' +
    '.theme-crt .lines { position:absolute; left:0; top:0; right:0; bottom:0; pointer-events:none;' +
      ' background: repeating-linear-gradient(rgba(0,0,0,0) 0, rgba(0,0,0,0) 2px, rgba(0,0,0,.32) 3px, rgba(0,0,0,0) 4px); }' +
    '.theme-crt .vig { position:absolute; left:0; top:0; right:0; bottom:0; pointer-events:none; background: radial-gradient(ellipse at center, rgba(0,0,0,0) 62%, rgba(0,0,0,.8) 100%); }' +
    '.theme-crt .roll { position:absolute; left:0; right:0; height:110px; pointer-events:none; background: linear-gradient(rgba(43,255,136,0), rgba(43,255,136,.06), rgba(43,255,136,0)); animation: foroll 8s linear infinite; }' +
    '@keyframes foroll { from { top:-110px } to { top:800px } }';

  var BOOT = [
    'ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL',
    'HOME-01 POWER MANAGEMENT SUBSYSTEM',
    '',
    '> INITIALISING PIP-OS ............ OK',
    '> SOLAR ARRAY ..................... ONLINE',
    '> CELL BANK ....................... ONLINE',
    '> GRID UPLINK ..................... ONLINE',
    '> LOADING STAT INTERFACE',
  ];

  // House in the middle stands in for the character; "limb" bars sit around it.
  var CX = 640, CY = 395;
  var BARS = {
    solar: { x: CX - 60, y: 160, label: 'SOLAR' },
    grid:  { x: 300,     y: CY - 10, label: 'GRID' },
    load:  { x: 860,     y: CY - 10, label: 'HABITAT' },
    batt:  { x: CX - 60, y: 625, label: 'CELLS' },
  };

  function bar(key) {
    var b = BARS[key];
    return '<text x="' + (b.x + 60) + '" y="' + (b.y - 10) + '" class="c" data-k="' + key + 'Lbl">' + b.label + '</text>' +
      '<rect x="' + b.x + '" y="' + b.y + '" width="120" height="16" class="ln"/>' +
      '<rect x="' + (b.x + 3) + '" y="' + (b.y + 3) + '" width="0" height="10" fill="' + G + '" data-k="' + key + 'Fill" style="transition: width 1s"/>' +
      '<text x="' + (b.x + 60) + '" y="' + (b.y + 44) + '" class="c big" data-k="' + key + 'Val"></text>';
  }

  function art() {
    var roofY = CY - 90, floorY = CY + 50, L = CX - 75, R = CX + 75;
    // Sun with rays.
    var sun = '<circle cx="' + CX + '" cy="240" r="18" class="ln"/>';
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4, x1 = CX + Math.cos(a) * 27, y1 = 240 + Math.sin(a) * 27, x2 = CX + Math.cos(a) * 38, y2 = 240 + Math.sin(a) * 38;
      sun += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="ln"/>';
    }
    // Pylon (grid) on the left.
    var px = 470, pylon = '<path class="ln" d="M' + (px - 22) + ' ' + (CY + 50) + ' L' + px + ' ' + (CY - 60) + ' L' + (px + 22) + ' ' + (CY + 50) +
      ' M' + (px - 32) + ' ' + (CY - 35) + ' L' + (px + 32) + ' ' + (CY - 35) + ' M' + (px - 24) + ' ' + (CY - 10) + ' L' + (px + 24) + ' ' + (CY - 10) +
      ' M' + (px - 14) + ' ' + (CY + 15) + ' L' + (px + 14) + ' ' + (CY + 15) + '"/>';
    // Lightning bolt (household demand) on the right.
    var bx = 810, bolt = '<path class="ln" d="M' + (bx + 8) + ' ' + (CY - 50) + ' L' + (bx - 16) + ' ' + (CY + 2) + ' L' + (bx + 2) + ' ' + (CY + 2) +
      ' L' + (bx - 8) + ' ' + (CY + 50) + ' L' + (bx + 18) + ' ' + (CY - 8) + ' L' + bx + ' ' + (CY - 8) + ' Z"/>';
    // Battery below.
    var batY = 535, battery = '<rect x="' + (CX - 34) + '" y="' + batY + '" width="68" height="40" rx="4" class="ln"/>' +
      '<rect x="' + (CX - 10) + '" y="' + (batY - 8) + '" width="20" height="8" class="ln"/>' +
      '<rect x="' + (CX - 28) + '" y="' + (batY + 6) + '" width="0" height="28" fill="' + G + '" data-k="battIcon"/>';
    // House: roof, walls, door, window.
    var house = '<path class="ln" d="M' + (L - 18) + ' ' + (roofY + 62) + ' L' + CX + ' ' + roofY + ' L' + (R + 18) + ' ' + (roofY + 62) + '"/>' +
      '<path class="ln" d="M' + L + ' ' + (roofY + 50) + ' L' + L + ' ' + floorY + ' L' + R + ' ' + floorY + ' L' + R + ' ' + (roofY + 50) + '"/>' +
      '<rect x="' + (CX - 16) + '" y="' + (floorY - 52) + '" width="32" height="52" class="ln"/>' +
      '<rect x="' + (L + 16) + '" y="' + (floorY - 74) + '" width="30" height="26" class="ln"/>' +
      '<rect x="' + (R - 46) + '" y="' + (floorY - 74) + '" width="30" height="26" class="ln"/>' +
      '<rect x="' + (R - 40) + '" y="' + (roofY + 18) + '" width="16" height="28" class="ln"/>';
    // Power lines between the parts; direction set per update.
    var flows = '<path class="ln dim" d="M' + CX + ' 282 L' + CX + ' ' + (roofY - 6) + '"/><path class="flow" data-k="solarFlow" d="M' + CX + ' 282 L' + CX + ' ' + (roofY - 6) + '"/>' +
      '<path class="ln dim" d="M' + (px + 34) + ' ' + CY + ' L' + (L - 8) + ' ' + CY + '"/><path class="flow" data-k="gridFlow" d="M' + (px + 34) + ' ' + CY + ' L' + (L - 8) + ' ' + CY + '"/>' +
      '<path class="ln dim" d="M' + (R + 8) + ' ' + CY + ' L' + (bx - 26) + ' ' + CY + '"/><path class="flow" data-k="loadFlow" d="M' + (R + 8) + ' ' + CY + ' L' + (bx - 26) + ' ' + CY + '"/>' +
      '<path class="ln dim" d="M' + CX + ' ' + (floorY + 6) + ' L' + CX + ' ' + (batY - 14) + '"/><path class="flow" data-k="battFlow" d="M' + CX + ' ' + (floorY + 6) + ' L' + CX + ' ' + (batY - 14) + '"/>';
    return flows + sun + pylon + bolt + battery + house;
  }

  var el = {}, bootTimer = null;

  function boot(root) {
    var box = root.querySelector('.boot'), main = root.querySelector('.main'), n = 0;
    main.style.visibility = 'hidden';
    if (bootTimer) clearInterval(bootTimer);
    bootTimer = setInterval(function () {
      if (!document.body.contains(box)) { clearInterval(bootTimer); return; }
      n++;
      box.innerHTML = BOOT.slice(0, n).join('\n') + '\n<span class="cursor">█</span>';
      if (n > BOOT.length + 1) {
        clearInterval(bootTimer);
        box.style.display = 'none';
        main.style.visibility = 'visible';
      }
    }, 280);
  }

  window.Themes.crt = {
    mount: function (root) {
      root.innerHTML = '<style>' + CSS + '</style><div class="glow">' +
        '<div class="abs boot"></div>' +
        '<div class="main">' +
          '<div class="abs tabs"><span class="on">STAT</span><span>INV</span><span>DATA</span><span>MAP</span><span>RADIO</span><span class="clock" data-k="clock"></span></div>' +
          '<div class="abs subtabs"><span class="on">STATUS</span><span>SPECIAL</span><span>PERKS</span></div>' +
          '<svg width="1280" height="800" viewBox="0 0 1280 800">' + art() + bar('solar') + bar('grid') + bar('load') + bar('batt') + '</svg>' +
          '<div class="abs side" style="left:60px; top:150px"><h4>DATA // TODAY</h4>' +
            '<div><span>GENERATED</span><b data-k="dPv"></b></div><div><span>CONSUMED</span><b data-k="dLoad"></b></div>' +
            '<div><span>IMPORTED</span><b data-k="dImp"></b></div><div><span>EXPORTED</span><b data-k="dExp"></b></div></div>' +
          '<div class="abs side" style="right:60px; top:150px"><h4>ENVIRONMENT</h4>' +
            '<div><span>OUTSIDE</span><b data-k="outTemp"></b></div><div><span>SKY</span><b data-k="outCond"></b></div>' +
            '<div><span>HABITAT</span><b data-k="inTemp"></b></div><div><span>AIR</span><b data-k="air"></b></div></div>' +
          '<div class="abs side" style="right:60px; top:470px"><h4>SYSTEM</h4>' +
            '<div><span>STATUS</span><b data-k="state"></b></div><div><span>GRID LINK</span><b data-k="gridStatus"></b></div>' +
            '<div><span>CELL HEALTH</span><b data-k="soh"></b></div></div>' +
          '<div class="abs side" style="left:60px; top:470px"><h4>RADS</h4>' +
            '<div><span>GRID DRAW</span><b data-k="rads"></b></div><div><span>CELL TEMP</span><b data-k="cell"></b></div></div>' +
          '<div class="abs foot">' +
            '<div><span data-k="hp"></span></div>' +
            '<div class="mid"><span data-k="lvl"></span><div class="meter"><i data-k="lvlBar"></i></div></div>' +
            '<div><span data-k="caps"></span></div>' +
          '</div>' +
        '</div></div><div class="roll"></div><div class="lines"></div><div class="vig"></div>';
      el = {};
      var all = root.querySelectorAll('[data-k]');
      for (var i = 0; i < all.length; i++) el[all[i].getAttribute('data-k')] = all[i];
      boot(root);
    },

    update: function (m) {
      function t(k, v) { if (el[k] && el[k].textContent !== v) el[k].textContent = v; }
      function fill(k, frac) { el[k + 'Fill'].setAttribute('width', Math.max(0, Math.min(1, frac)) * 114); }
      function flow(k, kw, reverse) {
        var s = fmt.flowSpeed(kw), f = el[k + 'Flow'];
        f.style.opacity = s ? 1 : 0;
        if (s) { f.style.animationDuration = s + 's'; f.style.animationDirection = reverse ? 'reverse' : 'normal'; }
      }
      var gridNet = m.gridIn - m.gridOut;

      t('solarVal', fmt.kw(m.pv) + ' KW'); fill('solar', m.pv / 10);
      t('gridVal', (gridNet < -0.02 ? '-' : '') + fmt.kw(Math.abs(gridNet)) + ' KW'); fill('grid', Math.abs(gridNet) / 8);
      t('gridLbl', gridNet > 0.02 ? 'GRID ▸ IN' : gridNet < -0.02 ? 'GRID ◂ OUT' : 'GRID');
      t('loadVal', fmt.kw(m.load) + ' KW'); fill('load', m.load / 6);
      t('battVal', (m.batt > 0.02 ? '+' : '') + fmt.kw(m.batt) + ' KW'); fill('batt', m.soc / 100);
      t('battLbl', m.batt > 0.02 ? 'CELLS ▴ CHARGING' : m.batt < -0.02 ? 'CELLS ▾ DRAINING' : 'CELLS');
      el.battIcon.setAttribute('width', 56 * Math.max(0, Math.min(1, m.soc / 100)));

      flow('solar', m.pv, false);
      flow('grid', gridNet, gridNet < 0);
      flow('load', m.load, false);
      flow('batt', m.batt, m.batt < 0);

      // Fallout dates run in 2287; the month and day are real.
      t('clock', fmt.pad(m.now.getDate(), 2, '0') + '.' + fmt.pad(m.now.getMonth() + 1, 2, '0') + '.2287  ' + fmt.time(m.now));
      t('dPv', fmt.n(m.dailyPv, 1) + ' KWH'); t('dLoad', fmt.n(m.dailyLoad, 1) + ' KWH');
      t('dImp', fmt.n(m.dailyImport, 1) + ' KWH'); t('dExp', fmt.n(m.dailyExport, 1) + ' KWH');
      t('outTemp', fmt.n(m.outTemp) + '°C'); t('outCond', m.outCond || '--');
      t('inTemp', fmt.n(m.inTemp, 1) + '°C'); t('air', m.iaqClass || '--');
      t('state', m.link === 'ok' || m.link === 'demo' ? m.state : 'LINK ' + m.link);
      t('gridStatus', m.gridStatus); t('soh', fmt.n(m.soh) + '%');
      t('rads', fmt.kw(m.gridIn) + ' KW'); t('cell', fmt.n(m.cellTemp, 1) + '°C');

      t('hp', 'HP ' + fmt.n(m.soc) + '/100');
      t('lvl', 'LEVEL ' + fmt.n(m.selfSufficiency));
      el.lvlBar.style.width = Math.max(0, Math.min(100, m.selfSufficiency)) + '%';
      t('caps', 'CAPS ' + fmt.n(m.cost * 100));
    },
  };
})();
