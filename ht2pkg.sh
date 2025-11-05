#!/bin/bash

# SPDX-License-Identifier: GPL-3.0-or-later
#
# Script used to generate History Tracers package

set -e

MAKERPM="0"
MAKEDEB="0"
MAKESLACKWARE="0"

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
        --validate, -v          Check if current script has issues.
        --help, -h              Show this Help
HTDOC
}

ht_build_rpm() {
    echo "Building RPM package"

    # Build Package
    rpmbuild -bb ./packaging/RPM/historytracers.spec \
        --define "_sourcedir $(pwd)" \
        --define "_builddir $(pwd)" \
        --define "_srcrpmdir $(pwd)/rpmbuild" \
        --define "_rpmdir $(pwd)/rpmbuild" \
        --define "_topdir $(pwd)/rpmbuild" #\
#        --define "_build_name_fmt %%{NAME}-%%{VERSION}-%%{RELEASE}.%%{ARCH}.rpm"
    cp rpmbuild/x86_64/historytracers-1.0.0-1.fc41.x86_64.rpm artifacts/
    rm -rf rpmbuild
}

ht_build_deb() {
    echo "Building DEB package"
    # Install dependencies
    # apt-get update
    # apt-get install devscripts debhelper dh-systemd build-essential
    #
    # cp -R packaging/Debian/ debian
    # chmod +x debian/rules
    #
    # dpkg-buildpackage -us -uc
    # debuild -us -uc
    #
    # rm -rf debian
}

ht_build_slackware() {
    echo "Building Slackware package"
    # Install dependencies

    # shellcheck source=./packaging/Slackware/historytracers.info
    source packaging/Slackware/historytracers.info

    local DST
    DST="historytracers-${VERSION}"
    # Create historytracers.tar.gz
    if [ -d "historytracers/" ]; then
        rm -rf historytracers
    fi

    if [ -d "${DST}" ]; then
        rm -rf "${DST}"
    fi

    mkdir historytracers
    cp packaging/Slackware/* historytracers
    cp README historytracers/

    tar -zcvf artifacts/historytracers.tar.gz historytracers

    # Create historytracers-VERSION.tar.xz
    make clean

    mkdir -p "${DST}/www"
    cp -R ./*.md LICENSE Makefile.am README bodies configure.ac css csv gedcom ht2pkg.sh images index.html js lang packaging scripts src webfonts "${DST}"
    tar -acvf "artifacts/historytracers-${VERSION}.tar.xz" "${DST}"

    rm -rf historytracers/ "${DST}"
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

# This must be always the last
if [ "${MAKESLACKWARE}" == "1" ]; then
    ht_build_slackware
fi

