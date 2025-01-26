#!/bin/bash

# SPDX-License-Identifier: GPL-3.0-or-later
#
# Script used to generate History Tracers package

if ! command -v python3 >/dev/null 2>&1; then    
    if ! command -v python >/dev/null 2>&1; then    
        echo "You must install \"python\" to use this script"
        exit 1
    else
        RUN_PYTHON="$(command -v python)"
    fi
else
    RUN_PYTHON="$(command -v python3)"
fi

if ! command -v diff >/dev/null 2>&1; then    
    echo "You must install \"diff\" to use this script"
    exit 2
fi
RUN_DIFF="$(command -v diff)"

if ! command -v grep >/dev/null 2>&1; then    
    echo "You must install \"grep\" to use this script"
    exit 2
fi
RUN_GREP="$(command -v grep)"

ht_create_directories () {
    mkdir www/js
    mkdir www/css
    mkdir www/lang
    mkdir www/lang/sources

    cd lang || exit
    find ./* \( -name "??-??" \) -exec bash -c 'mkdir -p "../www/lang/$1/smGame/"' shell {} \;
    cd .. || exit
}

ht_copy_initial_files () {
    cp -R index.html bodies images webfonts www/
}

ht_compress_js () {
    for i in js/*.js ; do
        NAME=$(echo "$i" | cut -d/ -f2)
        # WITHOUT THIS TEST WE WILL HAVE AN ERROR
        if [ "${NAME}" = "calendar.js" ]; then
            cp $i "www/js/"
            continue;
        fi
        "${RUN_PYTHON}" -mrjsmin < "$i" > "www/js/$NAME"
    done
}

ht_compress_json_specific_dir () {
    for i in ${1}/*.json ; do
        NAME=$(echo "$i" | cut -d/ -f3)
        TEST=$(echo "$i" | grep "smGame")
        TEST1=$(echo "$i" | grep "README")
        if [ ${#TEST} -eq 0 ] && [ ${#TEST1} -eq 0 ] ; then
            "${RUN_PYTHON}" -mrcssmin < "$i" > "www/${1}/${NAME}"
        fi
    done

    for i in ${1}/smGame/*.json ; do
        NAME=$(echo "$i" | cut -d/ -f4)
        if [ ${#NAME} -gt 36 ] ; then
            if [ -f "${i}" ]; then
                "${RUN_PYTHON}" -mrcssmin < "$i" > "www/${1}/smGame/${NAME}"
            fi
        fi
    done
}

ht_compress_json_dir () {
    for i in lang/* ; do
        ht_compress_json_specific_dir "$i"
        ht_compress_json_specific_dir "$i/smGame"
    done
}

ht_copy_css () {
    cp css/* www/css
}

echo "Formating and publishing content"
cd scripts/bash/ || exit 1
bash update_js_css.sh
cd ../.. || exit 2

if [ ! -d www ]; then
    mkdir www;
else
    rm -rf www/*
fi

ht_copy_initial_files

ht_create_directories

ht_compress_js

ht_compress_json_dir

ht_copy_css

