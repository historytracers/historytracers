// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bytes"
	"encoding/json"
	"os"
	"regexp"
	"strconv"
	"strings"

	"fmt"
	"path/filepath"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/dialog"
	"fyne.io/fyne/v2/driver/desktop"
	"fyne.io/fyne/v2/layout"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
	. "github.com/historytracers/common"
	"time"
)

type Document struct {
	content         *widget.Entry
	filePath        string
	isModified      bool
	tabItem         *container.TabItem
	lineNumbers     *widget.Label
	scrollContainer *container.Scroll
}

type toolbarActionWithLabel struct {
	widget.BaseWidget
	icon   fyne.Resource
	letter string
	action func()
}

func newToolbarActionWithLabel(icon fyne.Resource, letter string, action func()) *toolbarActionWithLabel {
	t := &toolbarActionWithLabel{icon: icon, letter: letter, action: action}
	t.ExtendBaseWidget(t)
	return t
}

func (t *toolbarActionWithLabel) ToolbarObject() fyne.CanvasObject {
	return t
}

func (t *toolbarActionWithLabel) CreateRenderer() fyne.WidgetRenderer {
	btn := widget.NewButtonWithIcon(t.letter, t.icon, t.action)
	btn.Importance = widget.MediumImportance
	return widget.NewSimpleRenderer(btn)
}

type TextEditor struct {
	app                    fyne.App
	window                 fyne.Window
	documents              []*Document
	currentDoc             *Document
	tabContainer           *container.DocTabs
	statusBar              *widget.Label
	templatePath           string
	templateWindow         fyne.Window
	toolbar                *widget.Toolbar
	hideToolbarMenuItem    *fyne.MenuItem
	contentToolbar         *widget.Toolbar
	contentToolbarMenuItem *fyne.MenuItem
	familyToolbar          *widget.Toolbar
	familyToolbarMenuItem  *fyne.MenuItem
	toolbarContainer       *fyne.Container
	searchQuery            string
	lastSearchPos          int
	searchResults          []int
	familyMenuItems        []*fyne.MenuItem
	familyMenuItem         *fyne.MenuItem
	atlasMapMenuItem       *fyne.MenuItem
	jsonEditorWindow       fyne.Window
	jsonEditorTabs         *container.AppTabs
	jsonHeadersForm        *widget.Form
	jsonContentEntry       *widget.Entry
	currentJSONDoc         *Document
	authorsCombo           *widget.Select
	reviewersCombo         *widget.Select
	licenseCombo           *widget.Select
	sourcesCombo           *widget.Select
	scriptsCombo           *widget.Select
	audioCombo             *widget.Select
}

func (e *TextEditor) findText() {
	if e.currentDoc == nil {
		return
	}

	entry := widget.NewEntry()
	entry.SetPlaceHolder(htGetText("find_placeholder"))

	var findDialog dialog.Dialog
	findNextButton := widget.NewButton(htGetText("find_next"), func() {
		e.findNext()
	})
	findNextButton.Disable()

	findDialog = dialog.NewCustomConfirm(htGetText("find"), htGetText("find"), htGetText("close"), container.NewVBox(
		entry,
		findNextButton,
	), func(find bool) {
		if !find {
			return
		}
		e.searchQuery = entry.Text
		e.lastSearchPos = 0
		e.searchResults = nil
		e.findNext()
		if len(e.searchResults) > 0 {
			findNextButton.Enable()
		}
	}, e.window)

	findDialog.Show()

	// Focus on entry for immediate typing
	entry.FocusGained()
}

func (e *TextEditor) findNext() {
	if e.currentDoc == nil || e.searchQuery == "" {
		return
	}

	content := e.currentDoc.content.Text
	if e.lastSearchPos >= len(content) {
		e.lastSearchPos = 0 // Reset search
	}

	pos := strings.Index(content[e.lastSearchPos:], e.searchQuery)
	if pos == -1 {
		if e.lastSearchPos != 0 {
			e.lastSearchPos = 0
			pos = strings.Index(content, e.searchQuery)
		}
	} else {
		pos += e.lastSearchPos
	}

	if pos != -1 {
		e.currentDoc.content.CursorRow, e.currentDoc.content.CursorColumn = e.posToRowCol(pos, content)
		e.currentDoc.content.Refresh()
		e.lastSearchPos = pos + len(e.searchQuery)

		// Scroll to show found text
		if e.currentDoc.scrollContainer != nil {
			scrollY := float32(e.currentDoc.content.CursorRow * 20)
			e.currentDoc.scrollContainer.ScrollToOffset(fyne.NewPos(0, scrollY))
		}
	}
}

func (e *TextEditor) posToRowCol(pos int, content string) (int, int) {
	row := 0
	col := 0
	for i, r := range content {
		if i == pos {
			break
		}
		if r == '\n' {
			row++
			col = 0
		} else {
			col++
		}
	}
	return row, col
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
	e.window = e.app.NewWindow(htGetText("editor_window_title"))
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
	e.statusBar = widget.NewLabel(htGetText("status_ready"))
	e.statusBar.Alignment = fyne.TextAlignLeading

	// Create menu
	e.createMenu()

	// Create toolbar
	e.toolbar = e.createToolbar()

	// Create content toolbar
	e.contentToolbar = e.createContentToolbar()

	// Create family toolbar
	e.familyToolbar = e.createFamilyToolbar()
	e.familyToolbar.Hide()

	// Create horizontal container for both toolbars with separator
	e.toolbarContainer = container.NewHBox(
		e.toolbar,
		widget.NewSeparator(),
		e.contentToolbar,
		widget.NewSeparator(),
		e.familyToolbar,
	)

	// Layout - tabs are now the main content area
	content := container.NewBorder(
		e.toolbarContainer,
		e.statusBar,
		nil, nil,
		e.tabContainer,
	)

	e.window.SetContent(content)

	e.setupShortcuts()

	// Create initial empty document
	e.newFile()
}

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
		widget.NewToolbarAction(theme.SettingsIcon(), e.showJSONEditor),
	)
}

func (e *TextEditor) createContentToolbar() *widget.Toolbar {
	dateBtn := newToolbarActionWithLabel(theme.HistoryIcon(), "D", e.insertDate)
	sourceBtn := newToolbarActionWithLabel(theme.InfoIcon(), "S", e.insertSource)
	textBtn := newToolbarActionWithLabel(theme.DocumentIcon(), "T", e.insertText)

	return widget.NewToolbar(
		dateBtn,
		sourceBtn,
		textBtn,
	)
}

func (e *TextEditor) createFamilyToolbar() *widget.Toolbar {
	haplogroupBtn := newToolbarActionWithLabel(theme.InfoIcon(), "H", e.insertFamilyPersonHaplogroup)
	birthBtn := newToolbarActionWithLabel(theme.InfoIcon(), "B", e.insertFamilyPersonBirth)
	baptismBtn := newToolbarActionWithLabel(theme.InfoIcon(), "Bp", e.insertFamilyPersonBaptism)
	deathBtn := newToolbarActionWithLabel(theme.InfoIcon(), "D", e.insertFamilyPersonDeath)
	personBtn := newToolbarActionWithLabel(theme.AccountIcon(), "P", e.insertFamilyPerson)
	parentsBtn := newToolbarActionWithLabel(theme.InfoIcon(), "Pr", e.insertFamilyPersonParents)
	marriageBtn := newToolbarActionWithLabel(theme.InfoIcon(), "M", e.insertFamilyPersonMarriage)
	divorcedBtn := newToolbarActionWithLabel(theme.InfoIcon(), "Di", e.insertFamilyPersonDivorced)
	familyBtn := newToolbarActionWithLabel(theme.HomeIcon(), "F", e.insertFamilyBody)

	return widget.NewToolbar(
		haplogroupBtn,
		birthBtn,
		baptismBtn,
		deathBtn,
		personBtn,
		parentsBtn,
		marriageBtn,
		divorcedBtn,
		widget.NewToolbarSeparator(),
		familyBtn,
	)
}

func (e *TextEditor) setupShortcuts() {
	// Quit - handled by window close intercept
	e.window.SetCloseIntercept(func() {
		e.quit()
	})
}

func (e *TextEditor) createMenu() {
	// File menu with shortcuts
	openMenuItem := fyne.NewMenuItem(htGetText("open"), e.openFile)
	openMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyO, Modifier: fyne.KeyModifierShortcutDefault}

	openInNewTabMenuItem := fyne.NewMenuItem(htGetText("open_in_new_tab"), e.openInNewTab)
	documentMenuItemFile := fyne.NewMenuItem(htGetText("document"), e.insertFamily)
	newMenuItem := fyne.NewMenuItem(htGetText("new"), e.showTemplateWindow)
	saveMenuItem := fyne.NewMenuItem(htGetText("save"), e.saveFile)
	saveMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyS, Modifier: fyne.KeyModifierShortcutDefault}

	saveAsMenuItem := fyne.NewMenuItem(htGetText("save_as"), e.saveAsFile)
	saveAllMenuItem := fyne.NewMenuItem(htGetText("save_all"), e.saveAllFiles)

	closeTabMenuItem := fyne.NewMenuItem(htGetText("close_tab"), e.closeCurrentTab)
	closeTabMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyW, Modifier: fyne.KeyModifierShortcutDefault}

	closeAllTabsMenuItem := fyne.NewMenuItem(htGetText("close_all_tabs"), e.closeAllTabs)

	fileMenu := fyne.NewMenu(htGetText("file_menu"),
		newMenuItem,
		openMenuItem,
		openInNewTabMenuItem,
		documentMenuItemFile,
		fyne.NewMenuItemSeparator(),
		saveMenuItem,
		saveAsMenuItem,
		saveAllMenuItem,
		fyne.NewMenuItemSeparator(),
		closeTabMenuItem,
		closeAllTabsMenuItem,
	)

	// Edit menu with shortcuts
	cutMenuItem := fyne.NewMenuItem(htGetText("cut"), e.cutText)
	cutMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyX, Modifier: fyne.KeyModifierShortcutDefault}
	copyMenuItem := fyne.NewMenuItem(htGetText("copy"), e.copyText)
	copyMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyC, Modifier: fyne.KeyModifierShortcutDefault}
	pasteMenuItem := fyne.NewMenuItem(htGetText("paste"), e.pasteText)
	pasteMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyV, Modifier: fyne.KeyModifierShortcutDefault}
	selectAllMenuItem := fyne.NewMenuItem(htGetText("select_all"), e.selectAll)
	selectAllMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyA, Modifier: fyne.KeyModifierShortcutDefault}

	editMenu := fyne.NewMenu(htGetText("edit_menu"),
		cutMenuItem,
		copyMenuItem,
		pasteMenuItem,
		fyne.NewMenuItemSeparator(),
		selectAllMenuItem,
	)

	findMenuItem := fyne.NewMenuItem(htGetText("find"), e.findText)
	findMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyF, Modifier: fyne.KeyModifierShortcutDefault}
	editMenu.Items = append(editMenu.Items, findMenuItem)

	toolsMenu := fyne.NewMenu(htGetText("tools"),
		fyne.NewMenuItem(htGetText("audio"), e.insertAudio),
		fyne.NewMenuItem(htGetText("exercise"), e.insertExercise),
		fyne.NewMenuItem(htGetText("game"), e.insertGame),
	)
	toolsMenuItem := fyne.NewMenuItem(htGetText("tools"), nil)
	toolsMenuItem.ChildMenu = toolsMenu

	e.familyMenuItems = []*fyne.MenuItem{
		fyne.NewMenuItem(htGetText("haplogroup"), e.insertFamilyPersonHaplogroup),
		fyne.NewMenuItem(htGetText("birth"), e.insertFamilyPersonBirth),
		fyne.NewMenuItem(htGetText("baptism"), e.insertFamilyPersonBaptism),
		fyne.NewMenuItem(htGetText("death"), e.insertFamilyPersonDeath),
		fyne.NewMenuItem(htGetText("person"), e.insertFamilyPerson),
		fyne.NewMenuItem(htGetText("parents"), e.insertFamilyPersonParents),
		fyne.NewMenuItem(htGetText("marriage"), e.insertFamilyPersonMarriage),
		fyne.NewMenuItem(htGetText("divorced"), e.insertFamilyPersonDivorced),
		fyne.NewMenuItem(htGetText("family"), e.insertFamilyBody),
	}
	familyMenu := fyne.NewMenu(htGetText("family_tree"),
		e.familyMenuItems[0],
		fyne.NewMenuItemSeparator(),
		e.familyMenuItems[1],
		e.familyMenuItems[2],
		e.familyMenuItems[3],
		e.familyMenuItems[4],
		e.familyMenuItems[5],
		e.familyMenuItems[6],
		e.familyMenuItems[7],
		fyne.NewMenuItemSeparator(),
		e.familyMenuItems[8],
	)
	e.familyMenuItem = fyne.NewMenuItem(htGetText("family_tree"), nil)
	e.familyMenuItem.ChildMenu = familyMenu

	insertMenu := fyne.NewMenu(htGetText("insert_menu"),
		fyne.NewMenuItem(htGetText("content"), nil),
		toolsMenuItem,
		fyne.NewMenuItemSeparator(),
		e.familyMenuItem,
		fyne.NewMenuItemSeparator(),
		fyne.NewMenuItem(htGetText("atlas"), nil),
	)
	insertMenu.Items[0].ChildMenu = fyne.NewMenu(htGetText("content"),
		fyne.NewMenuItem(htGetText("date"), e.insertDate),
		fyne.NewMenuItem(htGetText("source"), e.insertSource),
		fyne.NewMenuItem(htGetText("text"), e.insertText),
	)
	e.atlasMapMenuItem = fyne.NewMenuItem(htGetText("map"), e.insertAtlasMap)
	insertMenu.Items[5].ChildMenu = fyne.NewMenu(htGetText("atlas"),
		e.atlasMapMenuItem,
	)

	// Tabs menu with shortcuts
	nextTabMenuItem := fyne.NewMenuItem(htGetText("next_tab"), e.nextTab)
	nextTabMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyTab, Modifier: fyne.KeyModifierControl}

	prevTabMenuItem := fyne.NewMenuItem(htGetText("previous_tab"), e.previousTab)
	prevTabMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyTab, Modifier: fyne.KeyModifierControl | fyne.KeyModifierShift}

	listAllTabsMenuItem := fyne.NewMenuItem(htGetText("list_all_tabs"), e.showTabList)

	tabsMenu := fyne.NewMenu(htGetText("tabs_menu"),
		nextTabMenuItem,
		prevTabMenuItem,
		fyne.NewMenuItemSeparator(),
		listAllTabsMenuItem,
	)

	// Help menu with shortcut
	aboutMenuItem := fyne.NewMenuItem(htGetText("about"), e.showAbout)
	aboutMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyH, Modifier: fyne.KeyModifierShortcutDefault}

	helpMenu := fyne.NewMenu(htGetText("help_menu"),
		aboutMenuItem,
	)

	settingsMenu := fyne.NewMenu(htGetText("settings_menu"),
		fyne.NewMenuItem(htGetText("open_settings"), e.showSettingsWindow),
	)

	e.hideToolbarMenuItem = fyne.NewMenuItem(htGetText("toolbar"), e.toggleToolbar)
	e.hideToolbarMenuItem.Checked = true

	e.contentToolbarMenuItem = fyne.NewMenuItem(htGetText("content_toolbar"), e.toggleContentToolbar)
	e.contentToolbarMenuItem.Checked = true

	e.familyToolbarMenuItem = fyne.NewMenuItem(htGetText("family_toolbar"), e.toggleFamilyToolbar)
	e.familyToolbarMenuItem.Checked = false

	windowMenu := fyne.NewMenu(htGetText("window_menu"),
		e.hideToolbarMenuItem,
		e.contentToolbarMenuItem,
		e.familyToolbarMenuItem,
	)

	mainMenu := fyne.NewMainMenu(
		fileMenu,
		editMenu,
		insertMenu,
		tabsMenu,
		settingsMenu,
		windowMenu,
		helpMenu,
	)

	e.window.SetMainMenu(mainMenu)
}

func (e *TextEditor) toggleToolbar() {
	if e.toolbar.Visible() {
		e.toolbar.Hide()
		e.hideToolbarMenuItem.Checked = false
	} else {
		e.toolbar.Show()
		e.hideToolbarMenuItem.Checked = true
	}
	e.updateToolbarContainerVisibility()
	e.toolbarContainer.Refresh()
	e.window.MainMenu().Refresh()
}

func (e *TextEditor) toggleContentToolbar() {
	if e.contentToolbar.Visible() {
		e.contentToolbar.Hide()
		e.contentToolbarMenuItem.Checked = false
	} else {
		e.contentToolbar.Show()
		e.contentToolbarMenuItem.Checked = true
	}
	e.updateToolbarContainerVisibility()
	e.toolbarContainer.Refresh()
	e.window.MainMenu().Refresh()
}

func (e *TextEditor) toggleFamilyToolbar() {
	if e.familyToolbar.Visible() {
		e.familyToolbar.Hide()
		e.familyToolbarMenuItem.Checked = false
	} else {
		e.familyToolbar.Show()
		e.familyToolbarMenuItem.Checked = true
	}
	e.updateToolbarContainerVisibility()
	e.toolbarContainer.Refresh()
	e.window.MainMenu().Refresh()
}

func (e *TextEditor) updateToolbarContainerVisibility() {
	if !e.toolbar.Visible() && !e.contentToolbar.Visible() && !e.familyToolbar.Visible() {
		e.toolbarContainer.Hide()
	} else {
		e.toolbarContainer.Show()
	}
}

func (e *TextEditor) showSettingsWindow() {
	settingsWindow := e.app.NewWindow(htGetText("settings"))
	settingsWindow.Resize(fyne.NewSize(400, 300))

	configDir, err := os.UserConfigDir()
	if err != nil {
		settingsWindow.SetContent(container.NewVBox(

			widget.NewLabel(htGetText("failed_get_config_dir")),
		))
		CFG = NewHTConfig()

	} else {

		localPath := filepath.Join(configDir, SoftwareName+"/"+LocalConfigFile)
		if _, err := os.Stat(localPath); os.IsNotExist(err) {
			if err := HTCreateConfig(localPath); err != nil {
				settingsWindow.SetContent(container.NewVBox(
					widget.NewLabel(htGetText("failed_create_config")),
				))
				CFG = NewHTConfig()

			}
		} else {
			if err := HTParseConfig(localPath); err != nil {
				settingsWindow.SetContent(container.NewVBox(

					widget.NewLabel(htGetText("failed_read_config")),
				))
				CFG = NewHTConfig()
			}
		}
	}

	portEntry := widget.NewEntry()
	portEntry.SetText(fmt.Sprintf("%d", CFG.Port))

	srcPathEntry := widget.NewEntry()
	srcPathEntry.SetText(CFG.SrcPath)

	contentPathEntry := widget.NewEntry()
	contentPathEntry.SetText(CFG.ContentPath)

	logPathEntry := widget.NewEntry()
	logPathEntry.SetText(CFG.LogPath)

	confPathEntry := widget.NewEntry()
	confPathEntry.SetText(CFG.ConfPath)

	// Add language selector
	languageSelect := widget.NewSelect(LangConfig.AvailableLanguages, func(selected string) {})
	languageSelect.SetSelected(LangConfig.CurrentLanguage)
	languageSelect.OnChanged = func(selected string) {
		if err := htSetLanguage(selected); err != nil {
			dialog.ShowError(err, e.window)
		}
	}

	form := &widget.Form{
		Items: []*widget.FormItem{
			{Text: htGetText("port"), Widget: portEntry},
			{Text: htGetText("source_path"), Widget: srcPathEntry},
			{Text: htGetText("content_path"), Widget: contentPathEntry},
			{Text: htGetText("log_path"), Widget: logPathEntry},
			{Text: htGetText("config_path"), Widget: confPathEntry},
			{Text: htGetText("language"), Widget: languageSelect},
		},

		OnSubmit: func() {
			fmt.Sscan(portEntry.Text, &CFG.Port)
			CFG.SrcPath = srcPathEntry.Text
			CFG.ContentPath = contentPathEntry.Text
			CFG.LogPath = logPathEntry.Text
			CFG.ConfPath = confPathEntry.Text
			configDir, err := os.UserConfigDir()
			if err != nil {
				dialog.ShowError(err, e.window)
				return
			}
			localPath := filepath.Join(configDir, SoftwareName+"/"+LocalConfigFile)
			if err := HTCreateConfig(localPath); err != nil {
				dialog.ShowError(err, e.window)
			}
			settingsWindow.Close()
		},
		OnCancel: func() {
			settingsWindow.Close()
		},
		SubmitText: htGetText("save_button"),
	}

	settingsWindow.SetContent(container.NewVBox(
		widget.NewLabel(htGetText("settings")),

		form,
	))

	settingsWindow.Show()

}

func (e *TextEditor) showJSONEditor() {
	if e.jsonEditorWindow != nil {
		e.jsonEditorWindow.Show()
		e.jsonEditorWindow.RequestFocus()
		return
	}

	if e.currentDoc == nil {
		dialog.ShowError(fmt.Errorf("No document is currently open"), e.window)
		return
	}

	// Check if current document is JSON, if not show message
	if !e.isJSONDocument(e.currentDoc) {
		dialog.ShowError(fmt.Errorf("Current document is not a valid JSON file"), e.window)
		return
	}

	// Create JSON editor window
	e.jsonEditorWindow = e.app.NewWindow("JSON Source Editor")
	e.jsonEditorWindow.Resize(fyne.NewSize(800, 600))

	// Create headers form
	titleEntry := widget.NewEntry()
	headerEntry := widget.NewEntry()
	lastUpdateEntry := widget.NewDateEntry()
	versionEntry := widget.NewEntry()
	versionEntry.OnChanged = func(text string) {
		filtered := ""
		for _, r := range text {
			if r >= '0' && r <= '9' {
				filtered += string(r)
			}
		}
		if filtered != text {
			versionEntry.SetText(filtered)
		}
	}

	// Create combo boxes for array fields with add/remove buttons
	e.authorsCombo = widget.NewSelect(nil, nil)
	e.reviewersCombo = widget.NewSelect(nil, nil)
	e.licenseCombo = widget.NewSelect(nil, nil)
	e.sourcesCombo = widget.NewSelect(nil, nil)
	e.scriptsCombo = widget.NewSelect(nil, nil)
	e.audioCombo = widget.NewSelect(nil, nil)

	authorsAddBtn := widget.NewButtonWithIcon("", theme.ContentAddIcon(), func() {
		entry := widget.NewEntry()
		entry.SetPlaceHolder("Enter author...")
		dialog.ShowCustomConfirm("Add Author", "Add", "Cancel", entry, func(confirmed bool) {
			if confirmed && entry.Text != "" {
				e.authorsCombo.Options = append(e.authorsCombo.Options, entry.Text)
				e.authorsCombo.Refresh()
			}
		}, e.jsonEditorWindow)
	})
	authorsRemoveBtn := widget.NewButtonWithIcon("", theme.ContentRemoveIcon(), func() {
		selected := e.authorsCombo.Selected
		if selected != "" {
			var newOptions []string
			for _, opt := range e.authorsCombo.Options {
				if opt != selected {
					newOptions = append(newOptions, opt)
				}
			}
			e.authorsCombo.Options = newOptions
			e.authorsCombo.Selected = ""
			e.authorsCombo.Refresh()
		}
	})

	reviewersAddBtn := widget.NewButtonWithIcon("", theme.ContentAddIcon(), func() {
		entry := widget.NewEntry()
		entry.SetPlaceHolder("Enter reviewer...")
		dialog.ShowCustomConfirm("Add Reviewer", "Add", "Cancel", entry, func(confirmed bool) {
			if confirmed && entry.Text != "" {
				e.reviewersCombo.Options = append(e.reviewersCombo.Options, entry.Text)
				e.reviewersCombo.Refresh()
			}
		}, e.jsonEditorWindow)
	})
	reviewersRemoveBtn := widget.NewButtonWithIcon("", theme.ContentRemoveIcon(), func() {
		selected := e.reviewersCombo.Selected
		if selected != "" {
			var newOptions []string
			for _, opt := range e.reviewersCombo.Options {
				if opt != selected {
					newOptions = append(newOptions, opt)
				}
			}
			e.reviewersCombo.Options = newOptions
			e.reviewersCombo.Selected = ""
			e.reviewersCombo.Refresh()
		}
	})

	licenseAddBtn := widget.NewButtonWithIcon("", theme.ContentAddIcon(), func() {
		entry := widget.NewEntry()
		entry.SetPlaceHolder("Enter license...")
		dialog.ShowCustomConfirm("Add License", "Add", "Cancel", entry, func(confirmed bool) {
			if confirmed && entry.Text != "" {
				e.licenseCombo.Options = append(e.licenseCombo.Options, entry.Text)
				e.licenseCombo.Refresh()
			}
		}, e.jsonEditorWindow)
	})
	licenseRemoveBtn := widget.NewButtonWithIcon("", theme.ContentRemoveIcon(), func() {
		selected := e.licenseCombo.Selected
		if selected != "" {
			var newOptions []string
			for _, opt := range e.licenseCombo.Options {
				if opt != selected {
					newOptions = append(newOptions, opt)
				}
			}
			e.licenseCombo.Options = newOptions
			e.licenseCombo.Selected = ""
			e.licenseCombo.Refresh()
		}
	})

	sourcesAddBtn := widget.NewButtonWithIcon("", theme.ContentAddIcon(), func() {
		entry := widget.NewEntry()
		entry.SetPlaceHolder("Enter source...")
		dialog.ShowCustomConfirm("Add Source", "Add", "Cancel", entry, func(confirmed bool) {
			if confirmed && entry.Text != "" {
				e.sourcesCombo.Options = append(e.sourcesCombo.Options, entry.Text)
				e.sourcesCombo.Refresh()
			}
		}, e.jsonEditorWindow)
	})
	sourcesRemoveBtn := widget.NewButtonWithIcon("", theme.ContentRemoveIcon(), func() {
		selected := e.sourcesCombo.Selected
		if selected != "" {
			var newOptions []string
			for _, opt := range e.sourcesCombo.Options {
				if opt != selected {
					newOptions = append(newOptions, opt)
				}
			}
			e.sourcesCombo.Options = newOptions
			e.sourcesCombo.Selected = ""
			e.sourcesCombo.Refresh()
		}
	})

	scriptsAddBtn := widget.NewButtonWithIcon("", theme.ContentAddIcon(), func() {
		entry := widget.NewEntry()
		entry.SetPlaceHolder("Enter script...")
		dialog.ShowCustomConfirm("Add Script", "Add", "Cancel", entry, func(confirmed bool) {
			if confirmed && entry.Text != "" {
				e.scriptsCombo.Options = append(e.scriptsCombo.Options, entry.Text)
				e.scriptsCombo.Refresh()
			}
		}, e.jsonEditorWindow)
	})
	scriptsRemoveBtn := widget.NewButtonWithIcon("", theme.ContentRemoveIcon(), func() {
		selected := e.scriptsCombo.Selected
		if selected != "" {
			var newOptions []string
			for _, opt := range e.scriptsCombo.Options {
				if opt != selected {
					newOptions = append(newOptions, opt)
				}
			}
			e.scriptsCombo.Options = newOptions
			e.scriptsCombo.Selected = ""
			e.scriptsCombo.Refresh()
		}
	})

	audioAddBtn := widget.NewButtonWithIcon("", theme.ContentAddIcon(), func() {
		entry := widget.NewEntry()
		entry.SetPlaceHolder("Enter audio URL...")
		dialog.ShowCustomConfirm("Add Audio", "Add", "Cancel", entry, func(confirmed bool) {
			if confirmed && entry.Text != "" {
				e.audioCombo.Options = append(e.audioCombo.Options, entry.Text)
				e.audioCombo.Refresh()
			}
		}, e.jsonEditorWindow)
	})
	audioRemoveBtn := widget.NewButtonWithIcon("", theme.ContentRemoveIcon(), func() {
		selected := e.audioCombo.Selected
		if selected != "" {
			var newOptions []string
			for _, opt := range e.audioCombo.Options {
				if opt != selected {
					newOptions = append(newOptions, opt)
				}
			}
			e.audioCombo.Options = newOptions
			e.audioCombo.Selected = ""
			e.audioCombo.Refresh()
		}
	})

	licenseContainer := container.NewHBox(e.licenseCombo, licenseAddBtn, licenseRemoveBtn)
	sourcesContainer := container.NewHBox(e.sourcesCombo, sourcesAddBtn, sourcesRemoveBtn)
	scriptsContainer := container.NewHBox(e.scriptsCombo, scriptsAddBtn, scriptsRemoveBtn)
	audioContainer := container.NewHBox(e.audioCombo, audioAddBtn, audioRemoveBtn)
	authorsContainer := container.NewHBox(e.authorsCombo, authorsAddBtn, authorsRemoveBtn)
	reviewersContainer := container.NewHBox(e.reviewersCombo, reviewersAddBtn, reviewersRemoveBtn)

	e.jsonHeadersForm = &widget.Form{
		Items: []*widget.FormItem{
			{Text: "Title", Widget: titleEntry},
			{Text: "Header", Widget: headerEntry},
			{Text: "Authors", Widget: authorsContainer},
			{Text: "Reviewers", Widget: reviewersContainer},
			{Text: "Last Update", Widget: lastUpdateEntry},
			{Text: "Version", Widget: versionEntry},
			{Text: "License", Widget: licenseContainer},
			{Text: "Sources", Widget: sourcesContainer},
			{Text: "Scripts", Widget: scriptsContainer},
			{Text: "Audio", Widget: audioContainer},
		},
	}

	// Create content editor
	e.jsonContentEntry = widget.NewEntry()
	e.jsonContentEntry.Wrapping = fyne.TextWrapWord
	e.jsonContentEntry.MultiLine = true
	e.jsonContentEntry.SetPlaceHolder("JSON content will appear here...")

	contentScroll := container.NewScroll(e.jsonContentEntry)

	// Create tabs
	e.jsonEditorTabs = container.NewAppTabs(
		container.NewTabItem("Headers", e.jsonHeadersForm),
		container.NewTabItem("Content", contentScroll),
	)

	// Create buttons
	saveButton := widget.NewButton("Save", func() {
		e.saveJSONEditorChanges()
	})
	cancelButton := widget.NewButton("Cancel", func() {
		e.jsonEditorWindow.Hide()
	})
	buttonContainer := container.NewHBox(
		layout.NewSpacer(),
		saveButton,
		cancelButton,
	)

	// Set window content
	content := container.NewVBox(
		e.jsonEditorTabs,
		widget.NewSeparator(),
		buttonContainer,
	)

	e.jsonEditorWindow.SetContent(content)

	// Load current document data
	e.loadJSONEditorData()

	// Set close handler
	e.jsonEditorWindow.SetCloseIntercept(func() {
		e.jsonEditorWindow.Hide()
	})

	e.jsonEditorWindow.Show()
}

func (e *TextEditor) loadJSONEditorData() {
	if e.currentDoc == nil || e.currentDoc.content == nil {
		e.disableAllFormFields()
		return
	}

	content := e.currentDoc.content.Text

	// Try to parse as JSON
	var jsonData interface{}
	if err := json.Unmarshal([]byte(content), &jsonData); err != nil {
		// Not valid JSON, disable all header fields and just show raw content
		e.disableAllFormFields()
		e.jsonContentEntry.SetText(content)
		return
	}

	// Extract headers based on JSON structure
	if dataMap, ok := jsonData.(map[string]interface{}); ok {
		// Parse headers and enable/disable fields based on existence
		if title, exists := dataMap["title"]; exists {
			e.jsonHeadersForm.Items[0].Widget.(*widget.Entry).SetText(fmt.Sprintf("%v", title))
			e.jsonHeadersForm.Items[0].Widget.(*widget.Entry).Enable()
		} else {
			e.jsonHeadersForm.Items[0].Widget.(*widget.Entry).SetText("")
			e.jsonHeadersForm.Items[0].Widget.(*widget.Entry).Disable()
		}
		if header, exists := dataMap["header"]; exists {
			e.jsonHeadersForm.Items[1].Widget.(*widget.Entry).SetText(fmt.Sprintf("%v", header))
			e.jsonHeadersForm.Items[1].Widget.(*widget.Entry).Enable()
		} else {
			e.jsonHeadersForm.Items[1].Widget.(*widget.Entry).SetText("")
			e.jsonHeadersForm.Items[1].Widget.(*widget.Entry).Disable()
		}
		if authors, exists := dataMap["authors"]; exists {
			if slice, ok := authors.([]interface{}); ok {
				e.authorsCombo.Options = make([]string, 0, len(slice))
				for _, item := range slice {
					e.authorsCombo.Options = append(e.authorsCombo.Options, fmt.Sprintf("%v", item))
				}
			}
			e.authorsCombo.Enable()
		} else {
			e.authorsCombo.Options = nil
			e.authorsCombo.Disable()
		}
		if reviewers, exists := dataMap["reviewers"]; exists {
			if slice, ok := reviewers.([]interface{}); ok {
				e.reviewersCombo.Options = make([]string, 0, len(slice))
				for _, item := range slice {
					e.reviewersCombo.Options = append(e.reviewersCombo.Options, fmt.Sprintf("%v", item))
				}
			}
			e.reviewersCombo.Enable()
		} else {
			e.reviewersCombo.Options = nil
			e.reviewersCombo.Disable()
		}
		if lastUpdate, exists := dataMap["last_update"]; exists {
			if slice, ok := lastUpdate.([]interface{}); ok && len(slice) > 0 {
				timestampStr := fmt.Sprintf("%v", slice[0])
				timestamp, err := strconv.ParseInt(timestampStr, 10, 64)
				if err == nil {
					t := time.Unix(timestamp, 0)
					e.jsonHeadersForm.Items[4].Widget.(*widget.DateEntry).SetDate(&t)
				}
			}
			e.jsonHeadersForm.Items[4].Widget.(*widget.DateEntry).Enable()
		} else {
			e.jsonHeadersForm.Items[4].Widget.(*widget.DateEntry).SetDate(nil)
			e.jsonHeadersForm.Items[4].Widget.(*widget.DateEntry).Disable()
		}
		if version, exists := dataMap["version"]; exists {
			e.jsonHeadersForm.Items[5].Widget.(*widget.Entry).SetText(fmt.Sprintf("%v", version))
			e.jsonHeadersForm.Items[5].Widget.(*widget.Entry).Enable()
		} else {
			e.jsonHeadersForm.Items[5].Widget.(*widget.Entry).SetText("")
			e.jsonHeadersForm.Items[5].Widget.(*widget.Entry).Disable()
		}
		if license, exists := dataMap["license"]; exists {
			if slice, ok := license.([]interface{}); ok {
				e.licenseCombo.Options = make([]string, 0, len(slice))
				for _, item := range slice {
					e.licenseCombo.Options = append(e.licenseCombo.Options, fmt.Sprintf("%v", item))
				}
			}
			e.licenseCombo.Enable()
		} else {
			e.licenseCombo.Options = nil
			e.licenseCombo.Disable()
		}
		if sources, exists := dataMap["sources"]; exists {
			if slice, ok := sources.([]interface{}); ok {
				e.sourcesCombo.Options = make([]string, 0, len(slice))
				for _, item := range slice {
					e.sourcesCombo.Options = append(e.sourcesCombo.Options, fmt.Sprintf("%v", item))
				}
			}
			e.sourcesCombo.Enable()
		} else {
			e.sourcesCombo.Options = nil
			e.sourcesCombo.Disable()
		}
		if scripts, exists := dataMap["scripts"]; exists {
			if slice, ok := scripts.([]interface{}); ok {
				e.scriptsCombo.Options = make([]string, 0, len(slice))
				for _, item := range slice {
					e.scriptsCombo.Options = append(e.scriptsCombo.Options, fmt.Sprintf("%v", item))
				}
			}
			e.scriptsCombo.Enable()
		} else {
			e.scriptsCombo.Options = nil
			e.scriptsCombo.Disable()
		}
		if audio, exists := dataMap["audio"]; exists {
			if slice, ok := audio.([]interface{}); ok {
				e.audioCombo.Options = make([]string, 0, len(slice))
				for _, item := range slice {
					e.audioCombo.Options = append(e.audioCombo.Options, fmt.Sprintf("%v", item))
				}
			}
			e.audioCombo.Enable()
		} else {
			e.audioCombo.Options = nil
			e.audioCombo.Disable()
		}
	} else {
		// Valid JSON but not an object (e.g., array, string, etc.)
		// Disable all header fields
		e.disableAllFormFields()
	}

	// Show full JSON content
	e.jsonContentEntry.SetText(content)
}

func (e *TextEditor) disableAllFormFields() {
	if e.jsonHeadersForm == nil {
		return
	}
	for i := 0; i < 2; i++ {
		e.jsonHeadersForm.Items[i].Widget.(*widget.Entry).SetText("")
		e.jsonHeadersForm.Items[i].Widget.(*widget.Entry).Disable()
	}
	e.authorsCombo.Options = nil
	e.authorsCombo.Disable()
	e.reviewersCombo.Options = nil
	e.reviewersCombo.Disable()
	for i := 4; i < 6; i++ {
		e.jsonHeadersForm.Items[i].Widget.(*widget.Entry).SetText("")
		e.jsonHeadersForm.Items[i].Widget.(*widget.Entry).Disable()
	}
	e.licenseCombo.Options = nil
	e.licenseCombo.Disable()
	e.sourcesCombo.Options = nil
	e.sourcesCombo.Disable()
	e.scriptsCombo.Options = nil
	e.scriptsCombo.Disable()
	e.audioCombo.Options = nil
	e.audioCombo.Disable()
}

func (e *TextEditor) saveJSONEditorChanges() {
	if e.currentDoc == nil || e.currentDoc.content == nil {
		return
	}

	// Get current content and parse as JSON
	content := e.currentDoc.content.Text
	var jsonData map[string]interface{}

	if err := json.Unmarshal([]byte(content), &jsonData); err != nil {
		// Not valid JSON, update content from editor
		e.currentDoc.content.SetText(e.jsonContentEntry.Text)
		e.currentDoc.isModified = true
		e.updateTabTitle(e.currentDoc)
		e.updateTitle()
		e.jsonEditorWindow.Hide()
		return
	}

	// Update headers from form
	jsonData["title"] = e.jsonHeadersForm.Items[0].Widget.(*widget.Entry).Text
	jsonData["header"] = e.jsonHeadersForm.Items[1].Widget.(*widget.Entry).Text

	if len(e.authorsCombo.Options) > 0 {
		jsonData["authors"] = e.authorsCombo.Options
	}

	if len(e.reviewersCombo.Options) > 0 {
		jsonData["reviewers"] = e.reviewersCombo.Options
	}

	lastUpdateDate := e.jsonHeadersForm.Items[4].Widget.(*widget.DateEntry).Date
	if lastUpdateDate != nil {
		timestamp := lastUpdateDate.Unix()
		jsonData["last_update"] = []string{strconv.FormatInt(timestamp, 10)}
	}

	versionText := e.jsonHeadersForm.Items[5].Widget.(*widget.Entry).Text
	if versionText != "" {
		if version, err := strconv.Atoi(versionText); err == nil {
			jsonData["version"] = version
		}
	}

	if len(e.licenseCombo.Options) > 0 {
		jsonData["license"] = e.licenseCombo.Options
	}

	if len(e.sourcesCombo.Options) > 0 {
		jsonData["sources"] = e.sourcesCombo.Options
	}

	if len(e.scriptsCombo.Options) > 0 {
		jsonData["scripts"] = e.scriptsCombo.Options
	}

	if len(e.audioCombo.Options) > 0 {
		jsonData["audio"] = e.audioCombo.Options
	}

	// Marshal back to JSON
	var buf bytes.Buffer
	encoder := json.NewEncoder(&buf)
	encoder.SetEscapeHTML(false)
	encoder.SetIndent("", "  ")

	if err := encoder.Encode(jsonData); err != nil {
		dialog.ShowError(fmt.Errorf("Failed to encode JSON: %v", err), e.window)
		return
	}

	// Remove trailing newline and update content
	jsonStr := strings.TrimSuffix(buf.String(), "\n")
	e.currentDoc.content.SetText(jsonStr)
	e.currentDoc.isModified = true
	e.updateTabTitle(e.currentDoc)
	e.updateTitle()

	e.jsonEditorWindow.Hide()
}

func (e *TextEditor) isJSONDocument(doc *Document) bool {
	if doc == nil || doc.content == nil {
		return false
	}
	content := doc.content.Text

	// Simple JSON validation
	var js interface{}
	return json.Unmarshal([]byte(content), &js) == nil
}

func (e *TextEditor) createEditorContent(doc *Document) fyne.CanvasObject {
	doc.content = widget.NewMultiLineEntry()
	doc.lineNumbers = widget.NewLabel("1\n")
	doc.lineNumbers.Alignment = fyne.TextAlignTrailing

	doc.content.OnChanged = func(s string) {
		lineCount := strings.Count(s, "\n") + 1
		numbers := ""
		for i := 1; i <= lineCount; i++ {
			numbers += fmt.Sprintf("%d\n", i)
		}
		doc.lineNumbers.SetText(numbers)
		if !doc.isModified {
			doc.isModified = true
			e.updateTabTitle(doc)
			e.updateTitle()
		}
	}

	doc.scrollContainer = container.NewScroll(container.NewBorder(nil, nil, doc.lineNumbers, nil, doc.content))
	return doc.scrollContainer
}

func (e *TextEditor) getCurrentDocIndex() int {
	for i, doc := range e.documents {
		if doc == e.currentDoc {
			return i
		}
	}
	return -1
}

func (e *TextEditor) isFamilyDocument(doc *Document) bool {
	if doc == nil || doc.content == nil {
		return false
	}
	content := doc.content.Text
	re := regexp.MustCompile(`"type"\s*:\s*"family_tree"`)
	return re.MatchString(content)
}

func (e *TextEditor) isAtlasDocument(doc *Document) bool {
	if doc == nil || doc.content == nil {
		return false
	}
	content := doc.content.Text
	re := regexp.MustCompile(`"atlas"\s*:`)
	return re.MatchString(content)
}

func (e *TextEditor) updateFamilyMenuItems(isFamily bool) {
	for _, item := range e.familyMenuItems {
		item.Disabled = !isFamily
	}
	if isFamily {
		e.familyToolbar.Show()
		e.familyToolbarMenuItem.Checked = true
	} else {
		e.familyToolbar.Hide()
		e.familyToolbarMenuItem.Checked = false
	}
	e.toolbarContainer.Refresh()
	e.window.MainMenu().Refresh()
}

func (e *TextEditor) updateAtlasMenuItem(isAtlas bool) {
	e.atlasMapMenuItem.Disabled = !isAtlas
	e.window.MainMenu().Refresh()
}

func (e *TextEditor) getTabTitle(doc *Document) string {
	if doc.filePath == "" {
		return htGetText("untitled")
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
		e.window.SetTitle(htGetText("go_text_editor"))
		return
	}

	title := e.getTabTitle(e.currentDoc)
	if e.currentDoc.isModified {
		title = "* " + title
	}

	tabCount := len(e.documents)
	if tabCount > 1 {
		e.window.SetTitle(fmt.Sprintf("%s (%d tabs) - %s", title, tabCount, htGetText("go_text_editor")))
	} else {
		e.window.SetTitle(fmt.Sprintf("%s - %s", title, htGetText("go_text_editor")))
	}
}

func (e *TextEditor) showTemplateWindow() {
	// Always create a new window to avoid state issues
	e.templateWindow = e.app.NewWindow(htGetText("load_template"))
	e.templateWindow.Resize(fyne.NewSize(500, 400))

	atlasBtn := widget.NewButton(htGetText("atlas_template"), func() {
		e.loadTemplate("atlas")
		e.templateWindow.Close()
	})

	classBtn := widget.NewButton(htGetText("class_template"), func() {
		e.loadTemplate("class")
		e.templateWindow.Close()
	})

	familyBtn := widget.NewButton(htGetText("family_template"), func() {
		e.loadTemplate("family")
		e.templateWindow.Close()
	})

	sourceBtn := widget.NewButton(htGetText("source_template"), func() {
		e.loadTemplate("source")
		e.templateWindow.Close()
	})

	// Add descriptions
	content := container.NewVBox(
		widget.NewLabel(htGetText("atlas_desc")),
		widget.NewSeparator(),
		container.NewHBox(layout.NewSpacer(), atlasBtn, layout.NewSpacer()),
		widget.NewLabel(htGetText("class_desc")),
		widget.NewSeparator(),
		container.NewHBox(layout.NewSpacer(), classBtn, layout.NewSpacer()),
		widget.NewLabel(htGetText("family_desc")),
		widget.NewSeparator(),
		container.NewHBox(layout.NewSpacer(), familyBtn, layout.NewSpacer()),
		widget.NewLabel(htGetText("source_desc")),
		widget.NewSeparator(),
		container.NewHBox(layout.NewSpacer(), sourceBtn, layout.NewSpacer()),
		container.NewHBox(layout.NewSpacer(), widget.NewButton(htGetText("close"), func() {
			e.templateWindow.Close()
		}), layout.NewSpacer()),
	)

	e.templateWindow.SetContent(content)

	e.templateWindow.Show()
}

func (e *TextEditor) loadTemplate(templateType string) {
	var templateData interface{}
	var err error

	switch templateType {
	case "atlas":
		templateData = e.createAtlasTemplate()
	case "class":
		templateData = e.createClassTemplate()
	case "family":
		templateData = e.createFamilyTemplate()
	case "source":
		templateData = e.createSourceTemplate()
	default:
		dialog.ShowError(fmt.Errorf(htGetText("unknown_template_type"), templateType), e.window)
		return
	}

	var buf bytes.Buffer
	encoder := json.NewEncoder(&buf)
	encoder.SetEscapeHTML(false) // This is the key change
	encoder.SetIndent("", "  ")

	err = encoder.Encode(templateData)
	if err != nil {
		dialog.ShowError(fmt.Errorf(htGetText("error_creating_template"), err), e.window)
		return
	}

	// Remove the trailing newline that Encode adds
	jsonStr := strings.TrimSuffix(buf.String(), "\n")

	doc := e.createNewDocument()
	doc.content.SetText(jsonStr)
	doc.isModified = true
	isFamily := e.isFamilyDocument(doc)
	e.updateFamilyMenuItems(isFamily)
	isAtlas := e.isAtlasDocument(doc)
	e.updateAtlasMenuItem(isAtlas)
	e.updateTabTitle(doc)

	// Auto-open JSON editor for new JSON documents
	if e.isJSONDocument(doc) {
		e.currentJSONDoc = doc
		e.showJSONEditor()
	}
}

func (e *TextEditor) createSourceTemplate() HTSourceFile {
	ct := HTUpdateTimestamp()
	src := HTSourceFile{
		License: []string{
			"SPDX-License-Identifier: GPL-3.0-or-later",
			"CC BY-NC 4.0 DEED",
		},
		LastUpdate: []string{ct},
		Version:    1,
		Type:       "sources",
		PrimarySources: []HTSourceElement{
			{
				ID:          "Unique identifier for the specific primary source.",
				Citation:    "Citation for the primary source.",
				Date:        "",
				PublishDate: "Date when the paper was published.",
				URL:         "External link to access the paper/book.",
			},
		},
		ReferencesSources: []HTSourceElement{
			{
				ID:          "160fb48c-1711-491e-a1aa-e1257e7889af",
				Citation:    "Norma Giarraca (comp.), con colaboración de Miguel Teubal ... [et.al.] (2011). Bicentenarios ( Otros ) Transiciones Y Resistencias, Buenos Aires, Una Ventana. ISBN 978-987-25376-4-7",
				Date:        "2024-05-11",
				PublishDate: "2011",
				URL:         "https://www.ceapedi.com.ar/Imagenes/Biblioteca/libreria/298.pdf",
			},
			{
				ID:          "Unique identifier for the specific reference source.",
				Citation:    "Citation for the reference that discusses a primary source or person.",
				Date:        "",
				PublishDate: "Date when the paper was published.",
				URL:         "External link to access the paper/book.",
			},
		},
		ReligiousSources: []HTSourceElement{
			{
				ID:          "Unique identifier for the specific religious source.",
				Citation:    "Citation for the religious source.",
				Date:        "",
				PublishDate: "Date when the paper was published.",
				URL:         "External link to access the paper/book.",
			},
		},
		SocialMediaSources: []HTSourceElement{
			{
				ID:          "Unique identifier for the specific Social Network source.",
				Citation:    "Citation for the Social Network source.",
				Date:        "",
				PublishDate: "Date when the paper was published.",
				URL:         "External link to access the Social Network.",
			},
		},
	}
	return src
}

func (e *TextEditor) createAtlasTemplate() AtlasTemplateFile {
	ct := HTUpdateTimestamp()
	al := AtlasTemplateFile{
		Title:   "The name displayed in the application's or page's title bar.",
		Header:  "The name shown at the top of the page or section.",
		Sources: []string{""},
		Scripts: []string{""},
		Audio: []HTAudio{
			{
				URL:      "https://www.historytracers.org/audios/",
				External: true,
				Spotify:  false,
			},
			{
				URL:      "https://open.spotify.com/episode/",
				External: true,
				Spotify:  true,
			},
		},
		License:    []string{"SPDX-License-Identifier: GPL-3.0-or-later", "CC BY-NC 4.0 DEED"},
		LastUpdate: []string{ct},
		Authors:    []string{""},
		Reviewers:  []string{""},
		Type:       "atlas",
		Version:    2,
		Editing:    false,
		Content: []ClassTemplateContent{
			{
				ID: "SECTION_prerequisites",
				Text: []HTText{
					{
						Text:   "<p><hr /></p><p><span id=\"htZoomImageMsg\"></span></p><p><span id=\"htChartMsg\"></span></p><p><span id=\"htAmericaAbyaYalaMsg\"></span> (<a href=\"#\" onclick=\"htCleanSources(); htFillReferenceSource('160fb48c-1711-491e-a1aa-e1257e7889af'); return false;\">Porto-Gonçalves, Carlos Walter, <htdate0>, pp. 39-43</a>).</p><p><span id=\"htAgeMsg\"></span></p>",
						Source: nil,
						FillDates: []HTDate{
							{
								DateType: "gregory",
								Year:     "2011",
								Month:    "",
								Day:      "",
							},
						},
						IsTable:     false,
						ImgDesc:     "",
						Format:      "html",
						PostMention: "",
					},
					{
						Text: "",
						Source: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID)",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{
									DateType: "gregory",
									Year:     "2010",
									Month:    "",
									Day:      "",
								},
							},
						},
						FillDates: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						IsTable:     false,
						ImgDesc:     "A description of an image included in the text.",
						Format:      "markdown or html",
						PostMention: "A character used after a mention to include citations.",
					},
				},
			},
		},
		Atlas: []AtlasTemplateContent{
			{
				ID:     "Unique identifier (UUID)",
				Image:  "Complete path to filename.",
				Author: "Map author",
				Index:  "Name shown in the index.",
				Audio:  "Link to audio file.",
				Text: []HTText{
					{
						Text: "",
						Source: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID).",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{DateType: "gregory",
									Year:  "2010",
									Month: "",
									Day:   "",
								},
							},
						},
						FillDates: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						IsTable:     false,
						ImgDesc:     "A description of an image included in the text.",
						Format:      "markdown or html",
						PostMention: "",
					},
				},
			},
		},
	}
	return al
}

func (e *TextEditor) createClassTemplate() ClassTemplateFile {
	ct := HTUpdateTimestamp()
	cl := ClassTemplateFile{
		Title:   "",
		Header:  "",
		Sources: []string{" "},
		Scripts: []string{" "},
		Audio: []HTAudio{
			{
				URL:      "https://www.historytracers.org/audios/",
				External: true,
				Spotify:  false,
			},
			{
				URL:      "https://open.spotify.com/episode/",
				External: true,
				Spotify:  true,
			},
		},
		Index:      []string{" "},
		License:    []string{"SPDX-License-Identifier: GPL-3.0-or-later", "CC BY-NC 4.0 DEED"},
		LastUpdate: []string{ct},
		Authors:    []string{""},
		Reviewers:  []string{""},
		Type:       "class",
		Version:    2,
		Editing:    false,
		Content: []ClassTemplateContent{
			{
				ID: "SECTION_prerequisites",
				Text: []HTText{
					{
						Text:   "<p><span id=\"htZoomImageMsg\"></span></p><p><span id=\"htChartMsg\"></span></p><p><span id=\"htAgeMsg\"></span></p><p><span id=\"htAmericaAbyaYalaMsg\"></span> (<a href=\"#\" onclick=\"htCleanSources(); htFillReferenceSource('160fb48c-1711-491e-a1aa-e1257e7889af'); return false;\">Porto-Gonçalves, Carlos Walter, <htdate0>, pp. 39-43</a>).</p>",
						Source: nil,
						FillDates: []HTDate{
							{
								DateType: "gregory",
								Year:     "2011",
								Month:    "",
								Day:      "",
							},
						},
						IsTable:     false,
						ImgDesc:     "",
						Format:      "html",
						PostMention: "",
					},
					{
						Text: "",
						Source: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID).",
								Text: "",
								Page: "",
								Date: HTDate{
									DateType: "gregory",
									Year:     "2010",
									Month:    "",
									Day:      "",
								},
							},
						},
						FillDates: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						IsTable:     false,
						ImgDesc:     "A description of an image included in the text.",
						Format:      "markdown or html",
						PostMention: "",
					},
				},
			},
			{
				ID: "SECTION_NAME",
				Text: []HTText{
					{
						Text: "",
						Source: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID).",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{DateType: "gregory",
									Year:  "2010",
									Month: "",
									Day:   "",
								},
							},
						},
						FillDates: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						IsTable:     false,
						ImgDesc:     "A description of an image included in the text.",
						Format:      "markdown or html",
						PostMention: "",
					},
				},
			},
		},
		Exercises: []HTExercise{
			{
				Question:       "WRITE A QUESTION",
				YesNoAnswer:    "Yes",
				AdditionalInfo: "The correct answer is 'Yes' because ...",
			},
		},
		GameV2: []HTGameDesc{
			{
				ImagePath: "The image path.",
				ImageDesc: "A description for the associated image.",
				DateTime: []HTDate{
					{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
			},
		},
		DateTime: nil,
	}

	return cl
}

func (e *TextEditor) createFamilyTemplate() Family {
	ct := HTUpdateTimestamp()
	fam := Family{
		Title:   "",
		Header:  "",
		Sources: []string{"", "tree"},
		Scripts: []string{""},
		Audio: []HTAudio{
			{
				URL:      "https://www.historytracers.org/audios/",
				External: true,
				Spotify:  false,
			},
			{
				URL:      "https://open.spotify.com/episode/",
				External: true,
				Spotify:  true,
			},
		},
		Index:      []string{"families"},
		License:    []string{"SPDX-License-Identifier: GPL-3.0-or-later", "CC BY-NC 4.0 DEED"},
		LastUpdate: []string{ct},
		Authors:    "",
		Reviewers:  "",
		DocumentsInfo: []string{
			"Languages used in the document.",
			"Names of calendars referenced.",
			"Calendar options available on top.",
			"Additional information (remove this if not needed).",
		},
		PeriodOfTime: []string{
			"Family origin (European, American, Asian, African..).",
			"A period of time (Middle Ages, Litic, Classic...)",
		},
		Maps: []HTMap{
			{
				Text:  "Description or information to be displayed alongside the map.",
				Img:   "File path to the map image.",
				Order: 1,
				DateTime: []HTDate{
					{
						DateType: "",
						Year:     "",
						Month:    "",
						Day:      "",
					},
				},
			},
		},
		Common: []HTText{
			{
				Text: "A detailed description of the person's life history and marital status.",
				Source: []HTSource{
					{
						Type: 3210,
						UUID: "Unique identifier (UUID).",
						Text: "The accompanying text that will be displayed with the citation.",
						Page: "The specific page in the publication where this information appears.",
						Date: HTDate{
							DateType: "gregory",
							Year:     "2010",
							Month:    "",
							Day:      "",
						},
					},
				},
				FillDates: []HTDate{
					{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
				IsTable:     false,
				ImgDesc:     "A description of an image included in the text.",
				Format:      "markdown or html",
				PostMention: "",
			},
		},
		Prerequisites: []string{"List of prerequisites needed to understand the text."},
		GEDCOM:        "The name of the GEDCOM file.",
		CSV:           "",
		Version:       1,
		Editing:       false,
		Type:          "family_tree",
		Families: []FamilyBody{
			{
				ID:   "Unique identifier for the family.",
				Name: "Name displayed at the top of the page.",
				History: []HTText{
					{
						Text: "A detailed description of the person's life history and marital status.",
						Source: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID).",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{
									DateType: "gregory",
									Year:     "2010",
									Month:    "",
									Day:      "",
								},
							},
						},
						FillDates: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						IsTable:     false,
						ImgDesc:     "A description of an image included in the text.",
						Format:      "markdown or html",
						PostMention: "",
					},
				},
				People: []FamilyPerson{
					{
						ID:         "Unique identifier for the person.",
						Name:       "Name of the person.",
						Surname:    "",
						Patronymic: "",
						FullName:   "",
						Sex:        "The biological classification of a person.",
						Gender:     "The gender identity or social role adopted by a person.",
						IsReal:     false,
						Haplogroup: []FamilyPersonHaplogroup{
							{
								Type:       "Specifies the described haplogroup. Valid options: mtDNA (Mitochondrial DNA), Y (Y chromosome), SNPs (Single-nucleotide polymorphisms).",
								Haplogroup: "The haplogroup value",
								Sources: []HTSource{
									{
										Type: 3210,
										UUID: "Unique identifier (UUID) for the current citation.",
										Text: "The accompanying text that will be displayed with the citation.",
										Page: "The specific page in the publication where this information appears.",
										Date: HTDate{
											DateType: "gregory",
											Year:     "2010",
											Month:    "",
											Day:      "",
										},
									},
								},
							},
						},
						History: []HTText{
							{
								Text: "A detailed description of the person's life history and marital status.",
								Source: []HTSource{
									{
										Type: 3210,
										UUID: "Unique identifier (UUID) for the current citation.",
										Text: "The accompanying text that will be displayed with the citation.",
										Page: "The specific page in the publication where this information appears.",
										Date: HTDate{
											DateType: "gregory",
											Year:     "2010",
											Month:    "",
											Day:      "",
										},
									},
								},
								FillDates: []HTDate{
									{
										DateType: "gregory",
										Year:     "2010",
										Month:    "",
										Day:      "",
									},
								},
								IsTable:     false,
								ImgDesc:     "A description of an image included in the text.",
								Format:      "markdown or html",
								PostMention: "",
							},
						},
						Parents: []FamilyPersonParents{
							{
								Type:               "theory or hypothesis",
								FatherExternalFile: false,
								FatherFamily:       "Unique identifier for the father's family. It should match the family ID used here.",
								FatherID:           "Unique identifier for the father.",
								FatherName:         "Name of the father.",
								MotherExternalFile: false,
								MotherFamily:       "Unique identifier for the mother's family.",
								MotherID:           "Unique identifier for the mother.",
								MotherName:         "Name of the mother.",
							},
						},
						Birth: []FamilyPersonEvent{
							{
								Date: []HTDate{
									{
										DateType: "gregory",
										Year:     "2010",
										Month:    "",
										Day:      "",
									},
								},
								Address:   "The address where the marriage took place.",
								CityID:    "",
								City:      "The city where the marriage occurred.",
								StateID:   "",
								State:     "The state where the marriage took place.",
								PC:        "The postal code of the marriage location.",
								CountryID: "",
								Country:   "The country where the marriage occurred.",
								Sources: []HTSource{
									{
										Type: 3210,
										UUID: "Unique identifier (UUID) for the current citation.",
										Text: "The accompanying text that will be displayed with the citation.",
										Page: "The specific page in the publication where this information appears.",
										Date: HTDate{
											DateType: "gregory",
											Year:     "2010",
											Month:    "",
											Day:      "",
										},
									},
								},
							},
						},
						Baptism: []FamilyPersonEvent{
							{
								Date: []HTDate{
									{
										DateType: "gregory",
										Year:     "2010",
										Month:    "",
										Day:      "",
									},
								},
								Address:   "The address where the marriage took place.",
								CityID:    "",
								City:      "The city where the marriage occurred.",
								StateID:   "",
								State:     "The state where the marriage took place.",
								PC:        "The postal code of the marriage location.",
								CountryID: "",
								Country:   "The country where the marriage occurred.",
								Sources: []HTSource{
									{
										Type: 3210,
										UUID: "Unique identifier (UUID) for the current citation.",
										Text: "The accompanying text that will be displayed with the citation.",
										Page: "The specific page in the publication where this information appears.",
										Date: HTDate{
											DateType: "gregory",
											Year:     "2010",
											Month:    "",
											Day:      "",
										},
									},
								},
							},
						},
						Marriages: []FamilyPersonMarriage{
							{
								Type:         "theory or hypothesis",
								ID:           "Unique identifier for the person.",
								GEDCOMId:     "",
								Official:     true,
								FamilyID:     "Unique identifier for the family.",
								ExternalFile: false,
								Name:         "Name of the spouse.",
								History: []HTText{
									{
										Text: "A detailed description of the person's life history and marital status.",
										Source: []HTSource{
											{
												Type: 3210,
												UUID: "Unique identifier (UUID) for the current citation.",
												Text: "The accompanying text that will be displayed with the citation.",
												Page: "The specific page in the publication where this information appears.",
												Date: HTDate{
													DateType: "gregory",
													Year:     "2010",
													Month:    "",
													Day:      "",
												},
											},
										},
										FillDates: []HTDate{
											{
												DateType: "gregory",
												Year:     "2010",
												Month:    "",
												Day:      "",
											},
										},
										IsTable:     false,
										ImgDesc:     "A description of an image included in the text.",
										Format:      "markdown or html",
										PostMention: "",
									},
								},
								DateTime: FamilyPersonEvent{
									Date:      nil,
									Address:   "",
									CityID:    "",
									City:      "",
									StateID:   "",
									State:     "",
									PC:        "",
									CountryID: "",
									Country:   "",
									Sources:   nil,
								},
							},
						},
						Divorced: nil,
						Children: []FamilyPersonChild{
							{
								Type:         "theory or hypothesis",
								ID:           "Unique identifier for the child.",
								MarriageID:   "Unique identifier for the marriage (parental connection).",
								Name:         "Name of the child.",
								FamilyID:     "Unique identifier for the child's family, used if the child establishes a new family.",
								ExternalFile: false,
								AddLink:      false,
								History: []HTText{
									{
										Text: "A detailed description of the person's life history and marital status.",
										Source: []HTSource{
											{
												Type: 3210,
												UUID: "Unique identifier (UUID) for the current citation.",
												Text: "The accompanying text that will be displayed with the citation.",
												Page: "The specific page in the publication where this information appears.",
												Date: HTDate{
													DateType: "gregory",
													Year:     "2010",
													Month:    "",
													Day:      "",
												},
											},
										},
										FillDates: []HTDate{
											{
												DateType: "gregory",
												Year:     "2010",
												Month:    "",
												Day:      "",
											},
										},
										IsTable:     false,
										ImgDesc:     "A description of an image included in the text.",
										Format:      "markdown or html",
										PostMention: "",
									},
								},
								AdoptedChild: false,
							},
						},
						Death: []FamilyPersonEvent{
							{
								Date: []HTDate{
									{
										DateType: "gregory",
										Year:     "2010",
										Month:    "",
										Day:      "",
									},
								},
								Address:   "The address where the marriage took place.",
								CityID:    "",
								City:      "The city where the marriage occurred.",
								StateID:   "",
								State:     "The state where the marriage took place.",
								PC:        "The postal code of the marriage location.",
								CountryID: "",
								Country:   "The country where the marriage occurred.",
								Sources: []HTSource{
									{
										Type: 3210,
										UUID: "Unique identifier (UUID) for the current citation.",
										Text: "The accompanying text that will be displayed with the citation.",
										Page: "The specific page in the publication where this information appears.",
										Date: HTDate{
											DateType: "gregory",
											Year:     "2010",
											Month:    "",
											Day:      "",
										},
									},
								},
							},
						},
					},
				},
			},
		},
		Exercises: []HTExercise{
			{
				Question:       "WRITE A QUESTION",
				YesNoAnswer:    "Yes",
				AdditionalInfo: "The correct answer is 'Yes' because ...",
			},
		},
		DateTime: nil,
	}

	return fam
}

// Edit operations
func (e *TextEditor) isInsideTextArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:text|history|common)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsideSourceArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:source|sources)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsideAudioArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:audio)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsideDateArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:date|date_time)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsideExerciseArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:exercise_v2)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsideGameArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:game_v2)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsideFamilyArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:families)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsidePeopleArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:people)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsideParentsArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:parents)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsideHaplogroupArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:haplogroup)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsideEventArray(arrayName string) (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"` + arrayName + `"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) isInsideMarriagesArray() (bool, int) {
	return e.isInsideEventArray("marriages")
}

func (e *TextEditor) isInsideBirthArray() (bool, int) {
	return e.isInsideEventArray("birth")
}

func (e *TextEditor) isInsideBaptismArray() (bool, int) {
	return e.isInsideEventArray("baptism")
}

func (e *TextEditor) isInsideDeathArray() (bool, int) {
	return e.isInsideEventArray("death")
}

func (e *TextEditor) isInsideDivorcedArray() (bool, int) {
	return e.isInsideEventArray("divorced")
}

func (e *TextEditor) isInsideAtlasArray() (bool, int) {
	if e.currentDoc == nil {
		return false, -1
	}
	content := e.currentDoc.content
	fullText := content.Text

	lines := strings.Split(fullText, "\n")
	if content.CursorRow >= len(lines) {
		return false, -1
	}
	cursorPos := 0
	for i := 0; i < content.CursorRow; i++ {
		cursorPos += len(lines[i]) + 1
	}
	cursorPos += content.CursorColumn

	re := regexp.MustCompile(`"(?:atlas)"\s*:\s*\[`)
	matches := re.FindAllStringIndex(fullText, -1)

	for _, match := range matches {
		startIndex := match[1] - 1

		openCount := 0
		endIndex := -1
		for i := startIndex + 1; i < len(fullText); i++ {
			if fullText[i] == '[' {
				openCount++
			} else if fullText[i] == ']' {
				if openCount == 0 {
					endIndex = i
					break
				}
				openCount--
			}
		}

		if endIndex != -1 && cursorPos > startIndex && cursorPos <= endIndex {
			return true, cursorPos
		}
	}

	return false, -1
}

func (e *TextEditor) getIndentationForInsertion(cursorPos int) string {
	if e.currentDoc == nil {
		return ""
	}
	fullText := e.currentDoc.content.Text
	lineStart := strings.LastIndex(fullText[:cursorPos], "\n") + 1

	line := fullText[lineStart:]
	if endOfLine := strings.Index(line, "\n"); endOfLine != -1 {
		line = line[:endOfLine]
	}

	indentation := ""
	// Extract indentation from the current line
	for _, r := range line {
		if r == ' ' || r == '\t' {
			indentation += string(r)
		} else {
			break
		}
	}

	// If current line is empty, try to derive from previous line
	if strings.TrimSpace(line) == "" {
		if lineStart > 0 {
			textBefore := fullText[:lineStart-1]
			prevLineStart := strings.LastIndex(textBefore, "\n") + 1
			prevLine := fullText[prevLineStart : lineStart-1]

			prevLineIndentation := ""
			for _, r := range prevLine {
				if r == ' ' || r == '\t' {
					prevLineIndentation += string(r)
				} else {
					break
				}
			}

			indentation = prevLineIndentation
			trimmedPrevLine := strings.TrimSpace(prevLine)
			if strings.HasSuffix(trimmedPrevLine, "[") || strings.HasSuffix(trimmedPrevLine, "{") {
				indentation += "  "
			}
		}
	}
	return indentation
}

func (e *TextEditor) insertAudio() {

	isInside, cursorPos := e.isInsideAudioArray()

	if !isInside {

		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_audio")), e.window)

		return

	}

	if e.currentDoc == nil {

		return

	}

	audio := HTAudio{
		URL:      "https://www.historytracers.org/audios/",
		External: true,
		Spotify:  false,
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(audio, indentation, "  ")

	if err != nil {

		dialog.ShowError(err, e.window)

		return

	}

	textBefore := e.currentDoc.content.Text[:cursorPos]

	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")

	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {

		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]

		if lastChar != '[' && lastChar != ',' {

			insertText = ",\n" + insertText

		}

	}

	content := e.currentDoc.content

	oldClipboard := e.window.Clipboard().Content()

	e.window.Clipboard().SetContent(insertText)

	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})

	e.window.Clipboard().SetContent(oldClipboard)

}

func (e *TextEditor) insertAtlasMap() {
	isInside, cursorPos := e.isInsideAtlasArray()

	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_atlas")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	atlasMap := AtlasTemplateContent{
		ID:     "Unique identifier (UUID)",
		Image:  "Complete path to filename.",
		Author: "Map author",
		Index:  "Name shown in the index.",
		Audio:  "Link to audio file.",
		Text: []HTText{
			{
				Text: "",
				Source: []HTSource{
					{
						Type: 3210,
						UUID: "Unique identifier (UUID).",
						Text: "The accompanying text that will be displayed with the citation.",
						Page: "The specific page in the publication where this information appears.",
						Date: HTDate{
							DateType: "gregory",
							Year:     "2010",
							Month:    "",
							Day:      "",
						},
					},
				},
				FillDates: []HTDate{
					{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
				IsTable:     false,
				ImgDesc:     "A description of an image included in the text.",
				Format:      "markdown or html",
				PostMention: "",
			},
		},
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(atlasMap, indentation, "  ")

	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]

	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")

	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content

	oldClipboard := e.window.Clipboard().Content()

	e.window.Clipboard().SetContent(insertText)

	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})

	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertDate() {

	isInside, cursorPos := e.isInsideDateArray()

	if !isInside {

		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_date")), e.window)

		return

	}

	if e.currentDoc == nil {

		return

	}

	date := HTDate{

		DateType: "gregory",

		Year: "2010",

		Month: "",

		Day: "",
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(date, indentation, "  ")

	if err != nil {

		dialog.ShowError(err, e.window)

		return

	}

	textBefore := e.currentDoc.content.Text[:cursorPos]

	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")

	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {

		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]

		if lastChar != '[' && lastChar != ',' {

			insertText = ",\n" + insertText

		}

	}

	content := e.currentDoc.content

	oldClipboard := e.window.Clipboard().Content()

	e.window.Clipboard().SetContent(insertText)

	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})

	e.window.Clipboard().SetContent(oldClipboard)

}

func (e *TextEditor) insertSource() {
	isInside, cursorPos := e.isInsideSourceArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_source")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	source := HTSource{
		Type: 3210,
		UUID: "Unique identifier (UUID).",
		Text: "The accompanying text that will be displayed with the citation.",
		Page: "The specific page in the publication where this information appears.",
		Date: HTDate{
			DateType: "gregory",
			Year:     "2010",
			Month:    "",
			Day:      "",
		},
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(source, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertText() {
	isInside, cursorPos := e.isInsideTextArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_text")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	text := HTText{
		Text: "A detailed description of the person's life history and marital status.",
		Source: []HTSource{
			{
				Type: 3210,
				UUID: "Unique identifier (UUID).",
				Text: "The accompanying text that will be displayed with the citation.",
				Page: "The specific page in the publication where this information appears.",
				Date: HTDate{
					DateType: "gregory",
					Year:     "2010",
					Month:    "",
					Day:      "",
				},
			},
		},
		FillDates: []HTDate{
			{
				DateType: "gregory",
				Year:     "2010",
				Month:    "",
				Day:      "",
			},
		},
		IsTable:     false,
		ImgDesc:     "A description of an image included in the text.",
		Format:      "markdown or html",
		PostMention: "",
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(text, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertExercise() {
	isInside, cursorPos := e.isInsideExerciseArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_exercise")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	exercise := HTExercise{
		Question:       "WRITE A QUESTION",
		YesNoAnswer:    "Yes",
		AdditionalInfo: "The correct answer is 'Yes' because ...",
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(exercise, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertGame() {
	isInside, cursorPos := e.isInsideGameArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_game")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	game := HTGameDesc{
		ImagePath: "The image path.",
		ImageDesc: "A description for the associated image.",
		DateTime: []HTDate{
			{
				DateType: "gregory",
				Year:     "2010",
				Month:    "",
				Day:      "",
			},
		},
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(game, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertFamily() {
	if e.currentDoc == nil {
		return
	}

	family := e.createFamilyTemplate()

	indentation := e.getIndentationForInsertion(0)
	jsonData, err := json.MarshalIndent(family, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	e.currentDoc.content.SetText(string(jsonData))
}

func (e *TextEditor) insertFamilyBody() {
	isInside, cursorPos := e.isInsideFamilyArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_family")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	family := FamilyBody{
		ID:   "Unique identifier for the family.",
		Name: "Name displayed at the top of the page.",
		History: []HTText{
			{
				Text: "A detailed description of the person's life history and marital status.",
				Source: []HTSource{
					{
						Type: 3210,
						UUID: "Unique identifier (UUID).",
						Text: "The accompanying text that will be displayed with the citation.",
						Page: "The specific page in the publication where this information appears.",
						Date: HTDate{
							DateType: "gregory",
							Year:     "2010",
							Month:    "",
							Day:      "",
						},
					},
				},
				FillDates: []HTDate{
					{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
				IsTable:     false,
				ImgDesc:     "A description of an image included in the text.",
				Format:      "markdown or html",
				PostMention: "",
			},
		},
		People: []FamilyPerson{
			{
				ID:         "Unique identifier for the person.",
				Name:       "Name of the person.",
				Surname:    "",
				Patronymic: "",
				FullName:   "",
				Sex:        "The biological classification of a person.",
				Gender:     "The gender identity or social role adopted by a person.",
				IsReal:     false,
				Haplogroup: []FamilyPersonHaplogroup{
					{
						Type:       "Specifies the described haplogroup. Valid options: mtDNA (Mitochondrial DNA), Y (Y chromosome), SNPs (Single-nucleotide polymorphisms).",
						Haplogroup: "The haplogroup value",
						Sources: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID).",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{
									DateType: "gregory",
									Year:     "2010",
									Month:    "",
									Day:      "",
								},
							},
						},
					},
				},
				History: []HTText{
					{
						Text: "A detailed description of the person's life history and marital status.",
						Source: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID).",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{
									DateType: "gregory",
									Year:     "2010",
									Month:    "",
									Day:      "",
								},
							},
						},
						FillDates: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						IsTable:     false,
						ImgDesc:     "A description of an image included in the text.",
						Format:      "markdown or html",
						PostMention: "",
					},
				},
				Parents: []FamilyPersonParents{
					{
						Type:               "theory or hypothesis",
						FatherExternalFile: false,
						FatherFamily:       "Unique identifier for the father's family. It should match the family ID used here.",
						FatherID:           "Unique identifier for the father.",
						FatherName:         "Name of the father.",
						MotherExternalFile: false,
						MotherFamily:       "Unique identifier for the mother's family.",
						MotherID:           "Unique identifier for the mother.",
						MotherName:         "Name of the mother.",
					},
				},
				Birth: []FamilyPersonEvent{
					{
						Date: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						Address:   "The address where the marriage took place.",
						CityID:    "",
						City:      "The city where the marriage occurred.",
						StateID:   "",
						State:     "The state where the marriage took place.",
						PC:        "The postal code of the marriage location.",
						CountryID: "",
						Country:   "The country where the marriage occurred.",
						Sources: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID) for the current citation.",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{
									DateType: "gregory",
									Year:     "2010",
									Month:    "",
									Day:      "",
								},
							},
						},
					},
				},
				Baptism: []FamilyPersonEvent{
					{
						Date: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						Address:   "The address where the marriage took place.",
						CityID:    "",
						City:      "The city where the marriage occurred.",
						StateID:   "",
						State:     "The state where the marriage took place.",
						PC:        "The postal code of the marriage location.",
						CountryID: "",
						Country:   "The country where the marriage occurred.",
						Sources: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID) for the current citation.",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{
									DateType: "gregory",
									Year:     "2010",
									Month:    "",
									Day:      "",
								},
							},
						},
					},
				},
				Marriages: []FamilyPersonMarriage{
					{
						Type:         "theory or hypothesis",
						ID:           "Unique identifier for the person.",
						GEDCOMId:     "",
						Official:     true,
						FamilyID:     "Unique identifier for the family.",
						ExternalFile: false,
						Name:         "Name of the spouse.",
						History: []HTText{
							{
								Text: "A detailed description of the person's life history and marital status.",
								Source: []HTSource{
									{
										Type: 3210,
										UUID: "Unique identifier (UUID) for the current citation.",
										Text: "The accompanying text that will be displayed with the citation.",
										Page: "The specific page in the publication where this information appears.",
										Date: HTDate{
											DateType: "gregory",
											Year:     "2010",
											Month:    "",
											Day:      "",
										},
									},
								},
								FillDates: []HTDate{
									{
										DateType: "gregory",
										Year:     "2010",
										Month:    "",
										Day:      "",
									},
								},
								IsTable:     false,
								ImgDesc:     "A description of an image included in the text.",
								Format:      "markdown or html",
								PostMention: "",
							},
						},
						DateTime: FamilyPersonEvent{
							Date:      nil,
							Address:   "",
							CityID:    "",
							City:      "",
							StateID:   "",
							State:     "",
							PC:        "",
							CountryID: "",
							Country:   "",
							Sources:   nil,
						},
					},
				},
				Divorced: nil,
				Children: []FamilyPersonChild{
					{
						Type:         "theory or hypothesis",
						ID:           "Unique identifier for the child.",
						MarriageID:   "Unique identifier for the marriage (parental connection).",
						Name:         "Name of the child.",
						FamilyID:     "Unique identifier for the child's family, used if the child establishes a new family.",
						ExternalFile: false,
						AddLink:      false,
						History: []HTText{
							{
								Text: "A detailed description of the person's life history and marital status.",
								Source: []HTSource{
									{
										Type: 3210,
										UUID: "Unique identifier (UUID) for the current citation.",
										Text: "The accompanying text that will be displayed with the citation.",
										Page: "The specific page in the publication where this information appears.",
										Date: HTDate{
											DateType: "gregory",
											Year:     "2010",
											Month:    "",
											Day:      "",
										},
									},
								},
								FillDates: []HTDate{
									{
										DateType: "gregory",
										Year:     "2010",
										Month:    "",
										Day:      "",
									},
								},
								IsTable:     false,
								ImgDesc:     "A description of an image included in the text.",
								Format:      "markdown or html",
								PostMention: "",
							},
						},
						AdoptedChild: false,
					},
				},
				Death: []FamilyPersonEvent{
					{
						Date: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						Address:   "The address where the marriage took place.",
						CityID:    "",
						City:      "The city where the marriage occurred.",
						StateID:   "",
						State:     "The state where the marriage took place.",
						PC:        "The postal code of the marriage location.",
						CountryID: "",
						Country:   "The country where the marriage occurred.",
						Sources: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID) for the current citation.",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{
									DateType: "gregory",
									Year:     "2010",
									Month:    "",
									Day:      "",
								},
							},
						},
					},
				},
			},
		},
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(family, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertFamilyPerson() {
	isInside, cursorPos := e.isInsidePeopleArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_people")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	person := FamilyPerson{
		ID:         "Unique identifier for the person.",
		Name:       "Name of the person.",
		Surname:    "",
		Patronymic: "",
		FullName:   "",
		Sex:        "The biological classification of a person.",
		Gender:     "The gender identity or social role adopted by a person.",
		IsReal:     false,
		Haplogroup: []FamilyPersonHaplogroup{
			{
				Type:       "Specifies the described haplogroup. Valid options: mtDNA (Mitochondrial DNA), Y (Y chromosome), SNPs (Single-nucleotide polymorphisms).",
				Haplogroup: "The haplogroup value",
				Sources: []HTSource{
					{
						Type: 3210,
						UUID: "Unique identifier (UUID).",
						Text: "The accompanying text that will be displayed with the citation.",
						Page: "The specific page in the publication where this information appears.",
						Date: HTDate{
							DateType: "gregory",
							Year:     "2010",
							Month:    "",
							Day:      "",
						},
					},
				},
			},
		},
		History: []HTText{
			{
				Text: "A detailed description of the person's life history and marital status.",
				Source: []HTSource{
					{
						Type: 3210,
						UUID: "Unique identifier (UUID).",
						Text: "The accompanying text that will be displayed with the citation.",
						Page: "The specific page in the publication where this information appears.",
						Date: HTDate{
							DateType: "gregory",
							Year:     "2010",
							Month:    "",
							Day:      "",
						},
					},
				},
				FillDates: []HTDate{
					{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
				IsTable:     false,
				ImgDesc:     "A description of an image included in the text.",
				Format:      "markdown or html",
				PostMention: "",
			},
		},
		Parents: []FamilyPersonParents{
			{
				Type:               "theory or hypothesis",
				FatherExternalFile: false,
				FatherFamily:       "Unique identifier for the father's family. It should match the family ID used here.",
				FatherID:           "Unique identifier for the father.",
				FatherName:         "Name of the father.",
				MotherExternalFile: false,
				MotherFamily:       "Unique identifier for the mother's family.",
				MotherID:           "Unique identifier for the mother.",
				MotherName:         "Name of the mother.",
			},
		},
		Birth: []FamilyPersonEvent{
			{
				Date: []HTDate{
					{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
				Address:   "The address where the marriage took place.",
				CityID:    "",
				City:      "The city where the marriage occurred.",
				StateID:   "",
				State:     "The state where the marriage took place.",
				PC:        "The postal code of the marriage location.",
				CountryID: "",
				Country:   "The country where the marriage occurred.",
				Sources: []HTSource{
					{
						Type: 3210,
						UUID: "Unique identifier (UUID).",
						Text: "The accompanying text that will be displayed with the citation.",
						Page: "The specific page in the publication where this information appears.",
						Date: HTDate{
							DateType: "gregory",
							Year:     "2010",
							Month:    "",
							Day:      "",
						},
					},
				},
			},
		},
		Baptism: []FamilyPersonEvent{
			{
				Date: []HTDate{
					{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
				Address:   "The address where the marriage took place.",
				CityID:    "",
				City:      "The city where the marriage occurred.",
				StateID:   "",
				State:     "The state where the marriage took place.",
				PC:        "The postal code of the marriage location.",
				CountryID: "",
				Country:   "The country where the marriage occurred.",
				Sources: []HTSource{
					{
						Type: 3210,
						UUID: "Unique identifier (UUID).",
						Text: "The accompanying text that will be displayed with the citation.",
						Page: "The specific page in the publication where this information appears.",
						Date: HTDate{
							DateType: "gregory",
							Year:     "2010",
							Month:    "",
							Day:      "",
						},
					},
				},
			},
		},
		Marriages: []FamilyPersonMarriage{
			{
				Type:         "theory or hypothesis",
				ID:           "Unique identifier for the person.",
				GEDCOMId:     "",
				Official:     true,
				FamilyID:     "Unique identifier for the family.",
				ExternalFile: false,
				Name:         "Name of the spouse.",
				History: []HTText{
					{
						Text: "A detailed description of the person's life history and marital status.",
						Source: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID).",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{
									DateType: "gregory",
									Year:     "2010",
									Month:    "",
									Day:      "",
								},
							},
						},
						FillDates: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						IsTable:     false,
						ImgDesc:     "A description of an image included in the text.",
						Format:      "markdown or html",
						PostMention: "",
					},
				},
				DateTime: FamilyPersonEvent{
					Date:      nil,
					Address:   "",
					CityID:    "",
					City:      "",
					StateID:   "",
					State:     "",
					PC:        "",
					CountryID: "",
					Country:   "",
					Sources:   nil,
				},
			},
		},
		Divorced: nil,
		Children: []FamilyPersonChild{
			{
				Type:         "theory or hypothesis",
				ID:           "Unique identifier for the child.",
				MarriageID:   "Unique identifier for the marriage (parental connection).",
				Name:         "Name of the child.",
				FamilyID:     "Unique identifier for the child's family, used if the child establishes a new family.",
				ExternalFile: false,
				AddLink:      false,
				History: []HTText{
					{
						Text: "A detailed description of the person's life history and marital status.",
						Source: []HTSource{
							{
								Type: 3210,
								UUID: "Unique identifier (UUID).",
								Text: "The accompanying text that will be displayed with the citation.",
								Page: "The specific page in the publication where this information appears.",
								Date: HTDate{
									DateType: "gregory",
									Year:     "2010",
									Month:    "",
									Day:      "",
								},
							},
						},
						FillDates: []HTDate{
							{
								DateType: "gregory",
								Year:     "2010",
								Month:    "",
								Day:      "",
							},
						},
						IsTable:     false,
						ImgDesc:     "A description of an image included in the text.",
						Format:      "markdown or html",
						PostMention: "",
					},
				},
				AdoptedChild: false,
			},
		},
		Death: []FamilyPersonEvent{
			{
				Date: []HTDate{
					{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
				Address:   "The address where the marriage took place.",
				CityID:    "",
				City:      "The city where the marriage occurred.",
				StateID:   "",
				State:     "The state where the marriage took place.",
				PC:        "The postal code of the marriage location.",
				CountryID: "",
				Country:   "The country where the marriage occurred.",
				Sources: []HTSource{
					{
						Type: 3210,
						UUID: "Unique identifier (UUID).",
						Text: "The accompanying text that will be displayed with the citation.",
						Page: "The specific page in the publication where this information appears.",
						Date: HTDate{
							DateType: "gregory",
							Year:     "2010",
							Month:    "",
							Day:      "",
						},
					},
				},
			},
		},
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(person, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertFamilyPersonParents() {
	isInside, cursorPos := e.isInsideParentsArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_parents")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	parents := FamilyPersonParents{
		Type:               "theory or hypothesis",
		FatherExternalFile: false,
		FatherFamily:       "Unique identifier for the father's family. It should match the family ID used here.",
		FatherID:           "Unique identifier for the father.",
		FatherName:         "Name of the father.",
		MotherExternalFile: false,
		MotherFamily:       "Unique identifier for the mother's family.",
		MotherID:           "Unique identifier for the mother.",
		MotherName:         "Name of the mother.",
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(parents, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertFamilyPersonMarriage() {
	isInside, cursorPos := e.isInsideMarriagesArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_marriages")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	marriage := FamilyPersonMarriage{
		Type:         "theory or hypothesis",
		ID:           "Unique identifier for the person.",
		GEDCOMId:     "",
		Official:     true,
		FamilyID:     "Unique identifier for the family.",
		ExternalFile: false,
		Name:         "Name of the spouse.",
		History: []HTText{
			{
				Text: "A detailed description of the person's life history and marital status.",
				Source: []HTSource{
					{
						Type: 3210,
						UUID: "Unique identifier (UUID) for the current citation.",
						Text: "The accompanying text that will be displayed with the citation.",
						Page: "The specific page in the publication where this information appears.",
						Date: HTDate{
							DateType: "gregory",
							Year:     "2010",
							Month:    "",
							Day:      "",
						},
					},
				},
				FillDates: []HTDate{
					{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
				IsTable:     false,
				ImgDesc:     "A description of an image included in the text.",
				Format:      "markdown or html",
				PostMention: "",
			},
		},
		DateTime: FamilyPersonEvent{
			Date:      nil,
			Address:   "",
			CityID:    "",
			City:      "",
			StateID:   "",
			State:     "",
			PC:        "",
			CountryID: "",
			Country:   "",
			Sources:   nil,
		},
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(marriage, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertFamilyPersonDivorced() {
	isInside, cursorPos := e.isInsideDivorcedArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_divorced")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	marriage := FamilyPersonMarriage{
		Type:         "theory or hypothesis",
		ID:           "Unique identifier for the person.",
		GEDCOMId:     "",
		Official:     false, // For divorced, it's not official anymore
		FamilyID:     "Unique identifier for the family.",
		ExternalFile: false,
		Name:         "Name of the spouse.",
		History: []HTText{
			{
				Text: "A detailed description of the person's life history and divorce.",
				Source: []HTSource{
					{
						Type: 3210,
						UUID: "Unique identifier (UUID) for the current citation.",
						Text: "The accompanying text that will be displayed with the citation.",
						Page: "The specific page in the publication where this information appears.",
						Date: HTDate{
							DateType: "gregory",
							Year:     "2010",
							Month:    "",
							Day:      "",
						},
					},
				},
				FillDates: []HTDate{
					{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
				IsTable:     false,
				ImgDesc:     "A description of an image included in the text.",
				Format:      "markdown or html",
				PostMention: "",
			},
		},
		DateTime: FamilyPersonEvent{ // This represents the divorce event details
			Date: []HTDate{
				{
					DateType: "gregory",
					Year:     "2010",
					Month:    "",
					Day:      "",
				},
			},
			Address:   "The address where the divorce took place.",
			CityID:    "",
			City:      "The city where the divorce occurred.",
			StateID:   "",
			State:     "",
			PC:        "",
			CountryID: "",
			Country:   "",
			Sources: []HTSource{
				{
					Type: 3210,
					UUID: "Unique identifier (UUID) for the current citation.",
					Text: "The accompanying text that will be displayed with the citation.",
					Page: "The specific page in the publication where this information appears.",
					Date: HTDate{
						DateType: "gregory",
						Year:     "2010",
						Month:    "",
						Day:      "",
					},
				},
			},
		},
	}
	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(marriage, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertFamilyPersonHaplogroup() {
	isInside, cursorPos := e.isInsideHaplogroupArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_haplogroup")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	haplogroup := FamilyPersonHaplogroup{
		Type:       "Specifies the described haplogroup. Valid options: mtDNA (Mitochondrial DNA), Y (Y chromosome), SNPs (Single-nucleotide polymorphisms).",
		Haplogroup: "The haplogroup value",
		Sources: []HTSource{
			{
				Type: 3210,
				UUID: "Unique identifier (UUID) for the current citation.",
				Text: "The accompanying text that will be displayed with the citation.",
				Page: "The specific page in the publication where this information appears.",
				Date: HTDate{
					DateType: "gregory",
					Year:     "2010",
					Month:    "",
					Day:      "",
				},
			},
		},
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(haplogroup, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertFamilyPersonBirth() {
	isInside, cursorPos := e.isInsideBirthArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_birth")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	event := FamilyPersonEvent{
		Date: []HTDate{
			{
				DateType: "gregory",
				Year:     "2010",
				Month:    "",
				Day:      "",
			},
		},
		Address:   "The address where the event took place.",
		CityID:    "",
		City:      "The city where the event occurred.",
		StateID:   "",
		State:     "The state where the event took place.",
		PC:        "The postal code of the event location.",
		CountryID: "",
		Country:   "The country where the event occurred.",
		Sources: []HTSource{
			{
				Type: 3210,
				UUID: "Unique identifier (UUID) for the current citation.",
				Text: "The accompanying text that will be displayed with the citation.",
				Page: "The specific page in the publication where this information appears.",
				Date: HTDate{
					DateType: "gregory",
					Year:     "2010",
					Month:    "",
					Day:      "",
				},
			},
		},
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(event, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertFamilyPersonBaptism() {
	isInside, cursorPos := e.isInsideBaptismArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_baptism")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	event := FamilyPersonEvent{
		Date: []HTDate{
			{
				DateType: "gregory",
				Year:     "2010",
				Month:    "",
				Day:      "",
			},
		},
		Address:   "The address where the event took place.",
		CityID:    "",
		City:      "The city where the event occurred.",
		StateID:   "",
		State:     "The state where the event took place.",
		PC:        "The postal code of the event location.",
		CountryID: "",
		Country:   "The country where the event occurred.",
		Sources: []HTSource{
			{
				Type: 3210,
				UUID: "Unique identifier (UUID) for the current citation.",
				Text: "The accompanying text that will be displayed with the citation.",
				Page: "The specific page in the publication where this information appears.",
				Date: HTDate{
					DateType: "gregory",
					Year:     "2010",
					Month:    "",
					Day:      "",
				},
			},
		},
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(event, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

func (e *TextEditor) insertFamilyPersonDeath() {
	isInside, cursorPos := e.isInsideDeathArray()
	if !isInside {
		dialog.ShowError(fmt.Errorf(htGetText("cursor_must_be_inside_death")), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	event := FamilyPersonEvent{
		Date: []HTDate{
			{
				DateType: "gregory",
				Year:     "2010",
				Month:    "",
				Day:      "",
			},
		},
		Address:   "The address where the event took place.",
		CityID:    "",
		City:      "The city where the event occurred.",
		StateID:   "",
		State:     "The state where the event took place.",
		PC:        "The postal code of the event location.",
		CountryID: "",
		Country:   "The country where the event occurred.",
		Sources: []HTSource{
			{
				Type: 3210,
				UUID: "Unique identifier (UUID) for the current citation.",
				Text: "The accompanying text that will be displayed with the citation.",
				Page: "The specific page in the publication where this information appears.",
				Date: HTDate{
					DateType: "gregory",
					Year:     "2010",
					Month:    "",
					Day:      "",
				},
			},
		},
	}

	indentation := e.getIndentationForInsertion(cursorPos)
	jsonData, err := json.MarshalIndent(event, indentation, "  ")
	if err != nil {
		dialog.ShowError(err, e.window)
		return
	}

	textBefore := e.currentDoc.content.Text[:cursorPos]
	trimmedTextBefore := strings.TrimRight(textBefore, " \t\n")
	insertText := string(jsonData)

	if len(trimmedTextBefore) > 0 {
		lastChar := trimmedTextBefore[len(trimmedTextBefore)-1]
		if lastChar != '[' && lastChar != ',' {
			insertText = ",\n" + insertText
		}
	}

	content := e.currentDoc.content
	oldClipboard := e.window.Clipboard().Content()
	e.window.Clipboard().SetContent(insertText)
	content.TypedShortcut(&fyne.ShortcutPaste{Clipboard: e.window.Clipboard()})
	e.window.Clipboard().SetContent(oldClipboard)
}

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
	dialog.ShowInformation(htGetText("about"), "History Tracers Editor\n\nEditor used to create History Tracers content.\nVersion 1.0\n\nThis an Open Source software shared under the GPL-3.0-or-later license.", e.window)
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
		dialog.ShowConfirm(htGetText("unsaved_changes"),
			fmt.Sprintf(htGetText("you_have_unsaved_documents"), unsavedCount),
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

func main() {
	HTCreateDir()
	HTParseCreateConfig()

	// Initialize language system
	if err := htInitLanguage(); err != nil {
		fmt.Fprintf(os.Stderr, "ERROR: Failed to initialize language system: %v\n", err)
	}

	editor := NewTextEditor()
	editor.Run()
}
