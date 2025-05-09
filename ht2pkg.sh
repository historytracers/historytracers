#!/bin/bash

# SPDX-License-Identifier: GPL-3.0-or-later
#
# Script used to generate History Tracers package

if ! command -v go >/dev/null 2>&1; then    
    echo "You must install \"go\" to use this script"
    exit 1
fi

ht_create_directories () {
    mkdir -p artifacts/usr/bin/
    mkdir -p artifacts/etc/historytracers/
    mkdir -p artifacts/var/www/htdocs/historytracers/www
}

ht_copy_files () {
    cp historytracers artifacts/usr/bin/
    cp src/conf/historytracers.conf artifacts/etc/historytracers/
    cp -r www/* artifacts/var/www/htdocs/historytracers/www
    cp -r index.html audios bodies css gedcom images images_src js lang webfonts artifacts/var/www/htdocs/historytracers/
}

echo "Formating and publishing content"

if [ ! -d artifacts ]; then
    mkdir artifacts;
else
    rm -rf artifacts/*
fi

ht_create_directories

# Compile history tracers
make

# Run History Tracers
./historytracers -minify=true -audiofiles=true -gedcom=true

ht_copy_files

