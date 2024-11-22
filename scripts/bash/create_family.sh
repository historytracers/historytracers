# SPDX-License-Identifier: GPL-3.0-or-later
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
    CT=$(date +%s)
    cp "../../src/json/sources_template.json" "../../lang/sources/$1.json" || exit
    sed -i "s/The time of the last file update, represented as Unix Epoch time./$CT/g" "../../lang/sources/$1.json"
}

ht_create_class_files () {
    CT=$(date +%s)
    cd ../../lang || exit
    find ./* \( -name "??-??" \) -exec bash -c 'cp ../src/json/family_template.json "$1/$2.json"; sed -i "s/Array of files where sources are defined./$2/g" "$1/$2.json"; sed -i "s/Array of JavaScript files that will be loaded./$2/g" "$1/$2.json" ; sed -i "s/The time of the last file update, represented as Unix Epoch time./$3/g" "$1/$2.json"' shell {} "$1" "$CT" "$2" \;
}

ht_create_files() {
    ht_create_js_file "${1}"
    ht_create_source_file "${1}"
    ht_create_class_files "${1}" "${2}"
}

UUID=$(${RUN_UUID})

LENGTH=${#UUID}
if [ "${LENGTH}" -eq 0 ]; then
    echo "Unexpected output from \"uuidgen\""
    exit 1;
fi

ht_create_files "${UUID}" "${1}"

