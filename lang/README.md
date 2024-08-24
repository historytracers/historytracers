## Languages

This directory contains JSON files that are loaded when pages are accessed.

### Add a new Language

To add a new language, the first step is to run the script `scripts/bash/create_language.sh`. This script will create a new directory for the language and generate empty files for the texts that have already been published, which are intended for translation.

Before publishing the translated files, we suggest modifying the `main.json` file in each language directory to set the current translation stage for the new language.

### Directories

The following subdirectories are present in this directory:

-  `aa-BB`: These are the language directories, where `aa` represents the language code, and  `BB` is the country code.
-  `source`: This directory contains files with the sources referenced in each language file.

