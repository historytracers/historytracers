#!/bin/bash

if ! command -v python3 >/dev/null 2>&1; then    
    if ! command -v python >/dev/null 2>&1; then    
        echo "You must install \"python\" to use this script"
        exit 1
    else
        RUN_PYTHON="$(command -v python)"
    fi
else
    RUN_PYTHON="$(command -v python3)"
fi

if ! command -v diff >/dev/null 2>&1; then    
    echo "You must install \"diff\" to use this script"
    exit 2
fi
RUN_DIFF="$(command -v diff)"

if ! command -v grep >/dev/null 2>&1; then    
    echo "You must install \"grep\" to use this script"
    exit 2
fi
RUN_GREP="$(command -v grep)"

for i in ../src/js/ht_*.js; do
    # Get current script
    NAME=$(echo "$i" | cut -d/ -f4 | cut -d. -f1)
    CURR_SCRIPT=$(${RUN_GREP} "$NAME" ../index.html| grep script)

    # Parse values
    FULL_NAME=$(echo "${CURR_SCRIPT}" | cut -d/ -f3 | cut -d? -f1)
    VERSION=$(echo "${CURR_SCRIPT}" | cut -d_ -f3 | cut -dv -f2 | cut -d. -f1)
    NEXT_VERSION=$((VERSION + 1))
    CUUID=$(echo "${CURR_SCRIPT}" | cut -d_ -f3 | cut -d= -f2| cut -d\" -f1)
    NEXT_UUID=$(uuidgen)

    "${RUN_PYTHON}" -mrjsmin < "$i" > tmp
    TEST=$("${RUN_DIFF}" "../js/${FULL_NAME}" "tmp")
    if [ "${#TEST}" -ne "0" ]; then

        echo "Modifying line: ${CURR_SCRIPT}"
        echo "Creation new file js/${NAME}_v${NEXT_VERSION}.js"
        mv tmp "../js/${NAME}_v${NEXT_VERSION}.js"
        CHANGEME="${FULL_NAME}?v=${CUUID}"
        NEW_VALUE="${NAME}_v${NEXT_VERSION}.js?v=${NEXT_UUID}"
        sed -i "s/${CHANGEME}/${NEW_VALUE}/g" ../index.html
        rm "../js/${FULL_NAME}"
    else
        rm tmp
    fi
done
