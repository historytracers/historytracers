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
        # Set GOROOT if not set and Go is in a known location
        if [ -z "$GOROOT" ]; then
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
    echo "=== Platform: $PLATFORM ==="

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
