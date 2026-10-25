# home-console

Full-screen "spaceship console" energy dashboard for an old Fire 7 tablet, fed live from Home Assistant
(Sigen solar/battery/grid, AirSense air quality, weather). Eight themes:

- **lcars**: Star Trek LCARS panels with chasing segment bars and a stardate
- **hud**: holographic HUD with glowing nodes and animated energy streams
- **crt**: Fallout-style green Pip-Boy STAT screen: the house as the "character" with condition bars per power source, HP = battery, LEVEL = self-sufficiency, CAPS = today's grid cost (pence)
- **cyber**: rain-soaked neon city; katakana billboards per reading, a holographic battery tower, spinner and news ticker
- **home**: cartoon cross-section of the house: panels, battery and meter with live flows, plus the collie, the Turkish Van, the cavapoo and the hen; day/night sky and lamps
- **halloween**: moonlit graveyard; tombstone readouts, the cauldron is the battery, jack-o'-lanterns glow with solar, countdown to the 31st
- **xmas**: snowy night; tree lights fill with the battery, gift tags for the readouts, snowman counting the sleeps
- **astrolabe**: brass instrument on midnight ink; a 24-hour dial with today's real daylight arc, today's solar and demand engraved as they happen (kept per day in localStorage), the battery as a glass orb orbited by Sol/Ley/Hearth at live-power speeds

Tap the top-right corner to cycle themes, or open with `?theme=<name>`. `?demo=1` simulates a sunny afternoon.
`themes/common.js` holds shared helpers (seeded random, flows, animation loop) for the illustrated themes.

## Layout

- `site/`: the dashboard (plain HTML/JS, ES2017, no build step). This is all nginx serves.
  - `config.js`: HA URL, starting theme, auto-rotate. **No secrets**; it's committed and served.
  - `ha.js`: Home Assistant WebSocket client. `data.js`: entity → model mapping. `themes/`: one file per theme.
- `deploy/docker-compose.yml`: Portainer stack (nginx + git-pull sidecar)
- `serve.ps1`: localhost preview server for Windows (`http://localhost:8765/site/index.html?demo=1`)

## Token

The HA long-lived token is never in the repo. Open the dashboard once per device as
`http://<host>:8088/#token=YOUR_TOKEN`. The page saves it in that browser's localStorage and strips it from the address.

## Deploy (Portainer)

1. In GitHub, add the public half of the deploy key: repo → Settings → Deploy keys (read-only).
2. In Portainer: Stacks → Add stack → paste `deploy/docker-compose.yml`, then set the environment variables
   `REPO` (`git@github.com:<owner>/home-console.git`), `DEPLOY_KEY_B64` and optionally `PORT`.
3. Deploy. From then on, pushes to `main` go live within a minute (the `sync` container's log shows each update).
