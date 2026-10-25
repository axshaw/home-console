// Formatting, configuration and the energy model.

test('format.kw: two decimals, no negative zero, missing values show --', function () {
  var f = HC.format;
  assert.equal(f.kw(3.456), '3.46');
  assert.equal(f.kw(-0.001), '0.00');
  assert.equal(f.kw(undefined), '--');
  assert.equal(f.kw(NaN), '--');
});

test('format.n / pad / time / hourMinutes', function () {
  var f = HC.format;
  assert.equal(f.n(21.26, 1), '21.3');
  assert.equal(f.n(undefined), '--');
  assert.equal(f.pad(7, 3, '0'), '007');
  assert.equal(f.time(new Date(2026, 0, 1, 9, 5)), '09:05');
  assert.equal(f.hourMinutes(7.75), '7:45');
  assert.equal(f.hourMinutes(16.999), '17:00');
});

test('format.flowSpeed: idle is null, more power is faster, never below 0.4s', function () {
  var f = HC.format;
  assert.equal(f.flowSpeed(0), null);
  assert.equal(f.flowSpeed(0.01), null);
  assert.ok(f.flowSpeed(5) < f.flowSpeed(1));
  assert.ok(f.flowSpeed(100) >= 0.4);
  assert.equal(f.flowSpeed(-2), f.flowSpeed(2), 'direction does not change speed');
});

test('config.merge: objects merge deeply, arrays and scalars replace', function () {
  var out = HC.config.merge({ a: 1, scale: { pv: 10, load: 6 }, themes: ['x', 'y'] }, { scale: { pv: 6 }, themes: ['z'] });
  assert.deepEqual(out, { a: 1, scale: { pv: 6, load: 6 }, themes: ['z'] });
});

test('config.resolve: local overrides and URL parameters', function () {
  var cfg = HC.config.resolve({
    HC_CONFIG: { source: 'homeassistant', theme: undefined, scale: { pv: 10 } },
    HC_CONFIG_LOCAL: { scale: { pv: 4 } },
    location: { search: '?demo=1&theme=crt' },
  });
  assert.equal(cfg.source, 'demo');
  assert.equal(cfg.theme, 'crt');
  assert.equal(cfg.scale.pv, 4);
});

test('model.build: fills every field from empty readings', function () {
  var m = HC.model.build({});
  ['pv', 'load', 'gridIn', 'gridOut', 'batt', 'soc', 'dailyPv', 'cost', 'gridNet', 'selfSufficiency'].forEach(function (k) {
    assert.equal(typeof m[k], 'number', k);
  });
  assert.equal(m.strings.length, 4);
  assert.equal(m.outTemp, undefined, 'optional environment stays undefined');
  assert.equal(m.state, 'Unknown');
  assert.equal(m.link, 'connecting');
  assert.deepEqual(m.max, HC.model.DEFAULT_MAX);
});

test('model.build: derived values', function () {
  var m = HC.model.build({ gridIn: 0.2, gridOut: 1.5, dailyLoad: 10, dailyImport: 2.5, soc: 140, pv: '3.2' });
  assert.near(m.gridNet, -1.3, 1e-9, 'negative while exporting');
  assert.near(m.selfSufficiency, 75, 1e-9);
  assert.equal(m.soc, 100, 'soc is clamped');
  assert.equal(m.pv, 3.2, 'numeric strings are parsed');
  assert.equal(m.home, 'solar');
});

test('model.build: self-sufficiency is bounded and safe with no load', function () {
  assert.equal(HC.model.build({ dailyLoad: 0, dailyImport: 5 }).selfSufficiency, 0);
  assert.equal(HC.model.build({ dailyLoad: 2, dailyImport: 5 }).selfSufficiency, 0);
});

test('model.build: scale overrides, ignoring bad values', function () {
  var m = HC.model.build({}, { max: { pv: 6, grid: -1, load: 'x' } });
  assert.equal(m.max.pv, 6);
  assert.equal(m.max.grid, HC.model.DEFAULT_MAX.grid);
  assert.equal(m.max.load, HC.model.DEFAULT_MAX.load);
});

test('model.isLive', function () {
  assert.ok(HC.model.isLive({ link: 'ok' }));
  assert.ok(HC.model.isLive({ link: 'demo' }));
  assert.ok(!HC.model.isLive({ link: 'bad token' }));
});

test('themes.register: validates the contract', function () {
  assert.throws(function () { HC.themes.register('Bad Name', { mount: function () {}, update: function () {} }); });
  assert.throws(function () { HC.themes.register('nope', { mount: function () {} }); });
});

test('themes.names: configured order filters unknown names', function () {
  assert.deepEqual(HC.themes.names(['astrolabe', 'missing', 'hud']), ['astrolabe', 'hud']);
  assert.ok(HC.themes.names().length >= 8);
});
