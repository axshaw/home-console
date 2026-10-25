# Turn an old Fire tablet into a live solar dashboard (with eight themes!)

*How I gave a 2015 Amazon Fire 7 a new job: a full-screen, always-on console showing what our
solar panels, home battery and grid are doing, with themes ranging from Star Trek to a cartoon
of our house with the dog asleep on the rug.*

---

## Why bother?

We have solar panels and a home battery (a Sigenergy system) and Home Assistant. The numbers are
all there in apps, but you have to *go and look*. I wanted something on the wall I could glance
at: is the sun doing the work, is the battery filling up, are we buying from the grid?

I also had two old Amazon Fire tablets in a drawer, too slow for anything much, and a bit sad.
Perfect.

By the end of this guide you'll have:

- a web dashboard that updates **live** from your solar/battery system,
- **eight themes** you can switch with a tap (and the know-how to make your own),
- a hosting setup where a `git push` updates the tablet **automatically within a minute**,
- an old tablet that boots straight into it and stays on.

It's all open source: grab it from the [Home Console repo](../README.md). Let's go! 🌞

---

## What you'll need

| Thing | What I used | Notes |
|---|---|---|
| A tablet | Amazon Fire 7 (5th gen, 2015, model SV98LN), Fire OS 5.3.6.4 | Any old Android tablet works; Fire tablets have quirks (covered below) |
| Solar/battery data | Sigenergy system + the Sigenergy integration in **Home Assistant** | Any inverter Home Assistant knows about works; you'll just map entity names |
| Somewhere to host a tiny web server | A Linux VM on Proxmox running **Docker + Portainer** | A Raspberry Pi, NAS with Docker, or any always-on box is fine |
| A GitHub account | | For the auto-updating deployment (optional but lovely) |
| A PC | Windows in my case | For setup and previews |

You don't need to know much JavaScript to use it. You need a bit more to write themes, but
there's a template.

---

## How it fits together

```
 Sigen inverter ──► Home Assistant ──WebSocket──► nginx (Docker) ──► Fire tablet
                                                    ▲                (Fully Kiosk browser)
                       GitHub repo ──git pull/60s───┘
```

- **Home Assistant** already collects everything from the inverter.
- The **dashboard** is a plain web page (HTML + JavaScript, no build step). It opens a WebSocket
  to Home Assistant and gets pushed every change the moment it happens.
- **nginx** in Docker serves the page, and quietly passes the WebSocket through to Home
  Assistant (there's a very good reason for this; see "The mystery of the missing data").
- A tiny **git sidecar** container pulls the repo every minute, so pushing a change to GitHub
  updates the tablet without touching the server.
- **Fully Kiosk Browser** on the tablet shows the page full-screen, keeps the screen on, and
  starts at boot.

---

## Step 1: Find your data in Home Assistant

### Make a token

The dashboard needs permission to read Home Assistant. In Home Assistant:

1. Click your **profile** (bottom-left) → **Security**.
2. Under **Long-lived access tokens**, choose **Create token**, call it "Dashboard", and copy it
   somewhere safe. It's only shown once!

> 💡 **Tip:** even better, create a separate, **non-admin** Home Assistant user just for
> dashboards and make the token as that user. If the token ever leaks, it can't change your
> settings. And treat it like a password: if you paste it into a chat, a ticket or a
> screenshot, delete it in Home Assistant and make a new one.

### Find your entity names

Every reading in Home Assistant is an *entity*, like `sensor.sigen_plant_pv_power`. Go to
**Settings → Devices & services → Entities** and search for your inverter. You're looking for:

- solar power now, house load now, grid import and export now
- battery power and charge (%), plus charging/discharging indicators if you have them
- today's totals: solar, consumption, import, export, cost
- optionally: a weather entity, and indoor temperature or air quality sensors

If you have a Sigenergy system with the standard integration, the dashboard **already knows all
the names**, and you can skip to Step 2. For other systems, note them down for Step 3.

---

## Step 2: Try it in demo mode (two minutes, no setup)

Grab the code and start a tiny local web server:

```bash
git clone https://github.com/<you>/home-console.git
cd home-console
python3 -m http.server 8765
```

(On Windows without Python, there's a little helper: `powershell -File serve.ps1`.)

Now open <http://localhost:8765/site/index.html?demo=1> in your browser.

That `?demo=1` is a **simulated sunny afternoon**, so every animation moves. Click the
**top-right corner** to cycle through the themes. Add `&theme=astrolabe` (or `hud`, `lcars`,
`crt`, `cyber`, `home`, `halloween`, `xmas`) to jump to one.

> ⚠️ **Remember to take `?demo=1` off later!** I spent a happy ten minutes convinced my live
> numbers were wrong. They were the demo's made-up sunny afternoon. 🙃

---

## Step 3: Point it at your system

Create a file called `site/config.local.js`. Git ignores it, so your personal settings never
get committed:

```js
window.HC_CONFIG_LOCAL = {
  url: 'http://homeassistant.local:8123',   // your Home Assistant (for local testing)
  entities: {
    // only list what differs from the Sigen defaults
    inTemp: 'sensor.lounge_temperature',
    iaqClass: 'sensor.lounge_air_quality',
  },
  scale: { pv: 10, grid: 8, load: 6, batt: 8 }, // "full" gauges, in kW: match your system
  site: 'HOME-01',                               // a name some themes show in their header
};
```

Then open the page **once** with your token on the end of the address:

```
http://localhost:8765/site/index.html#token=PASTE_YOUR_TOKEN_HERE
```

The page saves the token in that browser and immediately removes it from the address bar. From
then on, the plain address just works. You should see your real numbers. 🎉

**Not Sigen?** The full list of entity keys is `SIGEN_ENTITIES` at the top of
`site/sources/homeassistant.js`. Copy any you need to change into `entities`. If your battery
power sensor is signed (positive while charging), set `battCharging: null` and
`battDischarging: null`.

**No Home Assistant at all?** Set `source: 'json'` and point `json.url` at anything that serves
the readings as JSON (the fields are listed in `CLAUDE.md`). For example, a Sigen gateway speaks
Modbus TCP, which a browser can't, so a tiny script on a Pi could read it and serve the JSON.

---

## Step 4: Host it properly (Docker + Portainer)

You *could* just leave a PC running, but we want something always-on that updates itself.

### Why not just open the file on the tablet?

You can't load a web page "from a file" on a Fire tablet very easily, and it would need copying
every time you changed anything. A tiny web server is simpler.

### Why not Home Assistant's `/local` folder?

Home Assistant can serve files from its `www` folder, but anything there can be read by **any
device on your network without logging in**. That's fine for pictures, but not for a page
holding your token. Our setup never puts the token in a served file at all.

### The stack

The repo includes [`deploy/docker-compose.yml`](../deploy/docker-compose.yml). It runs two
little containers:

- **sync** clones your GitHub repo, then runs `git fetch` every 60 seconds and updates when
  something changed. It uses a read-only **deploy key**, so it can only read that one repo.
- **web** is nginx serving the `site/` folder (and *only* that folder, so never your `.git`
  directory). It also proxies Home Assistant's WebSocket.

### 4a. Put the code on GitHub

Create a **private** repo (say `home-console`) and push the code to it.

### 4b. Make a deploy key

On your PC:

```bash
ssh-keygen -t ed25519 -N "" -f deploy_key -C "home-console deploy (read-only)"
```

- In GitHub: repo → **Settings → Deploy keys → Add deploy key**. Paste the contents of
  `deploy_key.pub` and leave **"Allow write access" unticked**.
- Make a one-line base64 copy of the *private* key for Portainer: `base64 -w0 deploy_key > key.txt`.

> 💡 **Windows tip:** to copy that file to your clipboard in **PowerShell**, use
> `Get-Content key.txt -Raw | Set-Clipboard`. (The bash-style `clip < key.txt` gives a
> confusing "The '<' operator is reserved for future use" error in PowerShell. Ask me how I know.)

### 4c. Create the stack in Portainer

1. Open Portainer (usually `https://<your-docker-host>:9443`) and pick the **environment** you
   want it to run on.

   > ⚠️ If Portainer manages several machines, the stack runs on whichever environment you're
   > in when you click Add stack, and the dashboard's address will be **that** machine's IP.
   > I went looking on the wrong host for a while!

2. **Stacks → Add stack**, give it a name, choose **Web editor**, and paste the compose file.
3. Add the environment variables:

   | Variable | Value |
   |---|---|
   | `REPO` | `git@github.com:<you>/home-console.git` (the SSH form, not https) |
   | `DEPLOY_KEY_B64` | the one-line contents of `key.txt` |
   | `HA_UPSTREAM` | your Home Assistant, e.g. `http://192.168.1.50:8123` |
   | `PORT` | `8088` (or any free port) |
   | `CONSOLE_CONFIG` | your settings as JSON, e.g. `{"entities":{"inTemp":"sensor.lounge_temperature"}}` |

4. Click **Deploy the stack**, and watch for a red error banner. If the stack doesn't appear in
   the list afterwards, it didn't deploy!
5. Check the **sync** container's logs: you should see the clone happen.
6. Open `http://<docker-host>:8088/?demo=1` on your PC. You should see the demo.

From now on, **every push to `main` reaches the tablet within about a minute.** Pushing a
change and watching it pop up on the wall is very satisfying.

> 📝 Changes to the page itself arrive automatically. Changes to the **compose file** (or its
> variables) need **Stacks → your stack → Editor → Update the stack** in Portainer.

### The mystery of the missing data (and the fix)

My first deployment loaded perfectly… and showed **zeros everywhere**, stuck on
"reconnecting". The same page worked fine from my PC.

The culprit: **Chrome's Local Network Access protection.** Chrome now blocks a plain
`http://` web page on one machine in your home from opening connections to *another* machine in
your home. So the page (served from the Docker VM) wasn't allowed to talk to Home Assistant
(a different machine). Home Assistant itself was fine. The browser killed the connection
within milliseconds, before it ever left the tablet.

The fix is the proxy built into the stack: nginx forwards `/api/websocket` to Home Assistant,
so the page only ever talks to **the server it came from**. No cross-machine connection, nothing
for Chrome to block. That's why `url` is left empty in the deployed config.

---

## Step 5: Give the tablet the token

You have two choices:

1. **Once per device (safest):** open `http://<docker-host>:8088/#token=YOUR_TOKEN` once on the
   tablet. It's remembered in that browser only.
2. **Baked into the server (most convenient):** set the stack's `HA_TOKEN` variable, and nginx
   serves it to the page, so any device just works. The trade-off: **anyone on your Wi-Fi** can
   read the token from `/token.js`. If you do this, definitely use a non-admin Home Assistant user.

Typing a 180-character token on a 7-inch screen is no fun. If you go with option 1, put the
`#token=` address straight into Fully Kiosk's **Start URL** (next step) by copy-paste: email it
to yourself, or use Fully's remote admin page from your PC.

---

## Step 6: Prepare the Fire tablet

### Know your tablet

**Settings → Device Options** shows the **model** (mine: SV98LN, the 5th-gen Fire 7 from 2015)
and **System Updates** shows the Fire OS version (mine: 5.3.6.4, which is Android 5.1 under the
hood). That matters for which apps will install.

### Allow apps from outside the Amazon store

**Settings → Security → Apps from Unknown Sources → On.**

### Install Fully Kiosk Browser (the right version!)

[Fully Kiosk Browser](https://www.fully-kiosk.com/) is the go-to app for wall-mounted
dashboards. It shows one web page full-screen, keeps the screen awake and starts at boot.

> ⚠️ **"There was a problem parsing the package"?** The current Fully needs a newer Android than
> old Fire tablets have. Fully's docs keep the **last version for Android 5** available:
> **v1.59.2**, at `https://www.fully-kiosk.com/files/2025/10/Fully-Kiosk-Browser-v1.59.2.apk`.
> Open that link in Silk on the tablet, download, install. (It won't get updates any more, but
> it works great.)

### Configure Fully

Swipe in from the left edge → **Settings**:

| Setting | Value |
|---|---|
| **Web Content → Start URL** | `http://<docker-host>:8088/?theme=hud` (pick your favourite theme) |
| **Device Management → Keep Screen On** | On |
| **Device Management → Start on Boot** | On |
| **Fullscreen / hide status & navigation bars** | On |
| **Brightness** | To taste (dark themes look great dimmed) |

Then **reboot** to test. You'll probably have to swipe the Fire lock screen once (it can't be
turned off on Fire OS 5), and then the console appears by itself.

### Fire OS 5 quirks worth knowing

- **Use Fully's Screensaver, not "Screen Off"**, for night-time dimming. On some Fire OS 5
  builds, turning the screen off kills the web view and Fully with it.
- **The Home button takes about 5 seconds** to come back to Fully. That's normal.
- **The built-in web engine is old.** The dashboard is deliberately written in old-fashioned
  JavaScript so it still runs; if you make your own theme, follow the rules in `CLAUDE.md`.
- **Battery health:** a tablet charging 24/7 for years can swell. Check it every few months; if
  the case bulges or the screen lifts, retire it.

### "Please sign in" popping up over the dashboard

If the tablet isn't registered to an Amazon account, Fire OS keeps nagging you to sign in, right
over the top of your dashboard. On my tablet, signing in got stuck: the web login worked, but the
redirect back to the tablet ended on "page not found". Things to try:

- If your Amazon account uses **two-step verification**, old devices sometimes accept your
  **password immediately followed by the 6-digit code** in the password box.
- Make sure the tablet's **date and time** are right.
- If it still won't play, skip the account: **Fully Kiosk's Plus licence** (a few euros) adds
  **Kiosk Mode**, which keeps the dashboard in front and pushes those screens back.

### "We've encountered an error with your Fire for Kids account"

Our tablets used to be the kids' tablets, and the old Fire for Kids profiles were stuck in an
error loop and couldn't be removed. The cure is a **factory reset**:

1. **Export Fully's settings first** (Settings → Other → Export Settings to File), or just note
   your Start URL.
2. Reset from **Settings → Device Options → Reset to Factory Defaults**, or, if you're locked
   out, from **recovery mode**: power off, then hold **Power + Volume Down** (on some models
   Volume Up) and choose **wipe data/factory reset**.
3. During setup, **skip** signing in, reinstall Fully v1.59.2 and import your settings.

Also tidy up online: remove old kids' profiles on Amazon's Parent Dashboard and deregister old
devices under "Manage Your Content and Devices".

> **Can I flash a custom OS instead?** For some older Fire models the community has unlock
> methods and custom ROMs, but they're very model- and firmware-specific (newer Fire OS updates
> blocked the easy ones), often involve opening the case, and can brick the tablet. For a
> dashboard you don't need one: Fully plus the tips above does the job. If you're curious, the
> XDA Developers forum for your exact model is the place to look.

---

## Step 7: Meet the themes

Tap the **top-right corner** of the screen (an invisible 120-pixel square) to cycle. Every theme
shows the same live data in its own way:

- **LCARS**: a Star Trek: TNG panel. Colour-coded systems with chasing segment bars, a battery
  "cell bank", and a stardate.
- **Holographic HUD**: glowing nodes for solar, grid, house and battery around a pulsing core.
  The energy dots stream *faster when more power flows*, and reverse when you export.
- **Pip-Boy**: a green Fallout terminal. Your house stands in for the character, with
  "condition bars" for each power source. **HP** is the battery, **LEVEL** is self-sufficiency,
  and **CAPS** is today's grid cost in pence. It boots with a RobCo start-up sequence, of course.
- **Neon city**: a rainy Blade Runner skyline, glass billboards labelled in katakana, a
  holographic battery tower, a spinner crossing the sky, and a news ticker.
- **Home**: a cartoon cut-away of the house. The panels on the roof glow with each PV string,
  the battery in the utility room fills up, and the household goes about its day: our collie
  asleep on the rug (tail wagging faster when it's sunny!), the cat on the windowsill, the
  cavapoo trotting round the kitchen and the hen pecking outside. It gets dark at night, with
  the lamps on.
- **Halloween**: a moonlit graveyard. Tombstones hold the readings ("R.I.P. GRID"), the bubbling
  **cauldron is the battery**, jack-o'-lanterns glow with solar, and there's a countdown to the
  31st.
- **Christmas**: a snowy night with a log cabin. The **tree lights fill up with battery charge**,
  presents carry gift tags for the readings, and the snowman counts the sleeps.
- **Astrolabe**: my favourite. A brass instrument on midnight ink. The 24-hour dial shows today's
  real sunrise-to-sunset arc. Through the day it **engraves your actual solar curve** in gold and
  your usage in silver. The battery is a glowing glass orb, orbited by three planets whose
  speed follows live power, and a line of prose describes the moment: *"This afternoon, the sun
  pours 6.4 kW upon the roof; the vessel drinks deeply…"*

Want it to change by itself? Set `rotateMinutes` in your config. Want fewer? `themes: ['hud',
'astrolabe']`.

---

## Step 8: Make your own theme

This is the fun bit. A theme is one JavaScript file with two functions:

- **`mount(root)`** draws the scene once, on a 1280×800 canvas the app scales to fit.
- **`update(model)`** gets called about once a second with fresh numbers, and updates the
  text, fill levels and animation speeds.

`CLAUDE.md` in the repo has a copy-paste template and all the rules. It's written so that you can
hand it to Claude and say "make me a theme that looks like a steampunk boiler room", and it'll
know exactly how the project works. A few lessons I learned the hard way:

- **Old browsers are picky:** no `?.` or `??`, no `padStart`. The shared helpers cover the common needs.
- **SVG glow filters vanish on perfectly straight lines.** A horizontal line has a zero-height
  bounding box, so the filter has no area to draw in. Use `filterUnits="userSpaceOnUse"`
  with explicit bounds. This one had me staring at an empty screen for a while!
- **Scale everything from `model.max`**, so a 4 kW system and a 30 kW system both look right.
- **Run `sh tests/run.sh`**: it mounts every theme with demo, empty, night-time and enormous
  values, so you'll catch a crash before your tablet does.

---

## Troubleshooting cheat sheet

| What you see | What's going on | Fix |
|---|---|---|
| Numbers look fake / don't match your app | You're in demo mode | Remove `?demo=1` from the address |
| All zeros, header says **LINK BAD TOKEN** | That browser has no token (or a wrong one) | Open once with `#token=…`, or set `HA_TOKEN` |
| All zeros, **reconnecting** | Chrome's Local Network Access is blocking a direct connection | Use the nginx stack with `url: ''` (it proxies the WebSocket) |
| "This site can't be reached" | The stack isn't running, or it's on another Portainer environment | Check the stack exists and use that host's IP |
| Can't change theme | The switch is an invisible square in the very top-right corner | Tap right in the corner |
| "Problem parsing the package" installing Fully | App too new for Fire OS 5 | Install Fully v1.59.2 |
| "Please sign in" pops over the dashboard | Fire OS wants an Amazon account | Sign in (try password+code), or use Fully Kiosk Mode |
| Fire for Kids error loop | Orphaned kids' profiles | Factory reset, skip sign-in |
| Change pushed but not showing | Page caches, or you changed the compose file | Wait a minute and refresh; compose changes need "Update the stack" |

**Bonus tip:** if you put a sensor in a 3D-printed case and it suddenly reads 10 °C too warm,
the case is trapping the sensor's own electronics heat. Many ESPHome-style sensors have a
**Temperature offset** setting on their device page in Home Assistant. Compare against another
sensor in the same room, set the offset, and maybe add some vent holes to the next print!

---

## Wrapping up

That drawer tablet now has a proper job again. 😄 One glance tells you whether the sun is doing
the work, whether the battery is filling up, and whether you're buying from the grid. And
watching the Astrolabe slowly draw the day's solar curve is weirdly calming.

If you build one, I'd love to see your themes. Pull requests are very welcome! Happy
harvesting! ☀️🔋
