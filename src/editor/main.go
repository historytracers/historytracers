// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bytes"
	"encoding/json"
	"strings"

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

	/*
		jsonBytes, err := json.MarshalIndent(templateData, "", "  ")
		if err != nil {
			dialog.ShowError(fmt.Errorf("Error creating template: %v", err), e.window)
			return
		}
	*/

	newDoc := &Document{
		content:    widget.NewMultiLineEntry(),
		filePath:   "",
		isModified: true,
	}

	//newDoc.content.SetText(string(jsonBytes))
	newDoc.content.SetText(jsonStr)
	e.addDocument(newDoc, "Untitled")
}

func (e *TextEditor) createClassTemplate() classTemplateFile {
	return classTemplateFile{
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
		LastUpdate: []string{"The time of the last file update, represented in Unix Epoch time."},
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
						PostMention: "A character used after a mention to include citations.",
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
						PostMention: "A character used after a mention to include citations.",
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
}

func (e *TextEditor) createFamilyTemplate() Family {
	return Family{
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
		LastUpdate: []string{""},
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
				PostMention: "A character used after a mention to include citations.",
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
						PostMention: "A character used after a mention to include citations.",
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
								PostMention: "A character used after a mention to include citations.",
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
										PostMention: "A character used after a mention to include citations.",
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
										PostMention: "A character used after a mention to include citations.",
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
