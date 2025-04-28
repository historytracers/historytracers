#!/bin/bash

set -e

ht_select_model() {
    local SELECTOR=$RANDOM
    if [ "${1}" == "pt-BR" ]; then
        echo "pt_BR-faber-medium.onnx"
        return
    elif [ "${1}" == "es-ES" ]; then
        if [ $SELECTOR -lt 16384 ]; then
            echo "es_ES-davefx-medium.onnx"
        else
            echo "es_ES-sharvard-medium.onnx"
        fi
        return
    fi

    if [ $SELECTOR -lt 16384 ]; then
        echo "en_US-amy-medium.onnx"
    else
        echo "en_US-norman-medium.onnx"
    fi

    return
}

ht_select_cfg() {
    SUB=$(echo "${1}" | cut -d. -f1)

    echo "$SUB.json"
}

ht_convert() {
    local IN_FILENAME SELLANG MODEL CFG
    IN_FILENAME="${1}"
    SELLANG=$(echo "$IN_FILENAME" | cut -d_ -f2)
    MODEL=$(ht_select_model "${SELLANG}")
    CFG=$(ht_select_cfg "${MODEL}")

    echo "Using Model ${MODEL} to create ${IN_FILENAME}.wav"

    ./piper -m ."/models/$MODEL" -c "./config/$CFG" -f "${IN_FILENAME}.wav" < "$IN_FILENAME"
    ffmpeg  -i "${IN_FILENAME}.wav" "${IN_FILENAME}.ogg"
}

ht_error() {
    echo "Please specify a filename with language suffix (_pt-BR, _es-ES, _en-US)."
    echo "Example:"
    echo ""
    echo "./ht_tts.sh FILE_NAME_en-US"
    exit 1;
}

if [ $# -ne 1 ]; then
    ht_error
fi

ht_convert "${1}"
