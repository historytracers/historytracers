#!/bin/bash

set -eo pipefail

# Detect platform
case "$(uname -s)" in
    Linux)
        PLATFORM="linux"
        PUBLISHER_BIN="historytracers-publisher"
        ;;
    CYGWIN*|MINGW*|MSYS*)
        PLATFORM="msys2"
        PUBLISHER_BIN="historytracers-publisher.exe"

        # Prefer the UCRT64 environment when this MSYS2 installation provides it.
        # UCRT64 is the recommended toolchain on modern MSYS2; switching to it
        # early makes configure/make pick the UCRT64 Go compiler and MinGW-w64
        # C compiler instead of the default MSYS2 ones. When /ucrt64 is missing
        # (or has no toolchain), fall back to the default MSYS2 environment.
        MSYS2_ENV="${MSYSTEM:-MSYS}"
        if [ "$MSYS2_ENV" != "UCRT64" ] && [ -d /ucrt64 ]; then
            if [ -x /ucrt64/bin/x86_64-w64-mingw32-gcc ] \
                || [ -x /ucrt64/bin/gcc ] \
                || [ -x /ucrt64/bin/go.exe ] \
                || [ -x /ucrt64/bin/go ]; then
                export MSYSTEM=UCRT64
                export MINGW_PREFIX=/ucrt64
                export MINGW_CHOST=x86_64-w64-mingw32
                export MINGW_PACKAGE_PREFIX=mingw-w64-ucrt-x86_64
                case ":$PATH:" in
                    *":/ucrt64/bin:"*) ;;
                    *) export PATH="/ucrt64/bin:$PATH" ;;
                esac
                export PKG_CONFIG_PATH="/ucrt64/lib/pkgconfig:/ucrt64/share/pkgconfig${PKG_CONFIG_PATH:+:$PKG_CONFIG_PATH}"
                export ACLOCAL_PATH="/ucrt64/share/aclocal${ACLOCAL_PATH:+:$ACLOCAL_PATH}"
                MSYS2_ENV="UCRT64"
            else
                echo "WARNING: /ucrt64 exists but no UCRT64 toolchain found; using default MSYS2 environment ($MSYS2_ENV)."
            fi
        fi

        # Pin GOROOT to the Go installation that will actually run. When the
        # UCRT64 environment (and therefore its Go) is selected, its GOROOT is
        # forced even if another value was inherited from a different MSYS2
        # environment. Otherwise an inherited GOROOT is kept, since it matches
        # the Go still in use, and a known location is used only when GOROOT is
        # unset.
        if [ "$MSYS2_ENV" = "UCRT64" ] && { [ -x /ucrt64/bin/go.exe ] || [ -x /ucrt64/bin/go ]; }; then
            if [ -d /ucrt64/lib/go ]; then
                export GOROOT="/ucrt64/lib/go"
            else
                unset GOROOT
            fi
        elif [ -z "${GOROOT:-}" ]; then
            for cand in "/c/Program Files/Go" "/c/Go" "/mingw64/lib/go"; do
                if [ -x "$cand/bin/go.exe" ] || [ -x "$cand/bin/go" ]; then
                    export GOROOT="$cand"
                    break
                fi
            done
        fi
        ;;
    *)
        echo "Unknown platform: $(uname -s)"
        exit 1
        ;;
esac

update_submodules() {
    echo "=== Updating submodules ==="
    git submodule update --init --recursive
    echo "=== Submodules updated ==="
}

compile() {
    echo "=== Platform: $PLATFORM${MSYS2_ENV:+ ($MSYS2_ENV)} ==="

    autoreconf -f -i
    echo "=== autoreconf done ==="

    LOCALPATH=$(pwd)
    LOGPATH="/tmp/"
    if [ "$PLATFORM" = "msys2" ]; then
        LOCALPATH=$(cygpath -m "$LOCALPATH")
        LOGPATH=$(cygpath -m "$LOGPATH")
    fi
    ./configure --with-conf-path="packaging/conf/dev.conf" \
                --with-src-path="${LOCALPATH}/" \
                --with-content-path="${LOCALPATH}/www/" \
                --with-log-path="${LOGPATH}"
    echo "=== configure done ==="

    make clean
    make all
    echo "=== build done ==="

    if [ -f "./build/historytracers-publisher.exe" ]; then
        PUBLISHER_BIN="historytracers-publisher.exe"
    elif [ -f "./build/historytracers-publisher" ]; then
        PUBLISHER_BIN="historytracers-publisher"
    else
        echo "ERROR: publisher binary not found in build/"
        ls -la build/
        exit 1
    fi
    # Pre-validation: check source dates before running publisher pipeline
    echo "=== pre-validating source dates ==="
    ./build/$PUBLISHER_BIN -checksources -src "${LOCALPATH}/" 2>&1 | tee -a historytracers.log || echo "WARNING: checksources found issues"

    echo "=== pre-validating UUID files across languages ==="
    ./build/$PUBLISHER_BIN -globalangtest -src "${LOCALPATH}/" 2>&1 | tee -a historytracers.log || echo "WARNING: globalangtest found issues"

#    echo "=== generating gallery index ==="
#    ./build/$PUBLISHER_BIN -gallery -src "${LOCALPATH}/" 2>&1 | tee -a historytracers.log || echo "WARNING: gallery generation found issues"

    ./build/$PUBLISHER_BIN -minify -audiofiles -gedcom -verbose >> historytracers.log 2> >(tee -a historytracers.log >&2)
    echo "=== publisher run complete (see historytracers.log) ==="
}

for arg in "$@"; do
    case "$arg" in
        --update-submodules|-u)
            update_submodules
            ;;
        *)
            echo "Unknown option: $arg"
            echo "Usage: $0 [--update-submodules|-u]"
            exit 1
            ;;
    esac
done

compile
