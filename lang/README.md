## Languages

This directory contains JSON files that are loaded when pages are accessed.

### Add a new Language

To add a new language, the first step is to run the script `scripts/bash/create_language.sh`. This script creates a new directory for the language and generates empty files for texts that have already been published—these files are intended for translation.

Before publishing the translated files, we suggest modifying the `main.json` file in each language directory to set the current translation stage for the new language.

### Directories

The following subdirectories are present in this directory:

-  `aa-BB`: These are the language directories, where `aa` represents the language code, and  `BB` is the country code.
-  `aa-BB/smGame`: Files for the *Scientific Method* Game.
-  `source`: This directory contains files with the sources referenced in each language file.

