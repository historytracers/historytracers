## Python

This directory contains scripts for generating content in the History Tracers project.

### Subdirectories

- **`bash/`**  
  Contains Bash scripts for file creation and project setup.
- **`python/`**  
  Contains Python scripts for image generation.

### Bash Scripts

All Bash scripts are designed to run within their respective directories and will handle directory changes automatically when needed.

#### Available Scripts:
- **`create_game.sh`**  
  Generates files for the *Scientific Method* game (modifiable for other games).
- **`create_language.sh`**  
  Sets up new language directories with template files.
- **`ht_tts.sh`**  
  Converts text to WAV audio using input files:
  - `PT_TEXT`
  - `ES_TEXT` 
  - `EN_TEXT`

#### Supporting Directory:
- **`models/`**  
  Contains models used by `ht_tts.sh` for text-to-speech conversion.

### Python Scripts

These scripts can be executed from any location, though generated images need manual placement in their final directories.

All current scripts produce images for the *First Steps* section.

#### Image Generation Scripts:
- **Basic Shapes**
  - `sphere.py` - Sphere visualization
  - `pyramid.py` - Pyramid visualization
  - `pentagonal_pyramid.py` - Pentagonal pyramid
  - `parallelepiped.py` - Parallelepiped

- **Charts & Graphs**
  - `2daxis.py` - 2D coordinate chart
  - `line.py` - 1D linear chart
  - `trigonometry.py` - Sine/cosine wave plots

- **Utilities**
  - `geographical2mathcoord.py` - Coordinate system conversion
  - `csv_to_gedcom.py` - Convert History Tracers CSV to GEDCOM
