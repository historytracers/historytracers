## Scripts

This directory contains various scripts used to generate content for the History Tracers project.

### Subdirectories

The directory is organized into the following subdirectories:

-  `bash`: Contains Bash scripts for creating files used in History Tracers.
-  `python`: Contains Python scripts for generating images used in the project.

### Bash subirectory

The Bash scripts are designed to run within their respective directory. When necessary, they will automatically change the directory to perform their tasks.

Available scripts:

-  `create_class.sh`: Generates class files based on the provided argument (`science`, `history`, or `first_steps`). 
-  `create_game.sh`: Creates files for the  `Scientific Method` game. Future games can modify this script to create their own files.
-  `create_language.sh`: Sets up a new language directory and generates the necessary files for it.
-  `ht_tts.sh`: Convert a text specified in one of the input files (`PT_TEXT`, `ES_TEXT` or `EN_TEXT`) into a WAV file.
-  `update_js_css.sh`: Updates the index whenever files in the `src` directory are modified.

### Python subirectory

These scripts can be run from any directory, but you will need to move the generated images to the appropriate directory.

Currently, all available scripts in this subdirectory generate images for the section titled `The universe and us`.

Available scripts:

-  `2daxis.py`: Generates a 2D chart image.
-  `line.py`: Generates a 1D chart image.
-  `parallelepiped.py`: Generates an image of a parallelepiped.

