#!/bin/bash

DST=""
MESSAGE=""

ht_copy_files() {
    cd '../../lang' || exit
    for i in "en-US"/*.json; do
        FILENAME=$(echo "$i" | cut -d/ -f2 )
        if [ -f "$1$FILENAME" ]; then
            echo "$1$FILENAME is already present."
        else
            payload="$(cat <<ANOTHERLANG
{
    "nothing" : "$2"
}
ANOTHERLANG
            )"
            echo "$payload" > "$1$FILENAME"
        fi
    done
}

ht_usage() {
    cat <<HTDOC
        "bash create_language.sh --path LANG --msg MESSAGE
        Create files inside new LANG directory that must be created manually."
HTDOC
}

while [[ $# -gt 0 ]]; do
    case "${1}" in
        "--path" | "-p")
            DST="$2"
            shift #pass argument
            shift #pass value
            ;;
        "--msg" | "-m")
            MESSAGE="$2"
            shift #pass argument
            shift #pass value
            ;;
        "--help" | "-h")
            ht_usage;
            exit 0;
            ;;
        *)
            ht_usage;
            exit 0;
            ;;
    esac
done

LENGTH=${#DST}
if [ "${LENGTH}" -eq 0 ]; then
    ht_usage;
    exit 0;
fi

ht_copy_files "${DST}" "${MESSAGE}"
