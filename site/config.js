// Dashboard settings. No secrets here: this file is committed and served to anyone on the network.
// The Home Assistant token is supplied once per device by opening index.html#token=YOUR_TOKEN;
// the page stores it in that browser's localStorage and removes it from the address bar.
window.HA_CONFIG = {
  url: 'http://192.168.42.128:8123',
  token: '',
  theme: 'hud',        // starting theme: 'lcars' | 'hud' | 'crt'
  rotateMinutes: 0,    // cycle themes every N minutes; 0 = stay put (tap top-right corner to switch)
};
