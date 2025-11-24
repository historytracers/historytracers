// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bufio"
	"fmt"
	"path/filepath"
	"strings"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/storage"
	"fyne.io/fyne/v2/widget"
)

func (e *TextEditor) createNewDocument() *Document {
	// Create text area
	textArea := widget.NewMultiLineEntry()
	textArea.Wrapping = fyne.TextWrapWord

	doc := &Document{
		content:    textArea,
		filePath:   "",
		isModified: false,
		tabItem:    nil, // Initialize as nil, will be set in addDocument
	}

	return doc
}

func (e *TextEditor) newFile() {
	doc := e.createNewDocument()
	e.addDocument(doc, "Untitled")

	// Set up modification tracking AFTER the document is fully added
	doc.content.OnChanged = func(_ string) {
		doc.isModified = true
		e.updateTabTitle(doc)
		e.updateTitle()
	}

	e.updateStatus("New file created")
}

func (e *TextEditor) addDocument(doc *Document, title string) {
	// Create tab title
	tabTitle := title
	if doc.isModified {
		tabTitle = "* " + tabTitle
	}

	doc.tabItem = container.NewTabItem(tabTitle, doc.content)
	e.tabContainer.Append(doc.tabItem)
	e.documents = append(e.documents, doc)
	e.currentDoc = doc
	e.tabContainer.Select(doc.tabItem)
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

		scanner := bufio.NewScanner(reader)
		var content strings.Builder
		for scanner.Scan() {
			content.WriteString(scanner.Text() + "\n")
		}

		if err := scanner.Err(); err != nil {
			dialog.ShowError(err, e.window)
			return
		}

		doc := e.createNewDocument()
		doc.filePath = filePath

		// Add document first, then set content to avoid triggering OnChanged before tab is created
		e.addDocument(doc, filepath.Base(filePath))

		// Now set up the modification tracking
		doc.content.OnChanged = func(_ string) {
			doc.isModified = true
			e.updateTabTitle(doc)
			e.updateTitle()
		}

		// Set the content after the callback is established
		doc.content.SetText(content.String())
		doc.isModified = false
		e.updateTabTitle(doc)

		e.updateStatus("Opened: " + filepath.Base(filePath))
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

		filePath := reader.URI().Path()

		scanner := bufio.NewScanner(reader)
		var content strings.Builder
		for scanner.Scan() {
			content.WriteString(scanner.Text() + "\n")
		}

		if err := scanner.Err(); err != nil {
			dialog.ShowError(err, e.window)
			return
		}

		doc := e.createNewDocument()
		doc.filePath = filePath

		// Add document first
		e.addDocument(doc, filepath.Base(filePath))

		// Set up modification tracking
		doc.content.OnChanged = func(_ string) {
			doc.isModified = true
			e.updateTabTitle(doc)
			e.updateTitle()
		}

		// Set content after callback is established
		doc.content.SetText(content.String())
		doc.isModified = false
		e.updateTabTitle(doc)

		e.updateStatus("Opened in new tab: " + filepath.Base(filePath))
	}, e.window)

	dialog.SetFilter(storage.NewExtensionFileFilter([]string{".txt", ".md", ".json", ".html", ".css", ".js"}))
	dialog.Show()
}

func (e *TextEditor) saveFile() {
	if e.currentDoc == nil {
		return
	}

	if e.currentDoc.filePath == "" {
		e.saveAsFile()
		return
	}

	writer, err := storage.Writer(storage.NewFileURI(e.currentDoc.filePath))
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}
	defer writer.Close()

	_, err = writer.Write([]byte(e.currentDoc.content.Text))
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	e.currentDoc.isModified = false
	e.updateTabTitle(e.currentDoc)
	e.updateTitle()
	e.updateStatus(fmt.Sprintf("Saved: %s", filepath.Base(e.currentDoc.filePath)))
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

		e.currentDoc.filePath = writer.URI().Path()
		_, err = writer.Write([]byte(e.currentDoc.content.Text))
		if err != nil {
			dialog.ShowError(err, e.window)
			return
		}

		e.currentDoc.isModified = false
		e.updateTabTitle(e.currentDoc)
		e.updateTitle()
		e.updateStatus(fmt.Sprintf("Saved as: %s", filepath.Base(e.currentDoc.filePath)))
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
	for _, doc := range e.documents {
		if doc.isModified && doc.filePath != "" {
			writer, err := storage.Writer(storage.NewFileURI(doc.filePath))
			if err != nil {
				dialog.ShowError(err, e.window)
				continue
			}

			_, err = writer.Write([]byte(doc.content.Text))
			writer.Close()

			if err != nil {
				dialog.ShowError(err, e.window)
				continue
			}

			doc.isModified = false
			e.updateTabTitle(doc)
			savedCount++
		}
	}

	e.updateTitle()
	if savedCount > 0 {
		e.updateStatus(fmt.Sprintf("Saved %d files", savedCount))
	} else {
		e.updateStatus("No files needed saving")
	}
}
