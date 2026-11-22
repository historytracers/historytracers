<# .SYNOPSIS
    Builds the HistoryTracers MSI installer using WiX Toolset v5+.
.DESCRIPTION
    This script generates WiX fragment files and builds the MSI installer.
    It supports both WiX v5 (with `wix harvest`) and later versions (manual
    fragment generation).

    Prerequisites:
      - WiX Toolset v5.x or later (https://wixtoolset.org/)
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
  # Check .NET tool install
  $dotnetTool = Get-Command "wix" -ErrorAction SilentlyContinue
  if ($dotnetTool) { return $dotnetTool.Source }
  return $null
}

$wix = Find-WixExe
if (-not $wix) {
  Write-Error "WiX Toolset not found. Install from https://wixtoolset.org/"
  exit 1
}
Write-Host "WiX Toolset found: $wix"

# Detect version (v5 has 'harvest' command, later versions may not)
$hasHarvest = $false
$null = & $wix harvest --help 2>$null
if ($LASTEXITCODE -eq 0) { $hasHarvest = $true }

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

# ---- Read version from WXS ----
$wxsPath = Join-Path $WixDir "historytracers.wxs"
[xml]$wxs = Get-Content $wxsPath -Encoding UTF8
$version = $wxs.Wix.Package.Version
if (-not $version) { $version = "1.0.0.0" }
$versionShort = ($version -split '\.')[0..2] -join '.'
Write-Host "Building version: $version (short: $versionShort)"

# ---- Create output directory ----
if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$wwwHarvest      = Join-Path $WixDir "www-fragment.wxs"
$imgHarvest      = Join-Path $WixDir "images-fragment.wxs"
$buildHarvest    = Join-Path $WixDir "build-fragment.wxs"
$optionsHarvest  = Join-Path $WixDir "options-fragment.wxs"
$excludeImagesXsl = Join-Path $WixDir "exclude-images.xsl"
$excludeOptionsXsl = Join-Path $WixDir "exclude-options.xsl"
$buildDir        = Join-Path $ProjectDir "build"
$wwwSource       = $wwwDir
$imagesSource    = Join-Path $wwwDir "images"
$msiOut          = Join-Path $OutputDir "HistoryTracers-$versionShort.msi"

# ---- Helper: directory-aware ID generation for manual fragments ----
function Get-DirId {
    param([string]$relDir, [hashtable]$knownMap, [hashtable]$generated)
    if ($knownMap.ContainsKey($relDir)) { return $knownMap[$relDir] }
    if ($generated.ContainsKey($relDir)) { return $generated[$relDir].id }
    $parts = $relDir -split '[/\\]'
    $name = $parts[-1]
    $idBase = 'DIR_' + (($relDir -replace '[/\\-]', '_').ToUpper())
    if ($idBase.Length -gt 63) {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($relDir)
        $hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
        $hash = [System.BitConverter]::ToString($hashBytes).Replace('-','').Substring(0,8)
        $idBase = $idBase.Substring(0, 55) + '_' + $hash
    }
    $safeId = $idBase
    if ($safeId -notmatch '^[a-zA-Z_]') { $safeId = '_' + $safeId }
    if ($parts.Length -le 1) {
        $parentRel = ''
    } else {
        $parentParts = $parts[0..($parts.Length-2)]
        $parentRel = $parentParts -join '/'
    }
    $parentId = Get-DirId -relDir $parentRel -knownMap $knownMap -generated $generated
    $generated[$relDir] = @{ id = $safeId; parentId = $parentId; name = $name }
    return $safeId
}

# ---- Helper: generate a simple ID for a file name ----
function Get-FileId {
    param([string]$rel, [string]$prefix)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($rel)
    $hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    $hash = [System.BitConverter]::ToString($hashBytes).Replace('-','').Substring(0,8)
    $raw = $prefix + ($rel -replace '[^a-zA-Z0-9]','_')
    # Cap so that 'fil_' + raw + '_' + 8-char hash <= 72 (WiX identifier limit)
    if ($raw.Length -gt 59) { $raw = $raw.Substring(0, 59) }
    return @{ cid = ($raw + '_' + $hash); fid = ('fil_' + $raw + '_' + $hash) }
}

# ---- Step 0: Generate build-fragment.wxs (build/ dir -> INSTALLDIR) ----
Write-Host "Generating build/ fragment..."
$buildFiles = Get-ChildItem -File $buildDir
$lines = @()
$lines += '<?xml version="1.0" encoding="utf-8"?>'
$lines += "<Wix xmlns='http://wixtoolset.org/schemas/v4/wxs'>"
$lines += "  <Fragment>"
$lines += "    <ComponentGroup Id='CG_MAIN_BIN'>"
foreach ($f in $buildFiles | Where-Object { $_.Name -ne 'historytracers-publisher.exe' -and $_.Name -ne 'historytracers-editor.exe' }) {
    $ids = Get-FileId -rel $f.Name -prefix 'cmp_bin_'
    $wixSrc = '$(var.BuildDir)\' + $f.Name
    $lines += "      <Component Id='$($ids.cid)' Directory='INSTALLDIR' Guid='*'><File Id='$($ids.fid)' Source='$wixSrc'/></Component>"
}
$lines += "    </ComponentGroup>"
$pubFile = $buildFiles | Where-Object { $_.Name -eq 'historytracers-publisher.exe' }
if ($pubFile) {
    $ids = Get-FileId -rel $pubFile.Name -prefix 'cmp_bin_'
    $wixSrc = '$(var.BuildDir)\' + $pubFile.Name
    $lines += "    <ComponentGroup Id='CG_PUBLISHER_BIN'>"
    $lines += "      <Component Id='$($ids.cid)' Directory='INSTALLDIR' Guid='*'><File Id='$($ids.fid)' Source='$wixSrc'/></Component>"
    $lines += "    </ComponentGroup>"
}
$lines += "  </Fragment>"
$lines += '</Wix>'
[System.IO.File]::WriteAllText($buildHarvest, ($lines -join "`r`n"), [System.Text.UTF8Encoding]::new($false))
if (-not (Test-Path $buildHarvest)) {
    Write-Error "Failed to generate build-fragment.wxs"
    exit 1
}

# Editor fragment generation skipped -- editor not shipped in this release

# ---- Step 0b: Generate options-fragment.wxs (img_options.json -> WWW_IMAGES) ----
Write-Host "Generating options fragment..."
$optionsFile = Join-Path $wwwSource "images\img_options.json"
if (Test-Path $optionsFile) {
    $ids = Get-FileId -rel 'img_options.json' -prefix 'cmp_opt_'
    $wixSrc = '$(var.WwwDir)\images\img_options.json'
    $lines = @()
    $lines += '<?xml version="1.0" encoding="utf-8"?>'
    $lines += "<Wix xmlns='http://wixtoolset.org/schemas/v4/wxs'>"
    $lines += "  <Fragment>"
    $lines += "    <ComponentGroup Id='CG_OPTIONS'>"
    $lines += "      <Component Id='$($ids.cid)' Directory='WWW_IMAGES' Guid='*'><File Id='$($ids.fid)' Source='$wixSrc'/></Component>"
    $lines += "    </ComponentGroup>"
    $lines += "  </Fragment>"
    $lines += '</Wix>'
    [System.IO.File]::WriteAllText($optionsHarvest, ($lines -join "`r`n"), [System.Text.UTF8Encoding]::new($false))
}
if (-not (Test-Path $optionsHarvest)) {
    Write-Error "Failed to generate options-fragment.wxs"
    exit 1
}

# ---- Step 1: Harvest www/ content (exclude images/) ----
Write-Host "Harvesting www/ content..."
if ($hasHarvest) {
    & $wix harvest dir $wwwSource `
        -o $wwwHarvest `
        -cg CG_WWW `
        -drid WWWDIR `
        -var WwwDir `
        -t $excludeImagesXsl
    if ($LASTEXITCODE -ne 0) { Write-Error "wix harvest failed for www/"; exit 1 }
} else {
    # Manual fragment generation for versions without `wix harvest`
    $excludeDirs = @('images')
    $knownDirMap = @{
        ''        = 'WWWDIR'
        'bodies'  = 'WWW_BODIES'
        'css'     = 'WWW_CSS'
        'csv'     = 'WWW_CSV'
        'gedcom'  = 'WWW_GEDCOM'
        'js'      = 'WWW_JS'
        'lang'    = 'WWW_LANG'
        'webfonts' = 'WWW_WEBFONTS'
        'images'  = 'WWW_IMAGES'
    }
    $generatedDirIds = @{}
    $componentLines = @()

    Get-ChildItem -Recurse -File $wwwSource | Where-Object {
        $rel = $_.FullName.Substring($wwwSource.Length+1).Replace('\','/')
        $topDir = ($rel -split '/')[0]
        $topDir -notin $excludeDirs
    } | ForEach-Object {
        $rel = $_.FullName.Substring($wwwSource.Length+1).Replace('\','/')
        $relDir = [System.IO.Path]::GetDirectoryName($rel).Replace('\','/')
        if ($relDir -eq '.') { $relDir = '' }
        $dirId = Get-DirId -relDir $relDir -knownMap $knownDirMap -generated $generatedDirIds

        $ids = Get-FileId -rel $rel -prefix 'cmp_'
        $src = "`$(var.WwwDir)\$rel"
        $componentLines += "    <Component Id='$($ids.cid)' Directory='$dirId' Guid='*'><File Id='$($ids.fid)' Source='$src'/></Component>"
    }

    $lines = @()
    $lines += '<?xml version="1.0" encoding="utf-8"?>'
    $lines += "<Wix xmlns='http://wixtoolset.org/schemas/v4/wxs'>"
    $lines += "  <Fragment>"
    $sortedDirKeys = $generatedDirIds.Keys | Sort-Object
    foreach ($key in $sortedDirKeys) {
        $dir = $generatedDirIds[$key]
        $lines += "    <DirectoryRef Id='$($dir.parentId)'><Directory Id='$($dir.id)' Name='$($dir.name)' /></DirectoryRef>"
    }
    $lines += "    <ComponentGroup Id='CG_WWW'>"
    $lines += $componentLines -join "`r`n"
    $lines += "    </ComponentGroup>"
    $lines += "  </Fragment>"
    $lines += '</Wix>'
    [System.IO.File]::WriteAllText($wwwHarvest, ($lines -join "`r`n"), [System.Text.UTF8Encoding]::new($false))
}
if (-not (Test-Path $wwwHarvest)) {
    Write-Error "Failed to generate www-fragment.wxs"
    exit 1
}

# ---- Step 2: Harvest images/ content (exclude img_options.json and READMEs) ----
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
    # Manual fragment generation for versions without `wix harvest`
    $knownDirMap = @{ '' = 'WWW_IMAGES' }
    $generatedDirIds = @{}
    $componentLines = @()

    Get-ChildItem -Recurse -File $imagesSource | Where-Object {
        $_.Name -ne 'img_options.json' -and $_.Name -notmatch '^README'
    } | ForEach-Object {
        $rel = $_.FullName.Substring($imagesSource.Length+1).Replace('\','/')
        $relDir = [System.IO.Path]::GetDirectoryName($rel).Replace('\','/')
        if ($relDir -eq '.') { $relDir = '' }
        $dirId = Get-DirId -relDir $relDir -knownMap $knownDirMap -generated $generatedDirIds

        $ids = Get-FileId -rel $rel -prefix 'cmp_img_'
        $src = "`$(var.ImagesDir)\$rel"
        $componentLines += "    <Component Id='$($ids.cid)' Directory='$dirId' Guid='*'><File Id='$($ids.fid)' Source='$src'/></Component>"
    }

    $lines = @()
    $lines += '<?xml version="1.0" encoding="utf-8"?>'
    $lines += "<Wix xmlns='http://wixtoolset.org/schemas/v4/wxs'>"
    $lines += "  <Fragment>"
    $sortedDirKeys = $generatedDirIds.Keys | Sort-Object
    foreach ($key in $sortedDirKeys) {
        $dir = $generatedDirIds[$key]
        $lines += "    <DirectoryRef Id='$($dir.parentId)'><Directory Id='$($dir.id)' Name='$($dir.name)' /></DirectoryRef>"
    }
    $lines += "    <ComponentGroup Id='CG_IMAGES'>"
    $lines += $componentLines -join "`r`n"
    $lines += "    </ComponentGroup>"
    $lines += "  </Fragment>"
    $lines += '</Wix>'
    [System.IO.File]::WriteAllText($imgHarvest, ($lines -join "`r`n"), [System.Text.UTF8Encoding]::new($false))
}
if (-not (Test-Path $imgHarvest)) {
    Write-Error "Failed to generate images-fragment.wxs"
    exit 1
}

# ---- Step 3: Build MSI with wix build ----
Write-Host "Building MSI..."
& $wix build $WixDir\historytracers.wxs $wwwHarvest $imgHarvest $buildHarvest $optionsHarvest `
    -o $msiOut `
    -arch x64 `
    -d BuildDir=$buildDir `
    -d WwwDir=$wwwSource `
    -d ImagesDir=$imagesSource `
    -d ProjectDir=$ProjectDir
if ($LASTEXITCODE -ne 0) { Write-Error "wix build failed"; exit 1 }

# ---- Cleanup ----
if (-not $KeepFragments) {
  Remove-Item $wwwHarvest -Force -ErrorAction SilentlyContinue
  Remove-Item $imgHarvest -Force -ErrorAction SilentlyContinue
  Remove-Item $buildHarvest -Force -ErrorAction SilentlyContinue
  Remove-Item $optionsHarvest -Force -ErrorAction SilentlyContinue
}

Write-Host "MSI built successfully: $msiOut"
