#!/bin/bash

set -e

ht_select_model() {
    local SELECTOR=$RANDOM
    if [ "${1}" == "pt-BR" ]; then
        echo "pt_BR-faber-medium.onnx"
        return
    elif [ "${1}" == "es-ES" ]; then
        len=${#2}
        if [ "$len" -ne 0 ]; then
            echo "es_ES-${2}-medium.onnx"
            return 0
        fi

        if [ $SELECTOR -lt 16384 ]; then
            echo "es_ES-davefx-medium.onnx"
        else
            echo "es_ES-sharvard-medium.onnx"
        fi
        return 0
    fi

    len=${#2}
    if [ "$len" -ne 0 ]; then
        echo "en_US-${2}-medium.onnx"
        return 0
    fi

    if [ $SELECTOR -lt 16384 ]; then
        echo "en_US-amy-medium.onnx"
    else
        echo "en_US-norman-medium.onnx"
    fi

    return 0
}

ht_select_cfg() {
    SUB=$(echo "${1}" | cut -d. -f1)

    echo "$SUB.json"
}

ht_convert() {
    local IN_FILENAME SELLANG MODEL CFG
    IN_FILENAME="${1}"
    SELLANG=$(echo "$IN_FILENAME" | rev | cut -d_ -f1| rev)
    MODEL=$(ht_select_model "${SELLANG}" "${2}")
    CFG=$(ht_select_cfg "${MODEL}")

    echo "Using Model ${MODEL} to create ${IN_FILENAME}.wav"

    ./piper -m ."/models/$MODEL" -c "./config/$CFG" -f "${IN_FILENAME}.wav" < "$IN_FILENAME"
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

