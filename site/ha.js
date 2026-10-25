// Minimal Home Assistant WebSocket client.
// Uses subscribe_entities, which sends full states once ("a") then compact diffs ("c").
// An empty HA_CONFIG.url means "same origin": nginx proxies /api/websocket to HA, because
// Chrome's Local Network Access blocks an http:// page from opening sockets to other LAN hosts.

window.HA = (() => {
  const states = {}; // entity_id -> { state, attributes }
  const listeners = [];
  let status = 'connecting';
  let retryMs = 2000;

  const notify = () => listeners.forEach((fn) => fn());

  function connect() {
    const { url, token } = window.HA_CONFIG;
    const base = url || location.protocol + '//' + location.host;
    const ws = new WebSocket(base.replace(/^http/, 'ws') + '/api/websocket');
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'auth_required') {
        ws.send(JSON.stringify({ type: 'auth', access_token: token }));
      } else if (msg.type === 'auth_ok') {
        status = 'ok';
        retryMs = 2000;
        ws.send(JSON.stringify({ id: 1, type: 'subscribe_entities' }));
      } else if (msg.type === 'auth_invalid') {
        status = 'bad token';
        notify();
      } else if (msg.type === 'event' && msg.event) {
        applyDiff(msg.event);
        notify();
      }
    };
    ws.onclose = () => {
      if (status !== 'bad token') {
        status = 'reconnecting';
        notify();
        setTimeout(connect, retryMs);
        retryMs = Math.min(retryMs * 2, 60000);
      }
    };
  }

  function applyDiff(ev) {
    for (const [id, e] of Object.entries(ev.a || {})) {
      states[id] = { state: e.s, attributes: e.a || {} };
    }
    for (const [id, d] of Object.entries(ev.c || {})) {
      const cur = states[id] || (states[id] = { state: undefined, attributes: {} });
      if (d['+']) {
        if ('s' in d['+']) cur.state = d['+'].s;
        if (d['+'].a) Object.assign(cur.attributes, d['+'].a);
      }
      if (d['-'] && d['-'].a) d['-'].a.forEach((k) => delete cur.attributes[k]);
    }
    (ev.r || []).forEach((id) => delete states[id]);
  }

  return {
    start: connect,
    onChange: (fn) => listeners.push(fn),
    status: () => status,
    state: (id) => (states[id] ? states[id].state : undefined),
    attr: (id, key) => (states[id] ? states[id].attributes[key] : undefined),
    num: (id) => {
      const v = parseFloat(states[id] && states[id].state);
      return Number.isFinite(v) ? v : undefined;
    },
  };
})();
