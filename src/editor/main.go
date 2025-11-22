// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bufio"
	"fmt"
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
	app        fyne.App
	window     fyne.Window
	textArea   *widget.Entry
	filePath   string
	isModified bool
	statusBar  *widget.Label
}

func NewTextEditor() *TextEditor {
	editor := &TextEditor{
		app: app.NewWithID("com.example.texteditor"),
	}
	editor.setupUI()
	return editor
}

func (e *TextEditor) setupUI() {
	// Create main window
	e.window = e.app.NewWindow("Go Text Editor")
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

	helpMenu := fyne.NewMenu("Help",
		fyne.NewMenuItem("About", e.showAbout),
	)

	mainMenu := fyne.NewMainMenu(
		fileMenu,
		editMenu,
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
