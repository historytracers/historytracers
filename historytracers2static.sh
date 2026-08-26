#!/bin/bash

# SPDX-License-Identifier: GPL-3.0-or-later
#
# HistoryTracers static installer builder
# Creates a self-extracting static installer that can be shipped to users
# without requiring a package manager (apt/dnf/pacman) or compilation.
#
# Output:
#   artifacts/historytracers-static-<version>.tar.gz
#   artifacts/historytracers-<version>-static-installer.sh  (self-extracting)
#
# Usage:
#   bash historytracers2static.sh [--help] [--no-compile]
#
# This is a standalone wrapper around the --static target in historytracers2pkg.sh
# but can also be used directly without that script.

set -e

ht_get_version() {
    if [ -f packaging/Slackware/historytracers.info ]; then
        # shellcheck disable=SC1091
        source packaging/Slackware/historytracers.info
        echo "${VERSION:-1.0.0}"
    else
        ver=$(grep -E '^AC_INIT' configure.ac 2>/dev/null | sed -E 's/.*\[([0-9.]+)\].*/\1/')
        echo "${ver:-1.0.0}"
    fi
}

ht_compile() {
    echo "Formatting and publishing content"

    if [ ! -d artifacts ]; then
        mkdir artifacts;
    else
        rm -rf artifacts/*
    fi

    if [ -d build ]; then
        make maintainer-clean 2>/dev/null || make clean 2>/dev/null || true
    fi
    rm -rf build-aux autom4te.cache aclocal.m4 configure config.h.in config.h config.log config.status Makefile.in Makefile 2>/dev/null || true

    if [ ! -d audios ]; then
        mkdir audios;
    fi

    autoreconf -f -i
    ./configure
    make all

    ./build/historytracers-publisher -minify -audiofiles -gedcom -verbose -conf ./packaging/build_historytracers.conf >> historytracers.log 2> >(tee -a historytracers.log >&2)
}

ht_usage() {
    cat <<HTDOC
Usage: bash historytracers2static.sh [OPTIONS]

Builds a static installer for HistoryTracers (self-extracting shell + tarball).

Options:
  --no-compile          Skip compilation, use existing build/ and www/
  --help, -h            Show this help
  --version             Show version

Output (in artifacts/):
  historytracers-static-<version>.tar.gz          Plain tarball
  historytracers-<version>-static-installer.sh    Self-extracting installer

Installer usage (after building):
  sudo bash artifacts/historytracers-1.0.0-static-installer.sh          # to /usr/local
  bash artifacts/historytracers-1.0.0-static-installer.sh --prefix \$HOME/.local
  bash artifacts/historytracers-1.0.0-static-installer.sh --list
  bash artifacts/historytracers-1.0.0-static-installer.sh --check
  sudo bash artifacts/historytracers-1.0.0-static-installer.sh --uninstall

Alternatively use the unified builder:
  bash historytracers2pkg.sh --static
HTDOC
}

# Reuse the same builder from historytracers2pkg.sh if available
# to avoid duplicating large heredoc logic. Fallback to embedded version.
if [ -f ./historytracers2pkg.sh ]; then
    # If called with --help, show our help and exit
    for arg in "$@"; do
        case "$arg" in
            --help|-h) ht_usage; exit 0 ;;
            --version) echo "HistoryTracers $(ht_get_version)"; exit 0 ;;
        esac
    done

    SKIP_COMPILE="0"
    for arg in "$@"; do
        case "$arg" in
            --no-compile) SKIP_COMPILE="1" ;;
            *) ;;
        esac
    done

    if [ "$SKIP_COMPILE" = "1" ]; then
        echo "Skipping compilation (--no-compile), using existing build/ and www/"
        # Source the functions from historytracers2pkg.sh and call ht_build_static directly
        # We need to avoid re-running ht_compile inside that script.
        # Extract ht_build_static and helpers by sourcing (careful: it would run main code)
        # Instead, just call the pkg script with --static but prevent its ht_compile
        # by temporarily mocking ht_compile as no-op.
        # Simpler: directly invoke the static builder via bash -c sourcing.
        set +e
        # shellcheck disable=SC1091
        source <(grep -A 500 '^ht_get_version()' ./historytracers2pkg.sh | sed -n '1,/^ht_usage()/p' | head -n -1)
        source <(sed -n '/^ht_build_static()/,/^ht_usage()/p' ./historytracers2pkg.sh | head -n -1)
        # Call builder (needs VERSION etc.)
        ht_build_static
        exit $?
    fi

    echo "Delegating to historytracers2pkg.sh --static (ensures single source of truth)"
    exec bash ./historytracers2pkg.sh --static
fi

# Fallback: standalone implementation (if historytracers2pkg.sh not present)
# This is a minimal copy of ht_build_static – kept in sync with historytracers2pkg.sh

ht_build_static_fallback() {
    echo "Building static installer (fallback mode)"
    VERSION="$(ht_get_version)"
    echo "Version: ${VERSION}"

    if [ ! -f build/historytracers ] && [ ! -f build/historytracers-publisher ]; then
        echo "ERROR: build artifacts not found"
        exit 1
    fi
    if [ ! -d www ]; then
        echo "ERROR: www not found"
        exit 1
    fi

    STAGING="$(mktemp -d /tmp/ht_static_XXXXXX)"
    PKGROOT="${STAGING}/historytracers-${VERSION}"
    TARBALL="artifacts/historytracers-static-${VERSION}.tar.gz"
    INSTALLER="artifacts/historytracers-${VERSION}-static-installer.sh"
    mkdir -p artifacts
    mkdir -p "${PKGROOT}/bin" "${PKGROOT}/share/historytracers" "${PKGROOT}/etc/historytracers" "${PKGROOT}/lib/systemd/system" "${PKGROOT}/share/doc/historytracers"

    [ -f build/historytracers ] && install -m 755 build/historytracers "${PKGROOT}/bin/historytracers"
    [ -f build/historytracers-publisher ] && install -m 755 build/historytracers-publisher "${PKGROOT}/bin/historytracers-publisher"
    [ -f build/historytracers-editor ] && install -m 755 build/historytracers-editor "${PKGROOT}/bin/historytracers-editor"
    for f in build/*.exe; do [ -e "$f" ] || continue; install -m 755 "$f" "${PKGROOT}/bin/"; done
    mkdir -p "${PKGROOT}/share/historytracers/www"
    (cd www && tar cf - .) | (cd "${PKGROOT}/share/historytracers/www" && tar xf -)
    [ -f editor.html ] && install -m 644 editor.html "${PKGROOT}/share/historytracers/editor.html"
    [ -f packaging/conf/historytracers.conf ] && install -m 644 packaging/conf/historytracers.conf "${PKGROOT}/etc/historytracers/historytracers.conf"
    [ -f packaging/service/historytracers.service ] && install -m 644 packaging/service/historytracers.service "${PKGROOT}/lib/systemd/system/historytracers.service"
    for doc in README.md LICENSE; do [ -f "$doc" ] && install -m 644 "$doc" "${PKGROOT}/share/doc/historytracers/" 2>/dev/null || true; done
    tar -czf "${TARBALL}" -C "${STAGING}" "historytracers-${VERSION}"
    echo "Tarball: ${TARBALL}"
    # For fallback we do not generate self-extracting installer (use pkg script for that)
    rm -rf "${STAGING}"
}

# Main for fallback
SKIP_COMPILE="0"
for arg in "$@"; do
    case "$arg" in
        --no-compile) SKIP_COMPILE="1" ;;
        --help|-h) ht_usage; exit 0 ;;
        --version) echo "HistoryTracers $(ht_get_version)"; exit 0 ;;
        *) echo "Unknown option: $arg"; ht_usage; exit 1 ;;
    esac
done

if [ "$SKIP_COMPILE" = "0" ]; then
    ht_compile
fi
ht_build_static_fallback
