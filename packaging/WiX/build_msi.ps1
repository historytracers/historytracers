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

# ---- Resolve WiX Toolset ----
function Find-WixExe {
  $candidates = @(
    "${env:ProgramFiles}\WiX Toolset v5\bin\wix.exe",
    "${env:ProgramFiles(x86)}\WiX Toolset v5\bin\wix.exe",
    "${env:ProgramFiles}\WiX Toolset v5\wix.exe",
    "${env:ProgramFiles(x86)}\WiX Toolset v5\wix.exe",
    "$env:LOCALAPPDATA\WiX Toolset v5\bin\wix.exe",
    "${env:ProgramFiles}\WiX Toolset v6\bin\wix.exe",
    "${env:ProgramFiles(x86)}\WiX Toolset v6\bin\wix.exe",
    "${env:ProgramFiles}\WiX Toolset v6.0\bin\wix.exe",
    "${env:ProgramFiles(x86)}\WiX Toolset v6.0\bin\wix.exe"
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
  Write-Error "WiX Toolset not found. Install from https://wixtoolset.org/"
  exit 1
}
Write-Host "WiX Toolset found: $wix"

# Detect version (v5 has 'harvest' command, v6 does not)
$hasHarvest = $false
$null = & $wix harvest --help 2>$null
if ($LASTEXITCODE -eq 0) { $hasHarvest = $true }

# Determine namespace
$wixNs = "http://wixtoolset.org/schemas/v4/wxs"
if ($hasHarvest) { $wixNs = "http://wixtoolset.org/schemas/v5/wxs" }

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
if ($hasHarvest) {
    & $wix harvest dir $wwwSource `
        -o $wwwHarvest `
        -cg CG_WWW `
        -drid WWWDIR `
        -var WwwDir `
        -t $excludeImagesXsl
    if ($LASTEXITCODE -ne 0) { Write-Error "wix harvest failed for www/"; exit 1 }
} else {
    # WiX v6: generate fragment WXS by enumerating files
    $excludeDirs = @('images','Images')
    $xml = '<?xml version="1.0" encoding="utf-8"?>'
    $xml += "<Wix xmlns='$wixNs'><Fragment><ComponentGroup Id='CG_WWW' Directory='WWWDIR'>`n"
    $lines = Get-ChildItem -Recurse -File $wwwSource | Where-Object {
        $rel = $_.FullName.Substring($wwwSource.Length+1).Replace('\','/')
        -not ($excludeDirs | Where-Object { $rel.StartsWith("$_/") -or $rel.StartsWith("$_`\") })
    } | ForEach-Object {
        $rel = $_.FullName.Substring($wwwSource.Length+1)
        $cid = 'cmp_' + ($rel -replace '[^a-zA-Z0-9]','_')
        $src = "`$(var.WwwDir)\$rel"
        "  <Component Id='$cid' Guid='*'><File Source='$src'/></Component>`n"
    }
    $lines | Set-Content $wwwHarvest -NoNewline
    Add-Content $wwwHarvest '</ComponentGroup></Fragment></Wix>'
}
if (-not (Test-Path $wwwHarvest)) {
    Write-Error "Failed to generate www-fragment.wxs"
    exit 1
}

# ---- Step 2: Harvest images/ content (exclude img_options.json) ----
Write-Host "Harvesting images/ content..."
if ($hasHarvest) {
    & $wix harvest dir $imagesSource `
        -o $imgHarvest `
        -cg CG_IMAGES `
        -drid WWW_IMAGES `
        -var ImagesDir `
        -t $excludeOptionsXsl
    if ($LASTEXITCODE -ne 0) { Write-Error "wix harvest failed for images/"; exit 1 }
} else {
    # WiX v6: generate images fragment WXS
    $xml = '<?xml version="1.0" encoding="utf-8"?>'
    $xml += "<Wix xmlns='$wixNs'><Fragment><ComponentGroup Id='CG_IMAGES' Directory='WWW_IMAGES'>`n"
    $lines = Get-ChildItem -Recurse -File $imagesSource | Where-Object { $_.Name -ne 'img_options.json' } | ForEach-Object {
        $rel = $_.FullName.Substring($imagesSource.Length+1)
        $cid = 'cmp_img_' + ($rel -replace '[^a-zA-Z0-9]','_')
        $src = "`$(var.ImagesDir)\$rel"
        "  <Component Id='$cid' Guid='*'><File Source='$src'/></Component>`n"
    }
    $lines | Set-Content $imgHarvest -NoNewline
    Add-Content $imgHarvest '</ComponentGroup></Fragment></Wix>'
}
if (-not (Test-Path $imgHarvest)) {
    Write-Error "Failed to generate images-fragment.wxs"
    exit 1
}

# ---- Patch namespace in historytracers.wxs if needed ----
if (-not $hasHarvest) {
    $wxsFile = Join-Path $WixDir "historytracers.wxs"
    (Get-Content $wxsFile) -replace 'http://wixtoolset.org/schemas/v5/wxs','http://wixtoolset.org/schemas/v4/wxs' | Set-Content $wxsFile
}

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

# Restore namespace if we patched it
if (-not $hasHarvest) {
    $wxsFile = Join-Path $WixDir "historytracers.wxs"
    (Get-Content $wxsFile) -replace 'http://wixtoolset.org/schemas/v4/wxs','http://wixtoolset.org/schemas/v5/wxs' | Set-Content $wxsFile
}

Write-Host "MSI built successfully: $msiOut"
