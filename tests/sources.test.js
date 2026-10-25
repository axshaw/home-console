// Data sources: Home Assistant mapping and diff handling, token resolution, demo data.

var HA = HC.sources.homeassistant;

function haStates(map) {
  var s = {};
  Object.keys(map).forEach(function (id) {
    var v = map[id];
    s[id] = v && typeof v === 'object' ? v : { state: String(v), attributes: {} };
  });
  return s;
}

test('homeassistant.toReadings: maps the Sigen entities', function () {
  var e = HA.SIGEN_ENTITIES;
  var states = {};
  states[e.pv] = '3.31'; states[e.load] = '1.30'; states[e.gridIn] = '0.005'; states[e.gridOut] = '0';
  states[e.battPower] = '2.05'; states[e.battCharging] = 'on'; states[e.battDischarging] = 'off';
  states[e.soc] = '7.5'; states[e.state] = 'Running';
  states[e.weather] = { state: 'partly-cloudy', attributes: { temperature: 12 } };
  var r = HA.toReadings(haStates(states), e);
  assert.equal(r.pv, 3.31);
  assert.equal(r.batt, 2.05, 'charging is positive');
  assert.equal(r.soc, 7.5);
  assert.equal(r.outTemp, 12);
  assert.equal(r.outCond, 'partly cloudy');
  assert.equal(r.state, 'Running');
  assert.equal(r.inTemp, undefined, 'optional indoor sensor not configured');
});

test('homeassistant.toReadings: discharging is negative; unknown states are undefined', function () {
  var e = HA.SIGEN_ENTITIES, states = {};
  states[e.battPower] = '1.5'; states[e.battCharging] = 'off'; states[e.battDischarging] = 'on';
  states[e.pv] = 'unavailable';
  var r = HA.toReadings(haStates(states), e);
  assert.equal(r.batt, -1.5);
  assert.equal(r.pv, undefined);
});

test('homeassistant.toReadings: a signed battery sensor works without direction sensors', function () {
  var e = HC.config.merge(HA.SIGEN_ENTITIES, { battCharging: null, battDischarging: null });
  var states = {}; states[e.battPower] = '-0.8';
  assert.equal(HA.toReadings(haStates(states), e).batt, -0.8);
});

test('homeassistant.applyEvent: add, change, attribute removal, remove', function () {
  var s = {};
  HA.applyEvent(s, { a: { 'sensor.x': { s: '1', a: { unit: 'kW', icon: 'mdi:sun' } } } });
  assert.equal(s['sensor.x'].state, '1');
  HA.applyEvent(s, { c: { 'sensor.x': { '+': { s: '2', a: { unit: 'W' } }, '-': { a: ['icon'] } } } });
  assert.equal(s['sensor.x'].state, '2');
  assert.deepEqual(s['sensor.x'].attributes, { unit: 'W' });
  HA.applyEvent(s, { c: { 'sensor.new': { '+': { s: 'on' } } } });
  assert.equal(s['sensor.new'].state, 'on');
  HA.applyEvent(s, { r: ['sensor.x'] });
  assert.equal(s['sensor.x'], undefined);
});

test('homeassistant.resolveToken: priority and #token= storage', function () {
  var store = {}, storage = { getItem: function (k) { return store[k] || null; }, setItem: function (k, v) { store[k] = v; } };
  var r = HA.resolveToken('', '', '#token=abc%2E123', storage);
  assert.equal(r.token, 'abc.123');
  assert.ok(r.consumedHash);
  assert.equal(HA.resolveToken('', '', '', storage).token, 'abc.123', 'remembered for next time');
  assert.equal(HA.resolveToken('', 'served', '', storage).token, 'served', 'token.js beats storage');
  assert.equal(HA.resolveToken('cfg', 'served', '', storage).token, 'cfg', 'config wins');
});

test('homeassistant.socketUrl: same origin by default', function () {
  assert.equal(HA.socketUrl('', { protocol: 'http:', host: '10.0.0.5:8088' }), 'ws://10.0.0.5:8088/api/websocket');
  assert.equal(HA.socketUrl('https://ha.example', {}), 'wss://ha.example/api/websocket');
});

test('homeassistant.hourOf', function () {
  var d = new Date(2026, 9, 25, 7, 45);
  assert.near(HA.hourOf(d.toISOString()), 7.75, 1e-9);
  assert.equal(HA.hourOf('unknown'), undefined);
});

test('demo.readingsAt: balanced flows and sane ranges', function () {
  for (var t = 0; t < 120000; t += 7000) {
    var r = HC.sources.demo.readingsAt(t);
    assert.near(r.pv - r.load - r.batt + r.gridIn - r.gridOut, 0, 1e-9, 'energy balance');
    assert.ok(r.soc > 0 && r.soc < 100);
  }
});
