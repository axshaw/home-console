#!/bin/sh
# Run the test page in headless Chrome or Edge and fail if any test fails.
# Usage: sh tests/run.sh        (set BROWSER=/path/to/chrome to choose a browser)
set -e
cd "$(dirname "$0")"

find_browser() {
  for b in "$BROWSER" google-chrome google-chrome-stable chromium chromium-browser \
           "/c/Program Files/Google/Chrome/Application/chrome.exe" \
           "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
           "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
    [ -n "$b" ] && command -v "$b" >/dev/null 2>&1 && { echo "$b"; return; }
    [ -n "$b" ] && [ -x "$b" ] && { echo "$b"; return; }
  done
  return 1
}

BIN=$(find_browser) || { echo "No Chrome/Edge found; open tests/index.html in a browser instead." >&2; exit 2; }
PAGE="$(pwd)/index.html"
case "$(uname -s)" in MINGW*|MSYS*|CYGWIN*) PAGE="$(cygpath -m "$PAGE")" ;; esac

OUT=$("$BIN" --headless --disable-gpu --no-sandbox --allow-file-access-from-files \
  --virtual-time-budget=5000 --dump-dom "file:///${PAGE#/}" 2>/dev/null)

# Print the results block (between <pre id="results"> and </pre>), unescaping &amp; etc.
echo "$OUT" | sed -n '/<pre id="results"/,/<\/pre>/p' | sed 's/<[^>]*>//g; s/&gt;/>/g; s/&lt;/</g; s/&amp;/\&/g; s/&quot;/"/g'
echo "$OUT" | grep -q '<title>PASS' || exit 1
