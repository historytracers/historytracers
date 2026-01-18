## src/

This directory contains source code files that serve as templates for content generation in the History Tracers project.

### Subdirectories

The directory structure is organized as follows:

- **`bodies/`**  
  HTML template files for content rendering
- **`common/`**  
  Shared Go source code used across webserver and editor
- **`css/`**  
  Stylesheets for content formatting
- **`editor/`**  
  Desktop editor source code (Fyne-based Go application)
- **`images/`**  
  Source files for the images are located in `images/HistoryTracers`.
- **`js/`**  
  JavaScript scripts used in games and text content
- **`json/`**  
  Contains all site content templates
- **`webserver/`**  
  Web server source code (Go application)

### Go Source Code

#### Common Module (`common/`)
Shared utilities and data structures used by both webserver and editor:

- **`config.go`**  
  Configuration management
- **`data-type.go`**  
  Data type definitions for genealogy and content
- **`timestamp.go`**  
  Timestamp utilities
- **`go.mod`**  
  Go module definition

#### Webserver Module (`webserver/`)
HTTP server for serving History Tracers content:

- **`main.go`**  
  Entry point for the web server
- **`server.go`**  
  HTTP server setup and routing
- **`common.go`**  
  Shared utilities and helpers
- **`config.go`**  
  Configuration handling
- **`audio.go`**  
  Audio file serving and processing
- **`atlas.go`**  
  Geographic atlas content handling
- **`class.go`**  
  Classroom/lesson content serving
- **`csv_gedcom.go`**  
  CSV and GEDCOM file processing
- **`minify.go`**  
  Minification utilities
- **`hash.go`**  
  Hash generation and verification
- **`git.go`**  
  Git integration for version tracking
- **`go.mod`**  
  Go module definition

#### Editor Module (`editor/`)
Desktop genealogy editor application:

- **`main.go`**  
  Entry point for the editor
- **`common.go`**  
  Shared utilities
- **`config.go`**  
  Configuration handling
- **`files.go`**  
  File operations and management
- **`tabs.go`**  
  Tab management in the editor interface
- **`settings.go`**  
  Editor settings
- **`go.mod`**  
  Go module definition

### HTML Templates

- **`bodies/main.html`**  
  Main HTML template for content rendering

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
- **`ht_chart.js`**  
  Integrates with [Chart.js](https://www.chartjs.org/) for data visualization
- **`ht_math.js`**  
  Mathematical operations and calculations

### JSON Templates

Content generation templates include:

#### Content Types:
- **`index_template.json`**  
  Index page content structure
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
