#!/bin/bash

# SPDX-License-Identifier: GPL-3.0-or-later
#
# Script used to generate History Tracers package

set -e

MAKERPM="0"
MAKEDEB="0"
MAKESLACKWARE="0"
MAKEMSI="0"
MAKESTATIC="0"

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

ht_get_version() {
    if [ -f packaging/Slackware/historytracers.info ]; then
        # subshell prevents VERSION leak into caller
        # shellcheck disable=SC1091
        ( source packaging/Slackware/historytracers.info; echo "${VERSION:-1.0.0}" )
    else
        ver=$(grep -E '^AC_INIT' configure.ac 2>/dev/null | sed -E 's/.*\[([0-9.]+)\].*/\1/')
        echo "${ver:-1.0.0}"
    fi
}

ht_static_cleanup() {
    # Remove actual staging dir tracked via STAGING; handle unset/empty safely
    if [ -n "${STAGING:-}" ] && [ -d "${STAGING}" ]; then
        rm -rf "${STAGING}" 2>/dev/null || true
    fi
}

ht_build_static() {
    echo "Building static installer"
    trap ht_static_cleanup ERR

    VERSION="$(ht_get_version)"
    echo "Version: ${VERSION}"

    # Sanity checks – ht_compile should have created these
    if [ ! -f build/historytracers ] && [ ! -f build/historytracers-publisher ]; then
        echo "ERROR: build/historytracers not found. Run ht_compile first or ensure build succeeded."
        exit 1
    fi
    if [ ! -d www ]; then
        echo "ERROR: www directory not found. Run ht_compile first."
        exit 1
    fi

    STAGING="$(mktemp -d /tmp/ht_static_XXXXXX)"
    PKGROOT="${STAGING}/historytracers-${VERSION}"
    TARBALL="artifacts/historytracers-static-${VERSION}.tar.gz"
    INSTALLER="artifacts/historytracers-${VERSION}-static-installer.sh"

    # Ensure artifacts exists (ht_compile already created it)
    mkdir -p artifacts
    mkdir -p "${PKGROOT}/bin" "${PKGROOT}/share/historytracers" "${PKGROOT}/etc/historytracers" "${PKGROOT}/lib/systemd/system" "${PKGROOT}/share/doc/historytracers"

    # --- Binaries ---
    if [ -f build/historytracers ]; then
        install -m 755 build/historytracers "${PKGROOT}/bin/historytracers"
    fi
    if [ -f build/historytracers-publisher ]; then
        install -m 755 build/historytracers-publisher "${PKGROOT}/bin/historytracers-publisher"
    fi
    if [ -f build/historytracers-editor ]; then
        install -m 755 build/historytracers-editor "${PKGROOT}/bin/historytracers-editor"
    fi
    # Also handle .exe variants if present (cross-build)
    for f in build/*.exe; do
        [ -e "$f" ] || continue
        install -m 755 "$f" "${PKGROOT}/bin/"
    done

    # --- Web content (www) ---
    # Copy everything from www/ (including images/ and img_options.json)
    if [ -d www ]; then
        mkdir -p "${PKGROOT}/share/historytracers/www"
        # Use tar to preserve permissions and avoid cp issues with large dirs
        (cd www && tar cf - .) | (cd "${PKGROOT}/share/historytracers/www" && tar xf -)
    fi

    # --- editor.html (top-level) ---
    if [ -f editor.html ]; then
        install -m 644 editor.html "${PKGROOT}/share/historytracers/editor.html"
    fi

    # --- Config ---
    if [ -f packaging/conf/historytracers.conf ]; then
        install -m 644 packaging/conf/historytracers.conf "${PKGROOT}/etc/historytracers/historytracers.conf"
    elif [ -f packaging/build_historytracers.conf ]; then
        install -m 644 packaging/build_historytracers.conf "${PKGROOT}/etc/historytracers/historytracers.conf"
    fi

    # --- Systemd service ---
    if [ -f packaging/service/historytracers.service ]; then
        install -m 644 packaging/service/historytracers.service "${PKGROOT}/lib/systemd/system/historytracers.service"
    fi

    # --- Documentation ---
    for doc in README.md README.es.md README.pt-BR.md LICENSE CODE_OF_CONDUCT.md; do
        [ -f "$doc" ] && install -m 644 "$doc" "${PKGROOT}/share/doc/historytracers/" 2>/dev/null || true
    done
    # Also copy main README if README without extension exists
    [ -f README ] && install -m 644 README "${PKGROOT}/share/doc/historytracers/" 2>/dev/null || true

    # --- Create plain tarball for manual installation ---
    echo "Creating static tarball: ${TARBALL}"
    tar -czf "${TARBALL}" -C "${STAGING}" "historytracers-${VERSION}"
    echo "Static tarball created: ${TARBALL} ($(du -h "${TARBALL}" | cut -f1))"

    # --- Create self-extracting installer ---
    echo "Creating self-extracting installer: ${INSTALLER}"
    cat > "${INSTALLER}" <<HTSTATIC_HEADER
#!/bin/bash
# SPDX-License-Identifier: GPL-3.0-or-later
# HistoryTracers static installer ${VERSION}
# Generated by historytracers2pkg.sh --static
# Usage: bash \$(basename "\$0") [OPTIONS]
#   --prefix PATH     Installation prefix (default: /usr/local)
#   --destdir PATH    Staged install root (default: empty)
#   --uninstall       Remove installed files
#   --check           Check dependencies
#   --list            List files that would be installed
#   --keep            Keep temporary files after install
#   --help            Show help
set -e

VERSION="${VERSION}"
DEFAULT_PREFIX="/usr/local"
PREFIX="\${DEFAULT_PREFIX}"
DESTDIR=""
UNINSTALL=0
DO_CHECK=0
DO_LIST=0
KEEP_TEMP=0

ht_static_usage() {
    cat <<HTU
HistoryTracers static installer ${VERSION}

Usage: bash \$0 [OPTIONS]

Options:
  --prefix PATH     Installation prefix (default: \${DEFAULT_PREFIX})
  --destdir PATH    Staged root for packaging (default: empty)
  --sysconfdir PATH System config dir (default: /etc when root, else \\\$PREFIX/etc)
  --uninstall       Uninstall previously installed files
  --check           Check system dependencies
  --list            List files included in this installer
  --keep            Keep temporary extraction dir
  --help, -h        Show this help
  --version         Show version

Examples:
  sudo bash \$0                          # install to /usr/local
  bash \$0 --prefix \$HOME/.local        # user local install
  sudo bash \$0 --uninstall              # remove installation
  bash \$0 --list                        # show contents

HTU
}

ht_check_deps() {
    echo "Checking dependencies for HistoryTracers ${VERSION}..."
    ok=1
    for cmd in tar gzip base64 mktemp; do
        if ! command -v \$cmd >/dev/null 2>&1; then
            echo "  MISSING: \$cmd"
            ok=0
        else
            echo "  found: \$cmd (\$(command -v \$cmd))"
        fi
    done
    # Check for GUI deps (viewer needs GTK/WebKit at runtime)
    echo ""
    echo "Runtime GUI dependencies (viewer):"
    for lib in libgtk-3 libwebkit2gtk-4.1; do
        if ldconfig -p 2>/dev/null | grep -q "\$lib" || pkg-config --exists "\$lib" 2>/dev/null || find /usr/lib* -name "*\${lib}*" 2>/dev/null | grep -q .; then
            echo "  found: \$lib"
        else
            echo "  WARNING: \$lib not found (viewer may fail; install gtk3 webkit2gtk4.1)"
        fi
    done
    if [ "\$ok" = "1" ]; then
        echo "Core checks passed."
    else
        echo "Some core tools missing."
        return 1
    fi
}

# Parse args
while [ "\$#" -gt 0 ]; do
    case "\$1" in
        --prefix) PREFIX="\$2"; shift 2 ;;
        --prefix=*) PREFIX="\${1#*=}"; shift ;;
        --destdir) DESTDIR="\$2"; shift 2 ;;
        --destdir=*) DESTDIR="\${1#*=}"; shift ;;
        --sysconfdir) SYSCONFDIR="\$2"; shift 2 ;;
        --sysconfdir=*) SYSCONFDIR="\${1#*=}"; shift ;;
        --uninstall) UNINSTALL=1; shift ;;
        --check) DO_CHECK=1; shift ;;
        --list) DO_LIST=1; shift ;;
        --keep) KEEP_TEMP=1; shift ;;
        --help|-h) ht_static_usage; exit 0 ;;
        --version) echo "HistoryTracers ${VERSION}"; exit 0 ;;
        *) echo "Unknown option: \$1" >&2; ht_static_usage; exit 1 ;;
    esac
done

# Auto sysconfdir
if [ -z "\${SYSCONFDIR:-}" ]; then
    if [ "\$(id -u 2>/dev/null || echo 1000)" = "0" ] && [ -d "/etc" ]; then
        SYSCONFDIR="/etc"
    else
        SYSCONFDIR="\${PREFIX}/etc"
    fi
fi

if [ "\$DO_CHECK" = "1" ]; then
    ht_check_deps
    exit 0
fi

# Determine base64 decode command
B64_DECODE=""
if command -v base64 >/dev/null 2>&1; then
    if base64 -d </dev/null >/dev/null 2>&1; then
        B64_DECODE="base64 -d"
    elif base64 --decode </dev/null >/dev/null 2>&1; then
        B64_DECODE="base64 --decode"
    elif base64 -D </dev/null >/dev/null 2>&1; then
        B64_DECODE="base64 -D"
    fi
fi
if [ -z "\$B64_DECODE" ]; then
    echo "ERROR: base64 decode not available" >&2
    exit 1
fi

TMPDIR="\$(mktemp -d /tmp/historytracers_static_XXXXXX)"
if [ "\$KEEP_TEMP" = "1" ]; then
    echo "Temporary dir: \$TMPDIR (kept)"
else
    trap 'rm -rf "\$TMPDIR"' EXIT
fi

ARCHIVE_LINE=\$(awk '/^__ARCHIVE_BELOW__/ {print NR + 1; exit 0; }' "\$0")
if [ -z "\$ARCHIVE_LINE" ]; then
    echo "ERROR: archive marker not found" >&2
    exit 1
fi

if [ "\$DO_LIST" = "1" ]; then
    echo "Files in this installer (prefix=\${PREFIX}, sysconfdir=\${SYSCONFDIR}):"
    tail -n +\$ARCHIVE_LINE "\$0" | \$B64_DECODE | tar -tz | head -n 200
    echo "..."
    echo "(use --prefix to change install location)"
    exit 0
fi

echo "Extracting HistoryTracers ${VERSION}..."
tail -n +\$ARCHIVE_LINE "\$0" | \$B64_DECODE | tar -xz -C "\$TMPDIR"
SRC="\$TMPDIR/historytracers-${VERSION}"
if [ ! -d "\$SRC" ]; then
    echo "ERROR: extraction failed, \$SRC not found" >&2
    ls -la "\$TMPDIR" >&2 || true
    exit 1
fi

MANIFEST_DIR="\${DESTDIR}\${PREFIX}/share/historytracers"
MANIFEST_FILE="\${MANIFEST_DIR}/.install-manifest"

if [ "\$UNINSTALL" = "1" ]; then
    echo "Uninstalling HistoryTracers ${VERSION} from \${DESTDIR}\${PREFIX} ..."
    if [ -f "\$MANIFEST_FILE" ]; then
        # Validate stored version before removing
        _stored_version=""
        if head -n1 "\$MANIFEST_FILE" | grep -q "^#VERSION="; then
            _stored_version=\$(head -n1 "\$MANIFEST_FILE" | cut -d= -f2)
            if [ "\${_stored_version}" != "\${VERSION}" ]; then
                echo "ERROR: manifest version \${_stored_version} != installer version \${VERSION}, refusing uninstall" >&2
                echo "To force, remove \$MANIFEST_FILE manually" >&2
                exit 1
            fi
        fi
        echo "Removing files listed in \$MANIFEST_FILE"
        # Use manifest without version header
        _manifest_tmp=\$(mktemp)
        if head -n1 "\$MANIFEST_FILE" | grep -q "^#VERSION="; then
            tail -n +2 "\$MANIFEST_FILE" > "\$_manifest_tmp"
        else
            cat "\$MANIFEST_FILE" > "\$_manifest_tmp"
        fi
        tac "\$_manifest_tmp" 2>/dev/null | while read -r f; do
            [ -z "\$f" ] && continue
            # Skip version header if ever present in content
            case "\$f" in \#VERSION=*) continue;; esac
            target="\${DESTDIR}\${f}"
            if [ -f "\$target" ] || [ -L "\$target" ]; then
                rm -f "\$target" && echo "  rm \$target"
            elif [ -d "\$target" ]; then
                rm -rf "\$target" && echo "  rm -rf \$target"
            fi
        done
        rm -f "\$_manifest_tmp"
        # Remove empty dirs
        for d in "\${DESTDIR}\${PREFIX}/share/historytracers/www" "\${DESTDIR}\${PREFIX}/share/historytracers" "\${DESTDIR}\${PREFIX}/share/doc/historytracers" "\${DESTDIR}\${PREFIX}/bin" "\${DESTDIR}\${SYSCONFDIR}/historytracers" "\${DESTDIR}/lib/systemd/system" "\${DESTDIR}\${PREFIX}/lib/systemd/system"; do
            [ -d "\$d" ] && rmdir --ignore-fail-on-non-empty "\$d" 2>/dev/null || true
        done
        rm -f "\$MANIFEST_FILE"
        echo "Uninstall complete."
    else
        echo "Manifest not found at \$MANIFEST_FILE"
        echo "Attempting best-effort removal..."
        rm -f "\${DESTDIR}\${PREFIX}/bin/historytracers" "\${DESTDIR}\${PREFIX}/bin/historytracers-publisher" "\${DESTDIR}\${PREFIX}/bin/historytracers-editor"
        rm -rf "\${DESTDIR}\${PREFIX}/share/historytracers"
        rm -f "\${DESTDIR}\${SYSCONFDIR}/historytracers/historytracers.conf"
        rm -f "\${DESTDIR}/lib/systemd/system/historytracers.service" "\${DESTDIR}\${PREFIX}/lib/systemd/system/historytracers.service"
        echo "Done (manifest not found, removed known paths)."
    fi
    if command -v systemctl >/dev/null 2>&1 && [ -z "\$DESTDIR" ]; then
        systemctl daemon-reload 2>/dev/null || true
    fi
    exit 0
fi

echo "Installing to PREFIX=\${PREFIX} DESTDIR=\${DESTDIR} SYSCONFDIR=\${SYSCONFDIR} ..."

# Check writable
if [ -n "\$DESTDIR" ]; then
    mkdir -p "\$DESTDIR\${PREFIX}" "\$DESTDIR\${SYSCONFDIR}"
else
    if [ ! -w "\${PREFIX}" ] && [ "\$(id -u 2>/dev/null || echo 0)" != "0" ]; then
        echo "WARNING: \${PREFIX} not writable. Try with sudo or --prefix \$HOME/.local" >&2
    fi
fi

# Install binaries
INSTALLED_EXE=""
mkdir -p "\${DESTDIR}\${PREFIX}/bin"
for bin in historytracers historytracers-publisher historytracers-editor; do
    if [ -f "\$SRC/bin/\$bin" ]; then
        install -m 755 "\$SRC/bin/\$bin" "\${DESTDIR}\${PREFIX}/bin/\$bin"
        echo "  installed \${PREFIX}/bin/\$bin"
    fi
done
# Windows exe variants (if any) – install alongside
for f in "\$SRC/bin/"*.exe; do
    [ -e "\$f" ] || continue
    install -m 755 "\$f" "\${DESTDIR}\${PREFIX}/bin/"
    echo "  installed \${PREFIX}/bin/\$(basename "\$f")"
    INSTALLED_EXE="\${INSTALLED_EXE} \${PREFIX}/bin/\$(basename "\$f")"
done

# Install web content
mkdir -p "\${DESTDIR}\${PREFIX}/share/historytracers"
if [ -d "\$SRC/share/historytracers/www" ]; then
    rm -rf "\${DESTDIR}\${PREFIX}/share/historytracers/www"
    cp -a "\$SRC/share/historytracers/www" "\${DESTDIR}\${PREFIX}/share/historytracers/"
    echo "  installed \${PREFIX}/share/historytracers/www"
fi
if [ -f "\$SRC/share/historytracers/editor.html" ]; then
    install -m 644 "\$SRC/share/historytracers/editor.html" "\${DESTDIR}\${PREFIX}/share/historytracers/editor.html"
    echo "  installed \${PREFIX}/share/historytracers/editor.html"
fi

# Install docs
mkdir -p "\${DESTDIR}\${PREFIX}/share/doc/historytracers"
for doc in README.md README.es.md README.pt-BR.md LICENSE CODE_OF_CONDUCT.md README; do
    [ -f "\$SRC/share/doc/historytracers/\$doc" ] && install -m 644 "\$SRC/share/doc/historytracers/\$doc" "\${DESTDIR}\${PREFIX}/share/doc/historytracers/\$doc" 2>/dev/null || true
done

# Ensure system group/user for chown (before config/service)
if [ -z "\${DESTDIR}" ] && [ "\$(id -u 2>/dev/null || echo 0)" = "0" ]; then
    getent group historytracers >/dev/null 2>&1 || groupadd -r historytracers 2>/dev/null || true
    # useradd: try Debian style first, then Slackware/RHEL style
    getent passwd historytracers >/dev/null 2>&1 || useradd -r -g historytracers -s /usr/sbin/nologin -d "\${PREFIX}/share/historytracers" -c "HistoryTracers" historytracers 2>/dev/null || useradd -r -g historytracers -s /sbin/nologin -d "\${PREFIX}/share/historytracers" -c "HistoryTracers" historytracers 2>/dev/null || true
fi

# Install config (do not overwrite existing)
CONFIG_INSTALLED=0
mkdir -p "\${DESTDIR}\${SYSCONFDIR}/historytracers"
if [ -f "\$SRC/etc/historytracers/historytracers.conf" ]; then
    if [ -f "\${DESTDIR}\${SYSCONFDIR}/historytracers/historytracers.conf" ]; then
        echo "  keeping existing \${SYSCONFDIR}/historytracers/historytracers.conf"
        install -m 644 "\$SRC/etc/historytracers/historytracers.conf" "\${DESTDIR}\${SYSCONFDIR}/historytracers/historytracers.conf.new" 2>/dev/null || true
    else
        install -m 600 "\$SRC/etc/historytracers/historytracers.conf" "\${DESTDIR}\${SYSCONFDIR}/historytracers/historytracers.conf"
        chown historytracers:historytracers "\${DESTDIR}\${SYSCONFDIR}/historytracers/historytracers.conf" 2>/dev/null || true
        chmod 600 "\${DESTDIR}\${SYSCONFDIR}/historytracers/historytracers.conf" 2>/dev/null || true
        echo "  installed \${SYSCONFDIR}/historytracers/historytracers.conf"
        CONFIG_INSTALLED=1
    fi
fi

# Install systemd service (adjust paths for PREFIX) – non-fatal if no permission
SYSTEMD_INSTALLED=0
if [ -f "\$SRC/lib/systemd/system/historytracers.service" ]; then
    SYSTEMD_DEST=""
    if [ -n "\$DESTDIR" ]; then
        mkdir -p "\${DESTDIR}/lib/systemd/system" 2>/dev/null || mkdir -p "\${DESTDIR}\${PREFIX}/lib/systemd/system" 2>/dev/null || true
        if [ -d "\${DESTDIR}/lib/systemd/system" ]; then
            SYSTEMD_DEST="\${DESTDIR}/lib/systemd/system/historytracers.service"
        else
            SYSTEMD_DEST="\${DESTDIR}\${PREFIX}/lib/systemd/system/historytracers.service"
            mkdir -p "\$(dirname "\$SYSTEMD_DEST")"
        fi
    elif [ "\$(id -u 2>/dev/null || echo 0)" = "0" ]; then
        if [ -d "/lib/systemd/system" ]; then
            mkdir -p "/lib/systemd/system" 2>/dev/null || true
            SYSTEMD_DEST="/lib/systemd/system/historytracers.service"
        elif [ -d "/usr/lib/systemd/system" ]; then
            mkdir -p "/usr/lib/systemd/system" 2>/dev/null || true
            SYSTEMD_DEST="/usr/lib/systemd/system/historytracers.service"
        else
            mkdir -p "\${PREFIX}/lib/systemd/system"
            SYSTEMD_DEST="\${PREFIX}/lib/systemd/system/historytracers.service"
        fi
    else
        # Non-root: install to PREFIX
        mkdir -p "\${PREFIX}/lib/systemd/system" 2>/dev/null || mkdir -p "\${DESTDIR}\${PREFIX}/lib/systemd/system" 2>/dev/null || true
        SYSTEMD_DEST="\${PREFIX}/lib/systemd/system/historytracers.service"
        # If PREFIX is inside DESTDIR-like temp, ensure parent exists
        if [ ! -d "\$(dirname "\$SYSTEMD_DEST")" ]; then
            SYSTEMD_DEST="\${DESTDIR}\${PREFIX}/lib/systemd/system/historytracers.service"
            mkdir -p "\$(dirname "\$SYSTEMD_DEST")"
        fi
    fi
    if [ -n "\$SYSTEMD_DEST" ]; then
        if install -m 644 "\$SRC/lib/systemd/system/historytracers.service" "\$SYSTEMD_DEST" 2>/dev/null; then
            # Patch WorkingDirectory and ExecStart to match PREFIX
            sed -i "s|WorkingDirectory=/usr/share/historytracers|WorkingDirectory=\${PREFIX}/share/historytracers|g" "\$SYSTEMD_DEST" 2>/dev/null || true
            sed -i "s|ExecStart=/usr/bin/historytracers|ExecStart=\${PREFIX}/bin/historytracers|g" "\$SYSTEMD_DEST" 2>/dev/null || true
            sed -i "s|ExecStart=/usr/local/bin/historytracers|ExecStart=\${PREFIX}/bin/historytracers|g" "\$SYSTEMD_DEST" 2>/dev/null || true
            echo "  installed \$SYSTEMD_DEST"
            SYSTEMD_INSTALLED=1
            if [ -z "\$DESTDIR" ] && [ "\$(id -u 2>/dev/null || echo 0)" = "0" ] && command -v systemctl >/dev/null 2>&1; then
                systemctl daemon-reload 2>/dev/null || true
                echo "  (run 'systemctl enable --now historytracers' to start service)"
            fi
        else
            echo "  WARNING: cannot install systemd service to \$SYSTEMD_DEST (permission denied), skipping" >&2
            SYSTEMD_DEST=""
            SYSTEMD_INSTALLED=0
        fi
    fi
fi

# Write manifest for uninstall – record only files successfully installed this run
mkdir -p "\${MANIFEST_DIR}"
{
    echo "#VERSION=\${VERSION}"
    echo "\${PREFIX}/bin/historytracers"
    echo "\${PREFIX}/bin/historytracers-publisher"
    [ -f "\$SRC/bin/historytracers-editor" ] && echo "\${PREFIX}/bin/historytracers-editor"
    # installed exe files
    for _exe in \${INSTALLED_EXE:-}; do
        [ -n "\${_exe}" ] && echo "\${_exe}"
    done
    echo "\${PREFIX}/share/historytracers/www"
    [ -f "\$SRC/share/historytracers/editor.html" ] && echo "\${PREFIX}/share/historytracers/editor.html"
    echo "\${PREFIX}/share/doc/historytracers"
    if [ "\${CONFIG_INSTALLED:-0}" = "1" ]; then
        echo "\${SYSCONFDIR}/historytracers/historytracers.conf"
    fi
    if [ "\${SYSTEMD_INSTALLED:-0}" = "1" ] && [ -n "\${SYSTEMD_DEST:-}" ]; then
        _sd="\${SYSTEMD_DEST}"
        if [ -n "\${DESTDIR}" ] && [ "\${_sd#\${DESTDIR}}" != "\${_sd}" ]; then
            _sd="\${_sd#\${DESTDIR}}"
        fi
        echo "\${_sd}"
    fi
} > "\$MANIFEST_FILE"
echo "  wrote manifest \$MANIFEST_FILE"

echo ""
echo "HistoryTracers ${VERSION} installed successfully."
echo "  Binary: \${PREFIX}/bin/historytracers"
echo "  Content: \${PREFIX}/share/historytracers/www"
echo "  Config: \${SYSCONFDIR}/historytracers/historytracers.conf"
echo "Run: \${PREFIX}/bin/historytracers --help"
echo "Or: \${PREFIX}/bin/historytracers --dir \${PREFIX}/share/historytracers/www"
echo ""

exit 0
__ARCHIVE_BELOW__
HTSTATIC_HEADER

    # Append base64-encoded tarball (macOS-compatible: -w GNU, -b BSD/macOS, else fold)
    if base64 -w 76 /dev/null >/dev/null 2>&1; then
        base64 -w 76 "${TARBALL}" >> "${INSTALLER}"
    elif base64 -b 76 /dev/null >/dev/null 2>&1; then
        base64 -b 76 "${TARBALL}" >> "${INSTALLER}"
    else
        base64 "${TARBALL}" | fold -w 76 >> "${INSTALLER}"
    fi
    chmod +x "${INSTALLER}"
    echo "Static installer created: ${INSTALLER} ($(du -h "${INSTALLER}" | cut -f1))"

    # Cleanup staging
    rm -rf "${STAGING}"

    # Verify installer is valid
    if ! grep -q "^__ARCHIVE_BELOW__$" "${INSTALLER}"; then
        echo "ERROR: installer marker missing"
        exit 1
    fi
    echo "Verifying installer contents..."
    ARCHIVE_LINE=$(awk '/^__ARCHIVE_BELOW__$/ {print NR + 1; exit 0; }' "${INSTALLER}")
    if [ -z "${ARCHIVE_LINE}" ]; then
        echo "ERROR: cannot locate archive payload boundary"
        exit 1
    fi
    # Detect base64 decode (portable: GNU -d, BSD -D, --decode)
    B64_DECODE=""
    if base64 -d </dev/null >/dev/null 2>&1; then
        B64_DECODE="base64 -d"
    elif base64 --decode </dev/null >/dev/null 2>&1; then
        B64_DECODE="base64 --decode"
    elif base64 -D </dev/null >/dev/null 2>&1; then
        B64_DECODE="base64 -D"
    else
        echo "ERROR: base64 decode not available" >&2
        exit 1
    fi
    # Validate full archive (fail on tail/base64/tar errors) before showing sample
    if ! tail -n +"${ARCHIVE_LINE}" "${INSTALLER}" | $B64_DECODE | tar -tz >/dev/null; then
        echo "ERROR: verification failed (tail/base64/tar)"
        exit 1
    fi
    tail -n +"${ARCHIVE_LINE}" "${INSTALLER}" | $B64_DECODE | tar -tz | head -n 20
    echo "Verification OK (showing first 20 files)"

    trap - ERR
}

ht_usage() {
    cat <<HTDOC
        bash ht2pkg.sh [OPTIONS]

        --deb, -d               Create Debian package
        --rpm, -r               Create RPM package
        --slackbuild, -s        Create SlackBuilds files
        --msi, -m               Create MSI package (Windows/MSYS only)
        --static, -t            Create static installer (self-extracting .sh + tar.gz)
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
    cp -R ./*.md LICENSE Makefile.am README bodies configure.ac css csv editor.html gedcom historytracers-installer.sh historytracers2pkg.sh index.html js lang packaging scripts src webfonts "${DST}"
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

    # Editor fragment generation skipped — editor not shipped in this release
    # See commit history for the full editor-fragment.wxs generation block

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
        #"${WIXDIR}/editor-fragment.wxs" \
        -o "$OUTPUT_MSI" \
        -arch x64 \
        -d BuildDir="$BUILD_DIR" \
        -d WwwDir="$WWW_DIR" \
        -d ImagesDir="$IMAGES_DIR" \
        -d ProjectDir="$PROJECT_DIR"

    # ---- Cleanup ----
    rm -f "${WIXDIR}/www-fragment.wxs" "${WIXDIR}/images-fragment.wxs" \
          "${WIXDIR}/build-fragment.wxs" "${WIXDIR}/options-fragment.wxs"

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
        "--static" | "-t")
            MAKESTATIC="1"
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
if [ "${MAKERPM}" = "0" ] && [ "${MAKEDEB}" = "0" ] && [ "${MAKEMSI}" = "0" ] && [ "${MAKESLACKWARE}" = "0" ] && [ "${MAKESTATIC}" = "0" ]; then
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

if [ "${MAKESTATIC}" = "1" ]; then
    ht_build_static
fi

# This must be always the last
if [ "${MAKESLACKWARE}" = "1" ]; then
    ht_build_slackware
fi

