# SPDX-License-Identifier: GPL-3.0-or-later
#!/bin/bash

if ! command -v uuidgen >/dev/null 2>&1; then
    echo "You must install \"diff\" to use this script"
    exit 2
fi
RUN_UUID="$(command -v uuidgen)"

ht_create_source_file () {
    cp "../../src/json/sources_template.json" "../../lang/sources/$1.json" || exit
}

ht_create_game_files () {
    CT=$(date +%s)
    cd ../../lang || exit
    find ./* \( -name "??-??" \) -exec bash -c 'if [ ! -d "$1/smGame/" ]; then mkdir "$1/smGame/"; fi; cp ../src/json/scientific_method_game_template.json "$1/smGame/$2.json"; sed -i "s/A file containing all the sources referenced in the text./$2/g" "$1/smGame/$2.json"; sed -i "s/The time of the last file update, represented as Unix Epoch time./$3/g" "$1/smGame/$2.json"' shell {} "$1" "$CT" \;
}

ht_create_files() {
    ht_create_source_file "${1}"
    ht_create_game_files "${1}" "${2}"
}

UUID=$(${RUN_UUID})

LENGTH=${#UUID}
if [ "${LENGTH}" -eq 0 ]; then
    echo "Unexpected output from \"uuidgen\""
    exit 1;
fi

ht_create_files "${UUID}" "${1}"

