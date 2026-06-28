#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

# Find Go compiler
$goExe = Get-Command "go.exe" -ErrorAction SilentlyContinue
if (-not $goExe) {
    $candidates = @(
        "$env:ProgramFiles\Go\bin\go.exe",
        "${env:ProgramFiles(x86)}\Go\bin\go.exe",
        "$env:LocalAppData\Programs\Go\bin\go.exe",
        "C:\Go\bin\go.exe"
    )
    foreach ($cand in $candidates) {
        if (Test-Path -LiteralPath $cand) {
            $goExe = Get-Command $cand
            break
        }
    }
}
if (-not $goExe) {
    Write-Error "Go compiler not found.`nInstall from https://go.dev/dl/ or ensure go.exe is in your PATH."
    exit 1
}
Write-Host "=== Go: $($goExe.Source) ==="

# Set GOROOT if not already set (needed for trimmed Go binaries)
if (-not $env:GOROOT) {
    $goRoot = (Get-Item $goExe.Source).Directory.Parent.FullName
    $env:GOROOT = $goRoot
    Write-Host "=== GOROOT: $goRoot ==="
}

# Determine project root and paths
$localPath = (Get-Location).Path
$confFile = Join-Path $localPath "packaging\conf\historytracers.conf"
$srcPath = "$localPath\"
$contentPath = "$localPath\www\"
$logPath = Join-Path $env:TEMP "historytracers-logs"

Write-Host "=== Building publisher ==="
$ldflags = "-X main.confPath=$confFile -X main.srcPath=$srcPath -X main.contentPath=$contentPath -X main.logPath=$logPath"

Push-Location "src\publisher"
try {
    go mod download
    go mod tidy
    go build -ldflags $ldflags -o "..\..\build\historytracers-publisher.exe" .
} finally {
    Pop-Location
}

Write-Host "=== Building viewer ==="
Push-Location "src\viewer"
try {
    go mod download
    go mod tidy
    go build -o "..\..\build\historytracers.exe" .
} finally {
    Pop-Location
}

Write-Host "=== Running publisher ==="
$publisherExe = ".\build\historytracers-publisher.exe"
if (-not (Test-Path -LiteralPath $publisherExe)) {
    Write-Error "$publisherExe not found"
    exit 1
}
& $publisherExe -internal -minify -audiofiles -gedcom -verbose -logfile historytracers.log
Write-Host "=== Publisher run complete (see historytracers.log) ==="
