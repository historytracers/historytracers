#!/bin/bash

ht_create_js_file () {
    cp "../templates/js/classes.js" "../js/$1.js" || exit
}

ht_create_source_file () {
    cp "../templates/json/sources_template.json" "sources/$1.json" || exit
}

ht_create_class_files () {
    find ./* \( -name "??-??" \) -exec bash -c 'cp ../templates/json/class_template.json "$1/$2".json; sed -i "s/File with all sources used in the text./$2/g" "$1/$2".json; sed -i "s/A JS file used with this content. Normally a file that fill and correct exercise./$2/g" "$1/$2".json' shell {} "$1" \;
}

ht_create_files() {
    cd '../lang' || exit
    ht_create_js_file "$1"
    ht_create_source_file "$1"
    ht_create_class_files "$1"
}

UUID=$(uuidgen)

LENGTH=${#UUID}
if [ "${LENGTH}" -eq 0 ]; then
    echo "Script cannot run \"uuidgen\""
    exit 1;
fi

ht_create_files "${UUID}"

