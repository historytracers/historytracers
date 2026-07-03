#!/bin/bash

if [ $# -ne 3 ]; then
    echo "Usage: $0 <current_directory> <previous_directory> <output_directory>"
    exit 1
fi

CURRENT_DIR="$1"
PREVIOUS_DIR="$2"
OUTPUT_DIR="$3"

# Validate directories
for dir in "$CURRENT_DIR" "$PREVIOUS_DIR"; do
    if [ ! -d "$dir" ]; then
        echo "Error: Directory '$dir' does not exist"
        exit 1
    fi
done

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Find and compare files
find "$CURRENT_DIR" -type f -printf "%P\n" | while read -r file; do
    current_file="$CURRENT_DIR/$file"
    previous_file="$PREVIOUS_DIR/$file"
    
    if [ ! -f "$previous_file" ] || ! cmp -s "$current_file" "$previous_file"; then
        # Create subdirectory structure in output if needed
        output_subdir=$(dirname "$OUTPUT_DIR/$file")
        mkdir -p "$output_subdir"
        
        echo "Copying modified/new file: $file"
        cp "$current_file" "$OUTPUT_DIR/$file"
    fi
done

echo "Done! Modified files copied to $OUTPUT_DIR"
