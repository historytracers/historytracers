// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/storage"
)

func (e *TextEditor) createNewDocument() *Document {
	doc := &Document{
		filePath:   "",
		isModified: false,
		tabItem:    nil, // Initialize as nil, will be set in addDocument
	}
	editorContent := e.createEditorContent(doc)
	e.addDocument(doc, "Untitled", editorContent)
	return doc
}

func (e *TextEditor) newFile() {
	doc := e.createNewDocument()
	doc.content.OnChanged = func(_ string) {
		doc.isModified = true
		e.updateTabTitle(doc)
		e.updateTitle()
	}

	e.updateFamilyMenuItems(false)
	e.updateAtlasMenuItem(false)
	e.updateStatus("New file created")
}

func (e *TextEditor) addDocument(doc *Document, title string, content fyne.CanvasObject) {
	// Create tab title
	tabTitle := title
	if doc.isModified {
		tabTitle = "* " + tabTitle
	}

	doc.tabItem = container.NewTabItem(tabTitle, content)
	e.tabContainer.Append(doc.tabItem)
	e.documents = append(e.documents, doc)
	e.currentDoc = doc
	e.tabContainer.Select(doc.tabItem)
	isFamily := e.isFamilyDocument(doc)
	e.updateFamilyMenuItems(isFamily)
	isAtlas := e.isAtlasDocument(doc)
	e.updateAtlasMenuItem(isAtlas)
	e.updateTitle()
}

func (e *TextEditor) openFile() {
	dialog := dialog.NewFileOpen(func(reader fyne.URIReadCloser, err error) {
		if err != nil {
			dialog.ShowError(err, e.window)
			return
		}
		if reader == nil {
			return
		}
		defer reader.Close()

		filePath := reader.URI().Path()

		// Check if file is already open
		for _, doc := range e.documents {
			if doc.filePath == filePath {
				e.tabContainer.Select(doc.tabItem)
				e.updateStatus("File already open: " + filepath.Base(filePath))
				return
			}
		}

		doc := e.createNewDocument()
		e.loadDocument(doc, reader)
	}, e.window)

	dialog.SetFilter(storage.NewExtensionFileFilter([]string{".txt", ".md", ".json", ".html", ".css", ".js"}))
	dialog.Show()
}

func (e *TextEditor) openInNewTab() {
	dialog := dialog.NewFileOpen(func(reader fyne.URIReadCloser, err error) {
		if err != nil {
			dialog.ShowError(err, e.window)
			return
		}
		if reader == nil {
			return
		}
		defer reader.Close()

		doc := e.createNewDocument()
		e.loadDocument(doc, reader)
	}, e.window)

	dialog.SetFilter(storage.NewExtensionFileFilter([]string{".txt", ".md", ".json", ".html", ".css", ".js"}))
	dialog.Show()
}

func (e *TextEditor) loadDocument(doc *Document, reader fyne.URIReadCloser) {
	scanner := bufio.NewScanner(reader)
	var content strings.Builder
	for scanner.Scan() {
		content.WriteString(scanner.Text() + "\n")
	}

	if err := scanner.Err(); err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	doc.filePath = reader.URI().Path()
	doc.content.SetText(content.String())
	doc.isModified = false
	isFamily := e.isFamilyDocument(doc)
	e.updateFamilyMenuItems(isFamily)
	isAtlas := e.isAtlasDocument(doc)
	e.updateAtlasMenuItem(isAtlas)
	e.updateTabTitle(doc)
	e.updateStatus("Opened: " + filepath.Base(doc.filePath))
}

func (e *TextEditor) saveFile() {
	if e.currentDoc == nil {
		return
	}

	if e.currentDoc.filePath == "" {
		e.saveAsFile()
		return
	}

	e.validateAndSave(e.currentDoc, e.currentDoc.filePath)
}

func (e *TextEditor) saveAsFile() {
	if e.currentDoc == nil {
		return
	}

	dialog := dialog.NewFileSave(func(writer fyne.URIWriteCloser, err error) {
		if err != nil {
			dialog.ShowError(err, e.window)
			return
		}
		if writer == nil {
			return
		}
		defer writer.Close()

		filePath := writer.URI().Path()
		e.validateAndSave(e.currentDoc, filePath)

	}, e.window)

	// Set default filename based on current content
	defaultName := "untitled.json"
	if e.currentDoc.filePath != "" {
		defaultName = filepath.Base(e.currentDoc.filePath)
	}
	dialog.SetFileName(defaultName)
	dialog.SetFilter(storage.NewExtensionFileFilter([]string{".txt", ".md", ".json", ".html", ".css", ".js"}))
	dialog.Show()
}

func (e *TextEditor) saveAllFiles() {
	savedCount := 0
	errorCount := 0

	for _, doc := range e.documents {
		if doc.isModified {
			if doc.filePath == "" {
				// For untitled documents, we can't save them automatically.
				// One option is to select them and trigger saveAsFile,
				// but for now, we'll just skip them.
				continue
			}

			if !e.validateAndSave(doc, doc.filePath) {
				errorCount++
			} else {
				savedCount++
			}
		}
	}

	e.updateTitle() // Update window title in case any tab titles changed

	if errorCount > 0 {
		e.updateStatus(fmt.Sprintf("Saved %d files, but %d files had errors.", savedCount, errorCount))
	} else if savedCount > 0 {
		e.updateStatus(fmt.Sprintf("Saved %d files.", savedCount))
	} else {
		e.updateStatus("No files needed saving.")
	}
}

// validateAndSave checks for JSON errors before saving.
// It returns true if the save was successful, and false if there was an error.
func (e *TextEditor) validateAndSave(doc *Document, filePath string) bool {
	content := doc.content.Text

	// Check if it's a JSON file and validate it
	if strings.HasSuffix(strings.ToLower(filePath), ".json") {
		var js json.RawMessage
		err := json.Unmarshal([]byte(content), &js)
		if err != nil {
			// Show a more informative dialog
			errorDialog := dialog.NewConfirm(
				"JSON Syntax Error",
				fmt.Sprintf("Error in %s:\n%v\n\nDo you want to jump to the approximate error location?", filepath.Base(filePath), err),
				func(confirm bool) {
					if confirm {
						e.jumpToError(doc, err)
					}
				},
				e.window,
			)
			errorDialog.Show()
			return false // Indicate that the save was not successful
		}
	}

	// Proceed with saving the file
	writer, err := storage.Writer(storage.NewFileURI(filePath))
	if err != nil {
		dialog.ShowError(err, e.window)
		return false
	}
	defer writer.Close()

	_, err = writer.Write([]byte(content))
	if err != nil {
		dialog.ShowError(err, e.window)
		return false
	}

	// Update document state
	doc.filePath = filePath // Update in case of "Save As"
	doc.isModified = false
	e.updateTabTitle(doc)
	e.updateTitle()
	e.updateStatus(fmt.Sprintf("Saved: %s", filepath.Base(filePath)))

	return true // Indicate success
}

// jumpToError tries to parse the error and move the cursor
func (e *TextEditor) jumpToError(doc *Document, err error) {
	if e.tabContainer.Selected() != doc.tabItem {
		e.tabContainer.Select(doc.tabItem)
	}
	e.window.Canvas().Focus(doc.content)

	if syntaxError, ok := err.(*json.SyntaxError); ok {
		e.goToByteOffset(doc, int(syntaxError.Offset))
		return
	}

	// Fallback for other error types that might contain position info
	re := regexp.MustCompile(`(line|char|offset)\s+(\d+)`)
	matches := re.FindStringSubmatch(err.Error())

	if len(matches) == 3 {
		offset, _ := strconv.Atoi(matches[2])
		if matches[1] == "line" {
			e.goToLine(doc, offset)
		} else {
			e.goToByteOffset(doc, offset)
		}
	}
}

// goToLine moves the cursor to the beginning of a specific line.
func (e *TextEditor) goToLine(doc *Document, line int) {
	if line <= 0 {
		return
	}

	scanner := bufio.NewScanner(strings.NewReader(doc.content.Text))
	currentLine := 1
	byteOffset := 0

	for scanner.Scan() {
		if currentLine >= line {
			break
		}
		// Add length of the line + 1 for the newline character
		byteOffset += len(scanner.Bytes()) + 1
		currentLine++
	}

	e.goToByteOffset(doc, byteOffset)
}

// goToByteOffset moves the cursor to a specific byte offset.
func (e *TextEditor) goToByteOffset(doc *Document, offset int) {
	if offset < 0 {
		offset = 0
	}

	contentBytes := []byte(doc.content.Text)
	if offset > len(contentBytes) {
		offset = len(contentBytes)
	}

	// We need to find the row and column for the byte offset.
	// Fyne's Entry widget uses rune counts for columns.

	// Get text up to the offset
	sub := contentBytes[:offset]

	// Count lines before the offset
	row := strings.Count(string(sub), "\n")

	// Find the start of the current line
	lastNewline := strings.LastIndex(string(sub), "\n")

	// column is the number of runes since the last newline
	col := utf8.RuneCount(contentBytes[lastNewline+1 : offset])

	doc.content.CursorRow = row
	doc.content.CursorColumn = col
	doc.content.Refresh()
}
