// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"

	"fmt"
	"path/filepath"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/driver/desktop"
	"fyne.io/fyne/v2/widget"
)

type Document struct {
	content    *widget.Entry
	filePath   string
	isModified bool
	tabItem    *container.TabItem
}

type TextEditor struct {
	app            fyne.App
	window         fyne.Window
	documents      []*Document
	currentDoc     *Document
	tabContainer   *container.DocTabs
	statusBar      *widget.Label
	templatePath   string
	templateWindow fyne.Window
}

func NewTextEditor() *TextEditor {
	editor := &TextEditor{
		app:       app.NewWithID("org.historytracers"),
		documents: make([]*Document, 0),
	}
	editor.setupUI()
	return editor
}

func (e *TextEditor) setupUI() {
	// Create main window
	e.window = e.app.NewWindow("History Tracers Editor")
	e.window.SetMaster()
	e.window.Resize(fyne.NewSize(1000, 700))

	// Create tab container
	e.tabContainer = container.NewDocTabs()
	e.tabContainer.OnClosed = func(item *container.TabItem) {
		e.closeTab(item)
	}
	e.tabContainer.OnSelected = func(item *container.TabItem) {
		e.switchToTab(item)
	}

	// Create status bar
	e.statusBar = widget.NewLabel("Ready")
	e.statusBar.Alignment = fyne.TextAlignLeading

	// Create menu
	e.createMenu()

	// Create toolbar
	// toolbar := e.createToolbar()

	// Layout - tabs are now the main content area
	content := container.NewBorder(
		nil,
		e.statusBar,
		nil, nil,
		e.tabContainer,
	)

	e.window.SetContent(content)

	e.setupShortcuts()

	// Create initial empty document
	e.newFile()
}

func (e *TextEditor) setupShortcuts() {
	addShortcut := func(key fyne.KeyName, action func()) {
		// Use fyne.KeyModifierShortcutDefault to handle OS differences (Ctrl on Win/Linux, Cmd on macOS)
		shortcut := &desktop.CustomShortcut{
			KeyName:  key,
			Modifier: fyne.KeyModifierShortcutDefault,
		}

		// Add the shortcut to the canvas
		e.window.Canvas().AddShortcut(shortcut, func(s fyne.Shortcut) {
			fmt.Printf("Shortcut triggered: %s\n", s.ShortcutName())
			action()
		})
	}

	// File operations
	// Note: Modifier is handled inside addShortcut using fyne.KeyModifierShortcutDefault
	addShortcut(fyne.KeyN, e.newFile)
	addShortcut(fyne.KeyO, e.openFile)
	addShortcut(fyne.KeyS, e.saveFile)
	addShortcut(fyne.KeyW, e.closeCurrentTab)

	// Tab navigation (Ctrl+Tab and Ctrl+Shift+Tab)
	// For specific, multi-modifier shortcuts, you need a separate handler

	// Ctrl+Tab (Next Tab)
	nextTabShortcut := &desktop.CustomShortcut{KeyName: fyne.KeyTab, Modifier: fyne.KeyModifierControl}
	e.window.Canvas().AddShortcut(nextTabShortcut, func(fyne.Shortcut) {
		e.nextTab()
	})

	// Ctrl+Shift+Tab (Previous Tab)
	prevTabShortcut := &desktop.CustomShortcut{
		KeyName:  fyne.KeyTab,
		Modifier: fyne.KeyModifierControl | fyne.KeyModifierShift,
	}
	e.window.Canvas().AddShortcut(prevTabShortcut, func(fyne.Shortcut) {
		e.previousTab()
	})

	// Quit - handled by window close intercept
	e.window.SetCloseIntercept(func() {
		e.quit()
	})
}

func (e *TextEditor) createMenu() {
	// File menu with shortcuts
	fileMenu := fyne.NewMenu("File",
		fyne.NewMenuItem("New", e.newFile),
		fyne.NewMenuItem("Open", e.openFile),
		fyne.NewMenuItem("Open in New Tab", e.openInNewTab),
		fyne.NewMenuItem("Save", e.saveFile),
		fyne.NewMenuItem("Save As", e.saveAsFile),
		fyne.NewMenuItem("Save All", e.saveAllFiles),
		fyne.NewMenuItemSeparator(),
		fyne.NewMenuItem("Close Tab", e.closeCurrentTab),
		fyne.NewMenuItem("Close All Tabs", e.closeAllTabs),
		fyne.NewMenuItemSeparator(),
		fyne.NewMenuItem("Load Template", e.showTemplateWindow),
	)

	// Edit menu with shortcuts
	editMenu := fyne.NewMenu("Edit",
		fyne.NewMenuItem("Cut", e.cutText),
		fyne.NewMenuItem("Copy", e.copyText),
		fyne.NewMenuItem("Paste", e.pasteText),
		fyne.NewMenuItem("Select All", e.selectAll),
	)

	// Tabs menu with shortcuts
	tabsMenu := fyne.NewMenu("Tabs",
		fyne.NewMenuItem("Next Tab", e.nextTab),
		fyne.NewMenuItem("Previous Tab", e.previousTab),
		fyne.NewMenuItemSeparator(),
		fyne.NewMenuItem("List All Tabs", e.showTabList),
	)

	// Help menu with shortcut
	helpMenu := fyne.NewMenu("Help",
		fyne.NewMenuItem("About", e.showAbout),
	)

	mainMenu := fyne.NewMainMenu(
		fileMenu,
		editMenu,
		tabsMenu,
		helpMenu,
	)

	e.window.SetMainMenu(mainMenu)
}

func (e *TextEditor) getCurrentDocIndex() int {
	for i, doc := range e.documents {
		if doc == e.currentDoc {
			return i
		}
	}
	return -1
}

func (e *TextEditor) getTabTitle(doc *Document) string {
	if doc.filePath == "" {
		return "Untitled"
	}
	return filepath.Base(doc.filePath)
}

func (e *TextEditor) updateTabTitle(doc *Document) {
	// Safe check: only update if tabItem exists
	if doc.tabItem == nil {
		return
	}

	title := e.getTabTitle(doc)
	if doc.isModified {
		title = "* " + title
	}
	doc.tabItem.Text = title
	e.tabContainer.Refresh()
}

func (e *TextEditor) updateTitle() {
	if e.currentDoc == nil {
		e.window.SetTitle("Go Text Editor")
		return
	}

	title := e.getTabTitle(e.currentDoc)
	if e.currentDoc.isModified {
		title = "* " + title
	}

	tabCount := len(e.documents)
	if tabCount > 1 {
		e.window.SetTitle(fmt.Sprintf("%s (%d tabs) - Go Text Editor", title, tabCount))
	} else {
		e.window.SetTitle(fmt.Sprintf("%s - Go Text Editor", title))
	}
}

func (e *TextEditor) showTemplateWindow() {
	// Always create a new window to avoid state issues
	e.templateWindow = e.app.NewWindow("Load Template")
	e.templateWindow.Resize(fyne.NewSize(500, 400))

	classBtn := widget.NewButton("Class Template", func() {
		e.loadTemplate("class")
		e.templateWindow.Close()
	})

	familyBtn := widget.NewButton("Family Template", func() {
		e.loadTemplate("family")
		e.templateWindow.Close()
	})

	// Add descriptions
	content := container.NewVBox(
		widget.NewLabel("Creates a new Atlas document structure"),
		widget.NewSeparator(),
		classBtn,
		widget.NewLabel("Creates a new Class document structure"),
		widget.NewSeparator(),
		familyBtn,
		widget.NewLabel("Creates a new Family document structure"),
		widget.NewSeparator(),
		widget.NewButton("Close", func() {
			e.templateWindow.Close()
		}),
	)

	e.templateWindow.SetContent(content)

	e.templateWindow.Show()
}

func (e *TextEditor) loadTemplate(templateType string) {
	var templateData interface{}
	var err error

	switch templateType {
	case "class":
		templateData = e.createClassTemplate()
	case "family":
		templateData = e.createFamilyTemplate()
	default:
		dialog.ShowError(fmt.Errorf("Unknown template type: %s", templateType), e.window)
		return
	}

	jsonBytes, err := json.MarshalIndent(templateData, "", "  ")
	if err != nil {
		dialog.ShowError(fmt.Errorf("Error creating template: %v", err), e.window)
		return
	}

	newDoc := &Document{
		content:    widget.NewMultiLineEntry(),
		filePath:   "",
		isModified: true,
	}

	newDoc.content.SetText(string(jsonBytes))
	e.addDocument(newDoc, "Untitled")
}

func (e *TextEditor) createClassTemplate() classTemplateFile {
	ret := classTemplateFile{}

	return ret
}

func (e *TextEditor) createFamilyTemplate() Family {
	ret := Family{}

	return ret
}

// Edit operations
func (e *TextEditor) cutText() {
	if e.currentDoc != nil {
		e.currentDoc.content.TypedShortcut(&fyne.ShortcutCut{Clipboard: e.window.Clipboard()})
	}
}

func (e *TextEditor) copyText() {
	if e.currentDoc != nil {
		e.currentDoc.content.TypedShortcut(&fyne.ShortcutCopy{Clipboard: e.window.Clipboard()})
	}
}

func (e *TextEditor) pasteText() {
	if e.currentDoc != nil {
		e.currentDoc.content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	}
}

func (e *TextEditor) selectAll() {
	if e.currentDoc != nil {
		e.currentDoc.content.TypedShortcut(&fyne.ShortcutSelectAll{})
	}
}

func (e *TextEditor) showAbout() {
	dialog.ShowInformation("About", "History Tracers Editor\n\nEditor used to create History Tracers content.\nVersion 1.0\n\nThis an Open Source software shared under the GPL-3.0-or-later license.", e.window)
}

func (e *TextEditor) quit() {
	// Check for unsaved changes in all documents
	unsavedCount := 0
	for _, doc := range e.documents {
		if doc.isModified {
			unsavedCount++
		}
	}

	if unsavedCount > 0 {
		dialog.ShowConfirm("Unsaved Changes",
			fmt.Sprintf("You have %d unsaved documents. Quit anyway?", unsavedCount),
			func(quit bool) {
				if quit {
					e.app.Quit()
				}
			}, e.window)
	} else {
		e.app.Quit()
	}
}

func (e *TextEditor) updateStatus(message string) {
	e.statusBar.SetText(message)
}

func (e *TextEditor) Run() {
	e.window.ShowAndRun()
}

// Theme workaround
var theme = struct {
	DocumentCreateIcon func() fyne.Resource
	FolderOpenIcon     func() fyne.Resource
	DocumentSaveIcon   func() fyne.Resource
	ContentCutIcon     func() fyne.Resource
	ContentCopyIcon    func() fyne.Resource
	ContentPasteIcon   func() fyne.Resource
	DocumentIcon       func() fyne.Resource
	InfoIcon           func() fyne.Resource
	MailForwardIcon    func() fyne.Resource
	MailReplyIcon      func() fyne.Resource
}{
	DocumentCreateIcon: nil,
	FolderOpenIcon:     nil,
	DocumentSaveIcon:   nil,
	ContentCutIcon:     nil,
	ContentCopyIcon:    nil,
	ContentPasteIcon:   nil,
	DocumentIcon:       nil,
	InfoIcon:           nil,
	MailForwardIcon:    nil,
	MailReplyIcon:      nil,
}

func main() {
	HTCreateDir()
	HTParseCreateConfig()

	editor := NewTextEditor()
	editor.Run()
}
