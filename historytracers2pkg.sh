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

    # Run History Tracers
    ./build/historytracers -minify -audiofiles -gedcom -verbose -conf ./packaging/build_historytracers.conf  > historytracers.log
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

    # ===== Images SlackBuild tarball =====
    mkdir historytracers-images
    cp packaging/Slackware-images/* historytracers-images
    tar -zcvf artifacts/historytracers-images.tar.gz historytracers-images
    rm -rf historytracers-images

    # ===== Common source tarball used by both =====
    make clean

    mkdir -p "${DST}/www"
    cp -R ./*.md LICENSE Makefile.am README bodies configure.ac css csv gedcom ht2pkg.sh images index.html js lang packaging scripts src webfonts "${DST}"
    tar -acvf "artifacts/historytracers-${VERSION}.tar.xz" "${DST}"

    rm -rf "${DST}"
}

ht_is_msys() {
    case "$(uname -s)" in
        MINGW*|MSYS*|CYGWIN*) return 0 ;;
        *) return 1 ;;
    esac
}

ht_msi_cleanup() {
    if [ -f images/img_options.json ]; then
        sed -i 's/"ht_local_images" : false/"ht_local_images" : true/' images/img_options.json 2>/dev/null || true
    fi
    rm -rf "${WIXDIR}/www-fragment.wxs" "${WIXDIR}/images-fragment.wxs" 2>/dev/null || true
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

    # Locate WiX v5 tool (single wix.exe replaces candle/light/heat)
    WIXEXE=""
    if [ -n "$WIX" ] && [ -f "${WIX}/wix.exe" ]; then
        WIXEXE="${WIX}/wix.exe"
    elif [ -f "$(winepath -u 'C:\Program Files\WiX Toolset v5\bin\wix.exe' 2>/dev/null || echo '')" ]; then
        WIXEXE="$(winepath -u 'C:\Program Files\WiX Toolset v5\bin\wix.exe' 2>/dev/null || echo '')"
    elif [ -f "$(winepath -u 'C:\Program Files (x86)\WiX Toolset v5\bin\wix.exe' 2>/dev/null || echo '')" ]; then
        WIXEXE="$(winepath -u 'C:\Program Files (x86)\WiX Toolset v5\bin\wix.exe' 2>/dev/null || echo '')"
    else
        # Search with PowerShell
        WIXEXE=$(powershell.exe -NoProfile -Command "
            try {
                \$p = Get-Command 'wix.exe' -ErrorAction Stop;
                Write-Output (\$p.Source)
            } catch {
                \$paths = @(
                    \"\${env:ProgramFiles}\WiX Toolset v5\bin\wix.exe\",
                    \"\${env:ProgramFiles(x86)}\WiX Toolset v5\bin\wix.exe\"
                );
                \$found = \$paths | Where-Object { Test-Path \$_ } | Select-Object -First 1;
                if (\$found) { Write-Output \$found } else { Write-Output '' }
            }
        " 2>/dev/null | tr -d '\r')
    fi

    if [ -z "$WIXEXE" ] || [ ! -f "$WIXEXE" ]; then
        echo "ERROR: WiX Toolset v5 not found."
        echo "Install WiX Toolset v5 from https://wixtoolset.org/"
        echo "and ensure wix.exe is in PATH."
        exit 1
    fi

    echo "WiX Toolset found: ${WIXEXE}"

    PROJECT_DIR="$(pwd)"
    BUILD_DIR="${PROJECT_DIR}/build"
    WWW_DIR="${PROJECT_DIR}/www"
    IMAGES_DIR="${WWW_DIR}/images"
    OUTPUT_MSI="${PROJECT_DIR}/artifacts/HistoryTracers-1.0.0.msi"

    # ---- Step 1: Harvest www/ content (exclude images/) ----
    echo "Harvesting www/ content (excluding images/)..."
    "$WIXEXE" harvest dir "$WWW_DIR" \
        -o "${WIXDIR}/www-fragment.wxs" \
        -cg CG_WWW \
        -drid WWWDIR \
        -var WwwDir \
        -t "${WIXDIR}/exclude-images.xsl"

    # ---- Step 2: Harvest images/ content (exclude img_options.json) ----
    echo "Harvesting images/ content..."
    "$WIXEXE" harvest dir "$IMAGES_DIR" \
        -o "${WIXDIR}/images-fragment.wxs" \
        -cg CG_IMAGES \
        -drid WWW_IMAGES \
        -var ImagesDir \
        -t "${WIXDIR}/exclude-options.xsl"

    # ---- Step 3: Build MSI (compile + link in one step) ----
    echo "Building MSI..."
    "$WIXEXE" build \
        "${WIXDIR}/historytracers.wxs" \
        "${WIXDIR}/www-fragment.wxs" \
        "${WIXDIR}/images-fragment.wxs" \
        -o "$OUTPUT_MSI" \
        -arch x64 \
        -d BuildDir="$BUILD_DIR" \
        -d WwwDir="$WWW_DIR" \
        -d ImagesDir="$IMAGES_DIR"

    # ---- Cleanup ----
    rm -f "${WIXDIR}/www-fragment.wxs" "${WIXDIR}/images-fragment.wxs"

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

ht_compile

if [ "${MAKERPM}" == "1" ]; then
    ht_build_rpm
fi

if [ "${MAKEDEB}" == "1" ]; then
    ht_build_deb
fi

if [ "${MAKEMSI}" == "1" ]; then
    ht_build_msi
fi

# This must be always the last
if [ "${MAKESLACKWARE}" == "1" ]; then
    ht_build_slackware
fi

