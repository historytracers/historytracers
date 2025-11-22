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

type TextEditor struct {
	app                fyne.App
	window             fyne.Window
	textArea           *widget.Entry
	filePath           string
	isModified         bool
	statusBar          *widget.Label
	templatePath       string
	templateList       *widget.List
	templateWindow     fyne.Window
	selectedTemplateID widget.ListItemID
}

func NewTextEditor() *TextEditor {
	editor := &TextEditor{
		app: app.NewWithID("org.historytracers"),
	}
	editor.setupUI()
	return editor
}

func (e *TextEditor) setupUI() {
	// Create main window
	e.window = e.app.NewWindow("History Tracers Editor")
	e.window.SetMaster()
	e.window.Resize(fyne.NewSize(800, 600))

	// Create text area
	e.textArea = widget.NewMultiLineEntry()
	e.textArea.Wrapping = fyne.TextWrapWord
	e.textArea.OnChanged = func(_ string) {
		e.setModified(true)
	}

	// Create status bar
	e.statusBar = widget.NewLabel("Ready")
	e.statusBar.Alignment = fyne.TextAlignLeading

	// Create menu
	e.createMenu()

	// Create toolbar
	// toolbar := e.createToolbar()

	// Layout
	content := container.NewBorder(
		//toolbar,
		nil,
		e.statusBar,
		nil, nil,
		e.textArea,
	)

	e.window.SetContent(content)
	e.updateTitle()
}

func (e *TextEditor) createMenu() {
	fileMenu := fyne.NewMenu("File",
		fyne.NewMenuItem("New", e.newFile),
		fyne.NewMenuItem("Open", e.openFile),
		fyne.NewMenuItem("Save", e.saveFile),
		fyne.NewMenuItem("Save As", e.saveAsFile),
		fyne.NewMenuItemSeparator(),
		fyne.NewMenuItem("Exit", e.quit),
	)

	editMenu := fyne.NewMenu("Edit",
		fyne.NewMenuItem("Cut", e.cutText),
		fyne.NewMenuItem("Copy", e.copyText),
		fyne.NewMenuItem("Paste", e.pasteText),
		fyne.NewMenuItem("Select All", e.selectAll),
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
		widget.NewToolbarSeparator(),
		widget.NewToolbarAction(theme.ContentCutIcon(), e.cutText),
		widget.NewToolbarAction(theme.ContentCopyIcon(), e.copyText),
		widget.NewToolbarAction(theme.ContentPasteIcon(), e.pasteText),
		widget.NewToolbarSeparator(),
		widget.NewToolbarAction(theme.InfoIcon(), e.showAbout),
	)
}
*/

func (e *TextEditor) showTemplateWindow() {
	if e.templateWindow != nil {
		e.templateWindow.Show()
		e.refreshTemplateList()
		return
	}

	// Create template window
	e.templateWindow = e.app.NewWindow("Load Template")
	e.templateWindow.Resize(fyne.NewSize(500, 400))

	// Template directory selection
	dirEntry := widget.NewEntry()
	dirEntry.SetPlaceHolder("Template directory path...")
	if e.templatePath != "" {
		dirEntry.SetText(e.templatePath)
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
				e.refreshTemplateList()
			}
		}, e.templateWindow)
		dialog.Show()
	})

	// Set directory button
	setDirBtn := widget.NewButton("Set Directory", func() {
		e.templatePath = dirEntry.Text
		e.refreshTemplateList()
	})

	// Template list
	e.templateList = widget.NewList(
		func() int {
			if e.templatePath == "" {
				return 0
			}
			files, _ := e.getTemplateFiles()
			return len(files)
		},
		func() fyne.CanvasObject {
			return widget.NewLabel("Template file")
		},
		func(i widget.ListItemID, o fyne.CanvasObject) {
			if e.templatePath == "" {
				return
			}
			files, _ := e.getTemplateFiles()
			if i < len(files) {
				o.(*widget.Label).SetText(filepath.Base(files[i]))
			}
		},
	)

	// Set up selection callback
	e.templateList.OnSelected = func(id widget.ListItemID) {
		e.selectedTemplateID = id
	}

	// Set up unselected callback
	e.templateList.OnUnselected = func(id widget.ListItemID) {
		e.selectedTemplateID = -1
	}

	// Load template button
	loadBtn := widget.NewButton("Load Template", func() {
		if e.selectedTemplateID == -1 {
			dialog.ShowInformation("No Selection", "Please select a template file", e.templateWindow)
			return
		}

		files, err := e.getTemplateFiles()
		if err != nil {
			dialog.ShowError(err, e.templateWindow)
			return
		}

		if e.selectedTemplateID < len(files) {
			e.loadTemplateFile(files[e.selectedTemplateID])
		}
	})

	// Double-click to load
	e.templateList.OnSelected = func(id widget.ListItemID) {
		e.selectedTemplateID = id
		files, err := e.getTemplateFiles()
		if err != nil {
			return
		}
		if id < len(files) {
			// Auto-load on double-click
			e.loadTemplateFile(files[id])
		}
	}

	// Directory controls
	dirControls := container.NewHBox(
		dirEntry,
		browseBtn,
		setDirBtn,
	)

	// Template info label
	infoLabel := widget.NewLabel("Select a template directory and choose a template to load")

	// Layout
	content := container.NewBorder(
		container.NewVBox(
			widget.NewLabel("Template Directory:"),
			dirControls,
			widget.NewSeparator(),
			infoLabel,
		),
		container.NewHBox(
			widget.NewButton("Refresh", e.refreshTemplates),
			loadBtn,
			widget.NewButton("Close", func() {
				e.templateWindow.Hide()
			}),
		),
		nil, nil,
		e.templateList,
	)

	e.templateWindow.SetContent(content)
	e.templateWindow.Show()
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
			// Support common template/text file extensions
			switch ext {
			case ".json", ".js":
				templateFiles = append(templateFiles, path)
			}
		}
		return nil
	})

	return templateFiles, err
}

func (e *TextEditor) loadTemplateFile(filePath string) {
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
	if e.isModified {
		dialog.ShowConfirm("Unsaved Changes",
			"Current document has unsaved changes. Load template anyway?",
			func(load bool) {
				if load {
					e.textArea.SetText(content.String())
					e.setModified(true)
					e.updateStatus("Template loaded: " + filepath.Base(filePath))
					if e.templateWindow != nil {
						e.templateWindow.Hide()
					}
				}
			}, e.window)
	} else {
		e.textArea.SetText(content.String())
		e.setModified(true)
		e.updateStatus("Template loaded: " + filepath.Base(filePath))
		if e.templateWindow != nil {
			e.templateWindow.Hide()
		}
	}
}

func (e *TextEditor) newFile() {
	if e.checkSave() {
		e.textArea.SetText("")
		e.filePath = ""
		e.setModified(false)
		e.updateTitle()
		e.updateStatus("New file created")
	}
}

func (e *TextEditor) openFile() {
	if !e.checkSave() {
		return
	}

	dialog := dialog.NewFileOpen(func(reader fyne.URIReadCloser, err error) {
		if err != nil {
			dialog.ShowError(err, e.window)
			return
		}
		if reader == nil {
			return
		}
		defer reader.Close()

		e.filePath = reader.URI().Path()
		scanner := bufio.NewScanner(reader)
		var content strings.Builder
		for scanner.Scan() {
			content.WriteString(scanner.Text() + "\n")
		}

		if err := scanner.Err(); err != nil {
			dialog.ShowError(err, e.window)
			return
		}

		e.textArea.SetText(content.String())
		e.setModified(false)
		e.updateTitle()
		e.updateStatus(fmt.Sprintf("Opened: %s", filepath.Base(e.filePath)))
	}, e.window)

	dialog.SetFilter(storage.NewExtensionFileFilter([]string{".txt", ".md", ".json", ".html", ".css", ".js"}))
	dialog.Show()
}

func (e *TextEditor) saveFile() {
	if e.filePath == "" {
		e.saveAsFile()
		return
	}

	writer, err := storage.Writer(storage.NewFileURI(e.filePath))
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}
	defer writer.Close()

	_, err = writer.Write([]byte(e.textArea.Text))
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	e.setModified(false)
	e.updateTitle()
	e.updateStatus(fmt.Sprintf("Saved: %s", filepath.Base(e.filePath)))
}

func (e *TextEditor) saveAsFile() {
	dialog := dialog.NewFileSave(func(writer fyne.URIWriteCloser, err error) {
		if err != nil {
			dialog.ShowError(err, e.window)
			return
		}
		if writer == nil {
			return
		}
		defer writer.Close()

		e.filePath = writer.URI().Path()
		_, err = writer.Write([]byte(e.textArea.Text))
		if err != nil {
			dialog.ShowError(err, e.window)
			return
		}

		e.setModified(false)
		e.updateTitle()
		e.updateStatus(fmt.Sprintf("Saved as: %s", filepath.Base(e.filePath)))
	}, e.window)

	dialog.SetFileName("untitled.txt")
	dialog.SetFilter(storage.NewExtensionFileFilter([]string{".txt", ".go", ".md", ".json", ".xml", ".html", ".css", ".js"}))
	dialog.Show()
}

func (e *TextEditor) cutText() {
	e.textArea.TypedShortcut(&fyne.ShortcutCut{Clipboard: e.window.Clipboard()})
}

func (e *TextEditor) copyText() {
	e.textArea.TypedShortcut(&fyne.ShortcutCopy{Clipboard: e.window.Clipboard()})
}

func (e *TextEditor) pasteText() {
	e.textArea.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
}

func (e *TextEditor) selectAll() {
	e.textArea.TypedShortcut(&fyne.ShortcutSelectAll{})
}

func (e *TextEditor) showAbout() {
	dialog.ShowInformation("About", "History Tracers Editor\n\nEditor used to create content for History Tracers Project.\nVersion 1.0", e.window)
}

func (e *TextEditor) quit() {
	if e.checkSave() {
		e.app.Quit()
	}
}

func (e *TextEditor) checkSave() bool {
	if !e.isModified {
		return true
	}

	dialog.ShowConfirm("Unsaved Changes",
		"Do you want to save your changes?",
		func(save bool) {
			if save {
				e.saveFile()
			}
			// Continue with the operation
		}, e.window)

	return true
}

func (e *TextEditor) setModified(modified bool) {
	e.isModified = modified
	e.updateTitle()
}

func (e *TextEditor) updateTitle() {
	filename := "Untitled"
	if e.filePath != "" {
		filename = filepath.Base(e.filePath)
	}

	modIndicator := ""
	if e.isModified {
		modIndicator = " *"
	}

	e.window.SetTitle(fmt.Sprintf("%s%s - Go Text Editor", filename, modIndicator))
}

func (e *TextEditor) updateStatus(message string) {
	e.statusBar.SetText(message)
}

func (e *TextEditor) Run() {
	e.window.ShowAndRun()
}

// Theme workaround - you might need to import the actual theme package
var theme = struct {
	DocumentCreateIcon func() fyne.Resource
	FolderOpenIcon     func() fyne.Resource
	DocumentSaveIcon   func() fyne.Resource
	ContentCutIcon     func() fyne.Resource
	ContentCopyIcon    func() fyne.Resource
	ContentPasteIcon   func() fyne.Resource
	InfoIcon           func() fyne.Resource
}{
	DocumentCreateIcon: nil,
	FolderOpenIcon:     nil,
	DocumentSaveIcon:   nil,
	ContentCutIcon:     nil,
	ContentCopyIcon:    nil,
	ContentPasteIcon:   nil,
	InfoIcon:           nil,
}

func main() {
	editor := NewTextEditor()
	editor.Run()
}
