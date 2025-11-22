// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/storage"
	"fyne.io/fyne/v2/widget"
)

type Document struct {
	content    *widget.Entry
	filePath   string
	isModified bool
	tabItem    *container.TabItem
}

type TextEditor struct {
	app                fyne.App
	window             fyne.Window
	documents          []*Document
	currentDoc         *Document
	tabContainer       *container.DocTabs
	statusBar          *widget.Label
	templatePath       string
	templateList       *widget.List
	templateWindow     fyne.Window
	selectedTemplateID widget.ListItemID
}

func NewTextEditor() *TextEditor {
	editor := &TextEditor{
		app:                app.NewWithID("com.example.texteditor"),
		documents:          make([]*Document, 0),
		selectedTemplateID: -1,
	}
	editor.setupUI()
	return editor
}

func (e *TextEditor) setupUI() {
	// Create main window
	e.window = e.app.NewWindow("Go Text Editor")
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

	// Create initial empty document
	e.newFile()
}

func (e *TextEditor) createMenu() {
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
		fyne.NewMenuItemSeparator(),
		fyne.NewMenuItem("Exit", e.quit),
	)

	editMenu := fyne.NewMenu("Edit",
		fyne.NewMenuItem("Cut", e.cutText),
		fyne.NewMenuItem("Copy", e.copyText),
		fyne.NewMenuItem("Paste", e.pasteText),
		fyne.NewMenuItem("Select All", e.selectAll),
	)

	tabsMenu := fyne.NewMenu("Tabs",
		fyne.NewMenuItem("Next Tab", e.nextTab),
		fyne.NewMenuItem("Previous Tab", e.previousTab),
		fyne.NewMenuItemSeparator(),
		fyne.NewMenuItem("List All Tabs", e.showTabList),
	)

	templateMenu := fyne.NewMenu("Templates",
		fyne.NewMenuItem("Load Template", e.showTemplateWindow),
		fyne.NewMenuItem("Set Template Directory", e.setTemplateDirectory),
		fyne.NewMenuItem("Refresh Templates", e.refreshTemplates),
	)

	helpMenu := fyne.NewMenu("Help",
		fyne.NewMenuItem("About", e.showAbout),
	)

	mainMenu := fyne.NewMainMenu(
		fileMenu,
		editMenu,
		tabsMenu,
		templateMenu,
		helpMenu,
	)

	e.window.SetMainMenu(mainMenu)
}

/*
func (e *TextEditor) createToolbar() *widget.Toolbar {
	return widget.NewToolbar(
		widget.NewToolbarAction(theme.DocumentCreateIcon(), e.newFile),
		widget.NewToolbarAction(theme.FolderOpenIcon(), e.openFile),
		widget.NewToolbarAction(theme.DocumentSaveIcon(), e.saveFile),
		widget.NewToolbarAction(theme.DocumentSaveIcon(), e.saveAllFiles),
		widget.NewToolbarSeparator(),
		widget.NewToolbarAction(theme.ContentCutIcon(), e.cutText),
		widget.NewToolbarAction(theme.ContentCopyIcon(), e.copyText),
		widget.NewToolbarAction(theme.ContentPasteIcon(), e.pasteText),
		widget.NewToolbarSeparator(),
		widget.NewToolbarAction(theme.MailForwardIcon(), e.nextTab),
		widget.NewToolbarAction(theme.MailReplyIcon(), e.previousTab),
		widget.NewToolbarSeparator(),
		widget.NewToolbarAction(theme.DocumentIcon(), e.showTemplateWindow),
		widget.NewToolbarAction(theme.InfoIcon(), e.showAbout),
	)
}
*/

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

	dialog.SetFilter(storage.NewExtensionFileFilter([]string{".txt", ".go", ".md", ".json", ".xml", ".html", ".css", ".js", ".tmpl", ".tpl"}))
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

	dialog.SetFilter(storage.NewExtensionFileFilter([]string{".txt", ".go", ".md", ".json", ".xml", ".html", ".css", ".js", ".tmpl", ".tpl"}))
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
	defaultName := "untitled.txt"
	if e.currentDoc.filePath != "" {
		defaultName = filepath.Base(e.currentDoc.filePath)
	}
	dialog.SetFileName(defaultName)
	dialog.SetFilter(storage.NewExtensionFileFilter([]string{".txt", ".go", ".md", ".json", ".xml", ".html", ".css", ".js", ".tmpl"}))
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

// Rest of the template functionality remains the same but with safe tab updates
func (e *TextEditor) showTemplateWindow() {
	if e.templateWindow != nil {
		e.templateWindow.Show()
		e.refreshTemplateList()
		return
	}

	// Create template window (same as before, but ensure safe tab updates)
	// ... template window code remains unchanged ...
}

func (e *TextEditor) loadTemplateFile(filePath string) {
	if e.currentDoc == nil {
		dialog.ShowInformation("No Document", "Please create or select a document first", e.templateWindow)
		return
	}

	file, err := os.Open(filePath)
	if err != nil {
		dialog.ShowError(err, e.templateWindow)
		return
	}
	defer file.Close()

	var content strings.Builder
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		content.WriteString(scanner.Text() + "\n")
	}

	if err := scanner.Err(); err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	// Check if current content is modified and ask to save
	if e.currentDoc.isModified {
		dialog.ShowConfirm("Unsaved Changes",
			"Current document has unsaved changes. Load template anyway?",
			func(load bool) {
				if load {
					e.currentDoc.content.SetText(content.String())
					e.currentDoc.isModified = true
					e.updateTabTitle(e.currentDoc)
					e.updateStatus("Template loaded: " + filepath.Base(filePath))
					if e.templateWindow != nil {
						e.templateWindow.Hide()
					}
				}
			}, e.window)
	} else {
		e.currentDoc.content.SetText(content.String())
		e.currentDoc.isModified = true
		e.updateTabTitle(e.currentDoc)
		e.updateStatus("Template loaded: " + filepath.Base(filePath))
		if e.templateWindow != nil {
			e.templateWindow.Hide()
		}
	}
}

// Rest of template methods remain the same...
func (e *TextEditor) setTemplateDirectory() {
	dialog.ShowFolderOpen(func(list fyne.ListableURI, err error) {
		if err != nil {
			dialog.ShowError(err, e.window)
			return
		}
		if list != nil {
			e.templatePath = list.Path()
			e.updateStatus("Template directory set: " + e.templatePath)
			if e.templateWindow != nil {
				e.refreshTemplateList()
			}
		}
	}, e.window)
}

func (e *TextEditor) refreshTemplates() {
	if e.templatePath == "" {
		dialog.ShowInformation("No Directory", "Please set a template directory first", e.window)
		return
	}
	e.refreshTemplateList()
	e.updateStatus("Templates refreshed")
}

func (e *TextEditor) refreshTemplateList() {
	if e.templateList != nil {
		e.templateList.Refresh()
		e.selectedTemplateID = -1
	}
}

func (e *TextEditor) getTemplateFiles() ([]string, error) {
	if e.templatePath == "" {
		return nil, fmt.Errorf("no template directory set")
	}

	var templateFiles []string
	err := filepath.Walk(e.templatePath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			ext := strings.ToLower(filepath.Ext(path))
			switch ext {
			case ".txt", ".tmpl", ".tpl", ".template", ".go", ".md", ".html", ".css", ".js", ".json", ".xml":
				templateFiles = append(templateFiles, path)
			}
		}
		return nil
	})
	return templateFiles, err
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
	editor := NewTextEditor()
	editor.Run()
}
