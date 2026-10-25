// Home cross-section: a cartoon cut-away house. Solar panels on the roof, battery and inverter in
// the utility room, a pole and meter outside, and the household going about its day: a tricolour
// border collie on the rug, a Turkish Van cat on the bedroom windowsill, a cavapoo trotting about
// the kitchen and a hen pecking in the garden. Animal animation is SMIL so it runs on old WebViews.
(function (HC) {
  'use strict';
  var fmt = HC.format, Art = HC.art;
  var INK = '#3b2b2b';
  var el = {};

  var CSS =
    '.theme-home { background:#9fd3f0; font-family: "Segoe UI", "Roboto", "Helvetica Neue", sans-serif; }' +
    '.theme-home svg { position:absolute; left:0; top:0; }' +
    '.theme-home .flow { fill:none; stroke-width:5; stroke-linecap:round; stroke-dasharray: 0.1 14; animation: hoflow 1s linear infinite; transition: opacity .6s; }' +
    '@keyframes hoflow { to { stroke-dashoffset:-14.1; } }' +
    '.theme-home .night { transition: opacity 2s; }' +
    '.theme-home text { font-family: "Segoe UI", "Roboto", sans-serif; }' +
    '.theme-home .chalk { font-family: "Segoe Print", "Comic Sans MS", "Chalkboard", cursive; fill:#f4f1e6; }';

  // ---------- small drawing helpers ----------
  function tag(key, x, y, w, color) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<rect x="2" y="3" width="' + w + '" height="48" rx="12" fill="rgba(0,0,0,.18)"/>' +
      '<rect width="' + w + '" height="48" rx="12" fill="#fffaf0" stroke="' + color + '" stroke-width="3"/>' +
      '<text x="14" y="20" font-size="14" font-weight="700" fill="' + color + '" data-k="' + key + 'Lbl"></text>' +
      '<text x="14" y="40" font-size="19" font-weight="700" fill="' + INK + '" data-k="' + key + 'Val"></text></g>';
  }
  function blink(cx, cy, rx, ry, dur, begin) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#1d1414">' +
      '<animate attributeName="ry" values="' + ry + ';' + ry + ';0.4;' + ry + '" keyTimes="0;0.92;0.96;1" dur="' + dur + 's" begin="' + (begin || 0) + 's" repeatCount="indefinite"/></ellipse>';
  }
  function rot(from, to, cx, cy, dur, extra) {
    return '<animateTransform attributeName="transform" type="rotate" values="' + from + ' ' + cx + ' ' + cy + ';' + to + ' ' + cx + ' ' + cy + ';' + from + ' ' + cx + ' ' + cy + '" dur="' + dur + 's" repeatCount="indefinite"' + (extra || '') + '/>';
  }

  // ---------- the animals ----------
  // Tricolour border collie lying on the rug, facing right. Tail wag speed follows solar output.
  function collie() {
    var B = '#1b1b1f', W = '#fbfbf7', T = '#c8813f';
    return '<g transform="translate(300 676)">' +
      '<ellipse cx="85" cy="2" rx="95" ry="7" fill="rgba(0,0,0,.15)"/>' +
      // tail with white tip, wagging
      '<g data-k="tail"><path d="M18 -26 C -10 -30, -30 -18, -42 -4" stroke="' + B + '" stroke-width="13" fill="none" stroke-linecap="round"/>' +
        '<path d="M-30 -12 C -36 -8, -40 -5, -44 -2" stroke="' + W + '" stroke-width="12" fill="none" stroke-linecap="round"/>' +
        '<animateTransform data-k="wag" attributeName="transform" type="rotate" values="-10 18 -26;14 18 -26;-10 18 -26" dur="0.7s" repeatCount="indefinite"/></g>' +
      // body and hind leg
      '<ellipse cx="72" cy="-24" rx="62" ry="25" fill="' + B + '"/>' +
      '<ellipse cx="34" cy="-12" rx="28" ry="15" fill="' + B + '"/>' +
      '<ellipse cx="22" cy="-3" rx="16" ry="5" fill="' + T + '"/>' +
      '<ellipse cx="12" cy="-1" rx="9" ry="5" fill="' + W + '"/>' +
      // white ruff and chest
      '<path d="M100 -46 C 130 -50, 140 -20, 128 -4 L 100 -4 Z" fill="' + W + '"/>' +
      // front legs stretched forward with tan and white paws
      '<rect x="104" y="-14" width="58" height="12" rx="6" fill="' + T + '"/>' +
      '<rect x="112" y="-8" width="56" height="11" rx="5.5" fill="' + T + '"/>' +
      '<ellipse cx="160" cy="-8" rx="10" ry="6" fill="' + W + '"/><ellipse cx="166" cy="-2" rx="10" ry="6" fill="' + W + '"/>' +
      // head
      '<g><ellipse cx="138" cy="-60" rx="25" ry="22" fill="' + B + '"/>' +
        '<path d="M138 -82 C 134 -70, 134 -60, 140 -48 L 148 -48 C 146 -60, 144 -70, 141 -82 Z" fill="' + W + '"/>' +
        '<ellipse cx="160" cy="-50" rx="17" ry="11" fill="' + W + '"/>' +
        '<ellipse cx="152" cy="-45" rx="8" ry="5" fill="' + T + '"/>' +
        '<ellipse cx="174" cy="-53" rx="5.5" ry="4.5" fill="#111"/>' +
        '<path d="M160 -42 Q 166 -38, 172 -42" stroke="#111" stroke-width="1.8" fill="none"/>' +
        '<path d="M157 -41 Q 162 -30, 166 -40" fill="#e46f86"/>' +
        blink(150, -64, 3.2, 3.2, 5.5) + '<circle cx="151" cy="-65" r="1" fill="#fff"/>' +
        '<ellipse cx="150" cy="-72" rx="3.5" ry="2" fill="' + T + '"/>' +
        // ears: one perked, one flopped, the perked one twitches
        '<path d="M120 -74 L 116 -96 L 133 -80 Z" fill="' + B + '">' + rot(0, -12, 124, -78, 4.2, ' begin="1s"') + '</path>' +
        '<path d="M134 -80 L 146 -98 L 150 -78 Z" fill="' + B + '"/><path d="M146 -98 L 152 -88 L 147 -86 Z" fill="' + B + '"/>' +
        '<path d="M118 -46 C 124 -38, 134 -36, 140 -38" stroke="#d33" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '</g></g>';
  }

  // Turkish Van: white with black head patches and a black tail, sitting on the bedroom windowsill.
  function vanCat() {
    var W = '#ffffff', K = '#18161a', S = '#d9d4d4';
    return '<g transform="translate(372 384)">' +
      '<g><path d="M-16 -10 C -40 -4, -44 30, -26 52" stroke="' + K + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
        rot(-8, 10, -16, -10, 3.2) + '</g>' +
      '<ellipse cx="0" cy="-24" rx="23" ry="24" fill="' + W + '" stroke="' + S + '" stroke-width="1.5"/>' +
      '<ellipse cx="18" cy="-32" rx="13" ry="23" fill="' + W + '" stroke="' + S + '" stroke-width="1.5"/>' +
      '<rect x="18" y="-16" width="9" height="16" rx="4" fill="' + W + '" stroke="' + S + '" stroke-width="1.5"/>' +
      '<rect x="8" y="-8" width="9" height="8" rx="4" fill="' + W + '" stroke="' + S + '" stroke-width="1.5"/>' +
      '<g>' +
        '<path d="M10 -70 L 13 -88 L 24 -74 Z" fill="' + K + '"/><path d="M14 -73 L 15 -83 L 21 -75 Z" fill="#f2a5b5"/>' +
        '<path d="M28 -74 L 38 -88 L 40 -70 Z" fill="' + K + '"/>' +
        '<circle cx="25" cy="-60" r="17" fill="' + W + '" stroke="' + S + '" stroke-width="1.5"/>' +
        '<path d="M10 -66 C 12 -78, 22 -78, 24 -70 C 20 -66, 14 -64, 10 -66 Z" fill="' + K + '"/>' +
        '<path d="M28 -73 C 34 -78, 40 -72, 40 -66 C 36 -66, 31 -68, 28 -73 Z" fill="' + K + '"/>' +
        '<ellipse cx="33" cy="-60" rx="3.6" ry="3.6" fill="#6cbf4a"/>' + blink(33, -60, 1.6, 3.2, 6.3, 2) +
        '<path d="M39 -54 L 42 -52 L 38 -51 Z" fill="#f08aa0"/>' +
        '<path d="M40 -52 L 56 -55 M40 -51 L 56 -49 M39 -50 L 54 -45" stroke="#bbb" stroke-width="1"/>' +
        rot(0, 6, 22, -46, 7, ' begin="3s"') +
      '</g></g>';
  }

  // Cavapoo: small, reddish-brown and curly, trotting to and fro across the kitchen.
  function cavapoo() {
    var R = '#b5582f', D = '#8f3d1d', L = '#cf7444';
    var curls = '';
    [[-18, -30, 12], [-6, -34, 12], [6, -34, 12], [18, -30, 11], [-22, -22, 10], [-8, -22, 12], [8, -22, 12], [20, -22, 10]].forEach(function (c) {
      curls += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + R + '"/>';
    });
    function leg(x, phase) {
      return '<g><rect x="' + (x - 4) + '" y="-16" width="8" height="16" rx="4" fill="' + D + '"/><ellipse cx="' + x + '" cy="0" rx="5" ry="2.5" fill="' + D + '"/>' +
        '<animateTransform attributeName="transform" type="rotate" values="' + (phase ? '18' : '-18') + ' ' + x + ' -16;' + (phase ? '-18' : '18') + ' ' + x + ' -16;' + (phase ? '18' : '-18') + ' ' + x + ' -16" dur="0.36s" repeatCount="indefinite"/></g>';
    }
    return '<g transform="translate(700 690)">' +
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;230 0;230 0;0 0;0 0" keyTimes="0;0.42;0.5;0.92;1" dur="14s" repeatCount="indefinite"/>' +
      '<g><animateTransform attributeName="transform" type="scale" values="1 1;-1 1;1 1" keyTimes="0;0.46;0.96" calcMode="discrete" dur="14s" repeatCount="indefinite"/>' +
      '<ellipse cx="0" cy="1" rx="30" ry="4" fill="rgba(0,0,0,.15)"/>' +
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="0.36s" repeatCount="indefinite"/>' +
        leg(-16, 0) + leg(-8, 1) + leg(10, 0) + leg(17, 1) + curls +
        '<g><circle cx="-31" cy="-36" r="8" fill="' + L + '"/><circle cx="-36" cy="-40" r="6" fill="' + L + '"/>' + rot(-15, 20, -26, -32, 0.4) + '</g>' +
        '<circle cx="30" cy="-46" r="15" fill="' + R + '"/><circle cx="22" cy="-56" r="8" fill="' + R + '"/><circle cx="34" cy="-58" r="8" fill="' + R + '"/>' +
        '<ellipse cx="44" cy="-40" rx="10" ry="8" fill="' + L + '"/>' +
        '<circle cx="52" cy="-42" r="3.4" fill="#1a1010"/>' +
        blink(36, -48, 2.4, 2.4, 4.7, 1) + '<circle cx="36.8" cy="-48.8" r=".8" fill="#fff"/>' +
        '<path d="M44 -34 Q 48 -30, 51 -34" stroke="#1a1010" stroke-width="1.4" fill="none"/>' +
        '<g><ellipse cx="22" cy="-38" rx="8" ry="15" fill="' + D + '" transform="rotate(12 22 -38)"/>' + rot(0, 10, 22, -50, 0.72) + '</g>' +
        '<circle cx="15" cy="-40" r="4" fill="#3a6fd8"/>' +
      '</g></g></g></g>';
  }

  // Brown hen in the garden: bobs down to peck, and shuffles about.
  function hen() {
    var F = '#c9773a', D = '#9a5427', C = '#e23b2e';
    return '<g transform="translate(120 690)">' +
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;50 0;50 0;0 0;0 0" keyTimes="0;0.3;0.5;0.8;1" dur="17s" repeatCount="indefinite"/>' +
      '<g><animateTransform attributeName="transform" type="scale" values="1 1;-1 1;1 1" keyTimes="0;0.4;0.9" calcMode="discrete" dur="17s" repeatCount="indefinite"/>' +
      '<ellipse cx="0" cy="1" rx="24" ry="3.5" fill="rgba(0,0,0,.15)"/>' +
      '<path d="M-5 -10 L -7 0 M5 -10 L 7 0 M-7 0 L -12 1 M7 0 L 12 1" stroke="#e8a92a" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M-20 -30 L -30 -54 L -18 -42 L -22 -60 L -10 -40 Z" fill="' + D + '"/>' +
      '<ellipse cx="0" cy="-24" rx="22" ry="16" fill="' + F + '"/>' +
      '<path d="M-12 -28 C -4 -36, 10 -32, 12 -22 C 4 -16, -6 -18, -12 -28 Z" fill="' + D + '"/>' +
      '<g>' +
        '<path d="M10 -34 C 14 -46, 20 -50, 24 -50 L 26 -36 Z" fill="' + F + '"/>' +
        '<circle cx="23" cy="-50" r="9" fill="' + F + '"/>' +
        '<path d="M17 -57 Q 19 -64, 22 -58 Q 24 -66, 27 -58 Q 30 -63, 30 -56 Z" fill="' + C + '"/>' +
        '<path d="M31 -50 L 38 -48 L 31 -45 Z" fill="#e8a92a"/>' +
        '<path d="M28 -44 Q 30 -38, 27 -38 Q 25 -40, 27 -44 Z" fill="' + C + '"/>' +
        blink(26, -52, 1.6, 1.6, 3.9) +
        '<animateTransform attributeName="transform" type="rotate" values="0 14 -34;0 14 -34;48 14 -34;0 14 -34;0 14 -34;48 14 -34;0 14 -34" keyTimes="0;0.5;0.58;0.66;0.8;0.88;1" dur="3.4s" repeatCount="indefinite"/>' +
      '</g></g></g></g>';
  }

  // ---------- the scene ----------
  function scene() {
    var r = Art.rng(31), stars = '';
    for (var i = 0; i < 60; i++) stars += '<circle cx="' + Math.round(r() * 1280) + '" cy="' + Math.round(r() * 330) + '" r="' + (0.8 + r() * 1.4).toFixed(1) + '" fill="#fff">' +
      '<animate attributeName="opacity" values="1;.3;1" dur="' + (2 + r() * 3).toFixed(1) + 's" repeatCount="indefinite"/></circle>';
    var floor = '';
    for (var fx = 252; fx < 1040; fx += 34) floor += '<line x1="' + fx + '" y1="452" x2="' + fx + '" y2="464" stroke="#7a4b2a" stroke-width="1.5"/>';
    var tiles = '';
    for (var ty = 100; ty < 240; ty += 18) tiles += '<line x1="' + (640 - (ty - 70) * 2.47) + '" y1="' + ty + '" x2="' + (640 + (ty - 70) * 2.47) + '" y2="' + ty + '" stroke="#4a3a4c" stroke-width="2"/>';
    var books = '';
    var bc = ['#d9534f', '#5b8def', '#f0ad4e', '#5cb85c', '#9b59b6', '#e67e22', '#1abc9c'];
    for (var b = 0; b < 14; b++) books += '<rect x="' + (930 + (b % 7) * 12) + '" y="' + (b < 7 ? 300 : 352) + '" width="10" height="' + (34 + (b * 7) % 9) + '" fill="' + bc[b % 7] + '" transform="translate(0 ' + (b < 7 ? 2 - (b * 7) % 9 : -((b * 7) % 9) + 6) + ')"/>';

    return '' +
      // sky: day layer, night layer (faded in/out), sun, moon, stars, clouds
      '<rect width="1280" height="800" fill="url(#hosky)"/>' +
      '<g class="night" data-k="night" style="opacity:0"><rect width="1280" height="800" fill="url(#honight)"/>' + stars +
        '<circle cx="1130" cy="90" r="34" fill="#fff6d6"/><circle cx="1146" cy="80" r="30" fill="#1b2a52"/></g>' +
      '<g data-k="sun"><circle cx="1130" cy="90" r="38" fill="#ffd54a"/>' +
        '<g stroke="#ffd54a" stroke-width="5" stroke-linecap="round">' +
          '<path d="M1130 34 L1130 18 M1130 146 L1130 162 M1074 90 L1058 90 M1186 90 L1202 90 M1090 50 L1079 39 M1170 130 L1181 141 M1170 50 L1181 39 M1090 130 L1079 141"/>' +
          '<animateTransform attributeName="transform" type="rotate" values="0 1130 90;360 1130 90" dur="60s" repeatCount="indefinite"/></g></g>' +
      '<g fill="#fff" opacity=".9"><g><ellipse cx="160" cy="80" rx="60" ry="20"/><ellipse cx="200" cy="66" rx="40" ry="24"/><ellipse cx="130" cy="70" rx="30" ry="18"/>' +
        '<animateTransform attributeName="transform" type="translate" values="-200 0;1400 0" dur="140s" repeatCount="indefinite"/></g>' +
        '<g><ellipse cx="760" cy="40" rx="50" ry="15"/><ellipse cx="790" cy="30" rx="30" ry="18"/>' +
        '<animateTransform attributeName="transform" type="translate" values="-900 0;700 0" dur="110s" repeatCount="indefinite"/></g></g>' +
      // hills and garden
      '<path d="M0 640 C 200 590, 380 640, 600 610 C 820 580, 1050 640, 1280 600 L1280 800 L0 800 Z" fill="#9cd17a"/>' +
      '<rect x="0" y="690" width="1280" height="110" fill="#6cb04a"/>' +
      '<rect x="0" y="690" width="1280" height="8" fill="#5a9a3c"/>' +
      '<path d="M0 760 C 300 745, 900 775, 1280 755 L1280 800 L0 800 Z" fill="#5a9a3c"/>' +
      // chicken coop and flowers
      '<g transform="translate(18 600)"><rect x="0" y="30" width="86" height="60" fill="#c0603f" stroke="' + INK + '" stroke-width="2"/>' +
        '<path d="M-8 32 L43 0 L94 32 Z" fill="#7b4a3a" stroke="' + INK + '" stroke-width="2"/>' +
        '<path d="M30 90 L30 60 Q43 48, 56 60 L56 90 Z" fill="#3b2420"/><path d="M56 90 L80 90 L70 110" stroke="#a0754a" stroke-width="4" fill="none"/></g>' +
      '<g>' + [40, 70, 190, 215].map(function (x, i) {
        return '<path d="M' + x + ' 700 L' + x + ' 680" stroke="#3f8a2f" stroke-width="2"/><circle cx="' + x + '" cy="678" r="6" fill="' + ['#ff6fa1', '#ffd23f', '#ff8c42', '#b388ff'][i] + '"/><circle cx="' + x + '" cy="678" r="2.4" fill="#fff3b0"/>';
      }).join('') + '</g>' +
      // thermometer sign in the garden
      '<g transform="translate(160 560)"><rect x="-3" y="20" width="6" height="110" fill="#8a5a3a"/><rect x="-34" y="0" width="68" height="34" rx="6" fill="#fffaf0" stroke="' + INK + '" stroke-width="2"/>' +
        '<text x="0" y="23" text-anchor="middle" font-size="17" font-weight="700" fill="' + INK + '" data-k="outTemp"></text></g>' +

      // ---- the house shell ----
      '<rect x="244" y="232" width="802" height="464" fill="#9e5b3c"/>' +
      // rooms (wallpaper)
      '<rect x="256" y="244" width="384" height="208" fill="#d7e8f5"/>' +
      '<rect x="652" y="244" width="382" height="208" fill="#f6e7c8"/>' +
      '<rect x="256" y="464" width="384" height="226" fill="#f8dcbc"/>' +
      '<rect x="652" y="464" width="382" height="226" fill="#dcefd6"/>' +
      // wallpaper details
      '<g fill="#c3dbee">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<rect x="' + (262 + i * 64) + '" y="244" width="20" height="208"/>'; }).join('') + '</g>' +
      '<g fill="#eedaa8" opacity=".6">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return '<circle cx="' + (680 + i * 46) + '" cy="270" r="5"/><circle cx="' + (700 + i * 46) + '" cy="300" r="5"/>'; }).join('') + '</g>' +
      // floor between storeys and ground floor
      '<rect x="244" y="452" width="802" height="12" fill="#a8693f"/>' + floor +
      '<rect x="244" y="690" width="802" height="8" fill="#7a4b2a"/>' +
      // partition walls with doorways
      '<rect x="640" y="244" width="12" height="120" fill="#9e5b3c"/>' +
      '<rect x="640" y="464" width="12" height="120" fill="#9e5b3c"/>' +
      // roof with tiles, solar panels and chimney
      '<rect x="380" y="96" width="44" height="80" fill="#8c4a33"/><rect x="374" y="90" width="56" height="12" fill="#6e3a29"/>' +
      '<g fill="#fff" opacity=".7" data-k="smoke"><circle cx="402" cy="80" r="10"><animate attributeName="cy" values="80;20" dur="4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="4s" repeatCount="indefinite"/></circle>' +
        '<circle cx="410" cy="70" r="13"><animate attributeName="cy" values="80;10" dur="4s" begin="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="4s" begin="2s" repeatCount="indefinite"/></circle></g>' +
      '<path d="M210 244 L640 66 L1080 244 Z" fill="#5f4b61"/>' + tiles +
      '<path d="M210 244 L640 66 L1080 244" fill="none" stroke="#3e2f40" stroke-width="8" stroke-linejoin="round"/>' +
      // four panels on the sunny slope, one per PV string
      [0, 1, 2, 3].map(function (i) {
        var x = 700 + i * 84, y = 92 + i * 34.6;
        return '<g transform="translate(' + x + ' ' + y + ') rotate(22)"><rect x="0" y="0" width="80" height="34" rx="2" fill="#1d3557" stroke="#c9d6e3" stroke-width="2"/>' +
          '<path d="M20 0 L20 34 M40 0 L40 34 M60 0 L60 34 M0 17 L80 17" stroke="#7fa7d6" stroke-width="1"/>' +
          '<rect x="0" y="0" width="80" height="34" rx="2" fill="#bfe6ff" opacity="0" data-k="panel' + i + '"/></g>';
      }).join('') +
      // attic window
      '<circle cx="640" cy="170" r="26" fill="#bfe3f7" stroke="#fff" stroke-width="5"/><path d="M640 144 L640 196 M614 170 L666 170" stroke="#fff" stroke-width="4"/>' +

      // ---- bedroom (upstairs left) ----
      '<g><rect x="320" y="282" width="120" height="96" fill="#bfe3f7" stroke="#fff" stroke-width="6"/>' +
        '<path d="M380 282 L380 378" stroke="#fff" stroke-width="4"/>' +
        '<path d="M312 274 L312 384 Q 330 350, 326 300 Z" fill="#ef8fa6"/><path d="M448 274 L448 384 Q 430 350, 434 300 Z" fill="#ef8fa6"/>' +
        '<rect x="306" y="270" width="148" height="7" rx="3" fill="#8a5a3a"/>' +
        '<rect x="312" y="378" width="136" height="8" rx="2" fill="#fff"/>' +
        '<rect x="470" y="380" width="160" height="40" rx="6" fill="#6c8ebf"/><rect x="470" y="392" width="160" height="28" rx="4" fill="#f4d35e"/>' +
        '<path d="M470 392 Q 520 380, 630 392" stroke="#e3be3c" stroke-width="3" fill="none"/>' +
        '<rect x="586" y="372" width="40" height="18" rx="9" fill="#fff"/>' +
        '<rect x="466" y="352" width="10" height="100" fill="#8a5a3a"/><rect x="474" y="420" width="160" height="12" fill="#8a5a3a"/>' +
        '<rect x="268" y="400" width="40" height="52" fill="#a0744f"/><rect x="282" y="372" width="12" height="28" fill="#c9a37c"/>' +
        '<path d="M270 372 L306 372 L298 352 L278 352 Z" fill="#ffcf6b"/>' +
        '<circle cx="288" cy="380" r="40" fill="#ffd27a" opacity="0" class="night" data-k="lamp1"/></g>' +

      // ---- study (upstairs right): desk, monitor showing the console, books ----
      '<g><rect x="700" y="370" width="170" height="10" fill="#8a5a3a"/><rect x="708" y="380" width="8" height="72" fill="#8a5a3a"/><rect x="852" y="380" width="8" height="72" fill="#8a5a3a"/>' +
        '<rect x="740" y="316" width="90" height="56" rx="4" fill="#222"/><rect x="746" y="322" width="78" height="44" fill="#0b2233"/>' +
        '<circle cx="785" cy="344" r="10" fill="none" stroke="#39e6ff" stroke-width="2"/><path d="M760 344 L775 344 M795 344 L812 344" stroke="#ff5ce1" stroke-width="2"/>' +
        '<rect x="778" y="372" width="14" height="6" fill="#444"/>' +
        '<path d="M720 452 L726 410 L770 410 L776 452" fill="none" stroke="#c0392b" stroke-width="6"/><rect x="718" y="398" width="60" height="14" rx="5" fill="#c0392b"/>' +
        '<rect x="924" y="290" width="96" height="152" fill="none" stroke="#8a5a3a" stroke-width="6"/><rect x="924" y="340" width="96" height="6" fill="#8a5a3a"/><rect x="924" y="392" width="96" height="6" fill="#8a5a3a"/>' + books +
        '<rect x="930" y="402" width="30" height="36" rx="4" fill="#7bc47f"/><circle cx="945" cy="400" r="12" fill="#4caf50"/>' +
        '<rect x="676" y="268" width="80" height="40" fill="#fff" stroke="#8a5a3a" stroke-width="3"/><path d="M682 300 L700 284 L714 296 L730 278 L750 300" stroke="#5b8def" stroke-width="3" fill="none"/>' +
        '<circle cx="860" cy="300" r="40" fill="#ffd27a" opacity="0" class="night" data-k="lamp2"/><path d="M860 244 L860 280" stroke="#555" stroke-width="2"/><path d="M846 280 L874 280 L868 292 L852 292 Z" fill="#ffcf6b"/></g>' +

      // ---- living room (downstairs left): sofa, TV, rug, plant, wall tag ----
      '<g><ellipse cx="380" cy="684" rx="130" ry="10" fill="#e07a5f"/><ellipse cx="380" cy="684" rx="100" ry="6" fill="#f2cc8f"/>' +
        '<rect x="268" y="560" width="200" height="70" rx="18" fill="#3d5a80"/><rect x="262" y="600" width="212" height="44" rx="14" fill="#4f6fa0"/>' +
        '<rect x="268" y="644" width="10" height="16" fill="#2b3f5c"/><rect x="458" y="644" width="10" height="16" fill="#2b3f5c"/>' +
        '<rect x="296" y="586" width="52" height="34" rx="10" fill="#f4d35e"/>' +
        '<rect x="520" y="560" width="100" height="62" rx="4" fill="#222"/><rect x="526" y="566" width="88" height="50" fill="#264653" data-k="tvScreen"/>' +
        '<text x="570" y="592" text-anchor="middle" font-size="22" font-weight="800" fill="#e9f5db" data-k="tvText"></text><text x="570" y="608" text-anchor="middle" font-size="10" fill="#b7e4c7">SELF-POWERED</text>' +
        '<rect x="530" y="622" width="80" height="44" fill="#8a5a3a"/><rect x="536" y="630" width="68" height="4" fill="#6e4528"/>' +
        '<rect x="600" y="650" width="26" height="40" rx="4" fill="#c46a3b"/><path d="M613 650 C 590 620, 600 600, 613 612 C 626 600, 636 620, 613 650" fill="#4caf50"/>' +
        '<circle cx="450" cy="510" r="44" fill="#ffd27a" opacity="0" class="night" data-k="lamp3"/><path d="M450 464 L450 492" stroke="#555" stroke-width="2"/><path d="M434 492 L466 492 L460 504 L440 504 Z" fill="#ffcf6b"/></g>' +

      // ---- kitchen (downstairs right): units, fridge, hob with kettle, clock, chalkboard ----
      '<g><rect x="680" y="600" width="260" height="90" fill="#7aa5a0"/><rect x="676" y="594" width="268" height="10" fill="#e9e3d5"/>' +
        [0, 1, 2, 3].map(function (i) { return '<rect x="' + (688 + i * 64) + '" y="612" width="56" height="70" rx="3" fill="#8fbcb6"/><rect x="' + (712 + i * 64) + '" y="640" width="8" height="3" rx="1.5" fill="#555"/>'; }).join('') +

        '<rect x="956" y="520" width="70" height="170" rx="8" fill="#eef2f3" stroke="#b9c2c4" stroke-width="2"/><rect x="956" y="580" width="70" height="3" fill="#b9c2c4"/><rect x="964" y="540" width="4" height="26" fill="#9aa"/><rect x="964" y="592" width="4" height="36" fill="#9aa"/>' +
        '<rect x="840" y="588" width="70" height="6" fill="#444"/>' +
        '<g transform="translate(872 588)"><path d="M-16 0 L-12 -26 L12 -26 L16 0 Z" fill="#e63946"/><rect x="-6" y="-31" width="12" height="5" rx="2" fill="#333"/><path d="M14 -20 L24 -26" stroke="#e63946" stroke-width="5" stroke-linecap="round"/>' +
          '<g fill="#fff" opacity=".8"><circle cx="24" cy="-34" r="4"><animate attributeName="cy" values="-30;-70" dur="2.5s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2.5s" repeatCount="indefinite"/></circle>' +
          '<circle cx="28" cy="-40" r="5"><animate attributeName="cy" values="-30;-74" dur="2.5s" begin="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2.5s" begin="1.2s" repeatCount="indefinite"/></circle></g></g>' +
        // wall clock with real hands
        '<g transform="translate(900 500)"><circle r="22" fill="#fff" stroke="#c0392b" stroke-width="4"/><circle r="2" fill="#333"/>' +
          '<path d="M0 0 L0 -12" stroke="#333" stroke-width="3" stroke-linecap="round" data-k="hourHand"/><path d="M0 0 L0 -17" stroke="#333" stroke-width="2" stroke-linecap="round" data-k="minHand"/></g>' +
        // chalkboard with today's numbers
        '<circle cx="840" cy="510" r="44" fill="#ffd27a" opacity="0" class="night" data-k="lamp4"/></g>' +

      // ---- utility room / garage with battery, inverter and meter ----
      '<rect x="1046" y="470" width="168" height="226" fill="#9e5b3c"/><rect x="1056" y="482" width="148" height="208" fill="#e8e4dc"/><rect x="1040" y="462" width="180" height="12" fill="#7a4b2a"/>' +
      '<g transform="translate(1070 520)"><rect width="56" height="166" rx="8" fill="#f4f4f2" stroke="#9aa" stroke-width="2"/>' +
        '<rect x="8" y="10" width="40" height="22" rx="3" fill="#10202c"/><text x="28" y="26" text-anchor="middle" font-size="12" font-weight="700" fill="#4dffb0" data-k="battScreen"></text>' +
        [0, 1, 2, 3, 4].map(function (i) { return '<rect x="10" y="' + (140 - i * 24) + '" width="36" height="18" rx="3" fill="#dfe6e6" data-k="cell' + i + '"/>'; }).join('') + '</g>' +
      '<g transform="translate(1140 520)"><rect width="50" height="64" rx="6" fill="#dadfe2" stroke="#9aa" stroke-width="2"/><circle cx="25" cy="20" r="5" fill="#4caf50"><animate attributeName="opacity" values="1;.2;1" dur="1.4s" repeatCount="indefinite"/></circle>' +
        '<text x="25" y="48" text-anchor="middle" font-size="9" fill="#666">INVERTER</text></g>' +
      '<g transform="translate(1146 610)"><rect width="40" height="50" rx="4" fill="#fff" stroke="#999" stroke-width="2"/><rect x="6" y="8" width="28" height="14" fill="#cfe8cf"/><text x="20" y="40" text-anchor="middle" font-size="9" fill="#666">METER</text></g>' +
      // utility pole outside
      '<rect x="1248" y="380" width="10" height="316" fill="#7a5235"/><rect x="1230" y="392" width="46" height="6" fill="#7a5235"/>' +
      '<path d="M1236 392 C 1220 440, 1205 470, 1200 610" stroke="#333" stroke-width="2" fill="none"/>' +

      // ---- energy flows (dotted, animated) ----
      '<path class="flow" stroke="#ffb703" d="M1060 244 L1060 470 L1100 520" data-k="pvFlow"/>' +
      '<path class="flow" stroke="#06d6a0" d="M1140 552 L1126 552" data-k="battFlow"/>' +
      '<path class="flow" stroke="#ff5d8f" d="M1236 398 C 1222 444, 1207 474, 1202 608" data-k="gridFlow"/>' +
      '<path class="flow" stroke="#4cc9f0" d="M1146 584 L1046 584 L960 584" data-k="loadFlow"/>' +

      // ---- the household ----
      collie() + vanCat() + cavapoo() + hen() +

      // ---- labels ----
      tag('pv', 760, 6, 280, '#e09f00') +
      tag('batt', 1060, 410, 210, '#0aa77a') +
      tag('grid', 1080, 300, 190, '#e0446f') +
      tag('load', 262, 480, 180, '#2c7da0') +
      // title card
      '<g transform="translate(250 20)"><rect width="380" height="64" rx="14" fill="rgba(255,250,240,.92)" stroke="' + INK + '" stroke-width="3"/>' +
        '<text x="20" y="28" font-size="22" font-weight="800" fill="' + INK + '" data-k="title"></text>' +
        '<text x="20" y="52" font-size="16" fill="#6b5a5a" data-k="subtitle"></text></g>';
  }

  function chalkboard() {
    return '<g transform="translate(700 476)"><rect width="150" height="112" rx="6" fill="#8a5a3a"/><rect x="6" y="6" width="138" height="100" rx="3" fill="#2f4f3f"/>' +
      '<text class="chalk" x="14" y="26" font-size="15" font-weight="700">TODAY</text>' +
      '<text class="chalk" x="14" y="46" font-size="13" data-k="cb1"></text><text class="chalk" x="14" y="63" font-size="13" data-k="cb2"></text>' +
      '<text class="chalk" x="14" y="80" font-size="13" data-k="cb3"></text><text class="chalk" x="14" y="97" font-size="13" data-k="cb4"></text></g>';
  }

  HC.themes.register('home', {
    label: 'Home cross-section',

    mount: function (root) {
      root.innerHTML = '<style>' + CSS + '</style><svg width="1280" height="800" viewBox="0 0 1280 800"><defs>' +
        '<linearGradient id="hosky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc6f2"/><stop offset="1" stop-color="#d7f0ff"/></linearGradient>' +
        '<linearGradient id="honight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1b3e"/><stop offset="1" stop-color="#2c3e70"/></linearGradient>' +
        '</defs>' + scene() + chalkboard() + '</svg>';
      el = Art.refs(root);
    },

    update: function (m) {
      var t = function (k, v) { Art.text(el, k, v); };
      var gridNet = m.gridIn - m.gridOut, h = m.now.getHours();
      var night = !(m.pv > 0.05 || (h >= 7 && h < 19));
      el.night.style.opacity = night ? 1 : 0;
      el.sun.style.opacity = night ? 0 : 1;
      ['lamp1', 'lamp2', 'lamp3', 'lamp4'].forEach(function (k) { el[k].style.opacity = night ? 0.45 : 0; });
      el.smoke.style.opacity = m.outTemp !== undefined && m.outTemp < 12 ? 0.7 : 0;

      m.strings.forEach(function (kw, i) { el['panel' + i].setAttribute('opacity', Art.frac(kw, m.max.pv / m.strings.length) * 0.55); });
      var cells = Math.round(Art.clamp(m.soc / 20, 0, 5));
      for (var c = 0; c < 5; c++) el['cell' + c].setAttribute('fill', c < cells ? (m.soc < 20 ? '#f4a259' : '#06d6a0') : '#dfe6e6');
      t('battScreen', fmt.n(m.soc) + '%');

      Art.flow(el.pvFlow, m.pv, false);
      Art.flow(el.battFlow, m.batt, m.batt < 0);
      Art.flow(el.gridFlow, gridNet, gridNet < 0);
      Art.flow(el.loadFlow, m.load, false);

      t('pvLbl', 'SOLAR PANELS'); t('pvVal', fmt.kw(m.pv) + ' kW  ·  ' + fmt.n(m.dailyPv, 1) + ' kWh today');
      t('battLbl', m.batt > 0.02 ? 'BATTERY · CHARGING' : m.batt < -0.02 ? 'BATTERY · POWERING HOME' : 'BATTERY · RESTING');
      t('battVal', fmt.n(m.soc) + '%  ·  ' + (m.batt > 0 ? '+' : '') + fmt.kw(m.batt) + ' kW');
      t('gridLbl', gridNet > 0.02 ? 'GRID · BUYING' : gridNet < -0.02 ? 'GRID · SELLING' : 'GRID · IDLE');
      t('gridVal', fmt.kw(Math.abs(gridNet)) + ' kW');
      t('loadLbl', 'HOUSE IS USING'); t('loadVal', fmt.kw(m.load) + ' kW');
      t('tvText', fmt.n(m.selfSufficiency) + '%');
      t('outTemp', fmt.n(m.outTemp) + '°C');

      t('cb1', 'sun ' + fmt.n(m.dailyPv, 1) + ' kWh'); t('cb2', 'used ' + fmt.n(m.dailyLoad, 1) + ' kWh');
      t('cb3', 'bought ' + fmt.n(m.dailyImport, 1) + ' kWh'); t('cb4', 'cost £' + fmt.n(m.cost, 2));

      var min = m.now.getMinutes();
      el.minHand.setAttribute('transform', 'rotate(' + (min * 6) + ')');
      el.hourHand.setAttribute('transform', 'rotate(' + ((h % 12) * 30 + min * 0.5) + ')');

      // The collie's tail wags faster when the sun is out.
      var wag = (m.pv > 2 ? 0.35 : m.pv > 0.3 ? 0.55 : 0.9) + 's';
      if (el.wag.getAttribute('dur') !== wag) el.wag.setAttribute('dur', wag);

      t('title', 'Home, sweet home');
      t('subtitle', m.now.toLocaleDateString([], { weekday: 'long' }) + ' · ' + fmt.time(m.now) + ' · ' + (night ? 'everyone is settling in' : m.pv > 0.3 ? 'the sun is doing the work' : 'a quiet day'));
    },
  });
})(window.HC);
