#!/bin/bash

set -e

ht_select_input() {
    if [ "${1}" == "pt-BR" ]; then
        echo "PT_TEXT"
        return
    elif [ "${1}" == "es-ES" ]; then
        echo "ES_TEXT"
        return
    fi

    echo "EN_TEXT"
    return
}

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

    if [ $SELECTOR -lt 10000 ]; then
        echo "en_US-amy-medium.onnx"
    elif [ $SELECTOR -lt 20000 ]; then
        echo "en_US-joe-medium.onnx"
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
    local IN_FILENAME=$(ht_select_input "${1}")
    local MODEL=$(ht_select_model "${1}")
    local CFG=$(ht_select_cfg "${MODEL}")

    echo "Using Model ${MODEL} to create ${2}_${1}.wav"

    cat "$IN_FILENAME" | ./piper -m ."/models/$MODEL" -c "./config/$CFG" -f "${2}_${1}.wav"
    ffmpeg  -i "${2}_${1}.wav" "${2}_${1}.ogg"
}

ht_error() {
    echo "Please specify the language (pt-BR, es-ES, en-US) and the output filename."
    echo "Example:"
    echo ""
    echo "./ht_tts.sh pt-BR families"
    exit 1;
}

if [ $# -ne 2 ]; then
    ht_error
fi

ht_convert "${1}" "${2}"
