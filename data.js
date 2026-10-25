// Turns raw Home Assistant states into one energy model that every theme renders.
// Powers are in kW. batt > 0 means charging, batt < 0 means discharging.
// Kept to ES2017 (no ?. or ??) so it runs on old Fire tablet WebViews.

window.Model = (function () {
  function n(id) {
    var v = HA.num(id);
    return v === undefined ? 0 : v;
  }

  function live() {
    var battAbs = Math.abs(n('sensor.sigen_plant_battery_power'));
    var charging = HA.state('binary_sensor.sigen_plant_battery_charging') === 'on';
    var discharging = HA.state('binary_sensor.sigen_plant_battery_discharging') === 'on';
    var w = 'weather.forecast_home';
    return {
      pv: n('sensor.sigen_plant_pv_power'),
      load: n('sensor.sigen_plant_total_load_power'),
      gridIn: n('sensor.sigen_plant_grid_import_power'),
      gridOut: n('sensor.sigen_plant_grid_export_power'),
      batt: charging ? battAbs : discharging ? -battAbs : 0,
      soc: n('sensor.sigen_plant_battery_state_of_charge'),
      soh: n('sensor.sigen_plant_battery_state_of_health'),
      capacity: n('sensor.sigen_plant_rated_energy_capacity'),
      cellTemp: n('sensor.sigen_inverter_battery_average_cell_temperature'),
      strings: [1, 2, 3, 4].map(function (i) { return n('sensor.sigen_inverter_pv' + i + '_power'); }),
      dailyPv: n('sensor.sigen_plant_daily_pv_energy'),
      dailyLoad: n('sensor.sigen_plant_daily_load_consumption'),
      dailyImport: n('sensor.sigen_plant_daily_grid_import_energy'),
      dailyExport: n('sensor.sigen_plant_daily_grid_export_energy'),
      cost: n('sensor.sigen_plant_daily_grid_import_energy_cost'),
      totalPv: n('sensor.sigen_plant_total_pv_generation'),
      state: HA.state('sensor.sigen_plant_plant_running_state') || 'Unknown',
      gridStatus: HA.state('sensor.sigen_plant_grid_connection_status') || 'Unknown',
      outTemp: HA.attr(w, 'temperature'),
      outCond: (HA.state(w) || '').replace(/-/g, ' '),
      inTemp: HA.num('sensor.airsense_qual_temperature'),
      iaqClass: HA.state('sensor.airsense_qual_iaq_classification') || '',
      link: HA.status(),
    };
  }

  // A sunny afternoon, gently wobbling, so every flow animates in previews.
  function demo() {
    var t = Date.now() / 1000;
    var pv = 6.2 + Math.sin(t / 7) * 0.8;
    var load = 1.6 + Math.sin(t / 3) * 0.4;
    var batt = 3.1 + Math.sin(t / 11) * 0.5;
    var spare = pv - load - batt;
    return {
      pv: pv, load: load, batt: batt,
      gridIn: spare < 0 ? -spare : 0, gridOut: spare > 0 ? spare : 0,
      soc: 64 + Math.sin(t / 20) * 2, soh: 100, capacity: 27.12, cellTemp: 21.4,
      strings: [1.7, 1.6, 1.5, 1.4].map(function (s, i) { return s + Math.sin(t / (5 + i)) * 0.2; }),
      dailyPv: 18.4, dailyLoad: 14.2, dailyImport: 1.3, dailyExport: 4.9, cost: 0.31, totalPv: 10.27,
      state: 'Running', gridStatus: 'On Grid', outTemp: 19, outCond: 'sunny', inTemp: 21.2,
      iaqClass: 'Good', link: 'demo',
    };
  }

  function get() {
    var m = /[?&]demo=1/.test(location.search) ? demo() : live();
    m.home = m.pv > 0.01 || m.batt < 0 ? 'solar' : 'grid';
    m.selfSufficiency = m.dailyLoad > 0 ? Math.max(0, Math.min(100, (1 - m.dailyImport / m.dailyLoad) * 100)) : 0;
    m.now = new Date();
    return m;
  }

  return { get: get };
})();

// Shared formatting helpers for themes.
window.fmt = {
  kw: function (v) { return (Math.abs(v) < 0.005 ? 0 : v).toFixed(2); },
  n: function (v, d) { return v === undefined || v === null || isNaN(v) ? '--' : Number(v).toFixed(d || 0); },
  pad: function (s, len, ch) { s = String(s); while (s.length < len) s = (ch || ' ') + s; return s; },
  time: function (d) { return fmt.pad(d.getHours(), 2, '0') + ':' + fmt.pad(d.getMinutes(), 2, '0'); },
  // Seconds for one trip along a flow line: faster when more power, null when idle.
  flowSpeed: function (kw) { return Math.abs(kw) < 0.02 ? null : Math.max(0.4, 3 / (0.5 + Math.abs(kw))); },
};
