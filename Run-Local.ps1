$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Azharul Hidaya Maths Battle" -ForegroundColor Cyan
Write-Host "This opens the landing page locally. For phone multiplayer, deploy this folder online and configure Supabase first." -ForegroundColor Yellow
$index = Join-Path $root 'index.html'
Start-Process $index
