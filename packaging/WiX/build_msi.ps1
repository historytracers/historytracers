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
  if (-not [string]::IsNullOrEmpty($env:WIX) -and (Test-Path (Join-Path $env:WIX "wix.exe"))) { return (Resolve-Path (Join-Path $env:WIX "wix.exe")).Path }
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
$buildHarvest    = Join-Path $WixDir "build-fragment.wxs"
$optionsHarvest  = Join-Path $WixDir "options-fragment.wxs"
#$editorHarvest   = Join-Path $WixDir "editor-fragment.wxs"
$excludeImagesXsl = Join-Path $WixDir "exclude-images.xsl"
$excludeOptionsXsl = Join-Path $WixDir "exclude-options.xsl"
$buildDir        = Join-Path $ProjectDir "build"
$wwwSource       = $wwwDir
$imagesSource    = Join-Path $wwwDir "images"
# Derive the MSI version from packaging/Slackware/historytracers.info (single
# source of truth), falling back to configure.ac and then to 1.0.0.
$msiVersion = "1.0.0"
$infoFile = Join-Path $ProjectDir "packaging\Slackware\historytracers.info"
if (Test-Path $infoFile) {
  $m = Select-String -Path $infoFile -Pattern '^VERSION\s*=\s*"([^"]+)"' | Select-Object -First 1
  if ($m -and $m.Matches[0].Groups[1].Value) { $msiVersion = $m.Matches[0].Groups[1].Value }
} else {
  $acFile = Join-Path $ProjectDir "configure.ac"
  if (Test-Path $acFile) {
    $m = Select-String -Path $acFile -Pattern 'AC_INIT\([^,]+,\s*\[([0-9][0-9.]*)\]' | Select-Object -First 1
    if ($m -and $m.Matches[0].Groups[1].Value) { $msiVersion = $m.Matches[0].Groups[1].Value }
  }
}
# Output one installer per project language (en-US keeps the plain
# HistoryTracers.msi name used in the packaging READMEs); ProductVersion
# still carries $msiVersion inside the MSI metadata.
$MsiLanguages = @("en-US", "es-ES", "pt-BR")
$MsiNames      = @{
  "en-US" = "HistoryTracers.msi"
  "es-ES" = "HistoryTracers-es-ES.msi"
  "pt-BR" = "HistoryTracers-pt-BR.msi"
}
$LicenseRtfs   = @{
  "en-US" = "$WixDir\gpl3.rtf"
  "es-ES" = "$WixDir\gpl3.es-ES.rtf"
  "pt-BR" = "$WixDir\gpl3.pt-BR.rtf"
}

# ---- Ensure UI extension (provides the WixUI install wizard screens) ----
$uiExtName = "WixToolset.UI.wixext"
$extensionList = & $wix extension list -g 2>$null
if (($extensionList -join "`n") -notmatch [regex]::Escape($uiExtName)) {
    # Extension version must match the wix.exe version (e.g. 6.0.1 -> 6.0.1)
    $wixVer = (& $wix --version) -replace '^[v]?', ''
    & $wix extension add -g "$uiExtName/$wixVer"
    if ($LASTEXITCODE -ne 0) {
        # Fall back to whatever the feed serves for this toolset
        & $wix extension add -g $uiExtName
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Could not install $uiExtName extension (required for the installer UI screens). Try: wix extension add -g $uiExtName"
        exit 1
    }
    Write-Host "Installed $uiExtName extension"
}
$uiExtArgs = @("-ext", "WixToolset.UI.wixext")

# ---- Helper: directory-aware ID generation for v6 fragments ----
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

# ---- Helper: generate a simple ID for a file name (used by v6 fragments) ----
function Get-FileId {
    param([string]$rel, [string]$prefix)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($rel)
    $hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
    $hash = [System.BitConverter]::ToString($hashBytes).Replace('-','').Substring(0,8)
    $raw = $prefix + ($rel -replace '[^a-zA-Z0-9]','_')
    if ($raw.Length -gt 63) { $raw = $raw.Substring(0, 63) }
    return @{ cid = ($raw + '_' + $hash); fid = ('fil_' + $raw + '_' + $hash) }
}

# ---- Step 0: Generate build-fragment.wxs (build/ dir → INSTALLDIR) ----
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
$lines -join "`r`n" | Set-Content $buildHarvest -NoNewline -Encoding UTF8
if (-not (Test-Path $buildHarvest)) {
    Write-Error "Failed to generate build-fragment.wxs"
    exit 1
}

# Editor fragment generation skipped — editor not shipped in this release
# See commit history for the full editor-fragment.wxs generation block

# ---- Step 0b: Generate options-fragment.wxs (img_options.json → WWW_IMAGES) ----
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
    $lines -join "`r`n" | Set-Content $optionsHarvest -NoNewline -Encoding UTF8
}
if (-not (Test-Path $optionsHarvest)) {
    Write-Error "Failed to generate options-fragment.wxs"
    exit 1
}
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
        -not ($excludeDirs | Where-Object { $rel -eq $_ -or $rel.StartsWith("$_/") })
    } | ForEach-Object {
        $rel = $_.FullName.Substring($wwwSource.Length+1).Replace('\','/')
        $relDir = [System.IO.Path]::GetDirectoryName($rel).Replace('\','/')
        if ($relDir -eq '.') { $relDir = '' }
        $dirId = Get-DirId -relDir $relDir -knownMap $knownDirMap -generated $generatedDirIds

        $bytes = [System.Text.Encoding]::UTF8.GetBytes($rel)
        $hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
        $hash = [System.BitConverter]::ToString($hashBytes).Replace('-','').Substring(0,8)
        $raw = 'cmp_' + ($rel -replace '[^a-zA-Z0-9]','_')
        if ($raw.Length -gt 63) { $raw = $raw.Substring(0, 63) }
        $cid = $raw + '_' + $hash
        $fid = 'fil_' + ($rel -replace '[^a-zA-Z0-9]','_')
        if ($fid.Length -gt 63) { $fid = $fid.Substring(0, 63) }
        $fid = $fid + '_' + $hash
        $src = "`$(var.WwwDir)\" + $rel.Replace('/','\')
        $componentLines += "    <Component Id='$cid' Directory='$dirId' Guid='*'><File Id='$fid' Source='$src'/></Component>"
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
    $lines -join "`r`n" | Set-Content $wwwHarvest -NoNewline -Encoding UTF8
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
    $knownDirMap = @{ '' = 'WWW_IMAGES' }
    $generatedDirIds = @{}
    $componentLines = @()

    Get-ChildItem -Recurse -File $imagesSource | Where-Object { $_.Name -ne 'img_options.json' } | ForEach-Object {
        $rel = $_.FullName.Substring($imagesSource.Length+1).Replace('\','/')
        $relDir = [System.IO.Path]::GetDirectoryName($rel).Replace('\','/')
        if ($relDir -eq '.') { $relDir = '' }
        $dirId = Get-DirId -relDir $relDir -knownMap $knownDirMap -generated $generatedDirIds

        $bytes = [System.Text.Encoding]::UTF8.GetBytes($rel)
        $hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
        $hash = [System.BitConverter]::ToString($hashBytes).Replace('-','').Substring(0,8)
        $raw = 'cmp_img_' + ($rel -replace '[^a-zA-Z0-9]','_')
        if ($raw.Length -gt 62) { $raw = $raw.Substring(0, 62) }
        $cid = $raw + '_' + $hash
        $fid = 'fil_img_' + ($rel -replace '[^a-zA-Z0-9]','_')
        if ($fid.Length -gt 62) { $fid = $fid.Substring(0, 62) }
        $fid = $fid + '_' + $hash
        $src = "`$(var.ImagesDir)\" + $rel.Replace('/','\')
        $componentLines += "    <Component Id='$cid' Directory='$dirId' Guid='*'><File Id='$fid' Source='$src'/></Component>"
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
    $lines -join "`r`n" | Set-Content $imgHarvest -NoNewline -Encoding UTF8
}
if (-not (Test-Path $imgHarvest)) {
    Write-Error "Failed to generate images-fragment.wxs"
    exit 1
}

# ---- Step 3: Build MSIs (one per project language; -culture also picks the
#      matching WixUI built-in strings, e.g. es-ES -> ProductLanguage 3082) ----
foreach ($culture in $MsiLanguages) {
    Write-Host "Building MSI ($culture)..."
    & $wix build $WixDir\historytracers.wxs $wwwHarvest $imgHarvest $buildHarvest $optionsHarvest `
        @uiExtArgs `
        -culture $culture `
        -loc $WixDir\HistoryTracers.$culture.wxl `
        -o (Join-Path $OutputDir $MsiNames[$culture]) `
        -arch x64 `
        -pdbtype none `
        -d MsiVersion=$msiVersion `
        -d BuildDir=$buildDir `
        -d WwwDir=$wwwSource `
        -d ImagesDir=$imagesSource `
        -d ProjectDir=$ProjectDir `
        -d LicenseRtf=$($LicenseRtfs[$culture])
    if ($LASTEXITCODE -ne 0) { Write-Error "wix build failed for $culture"; exit 1 }
}

# ---- Cleanup ----
if (-not $KeepFragments) {
  Remove-Item $wwwHarvest -Force -ErrorAction SilentlyContinue
  Remove-Item $imgHarvest -Force -ErrorAction SilentlyContinue
  Remove-Item $buildHarvest -Force -ErrorAction SilentlyContinue
  Remove-Item $optionsHarvest -Force -ErrorAction SilentlyContinue
  #Remove-Item $editorHarvest -Force -ErrorAction SilentlyContinue
}

Write-Host "MSI built successfully: $msiOut"
