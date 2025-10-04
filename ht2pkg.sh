# SPDX-License-Identifier: GPL-3.0-or-later
#
# Script used to generate History Tracers package

#!/bin/bash

set -e

ht_create_directories () {
    mkdir -p build-aux
    mkdir -p artifacts/usr/bin/
    mkdir -p artifacts/etc/historytracers/
    mkdir -p artifacts/var/www/htdocs/historytracers/www
}

ht_copy_files () {
    cp historytracers artifacts/usr/bin/
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
make maintainer-clean
rm -rf build-aux autom4te.cache aclocal.m4 configure config.h.in config.h config.log config.status Makefile.in Makefile

# Compile history tracers
autoreconf -f -i
./configure
make all

# Run History Tracers
./build/historytracers -minify -audiofiles -gedcom -verbose

ht_copy_files

