// Dashboard settings. No secrets here: this file is committed and served to anyone on the network.
// The Home Assistant token is supplied once per device by opening index.html#token=YOUR_TOKEN;
// the page stores it in that browser's localStorage and removes it from the address bar.
window.HA_CONFIG = {
  // Served by the nginx stack, the page reaches HA through nginx on its own origin (''). Local
  // previews on localhost have no proxy, so they talk to HA directly (Chrome allows that from localhost).
  url: location.hostname === 'localhost' ? 'http://192.168.42.128:8123' : '',
  token: '',
  theme: 'hud',        // starting theme: lcars | hud | crt | cyber | home | halloween | xmas | astrolabe
  rotateMinutes: 0,    // cycle themes every N minutes; 0 = stay put (tap top-right corner to switch)
};
