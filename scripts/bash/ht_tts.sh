#!/bin/bash

#
# Install PIPER:
#   pip3 install piper-tts

set -e

ht_cmd_exists() {
    command -v "$1" >/dev/null 2>&1;
}

ht_check_or_create_dir() {
    local dir="$1"

    if [ ! -d "$dir" ]; then
        echo "Creating directory: $dir"
        mkdir -p "$dir" || { echo "Error: Failed to create $dir" >&2; return 2; }
        return 0  # New directory is empty
    fi

    if [ -z "$(ls -A "$dir")" ]; then
        return 0  # Empty
    else
        return 1  # Not empty
    fi
}

ht_download_models() {
   python3 -m piper.download_voices en_US-amy-medium
   python3 -m piper.download_voices en_US-lessac-medium

   python3 -m piper.download_voices es_ES-sharvard-medium
   python3 -m piper.download_voices es_ES-davefx-medium

   python3 -m piper.download_voices pt_BR-faber-medium
   
   mv *.onnx* models/
}

ht_select_model() {
    FILE=".ht_tts_${1}"
    SELECTOR=$(cat "${FILE}" 2>/dev/null || true)
    if [ "${1}" == "pt-BR" ]; then
        echo "pt_BR-faber-medium"
        return
    elif [ "${1}" == "es-ES" ]; then
        if [ "${SELECTOR}" == "es_ES-davefx-medium" ]; then
            echo "es_ES-sharvard-medium" > .ht_tts_es-ES
            echo "es_ES-davefx-medium"
        else
            echo "es_ES-davefx-medium" > .ht_tts_es-ES
            echo "es_ES-sharvard-medium"
        fi
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

ht_select_lang() {
    case "${1}" in
        *_en-US|*-en-US) echo "en-US" ;;
        *_es-ES|*-es-ES) echo "es-ES" ;;
        *_pt-BR|*-pt-BR) echo "pt-BR" ;;
        *) return 1 ;;
    esac
}

ht_convert() {
    local IN_FILENAME OUT_FILENAME SELLANG MODEL
    IN_FILENAME="${1}"
    OUT_FILENAME="${IN_FILENAME%.txt}"

    if ! SELLANG=$(ht_select_lang "${OUT_FILENAME}"); then
        ht_error
    fi

    MODEL=$(ht_select_model "${SELLANG}")

    echo "Using Model ${MODEL} to create ${OUT_FILENAME}.wav"

    python3 -m piper -m ."/models/$MODEL" -f "${OUT_FILENAME}.wav" --input-file "$IN_FILENAME"
    ffmpeg  -i "${OUT_FILENAME}.wav" "${OUT_FILENAME}.ogg"
}

ht_error() {
    echo "Please specify an input filename with a language suffix (_pt-BR, _es-ES, _en-US)."
    echo ""
    echo "Supported patterns:"
    echo "  UUID_en-US"
    echo "  UUID_UUID_en-US"
    echo ""
    echo "The .txt extension is also accepted:"
    echo "  UUID_en-US.txt"
    echo "  UUID_UUID_en-US.txt"
    echo ""
    echo "Example:"
    echo ""
    echo "./ht_tts.sh FILE_NAME_en-US"
    exit 1;
}


target_dir="models"
if ht_check_or_create_dir "$target_dir"; then
    if ! ht_cmd_exists "pip3"; then
        echo "Cannot install models"
        exit 1
    fi
    ht_download_models
fi

if [ $# -ne 1 ]; then
    ht_error
fi

ht_convert "${1}"

