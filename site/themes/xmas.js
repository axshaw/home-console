// Christmas, cinematic: a snowy night shot with a shallow depth of field. A softly out-of-focus
// village glows on the hill, a richly lit fir tree stands in the middle ground, and foreground
// lens bokeh drifts past. The tree's fairy lights fill from the bottom up with the battery
// charge and twinkle with star-flare glints; the wooden sign counts the sleeps. All readings sit
// on large frosted-glass cards so they're legible on a 7" tablet.
//
// Performance: blur and grain filters are only on static layers; everything that moves animates
// opacity/transform (cheap on old WebViews). Snow and bokeh are soft radial gradients, not blurs.
(function (HC) {
  'use strict';
  var fmt = HC.format, Art = HC.art;

  var GOLD = '#ffd58a', WARM = '#ffb35c', CREAM = '#fff4dc';
  var LIGHTS = 40;
  var TREE = { x: 880, top: 150, base: 600, half: 230 };
  var el = {};

  var CSS =
    '.theme-xmas { background:#050b1c; font-family: "Segoe UI", "Roboto", "Helvetica Neue", sans-serif; color:#fff; }' +
    '.theme-xmas svg { position:absolute; left:0; top:0; }' +
    '.theme-xmas .bulb .halo { transition: opacity 1s; }' +
    '.theme-xmas .bulb.on .halo { animation: xmtw 2.4s ease-in-out infinite; }' +
    '@keyframes xmtw { 0%, 100% { opacity:.95 } 50% { opacity:.45 } }' +
    '.theme-xmas .flare { animation: xmflare 5s ease-in-out infinite; opacity:0; }' +
    '@keyframes xmflare { 0%, 70%, 100% { opacity:0; transform: scale(.4) rotate(0deg) } 82% { opacity:1; transform: scale(1) rotate(20deg) } }' +
    // falling snow, two depths: far flakes small and crisp, near flakes large and soft (out of focus)
    '.theme-xmas .snow i { position:absolute; top:-40px; border-radius:50%; animation: xmsnow linear infinite; }' +
    '.theme-xmas .snow i.far { background: rgba(255,255,255,.85); }' +
    '.theme-xmas .snow i.near { background: radial-gradient(circle, rgba(255,255,255,.55) 0%, rgba(255,255,255,.18) 45%, rgba(255,255,255,0) 70%); }' +
    '@keyframes xmsnow { 0% { transform: translate(0,0) } 50% { transform: translate(30px,440px) } 100% { transform: translate(-12px,880px) } }' +
    '.theme-xmas .bokeh i { position:absolute; border-radius:50%; animation: xmdrift ease-in-out infinite alternate; }' +
    '@keyframes xmdrift { from { transform: translate(0,0) } to { transform: translate(26px,-18px) } }' +
    // frosted-glass reading cards
    '.theme-xmas .cards { position:absolute; left:36px; right:36px; bottom:30px; height:150px; }' +
    '.theme-xmas .card { position:absolute; top:0; width:283px; height:150px; box-sizing:border-box; padding:16px 22px 0; border-radius:20px;' +
      ' background: linear-gradient(160deg, rgba(22,34,62,.88), rgba(6,12,28,.92)); border:1px solid rgba(255,220,160,.28);' +
      ' box-shadow: 0 10px 30px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.18); }' +
    '.theme-xmas .card .lbl { font-size:19px; letter-spacing:3px; color:' + GOLD + '; font-weight:600; }' +
    '.theme-xmas .card .val { font-size:58px; line-height:68px; font-weight:700; color:#fff; text-shadow: 0 2px 10px rgba(0,0,0,.6); white-space:nowrap; }' +
    '.theme-xmas .card .val small { font-size:24px; font-weight:600; margin-left:6px; color:rgba(255,255,255,.75); }' +
    '.theme-xmas .card .sub { font-size:19px; color:rgba(255,244,220,.9); white-space:nowrap; }' +
    '.theme-xmas .card .dot { display:inline-block; width:12px; height:12px; border-radius:50%; margin-right:10px; vertical-align:2px; }' +
    '.theme-xmas .top { position:absolute; left:40px; right:40px; top:26px; display:flex; justify-content:space-between; align-items:flex-start; text-shadow: 0 2px 12px rgba(0,0,0,.7); }' +
    '.theme-xmas .top .title { font-family: Georgia, "Times New Roman", serif; font-size:30px; letter-spacing:6px; color:' + CREAM + '; }' +
    '.theme-xmas .top .title small { display:block; font-family: "Segoe UI", Roboto, sans-serif; font-size:18px; letter-spacing:3px; color:rgba(255,244,220,.75); margin-top:4px; }' +
    '.theme-xmas .top .clock { font-size:64px; font-weight:300; line-height:60px; text-align:right; }' +
    '.theme-xmas .top .clock small { display:block; font-size:18px; letter-spacing:2px; color:rgba(255,255,255,.75); font-weight:400; }';

  // ---------- scenery ----------
  function sky() {
    var r = Art.rng(1224), s = '<rect width="1280" height="800" fill="url(#xmsky)"/>';
    for (var i = 0; i < 120; i++) {
      var x = r() * 1280, y = r() * 380, o = (0.25 + r() * 0.6).toFixed(2);
      s += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + (0.5 + r() * 1.1).toFixed(1) + '" fill="#fff" opacity="' + o + '"/>';
    }
    // soft moon glow behind thin haze
    s += '<circle cx="210" cy="150" r="220" fill="url(#xmmoonglow)"/><circle cx="210" cy="150" r="44" fill="#fdf6e3" opacity=".92"/>';
    return s;
  }

  // Distant hill village: drawn sharp, then blurred once (static) for depth of field.
  function village() {
    var r = Art.rng(77), s = '<path d="M0 500 C 220 455, 430 495, 640 470 C 860 445, 1060 490, 1280 465 L1280 640 L0 640 Z" fill="#1b2a4a"/>';
    for (var i = 0; i < 26; i++) {
      var x = 20 + i * 48 + r() * 18, h = 26 + r() * 30, y = 492 - Math.sin(i * 0.45) * 16 - h, w = 30 + r() * 16;
      s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (h + 30) + '" fill="#13203b"/>' +
        '<path d="M' + (x - 4) + ' ' + y + ' L' + (x + w / 2) + ' ' + (y - 16) + ' L' + (x + w + 4) + ' ' + y + ' Z" fill="#e8eef7"/>';
      if (r() < 0.8) s += '<rect x="' + (x + 7) + '" y="' + (y + 10) + '" width="8" height="9" fill="' + WARM + '"/>';
      if (r() < 0.6) s += '<rect x="' + (x + w - 15) + '" y="' + (y + 10) + '" width="8" height="9" fill="' + GOLD + '"/>';
    }
    for (i = 0; i < 30; i++) {
      var fx = r() * 1280, fh = 40 + r() * 50, fy = 520 - Math.sin(fx / 200) * 12;
      s += '<path d="M' + fx + ' ' + (fy - fh) + ' L' + (fx + fh * 0.3) + ' ' + fy + ' L' + (fx - fh * 0.3) + ' ' + fy + ' Z" fill="#0f1c33"/>';
    }
    // warm haze where the village light scatters
    s += '<rect x="0" y="420" width="1280" height="140" fill="url(#xmhaze)"/>';
    return '<g filter="url(#xmdof)">' + s + '</g>';
  }

  function ground() {
    var r = Art.rng(31), s = '<path d="M0 560 C 300 535, 640 575, 960 548 C 1100 538, 1200 550, 1280 545 L1280 800 L0 800 Z" fill="url(#xmsnowfield)"/>';
    // glinting snow crystals
    for (var i = 0; i < 40; i++) {
      s += '<circle cx="' + (r() * 1280).toFixed(0) + '" cy="' + (575 + r() * 220).toFixed(0) + '" r="1.4" fill="#fff">' +
        '<animate attributeName="opacity" values="0;1;0" dur="' + (2 + r() * 4).toFixed(1) + 's" begin="-' + (r() * 5).toFixed(1) + 's" repeatCount="indefinite"/></circle>';
    }
    return s;
  }

  // ---------- the tree ----------
  function insideTree(x, y) {
    var t = (y - TREE.top) / (TREE.base - TREE.top);
    return t >= 0 && t <= 1 && Math.abs(x - TREE.x) <= TREE.half * t * (0.92 + 0.08 * Math.sin(t * 40));
  }

  function tree() {
    var r = Art.rng(1225), s = '', i;
    // trunk and contact shadow
    s += '<ellipse cx="' + TREE.x + '" cy="' + (TREE.base + 10) + '" rx="240" ry="22" fill="#000" opacity=".35"/>' +
      '<rect x="' + (TREE.x - 18) + '" y="' + (TREE.base - 20) + '" width="36" height="40" fill="#3b2416"/>';
    // silhouette tiers with lit-from-left shading
    for (var k = 0; k < 6; k++) {
      var t0 = k / 6, t1 = (k + 1.35) / 6;
      var y0 = TREE.top + t0 * (TREE.base - TREE.top), y1 = Math.min(TREE.base, TREE.top + t1 * (TREE.base - TREE.top));
      var hw = TREE.half * Math.min(1, t1);
      var d = 'M' + TREE.x + ' ' + (y0 - 6) + ' L' + (TREE.x + hw) + ' ' + y1;
      for (var j = 8; j >= 0; j--) d += ' Q ' + (TREE.x - hw + (j + 0.5) * hw / 4.5) + ' ' + (y1 + 14) + ', ' + (TREE.x - hw + j * hw / 4.5) + ' ' + y1;
      s += '<path d="' + d + ' Z" fill="url(#xmfir)"/>';
    }
    // needle texture: hundreds of short strokes, lighter on the lit side
    var greens = ['#0d3320', '#124a2c', '#1a5c36', '#246b40', '#2f7a49'];
    for (i = 0; i < 900; i++) {
      var y = TREE.top + 10 + r() * (TREE.base - TREE.top - 10), x = TREE.x + (r() * 2 - 1) * TREE.half;
      if (!insideTree(x, y)) continue;
      var side = (x - TREE.x) / TREE.half, len = 8 + r() * 12, ang = (side < 0 ? Math.PI * 0.75 : Math.PI * 0.25) + (r() - 0.5) * 0.6;
      var c = greens[Math.max(0, Math.min(4, Math.round(2 - side * 1.6 + (r() - 0.5) * 1.4)))];
      s += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' l' + (Math.cos(ang) * len).toFixed(1) + ' ' + (Math.sin(ang) * len).toFixed(1) + '" stroke="' + c + '" stroke-width="2.2" stroke-linecap="round"/>';
    }
    // snow resting on the branch tips
    for (i = 0; i < 70; i++) {
      var sy = TREE.top + 30 + r() * (TREE.base - TREE.top - 40), sx = TREE.x + (r() * 2 - 1) * TREE.half;
      if (!insideTree(sx, sy)) continue;
      s += '<ellipse cx="' + sx.toFixed(0) + '" cy="' + sy.toFixed(0) + '" rx="' + (5 + r() * 9).toFixed(1) + '" ry="' + (2 + r() * 2.5).toFixed(1) + '" fill="#f2f7ff" opacity=".9"/>';
    }
    // gold garland swags
    s += '<g fill="none" stroke="url(#xmgold)" stroke-width="4" stroke-linecap="round" opacity=".9">';
    [[0.28, 0.36], [0.46, 0.55], [0.64, 0.74], [0.82, 0.93]].forEach(function (g) {
      var ya = TREE.top + g[0] * (TREE.base - TREE.top), yb = TREE.top + g[1] * (TREE.base - TREE.top), wa = TREE.half * g[0] * 0.9, wb = TREE.half * g[1] * 0.9;
      s += '<path d="M' + (TREE.x - wa) + ' ' + ya + ' Q ' + TREE.x + ' ' + (yb + 30) + ', ' + (TREE.x + wb) + ' ' + yb + '"/>';
    });
    s += '</g>';
    // glass baubles with specular highlights
    var baubles = [[0.33, -0.35, 'red'], [0.4, 0.45, 'gold'], [0.52, -0.1, 'blue'], [0.6, 0.55, 'red'], [0.66, -0.6, 'gold'], [0.74, 0.2, 'red'],
      [0.8, -0.35, 'blue'], [0.86, 0.65, 'gold'], [0.9, -0.75, 'red'], [0.5, 0.15, 'gold'], [0.7, 0.75, 'blue'], [0.94, 0.05, 'red']];
    baubles.forEach(function (b) {
      var by = TREE.top + b[0] * (TREE.base - TREE.top), bx = TREE.x + b[1] * TREE.half * b[0] * 0.85, br = 10 + b[0] * 8;
      s += '<line x1="' + bx + '" y1="' + (by - br - 10) + '" x2="' + bx + '" y2="' + (by - br) + '" stroke="#c9a456" stroke-width="1"/>' +
        '<rect x="' + (bx - 3.5) + '" y="' + (by - br - 4) + '" width="7" height="5" rx="1" fill="#d6b25e"/>' +
        '<circle cx="' + bx + '" cy="' + by + '" r="' + br + '" fill="url(#xmb' + b[2] + ')"/>' +
        '<ellipse cx="' + (bx - br * 0.35) + '" cy="' + (by - br * 0.4) + '" rx="' + (br * 0.28) + '" ry="' + (br * 0.18) + '" fill="#fff" opacity=".75"/>';
    });
    // fairy lights: a halo (bloom) + bright core; lit count follows the battery
    var colours = ['#ffcf6e', '#ff8a6e', '#ffe9a8', '#ffb35c'];
    for (i = 0; i < LIGHTS; i++) {
      var tt = 0.12 + (i / (LIGHTS - 1)) * 0.86;
      var ly = TREE.top + tt * (TREE.base - TREE.top), lx = TREE.x + Math.sin(i * 2.399) * TREE.half * tt * 0.86;
      s += '<g class="bulb" data-k="light' + i + '" transform="translate(' + lx.toFixed(1) + ' ' + ly.toFixed(1) + ')">' +
        '<circle class="halo" r="24" fill="url(#xmhalo)" opacity=".08" style="animation-delay:-' + (i * 0.31).toFixed(2) + 's"/>' +
        '<circle class="core" r="4.4" fill="' + colours[i % 4] + '" opacity=".35"/></g>';
    }
    // star-flare glints that pop on some lights (the twinkle)
    for (i = 0; i < 6; i++) {
      var ft = 0.2 + i * 0.13, fy = TREE.top + ft * (TREE.base - TREE.top), fx = TREE.x + Math.sin(i * 2.1 + 1) * TREE.half * ft * 0.7;
      s += '<g transform="translate(' + fx.toFixed(0) + ' ' + fy.toFixed(0) + ')"><g class="flare" style="animation-delay:-' + (i * 0.83).toFixed(2) + 's">' +
        '<path d="M0 -26 L2 -2 L26 0 L2 2 L0 26 L-2 2 L-26 0 L-2 -2 Z" fill="#fffbe8"/><circle r="6" fill="url(#xmhalo)"/></g></g>';
    }
    // the star: glow, lens rays, gentle pulse
    s += '<g transform="translate(' + TREE.x + ' ' + (TREE.top - 12) + ')">' +
      '<circle r="70" fill="url(#xmstarglow)" data-k="starGlow"/>' +
      '<g opacity=".7"><path d="M0 -95 L3 0 L0 95 L-3 0 Z M-110 0 L0 -2.5 L110 0 L0 2.5 Z" fill="#fff6d8"/>' +
        '<animateTransform attributeName="transform" type="rotate" values="0;8;0" dur="9s" repeatCount="indefinite"/></g>' +
      '<path d="M0 -30 L8 -10 L30 -9 L13 4 L19 27 L0 14 L-19 27 L-13 4 L-30 -9 L-8 -10 Z" fill="url(#xmgold)" stroke="#fff3c4" stroke-width="1.5"/>' +
      '<animateTransform attributeName="transform" type="scale" additive="sum" values="1;1.06;1" dur="3s" repeatCount="indefinite"/></g>';
    return s;
  }

  // ---------- the sleeps sign ----------
  function sign() {
    var r = Art.rng(9), grain = '';
    for (var i = 0; i < 14; i++) {
      var y = 14 + i * 13 + r() * 6;
      grain += '<path d="M6 ' + y.toFixed(1) + ' C 90 ' + (y + r() * 6 - 3).toFixed(1) + ', 200 ' + (y + r() * 6 - 3).toFixed(1) + ', 314 ' + (y + r() * 4 - 2).toFixed(1) + '" stroke="#3a2210" stroke-opacity="' + (0.15 + r() * 0.25).toFixed(2) + '" stroke-width="' + (1 + r() * 1.5).toFixed(1) + '" fill="none"/>';
    }
    return '<g transform="translate(74 238) rotate(-3)">' +
      '<rect x="146" y="196" width="28" height="170" fill="url(#xmpost)"/>' +
      '<ellipse cx="160" cy="100" rx="230" ry="160" fill="url(#xmsignlight)"/>' +
      '<rect x="0" y="0" width="320" height="200" rx="10" fill="url(#xmwood)"/>' + grain +
      '<rect x="0" y="0" width="320" height="200" rx="10" fill="none" stroke="#2a170a" stroke-width="5"/>' +
      '<rect x="10" y="10" width="300" height="180" rx="6" fill="none" stroke="#f6d7a0" stroke-opacity=".25" stroke-width="2"/>' +
      '<circle cx="22" cy="22" r="4" fill="#8a8f96"/><circle cx="298" cy="22" r="4" fill="#8a8f96"/><circle cx="22" cy="178" r="4" fill="#8a8f96"/><circle cx="298" cy="178" r="4" fill="#8a8f96"/>' +
      '<path d="M-6 6 C 30 -14, 80 -6, 120 -12 C 170 -18, 230 -6, 270 -12 C 300 -16, 322 -4, 326 8 L 326 14 C 250 6, 90 10, -6 16 Z" fill="#f4f8ff"/>' +
      // painted number with a carved shadow, and the caption
      '<text x="163" y="135" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="122" font-weight="700" fill="#1d0f05" opacity=".65" data-k="sleepsShadow"></text>' +
      '<text x="160" y="130" text-anchor="middle" font-family="Georgia, \'Times New Roman\', serif" font-size="122" font-weight="700" fill="url(#xmpaint)" data-k="sleeps"></text>' +
      '<text x="160" y="172" text-anchor="middle" font-size="21" font-weight="700" letter-spacing="3" fill="' + CREAM + '" data-k="sleepsLbl"></text>' +
      // a twinkle on the sign's corners
      '<g transform="translate(292 34)"><g class="flare" style="animation-delay:-1.2s"><path d="M0 -20 L2 -2 L20 0 L2 2 L0 20 L-2 2 L-20 0 L-2 -2 Z" fill="#fffbe8"/></g></g>' +
      '<g transform="translate(36 160)"><g class="flare" style="animation-delay:-3.4s"><path d="M0 -16 L2 -2 L16 0 L2 2 L0 16 L-2 2 L-16 0 L-2 -2 Z" fill="#fffbe8"/></g></g>' +
      '</g>';
  }

  function defs() {
    return '<defs>' +
      '<linearGradient id="xmsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040a1c"/><stop offset=".45" stop-color="#0d1f45"/><stop offset=".72" stop-color="#2a3560"/><stop offset="1" stop-color="#4a3a52"/></linearGradient>' +
      '<radialGradient id="xmmoonglow"><stop offset=".15" stop-color="#fdf3d5" stop-opacity=".55"/><stop offset=".5" stop-color="#b9c8ef" stop-opacity=".12"/><stop offset="1" stop-color="#b9c8ef" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="xmhaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb35c" stop-opacity="0"/><stop offset=".6" stop-color="#ffb35c" stop-opacity=".16"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="xmsnowfield" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d6ec"/><stop offset=".35" stop-color="#e9effa"/><stop offset="1" stop-color="#9eb0cf"/></linearGradient>' +
      '<linearGradient id="xmfir" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f5a36"/><stop offset=".5" stop-color="#123f27"/><stop offset="1" stop-color="#08241a"/></linearGradient>' +
      '<linearGradient id="xmgold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1c2"/><stop offset=".45" stop-color="#e8b84e"/><stop offset="1" stop-color="#9a6a1c"/></linearGradient>' +
      '<radialGradient id="xmbred" cx=".35" cy=".3"><stop offset="0" stop-color="#ff9a8a"/><stop offset=".35" stop-color="#d4202e"/><stop offset="1" stop-color="#5a0710"/></radialGradient>' +
      '<radialGradient id="xmbgold" cx=".35" cy=".3"><stop offset="0" stop-color="#fff2c4"/><stop offset=".35" stop-color="#e2a83a"/><stop offset="1" stop-color="#6b4508"/></radialGradient>' +
      '<radialGradient id="xmbblue" cx=".35" cy=".3"><stop offset="0" stop-color="#bfe0ff"/><stop offset=".35" stop-color="#2f6fcf"/><stop offset="1" stop-color="#0b2552"/></radialGradient>' +
      '<radialGradient id="xmhalo"><stop offset="0" stop-color="#fff3cf" stop-opacity="1"/><stop offset=".25" stop-color="#ffcf73" stop-opacity=".7"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="xmstarglow"><stop offset="0" stop-color="#fff6d8" stop-opacity=".9"/><stop offset=".4" stop-color="#ffd27a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="xmwood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a32"/><stop offset=".5" stop-color="#6e4422"/><stop offset="1" stop-color="#4f2f15"/></linearGradient>' +
      '<linearGradient id="xmpost" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a381c"/><stop offset=".5" stop-color="#7a4f2a"/><stop offset="1" stop-color="#3e2510"/></linearGradient>' +
      '<linearGradient id="xmpaint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f1d9a8"/></linearGradient>' +
      '<radialGradient id="xmsignlight"><stop offset="0" stop-color="#ffb35c" stop-opacity=".35"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="xmvignette" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>' +
      '<filter id="xmdof" filterUnits="userSpaceOnUse" x="0" y="300" width="1280" height="360"><feGaussianBlur stdDeviation="2.6"/></filter>' +
      '<filter id="xmgrain" filterUnits="userSpaceOnUse" x="0" y="0" width="1280" height="800"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="1" seed="3"/>' +
        '<feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.1 -.35"/></filter>' +
      '</defs>';
  }

  function card(key, left, dot, label) {
    return '<div class="card" style="left:' + left + 'px"><div class="lbl"><span class="dot" style="background:' + dot + '; box-shadow:0 0 10px ' + dot + '"></span>' + label + '</div>' +
      '<div class="val"><span data-k="' + key + 'Val"></span><small data-k="' + key + 'Unit"></small></div><div class="sub" data-k="' + key + 'Sub"></div></div>';
  }

  HC.themes.register('xmas', {
    label: 'Christmas',

    mount: function (root) {
      var r = Art.rng(1225), snow = '', bokeh = '', i;
      for (i = 0; i < 46; i++) {
        var s = (2 + r() * 3).toFixed(1);
        snow += '<i class="far" style="left:' + Math.round(r() * 1320 - 20) + 'px; width:' + s + 'px; height:' + s + 'px; opacity:' + (0.55 + r() * 0.4).toFixed(2) +
          '; animation-duration:' + (11 + r() * 9).toFixed(1) + 's; animation-delay:-' + (r() * 20).toFixed(1) + 's"></i>';
      }
      for (i = 0; i < 12; i++) {
        var n = (16 + r() * 22).toFixed(0);
        snow += '<i class="near" style="left:' + Math.round(r() * 1320 - 20) + 'px; width:' + n + 'px; height:' + n + 'px; animation-duration:' + (6 + r() * 4).toFixed(1) + 's; animation-delay:-' + (r() * 10).toFixed(1) + 's"></i>';
      }
      // foreground lens bokeh: big out-of-focus light discs with a brighter rim
      var bc = ['255,190,110', '255,140,110', '255,224,160', '140,190,255'];
      [[40, 70, 120], [1140, 120, 150], [990, 40, 90], [520, 120, 70], [1180, 420, 110], [20, 500, 90], [640, 20, 60]].forEach(function (b, j) {
        var c = bc[j % 4];
        bokeh += '<i style="left:' + b[0] + 'px; top:' + b[1] + 'px; width:' + b[2] + 'px; height:' + b[2] + 'px; animation-duration:' + (7 + j * 1.3).toFixed(1) + 's;' +
          ' background: radial-gradient(circle, rgba(' + c + ',.07) 0%, rgba(' + c + ',.10) 60%, rgba(' + c + ',.16) 68%, rgba(' + c + ',0) 74%)"></i>';
      });

      root.innerHTML = '<style>' + CSS + '</style>' +
        '<svg width="1280" height="800" viewBox="0 0 1280 800">' + defs() + sky() + village() + ground() + tree() + sign() +
          '<rect width="1280" height="800" fill="url(#xmvignette)"/>' +
          '<rect width="1280" height="800" filter="url(#xmgrain)" opacity=".09"/>' +
        '</svg>' +
        '<div class="bokeh">' + bokeh + '</div><div class="snow">' + snow + '</div>' +
        '<div class="top"><div class="title">CHRISTMAS AT <span data-k="site"></span><small data-k="subtitle"></small></div>' +
          '<div class="clock"><span data-k="clock"></span><small data-k="date"></small></div></div>' +
        '<div class="cards">' +
          card('pv', 0, '#ffcf6e', 'SOLAR') + card('batt', 303, '#7dffc4', 'TREE LIGHTS') +
          card('grid', 606, '#ff8a9a', 'GRID') + card('load', 909, '#9ad0ff', 'HOUSE') +
        '</div>';
      el = Art.refs(root);
    },

    update: function (m) {
      var t = function (k, v) { Art.text(el, k, v); };

      // Tree lights = battery charge, filling from the bottom of the tree upwards.
      var lit = Math.round(Art.clamp(m.soc / 100, 0, 1) * LIGHTS);
      for (var i = 0; i < LIGHTS; i++) {
        var on = (LIGHTS - 1 - i) < lit, b = el['light' + i], cls = on ? 'bulb on' : 'bulb';
        if (b.getAttribute('class') !== cls) {
          b.setAttribute('class', cls);
          b.firstChild.setAttribute('opacity', on ? '.95' : '.08');
          b.lastChild.setAttribute('opacity', on ? '1' : '.35');
        }
      }
      el.starGlow.setAttribute('opacity', m.batt > 0.02 ? 1 : 0.55);

      t('pvVal', fmt.kw(m.pv)); t('pvUnit', 'kW'); t('pvSub', fmt.n(m.dailyPv, 1) + ' kWh today');
      t('battVal', fmt.n(m.soc)); t('battUnit', '%');
      t('battSub', m.batt > 0.02 ? 'charging +' + fmt.kw(m.batt) + ' kW' : m.batt < -0.02 ? 'powering home ' + fmt.kw(-m.batt) + ' kW' : 'resting');
      t('gridVal', fmt.kw(Math.abs(m.gridNet))); t('gridUnit', 'kW');
      t('gridSub', m.gridNet > 0.02 ? 'buying · £' + fmt.n(m.cost, 2) + ' today' : m.gridNet < -0.02 ? 'selling to the grid' : 'idle · £' + fmt.n(m.cost, 2) + ' today');
      t('loadVal', fmt.kw(m.load)); t('loadUnit', 'kW'); t('loadSub', fmt.n(m.selfSufficiency) + '% home-made today');

      var year = m.now.getFullYear(), xmas = new Date(year, 11, 25);
      if (m.now >= new Date(year, 11, 26)) xmas = new Date(year + 1, 11, 25);
      var sleeps = Math.round((xmas - new Date(year, m.now.getMonth(), m.now.getDate())) / 86400000);
      var big = sleeps <= 0 ? '★' : String(sleeps);
      t('sleeps', big); t('sleepsShadow', big);
      t('sleepsLbl', sleeps <= 0 ? 'MERRY CHRISTMAS!' : sleeps === 1 ? 'SLEEP TILL CHRISTMAS' : 'SLEEPS TILL CHRISTMAS');

      t('site', m.site);
      t('subtitle', (HC.model.isLive(m) ? '' : 'LINK ' + m.link.toUpperCase() + ' · ') + fmt.n(m.outTemp) + '°C OUTSIDE');
      t('clock', fmt.time(m.now));
      t('date', m.now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase());
    },
  });
})(window.HC);
