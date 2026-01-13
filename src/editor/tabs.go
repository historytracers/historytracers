// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"fmt"
	"strings"

	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
)

func (e *TextEditor) closeCurrentTab() {
	if e.currentDoc != nil {
		e.closeTab(e.currentDoc.tabItem)
	}
}

func (e *TextEditor) closeAllTabs() {
	// Create a copy of documents to avoid modification during iteration
	docsToClose := make([]*Document, len(e.documents))
	copy(docsToClose, e.documents)

	for _, doc := range docsToClose {
		if !e.closeTab(doc.tabItem) {
			break // User cancelled one of the close operations
		}
	}
}

func (e *TextEditor) closeTab(tabItem *container.TabItem) bool {
	// Find the document for this tab
	var doc *Document
	var docIndex int = -1
	for i, d := range e.documents {
		if d.tabItem == tabItem {
			doc = d
			docIndex = i
			break
		}
	}

	if doc == nil {
		return true
	}

	// Check if document needs saving
	if doc.isModified {
		// Show dialog and handle response
		dialog.ShowConfirm("Unsaved Changes",
			fmt.Sprintf("Save changes to %s?", e.getTabTitle(doc)),
			func(save bool) {
				if save {
					if doc.filePath == "" {
						// For new unsaved files, we need to handle save-as flow
						// Set as current doc and trigger save-as
						e.currentDoc = doc
						e.tabContainer.Select(doc.tabItem)
						e.saveAsFile()
						// Note: The tab will remain open until user completes save-as
						return
					} else {
						// For existing files, save and then close
						e.saveFile()
					}
				}
				// Remove the tab after saving or if user chose not to save
				e.removeTab(doc, docIndex)
			}, e.window)
		return false // We'll handle removal in the callback
	}

	e.removeTab(doc, docIndex)
	return true
}

func (e *TextEditor) removeTab(doc *Document, index int) {
	if index < 0 || index >= len(e.documents) {
		return
	}

	// Remove from documents slice
	e.documents = append(e.documents[:index], e.documents[index+1:]...)

	// Remove from tab container
	e.tabContainer.Remove(doc.tabItem)

	// Update current document
	if len(e.documents) > 0 {
		e.currentDoc = e.documents[len(e.documents)-1]
		e.tabContainer.Select(e.currentDoc.tabItem)
		isFamily := e.isFamilyDocument(e.currentDoc)
		e.updateFamilyMenuItems(isFamily)
	} else {
		e.currentDoc = nil
		// Create a new empty document if all are closed
		e.newFile()
	}

	e.updateTitle()
}

func (e *TextEditor) switchToTab(tabItem *container.TabItem) {
	for _, doc := range e.documents {
		if doc.tabItem == tabItem {
			e.currentDoc = doc
			isFamily := e.isFamilyDocument(doc)
			e.updateFamilyMenuItems(isFamily)
			e.updateTitle()
			e.updateStatus("Switched to: " + e.getTabTitle(doc))
			break
		}
	}
}

func (e *TextEditor) nextTab() {
	if len(e.documents) <= 1 {
		return
	}

	currentIndex := e.getCurrentDocIndex()
	if currentIndex == -1 {
		return
	}

	nextIndex := (currentIndex + 1) % len(e.documents)
	e.tabContainer.Select(e.documents[nextIndex].tabItem)
}

func (e *TextEditor) previousTab() {
	if len(e.documents) <= 1 {
		return
	}

	currentIndex := e.getCurrentDocIndex()
	if currentIndex == -1 {
		return
	}

	previousIndex := (currentIndex - 1 + len(e.documents)) % len(e.documents)
	e.tabContainer.Select(e.documents[previousIndex].tabItem)
}

func (e *TextEditor) showTabList() {
	if len(e.documents) == 0 {
		dialog.ShowInformation("Tabs", "No open tabs", e.window)
		return
	}

	var tabNames []string
	for i, doc := range e.documents {
		status := ""
		if doc.isModified {
			status = " *"
		}
		tabNames = append(tabNames, fmt.Sprintf("%d. %s%s", i+1, e.getTabTitle(doc), status))
	}

	content := strings.Join(tabNames, "\n")
	dialog.ShowInformation("Open Tabs", content, e.window)
}
