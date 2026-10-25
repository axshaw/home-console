// Copy this file to config.js (which is git-ignored).
window.HA_CONFIG = {
  url: 'http://192.168.42.128:8123',
  // Leave empty when hosting the files somewhere others can read (e.g. HA's /local/): open
  // index.html#token=YOUR_TOKEN once on the tablet and it is remembered there. Fill it in only
  // for a private local copy.
  token: '',
  theme: 'hud',        // starting theme: 'lcars' | 'hud' | 'crt'
  rotateMinutes: 0,    // cycle themes every N minutes; 0 = stay put (tap top-right corner to switch)
};
