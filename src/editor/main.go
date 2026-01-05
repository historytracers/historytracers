// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bytes"
	"encoding/json"
	"regexp"
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
)

type Document struct {
	content     *widget.Entry
	filePath    string
	isModified  bool
	tabItem     *container.TabItem
	lineNumbers *widget.Label
}

type TextEditor struct {
	app                 fyne.App
	window              fyne.Window
	documents           []*Document
	currentDoc          *Document
	tabContainer        *container.DocTabs
	statusBar           *widget.Label
	templatePath        string
	templateWindow      fyne.Window
	toolbar             *widget.Toolbar
	hideToolbarMenuItem *fyne.MenuItem
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
	e.toolbar = e.createToolbar()

	// Layout - tabs are now the main content area
	content := container.NewBorder(
		e.toolbar,
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
	newMenuItem := fyne.NewMenuItem("New", e.newFile)
	newMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyN, Modifier: fyne.KeyModifierShortcutDefault}

	openMenuItem := fyne.NewMenuItem("Open", e.openFile)
	openMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyO, Modifier: fyne.KeyModifierShortcutDefault}

	openInNewTabMenuItem := fyne.NewMenuItem("Open in New Tab", e.openInNewTab)
	saveMenuItem := fyne.NewMenuItem("Save", e.saveFile)
	saveMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyS, Modifier: fyne.KeyModifierShortcutDefault}

	saveAsMenuItem := fyne.NewMenuItem("Save As", e.saveAsFile)
	saveAllMenuItem := fyne.NewMenuItem("Save All", e.saveAllFiles)

	closeTabMenuItem := fyne.NewMenuItem("Close Tab", e.closeCurrentTab)
	closeTabMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyW, Modifier: fyne.KeyModifierShortcutDefault}

	closeAllTabsMenuItem := fyne.NewMenuItem("Close All Tabs", e.closeAllTabs)
	loadTemplateMenuItem := fyne.NewMenuItem("Load Template", e.showTemplateWindow)

	fileMenu := fyne.NewMenu("File",
		newMenuItem,
		openMenuItem,
		openInNewTabMenuItem,
		saveMenuItem,
		saveAsMenuItem,
		saveAllMenuItem,
		fyne.NewMenuItemSeparator(),
		closeTabMenuItem,
		closeAllTabsMenuItem,
		fyne.NewMenuItemSeparator(),
		loadTemplateMenuItem,
	)

	// Edit menu with shortcuts
	cutMenuItem := fyne.NewMenuItem("Cut", e.cutText)
	cutMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyX, Modifier: fyne.KeyModifierShortcutDefault}
	copyMenuItem := fyne.NewMenuItem("Copy", e.copyText)
	copyMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyC, Modifier: fyne.KeyModifierShortcutDefault}
	pasteMenuItem := fyne.NewMenuItem("Paste", e.pasteText)
	pasteMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyV, Modifier: fyne.KeyModifierShortcutDefault}
	selectAllMenuItem := fyne.NewMenuItem("Select All", e.selectAll)
	selectAllMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyA, Modifier: fyne.KeyModifierShortcutDefault}

	editMenu := fyne.NewMenu("Edit",
		cutMenuItem,
		copyMenuItem,
		pasteMenuItem,
		selectAllMenuItem,
	)

	insertMenu := fyne.NewMenu("Insert",
		fyne.NewMenuItem("Audio", e.insertAudio),
		fyne.NewMenuItem("Date", e.insertDate),
		fyne.NewMenuItem("Source", e.insertSource),
		fyne.NewMenuItem("Text", e.insertText),
	)

	// Tabs menu with shortcuts
	nextTabMenuItem := fyne.NewMenuItem("Next Tab", e.nextTab)
	nextTabMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyTab, Modifier: fyne.KeyModifierControl}

	prevTabMenuItem := fyne.NewMenuItem("Previous Tab", e.previousTab)
	prevTabMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyTab, Modifier: fyne.KeyModifierControl | fyne.KeyModifierShift}

	listAllTabsMenuItem := fyne.NewMenuItem("List All Tabs", e.showTabList)

	tabsMenu := fyne.NewMenu("Tabs",
		nextTabMenuItem,
		prevTabMenuItem,
		fyne.NewMenuItemSeparator(),
		listAllTabsMenuItem,
	)

	// Help menu with shortcut
	aboutMenuItem := fyne.NewMenuItem("About", e.showAbout)
	aboutMenuItem.Shortcut = &desktop.CustomShortcut{KeyName: fyne.KeyH, Modifier: fyne.KeyModifierShortcutDefault}

	helpMenu := fyne.NewMenu("Help",
		aboutMenuItem,
	)

	e.hideToolbarMenuItem = fyne.NewMenuItem("Toolbar", e.toggleToolbar)
	e.hideToolbarMenuItem.Checked = true

	windowMenu := fyne.NewMenu("Window",
		e.hideToolbarMenuItem,
	)

	mainMenu := fyne.NewMainMenu(
		fileMenu,
		editMenu,
		insertMenu,
		tabsMenu,
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
	e.window.MainMenu().Refresh()
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

	return container.NewScroll(container.NewBorder(nil, nil, doc.lineNumbers, nil, doc.content))
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

	atlasBtn := widget.NewButton("Atlas Template", func() {
		e.loadTemplate("atlas")
		e.templateWindow.Close()
	})

	classBtn := widget.NewButton("Class Template", func() {
		e.loadTemplate("class")
		e.templateWindow.Close()
	})

	familyBtn := widget.NewButton("Family Template", func() {
		e.loadTemplate("family")
		e.templateWindow.Close()
	})

	sourceBtn := widget.NewButton("Source Template", func() {
		e.loadTemplate("source")
		e.templateWindow.Close()
	})

	// Add descriptions
	content := container.NewVBox(
		widget.NewLabel("Creates a new Atlas document structure"),
		widget.NewSeparator(),
		container.NewHBox(layout.NewSpacer(), atlasBtn, layout.NewSpacer()),
		widget.NewLabel("Creates a new Class document structure"),
		widget.NewSeparator(),
		container.NewHBox(layout.NewSpacer(), classBtn, layout.NewSpacer()),
		widget.NewLabel("Creates a new Family document structure"),
		widget.NewSeparator(),
		container.NewHBox(layout.NewSpacer(), familyBtn, layout.NewSpacer()),
		widget.NewLabel("Creates a new Source document structure"),
		widget.NewSeparator(),
		container.NewHBox(layout.NewSpacer(), sourceBtn, layout.NewSpacer()),
		widget.NewSeparator(),
		container.NewHBox(layout.NewSpacer(), widget.NewButton("Close", func() {
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
		dialog.ShowError(fmt.Errorf("Unknown template type: %s", templateType), e.window)
		return
	}

	var buf bytes.Buffer
	encoder := json.NewEncoder(&buf)
	encoder.SetEscapeHTML(false) // This is the key change
	encoder.SetIndent("", "  ")

	err = encoder.Encode(templateData)
	if err != nil {
		dialog.ShowError(fmt.Errorf("Error creating template: %v", err), e.window)
		return
	}

	// Remove the trailing newline that Encode adds
	jsonStr := strings.TrimSuffix(buf.String(), "\n")

	doc := e.createNewDocument()
	doc.content.SetText(jsonStr)
	doc.isModified = true
	e.updateTabTitle(doc)
}

func (e *TextEditor) createSourceTemplate() HTSourceFile {
	ct := htUpdateTimestamp()
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

func (e *TextEditor) createAtlasTemplate() atlasTemplateFile {
	ct := htUpdateTimestamp()
	al := atlasTemplateFile{
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
		Content: []classTemplateContent{
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
		Atlas: []atlasTemplateContent{
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
			},
		},
	}
	return al
}

func (e *TextEditor) createClassTemplate() classTemplateFile {
	ct := htUpdateTimestamp()
	cl := classTemplateFile{
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
		Content: []classTemplateContent{
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
								UUID: "Unique identifier (UUID) for the current citation.",
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
	ct := htUpdateTimestamp()
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

		dialog.ShowError(fmt.Errorf("cursor must be inside a \"audio\" JSON array"), e.window)

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

func (e *TextEditor) insertDate() {

	isInside, cursorPos := e.isInsideDateArray()

	if !isInside {

		dialog.ShowError(fmt.Errorf("cursor must be inside a \"date_time\" or \"date\" JSON array"), e.window)

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
		dialog.ShowError(fmt.Errorf("cursor must be inside a \"sources\" JSON array"), e.window)
		return
	}

	if e.currentDoc == nil {
		return
	}

	source := HTSource{
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
		dialog.ShowError(fmt.Errorf("cursor must be inside a \"text\", \"history\" or \"common\" JSON array"), e.window)
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

func main() {
	HTCreateDir()
	HTParseCreateConfig()

	editor := NewTextEditor()
	editor.Run()
}
