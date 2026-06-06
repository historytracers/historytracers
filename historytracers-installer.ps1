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

Write-Host "=== Building editor ==="
$mingwCandidates = @(
    "C:\msys64\ucrt64\bin\x86_64-w64-mingw32-gcc.exe",
    "C:\msys64\mingw64\bin\x86_64-w64-mingw32-gcc.exe",
    "C:\msys64\mingw32\bin\x86_64-w64-mingw32-gcc.exe",
    "C:\msys64\clang64\bin\x86_64-w64-mingw32-gcc.exe"
)
$mingwGcc = $null
foreach ($cand in $mingwCandidates) {
    if (Test-Path -LiteralPath $cand) {
        $mingwGcc = $cand
        break
    }
}
# Also try PATH
if (-not $mingwGcc) {
    $which = Get-Command "x86_64-w64-mingw32-gcc.exe" -ErrorAction SilentlyContinue
    if ($which) { $mingwGcc = $which.Source }
}
if (-not $mingwGcc) {
    $which = Get-Command "mingw32-gcc.exe" -ErrorAction SilentlyContinue
    if ($which) { $mingwGcc = $which.Source }
}

if ($mingwGcc) {
    $mingwDir = (Get-Item $mingwGcc).Directory.FullName
    $mingwCxx = $mingwGcc -replace 'gcc\.exe$', 'g++.exe'
    if (-not (Test-Path -LiteralPath $mingwCxx)) { $mingwCxx = $mingwGcc }

    $editorLdflags = "-X main.confPath=$confFile -X main.srcPath=$srcPath -X main.contentPath=$contentPath -X main.logPath=$logPath"
    Push-Location "src\editor"
    try {
        $env:CC = $mingwGcc
        $env:CXX = $mingwCxx
        $env:CGO_ENABLED = "1"
        $oldPath = $env:PATH
        $env:PATH = "$env:GOROOT\bin;$mingwDir;$oldPath"
        go mod download
        go mod tidy
        go build -ldflags $editorLdflags -o "..\..\build\historytracers-editor.exe" .
    } finally {
        $env:PATH = $oldPath
        Pop-Location
    }
    Write-Host "=== Editor built successfully ==="
} else {
    Write-Host "=== MinGW-w64 not found; skipping editor build ==="
    Write-Host "    Install MSYS2 with ucrt64 or mingw64 packages, then re-run."
}

Write-Host "=== Running publisher ==="
$publisherExe = ".\build\historytracers-publisher.exe"
if (-not (Test-Path -LiteralPath $publisherExe)) {
    Write-Error "$publisherExe not found"
    exit 1
}
& $publisherExe -internal -minify -audiofiles -gedcom -verbose -logfile historytracers.log
Write-Host "=== Publisher run complete (see historytracers.log) ==="
