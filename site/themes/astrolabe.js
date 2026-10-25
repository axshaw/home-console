// Astrolabe: the household drawn as a brass celestial instrument on midnight ink.
//
//  · The outer dial is the day: noon at the top, midnight at the bottom, morning to the left as the
//    sun rises in the east. A gold arc marks today's real daylight (HA's sun sensors) and a sun or
//    moon rides the rim at the current time.
//  · Inside it, today is engraved as it happens: solar blooms outward from the base circle in gold,
//    the house's demand sinks inward in silver. The history is kept per day in this browser.
//  · At the centre the battery is a glass orb of light, orbited by three planets, Sol (solar),
//    Ley (the grid) and Hearth (the house), each moving at a pace set by its live power. Ley
//    turns retrograde when you sell to the grid.
//  · The household's animals are among the constellations.
(function (HC) {
  'use strict';
  var fmt = HC.format, Art = HC.art;
  var CX = 640, CY = 410, B = 228, SLOTS = 144;
  var GOLD = '#d9b36c', GOLD2 = '#f3d99b', SILVER = '#c3cde3', ROSE = '#e39a8f', AQUA = '#78e6d2', INK = '#070b1d';
  var FONT = '"Cormorant Garamond", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
  var el = {}, hist = null, lastSave = 0, lastDraw = 0, last = null;
  var orbit = { sol: { r: 144, a: 0.3, kw: 0 }, ley: { r: 118, a: 2.4, kw: 0 }, hearth: { r: 92, a: 4.4, kw: 0 } };

  var CSS =
    '.theme-astrolabe { background: radial-gradient(ellipse at 50% 50%, #121a3d 0%, #0a0f26 55%, #04060f 100%); color:' + GOLD + '; font-family:' + FONT + '; }' +
    '.theme-astrolabe svg { position:absolute; left:0; top:0; }' +
    '.theme-astrolabe .t { font-family:' + FONT + '; }' +
    '.theme-astrolabe .panel { position:absolute; width:236px; font-size:18px; }' +
    '.theme-astrolabe .panel h3 { margin:0 0 10px; font-weight:400; font-size:15px; letter-spacing:5px; color:' + GOLD + '; border-bottom:1px solid rgba(217,179,108,.4); padding-bottom:6px; }' +
    '.theme-astrolabe .row { display:flex; justify-content:space-between; align-items:baseline; margin:7px 0; color:' + SILVER + '; }' +
    '.theme-astrolabe .row i { font-size:14px; color:rgba(195,205,227,.6); margin-left:6px; }' +
    '.theme-astrolabe .row b { font-weight:400; color:' + GOLD2 + '; font-size:20px; }' +
    '.theme-astrolabe .title { position:absolute; left:40px; top:26px; }' +
    '.theme-astrolabe .title div { font-size:40px; letter-spacing:10px; color:' + GOLD2 + '; }' +
    '.theme-astrolabe .title em { display:block; font-size:18px; color:' + SILVER + '; letter-spacing:2px; margin-top:-2px; }' +
    '.theme-astrolabe .when { position:absolute; right:40px; top:30px; text-align:right; }' +
    '.theme-astrolabe .when div { font-size:40px; color:' + GOLD2 + '; letter-spacing:3px; }' +
    '.theme-astrolabe .when em { display:block; font-size:17px; color:' + SILVER + '; letter-spacing:1px; }' +
    '.theme-astrolabe .prose { position:absolute; left:120px; right:120px; bottom:12px; text-align:center; font-style:italic; font-size:19px; color:' + SILVER + '; opacity:.9; }';

  // ----- geometry: hour of day -> point on a circle (noon top, midnight bottom, morning left) -----
  function ang(h) { return (h / 24) * 2 * Math.PI + Math.PI; }
  function pt(h, r) { var a = ang(h); return [CX + r * Math.sin(a), CY - r * Math.cos(a)]; }
  function f(n) { return n.toFixed(1); }
  function arc(h1, h2, r) {
    var p1 = pt(h1, r), p2 = pt(h2, r), span = ((h2 - h1) + 24) % 24;
    return 'M' + f(p1[0]) + ' ' + f(p1[1]) + ' A ' + r + ' ' + r + ' 0 ' + (span > 12 ? 1 : 0) + ' 1 ' + f(p2[0]) + ' ' + f(p2[1]);
  }

  // ----- today's history, one slot per 10 minutes -----
  function dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function emptyHist(d) {
    var z = function () { var a = []; for (var i = 0; i < SLOTS; i++) a.push(0); return a; };
    return { day: dayKey(d), pv: z(), ld: z(), n: z() };
  }
  function loadHist(d) {
    try {
      var h = JSON.parse(localStorage.getItem('astrolabe') || 'null');
      if (h && h.day === dayKey(d) && h.pv && h.pv.length === SLOTS) return h;
    } catch (e) {}
    return emptyHist(d);
  }
  // A plausible day for demo mode so the engraving has something to show.
  function demoHist(d, m) {
    var h = emptyHist(d), now = (d.getHours() * 60 + d.getMinutes()) / 10, rnd = Art.rng(d.getDate());
    var bump = function (t, c, w) { return Math.exp(-Math.pow((t - c) / w, 2)); };
    for (var i = 0; i < now; i++) {
      var t = i / 6, sun = t > m.sunrise && t < m.sunset ? Math.sin(Math.PI * (t - m.sunrise) / (m.sunset - m.sunrise)) : 0;
      h.pv[i] = Math.max(0, m.max.pv * 0.72 * sun * (0.82 + 0.18 * rnd())); h.ld[i] = 0.35 + 1.5 * bump(t, 7.6, 0.9) + 0.7 * bump(t, 12.8, 1) + 2.3 * bump(t, 18.6, 1.4) + 0.2 * rnd(); h.n[i] = 1;
    }
    return h;
  }
  function record(m) {
    var d = m.now;
    if (!hist || hist.day !== dayKey(d)) hist = m.link === 'demo' ? demoHist(d, m) : loadHist(d);
    if (m.link === 'demo') return;
    if (m.link !== 'ok') return;
    var i = Math.floor((d.getHours() * 60 + d.getMinutes()) / 10);
    hist.pv[i] += m.pv; hist.ld[i] += m.load; hist.n[i] += 1;
    if (Date.now() - lastSave > 30000) {
      lastSave = Date.now();
      try { localStorage.setItem('astrolabe', JSON.stringify(hist)); } catch (e) {}
    }
  }
  function areaPath(series, scale, dir) {
    var out = '', back = '';
    for (var i = 0; i <= SLOTS; i++) {
      var k = i % SLOTS, v = hist.n[k] ? series[k] / hist.n[k] : 0, h = (i * 10) / 60;
      var p = pt(h, B + dir * Math.min(v * scale, dir > 0 ? 66 : 74));
      out += (i ? ' L' : 'M') + f(p[0]) + ' ' + f(p[1]);
    }
    for (i = SLOTS; i >= 0; i--) { var q = pt((i * 10) / 60, B); back += ' L' + f(q[0]) + ' ' + f(q[1]); }
    return out + back + ' Z';
  }

  // ----- static engraving -----
  function dial() {
    var s = '', i;
    // Fine engraved circles.
    [70, 160, B, 296, 302, 338].forEach(function (r, j) {
      s += '<circle cx="' + CX + '" cy="' + CY + '" r="' + r + '" fill="none" stroke="' + GOLD + '" stroke-opacity="' + [0.5, 0.25, 0.45, 0.35, 0.6, 0.8][j] + '" stroke-width="' + (j === 5 ? 2 : 1) + '"/>';
    });
    // Hour ticks and numerals.
    for (i = 0; i < 96; i++) {
      var h = i / 4, big = i % 4 === 0, p1 = pt(h, 302), p2 = pt(h, big ? 316 : 308);
      s += '<line x1="' + f(p1[0]) + '" y1="' + f(p1[1]) + '" x2="' + f(p2[0]) + '" y2="' + f(p2[1]) + '" stroke="' + GOLD + '" stroke-width="' + (big ? 1.6 : 0.8) + '"/>';
    }
    for (i = 0; i < 24; i++) {
      var p = pt(i, 327);
      s += '<text class="t" x="' + f(p[0]) + '" y="' + f(p[1] + 5) + '" text-anchor="middle" font-size="' + (i % 6 === 0 ? 17 : 13) + '" fill="' + (i % 6 === 0 ? GOLD2 : GOLD) + '">' + (i === 0 ? 'XXIV' : i % 6 === 0 ? ['', '', '', '', '', '', 'VI', '', '', '', '', '', 'XII', '', '', '', '', '', 'XVIII'][i] : i) + '</text>';
    }
    // Rete: an eight-pointed compass star behind the orb, and degree hatching on the base circle.
    var star = '';
    for (i = 0; i < 16; i++) {
      var a = i * Math.PI / 8, len = i % 2 ? 108 : 152, w = i % 2 ? 0.08 : 0.06;
      star += 'M' + f(CX) + ' ' + f(CY) + ' L' + f(CX + Math.sin(a - w) * 60) + ' ' + f(CY - Math.cos(a - w) * 60) + ' L' + f(CX + Math.sin(a) * len) + ' ' + f(CY - Math.cos(a) * len) +
        ' L' + f(CX + Math.sin(a + w) * 60) + ' ' + f(CY - Math.cos(a + w) * 60) + ' Z ';
    }
    s += '<path d="' + star + '" fill="' + GOLD + '" fill-opacity=".06" stroke="' + GOLD + '" stroke-opacity=".3" stroke-width=".8"/>';
    for (i = 0; i < 72; i++) {
      var q1 = pt(i / 3, B - 3), q2 = pt(i / 3, B + 3);
      s += '<line x1="' + f(q1[0]) + '" y1="' + f(q1[1]) + '" x2="' + f(q2[0]) + '" y2="' + f(q2[1]) + '" stroke="' + GOLD + '" stroke-opacity=".5" stroke-width=".7"/>';
    }
    // Orbit rings with engraved names.
    [['sol', 'SOL', GOLD2], ['ley', 'LEY', ROSE], ['hearth', 'HEARTH', SILVER]].forEach(function (o) {
      var r = orbit[o[0]].r;
      s += '<circle cx="' + CX + '" cy="' + CY + '" r="' + r + '" fill="none" stroke="' + o[2] + '" stroke-opacity=".28" stroke-dasharray="1 5"/>';
      s += '<text class="t" x="' + CX + '" y="' + (CY - r + 4) + '" text-anchor="middle" font-size="9" letter-spacing="3" fill="' + o[2] + '" fill-opacity=".7" style="paint-order:stroke" stroke="' + INK + '" stroke-width="4">' + o[1] + '</text>';
    });
    return s;
  }

  function sky() {
    var r = Art.rng(1609), s = '';
    for (var i = 0; i < 140; i++) {
      var x = r() * 1280, y = r() * 800, d = Math.hypot(x - CX, y - CY);
      if (d < 345) continue;
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + (0.4 + r() * 1.1).toFixed(2) + '" fill="#fff" opacity="' + (0.2 + r() * 0.6).toFixed(2) + '"/>';
    }
    // The household, in the stars.
    var C = [
      { name: 'Canis Collie', at: [92, 160], pts: [[0, 30], [26, 12], [60, 18], [92, 8], [118, 22], [104, 48], [66, 44]] },
      { name: 'Felis Van', at: [1040, 165], pts: [[0, 40], [18, 10], [40, 0], [64, 14], [84, 4], [110, 30], [70, 44]] },
      { name: 'Gallus', at: [96, 640], pts: [[0, 20], [28, 0], [50, 18], [44, 46], [82, 40], [106, 58]] },
      { name: 'Cavapoo Minor', at: [1060, 640], pts: [[0, 30], [22, 8], [50, 20], [76, 4], [96, 30], [62, 50]] },
    ];
    C.forEach(function (c, j) {
      var line = '', dots = '';
      c.pts.forEach(function (p, k) {
        var x = c.at[0] + p[0], y = c.at[1] + p[1];
        line += (k ? ' L' : 'M') + x + ' ' + y;
        dots += '<circle cx="' + x + '" cy="' + y + '" r="' + (k === 2 ? 2.6 : 1.8) + '" fill="#fff"><animate attributeName="opacity" values="1;.45;1" dur="' + (3 + (j + k) % 4) + 's" repeatCount="indefinite"/></circle>';
      });
      s += '<path d="' + line + '" stroke="' + SILVER + '" stroke-opacity=".35" stroke-width="1" fill="none"/>' + dots +
        '<text class="t" x="' + (c.at[0] + 55) + '" y="' + (c.at[1] + 84) + '" text-anchor="middle" font-size="14" font-style="italic" fill="' + SILVER + '" fill-opacity=".6">' + c.name + '</text>';
    });
    return s;
  }

  function orb() {
    return '<g transform="translate(' + CX + ' ' + CY + ')">' +
      '<circle r="96" fill="url(#asorbglow)"/>' +
      '<circle r="66" fill="#081127"/>' +
      '<clipPath id="asorbclip"><circle r="64"/></clipPath>' +
      '<g clip-path="url(#asorbclip)"><g data-k="liquid" transform="translate(0 64)" style="transition: transform 1.5s">' +
        '<g><path d="M-100 0 Q -75 -7 -50 0 T 0 0 T 50 0 T 100 0 L 100 140 L -100 140 Z" fill="url(#asliquid)">' +
          '<animate attributeName="d" values="M-100 0 Q -75 -7 -50 0 T 0 0 T 50 0 T 100 0 L 100 140 L -100 140 Z;M-100 0 Q -75 7 -50 0 T 0 0 T 50 0 T 100 0 L 100 140 L -100 140 Z;M-100 0 Q -75 -7 -50 0 T 0 0 T 50 0 T 100 0 L 100 140 L -100 140 Z" dur="4s" repeatCount="indefinite"/></path>' +
          '<animateTransform attributeName="transform" type="translate" values="-24 0;24 0;-24 0" dur="9s" repeatCount="indefinite"/></g>' +
        '<g fill="#e9fffb" opacity=".55">' + [-30, 6, 34].map(function (x, i) {
          return '<circle cx="' + x + '" cy="60" r="' + (2 + i % 2) + '"><animate attributeName="cy" values="70;4" dur="' + (3 + i) + 's" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="' + (3 + i) + 's" repeatCount="indefinite"/></circle>';
        }).join('') + '</g>' +
      '</g></g>' +
      '<ellipse cx="-20" cy="-30" rx="26" ry="14" fill="#fff" opacity=".12" transform="rotate(-30 -20 -30)"/>' +
      '<circle r="66" fill="none" stroke="' + GOLD + '" stroke-width="2.5"/><circle r="71" fill="none" stroke="' + GOLD + '" stroke-opacity=".5"/>' +
      '<text class="t" y="8" text-anchor="middle" font-size="40" fill="#fff" style="paint-order:stroke" stroke="' + INK + '" stroke-width="4" stroke-opacity=".6" data-k="soc"></text>' +
      '<text class="t" y="29" text-anchor="middle" font-size="12" letter-spacing="1" fill="' + GOLD2 + '" style="paint-order:stroke" stroke="' + INK + '" stroke-width="4" stroke-opacity=".6" data-k="battKw"></text>' +
      '</g>';
  }

  function planet(key, color, r) {
    return '<path data-k="' + key + 'Trail" fill="none" stroke="' + color + '" stroke-width="3" stroke-linecap="round" opacity=".35"/>' +
      '<g data-k="' + key + 'Body"><circle r="' + (r + 7) + '" fill="' + color + '" opacity=".18"/><circle r="' + r + '" fill="url(#as' + key + ')"/></g>';
  }

  HC.themes.register('astrolabe', {
    label: 'Astrolabe',

    mount: function (root) {
      root.innerHTML = '<style>' + CSS + '</style>' +
        '<svg width="1280" height="800" viewBox="0 0 1280 800"><defs>' +
          '<radialGradient id="asorbglow"><stop offset=".6" stop-color="' + AQUA + '" stop-opacity=".18"/><stop offset="1" stop-color="' + AQUA + '" stop-opacity="0"/></radialGradient>' +
          '<linearGradient id="asliquid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ff7e6"/><stop offset=".4" stop-color="' + AQUA + '"/><stop offset="1" stop-color="#1f6f8a"/></linearGradient>' +
          '<radialGradient id="assol" cx=".35" cy=".35"><stop offset="0" stop-color="#fff7d6"/><stop offset=".5" stop-color="' + GOLD2 + '"/><stop offset="1" stop-color="#a77a2e"/></radialGradient>' +
          '<radialGradient id="asley" cx=".35" cy=".35"><stop offset="0" stop-color="#ffe2dc"/><stop offset=".5" stop-color="' + ROSE + '"/><stop offset="1" stop-color="#8a4038"/></radialGradient>' +
          '<radialGradient id="ashearth" cx=".35" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="' + SILVER + '"/><stop offset="1" stop-color="#5d6a8a"/></radialGradient>' +
          '<linearGradient id="assolfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + GOLD2 + '" stop-opacity=".75"/><stop offset="1" stop-color="' + GOLD + '" stop-opacity=".35"/></linearGradient>' +
        '</defs>' + sky() +
        '<circle cx="' + CX + '" cy="' + CY + '" r="338" fill="' + INK + '" fill-opacity=".55"/>' +
        '<path data-k="nightArc" fill="none" stroke="#3a4a86" stroke-width="7" stroke-opacity=".7"/>' +
        '<path data-k="dayArc" fill="none" stroke="' + GOLD2 + '" stroke-width="7" stroke-opacity=".85"/>' +
        dial() +
        '<path data-k="solArea" fill="url(#assolfill)" stroke="' + GOLD2 + '" stroke-width="1.2"/>' +
        '<path data-k="ldArea" fill="' + SILVER + '" fill-opacity=".22" stroke="' + SILVER + '" stroke-opacity=".45" stroke-width="1.2"/>' +
        '<line data-k="hand" stroke="' + GOLD2 + '" stroke-width="1.5" stroke-opacity=".9"/>' +
        '<g data-k="marker"></g>' +
        planet('sol', GOLD2, 9) + planet('ley', ROSE, 7) + planet('hearth', SILVER, 7) +
        orb() + '</svg>' +
        '<div class="title"><div>ASTROLABE</div><em>of the household energies</em></div>' +
        '<div class="when"><div data-k="clock"></div><em data-k="date"></em></div>' +
        '<div class="panel" style="left:40px; top:300px"><h3>EPHEMERIS</h3>' +
          '<div class="row"><span>Sol<i>solar</i></span><b data-k="sol"></b></div>' +
          '<div class="row"><span>Hearth<i>house</i></span><b data-k="hearth"></b></div>' +
          '<div class="row"><span>Ley<i data-k="leyDir">grid</i></span><b data-k="ley"></b></div>' +
          '<div class="row"><span>Vessel<i>battery</i></span><b data-k="vessel"></b></div></div>' +
        '<div class="panel" style="right:40px; top:300px"><h3>ALMANAC · TODAY</h3>' +
          '<div class="row"><span>Harvested</span><b data-k="dPv"></b></div><div class="row"><span>Consumed</span><b data-k="dLoad"></b></div>' +
          '<div class="row"><span>Borrowed</span><b data-k="dImp"></b></div><div class="row"><span>Given</span><b data-k="dExp"></b></div>' +
          '<div class="row"><span>Tithe</span><b data-k="cost"></b></div><div class="row"><span>Self-sufficient</span><b data-k="self"></b></div></div>' +
        '<div class="prose" data-k="prose"></div>';
      el = Art.refs(root);
      lastDraw = 0;

      // Planets glide continuously; their pace follows live power (radians per second).
      Art.loop(root, function (dt) {
        ['sol', 'ley', 'hearth'].forEach(function (k) {
          var o = orbit[k], speed = Math.abs(o.kw) < 0.02 ? 0.02 : 0.08 + Math.min(Math.abs(o.kw), 8) * 0.12;
          o.a += speed * dt * (o.kw < 0 ? -1 : 1);
          var x = CX + o.r * Math.sin(o.a), y = CY - o.r * Math.cos(o.a);
          el[k + 'Body'].setAttribute('transform', 'translate(' + f(x) + ' ' + f(y) + ')');
          var back = o.a - (o.kw < 0 ? -1 : 1) * (0.25 + Math.min(Math.abs(o.kw), 8) * 0.09);
          var bx = CX + o.r * Math.sin(back), by = CY - o.r * Math.cos(back);
          el[k + 'Trail'].setAttribute('d', 'M' + f(bx) + ' ' + f(by) + ' A ' + o.r + ' ' + o.r + ' 0 0 ' + (o.kw < 0 ? 0 : 1) + ' ' + f(x) + ' ' + f(y));
        });
      });
    },

    update: function (m) {
      var t = function (k, v) { Art.text(el, k, v); };
      last = m;
      record(m);
      var gridNet = m.gridIn - m.gridOut;
      orbit.sol.kw = m.pv; orbit.hearth.kw = m.load; orbit.ley.kw = gridNet;

      var h = m.now.getHours() + m.now.getMinutes() / 60 + m.now.getSeconds() / 3600;
      if (Date.now() - lastDraw > 10000) {
        lastDraw = Date.now();
        el.solArea.setAttribute('d', areaPath(hist.pv, 66 / m.max.pv, 1));
        el.ldArea.setAttribute('d', areaPath(hist.ld, 74 / m.max.load, -1));
        el.dayArc.setAttribute('d', arc(m.sunrise, m.sunset, 296));
        el.nightArc.setAttribute('d', arc(m.sunset, m.sunrise, 296));
      }
      var p1 = pt(h, 74), p2 = pt(h, 338), mk = pt(h, 296);
      el.hand.setAttribute('x1', f(p1[0])); el.hand.setAttribute('y1', f(p1[1]));
      el.hand.setAttribute('x2', f(p2[0])); el.hand.setAttribute('y2', f(p2[1]));
      var day = h > m.sunrise && h < m.sunset;
      el.marker.setAttribute('transform', 'translate(' + f(mk[0]) + ' ' + f(mk[1]) + ')');
      var mark = day
        ? '<circle r="15" fill="' + GOLD2 + '" opacity=".25"/><circle r="9" fill="' + GOLD2 + '"/><g stroke="' + GOLD2 + '" stroke-width="2">' +
          [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { var a = i * Math.PI / 4; return '<line x1="' + f(Math.cos(a) * 12) + '" y1="' + f(Math.sin(a) * 12) + '" x2="' + f(Math.cos(a) * 17) + '" y2="' + f(Math.sin(a) * 17) + '"/>'; }).join('') + '</g>'
        : '<circle r="10" fill="#f4f1e0"/><circle cx="4" cy="-3" r="9" fill="#0d1430"/>';
      if (el.marker.getAttribute('data-day') !== String(day)) { el.marker.setAttribute('data-day', String(day)); el.marker.innerHTML = mark; }

      var lvl = 64 - 128 * Art.clamp(m.soc / 100, 0, 1);
      el.liquid.setAttribute('transform', 'translate(0 ' + f(lvl) + ')');
      t('soc', fmt.n(m.soc) + '%');
      t('battKw', m.batt > 0.02 ? 'FILLING +' + fmt.kw(m.batt) : m.batt < -0.02 ? 'POURING ' + fmt.kw(-m.batt) : 'STILL');

      t('sol', fmt.kw(m.pv) + ' kW'); t('hearth', fmt.kw(m.load) + ' kW');
      t('ley', fmt.kw(Math.abs(gridNet)) + ' kW'); t('leyDir', gridNet < -0.02 ? 'grid · giving' : gridNet > 0.02 ? 'grid · lending' : 'grid · quiet');
      t('vessel', fmt.n(m.soc) + '%');
      t('dPv', fmt.n(m.dailyPv, 1) + ' kWh'); t('dLoad', fmt.n(m.dailyLoad, 1) + ' kWh');
      t('dImp', fmt.n(m.dailyImport, 1) + ' kWh'); t('dExp', fmt.n(m.dailyExport, 1) + ' kWh');
      t('cost', '£' + fmt.n(m.cost, 2)); t('self', fmt.n(m.selfSufficiency) + '%');

      t('clock', fmt.time(m.now));
      var rise = Math.floor(m.sunrise) + ':' + fmt.pad(Math.round((m.sunrise % 1) * 60), 2, '0'), set = Math.floor(m.sunset) + ':' + fmt.pad(Math.round((m.sunset % 1) * 60), 2, '0');
      t('date', m.now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }) + ' · sunrise ' + rise + ' · sunset ' + set);

      var hr = m.now.getHours();
      var when = hr < 5 ? 'In the small hours' : hr < 12 ? 'This morning' : hr < 17 ? 'This afternoon' : hr < 21 ? 'This evening' : 'Tonight';
      var sun = m.pv > 3 ? 'the sun pours ' + fmt.kw(m.pv) + ' kW upon the roof' : m.pv > 0.3 ? 'the sun offers a modest ' + fmt.kw(m.pv) + ' kW' : day ? 'cloud keeps the sun’s gifts small' : 'the panels sleep beneath the stars';
      var vessel = m.batt > 0.3 ? 'the vessel drinks deeply' : m.batt > 0.02 ? 'the vessel sips' : m.batt < -0.3 ? 'the vessel pours out its store' : 'the vessel rests at ' + fmt.n(m.soc) + '%';
      var ley = gridNet < -0.05 ? 'and the surplus flows out to the wider world.' : gridNet > 0.3 ? 'and the grid lends a hand.' : 'and the house keeps its own counsel.';
      t('prose', when + ', ' + sun + '; ' + vessel + ', ' + ley);
    },
  });
})(window.HC);
