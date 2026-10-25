# Tiny static file server for previewing the dashboard (localhost only). Serves the repo root: open /site/index.html?demo=1.
param([int]$Port = 8765, [string]$Root = $PSScriptRoot)
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.json' = 'application/json'; '.png' = 'image/png' }
$l = New-Object Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving $Root on http://localhost:$Port/"
while ($l.IsListening) {
  $ctx = $l.GetContext()
  $path = Join-Path $Root ([Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/')))
  if (Test-Path $path -PathType Leaf) {
    $bytes = [IO.File]::ReadAllBytes($path)
    $ctx.Response.ContentType = $types[[IO.Path]::GetExtension($path)]
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else { $ctx.Response.StatusCode = 404 }
  $ctx.Response.Close()
}
