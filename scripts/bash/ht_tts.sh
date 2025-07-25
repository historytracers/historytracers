#!/bin/bash

#
# Install PIPER:
#   pip3 install piper-tts
#
# Download Voices
#   python3 -m piper.download_voices en_US-amy-medium
#   python3 -m piper.download_voices en_US-lessac-medium
#
#   python3 -m piper.download_voices es_ES-sharvard-medium
#   python3 -m piper.download_voices es_ES-davefx-medium
#
#   python3 -m piper.download_voices pt_BR-faber-medium

set -e

ht_select_model() {
    FILE=".ht_tts_${1}"
    SELECTOR=$(cat "${FILE}")
    if [ "${1}" == "pt-BR" ]; then
        echo "pt_BR-faber-medium"
        return
    elif [ "${1}" == "es-ES" ]; then
        len=${#2}
        if [ "$len" -ne 0 ]; then
            echo "es_ES-${2}-medium"
            return 0
        fi

        if [ "${SELECTOR}" == "es_ES-davefx-medium" ]; then
            echo "es_ES-sharvard-medium" > .ht_tts_es-ES
            echo "es_ES-davefx-medium"
        else
            echo "es_ES-davefx-medium" > .ht_tts_es-ES
            echo "es_ES-sharvard-medium"
        fi
        return 0
    fi

    len=${#2}
    if [ "$len" -ne 0 ]; then
        echo "en_US-${2}-medium"
        return 0
    fi

    if [ "${SELECTOR}" == "en_US-amy-medium" ]; then
        echo "en_US-lessac-medium" > .ht_tts_en-US
        echo "en_US-amy-medium"
    else
        echo "en_US-amy-medium" > .ht_tts_en-US
        echo "en_US-lessac-medium"
    fi

    return 0
}

ht_convert() {
    local IN_FILENAME SELLANG MODEL
    IN_FILENAME="${1}"
    SELLANG=$(echo "$IN_FILENAME" | rev | cut -d_ -f1| rev)
    MODEL=$(ht_select_model "${SELLANG}" "${2}")

    echo "Using Model ${MODEL} to create ${IN_FILENAME}.wav"

    python3 -m piper -m ."/models/$MODEL" -f "${IN_FILENAME}.wav" --input-file "$IN_FILENAME"
    ffmpeg  -i "${IN_FILENAME}.wav" "${IN_FILENAME}.ogg"
}

ht_error() {
    echo "Please specify a filename with language suffix (_pt-BR, _es-ES, _en-US)."
    echo "You can also specify the model you want to use as the second option."
    echo ""
    echo "Example:"
    echo ""
    echo "./ht_tts.sh FILE_NAME_en-US MODEL_NAME"
    exit 1;
}

if [ $# -lt 1 ] || [ $# -gt 2 ]; then
    ht_error
fi

ht_convert "${1}" "${2}"

