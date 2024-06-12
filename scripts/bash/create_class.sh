#!/bin/bash

if ! command -v uuidgen >/dev/null 2>&1; then
    echo "You must install \"diff\" to use this script"
    exit 2
fi
RUN_UUID="$(command -v uuidgen)"

ht_create_js_file () {
    cp "../../src/js/classes.js" "../../js/$1.js" || exit
    PREFIX=$(echo "${1}" |cut -d- -f1)
    sed -i "s/localAnswerVector/localAnswerVector$PREFIX/g" "../../js/$1.js"
}

ht_create_source_file () {
    cp "../../src/json/sources_template.json" "../../lang/sources/$1.json" || exit
}

ht_create_class_files () {
    CT=$(date +%s)
    cd ../../lang || exit
    find ./* \( -name "??-??" \) -exec bash -c 'cp ../src/json/class_template.json "$1/$2".json; sed -i "s/File with all sources used in the text./$2/g" "$1/$2".json; sed -i "s/A JS file used with this content. Normally a file that fill and correct exercise./$2/g" "$1/$2".json ; sed -i "s/Time in Unix Epoch showing last file update./$3/g" "$1/$2".json ; sed -i "s/UPDATE_INDEX/$4/g" "$1/$2".json' shell {} "$1" "$CT" "$2" \;
}

ht_create_files() {
    ht_create_js_file "${1}"
    ht_create_source_file "${1}"
    ht_create_class_files "${1}" "${2}"
}

if [ $# -ne 1 ]; then
    echo "Please specify the class type: science, history, or kids."
    exit 1;
fi

if [ "${1}" != "science" ] && [ "${1}" != "history" ] && [ "${1}" != "kids" ] ; then
    echo "Invalid argument. Please use one of the following: science, history, or kids."
    exit 1;
fi

UUID=$(${RUN_UUID})

LENGTH=${#UUID}
if [ "${LENGTH}" -eq 0 ]; then
    echo "Script cannot run \"uuidgen\""
    exit 1;
fi

ht_create_files "${UUID}" "${1}"

