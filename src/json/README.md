# Templates

This directory contains templates used to create content in **History Tracers**.

## Files

The following files are available in this directory:

-  `class_template.json`: Template used to create pages in the following sections: **First Steps**, **Understanding Texts**, **General History**, and **Indigenous (Who...?)**.
-  `family_template.json`: Template used to create pages in the **Genealogical Trees** section.
-  `scientific_method_game_template.json`: Template used to create levels in the **Scientific Method Game**.
-  `source_template.json`: Template used to create source file used with all sections.

### Class Template

This file contains four different sections, listed below:

#### Header

The header includes the following fields:

- `title`: The name displayed in the application's or page's title bar.
- `header`: The name shown at the top of the page or section.
- `sources`: An array of files containing all sources referenced in the text.
- `scripts`: An array of JavaScript files associated with this content, typically used for filling and correcting exercises.
- `index`: An array of files containing all section files that the new file will belong to.
- `license`:  An array containing the two licenses used by the project:
  - `SPDX-License-Identifier: GPL-3.0-or-later`
  - `CC BY-NC 4.0 DEED`.
- `last_update`: The time of the last file update, represented in Unix Epoch time.
- `authors`: An array of names of contributors who edited the text.
- `reviewers"`:  An array of names of individuals who reviewed the text.
- `version`: A number indicating the file format version (currently, only 1 or 2 is used).
- `type`: The content type. For this file, it should be `class`.

#### Content

An array of content to be displayed on-screen:

- `id`: ID used to create a `div` element.
- `text`: An array with text elements.
    - `text`: The text in HTML or Markdown format.
    - `source`: An array of source objects with the following fields:
        - `type`: Possible values:
        - 0: Primary source
        - 1: Reference
        - 2: Religious
        - 3: Social Network
    - `uuid`: A universally unique identifier (UUID) for the source. This must match an entry in the associated source file.
    - `text`: The citation text.
    - `date`: A date object specifying the format and epoch when the source was published.
 - `date_time`: An array of dates used within the text.
 - `is_table`:  A flag (boolean value) used for proper Markdown compilation.
 - `format`:  The text format (`html` or `markdown`).
 - `PostMention`: A character or text appended after the content (typically used to indicate list beginnings or text endings).

#### Exercise V2

If present, exercises are loaded at runtime by the associated JavaScript file. This section contains an array of objects with the following fields:

- `question`: A Yes/No question.
- `yesNoAnswer`: The correct answer (Yes or No).
- `additionalInfo`: Supplementary information displayed after users validate their answers.

#### Date Time

An array of dates used in HTML texts.

