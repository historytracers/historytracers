# Videos — en-US

This directory contains video script files for the English language.

## Directory Structure

Each supported language has its own subdirectory following the pattern:

```text
videos/<locale>/<uuid>.txt
```

For example:

```text
videos/en-US/bbf4bee1-3436-4368-b669-9b9fc89455a3.txt
```

## File Format

Each `.txt` file is a video script (narration text) identified by a UUID. The file name (without extension) is the video UUID — the same UUID is shared across all three language directories (`en-US`, `es-ES`, `pt-BR`) for the same video.

### Script Content

A script file contains:

1. **Title line** — the video title and language in parentheses, e.g. `History Tracers — What is it? (English)`
2. **Blank line**
3. **Narration paragraphs** — the spoken text for the video, written as short paragraphs separated by blank lines

The narration is plain text. No markdown, no HTML, no timing markers. It is meant to be read aloud by a narrator or converted to speech.

### Constraints

- Maximum duration: **50 seconds** of spoken content (~120–150 words depending on language and pacing).
- The text must be self-contained — it should make sense without requiring visuals, though visuals may accompany it.
- Each language version should convey the same meaning, not a word-for-word translation. Natural phrasing in each language is preferred.

## Current Videos

| UUID | Title | Description |
|------|-------|-------------|
| `bbf4bee1-3436-4368-b669-9b9fc89455a3` | History Tracers — What is it? | An overview of History Tracers: interdisciplinary knowledge, how different cultures independently developed counting tools (Soroban, Suanpan, Schyoty, Yupana), and an invitation to learn on the open-source platform. |

## Adding a New Video

1. Generate a UUID: `cat /proc/sys/kernel/random/uuid`
2. Create the script file `videos/en-US/<uuid>.txt` with the narration text
3. Create the same file in `videos/es-ES/<uuid>.txt` and `videos/pt-BR/<uuid>.txt` with translated content
4. Keep all three files structurally identical (same number of paragraphs, same meaning)
5. Verify the word count stays within the50-second limit
