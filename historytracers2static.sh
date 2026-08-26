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
            *)
                echo "Unknown option: $arg" >&2
                ht_usage >&2
                exit 1
                ;;
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
        rc1=$?
        source <(sed -n '/^ht_build_static()/,/^ht_usage()/p' ./historytracers2pkg.sh | head -n -1)
        rc2=$?
        set -e
        if [ $rc1 -ne 0 ] || [ $rc2 -ne 0 ]; then
            echo "ERROR: failed to source builder functions from historytracers2pkg.sh" >&2
            exit 1
        fi
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
    echo "Tarball: ${TARBALL} ($(du -h "${TARBALL}" | cut -f1))"

    # Generate self-extracting installer (fallback standalone)
    # If historytracers2pkg.sh is unavailable we still produce INSTALLER; fail clearly on error
    echo "Generating fallback installer: ${INSTALLER}"
    cat > "${INSTALLER}" <<'FALLBACK_HEADER'
#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-or-later
# HistoryTracers static installer (fallback)
set -e
VERSION="__VERSION__"
PREFIX="/usr/local"
DESTDIR=""
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then echo "Usage: bash $0 [--prefix PATH] [--destdir PATH] [--uninstall]"; exit 0; fi
if [ "$1" = "--version" ]; then echo "HistoryTracers $VERSION"; exit 0; fi
# Minimal arg handling for fallback
while [ $# -gt 0 ]; do case "$1" in --prefix) PREFIX="$2"; shift 2;; --prefix=*) PREFIX="${1#*=}"; shift;; --destdir) DESTDIR="$2"; shift 2;; --destdir=*) DESTDIR="${1#*=}"; shift;; --uninstall) echo "fallback uninstall not implemented, use main installer"; exit 1;; *) echo "Unknown option: $1" >&2; exit 1;; esac; done
ARCHIVE_LINE=$(awk '/^__ARCHIVE_BELOW__$/ {print NR + 1; exit 0; }' "$0")
if [ -z "$ARCHIVE_LINE" ]; then echo "ERROR: marker not found" >&2; exit 1; fi
TMPDIR=$(mktemp -d /tmp/ht_fallback_XXXXXX)
trap 'rm -rf "$TMPDIR"' EXIT
# decode
if command -v base64 >/dev/null 2>&1; then
  if base64 -d </dev/null >/dev/null 2>&1; then B64="base64 -d"; elif base64 --decode </dev/null >/dev/null 2>&1; then B64="base64 --decode"; else B64="base64 -D"; fi
else echo "base64 not found" >&2; exit 1; fi
tail -n +"$ARCHIVE_LINE" "$0" | $B64 | tar -xz -C "$TMPDIR"
SRC="$TMPDIR/historytracers-$VERSION"
if [ ! -d "$SRC" ]; then echo "Extraction failed" >&2; exit 1; fi
mkdir -p "${DESTDIR}${PREFIX}/bin" "${DESTDIR}${PREFIX}/share/historytracers"
cp -a "$SRC/bin/"* "${DESTDIR}${PREFIX}/bin/" 2>/dev/null || true
rm -rf "${DESTDIR}${PREFIX}/share/historytracers/www"
cp -a "$SRC/share/historytracers/www" "${DESTDIR}${PREFIX}/share/historytracers/" 2>/dev/null || true
[ -f "$SRC/share/historytracers/editor.html" ] && install -m 644 "$SRC/share/historytracers/editor.html" "${DESTDIR}${PREFIX}/share/historytracers/" 2>/dev/null || true
mkdir -p "${DESTDIR}${PREFIX}/share/doc/historytracers"
for d in README.md LICENSE; do [ -f "$SRC/share/doc/historytracers/$d" ] && install -m 644 "$SRC/share/doc/historytracers/$d" "${DESTDIR}${PREFIX}/share/doc/historytracers/" 2>/dev/null || true; done
mkdir -p "${DESTDIR}/etc/historytracers" 2>/dev/null || mkdir -p "${DESTDIR}${PREFIX}/etc/historytracers"
if [ -f "$SRC/etc/historytracers/historytracers.conf" ]; then
  if [ ! -f "${DESTDIR}/etc/historytracers/historytracers.conf" ] && [ ! -f "${DESTDIR}${PREFIX}/etc/historytracers/historytracers.conf" ]; then
    if [ -d "${DESTDIR}/etc" ]; then install -m 600 "$SRC/etc/historytracers/historytracers.conf" "${DESTDIR}/etc/historytracers/historytracers.conf" 2>/dev/null || install -m 600 "$SRC/etc/historytracers/historytracers.conf" "${DESTDIR}${PREFIX}/etc/historytracers/historytracers.conf"; else install -m 600 "$SRC/etc/historytracers/historytracers.conf" "${DESTDIR}${PREFIX}/etc/historytracers/historytracers.conf"; fi
    chown historytracers:historytracers "${DESTDIR}/etc/historytracers/historytracers.conf" 2>/dev/null || chown historytracers:historytracers "${DESTDIR}${PREFIX}/etc/historytracers/historytracers.conf" 2>/dev/null || true
  fi
fi
echo "Fallback install to ${DESTDIR}${PREFIX} complete"
exit 0
__ARCHIVE_BELOW__
FALLBACK_HEADER
    # Inject actual version
    sed -i "s/__VERSION__/${VERSION}/g" "${INSTALLER}"
    # Append payload with portable base64 wrapping
    if base64 -w 76 /dev/null >/dev/null 2>&1; then
        base64 -w 76 "${TARBALL}" >> "${INSTALLER}"
    elif base64 -b 76 /dev/null >/dev/null 2>&1; then
        base64 -b 76 "${TARBALL}" >> "${INSTALLER}"
    else
        base64 "${TARBALL}" | fold -w 76 >> "${INSTALLER}"
    fi
    chmod +x "${INSTALLER}"
    echo "Installer: ${INSTALLER} ($(du -h "${INSTALLER}" | cut -f1))"
    if ! grep -q "^__ARCHIVE_BELOW__$" "${INSTALLER}"; then
        echo "ERROR: installer marker missing" >&2
        rm -rf "${STAGING}"
        exit 1
    fi
    ARCHIVE_LINE=$(awk '/^__ARCHIVE_BELOW__$/ {print NR + 1; exit 0; }' "${INSTALLER}")
    if [ -z "${ARCHIVE_LINE}" ]; then
        echo "ERROR: cannot locate archive payload boundary" >&2
        rm -rf "${STAGING}"
        exit 1
    fi
    if ! tail -n +"${ARCHIVE_LINE}" "${INSTALLER}" | base64 -d | tar -tz >/dev/null; then
        echo "ERROR: fallback verification failed" >&2
        rm -rf "${STAGING}"
        exit 1
    fi
    echo "Verification OK"
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
