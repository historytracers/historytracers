<# .SYNOPSIS
    Builds the HistoryTracers MSI installer using WiX Toolset v5.
.DESCRIPTION
    This script uses wix.exe (WiX v5 single-binary toolset) to:
    1. Harvest www/ content (excluding images/) into a WiX fragment
    2. Harvest images/ content (excluding img_options.json) into a WiX fragment
    3. Build the MSI from the .wxs files

    Prerequisites:
      - WiX Toolset v5.x installed (https://wixtoolset.org/)
      - Build directory with historytracers.exe and historytracers-publisher.exe
      - www/ directory populated
.PARAMETER ProjectDir
    Root directory of the project (default: current working directory)
.PARAMETER OutputDir
    Where to place the generated MSI (default: artifacts/ under ProjectDir)
.PARAMETER WixDir
    Directory containing this script and .wxs files (default: packaging/WiX)
.PARAMETER KeepFragments
    If set, keeps the harvested fragment .wxs files after build
.EXAMPLE
    .\build_msi.ps1
    Builds the MSI with defaults (run from repo root).
#>

param(
  [string]$ProjectDir = (Get-Location).Path,
  [string]$OutputDir = (Join-Path $ProjectDir "artifacts"),
  [string]$WixDir = (Join-Path $ProjectDir "packaging\WiX"),
  [switch]$KeepFragments
)

$ErrorActionPreference = "Stop"

# ---- Resolve WiX v5 tool ----
function Find-WixExe {
  $candidates = @(
    "${env:ProgramFiles}\WiX Toolset v5\bin\wix.exe",
    "${env:ProgramFiles(x86)}\WiX Toolset v5\bin\wix.exe",
    "${env:ProgramFiles}\WiX Toolset v5\wix.exe",
    "${env:ProgramFiles(x86)}\WiX Toolset v5\wix.exe",
    "$env:LOCALAPPDATA\WiX Toolset v5\bin\wix.exe"
  )
  if (Test-Path "${env:WIX}wix.exe") { return (Resolve-Path "${env:WIX}wix.exe").Path }
  foreach ($p in $candidates) {
    if (Test-Path $p) { return $p }
  }
  $fromPath = Get-Command "wix.exe" -ErrorAction SilentlyContinue
  if ($fromPath) { return $fromPath.Source }
  return $null
}

$wix = Find-WixExe
if (-not $wix) {
  Write-Error "WiX Toolset v5 not found. Install from https://wixtoolset.org/"
  exit 1
}
Write-Host "WiX Toolset v5 found: $wix"

# ---- Validate required files ----
$viewerExe = Join-Path $ProjectDir "build\historytracers.exe"
$wwwDir = Join-Path $ProjectDir "www"
if (-not (Test-Path $viewerExe)) {
  Write-Error "Viewer binary not found at $viewerExe."
  exit 1
}
if (-not (Test-Path $wwwDir)) {
  Write-Error "www/ directory not found at $wwwDir."
  exit 1
}

# ---- Create output directory ----
if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$wwwHarvest      = Join-Path $WixDir "www-fragment.wxs"
$imgHarvest      = Join-Path $WixDir "images-fragment.wxs"
$excludeImagesXsl = Join-Path $WixDir "exclude-images.xsl"
$excludeOptionsXsl = Join-Path $WixDir "exclude-options.xsl"
$buildDir        = Join-Path $ProjectDir "build"
$wwwSource       = $wwwDir
$imagesSource    = Join-Path $wwwDir "images"
$msiOut          = Join-Path $OutputDir "HistoryTracers-1.0.0.msi"

# ---- Step 1: Harvest www/ content (exclude images/ subtree) ----
Write-Host "Harvesting www/ content (excluding images/)..."
& $wix harvest dir $wwwSource `
    -o $wwwHarvest `
    -cg CG_WWW `
    -drid WWWDIR `
    -var WwwDir `
    -t $excludeImagesXsl
if ($LASTEXITCODE -ne 0) { Write-Error "wix harvest failed for www/"; exit 1 }

# ---- Step 2: Harvest images/ content (exclude img_options.json) ----
Write-Host "Harvesting images/ content..."
& $wix harvest dir $imagesSource `
    -o $imgHarvest `
    -cg CG_IMAGES `
    -drid WWW_IMAGES `
    -var ImagesDir `
    -t $excludeOptionsXsl
if ($LASTEXITCODE -ne 0) { Write-Error "wix harvest failed for images/"; exit 1 }

# ---- Step 3: Build MSI with wix.exe build ----
Write-Host "Building MSI..."
& $wix build $WixDir\historytracers.wxs $wwwHarvest $imgHarvest `
    -o $msiOut `
    -arch x64 `
    -d BuildDir=$buildDir `
    -d WwwDir=$wwwSource `
    -d ImagesDir=$imagesSource
if ($LASTEXITCODE -ne 0) { Write-Error "wix build failed"; exit 1 }

# ---- Cleanup ----
if (-not $KeepFragments) {
  Remove-Item $wwwHarvest -Force -ErrorAction SilentlyContinue
  Remove-Item $imgHarvest -Force -ErrorAction SilentlyContinue
}

Write-Host "MSI built successfully: $msiOut"
