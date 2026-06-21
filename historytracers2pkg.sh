#!/bin/bash

# SPDX-License-Identifier: GPL-3.0-or-later
#
# Script used to generate History Tracers package

set -e

MAKERPM="0"
MAKEDEB="0"
MAKESLACKWARE="0"
MAKEMSI="0"

ht_compile() {
    echo "Formating and publishing content"

    if [ ! -d artifacts ]; then
        mkdir artifacts;
    else
        rm -rf artifacts/*
    fi

    # Clean everything
    if [ -d build ]; then
        make maintainer-clean
    fi
    rm -rf build-aux autom4te.cache aclocal.m4 configure config.h.in config.h config.log config.status Makefile.in Makefile

    if [ ! -d audios ]; then
        mkdir audios;
    fi

    # Compile history tracers
    autoreconf -f -i
    ./configure
    make all

    # Run History Tracers publisher
    ./build/historytracers-publisher -minify -audiofiles -gedcom -verbose -conf ./packaging/build_historytracers.conf >> historytracers.log 2> >(tee -a historytracers.log >&2)
}

ht_validate_myself() {
    shellcheck -x ./ht2pkg.sh
}

ht_usage() {
    cat <<HTDOC
        bash ht2pkg.sh [OPTIONS]

        --deb, -d               Create Debian package
        --rpm, -r               Create RPM package
        --slackbuild, -s        Create SlackBuilds files
        --msi, -m               Create MSI package (Windows/MSYS only)
        --validate, -v          Check if current script has issues.
        --help, -h              Show this Help
HTDOC
}

ht_rpm_cleanup() {
    if [ -f images/img_options.json ]; then
        sed -i 's/"ht_local_images" : false/"ht_local_images" : true/' images/img_options.json 2>/dev/null || true
    fi
    if [ -d rpmbuild ]; then
        rm -rf rpmbuild
    fi
}

ht_build_rpm() {
    trap ht_rpm_cleanup ERR

    # Install depencies
    # dnf update
    # dnf install -y rpmdevtools rpm-build make gcc golang autoconf automake which && dnf clean all
    echo "Building RPM package"

    # Modify img_options.json in source to set ht_local_images to false for package
    if [ -f images/img_options.json ]; then
        sed -i 's/"ht_local_images" : true/"ht_local_images" : false/' images/img_options.json
    fi

    RPM_TOPDIR="$(pwd)/rpmbuild"

    # Build Package
    rpmbuild -bb ./packaging/RPM/historytracers.spec \
        --define "_sourcedir $(pwd)" \
        --define "_builddir $(pwd)" \
        --define "_srcrpmdir ${RPM_TOPDIR}" \
        --define "_rpmdir ${RPM_TOPDIR}" \
        --define "_topdir ${RPM_TOPDIR}" #\
#        --define "_build_name_fmt %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm"

    # Restore original img_options.json for development
    if [ -f images/img_options.json ]; then
        sed -i 's/"ht_local_images" : false/"ht_local_images" : true/' images/img_options.json
    fi

    # Copy all generated RPMs (main x86_64, images/devel noarch)
    find "${RPM_TOPDIR}" -name "*.rpm" -exec cp {} artifacts/ \;
    rm -rf rpmbuild

    trap - ERR
}

ht_deb_cleanup() {
    if [ -f images/img_options.json ]; then
        sed -i 's/"ht_local_images" : false/"ht_local_images" : true/' images/img_options.json 2>/dev/null || true
    fi
    if [ -d debian ]; then
        rm -rf debian
    fi
}

ht_build_deb() {
    trap ht_deb_cleanup ERR

    echo "Building DEB package"
    # Install dependencies
    # apt-get update
    # apt-get install devscripts debhelper build-essential golang-go
    # snap install go --classic (Ubuntu)

    # Modify img_options.json in source to set ht_local_images to false for package
    if [ -f images/img_options.json ]; then
        sed -i 's/"ht_local_images" : true/"ht_local_images" : false/' images/img_options.json
    fi

    if [ -d debian ]; then
        rm -rf debian
    fi
    cp -R packaging/Debian/ debian
    chmod +x debian/rules
    cp packaging/service/historytracers.service debian/historytracers.service

    dpkg-buildpackage -us -uc --build=binary

    # Restore original img_options.json for development
    if [ -f images/img_options.json ]; then
        sed -i 's/"ht_local_images" : false/"ht_local_images" : true/' images/img_options.json
    fi

    mv ../*.deb artifacts/
    # .ddeb (debug) files may not exist; guard against glob failure
    set +e
    mv ../*.ddeb artifacts/ 2>/dev/null
    set -e

    rm -rf debian

    trap - ERR
}

ht_build_slackware() {
    echo "Building Slackware packages"

    # shellcheck source=./packaging/Slackware/historytracers.info
    source packaging/Slackware/historytracers.info

    local DST
    DST="historytracers-${VERSION}"

    # Clean up any previous temp dirs
    rm -rf historytracers historytracers-images "${DST}"

    # ===== Main SlackBuild tarball =====
    mkdir historytracers
    cp packaging/Slackware/* historytracers
    cp README historytracers/
    tar -zcvf artifacts/historytracers.tar.gz historytracers
    rm -rf historytracers

    # ===== Images tarball =====
    mkdir -p historytracers-images/images
    for item in images/*; do
        base=$(basename "$item")
        [ "$base" = "img_options.json" ] && continue
        cp -r "$item" historytracers-images/images/
    done
    tar -zcvf "artifacts/historytracers-images-${VERSION}.tar.gz" historytracers-images
    rm -rf historytracers-images

    # ===== Common source tarball used by both =====
    make clean

    mkdir -p "${DST}/www"
    cp -R ./*.md LICENSE Makefile.am README bodies configure.ac css csv gedcom historytracers-installer.sh historytracers2pkg.sh index.html js lang packaging scripts src webfonts "${DST}"
    mkdir -p "${DST}/images"
    cp images/img_options.json "${DST}/images/"
    tar -acvf "artifacts/historytracers-${VERSION}.tar.xz" "${DST}"

    rm -rf "${DST}"
}

ht_is_msys() {
    case "$(uname -s)" in
        MINGW*|MSYS*|CYGWIN*) return 0 ;;
        *) return 1 ;;
    esac
}

ht_is_slackware() {
    if [ -f /etc/slackware-version ]; then
        return 0
    fi
    if [ -f /etc/os-release ] && grep -qi "slackware" /etc/os-release 2>/dev/null; then
        return 0
    fi
    return 1
}

ht_msi_cleanup() {
    if [ -f images/img_options.json ]; then
        sed -i 's/"ht_local_images" : false/"ht_local_images" : true/' images/img_options.json 2>/dev/null || true
    fi
    rm -rf "${WIXDIR}/www-fragment.wxs" "${WIXDIR}/images-fragment.wxs" \
           "${WIXDIR}/editor-fragment.wxs" 2>/dev/null || true
}

ht_build_msi() {
    trap ht_msi_cleanup ERR

    echo "Building MSI package"

    if ! ht_is_msys; then
        echo "ERROR: MSI package can only be built in a Windows (MSYS/MinGW) environment."
        exit 1
    fi

    # Modify img_options.json in source to set ht_local_images to false for package
    if [ -f images/img_options.json ]; then
        sed -i 's/"ht_local_images" : true/"ht_local_images" : false/' images/img_options.json
    fi

    WIXDIR="$(pwd)/packaging/WiX"

    if [ ! -f "${WIXDIR}/historytracers.wxs" ]; then
        echo "ERROR: historytracers.wxs not found at ${WIXDIR}"
        exit 1
    fi

    # Locate WiX Toolset (single wix.exe replaces candle/light/heat)
    WIXEXE=""
    if [ -n "$WIX" ] && [ -f "${WIX}/wix.exe" ]; then
        WIXEXE="${WIX}/wix.exe"
    else
        # On MSYS2, use cygpath to resolve Windows paths; fall back to direct MSYS paths
        if command -v cygpath >/dev/null 2>&1; then
            for p in "C:/Program Files/WiX Toolset v5/bin/wix.exe" \
                     "C:/Program Files (x86)/WiX Toolset v5/bin/wix.exe" \
                     "C:/Program Files/WiX Toolset v6/bin/wix.exe" \
                     "C:/Program Files (x86)/WiX Toolset v6/bin/wix.exe" \
                     "C:/Program Files/WiX Toolset v6.0/bin/wix.exe" \
                     "C:/Program Files (x86)/WiX Toolset v6.0/bin/wix.exe"; do
                up="$(cygpath -u "$p" 2>/dev/null)"
                if [ -n "$up" ] && [ -f "$up" ]; then
                    WIXEXE="$up"
                    break
                fi
            done
        else
            for p in "/c/Program Files/WiX Toolset v5/bin/wix.exe" \
                     "/c/Program Files (x86)/WiX Toolset v5/bin/wix.exe" \
                     "/c/Program Files/WiX Toolset v6/bin/wix.exe" \
                     "/c/Program Files (x86)/WiX Toolset v6/bin/wix.exe" \
                     "/c/Program Files/WiX Toolset v6.0/bin/wix.exe" \
                     "/c/Program Files (x86)/WiX Toolset v6.0/bin/wix.exe"; do
                if [ -f "$p" ]; then
                    WIXEXE="$p"
                    break
                fi
            done
        fi
        if [ -z "$WIXEXE" ]; then
            # Search with PowerShell (try v5 then v6)
            WIXEXE=$(powershell.exe -NoProfile -Command "
                try {
                    \$p = Get-Command 'wix.exe' -ErrorAction Stop;
                    Write-Output (\$p.Source)
                } catch {
                    \$paths = @(
                        \"\${env:ProgramFiles}\WiX Toolset v5\bin\wix.exe\",
                        \"\${env:ProgramFiles(x86)}\WiX Toolset v5\bin\wix.exe\",
                        \"\${env:ProgramFiles}\WiX Toolset v6\bin\wix.exe\",
                        \"\${env:ProgramFiles(x86)}\WiX Toolset v6\bin\wix.exe\",
                        \"\${env:ProgramFiles}\WiX Toolset v6.0\bin\wix.exe\",
                        \"\${env:ProgramFiles(x86)}\WiX Toolset v6.0\bin\wix.exe\"
                    );
                    \$found = \$paths | Where-Object { Test-Path \$_ } | Select-Object -First 1;
                    if (\$found) { Write-Output \$found } else { Write-Output '' }
                }
            " 2>/dev/null | tr -d '\r')
        fi
    fi

    if [ -z "$WIXEXE" ] || [ ! -f "$WIXEXE" ]; then
        echo "ERROR: WiX Toolset not found."
        echo "Install WiX Toolset from https://wixtoolset.org/"
        echo "and ensure wix.exe is in PATH."
        exit 1
    fi

    echo "WiX Toolset found: ${WIXEXE}"

    # Detect WiX version (v5 has 'harvest' command, v6 does not)
    WIX_HAS_HARVEST=false
    if "$WIXEXE" harvest --help >/dev/null 2>&1; then
        WIX_HAS_HARVEST=true
    fi

    PROJECT_DIR="$(pwd)"
    BUILD_DIR="${PROJECT_DIR}/build"
    WWW_DIR="${PROJECT_DIR}/www"
    IMAGES_DIR="${WWW_DIR}/images"
    OUTPUT_MSI="${PROJECT_DIR}/artifacts/HistoryTracers-1.0.0.msi"

    # Write PowerShell fragment generator to a temp file (avoids bash escaping issues)
    PS_GEN="$(mktemp -t wix_gen_XXXXXX.ps1 2>/dev/null || echo "${TMPDIR:-/tmp}/wix_gen_$$.ps1")"
    cat > "$PS_GEN" << 'PSEOF'
param([string]$dir, [string]$out, [string]$ns, [string]$cgId, [string]$dirRef, [string]$varName, [string]$excludeDirs)
$excludeList = if ($excludeDirs) { $excludeDirs -split ';' } else { @() }

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

$knownDirMap = @{ '' = $dirRef }
if ($dirRef -eq 'WWWDIR') {
    $knownDirMap['bodies'] = 'WWW_BODIES'
    $knownDirMap['css'] = 'WWW_CSS'
    $knownDirMap['csv'] = 'WWW_CSV'
    $knownDirMap['gedcom'] = 'WWW_GEDCOM'
    $knownDirMap['js'] = 'WWW_JS'
    $knownDirMap['lang'] = 'WWW_LANG'
    $knownDirMap['webfonts'] = 'WWW_WEBFONTS'
    $knownDirMap['images'] = 'WWW_IMAGES'
}
$generatedDirIds = @{}
$componentLines = @()

Get-ChildItem -Recurse -File $dir | Where-Object {
    $rel = $_.FullName.Substring($dir.Length+1).Replace('\','/')
    if ($excludeList.Count -gt 0) {
        -not ($excludeList | Where-Object { $rel -eq $_ -or $rel.StartsWith("$_/") })
    } else { $true }
} | ForEach-Object {
    $rel = $_.FullName.Substring($dir.Length+1).Replace('\','/')
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
    $src = "`$(var.$varName)\$rel"
    $componentLines += "    <Component Id='$cid' Directory='$dirId' Guid='*'><File Id='$fid' Source='$src'/></Component>"
}

$lines = @()
$lines += '<?xml version="1.0" encoding="utf-8"?>'
$lines += "<Wix xmlns='$ns'>"
$lines += "  <Fragment>"
$sortedDirKeys = $generatedDirIds.Keys | Sort-Object
foreach ($key in $sortedDirKeys) {
    $dirInfo = $generatedDirIds[$key]
    $lines += "    <DirectoryRef Id='$($dirInfo.parentId)'><Directory Id='$($dirInfo.id)' Name='$($dirInfo.name)' /></DirectoryRef>"
}
$lines += "    <ComponentGroup Id='$cgId'>"
$lines += $componentLines -join "`r`n"
$lines += "    </ComponentGroup>"
$lines += "  </Fragment>"
$lines += '</Wix>'
$lines -join "`r`n" | Set-Content $out -NoNewline
PSEOF

    # Convert MSYS paths to Windows paths for PowerShell
    if command -v cygpath >/dev/null 2>&1; then
        WWW_WIN="$(cygpath -w "$WWW_DIR")"
        BUILD_DIR_WIN="$(cygpath -w "$BUILD_DIR")"
        WIXDIR_WIN="$(cygpath -w "$WIXDIR")"
    else
        WWW_WIN="$WWW_DIR"
        BUILD_DIR_WIN="$BUILD_DIR"
        WIXDIR_WIN="$WIXDIR"
    fi

    # ---- Step 0: Generate build-fragment.wxs (build/ dir → INSTALLDIR) ----
    echo "Generating build/ fragment..."
    powershell.exe -NoProfile -Command "
        \$files = Get-ChildItem -File '$BUILD_DIR_WIN';
            \$main = \$files | Where-Object { \$_.Name -ne 'historytracers-publisher.exe' -and \$_.Name -ne 'historytracers-editor.exe' };
        \$pub  = \$files | Where-Object { \$_.Name -eq 'historytracers-publisher.exe' };
        \$lines = @();
        \$lines += '<?xml version=\"1.0\" encoding=\"utf-8\"?>';
        \$lines += \"<Wix xmlns='http://wixtoolset.org/schemas/v4/wxs'>\";
        \$lines += '  <Fragment>';
        \$lines += '    <ComponentGroup Id=\"CG_MAIN_BIN\">';
        foreach (\$f in \$main) {
            \$rel = \$f.Name;
            \$bytes = [System.Text.Encoding]::UTF8.GetBytes(\$rel);
            \$hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash(\$bytes);
            \$hash = [System.BitConverter]::ToString(\$hashBytes).Replace('-','').Substring(0,8);
            \$raw = 'cmp_bin_' + (\$rel -replace '[^a-zA-Z0-9]','_');
            if (\$raw.Length -gt 63) { \$raw = \$raw.Substring(0, 63) };
            \$cid = \$raw + '_' + \$hash;
            \$fid = 'fil_' + \$raw + '_' + \$hash;
            \$wixSrc = '\$(var.BuildDir)\' + \$rel;
            \$lines += \"      <Component Id='\$cid' Directory='INSTALLDIR' Guid='*'><File Id='\$fid' Source='\$wixSrc'/></Component>\";
        }
        \$lines += '    </ComponentGroup>';
        if (\$pub) {
            \$rel = \$pub.Name;
            \$bytes = [System.Text.Encoding]::UTF8.GetBytes(\$rel);
            \$hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash(\$bytes);
            \$hash = [System.BitConverter]::ToString(\$hashBytes).Replace('-','').Substring(0,8);
            \$raw = 'cmp_bin_' + (\$rel -replace '[^a-zA-Z0-9]','_');
            if (\$raw.Length -gt 63) { \$raw = \$raw.Substring(0, 63) };
            \$cid = \$raw + '_' + \$hash;
            \$fid = 'fil_' + \$raw + '_' + \$hash;
            \$wixSrc = '\$(var.BuildDir)\' + \$rel;
            \$lines += '    <ComponentGroup Id=\"CG_PUBLISHER_BIN\">';
            \$lines += \"      <Component Id='\$cid' Directory='INSTALLDIR' Guid='*'><File Id='\$fid' Source='\$wixSrc'/></Component>\";
            \$lines += '    </ComponentGroup>';
        }
        \$lines += '  </Fragment>';
        \$lines += '</Wix>';
        \$lines -join \"\`r\`n\" | Set-Content '$WIXDIR_WIN\\build-fragment.wxs' -NoNewline
    "
    if [ ! -f "${WIXDIR}/build-fragment.wxs" ]; then
        echo "ERROR: Failed to generate build-fragment.wxs"
        rm -f "$PS_GEN"
        exit 1
    fi

    # ---- Step 0b: Generate options-fragment.wxs (img_options.json) ----
    echo "Generating options fragment..."
    powershell.exe -NoProfile -Command "
        \$rel = 'img_options.json';
        \$bytes = [System.Text.Encoding]::UTF8.GetBytes(\$rel);
        \$hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash(\$bytes);
        \$hash = [System.BitConverter]::ToString(\$hashBytes).Replace('-','').Substring(0,8);
        \$raw = 'cmp_opt_' + (\$rel -replace '[^a-zA-Z0-9]','_');
        if (\$raw.Length -gt 63) { \$raw = \$raw.Substring(0, 63) };
        \$cid = \$raw + '_' + \$hash;
        \$fid = 'fil_' + \$raw + '_' + \$hash;
        \$wixSrc = '\$(var.WwwDir)\images\img_options.json';
        \$lines = @();
        \$lines += '<?xml version=\"1.0\" encoding=\"utf-8\"?>';
        \$lines += \"<Wix xmlns='http://wixtoolset.org/schemas/v4/wxs'>\";
        \$lines += '  <Fragment>';
        \$lines += '    <ComponentGroup Id=\"CG_OPTIONS\">';
        \$lines += \"      <Component Id='\$cid' Directory='WWW_IMAGES' Guid='*'><File Id='\$fid' Source='\$wixSrc'/></Component>\";
        \$lines += '    </ComponentGroup>';
        \$lines += '  </Fragment>';
        \$lines += '</Wix>';
        \$lines -join \"\`r\`n\" | Set-Content '$WIXDIR_WIN\\options-fragment.wxs' -NoNewline
    "
    if [ ! -f "${WIXDIR}/options-fragment.wxs" ]; then
        echo "ERROR: Failed to generate options-fragment.wxs"
        rm -f "$PS_GEN"
        exit 1
    fi

    # ---- Step 0c: Generate editor-fragment.wxs (editor binary + editor.html → INSTALLDIR) ----
    echo "Generating editor fragment..."
    powershell.exe -NoProfile -Command "
        \$editorExe = Get-ChildItem -File '$BUILD_DIR_WIN' | Where-Object { \$_.Name -eq 'historytracers-editor.exe' };
        if (\$editorExe) {
            # editor binary
            \$rel = \$editorExe.Name;
            \$bytes = [System.Text.Encoding]::UTF8.GetBytes(\$rel);
            \$hashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash(\$bytes);
            \$hash = [System.BitConverter]::ToString(\$hashBytes).Replace('-','').Substring(0,8);
            \$raw = 'cmp_editor_' + (\$rel -replace '[^a-zA-Z0-9]','_');
            if (\$raw.Length -gt 63) { \$raw = \$raw.Substring(0, 63) };
            \$cidExe = \$raw + '_' + \$hash;
            \$fidExe = 'fil_' + \$raw + '_' + \$hash;
            \$wixSrcExe = '\$(var.BuildDir)\' + \$rel;
            # editor.html
            \$relHtml = 'editor.html';
            \$bytesHtml = [System.Text.Encoding]::UTF8.GetBytes(\$relHtml);
            \$hashBytesHtml = [System.Security.Cryptography.SHA256]::Create().ComputeHash(\$bytesHtml);
            \$hashHtml = [System.BitConverter]::ToString(\$hashBytesHtml).Replace('-','').Substring(0,8);
            \$rawHtml = 'cmp_editor_' + (\$relHtml -replace '[^a-zA-Z0-9]','_');
            if (\$rawHtml.Length -gt 63) { \$rawHtml = \$rawHtml.Substring(0, 63) };
            \$cidHtml = \$rawHtml + '_' + \$hashHtml;
            \$fidHtml = 'fil_' + \$rawHtml + '_' + \$hashHtml;
            \$wixSrcHtml = '\$(var.ProjectDir)\editor.html';
            \$lines = @();
            \$lines += '<?xml version=\"1.0\" encoding=\"utf-8\"?>';
            \$lines += \"<Wix xmlns='http://wixtoolset.org/schemas/v4/wxs'>\";
            \$lines += '  <Fragment>';
            \$lines += '    <ComponentGroup Id=\"CG_EDITOR_BIN\">';
            \$lines += \"      <Component Id='\$cidExe' Directory='INSTALLDIR' Guid='*'><File Id='\$fidExe' Source='\$wixSrcExe'/></Component>\";
            \$lines += \"      <Component Id='\$cidHtml' Directory='INSTALLDIR' Guid='*'><File Id='\$fidHtml' Source='\$wixSrcHtml'/></Component>\";
            \$lines += '    </ComponentGroup>';
            \$lines += '  </Fragment>';
            \$lines += '</Wix>';
            \$lines -join \"\`r\`n\" | Set-Content '$WIXDIR_WIN\\editor-fragment.wxs' -NoNewline
        } else {
            Write-Error 'historytracers-editor.exe not found in build directory'
            exit 1
        }
    "
    if [ ! -f "${WIXDIR}/editor-fragment.wxs" ]; then
        echo "ERROR: Failed to generate editor-fragment.wxs"
        rm -f "$PS_GEN"
        exit 1
    fi

    # ---- Step 1: Harvest www/ content (exclude images/) ----
    echo "Harvesting www/ content (excluding images/)..."
    if [ "$WIX_HAS_HARVEST" = true ]; then
        "$WIXEXE" harvest dir "$WWW_DIR" \
            -o "${WIXDIR}/www-fragment.wxs" \
            -cg CG_WWW \
            -drid WWWDIR \
            -var WwwDir \
            -t "${WIXDIR}/exclude-images.xsl"
    else
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$PS_GEN" \
            -dir "$WWW_WIN" \
            -out "$WIXDIR_WIN\\www-fragment.wxs" \
            -ns "http://wixtoolset.org/schemas/v4/wxs" \
            -cgId "CG_WWW" \
            -dirRef "WWWDIR" \
            -varName "WwwDir" \
            -excludeDirs "images;Images"
        if [ ! -f "${WIXDIR}/www-fragment.wxs" ]; then
            echo "ERROR: Failed to generate www-fragment.wxs"
            rm -f "$PS_GEN"
            exit 1
        fi
    fi

    # ---- Step 2: Harvest images/ content (exclude img_options.json) ----
    echo "Harvesting images/ content..."
    if [ "$WIX_HAS_HARVEST" = true ]; then
        "$WIXEXE" harvest dir "$IMAGES_DIR" \
            -o "${WIXDIR}/images-fragment.wxs" \
            -cg CG_IMAGES \
            -drid WWW_IMAGES \
            -var ImagesDir \
            -t "${WIXDIR}/exclude-options.xsl"
    else
        powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$PS_GEN" \
            -dir "$WWW_WIN\\images" \
            -out "$WIXDIR_WIN\\images-fragment.wxs" \
            -ns "http://wixtoolset.org/schemas/v4/wxs" \
            -cgId "CG_IMAGES" \
            -dirRef "WWW_IMAGES" \
            -varName "ImagesDir" \
            -excludeDirs "img_options.json"
        if [ ! -f "${WIXDIR}/images-fragment.wxs" ]; then
            echo "ERROR: Failed to generate images-fragment.wxs"
            rm -f "$PS_GEN"
            exit 1
        fi
    fi

    rm -f "$PS_GEN"

    # ---- Step 3: Build MSI (compile + link in one step) ----
    echo "Building MSI..."
    "$WIXEXE" build \
        "${WIXDIR}/historytracers.wxs" \
        "${WIXDIR}/www-fragment.wxs" \
        "${WIXDIR}/images-fragment.wxs" \
        "${WIXDIR}/build-fragment.wxs" \
        "${WIXDIR}/options-fragment.wxs" \
        "${WIXDIR}/editor-fragment.wxs" \
        -o "$OUTPUT_MSI" \
        -arch x64 \
        -d BuildDir="$BUILD_DIR" \
        -d WwwDir="$WWW_DIR" \
        -d ImagesDir="$IMAGES_DIR" \
        -d ProjectDir="$PROJECT_DIR"

    # ---- Cleanup ----
    rm -f "${WIXDIR}/www-fragment.wxs" "${WIXDIR}/images-fragment.wxs" \
          "${WIXDIR}/build-fragment.wxs" "${WIXDIR}/options-fragment.wxs" \
          "${WIXDIR}/editor-fragment.wxs"

    # Restore original img_options.json
    if [ -f images/img_options.json ]; then
        sed -i 's/"ht_local_images" : false/"ht_local_images" : true/' images/img_options.json
    fi

    echo "MSI package built: ${OUTPUT_MSI}"

    trap - ERR
}

while [[ $# -gt 0 ]]; do
    case "${1}" in
        "--rpm" | "-r")
            MAKERPM="1"
            shift #pass argument
            ;;
        "--deb" | "-d")
            MAKEDEB="1"
            shift #pass argument
            ;;
        "--slackbuild" | "-s")
            MAKESLACKWARE="1"
            shift #pass argument
            ;;
        "--msi" | "-m")
            MAKEMSI="1"
            shift #pass argument
            ;;
        "--validate" | "-v")
            ht_validate_myself;
            exit 0;
            ;;
        "--help" | "-h")
            ht_usage;
            exit 0;
            ;;
        *)
            ht_usage;
            exit 0;
            ;;
    esac
done

# Auto-detect: if on MSYS/MinGW/Cygwin and no builder flag was set, default to MSI
if [ "${MAKERPM}" = "0" ] && [ "${MAKEDEB}" = "0" ] && [ "${MAKEMSI}" = "0" ] && [ "${MAKESLACKWARE}" = "0" ]; then
    if ht_is_slackware; then
        echo "No package type specified; auto-selecting --slackbuild for Slackware environment."
        MAKESLACKWARE="1"
    elif ht_is_msys; then
        echo "No package type specified; auto-selecting --msi for MSYS/MinGW environment."
        MAKEMSI="1"
    fi
fi

ht_compile

if [ "${MAKERPM}" = "1" ]; then
    ht_build_rpm
fi

if [ "${MAKEDEB}" = "1" ]; then
    ht_build_deb
fi

if [ "${MAKEMSI}" = "1" ]; then
    ht_build_msi
fi

# This must be always the last
if [ "${MAKESLACKWARE}" = "1" ]; then
    ht_build_slackware
fi

