$ErrorActionPreference = 'Stop'

$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$databasePath = Join-Path $backendPath 'aiquest-local.db'
$databaseUrl = "sqlite+aiosqlite:///$($databasePath -replace '\\', '/')"
$env:DATABASE_URL = $databaseUrl

Set-Location $backendPath
python -m alembic upgrade head
if ($LASTEXITCODE -ne 0) {
    throw "Database migration failed with exit code $LASTEXITCODE"
}
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
