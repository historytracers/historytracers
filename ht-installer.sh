#!/bin/bash

set -e

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
    make publisher viewer
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
    ./build/$PUBLISHER_BIN -internal -minify -audiofiles -gedcom -verbose > historytracers.log 2>&1
    echo "=== publisher run complete (see historytracers.log) ==="
}

compile
