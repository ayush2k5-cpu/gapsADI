# Starts gapsADI's backend and frontend dev servers, each in its own window.
# Run from anywhere: .\start-gapsadi.ps1

$root = $PSScriptRoot

function Test-PortInUse($port) {
    return $null -ne (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

if (Test-PortInUse 8000) {
    Write-Host "Backend already running on port 8000 - skipping."
} else {
    Write-Host "Starting backend on http://localhost:8000 ..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; & '.\venv\Scripts\python.exe' main.py"
}

if (Test-PortInUse 3000) {
    Write-Host "Frontend already running on port 3000 - skipping."
} else {
    Write-Host "Starting frontend on http://localhost:3000 ..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"
}

Write-Host "Waiting for the frontend to come up..."
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
