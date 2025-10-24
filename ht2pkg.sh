#!/bin/bash

# SPDX-License-Identifier: GPL-3.0-or-later
#
# Script used to generate History Tracers package

set -e

MAKERPM="0"
MAKEDEB="0"
MAKESLACKWARE="0"

ht_create_directories () {
    mkdir -p build-aux
    mkdir -p artifacts/usr/bin/
    mkdir -p artifacts/etc/historytracers/
    mkdir -p artifacts/var/www/htdocs/historytracers/www
}

ht_copy_files () {
    cp ./build/historytracers artifacts/usr/bin/
    cp src/conf/historytracers.conf artifacts/etc/historytracers/
    cp -r www/* artifacts/var/www/htdocs/historytracers/www
    cp -r index.html audios bodies css gedcom images js lang webfonts artifacts/var/www/htdocs/historytracers/
}

echo "Formating and publishing content"

if [ ! -d artifacts ]; then
    mkdir artifacts;
else
    rm -rf artifacts/*
fi

ht_create_directories

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

ht_copy_files

ht_usage() {
    cat <<HTDOC
        bash ht2pkg".sh --deb --rpm --slackbuild
        Create installer packages."
HTDOC
}

ht_build_rpm() {
    echo "Building RPM package"
    # Create initial structure
    # mkdir -p ~/rpmbuild/{BUILD,RPMS,SOURCES,SPECS,SRPMS}
    # echo "%_topdir %(echo $HOME)/rpmbuild" > ~/.rpmmacros
    #
    # Copy SPEC
    # cp packaging/historytracers.spec ~/rpmbuild/SPECS
    #
    # Create Structure
    # mkdir -p ~/rpmbuild/SOURCES/etc/historytracers/
    # mkdir -p ~/rpmbuild/SOURCES/usr/bin
    # mkdir -p ~/rpmbuild/SOURCES/usr/share/historytracers/
    #
    # Copies
    # cp packaging/conf/historytracers.conf ~/rpmbuild/SOURCES/etc/historytracers/
    # cp build/historytracers ~/rpmbuild/SOURCES/usr/bin
    # cp -R www/{bodies,css,csv,gedcom,images,index.html,js,lang/en-US,webfonts} ~/rpmbuild/SOURCES/usr/share/historytracers/
    #
    # Build Package
    # rpmbuild -bb ~/rpmbuild/SPECS/historytracers.spec
}

ht_build_deb() {
    echo "Building DEB package"
}

ht_build_slackware() {
    echo "Building Slackware package"
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

if [ "${MAKESLACKWARE}" == "1" ]; then
    ht_build_slackware
fi

