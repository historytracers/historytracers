## src/

This directory contains source code files that serve as templates for content generation in the History Tracers project.

### Subdirectories

The directory structure is organized as follows:

- **`css/`**  
  Stylesheets for content formatting
- **`images/`**  
  Source files for the images are located in `images/HistoryTracers`.
- **`js/`**  
  JavaScript scripts used in games and text content
- **`json/`**  
  Contains all site content templates
- **`webserver/`**  
  Web server source code

### CSS Files

Style formatting is divided into two primary files:

- **`ht_common.css`**  
  Global styles used throughout the project
- **`ht_math.css`**  
  Specialized formatting for:
  - Yupana numerals
  - Mesoamerican numerals
  - Other mathematical elements

### JavaScript Files

These scripts function as content generation templates:

#### Core Scripts:
- **`ht_classes.js`**  
  Contains content loading functions and exercise correction logic
- **`ht_common.js`**  
  Main project script with shared functionality

#### Specialized Scripts:
- **`ht_charts.js`**  
  Integrates with [Chart.js](https://www.chartjs.org/) for data visualization
- **`ht_math.js`**  
  Mathematical operations and calculations

### JSON Templates

Content generation templates include:

#### Content Types:
- **`atlas_template.json`**  
  Geographic atlas content structure
- **`class_template.json`**  
  Classroom/lesson content framework

#### Specialized Templates:
- **`family_template.json`**  
  Genealogical relationship mapping
- **`scientific_method_game_template.json`**  
  Structure for the *Scientific Method* game
- **`sources_template.json`**  
  Citation and reference format for other templates
