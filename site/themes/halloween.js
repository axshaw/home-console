// Halloween: a moonlit graveyard. Tombstones carry the readouts, the bubbling cauldron is the
// battery, jack-o'-lanterns glow with the solar output, and bats, a ghost, an owl and a spider
// keep everyone company. Fun-spooky, not scary.
window.Themes = window.Themes || {};

(function () {
  var ORANGE = '#ff8a1f', GREEN = '#7dff5a', PURPLE = '#b06cff';
  var el = {};

  var CSS =
    '.theme-halloween { background: linear-gradient(#12051f 0%, #2a0f3f 50%, #4a1d4f 78%, #160a1c 100%); font-family: "Chiller", "Jokerman", "Georgia", serif; }' +
    '.theme-halloween svg { position:absolute; left:0; top:0; }' +
    '.theme-halloween .stone text { font-family: "Georgia", serif; }';

  function tombstone(key, x, y, w, h, tilt, title) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + tilt + ')" class="stone">' +
      '<path d="M0 0 L0 ' + (-h + w / 2) + ' A ' + (w / 2) + ' ' + (w / 2) + ' 0 0 1 ' + w + ' ' + (-h + w / 2) + ' L' + w + ' 0 Z" fill="#6f6a7c" stroke="#3a3446" stroke-width="4"/>' +
      '<path d="M8 -6 L8 ' + (-h + w / 2 + 4) + ' A ' + (w / 2 - 8) + ' ' + (w / 2 - 8) + ' 0 0 1 ' + (w - 8) + ' ' + (-h + w / 2 + 4) + ' L' + (w - 8) + ' -6 Z" fill="#7d788b"/>' +
      '<path d="M' + (w * 0.7) + ' ' + (-h + 20) + ' l -8 18 l 10 10 l -6 16" stroke="#4a4458" stroke-width="2" fill="none"/>' +
      '<text x="' + (w / 2) + '" y="' + (-h + 58) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#2c2636" letter-spacing="1">' + title + '</text>' +
      '<text x="' + (w / 2) + '" y="' + (-h + 96) + '" text-anchor="middle" font-size="30" font-weight="700" fill="#1d1824" data-k="' + key + 'Val"></text>' +
      '<text x="' + (w / 2) + '" y="' + (-h + 120) + '" text-anchor="middle" font-size="14" fill="#2c2636" data-k="' + key + 'Sub"></text>' +
      '<path d="M-10 2 Q 0 -14, 6 2 Q 12 -12, 18 2 M' + (w - 20) + ' 2 Q ' + (w - 12) + ' -14, ' + (w - 6) + ' 2 Q ' + w + ' -10, ' + (w + 8) + ' 2" stroke="#2f5a2a" stroke-width="3" fill="none"/>' +
      '</g>';
  }

  function pumpkin(x, y, s, i) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<circle r="62" fill="' + ORANGE + '" opacity=".25" data-k="pglow' + i + '"><animate attributeName="r" values="58;66;60;64;58" dur="' + (1.3 + i * 0.3) + 's" repeatCount="indefinite"/></circle>' +
      '<path d="M-4 -40 Q 0 -54, 10 -58" stroke="#3d6b2a" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="-22" cy="0" rx="22" ry="38" fill="#e8730f"/><ellipse cx="22" cy="0" rx="22" ry="38" fill="#e8730f"/><ellipse cx="0" cy="0" rx="22" ry="40" fill="#f48a1f"/>' +
      '<g fill="#ffd34d" data-k="pface' + i + '">' +
        '<path d="M-26 -12 L-12 -12 L-19 -26 Z"/><path d="M12 -12 L26 -12 L19 -26 Z"/><path d="M-5 -2 L5 -2 L0 -10 Z"/>' +
        '<path d="M-28 8 Q 0 34, 28 8 L 20 12 L 14 6 L 6 14 L 0 8 L -6 14 L -14 6 L -20 12 Z"/>' +
        '<animate attributeName="opacity" values="1;.7;1;.85;1" dur="' + (0.9 + i * 0.2) + 's" repeatCount="indefinite"/></g></g>';
  }

  function bat(i) {
    var paths = ['M-100 150 C 300 60, 700 260, 1400 120', 'M1400 90 C 1000 200, 600 40, -120 180', 'M-120 260 C 400 160, 800 300, 1420 200'];
    return '<g><g transform="scale(' + (0.7 + (i % 3) * 0.25) + ')">' +
      '<path d="M0 0 C -10 -14, -26 -12, -36 -4 C -28 -4, -24 2, -22 6 C -16 0, -8 4, 0 6 Z" fill="#0b0610"><animateTransform attributeName="transform" type="scale" values="1 1;1 -0.4;1 1" dur="0.28s" repeatCount="indefinite"/></path>' +
      '<path d="M0 0 C 10 -14, 26 -12, 36 -4 C 28 -4, 24 2, 22 6 C 16 0, 8 4, 0 6 Z" fill="#0b0610"><animateTransform attributeName="transform" type="scale" values="1 1;1 -0.4;1 1" dur="0.28s" repeatCount="indefinite"/></path>' +
      '<ellipse cx="0" cy="2" rx="6" ry="8" fill="#0b0610"/><path d="M-5 -5 L-3 -11 L-1 -6 M1 -6 L3 -11 L5 -5" fill="#0b0610"/>' +
      '<circle cx="-2" cy="0" r="1.2" fill="#ff4d4d"/><circle cx="2" cy="0" r="1.2" fill="#ff4d4d"/></g>' +
      '<animateMotion dur="' + (16 + i * 3) + 's" begin="-' + (i * 4) + 's" repeatCount="indefinite" path="' + paths[i % 3] + '"/></g>';
  }

  function scene() {
    var r = Art.rng(1031), stars = '';
    for (var i = 0; i < 70; i++) stars += '<circle cx="' + Math.round(r() * 1280) + '" cy="' + Math.round(r() * 420) + '" r="' + (0.6 + r() * 1.3).toFixed(1) + '" fill="#fff" opacity="' + (0.3 + r() * 0.6).toFixed(2) + '"/>';
    var web = '';
    for (var a = 0; a < 8; a++) { var ang = Math.PI / 2 * a / 7; web += '<line x1="0" y1="0" x2="' + Math.cos(ang) * 170 + '" y2="' + Math.sin(ang) * 170 + '"/>'; }
    for (var ring = 1; ring <= 5; ring++) {
      var d = '';
      for (a = 0; a < 8; a++) { ang = Math.PI / 2 * a / 7; d += (a ? ' Q ' : 'M') + (a ? (Math.cos(ang - 0.11) * ring * 28) + ' ' + (Math.sin(ang - 0.11) * ring * 28) + ' ' : '') + (Math.cos(ang) * ring * 32) + ' ' + (Math.sin(ang) * ring * 32); }
      web += '<path d="' + d + '"/>';
    }
    return '<rect width="1280" height="800" fill="url(#hwsky)"/>' + stars +
      // the moon
      '<circle cx="1040" cy="170" r="150" fill="url(#hwmoonglow)"/>' +
      '<circle cx="1040" cy="170" r="96" fill="#fff1c1"/><circle cx="1010" cy="140" r="16" fill="#efdca4"/><circle cx="1070" cy="200" r="22" fill="#efdca4"/><circle cx="1068" cy="130" r="9" fill="#efdca4"/>' +
      // a witch crossing the moon now and then
      '<g><path d="M-30 0 L40 -4 M-20 -4 L-36 6 M-20 -2 L-38 -2" stroke="#0b0610" stroke-width="3"/><path d="M0 -6 C 4 -20, 14 -26, 10 -30 L 20 -40 L 18 -26 C 22 -18, 18 -8, 12 -4 Z" fill="#0b0610"/>' +
        '<path d="M6 -30 L 22 -54 L 26 -30 Z" fill="#0b0610"/><path d="M0 -30 L 34 -30" stroke="#0b0610" stroke-width="4"/>' +
        '<animateMotion dur="45s" repeatCount="indefinite" path="M-200 260 C 400 120, 900 80, 1500 140"/></g>' +
      // haunted house on the hill
      '<path d="M0 560 C 160 480, 360 470, 520 540 L 520 800 L 0 800 Z" fill="#1f0f2b"/>' +
      '<g fill="#140a1d"><rect x="120" y="330" width="220" height="200"/><path d="M100 340 L230 240 L360 340 Z"/><rect x="290" y="250" width="56" height="150"/><path d="M280 256 L318 180 L356 256 Z"/>' +
        '<rect x="150" y="290" width="16" height="50"/></g>' +
      '<g fill="#ffb347" data-k="windows">' +
        '<rect x="150" y="370" width="34" height="40"/><rect x="214" y="370" width="34" height="40"/><rect x="276" y="430" width="34" height="40"/><rect x="306" y="290" width="22" height="30"/><path d="M210 300 a 20 20 0 0 1 40 0 Z"/>' +
        '<animate attributeName="opacity" values="1;.55;1;.8;1" dur="3s" repeatCount="indefinite"/></g>' +
      '<g stroke="#140a1d" stroke-width="3"><path d="M167 370 L167 410 M150 390 L184 390 M231 370 L231 410 M214 390 L248 390"/></g>' +
      // spooky bare tree with an owl
      '<path d="M1180 800 C 1170 640, 1190 560, 1160 470 C 1130 420, 1080 400, 1040 410 M1165 520 C 1210 470, 1250 470, 1280 440 M1162 480 C 1130 380, 1150 330, 1120 280 M1150 600 C 1100 560, 1060 570, 1010 540" stroke="#0f0717" stroke-width="22" fill="none" stroke-linecap="round"/>' +
      '<path d="M1040 410 L 1000 390 M1120 280 L 1100 240 M1010 540 L 980 520 M1280 440 L 1300 420" stroke="#0f0717" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<g transform="translate(1084 452)"><ellipse rx="24" ry="30" fill="#2e1f3a"/><path d="M-18 -22 L-22 -38 L-8 -26 Z M18 -22 L22 -38 L8 -26 Z" fill="#2e1f3a"/>' +
        '<circle cx="-9" cy="-10" r="9" fill="#ffd34d"/><circle cx="9" cy="-10" r="9" fill="#ffd34d"/>' + '<circle cx="-9" cy="-10" r="4" fill="#111"/><circle cx="9" cy="-10" r="4" fill="#111"/>' +
        '<rect x="-20" y="-20" width="40" height="0" fill="#2e1f3a"><animate attributeName="height" values="0;0;20;0" keyTimes="0;0.9;0.95;1" dur="5s" repeatCount="indefinite"/></rect>' +
        '<path d="M-3 -2 L3 -2 L0 4 Z" fill="#ff9b3d"/></g>' +
      // spider web in the corner, with a spider on a thread
      '<g stroke="rgba(230,230,255,.45)" stroke-width="1.5" fill="none">' + web + '</g>' +
      '<g><line x1="120" y1="0" x2="120" y2="150" stroke="rgba(230,230,255,.6)" stroke-width="1.5"><animate attributeName="y2" values="110;160;110" dur="6s" repeatCount="indefinite"/></line>' +
        '<g><ellipse cx="120" cy="0" rx="11" ry="13" fill="#0b0610"/><circle cx="120" cy="-14" r="7" fill="#0b0610"/>' +
          '<path d="M110 -4 l -14 -8 M110 2 l -16 0 M110 8 l -14 8 M130 -4 l 14 -8 M130 2 l 16 0 M130 8 l 14 8" stroke="#0b0610" stroke-width="2.5"/>' +
          '<circle cx="117" cy="-15" r="1.6" fill="#fff"/><circle cx="123" cy="-15" r="1.6" fill="#fff"/>' +
          '<animateTransform attributeName="transform" type="translate" values="0 124;0 174;0 124" dur="6s" repeatCount="indefinite"/></g></g>' +
      // graveyard ground and fence
      '<path d="M0 640 C 300 610, 700 650, 1280 620 L1280 800 L0 800 Z" fill="#160b1f"/>' +
      '<g stroke="#0d0614" stroke-width="7">' + [600, 650, 700, 750, 800, 850, 900].map(function (x) { return '<path d="M' + x + ' 650 L' + x + ' 590 L' + (x + 6) + ' 578 L' + (x + 12) + ' 590"/>'; }).join('') + '<path d="M590 610 L920 610 M590 636 L920 636"/></g>' +
      // the ghost, drifting about and holding a sign
      '<g><g><path d="M0 -60 C 34 -60, 44 -30, 44 0 L 44 50 L 32 40 L 22 52 L 11 40 L 0 52 L -11 40 L -22 52 L -32 40 L -44 50 L -44 0 C -44 -30, -34 -60, 0 -60 Z" fill="#f4f1ff" opacity=".93"/>' +
          '<ellipse cx="-14" cy="-20" rx="6" ry="9" fill="#2a1b3a"/><ellipse cx="14" cy="-20" rx="6" ry="9" fill="#2a1b3a"/><ellipse cx="0" cy="4" rx="9" ry="11" fill="#2a1b3a"/>' +
          '<g transform="translate(48 -10) rotate(8)"><rect x="0" y="-26" width="200" height="58" rx="8" fill="#f8efd4" stroke="#5b3b1a" stroke-width="3"/>' +
            '<text x="100" y="-4" text-anchor="middle" font-size="18" font-weight="700" fill="#5b3b1a" font-family="Georgia, serif">BOO! I\'M</text>' +
            '<text x="100" y="21" text-anchor="middle" font-size="17" font-weight="700" fill="#8a2be2" font-family="Georgia, serif" data-k="ghostSign"></text></g>' +
          '<animateTransform attributeName="transform" type="translate" values="0 0;0 -18;0 0" dur="3.4s" repeatCount="indefinite"/></g>' +
        '<animateTransform attributeName="transform" type="translate" values="560 300;700 260;600 330;560 300" dur="20s" repeatCount="indefinite"/></g>' +
      // the cauldron (battery)
      '<g transform="translate(640 690)">' +
        '<g data-k="fire"><path d="M-60 40 C -50 0, -30 10, -24 -10 C -14 10, 0 -14, 4 -24 C 12 0, 28 -6, 30 -16 C 40 6, 56 10, 60 40 Z" fill="#ff6a00"><animate attributeName="opacity" values="1;.75;1" dur=".4s" repeatCount="indefinite"/></path>' +
          '<path d="M-36 40 C -30 14, -14 18, -10 4 C -2 18, 10 6, 14 -2 C 20 16, 32 18, 36 40 Z" fill="#ffd34d"/></g>' +
        '<path d="M-60 40 L 60 40" stroke="#3b2414" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M-110 -100 C -130 -10, -80 34, 0 34 C 80 34, 130 -10, 110 -100 Z" fill="#1c1622" stroke="#0a070d" stroke-width="5"/>' +
        '<clipPath id="hwpot"><path d="M-104 -96 C -122 -12, -76 28, 0 28 C 76 28, 122 -12, 104 -96 Z"/></clipPath>' +
        '<g clip-path="url(#hwpot)"><rect x="-130" y="30" width="260" height="0" fill="url(#hwpotion)" data-k="potion" style="transition: all 1.2s"/>' +
          '<g data-k="bubbles" fill="#b8ff9a">' + [-60, -20, 25, 64].map(function (bx, j) {
            return '<circle cx="' + bx + '" cy="20" r="' + (6 + j % 2 * 3) + '"><animate attributeName="cy" values="24;-70" dur="' + (2 + j * 0.4) + 's" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="' + (2 + j * 0.4) + 's" repeatCount="indefinite"/></circle>';
          }).join('') + '</g></g>' +
        '<ellipse cx="0" cy="-100" rx="114" ry="18" fill="#2a2231" stroke="#0a070d" stroke-width="6"/>' +
        '<ellipse cx="0" cy="-100" rx="100" ry="12" fill="' + GREEN + '" opacity=".85" data-k="surface"/>' +
        '<text x="0" y="-40" text-anchor="middle" font-size="44" font-weight="700" fill="#fff" stroke="#123d10" stroke-width="5" paint-order="stroke" font-family="Georgia, serif" data-k="soc"></text>' +
        '<text x="0" y="-16" text-anchor="middle" font-size="15" fill="#d6ffc9" font-family="Georgia, serif" letter-spacing="2" data-k="battSub"></text>' +
        '<g fill="' + GREEN + '" opacity=".5">' + [0, 1, 2].map(function (j) {
          return '<circle cx="' + (-40 + j * 40) + '" cy="-120" r="10"><animate attributeName="cy" values="-110;-200" dur="' + (3 + j) + 's" repeatCount="indefinite"/><animate attributeName="opacity" values=".5;0" dur="' + (3 + j) + 's" repeatCount="indefinite"/></circle>';
        }).join('') + '</g>' +
      '</g>' +
      // tombstones with the readouts
      tombstone('pv', 40, 760, 170, 200, -4, 'HERE LIES THE SUN') +
      tombstone('grid', 240, 772, 160, 180, 3, 'R.I.P. GRID') +
      tombstone('load', 850, 772, 160, 180, -3, 'HOUSE HAUNTING') +
      tombstone('cost', 1060, 762, 170, 200, 4, 'MONEY SPENT') +
      // jack-o'-lanterns, glowing with the solar output
      pumpkin(470, 740, 0.8, 0) + pumpkin(800, 752, 0.62, 1) + pumpkin(1250, 760, 0.55, 2) +
      // drifting fog
      '<g fill="#d8c7ff" opacity=".10"><ellipse cx="200" cy="760" rx="380" ry="50"><animateTransform attributeName="transform" type="translate" values="-80 0;120 0;-80 0" dur="30s" repeatCount="indefinite"/></ellipse>' +
        '<ellipse cx="900" cy="780" rx="420" ry="46"><animateTransform attributeName="transform" type="translate" values="80 0;-140 0;80 0" dur="36s" repeatCount="indefinite"/></ellipse></g>' +
      bat(0) + bat(1) + bat(2) + bat(3) + bat(4) +
      // title
      '<text x="640" y="70" text-anchor="middle" font-size="64" fill="' + ORANGE + '" style="font-family: Chiller, Jokerman, Georgia, serif" filter="url(#hwglow)" letter-spacing="4">SPOOKY POWER</text>' +
      '<text x="640" y="110" text-anchor="middle" font-size="22" fill="' + PURPLE + '" font-family="Georgia, serif" letter-spacing="3" data-k="sub"></text>';
  }

  window.Themes.halloween = {
    mount: function (root) {
      root.innerHTML = '<style>' + CSS + '</style><svg width="1280" height="800" viewBox="0 0 1280 800"><defs>' +
        '<linearGradient id="hwsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12051f"/><stop offset=".6" stop-color="#3a1550"/><stop offset="1" stop-color="#5a2050"/></linearGradient>' +
        '<radialGradient id="hwmoonglow"><stop offset=".55" stop-color="#ffe9a8" stop-opacity=".45"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="hwpotion" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9dff6a"/><stop offset="1" stop-color="#2e9e2a"/></linearGradient>' +
        '<filter id="hwglow" filterUnits="userSpaceOnUse" x="0" y="0" width="1280" height="200"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '</defs>' + scene() + '</svg>';
      el = Art.refs(root);
    },

    update: function (m) {
      var t = function (k, v) { Art.text(el, k, v); };
      var gridNet = m.gridIn - m.gridOut;
      t('pvVal', fmt.kw(m.pv) + ' kW'); t('pvSub', fmt.n(m.dailyPv, 1) + ' kWh harvested');
      t('gridVal', fmt.kw(Math.abs(gridNet)) + ' kW'); t('gridSub', gridNet > 0.02 ? 'draining our souls' : gridNet < -0.02 ? 'we feed the grid' : 'resting in peace');
      t('loadVal', fmt.kw(m.load) + ' kW'); t('loadSub', fmt.n(m.dailyLoad, 1) + ' kWh devoured');
      t('costVal', '£' + fmt.n(m.cost, 2)); t('costSub', 'gone, never to return');

      // Potion level is the battery charge; bubbles boil harder while charging.
      var frac = Art.clamp(m.soc / 100, 0, 1), top = 28 - frac * 124;
      el.potion.setAttribute('y', top); el.potion.setAttribute('height', 30 - top);
      el.surface.setAttribute('cy', Math.max(-100, top));
      el.surface.setAttribute('rx', 60 + frac * 40);
      el.bubbles.style.opacity = m.batt > 0.02 ? 1 : 0.35;
      t('soc', fmt.n(m.soc) + '%');
      t('battSub', m.batt > 0.02 ? 'BREWING +' + fmt.kw(m.batt) + ' kW' : m.batt < -0.02 ? 'SIPPING ' + fmt.kw(-m.batt) + ' kW' : 'SIMMERING');

      // Jack-o'-lanterns glow brighter the more the sun gives.
      var glow = 0.15 + Art.clamp(m.pv / 6, 0, 1) * 0.55;
      for (var i = 0; i < 3; i++) el['pglow' + i].setAttribute('opacity', glow);

      t('ghostSign', fmt.n(m.selfSufficiency) + '% SELF-POWERED');
      var oct31 = new Date(m.now.getFullYear(), 9, 31), days = Math.ceil((oct31 - m.now) / 86400000);
      t('sub', fmt.time(m.now) + '  ·  ' + (days === 0 ? 'HAPPY HALLOWEEN!' : days > 0 ? days + (days === 1 ? ' NIGHT' : ' NIGHTS') + ' UNTIL HALLOWEEN' : 'THE SPIRITS LINGER') + '  ·  ' + fmt.n(m.outTemp) + '°C OUTSIDE');
    },
  };
})();
