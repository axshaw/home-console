// Home Assistant data source.
//
// Connects to HA's WebSocket API and uses subscribe_entities, which sends every state once ("a")
// and then compact diffs ("c"). Readings are mapped from entity IDs given in HC_CONFIG.entities.
//
// When the page is served by the nginx stack, url is '' and the socket goes to the page's own
// origin, which proxies /api/websocket to HA. That avoids Chrome's Local Network Access block on
// http:// pages opening sockets to other LAN hosts.
(function (HC) {
  'use strict';

  // Entity IDs created by the Sigenergy Home Assistant integration. Override any of them (or add
  // indoor/weather entities) in HC_CONFIG.entities. A null entry means "not available".
  var SIGEN_ENTITIES = {
    pv: 'sensor.sigen_plant_pv_power',
    load: 'sensor.sigen_plant_total_load_power',
    gridIn: 'sensor.sigen_plant_grid_import_power',
    gridOut: 'sensor.sigen_plant_grid_export_power',
    battPower: 'sensor.sigen_plant_battery_power',
    battCharging: 'binary_sensor.sigen_plant_battery_charging',
    battDischarging: 'binary_sensor.sigen_plant_battery_discharging',
    soc: 'sensor.sigen_plant_battery_state_of_charge',
    soh: 'sensor.sigen_plant_battery_state_of_health',
    capacity: 'sensor.sigen_plant_rated_energy_capacity',
    cellTemp: 'sensor.sigen_inverter_battery_average_cell_temperature',
    pvStrings: ['sensor.sigen_inverter_pv1_power', 'sensor.sigen_inverter_pv2_power', 'sensor.sigen_inverter_pv3_power', 'sensor.sigen_inverter_pv4_power'],
    dailyPv: 'sensor.sigen_plant_daily_pv_energy',
    dailyLoad: 'sensor.sigen_plant_daily_load_consumption',
    dailyImport: 'sensor.sigen_plant_daily_grid_import_energy',
    dailyExport: 'sensor.sigen_plant_daily_grid_export_energy',
    cost: 'sensor.sigen_plant_daily_grid_import_energy_cost',
    state: 'sensor.sigen_plant_plant_running_state',
    gridStatus: 'sensor.sigen_plant_grid_connection_status',
    weather: 'weather.forecast_home',
    sunrise: 'sensor.sun_next_rising',
    sunset: 'sensor.sun_next_setting',
    inTemp: null,
    iaqClass: null,
  };

  // Local hour-of-day (7.75) from an ISO timestamp. "Next rising" may be tomorrow's, but the time
  // of day barely changes, which is all the themes need.
  function hourOf(iso) {
    var d = iso ? new Date(iso) : null;
    return d && !isNaN(d.getTime()) ? d.getHours() + d.getMinutes() / 60 : undefined;
  }

  // Pure: HA states { entity_id: { state, attributes } } + entity map -> readings for HC.model.
  function toReadings(states, entities) {
    var e = entities;
    var state = function (id) { return id && states[id] ? states[id].state : undefined; };
    var attr = function (id, key) { return id && states[id] ? states[id].attributes[key] : undefined; };
    var num = function (id) { var v = parseFloat(state(id)); return isFinite(v) ? v : undefined; };

    // Sigen reports battery power unsigned; the charging/discharging sensors give the direction.
    var battAbs = Math.abs(num(e.battPower) || 0);
    var batt = state(e.battCharging) === 'on' ? battAbs : state(e.battDischarging) === 'on' ? -battAbs : 0;
    if (!e.battCharging && !e.battDischarging) batt = num(e.battPower) || 0; // signed sensor (+charge)

    return {
      pv: num(e.pv), load: num(e.load), gridIn: num(e.gridIn), gridOut: num(e.gridOut), batt: batt,
      soc: num(e.soc), soh: num(e.soh), capacity: num(e.capacity), cellTemp: num(e.cellTemp),
      strings: (e.pvStrings || []).map(num),
      dailyPv: num(e.dailyPv), dailyLoad: num(e.dailyLoad), dailyImport: num(e.dailyImport),
      dailyExport: num(e.dailyExport), cost: num(e.cost),
      state: state(e.state), gridStatus: state(e.gridStatus),
      outTemp: attr(e.weather, 'temperature'), outCond: (state(e.weather) || '').replace(/-/g, ' '),
      inTemp: num(e.inTemp), iaqClass: state(e.iaqClass),
      sunrise: hourOf(state(e.sunrise)), sunset: hourOf(state(e.sunset)),
    };
  }

  // Pure (mutates `states`): apply one subscribe_entities event.
  function applyEvent(states, ev) {
    Object.keys(ev.a || {}).forEach(function (id) {
      states[id] = { state: ev.a[id].s, attributes: ev.a[id].a || {} };
    });
    Object.keys(ev.c || {}).forEach(function (id) {
      var d = ev.c[id], cur = states[id] || (states[id] = { state: undefined, attributes: {} });
      if (d['+']) {
        if ('s' in d['+']) cur.state = d['+'].s;
        if (d['+'].a) Object.keys(d['+'].a).forEach(function (k) { cur.attributes[k] = d['+'].a[k]; });
      }
      if (d['-'] && d['-'].a) d['-'].a.forEach(function (k) { delete cur.attributes[k]; });
    });
    (ev.r || []).forEach(function (id) { delete states[id]; });
    return states;
  }

  // The token, in priority order: config (local dev), served token.js, #token= (stored for next
  // time), previously stored. Returns { token, consumedHash } so the caller can tidy the URL.
  function resolveToken(configToken, servedToken, hash, storage) {
    var fromHash = ((hash || '').match(/[#&]token=([^&]+)/) || [])[1];
    try { if (fromHash) storage.setItem('haToken', decodeURIComponent(fromHash)); } catch (e) {}
    var stored = null;
    try { stored = storage.getItem('haToken'); } catch (e) {}
    return { token: configToken || servedToken || (fromHash && decodeURIComponent(fromHash)) || stored || '', consumedHash: !!fromHash };
  }

  function socketUrl(base, loc) {
    var b = base || loc.protocol + '//' + loc.host;
    return b.replace(/^http/, 'ws') + '/api/websocket';
  }

  function create(cfg) {
    var states = {}, status = 'connecting', retryMs = 2000, onChange = function () {};
    var entities = HC.config.merge(SIGEN_ENTITIES, cfg.entities || {});

    function connect() {
      var ws = new WebSocket(socketUrl(cfg.url, location));
      ws.onmessage = function (e) {
        var msg = JSON.parse(e.data);
        if (msg.type === 'auth_required') {
          ws.send(JSON.stringify({ type: 'auth', access_token: cfg.token }));
        } else if (msg.type === 'auth_ok') {
          status = 'ok';
          retryMs = 2000;
          ws.send(JSON.stringify({ id: 1, type: 'subscribe_entities' }));
        } else if (msg.type === 'auth_invalid') {
          status = 'bad token';
          onChange();
        } else if (msg.type === 'event' && msg.event) {
          applyEvent(states, msg.event);
          onChange();
        }
      };
      ws.onclose = function () {
        if (status === 'bad token') return;
        status = 'reconnecting';
        onChange();
        setTimeout(connect, retryMs);
        retryMs = Math.min(retryMs * 2, 60000);
      };
    }

    return {
      start: function (cb) { onChange = cb; connect(); },
      read: function () { return toReadings(states, entities); },
      status: function () { return status; },
    };
  }

  HC.sources = HC.sources || {};
  HC.sources.homeassistant = {
    create: create, toReadings: toReadings, applyEvent: applyEvent,
    resolveToken: resolveToken, socketUrl: socketUrl, hourOf: hourOf, SIGEN_ENTITIES: SIGEN_ENTITIES,
  };
})(window.HC = window.HC || {});
