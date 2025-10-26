#!/bin/bash

# SPDX-License-Identifier: GPL-3.0-or-later
#
# Script used to generate History Tracers package

set -e

MAKERPM="0"
MAKEDEB="0"
MAKESLACKWARE="0"

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

# Compile history tracers
autoreconf -f -i
./configure
make all

# Run History Tracers
./build/historytracers -minify -audiofiles -gedcom -verbose > historytracers.log

ht_usage() {
    cat <<HTDOC
        bash ht2pkg".sh --deb --rpm --slackbuild
        Create installer packages."
HTDOC
}

ht_build_rpm() {
    echo "Building RPM package"
    # Create initial structure
    mkdir -p ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
    echo "%_topdir %(echo $HOME)/rpmbuild" > ~/.rpmmacros

    # Copy SPEC
    cp packaging/RPM/historytracers.spec ~/rpmbuild/SPECS

    # Create Structure
    mkdir -p ~/rpmbuild/SOURCES/usr/bin
    mkdir -p ~/rpmbuild/SOURCES/usr/share/historytracers/

    # Copies
    cp packaging/conf/historytracers.conf ~/rpmbuild/SOURCES/
    cp build/historytracers ~/rpmbuild/SOURCES/
    cp LICENSE README packaging/service/historytracers.service ~/rpmbuild/SOURCES/
    SRC=$(./build/historytracers -compilation | grep Content | cut -d: -f2)
    tSRC=$(echo "$SRC" | xargs)
    cp -r "$tSRC" ~/rpmbuild/SOURCES/usr/share/historytracers/www

    # Build Package
    rpmbuild -bb ~/rpmbuild/SPECS/historytracers.spec
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

    # shellcheck source=./packaging/Slackware/historytracers.info
    source packaging/Slackware/historytracers.info

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

    local DST
    mkdir -p "${DST}/www"
    cp -R ./*.md LICENSE Makefile.am README bodies configure.ac css csv gedcom ht2pkg.sh images index.html js lang packaging scripts src webfonts "${DST}"
    tar -acvf "artifacts/historytracers-${VERSION}.tar.xz" "${DST}"
}

if [ $# -lt 1 ]; then
    exit 0
fi

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
        "--help" | "-h")
            ;;
        *)
            ht_usage;
            exit 0;
            ;;
    esac
done

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

