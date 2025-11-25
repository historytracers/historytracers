// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	// "time"

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
		app:                app.NewWithID("org.historytracers"),
		documents:          make([]*Document, 0),
		selectedTemplateID: -1,
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
	// Template menu with shortcuts
	templateMenu := fyne.NewMenu("Templates",
		fyne.NewMenuItem("Load Template", e.showTemplateWindow),
		fyne.NewMenuItem("Set Template Directory", e.setTemplateDirectory),
		fyne.NewMenuItem("Refresh Templates", e.refreshTemplates),
	)

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
		fyne.NewMenuItemSeparator(),
		fyne.NewMenuItem("Exit", e.quit),
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
		templateMenu,
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

	// Template directory selection
	dirEntry := widget.NewEntry()
	dirEntry.SetPlaceHolder("Template directory path...")
	if e.templatePath != "" {
		dirEntry.SetText(e.templatePath)
	}

	// Selection info label
	selectionLabel := widget.NewLabel("Selected: None")

	// Template list
	templateList := widget.NewList(
		func() int {
			if e.templatePath == "" {
				return 0
			}
			files, err := e.getTemplateFiles()
			if err != nil {
				return 0
			}
			return len(files)
		},
		func() fyne.CanvasObject {
			return widget.NewLabel("Template file")
		},
		func(i widget.ListItemID, o fyne.CanvasObject) {
			if e.templatePath == "" {
				return
			}
			files, err := e.getTemplateFiles()
			if err != nil || i >= len(files) {
				return
			}
			o.(*widget.Label).SetText(filepath.Base(files[i]))
		},
	)

	// Track selection locally for this window
	var selectedTemplateID widget.ListItemID = -1

	// Set up selection callback
	templateList.OnSelected = func(id widget.ListItemID) {
		selectedTemplateID = id
		files, err := e.getTemplateFiles()
		if err == nil && id < len(files) {
			selectionLabel.SetText("Selected: " + filepath.Base(files[id]))
		}
	}

	templateList.OnUnselected = func(id widget.ListItemID) {
		selectedTemplateID = -1
		selectionLabel.SetText("Selected: None")
	}

	// Browse button for directory
	browseBtn := widget.NewButton("Browse", func() {
		dialog := dialog.NewFolderOpen(func(list fyne.ListableURI, err error) {
			if err != nil {
				dialog.ShowError(err, e.templateWindow)
				return
			}
			if list != nil {
				e.templatePath = list.Path()
				dirEntry.SetText(e.templatePath)
				templateList.Refresh()
				selectionLabel.SetText("Directory set: " + filepath.Base(e.templatePath))
			}
		}, e.templateWindow)
		dialog.Show()
	})

	// Set directory button
	setDirBtn := widget.NewButton("Set Directory", func() {
		path := dirEntry.Text
		if path == "" {
			dialog.ShowInformation("Empty Path", "Please enter a directory path", e.templateWindow)
			return
		}

		// Validate the directory exists
		if info, err := os.Stat(path); err != nil || !info.IsDir() {
			dialog.ShowError(fmt.Errorf("directory does not exist or is not accessible: %s", path), e.templateWindow)
			return
		}

		e.templatePath = path
		templateList.Refresh()
		selectionLabel.SetText("Directory set: " + filepath.Base(e.templatePath))
	})

	// Load template button
	loadBtn := widget.NewButton("Load Template", func() {
		if selectedTemplateID == -1 {
			dialog.ShowInformation("No Selection", "Please select a template file first", e.templateWindow)
			return
		}

		files, err := e.getTemplateFiles()
		if err != nil {
			dialog.ShowError(err, e.templateWindow)
			return
		}

		if selectedTemplateID < len(files) {
			e.loadTemplateFile(files[selectedTemplateID])
			e.templateWindow.Close() // Close after loading
		}
	})

	// Refresh button
	refreshBtn := widget.NewButton("Refresh", func() {
		if e.templatePath == "" {
			dialog.ShowInformation("No Directory", "Please set a template directory first", e.templateWindow)
			return
		}
		templateList.Refresh()
		selectionLabel.SetText("Templates refreshed")
	})

	// Close button
	closeBtn := widget.NewButton("Close", func() {
		e.templateWindow.Close()
	})

	// Directory controls
	dirControls := container.NewHBox(
		dirEntry,
		browseBtn,
		setDirBtn,
	)

	// Layout
	content := container.NewBorder(
		container.NewVBox(
			widget.NewLabel("Template Directory:"),
			dirControls,
			selectionLabel,
			widget.NewSeparator(),
			widget.NewLabel("Select a template file and click 'Load Template'"),
		),
		container.NewHBox(
			refreshBtn,
			loadBtn,
			closeBtn,
		),
		nil, nil,
		templateList,
	)

	e.templateWindow.SetContent(content)

	// Set up close handler to clear the reference
	e.templateWindow.SetOnClosed(func() {
		e.templateWindow = nil
	})

	e.templateWindow.Show()
}

func (e *TextEditor) refreshTemplateListWithCount() {
	if e.templateList != nil {
		e.templateList.Refresh()

		// Update file count
		files, err := e.getTemplateFiles()
		if err == nil {
			// We need to find and update the fileCountLabel in the window
			// For now, we'll just print it and rely on the initial setup
			fmt.Printf("Template files found: %d\n", len(files))
		} else {
			fmt.Printf("Error getting template files: %v\n", err)
		}
	}
}

func (e *TextEditor) loadTemplateFile(filePath string) {
	if e.currentDoc == nil {
		dialog.ShowInformation("No Document", "Please create or select a document first", e.window)
		return
	}

	file, err := os.Open(filePath)
	if err != nil {
		dialog.ShowError(err, e.window)
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
					e.updateTitle()
					e.updateStatus("Template loaded: " + filepath.Base(filePath))
				}
			}, e.window)
	} else {
		e.currentDoc.content.SetText(content.String())
		e.currentDoc.isModified = true
		e.updateTabTitle(e.currentDoc)
		e.updateTitle()
		e.updateStatus("Template loaded: " + filepath.Base(filePath))
	}
}

func (e *TextEditor) setTemplateDirectory() {
	dialog.ShowFolderOpen(func(list fyne.ListableURI, err error) {
		if err != nil {
			dialog.ShowError(err, e.window)
			return
		}
		if list != nil {
			e.templatePath = list.Path()
			e.updateStatus("Template directory set: " + e.templatePath)
		}
	}, e.window)
}

func (e *TextEditor) refreshTemplates() {
	if e.templatePath == "" {
		dialog.ShowInformation("No Directory", "Please set a template directory first", e.window)
		return
	}
	e.updateStatus("Templates refreshed")
}

func (e *TextEditor) refreshTemplateList() {
	if e.templateList != nil {
		fmt.Println("Refreshing template list...")
		e.templateList.Refresh()

		// Debug: print file count
		files, err := e.getTemplateFiles()
		if err != nil {
			fmt.Printf("Error refreshing: %v\n", err)
		} else {
			fmt.Printf("Template files available: %d\n", len(files))
		}
	}
}

func (e *TextEditor) getTemplateFiles() ([]string, error) {
	if e.templatePath == "" {
		return nil, fmt.Errorf("no template directory set")
	}

	// Check if directory exists
	if _, err := os.Stat(e.templatePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("template directory does not exist: %s", e.templatePath)
	}

	var templateFiles []string
	err := filepath.Walk(e.templatePath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			ext := strings.ToLower(filepath.Ext(path))
			// Support common template/text file extensions
			switch ext {
			case ".txt", ".md", ".html", ".css", ".js", ".json":
				templateFiles = append(templateFiles, path)
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return templateFiles, nil
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
	HTParseArg()
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
