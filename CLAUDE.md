# CLAUDE.md: working on Home Console

Home Console is a full-screen, themeable energy dashboard for home solar and battery systems,
designed to run on **old tablets** (the reference device is a 2015 Amazon Fire 7 on Fire OS 5,
roughly Chrome 50-era WebView) inside a kiosk browser. It is plain HTML/CSS/JS with **no build
step and no dependencies**: what is in `site/` is exactly what the tablet loads.

This file is the map for anyone (human or Claude) adding themes, data sources or features.

## Layout

```
site/                     everything served to the tablet
  index.html              loads scripts in order, then HC.app.start(window)
  config.js               committed defaults (no secrets); overridden by config.local.js
  core/
    format.js             HC.format: kw(), n(), pad(), time(), hourMinutes(), flowSpeed()
    model.js              HC.model.build(readings, opts) -> the model every theme renders
    config.js             HC.config: merge(), param(), resolve() (defaults <- local <- URL)
    themes.js             HC.themes: register(name, theme), get(), names()
    art.js                HC.art: rng(), refs(), text(), flow(), clamp(), frac(), loop()
    app.js                HC.app.start(): source, stage scaling, theme switching, refresh
  sources/
    homeassistant.js      HA WebSocket (subscribe_entities) + entity mapping (Sigen preset)
    demo.js               synthetic sunny afternoon (?demo=1)
    json.js               polls any URL returning readings JSON
  themes/*.js             one file per theme; each calls HC.themes.register(...)
tests/                    browser test harness + tests; `sh tests/run.sh` runs them headless
deploy/docker-compose.yml nginx + git-pull sidecar (Portainer stack)
serve.ps1                 tiny Windows preview server (or `python3 -m http.server 8765`)
```

Everything hangs off one global namespace, `window.HC`. Each file is an IIFE:
`(function (HC) { 'use strict'; ... })(window.HC = window.HC || {});`. Themes use
`})(window.HC);` because the core always loads first.

## Data flow

```
source.read()  ->  readings  ->  HC.model.build(readings, {now, link, site, max})  ->  theme.update(model)
   (HA / JSON / demo)            (normalised, derived values)                           (~1/s and on change)
```

`HC.app` calls `update()` once a second (clocks) and, throttled to 400 ms, whenever the source
reports a change.

### Readings (what a source provides)

All optional. Units: **kW** for power, **kWh** for energy, **%** for soc/soh, **°C**.

| field | meaning |
|---|---|
| `pv` | solar generation now |
| `load` | house consumption now |
| `gridIn` / `gridOut` | import from / export to the grid now (both ≥ 0) |
| `batt` | battery power, **+ charging / − discharging** |
| `soc`, `soh`, `capacity`, `cellTemp` | battery charge %, health %, size kWh, cell temperature |
| `strings` | array of per-string PV power (themes draw 4) |
| `dailyPv`, `dailyLoad`, `dailyImport`, `dailyExport`, `cost` | today's totals (cost in local currency) |
| `state`, `gridStatus` | text status of the plant / grid link |
| `outTemp`, `outCond` | outdoor temperature and condition text (e.g. "partly cloudy") |
| `inTemp`, `iaqClass` | indoor temperature and air-quality text (optional sensors) |
| `sunrise`, `sunset` | decimal local hours, e.g. `7.75` |

### Model (what a theme receives)

`HC.model.build()` guarantees: every power/energy field is a finite number (missing → 0);
`outTemp`/`inTemp` are a number or `undefined`; text fields are strings; `strings` has exactly
4 numbers; `soc` is clamped 0–100. It adds:

| field | meaning |
|---|---|
| `gridNet` | `gridIn − gridOut` (> 0 importing, < 0 exporting) |
| `selfSufficiency` | % of today's load not imported (0–100) |
| `home` | `'solar'` or `'grid'`: what is mainly powering the house |
| `now` | `Date` of this frame |
| `link` | source status: `'ok'`, `'demo'`, `'connecting'`, `'reconnecting'`, `'bad token'`, … (`HC.model.isLive(m)`) |
| `site` | site name from config (e.g. `HOME-01`) |
| `max` | `{ pv, grid, load, batt }` full-scale kW for gauges: **always scale with these, never hard-code system sizes** |

Use `HC.format` for display: `fmt.kw(v)` → `"3.38"`, `fmt.n(v, 1)` → `"21.3"` or `"--"` when missing.

## Adding a theme

1. Create `site/themes/<name>.js` (lower-case name) from this skeleton:

   ```js
   // <Name>: one-line description of the idea and what each visual element means.
   (function (HC) {
     'use strict';
     var fmt = HC.format, Art = HC.art;
     var el = {};

     var CSS = '.theme-<name> { background: #000; }' +
       '.theme-<name> .flow { fill:none; stroke-width:4; stroke-dasharray: 2 14; animation: <name>flow 1s linear infinite; }' +
       '@keyframes <name>flow { to { stroke-dashoffset: -16; } }';

     HC.themes.register('<name>', {
       label: 'Human name',

       // Build the DOM once. root is the 1280×800 stage; it gets class "theme-<name>".
       mount: function (root) {
         root.innerHTML = '<style>' + CSS + '</style>' +
           '<svg width="1280" height="800" viewBox="0 0 1280 800">' +
             '<path class="flow" stroke="#fc0" d="M100 400 L600 400" data-k="pvFlow"/>' +
             '<text x="100" y="380" fill="#fff" font-size="40" data-k="pv"></text>' +
           '</svg>';
         el = Art.refs(root);          // every [data-k] element, by name
       },

       // Called ~1/s and on data changes: only touch what changed, never rebuild the DOM.
       update: function (m) {
         Art.text(el, 'pv', fmt.kw(m.pv) + ' kW');
         Art.flow(el.pvFlow, m.pv, false);           // speed follows power; hidden when idle
       },
     });
   })(window.HC);
   ```

2. Add `<script src="themes/<name>.js"></script>` to **both** `site/index.html` (before
   `core/app.js`; order = tap-cycle order) and `tests/index.html`.
3. Run `sh tests/run.sh`. The smoke test mounts every registered theme and feeds it demo, empty,
   night-export, bad-token and very large models.
4. Look at it: `?theme=<name>&demo=1` (see Previewing). Check 1280×800 and 1024×600.
5. Add a line to the theme list in `README.md`.

### Theme rules

- **Stage:** design for a fixed **1280×800** canvas; the app scales it to fit. Keep text ≥ 14 px.
- **Everything is data:** prefer visual metaphors driven by the model (fill levels, speeds,
  glow) over plain numbers, but always show the key numbers somewhere readable.
- **Scale from `m.max`**, e.g. `Art.frac(m.pv, m.max.pv)`; installations range from 3 kW to 30 kW+.
- **Handle the edges:** `link` not live (show it), night (pv = 0), exporting (`gridNet < 0`),
  discharging (`batt < 0`), missing optional sensors (`fmt.n` prints `--`).
- **Cheap updates:** cache elements with `Art.refs`, write with `Art.text` (skips unchanged), set
  attributes rather than rebuilding markup. Animation belongs in CSS/SMIL, not in `update()`.
- **Continuous motion** that depends on data (e.g. orbit speed) may use `Art.loop(root, fn)`,
  which stops by itself when the theme is switched away.
- **No external assets:** no web fonts, images or network requests. Draw with SVG/CSS. Always
  give font stacks with generic fallbacks (`serif`, `monospace`, `cursive`). Old Android has
  CJK fonts; emoji support is unreliable, so avoid emoji.
- **Scope your CSS** under `.theme-<name>` and prefix ids/keyframes/gradients with the theme name
  (e.g. `id="xmasglow"`); several themes' defs never coexist, but keep them unique anyway.
- **Deterministic scenery:** use `Art.rng(seed)` for procedural stars/buildings so every load
  looks the same.
- Personal touches are welcome (the `home` theme has the author's pets) but keep them in the
  theme file, not in core.

## Old-WebView constraints (Fire OS 5 / ~Chrome 50)

Write **ES2017 without**: optional chaining `?.`, nullish `??`, `String.padStart` (use
`fmt.pad`), `Object.fromEntries`, `Array.flat`, class fields, ES modules, `import`/`export`.
`const`/`let`, arrow functions, template literals and `Object.keys`/`entries` are fine.
Existing code mostly uses `var` + string concatenation for consistency.

CSS/SVG gotchas found the hard way:

- **SVG filters on perfectly horizontal/vertical paths render nothing** with the default
  `objectBoundingBox` filter region (the bounding box has zero height or width). For glows on
  straight lines use `filterUnits="userSpaceOnUse"` with an explicit `x y width height`
  (see `hud.js`, `hudglowline`).
- Avoid CSS `gap` on flexbox, `inset`, `aspect-ratio`, `transform-box`, `backdrop-filter`.
- **SMIL** (`<animate>`, `<animateTransform>`, `<animateMotion>`) works and is the easiest way
  to animate inside SVG (rotate about a point with `values="a cx cy;b cx cy"`).
- CSS animations on `transform`/`opacity` are cheap; animated blur/filters on many elements are not.
- Keep animated elements to roughly ≤ 150 per theme; the Fire 7 is slow.

## Data sources

A source is `{ start(onChange), read() -> readings, status() -> string }`, created by
`HC.sources.<name>.create(config)` and selected with `HC_CONFIG.source`.

- **homeassistant**: subscribes to entity changes over HA's WebSocket. Entity IDs default to
  the Sigenergy integration (`SIGEN_ENTITIES` in `sources/homeassistant.js`); override per install
  in `HC_CONFIG.entities`. If `battCharging`/`battDischarging` are `null`, `battPower` is read as a
  signed value (+ charging). Pure helpers (`toReadings`, `applyEvent`, `resolveToken`) are unit-tested.
- **json**: polls `HC_CONFIG.json.url` for a readings object. This is the integration point for
  non-HA setups: a small bridge that reads the inverter (e.g. a **Sigen gateway via Modbus TCP**,
  which a browser cannot speak), Node-RED, or a vendor cloud API, and serves readings JSON from
  the same origin.
- **demo**: `HC.sources.demo.readingsAt(ms)` is pure, which is handy in tests.

To add a source: create `site/sources/<name>.js` that sets `HC.sources.<name> = { create }`, add
it to both `index.html` files, keep the network part thin and the mapping pure, and test the
mapping in `tests/sources.test.js`.

## Configuration and secrets

Layering: `site/config.js` (defaults, committed) ← `config.local.js` (`window.HC_CONFIG_LOCAL`,
git-ignored, or served from the `CONSOLE_CONFIG` stack variable) ← URL (`?theme=`, `?demo=1`).
`HC.config.merge` deep-merges objects; arrays replace.

**Never commit secrets or personal network details into `site/`**: it is served to every
device on the LAN. The HA token comes from, in order: `config.token` (local dev only),
`token.js` (stack `HA_TOKEN`, readable by anyone on the LAN), `#token=` in the URL (stored in
that device's localStorage and stripped from the address bar).

Why the WebSocket is proxied: Chrome's **Local Network Access** blocks an `http://` page on one
LAN host from opening sockets to another. The nginx stack proxies `/api/websocket` to
`HA_UPSTREAM`, so the page only talks to its own origin (`config.url = ''`).

## Testing

- `sh tests/run.sh` runs `tests/index.html` in headless Chrome/Edge (`--dump-dom`) and exits
  non-zero on failure; CI does the same on every push (`.github/workflows/tests.yml`).
- Or open `tests/index.html` in any browser.
- Tests are plain functions: `test('name', function () { assert.equal(a, b); })`.
  Assertions: `ok`, `equal`, `near`, `deepEqual`, `throws`.
- Put logic in pure functions (like `toReadings`, `build`) so it can be tested without a DOM or
  network; keep side effects at the edges (`create`, `app.start`).

## Previewing

- Serve the repo root: `powershell -File serve.ps1` (Windows) or `python3 -m http.server 8765`,
  then open `http://localhost:8765/site/index.html?demo=1&theme=<name>`.
- Live data locally: put `window.HC_CONFIG_LOCAL = { url: 'http://<ha-host>:8123' };` in
  `site/config.local.js` and open the page once with `#token=<token>`. Chrome allows
  `localhost` pages to reach LAN hosts.
- Full-size screenshot without a visible browser:
  `msedge --headless --disable-gpu --window-size=1280,800 --virtual-time-budget=6000 --screenshot=out.png "http://localhost:8765/site/index.html?theme=<name>&demo=1"`
  (Edge writes the file a moment after the command returns).

## Deployment

`deploy/docker-compose.yml` runs nginx serving `site/` plus a sidecar that `git fetch`es the
branch every 60 s, so a push to `main` is live within a minute with no redeploy. Stack variables:
`REPO`, `DEPLOY_KEY_B64` (read-only deploy key), `PORT`, `HA_UPSTREAM`, optional `CONSOLE_CONFIG`
(JSON) and `HA_TOKEN`. Changes to the compose file itself need "Update the stack" in Portainer.

## Conventions

- Comments explain *why* and what a visual element *means*; the code says what.
- `data-k="name"` marks elements a theme updates; look them up once with `Art.refs`.
- Name things after the domain (`gridNet`, `selfSufficiency`), not the widget.
- Small pure functions; no global state outside `HC`; no new dependencies or build tooling
  without a strong reason (the zero-build setup is a feature for old devices and contributors).
