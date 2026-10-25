// Theme registry. Each theme file calls HC.themes.register(name, theme) where theme is:
//   { label: 'Human name', mount: function (root) {...}, update: function (model) {...} }
// mount() builds the DOM inside the 1280×800 stage; update() is called about once a second and
// whenever data changes, so it must be cheap and idempotent. See CLAUDE.md for the full contract.
(function (HC) {
  'use strict';

  var registry = {}, order = [];

  function register(name, theme) {
    if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error('Theme name must be lower-case: ' + name);
    if (!theme || typeof theme.mount !== 'function' || typeof theme.update !== 'function') {
      throw new Error('Theme "' + name + '" needs mount(root) and update(model)');
    }
    if (!registry[name]) order.push(name);
    theme.name = name;
    theme.label = theme.label || name;
    registry[name] = theme;
    return theme;
  }

  HC.themes = {
    register: register,
    get: function (name) { return registry[name]; },
    // Registered names, optionally filtered and ordered by a configured list.
    names: function (preferred) {
      if (!preferred || !preferred.length) return order.slice();
      return preferred.filter(function (n) { return registry[n]; });
    },
  };
})(window.HC = window.HC || {});
