// LCARS (Star Trek: TNG) — elbows, pill buttons, chasing segment bars and a stardate.
(function (HC) {
  'use strict';
  var fmt = HC.format, Art = HC.art;
  var K = { orange: '#ff9c00', peach: '#ffcc99', lilac: '#cc99cc', blue: '#9999ff', red: '#cc6666', gold: '#ffcc66', sky: '#99ccff', tan: '#cc9966' };
  var SEGS = 24;

  var CSS =
    '.theme-lcars { background:#000; color:' + K.orange + '; font-family: "Antonio", "sans-serif-condensed", "Arial Narrow", "Roboto Condensed", sans-serif; text-transform: uppercase; }' +
    '.theme-lcars .abs { position:absolute; }' +
    '.theme-lcars .elbow { left:20px; top:20px; width:250px; height:150px; background:' + K.orange + '; border-top-left-radius:80px; }' +
    '.theme-lcars .elbow2 { left:20px; bottom:20px; width:250px; height:110px; background:' + K.lilac + '; border-bottom-left-radius:80px; }' +
    '.theme-lcars .cut { left:200px; top:80px; width:1080px; height:640px; background:#000; border-top-left-radius:40px; border-bottom-left-radius:40px; }' +
    '.theme-lcars .bar { height:60px; }' +
    '.theme-lcars .bar2 { height:30px; }' +
    '.theme-lcars .side { left:20px; width:180px; height:62px; color:#000; font-size:22px; text-align:right; box-sizing:border-box; padding:30px 12px 0 0; }' +
    '.theme-lcars .title { right:30px; top:6px; font-size:58px; letter-spacing:2px; line-height:60px; color:' + K.orange + '; background:#000; padding:0 14px; }' +
    '.theme-lcars .sub { left:290px; top:96px; font-size:26px; color:' + K.peach + '; letter-spacing:2px; }' +
    '.theme-lcars .sys { left:290px; width:640px; height:120px; }' +
    '.theme-lcars .pill { position:absolute; left:0; top:0; width:210px; height:48px; border-radius:24px 0 0 24px; color:#000; font-size:26px; line-height:52px; text-align:right; padding-right:14px; box-sizing:border-box; }' +
    '.theme-lcars .num { position:absolute; left:225px; top:-6px; font-size:54px; line-height:60px; color:#fff; }' +
    '.theme-lcars .num small { font-size:26px; color:' + K.peach + '; margin-left:6px; }' +
    '.theme-lcars .state { position:absolute; right:0; top:4px; font-size:26px; }' +
    '.theme-lcars .segs { position:absolute; left:0; top:62px; width:640px; display:flex; }' +
    '.theme-lcars .segs i { flex:1; height:30px; margin-right:4px; background:#222; }' +
    '.theme-lcars .segs i.on { animation: lcchase 1.2s linear infinite; }' +
    '@keyframes lcchase { 0%, 70% { opacity:1 } 85% { opacity:.35 } 100% { opacity:1 } }' +
    '.theme-lcars .cells { left:980px; top:150px; width:260px; }' +
    '.theme-lcars .cells h3 { margin:0 0 6px; font-weight:400; font-size:26px; color:' + K.sky + '; text-align:right; }' +
    '.theme-lcars .cellstack i { display:block; height:21px; margin-bottom:4px; border-radius:11px; background:#222; }' +
    '.theme-lcars .soc { font-size:76px; color:#fff; text-align:right; line-height:80px; }' +
    '.theme-lcars .stats { left:980px; top:570px; width:260px; font-size:22px; }' +
    '.theme-lcars .stats div { display:flex; justify-content:space-between; color:' + K.peach + '; line-height:30px; }' +
    '.theme-lcars .stats b { color:#fff; font-weight:400; }' +
    '.theme-lcars .foot { left:290px; bottom:20px; font-size:24px; color:#000; line-height:30px; }';

  var SYSTEMS = [
    { key: 'pv',   name: 'SOLAR ARRAY',  color: K.gold,   top: 160 },
    { key: 'batt', name: 'CELL BANK',    color: K.sky,     top: 300 },
    { key: 'grid', name: 'GRID UPLINK',  color: K.red,     top: 440 },
    { key: 'load', name: 'HABITAT LOAD', color: K.lilac,   top: 580 },
  ];
  var SIDE = [
    ['01-' + 'PWR', K.peach], ['02-SOL', K.gold], ['03-BAT', K.sky], ['04-GRD', K.red], ['05-HAB', K.lilac], ['06-ENV', K.tan], ['07-SYS', K.blue],
  ];

  function stardate(d) {
    var start = new Date(d.getFullYear(), 0, 1);
    return (d.getFullYear() % 100) * 1000 + ((d - start) / 86400000 / 365.25 * 1000);
  }

  var el = {};

  HC.themes.register('lcars', {
    label: 'LCARS',

    mount: function (root) {
      var h = '<style>' + CSS + '</style>' +
        '<div class="abs elbow"></div><div class="abs elbow2"></div>' +
        '<div class="abs bar" style="left:270px; top:20px; width:300px; background:' + K.orange + '"></div>' +
        '<div class="abs bar" style="left:574px; top:20px; width:90px; background:' + K.lilac + '"></div>' +
        '<div class="abs bar" style="left:668px; top:20px; width:592px; background:' + K.blue + '; border-radius:0 30px 30px 0"></div>' +
        '<div class="abs bar2" style="left:270px; bottom:20px; width:200px; background:' + K.lilac + '"></div>' +
        '<div class="abs bar2" style="left:474px; bottom:20px; width:786px; background:' + K.tan + '; border-radius:0 15px 15px 0"></div>' +
        '<div class="abs cut"></div>' +
        '<div class="abs title">POWER DISTRIBUTION</div>' +
        '<div class="abs sub" data-k="sub"></div>';
      SIDE.forEach(function (s, i) {
        h += '<div class="abs side" style="top:' + (176 + i * 66) + 'px; background:' + s[1] + '"><span data-k="side' + i + '">' + s[0] + '</span></div>';
      });
      SYSTEMS.forEach(function (s) {
        var segs = '';
        for (var i = 0; i < SEGS; i++) segs += '<i style="animation-delay:' + (i * 0.05) + 's"></i>';
        h += '<div class="abs sys" style="top:' + s.top + 'px">' +
          '<div class="pill" style="background:' + s.color + '">' + s.name + '</div>' +
          '<div class="num"><span data-k="' + s.key + 'Num"></span><small>KW</small></div>' +
          '<div class="state" style="color:' + s.color + '" data-k="' + s.key + 'State"></div>' +
          '<div class="segs" data-k="' + s.key + 'Segs" data-color="' + s.color + '">' + segs + '</div></div>';
      });
      var cells = '';
      for (var c = 0; c < 10; c++) cells += '<i></i>';
      h += '<div class="abs cells"><h3>CELL BANK STATUS</h3><div class="soc" data-k="soc"></div><div class="cellstack" data-k="cells">' + cells + '</div></div>' +
        '<div class="abs stats">' +
          '<div><span>GENERATED</span><b data-k="dPv"></b></div><div><span>CONSUMED</span><b data-k="dLoad"></b></div>' +
          '<div><span>IMPORTED</span><b data-k="dImp"></b></div><div><span>EXPORTED</span><b data-k="dExp"></b></div>' +
          '<div><span>COST</span><b data-k="cost"></b></div><div><span>SELF-SUFF</span><b data-k="self"></b></div></div>' +
        '<div class="abs foot" style="left:490px" data-k="foot"></div>';
      root.innerHTML = h;
      el = Art.refs(root);
    },

    update: function (m) {
      function t(k, v) { Art.text(el, k, v); }
      var gridNet = m.gridIn - m.gridOut;
      var vals = {
        pv:   [m.pv,   m.pv > 0.02 ? 'GENERATING' : 'STANDBY'],
        batt: [m.batt, m.batt > 0.02 ? 'CHARGING' : m.batt < -0.02 ? 'DISCHARGING' : 'HOLDING'],
        grid: [gridNet, gridNet > 0.02 ? 'IMPORTING' : gridNet < -0.02 ? 'EXPORTING' : 'STANDBY'],
        load: [m.load, 'NOMINAL'],
      };
      SYSTEMS.forEach(function (s) {
        var v = vals[s.key][0];
        t(s.key + 'Num', (s.key === 'batt' && v > 0 ? '+' : '') + fmt.kw(v));
        t(s.key + 'State', vals[s.key][1]);
        var lit = Math.round(Math.min(1, Math.abs(v) / m.max[s.key]) * SEGS);
        if (Math.abs(v) > 0.02 && lit === 0) lit = 1;
        var segs = el[s.key + 'Segs'].children, col = el[s.key + 'Segs'].getAttribute('data-color');
        for (var i = 0; i < SEGS; i++) {
          var on = i < lit;
          if (segs[i].className !== (on ? 'on' : '')) {
            segs[i].className = on ? 'on' : '';
            segs[i].style.background = on ? col : '';
          }
        }
      });

      t('soc', fmt.n(m.soc) + '%');
      var cells = el.cells.children, litCells = Math.round(m.soc / 10);
      for (var c = 0; c < cells.length; c++) {
        var idx = cells.length - 1 - c; // fill from the bottom
        cells[c].style.background = idx < litCells ? (m.soc < 20 ? K.red : K.sky) : '#222';
      }

      var sd = stardate(m.now);
      t('sub', 'STARDATE ' + sd.toFixed(1) + '  ·  ' + fmt.time(m.now) + '  ·  ' + (m.link === 'ok' || m.link === 'demo' ? m.state : 'LINK ' + m.link));
      t('dPv', fmt.n(m.dailyPv, 1) + ' KWH'); t('dLoad', fmt.n(m.dailyLoad, 1) + ' KWH');
      t('dImp', fmt.n(m.dailyImport, 1) + ' KWH'); t('dExp', fmt.n(m.dailyExport, 1) + ' KWH');
      t('cost', '£' + fmt.n(m.cost, 2)); t('self', fmt.n(m.selfSufficiency) + '%');
      t('side0', fmt.pad(m.now.getSeconds(), 2, '0') + '-' + fmt.n(m.now.getMilliseconds() / 10));
      t('side5', fmt.n(m.outTemp) + '° EXT');
      t('side6', fmt.n(m.inTemp) + '° HAB');
      t('foot', 'EXT ' + m.outCond + '  ·  AIR ' + m.iaqClass + '  ·  GRID ' + m.gridStatus + '  ·  CELL HEALTH ' + fmt.n(m.soh) + '%');
    },
  });
})(window.HC);
