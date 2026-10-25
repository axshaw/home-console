# home-console

Full-screen "spaceship console" energy dashboard for an old Fire 7 tablet, fed live from Home Assistant
(Sigen solar/battery/grid, AirSense air quality, weather). Three themes:

- **hud**: holographic HUD with glowing nodes and animated energy streams
- **lcars**: Star Trek LCARS panels with chasing segment bars and a stardate
- **crt**: Fallout-style green Pip-Boy STAT screen: the house as the "character" with condition bars per power source, HP = battery, LEVEL = self-sufficiency, CAPS = today's grid cost (pence)

Tap the top-right corner to switch theme, or open with `?theme=hud|lcars|crt`. `?demo=1` simulates a sunny afternoon.

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
