// Home Console settings. This file is committed and served to anything on your network, so it
// must never contain secrets. Put your own values in config.local.js (git-ignored, loaded after
// this file) as   window.HC_CONFIG_LOCAL = { ... };   using the same keys. When deployed with
// deploy/docker-compose.yml, set the CONSOLE_CONFIG variable instead and nginx serves it as
// config.local.js.
window.HC_CONFIG = {
  // Where readings come from: 'homeassistant', 'json' or 'demo' (?demo=1 forces demo).
  source: 'homeassistant',

  // Home Assistant base URL. Leave '' when the page is served by the nginx stack, which proxies
  // the WebSocket on the same origin. For local previews set e.g. 'http://homeassistant.local:8123'.
  url: '',

  // Long-lived access token. Leave '' here: supply it per device with index.html#token=YOUR_TOKEN,
  // or via the stack's HA_TOKEN variable (served as token.js; anyone on the LAN can read it).
  token: '',

  // Override any entity ID from HC.sources.homeassistant.SIGEN_ENTITIES, or set optional ones
  // (inTemp, iaqClass) to show indoor temperature and air quality. null hides a reading.
  entities: {},

  // For source: 'json', e.g. { url: '/readings.json', intervalMs: 5000 }.
  json: null,

  // Full-scale values (kW) for gauges and bars: match them to your system's size.
  scale: { pv: 10, grid: 8, load: 6, batt: 8 },

  site: 'HOME-01',          // shown in some theme headers
  defaultTheme: 'hud',      // used until someone picks a theme (the choice is remembered)
  themes: null,             // e.g. ['hud', 'astrolabe'] to limit and order the tap cycle
  rotateMinutes: 0,         // cycle themes every N minutes; 0 = stay put (tap top-right to switch)
};
