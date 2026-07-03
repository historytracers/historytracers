# Templates

This directory contains templates used to create content for **History Tracers**.

## Files

The following template files are available in this directory:

- `atlas_template.json`: Template for creating atlas pages.
- `class_template.json`: Template for pages in these sections: **First Steps**, **Understanding Texts**, **General History**, and **Indigenous (Who...?)**.
- `family_template.json`: Template for pages in the **Genealogical Trees** section.
- `scientific_method_game_template.json`: Template for creating levels in the **Scientific Method Game**.
- `source_template.json`: Base template used for all sections.

### Class Template Structure

This template contains five main sections:

#### Header Section

The header includes these fields:

- `title`: Displayed in the application/page title bar.
- `header`: Shown at the top of the page/section.
- `sources`: Array of referenced source files.
- `scripts`: Array of associated JavaScript files.
- `audio`: Links to external audio files.
- `index`: Array of related section files.
- `license`: Project licenses:
  - `SPDX-License-Identifier: GPL-3.0-or-later`.
  - `CC BY-NC 4.0 DEED`.
- `last_update`: Unix Epoch timestamp of last modification.
- `authors`: Array of contributor names.
- `reviewers`: Array of reviewer names.
- `version`: File format version (currently 1 or 2).
- `type`: Content type (always `class` for this template).
- `editing`: Current file status.

#### Content Section

Array of display content with these fields:

- `id`: Used to create `div` elements.
- `text`: Array containing:
  - `text`: Content in HTML/Markdown format.
  - `source`: Array of source objects with:.
    - `type`: Source classification:
      - 0: Primary
      - 1: Reference
      - 2: Religious
      - 3: Social Network
    - `uuid`: Unique identifier matching source file entries.
    - `text`: Citation text.
    - `date_time`: Publication date in epoch format.
- `date_time`: Array of dates referenced in content.
- `is_table`: Boolean flag for Markdown processing.
- `img_desc`: Audio description for images.
- `format`: Content format (`html` or `markdown`).
- `PostMention`: Trailing character/text (for lists or content endings).

#### Exercise V2 Section (Optional)

Runtime-loaded exercises containing:.

- `question`: Yes/No question prompt.
- `yesNoAnswer`: Correct answer (Yes/No).
- `additionalInfo`: Supplemental information displayed after answer validation.

#### Game V2 Section

Array containing image descriptions and their capture dates.

#### Date Time Section

Array of dates used in HTML content.
