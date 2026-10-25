// Christmas: a snowy night. A log cottage with warm windows and roof lights, a big tree whose fairy
// lights fill up with the battery charge, presents with gift tags for the readouts, a snowman
// counting the sleeps, a robin on the fence, falling snow and a sleigh crossing the moon.
window.Themes = window.Themes || {};

(function () {
  var GOLD = '#ffd36b', RED = '#d62839', GREEN = '#1f6f43', CREAM = '#fff6e0';
  var LIGHTS = 36;
  var el = {};

  var CSS =
    '.theme-xmas { background:#0b1a3a; font-family: "Georgia", serif; }' +
    '.theme-xmas svg { position:absolute; left:0; top:0; }' +
    '.theme-xmas .snow i { position:absolute; top:-20px; border-radius:50%; background:#fff; animation: xsnow linear infinite; }' +
    '@keyframes xsnow { 0% { transform: translate(0, 0) } 50% { transform: translate(24px, 420px) } 100% { transform: translate(-10px, 840px) } }' +
    '.theme-xmas .bulb { transition: opacity 1s; }' +
    '.theme-xmas .bulb.on { animation: xtwinkle 1.8s ease-in-out infinite; }' +
    '@keyframes xtwinkle { 0%, 100% { opacity:1 } 50% { opacity:.45 } }' +
    '.theme-xmas .script { font-family: "Segoe Script", "Brush Script MT", "Dancing Script", cursive; }';

  function tier(cx, topY, w, h) {
    // A fir tier with a scalloped lower edge and a snowy rim.
    var l = cx - w / 2, r = cx + w / 2, by = topY + h, d = 'M' + cx + ' ' + topY + ' L' + r + ' ' + by;
    for (var i = 5; i >= 0; i--) d += ' Q ' + (l + (i + 0.5) * w / 6) + ' ' + (by + 16) + ', ' + (l + i * w / 6) + ' ' + by;
    var snow = 'M' + (l + 8) + ' ' + (by - 2);
    for (i = 0; i < 6; i++) snow += ' Q ' + (l + (i + 0.5) * w / 6) + ' ' + (by + 10) + ', ' + (l + (i + 1) * w / 6 - (i === 5 ? 8 : 0)) + ' ' + (by - 2);
    return '<path d="' + d + ' Z" fill="' + GREEN + '"/><path d="' + d + ' Z" fill="url(#xtreeshade)"/>' +
      '<path d="' + snow + '" stroke="#f4fbff" stroke-width="6" fill="none" stroke-linecap="round"/>';
  }

  function gift(key, x, w, h, color, ribbon, label) {
    var y = 690 - h;
    return '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="' + color + '"/>' +
      '<rect x="' + (x + w / 2 - 7) + '" y="' + y + '" width="14" height="' + h + '" fill="' + ribbon + '"/>' +
      '<rect x="' + x + '" y="' + (y + h * 0.35) + '" width="' + w + '" height="12" fill="' + ribbon + '"/>' +
      '<path d="M' + (x + w / 2) + ' ' + y + ' C ' + (x + w / 2 - 34) + ' ' + (y - 26) + ', ' + (x + w / 2 - 30) + ' ' + (y + 6) + ', ' + (x + w / 2) + ' ' + y +
        ' C ' + (x + w / 2 + 30) + ' ' + (y + 6) + ', ' + (x + w / 2 + 34) + ' ' + (y - 26) + ', ' + (x + w / 2) + ' ' + y + '" fill="' + ribbon + '"/>' +
      // gift tag tied onto the front of the box
      '<g transform="translate(' + (x + w / 2) + ' ' + (y + h - 26) + ') rotate(-4)">' +
        '<path d="M' + (-w / 2 + 8) + ' -16 L' + (w / 2 - 8) + ' -16 L' + (w / 2 - 2) + ' 0 L' + (w / 2 - 8) + ' 16 L' + (-w / 2 + 8) + ' 16 Z" fill="' + CREAM + '" stroke="#c9a96e" stroke-width="2"/>' +
        '<circle cx="' + (w / 2 - 10) + '" cy="0" r="2.5" fill="#c9a96e"/>' +
        '<text x="-4" y="-3" text-anchor="middle" font-size="9.5" fill="#8a5a2a" letter-spacing="1">' + label + '</text>' +
        '<text x="-4" y="12" text-anchor="middle" font-size="14" font-weight="700" fill="' + RED + '" data-k="' + key + 'Val"></text></g></g>';
  }

  function scene() {
    var r = Art.rng(2512), s = '';
    // Stars twinkling.
    for (var i = 0; i < 90; i++) {
      var sx = Math.round(r() * 1280), sy = Math.round(r() * 470), sr = (0.6 + r() * 1.6).toFixed(1);
      s += '<circle cx="' + sx + '" cy="' + sy + '" r="' + sr + '" fill="#fff"><animate attributeName="opacity" values="1;.25;1" dur="' + (2 + r() * 4).toFixed(1) + 's" begin="-' + (r() * 4).toFixed(1) + 's" repeatCount="indefinite"/></circle>';
    }
    // A soft aurora ribbon.
    s += '<path d="M-50 210 C 200 140, 420 260, 700 180 C 950 110, 1100 220, 1350 150" stroke="url(#xaurora)" stroke-width="46" fill="none" opacity=".12" stroke-linecap="round">' +
      '<animate attributeName="opacity" values=".06;.15;.06" dur="12s" repeatCount="indefinite"/></path>';
    // Moon and the guiding star.
    s += '<circle cx="190" cy="120" r="80" fill="url(#xmoonglow)"/><circle cx="190" cy="120" r="46" fill="#fff8de"/><circle cx="210" cy="108" r="42" fill="#0e2148"/>' +
      '<g transform="translate(1180 70)"><path d="M0 -26 L5 -5 L26 0 L5 5 L0 26 L-5 5 L-26 0 L-5 -5 Z" fill="#fffbe6"/><circle r="22" fill="url(#xstarglow)"/>' +
        '<animateTransform attributeName="transform" type="scale" additive="sum" values="1;1.2;1" dur="3s" repeatCount="indefinite"/></g>';
    // Santa's sleigh and reindeer crossing the sky.
    var deer = '';
    for (i = 0; i < 4; i++) {
      var dx = 60 + i * 38;
      deer += '<g transform="translate(' + dx + ' ' + (-i * 4) + ')"><ellipse cx="0" cy="0" rx="14" ry="6" fill="#140f1f"/><path d="M10 -3 L18 -12 L22 -10 M18 -12 L16 -20 M18 -12 L24 -18" stroke="#140f1f" stroke-width="2" fill="none"/>' +
        '<path d="M-10 4 L-14 12 M-4 4 L-2 12 M6 4 L10 12 M10 4 L14 11" stroke="#140f1f" stroke-width="2"/>' + (i === 3 ? '<circle cx="23" cy="-9" r="3" fill="#ff3b3b"/>' : '') + '</g>';
    }
    s += '<g><path d="M-30 -6 C -30 8, -10 10, 20 8 L 26 -8 L 0 -6 Z" fill="#140f1f"/><path d="M-36 10 C -20 16, 20 16, 34 8" stroke="#140f1f" stroke-width="2" fill="none"/>' +
      '<circle cx="-6" cy="-14" r="7" fill="#140f1f"/><path d="M20 -2 L 60 -4" stroke="#140f1f" stroke-width="1"/>' + deer +
      '<animateMotion dur="38s" begin="-6s" repeatCount="indefinite" path="M-260 260 C 200 120, 700 60, 1500 150"/></g>';
    // Distant hills and a snowy fir forest.
    s += '<path d="M0 560 C 200 500, 420 540, 640 505 C 860 470, 1060 530, 1280 500 L1280 800 L0 800 Z" fill="#cfe0f3"/>';
    for (i = 0; i < 22; i++) {
      var fx = i * 62 + r() * 30, fh = 50 + r() * 50, fy = 548 - Math.sin(i * 0.5) * 18;
      s += '<path d="M' + fx + ' ' + (fy - fh) + ' L' + (fx + fh * 0.32) + ' ' + fy + ' L' + (fx - fh * 0.32) + ' ' + fy + ' Z" fill="#244a63"/>' +
        '<path d="M' + fx + ' ' + (fy - fh) + ' L' + (fx + fh * 0.14) + ' ' + (fy - fh * 0.56) + ' L' + (fx - fh * 0.14) + ' ' + (fy - fh * 0.56) + ' Z" fill="#eef6ff"/>';
    }
    s += '<path d="M0 620 C 260 590, 520 640, 760 615 C 1000 590, 1150 630, 1280 610 L1280 800 L0 800 Z" fill="#eef5ff"/>' +
      '<path d="M0 700 C 300 680, 800 720, 1280 690 L1280 800 L0 800 Z" fill="#ffffff"/>' +
      '<path d="M340 800 C 330 740, 305 690, 295 656" stroke="#dbe8f7" stroke-width="40" fill="none"/>';

    // ---- the cottage ----
    s += '<g>' +
      '<rect x="380" y="380" width="34" height="80" fill="#7a3f2b"/><rect x="374" y="372" width="46" height="12" fill="#f4fbff"/>' +
      '<g fill="#e6edf5" opacity=".7"><circle cx="397" cy="350" r="11"><animate attributeName="cy" values="356;270" dur="5s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="5s" repeatCount="indefinite"/></circle>' +
        '<circle cx="404" cy="340" r="15"><animate attributeName="cy" values="356;250" dur="5s" begin="2.5s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0" dur="5s" begin="2.5s" repeatCount="indefinite"/></circle></g>' +
      // log walls
      '<rect x="140" y="470" width="310" height="182" fill="#8b5a3c"/>' +
      [0, 1, 2, 3, 4, 5, 6].map(function (j) { return '<rect x="140" y="' + (474 + j * 26) + '" width="310" height="4" fill="#6e4429"/><circle cx="146" cy="' + (486 + j * 26) + '" r="8" fill="#a8744f"/><circle cx="444" cy="' + (486 + j * 26) + '" r="8" fill="#a8744f"/>'; }).join('') +
      // roof with snow and icicles
      '<path d="M108 486 L295 340 L482 486 Z" fill="#5b3a2e"/>' +
      '<path d="M100 490 L295 330 L490 490 L470 498 Q 430 486, 400 500 Q 360 484, 320 500 Q 280 484, 240 500 Q 200 486, 160 500 Q 130 488, 112 500 Z" fill="#f7fbff"/>' +
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (j) { var ix = 124 + j * 30; return '<path d="M' + ix + ' 498 L' + (ix + 5) + ' ' + (514 + (j * 7) % 13) + ' L' + (ix + 10) + ' 498 Z" fill="#dff1ff"/>'; }).join('') +
      // solar panels on the roof, brushed clear of snow
      '<g transform="translate(318 380) rotate(38)"><rect width="110" height="40" fill="#1d3557" stroke="#c9d6e3" stroke-width="2"/><path d="M27 0 L27 40 M55 0 L55 40 M82 0 L82 40 M0 20 L110 20" stroke="#7fa7d6" stroke-width="1"/>' +
        '<rect width="110" height="40" fill="#bfe6ff" opacity="0" data-k="panelGlow"/></g>' +
      // windows with warm light, door with wreath
      '<circle cx="210" cy="560" r="70" fill="url(#xwarm)"/><circle cx="380" cy="560" r="70" fill="url(#xwarm)"/>' +
      [175, 345].map(function (wx) {
        return '<rect x="' + wx + '" y="530" width="70" height="60" fill="#ffc96b"/><rect x="' + wx + '" y="530" width="70" height="60" fill="url(#xwindow)"/>' +
          '<path d="M' + (wx + 35) + ' 530 L' + (wx + 35) + ' 590 M' + wx + ' 560 L' + (wx + 70) + ' 560" stroke="#5b3a2e" stroke-width="5"/>' +
          '<rect x="' + (wx - 6) + '" y="588" width="82" height="10" fill="#f7fbff"/><rect x="' + (wx - 4) + '" y="526" width="78" height="64" fill="none" stroke="#5b3a2e" stroke-width="6"/>';
      }).join('') +
      '<rect x="262" y="560" width="66" height="92" rx="30" fill="#7a2a22"/><circle cx="318" cy="610" r="4" fill="' + GOLD + '"/>' +
      '<circle cx="295" cy="582" r="20" fill="none" stroke="#2f7d4a" stroke-width="10"/><circle cx="286" cy="574" r="3" fill="' + RED + '"/><circle cx="304" cy="576" r="3" fill="' + RED + '"/><circle cx="296" cy="592" r="3" fill="' + RED + '"/>' +
      '<path d="M288 600 L 295 594 L 302 600" stroke="' + RED + '" stroke-width="4" fill="none"/>' +
      '</g>';
    // Fairy lights along the roof edge.
    var roof = '';
    for (i = 0; i < 16; i++) {
      var t = i / 15, lx = 112 + t * 183, ly = 494 - t * 150;
      if (i > 0) roof += '';
      roof += '<circle cx="' + lx + '" cy="' + ly + '" r="5" fill="' + ['#ff4d4d', '#ffd34d', '#4dd2ff', '#6dff8a'][i % 4] + '" class="bulb on" style="animation-delay:-' + (i * 0.23).toFixed(2) + 's"/>';
      roof += '<circle cx="' + (478 - t * 183) + '" cy="' + ly + '" r="5" fill="' + ['#6dff8a', '#4dd2ff', '#ffd34d', '#ff4d4d'][i % 4] + '" class="bulb on" style="animation-delay:-' + (i * 0.31).toFixed(2) + 's"/>';
    }
    s += roof;

    // ---- fence with a robin, lantern ----
    s += '<g fill="#7a4b2a">' + [530, 590, 650, 710].map(function (x) { return '<rect x="' + x + '" y="610" width="12" height="70"/><path d="M' + x + ' 610 L' + (x + 6) + ' 600 L' + (x + 12) + ' 610 Z"/><rect x="' + (x - 2) + '" y="602" width="16" height="6" fill="#f7fbff"/>'; }).join('') +
      '<rect x="526" y="628" width="200" height="8"/><rect x="526" y="654" width="200" height="8"/></g>' +
      '<g transform="translate(716 596)"><ellipse cx="0" cy="0" rx="13" ry="10" fill="#6b4a33"/><ellipse cx="5" cy="3" rx="8" ry="7" fill="#e2552b"/><circle cx="10" cy="-6" r="7" fill="#6b4a33"/>' +
        '<circle cx="13" cy="-7" r="1.6" fill="#111"/><path d="M16 -5 L 21 -4 L 16 -2 Z" fill="#e8a92a"/><path d="M-12 -2 L -22 -8 L -20 2 Z" fill="#5a3d2a"/>' +
        '<animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 0;0 -3;0 0;0 0" keyTimes="0;0.6;0.65;0.7;1" dur="4s" repeatCount="indefinite"/></g>';

    // ---- snowman with the countdown sign ----
    s += '<g transform="translate(610 700)">' +
      '<ellipse cx="0" cy="-40" rx="52" ry="44" fill="#fff" stroke="#d7e4f2" stroke-width="3"/><circle cx="0" cy="-112" r="36" fill="#fff" stroke="#d7e4f2" stroke-width="3"/><circle cx="0" cy="-170" r="27" fill="#fff" stroke="#d7e4f2" stroke-width="3"/>' +
      '<rect x="-24" y="-202" width="48" height="8" fill="#222"/><rect x="-16" y="-232" width="32" height="32" fill="#222"/><rect x="-16" y="-210" width="32" height="6" fill="' + RED + '"/>' +
      '<circle cx="-9" cy="-176" r="3" fill="#222"/><circle cx="9" cy="-176" r="3" fill="#222"/><path d="M0 -168 L 22 -164 L 0 -162 Z" fill="#f28c28"/>' +
      [-10, -4, 3, 10].map(function (x, j) { return '<circle cx="' + x + '" cy="' + (-156 + Math.abs(x) * 0.2 + (j % 2)) + '" r="1.8" fill="#222"/>'; }).join('') +
      '<path d="M-30 -142 C -10 -132, 10 -132, 30 -142 L 30 -130 C 10 -122, -10 -122, -30 -130 Z" fill="' + RED + '"/><path d="M18 -132 L 26 -96 L 38 -100 L 28 -134 Z" fill="' + RED + '"/>' +
      '<circle cx="0" cy="-116" r="4" fill="#222"/><circle cx="0" cy="-98" r="4" fill="#222"/>' +
      '<path d="M-34 -118 L -78 -150 M-62 -138 L -70 -154" stroke="#6e4429" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M34 -118 L 80 -142" stroke="#6e4429" stroke-width="5" stroke-linecap="round"/>' +
      '<g transform="translate(64 -226) rotate(6)"><rect x="0" y="0" width="7" height="90" fill="#8a5a3a"/><rect x="-74" y="-56" width="156" height="62" rx="6" fill="#f7e7c6" stroke="#8a5a3a" stroke-width="3"/>' +
        '<text x="4" y="-26" text-anchor="middle" font-size="30" font-weight="700" fill="' + RED + '" data-k="sleeps"></text>' +
        '<text x="4" y="-6" text-anchor="middle" font-size="11" fill="#5b3a2e" data-k="sleepsLbl"></text></g>' +
      '</g>';

    // ---- the tree ----
    s += '<rect x="884" y="640" width="32" height="50" fill="#6e4429"/>' +
      tier(900, 190, 150, 120) + tier(900, 260, 230, 140) + tier(900, 350, 310, 160) + tier(900, 450, 390, 190);
    // Garland swags and baubles.
    s += '<g stroke="' + GOLD + '" stroke-width="4" fill="none" opacity=".9"><path d="M850 300 Q 900 330, 960 296"/><path d="M820 395 Q 900 440, 990 388"/><path d="M780 500 Q 900 560, 1030 492"/><path d="M745 610 Q 900 680, 1065 600"/></g>';
    var baubles = [[870, 280, RED], [935, 330, GOLD], [840, 380, '#3b82f6'], [960, 430, RED], [880, 460, '#c084fc'], [800, 520, GOLD], [1000, 540, '#3b82f6'], [900, 560, RED], [770, 610, '#c084fc'], [1040, 620, GOLD], [860, 625, '#3b82f6'], [960, 610, RED]];
    s += baubles.map(function (b) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="11" fill="' + b[2] + '"/><circle cx="' + (b[0] - 3) + '" cy="' + (b[1] - 4) + '" r="3" fill="#fff" opacity=".7"/><rect x="' + (b[0] - 3) + '" y="' + (b[1] - 14) + '" width="6" height="4" fill="#d4af37"/>'; }).join('');
    // Fairy lights: LIGHTS bulbs spiralling down; how many are lit follows the battery.
    var lights = '';
    for (i = 0; i < LIGHTS; i++) {
      t = i / (LIGHTS - 1);
      var ty = 210 + t * 440, half = 30 + t * 165, tx = 900 + Math.sin(t * 22) * half * 0.9;
      lights += '<circle cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="6" fill="' + ['#ffe066', '#ff6b6b', '#74c0fc', '#8ce99a', '#ffa94d'][i % 5] + '" class="bulb" data-k="light' + i + '" style="animation-delay:-' + (i * 0.17).toFixed(2) + 's"/>';
    }
    s += lights;
    // Star on top, brighter while the battery charges.
    s += '<g transform="translate(900 182)"><circle r="40" fill="url(#xstarglow)" data-k="topGlow"/><path d="M0 -30 L8 -10 L30 -9 L13 4 L19 26 L0 14 L-19 26 L-13 4 L-30 -9 L-8 -10 Z" fill="' + GOLD + '" stroke="#f5b700" stroke-width="2"/>' +
      '<animateTransform attributeName="transform" type="rotate" additive="sum" values="-4;4;-4" dur="6s" repeatCount="indefinite"/></g>';
    // Presents with gift tags for the readouts.
    s += gift('pv', 690, 124, 78, RED, GOLD, 'FROM THE SUN') + gift('grid', 950, 124, 72, '#2b6cb0', '#f7fbff', 'GRID') +
      gift('load', 820, 124, 62, '#2f855a', RED, 'HOUSE USES') + gift('cost', 1080, 124, 86, '#805ad5', GOLD, 'SPENT TODAY');
    // Tree-lights legend and title.
    s += '<g transform="translate(830 718)"><rect x="-140" y="0" width="280" height="56" rx="14" fill="rgba(11,26,58,.75)" stroke="' + GOLD + '" stroke-width="2"/>' +
      '<text x="0" y="23" text-anchor="middle" font-size="14" fill="#f7e7c6" letter-spacing="2">TREE LIGHTS = BATTERY</text>' +
      '<text x="0" y="46" text-anchor="middle" font-size="20" font-weight="700" fill="' + GOLD + '" data-k="battLine"></text></g>' +
      '<text x="640" y="70" text-anchor="middle" font-size="58" fill="' + CREAM + '" class="script" filter="url(#xglowf)">Season\'s Greetings</text>' +
      '<text x="640" y="108" text-anchor="middle" font-size="20" fill="#cfe0f3" letter-spacing="3" data-k="sub"></text>';
    return s;
  }

  window.Themes.xmas = {
    mount: function (root) {
      var snow = '', r = Art.rng(1225);
      for (var i = 0; i < 70; i++) {
        var size = (2 + r() * 5).toFixed(1);
        snow += '<i style="left:' + Math.round(r() * 1300 - 20) + 'px; width:' + size + 'px; height:' + size + 'px; opacity:' + (0.5 + r() * 0.5).toFixed(2) +
          '; animation-duration:' + (8 + r() * 10).toFixed(1) + 's; animation-delay:-' + (r() * 18).toFixed(1) + 's"></i>';
      }
      root.innerHTML = '<style>' + CSS + '</style><svg width="1280" height="800" viewBox="0 0 1280 800"><defs>' +
        '<linearGradient id="xsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#061230"/><stop offset=".6" stop-color="#14306a"/><stop offset="1" stop-color="#2a4d8f"/></linearGradient>' +
        '<linearGradient id="xaurora"><stop offset="0" stop-color="#3dffb5"/><stop offset=".5" stop-color="#5ad1ff"/><stop offset="1" stop-color="#b98bff"/></linearGradient>' +
        '<radialGradient id="xmoonglow"><stop offset=".5" stop-color="#fff3c4" stop-opacity=".35"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="xstarglow"><stop offset="0" stop-color="#fff6c2" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c2" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="xwarm"><stop offset="0" stop-color="#ffcf73" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf73" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="xwindow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset="1" stop-color="#ff9d3d" stop-opacity=".6"/></linearGradient>' +
        '<linearGradient id="xtreeshade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>' +
        '<filter id="xglowf" filterUnits="userSpaceOnUse" x="0" y="0" width="1280" height="160"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '</defs><rect width="1280" height="800" fill="url(#xsky)"/>' + scene() + '</svg><div class="snow">' + snow + '</div>';
      el = Art.refs(root);
    },

    update: function (m) {
      var t = function (k, v) { Art.text(el, k, v); };
      var gridNet = m.gridIn - m.gridOut;
      t('pvVal', fmt.kw(m.pv) + ' kW');
      t('gridVal', (gridNet < -0.02 ? 'out ' : 'in ') + fmt.kw(Math.abs(gridNet)) + ' kW');
      t('loadVal', fmt.kw(m.load) + ' kW');
      t('costVal', '£' + fmt.n(m.cost, 2));
      el.panelGlow.setAttribute('opacity', Art.clamp(m.pv / 6, 0, 1) * 0.5);

      var lit = Math.round(Art.clamp(m.soc / 100, 0, 1) * LIGHTS);
      for (var i = 0; i < LIGHTS; i++) {
        var b = el['light' + i], on = (LIGHTS - 1 - i) < lit; // fill from the bottom of the tree up
        var cls = on ? 'bulb on' : 'bulb';
        if (b.getAttribute('class') !== cls) { b.setAttribute('class', cls); b.style.opacity = on ? '' : 0.18; }
      }
      el.topGlow.setAttribute('opacity', m.batt > 0.02 ? 1 : 0.45);
      t('battLine', fmt.n(m.soc) + '%  ' + (m.batt > 0.02 ? '· charging +' + fmt.kw(m.batt) + ' kW' : m.batt < -0.02 ? '· lighting the house' : '· resting'));

      var year = m.now.getFullYear(), xmas = new Date(year, 11, 25);
      if (m.now > new Date(year, 11, 26)) xmas = new Date(year + 1, 11, 25);
      var sleeps = Math.ceil((new Date(xmas.getFullYear(), 11, 25) - new Date(year, m.now.getMonth(), m.now.getDate())) / 86400000);
      t('sleeps', sleeps <= 0 ? 'Today!' : String(sleeps));
      t('sleepsLbl', sleeps <= 0 ? 'MERRY CHRISTMAS' : sleeps === 1 ? 'SLEEP TO GO' : 'SLEEPS TO CHRISTMAS');
      t('sub', fmt.time(m.now) + '  ·  ' + fmt.n(m.outTemp) + '°C outside  ·  ' + fmt.n(m.selfSufficiency) + '% home-made power today');
    },
  };
})();
