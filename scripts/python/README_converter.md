# History Tracers Citation Converter

This Python script converts HTML citations to JSON format citations in History Tracers language files.

## Usage

```bash
# Analyze a specific file (read-only)
python3 convert_citations.py en-US/main.json --analyze-only

# Convert a specific file (modifies the file)
python3 convert_citations.py pt-BR/main.json

# Analyze all files (original behavior)
python3 convert_citations.py --analyze-all

# Show help
python3 convert_citations.py --help
```

## What it does

1. **Finds HTML citations** in the format:
   ```html
   <a href="#" onclick="htCleanSources(); htFillReferenceSource('UUID'); return false;">Text</a>
   ```
2. **Finds existing JSON citations** in the format:
   ```html
   <htciteX>
   ```
3. **Creates UUID mapping** from UUIDs to citation numbers
4. **Converts HTML citations** to JSON format `<htciteX>`
5. **Creates backups** before modifying files
6. **Modifies files** (unless in analyze-only mode)

## Conversion Logic

- Each unique UUID gets assigned a number starting from 0
- HTML citations become `<htciteX>` where X is the assigned number
- The same UUID always gets the same citation number within a file
- Citation numbers restart from 0 for each file
- Automatic backup creation before any modification

## Example Output

```
History Tracers Citation Converter
==================================================
Processing: lang/en-US/main.json
====================================
HTML citations found: 3
JSON citations found: 0
Unique UUIDs: 3
Created backup: lang/en-US/main.json.backup

--- CONVERSION SUMMARY ---
UUIDs converted: 3
Note: Source arrays would need to be created separately based on UUID mapping
Successfully modified: lang/en-US/main.json

Operation completed successfully!
```

## Command Line Options

- **filename**: Specific JSON file to process (e.g., `pt-BR/main.json`)
- **--analyze-only**: Only analyze without modifying the file
- **--analyze-all**: Analyze all JSON files (original behavior)
- **--help**: Show help message

## Key Features

- **Safe with Backups**: Creates `.backup` files before modification
- **Targeted**: Process specific files instead of all files
- **Flexible**: Analyze-only mode for previewing changes
- **Comprehensive**: Handles nested JSON structures recursively
- **Preserving**: Maintains original JSON formatting
- **Informative**: Detailed conversion statistics and examples

## Dependencies

- Python 3.6+
- Standard library only (no external dependencies)
- argparse for command line handling

## Files Processed

The script can process any `*.json` files:
- `lang/en-US/main.json`
- `lang/es-ES/first_steps_menu.json` 
- `lang/pt-BR/main.json`
- Any file in `lang/` directory

## Safety Features

- **Automatic Backups**: Creates `.backup` file before any modification
- **Error Recovery**: Attempts to restore from backup if modification fails
- **Validation**: Checks file existence before processing
- **Preview Mode**: `--analyze-only` to preview changes without modification

## Output

For each file processed, the script shows:
- Number of HTML citations found
- Number of existing JSON citations
- UUID to citation number mapping
- Backup file creation confirmation
- Conversion summary
- Success/failure status

## Next Steps After Conversion

After converting HTML citations to JSON format, you would need to:
1. Create source arrays based on the UUID mapping
2. Add the actual source data to the `source` fields
3. Test that the converted citations work correctly
4. Remove the backup files if satisfied with changes