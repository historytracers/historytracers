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
    find ./* \( -name "??-??" \) -exec bash -c 'cp ../src/json/class_template.json "$1/$2.json"; sed -i "s/A file containing all the sources referenced in the text./$2/g" "$1/$2.json"; sed -i "s/JavaScript files associated with this content, typically used for filling and correcting exercises./$2/g" "$1/$2.json" ; sed -i "s/The time of the last file update, represented as Unix Epoch time./$3/g" "$1/$2.json" ; sed -i "s/UPDATE_INDEX/$4/g" "$1/$2".json' shell {} "$1" "$CT" "$2" \;
}

ht_create_files() {
    ht_create_js_file "${1}"
    ht_create_source_file "${1}"
    ht_create_class_files "${1}" "${2}"
}

ht_error() {
    echo "Please specify the class type: science, history, indigenous_who, first_steps, or literature."
    exit 1;
}

if [ $# -ne 1 ]; then
    ht_error
fi

if [ "${1}" != "science" ] && [ "${1}" != "history" ] && [ "${1}" != "first_steps" ] && [ "${1}" != "indigenous_who" ] && [ "${1}" != "literature" ] ; then
    ht_error
fi

UUID=$(${RUN_UUID})

LENGTH=${#UUID}
if [ "${LENGTH}" -eq 0 ]; then
    echo "Unexpected output from \"uuidgen\""
    exit 1;
fi

ht_create_files "${UUID}" "${1}"

