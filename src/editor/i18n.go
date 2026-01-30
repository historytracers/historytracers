// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type HTEditorI18n struct {
	FileMenu     string `json:"file_menu"`
	EditMenu     string `json:"edit_menu"`
	ViewMenu     string `json:"view_menu"`
	InsertMenu   string `json:"insert_menu"`
	SettingsMenu string `json:"settings_menu"`
	HelpMenu     string `json:"help_menu"`
	TabsMenu     string `json:"tabs_menu"`
	WindowMenu   string `json:"window_menu"`

	Open         string `json:"open"`
	OpenInNewTab string `json:"open_in_new_tab"`
	New          string `json:"new"`
	Save         string `json:"save"`
	SaveAs       string `json:"save_as"`
	SaveAll      string `json:"save_all"`
	CloseTab     string `json:"close_tab"`
	CloseAllTabs string `json:"close_all_tabs"`
	Document     string `json:"document"`

	Cut             string `json:"cut"`
	Copy            string `json:"copy"`
	Paste           string `json:"paste"`
	SelectAll       string `json:"select_all"`
	Find            string `json:"find"`
	FindNext        string `json:"find_next"`
	EnterText       string `json:"enter_text"`
	FindPlaceholder string `json:"find_placeholder"`

	Content    string `json:"content"`
	Tools      string `json:"tools"`
	Audio      string `json:"audio"`
	Exercise   string `json:"exercise"`
	Game       string `json:"game"`
	FamilyTree string `json:"family_tree"`
	Atlas      string `json:"atlas"`
	Map        string `json:"map"`

	Date       string `json:"date"`
	Source     string `json:"source"`
	Text       string `json:"text"`
	Haplogroup string `json:"haplogroup"`
	Birth      string `json:"birth"`
	Baptism    string `json:"baptism"`
	Death      string `json:"death"`
	Person     string `json:"person"`
	Parents    string `json:"parents"`
	Marriage   string `json:"marriage"`
	Divorced   string `json:"divorced"`
	Family     string `json:"family"`

	NextTab     string `json:"next_tab"`
	PreviousTab string `json:"previous_tab"`
	ListAllTabs string `json:"list_all_tabs"`

	About        string `json:"about"`
	OpenSettings string `json:"open_settings"`

	Toolbar        string `json:"toolbar"`
	ContentToolbar string `json:"content_toolbar"`
	FamilyToolbar  string `json:"family_toolbar"`

	Settings    string `json:"settings"`
	Port        string `json:"port"`
	SourcePath  string `json:"source_path"`
	ContentPath string `json:"content_path"`
	LogPath     string `json:"log_path"`
	ConfigPath  string `json:"config_path"`
	Language    string `json:"language"`
	SaveBtn     string `json:"save_button"`

	StatusReady    string `json:"status_ready"`
	StatusModified string `json:"status_modified"`
	StatusSwitched string `json:"status_switched_to"`

	LoadTemplate   string `json:"load_template"`
	AtlasTemplate  string `json:"atlas_template"`
	ClassTemplate  string `json:"class_template"`
	FamilyTemplate string `json:"family_template"`
	SourceTemplate string `json:"source_template"`

	AtlasDesc  string `json:"atlas_desc"`
	ClassDesc  string `json:"class_desc"`
	FamilyDesc string `json:"family_desc"`
	SourceDesc string `json:"source_desc"`
	Close      string `json:"close"`

	UnsavedChanges          string `json:"unsaved_changes"`
	SaveChangesPrompt       string `json:"save_changes_prompt"`
	YouHaveUnsavedDocuments string `json:"you_have_unsaved_documents"`
	QuitAnyway              string `json:"quit_anyway"`

	FailedGetConfigDir string `json:"failed_get_config_dir"`
	FailedCreateConfig string `json:"failed_create_config"`
	FailedReadConfig   string `json:"failed_read_config"`

	CursorMustBeInsideAudio      string `json:"cursor_must_be_inside_audio"`
	CursorMustBeInsideAtlas      string `json:"cursor_must_be_inside_atlas"`
	CursorMustBeInsideDate       string `json:"cursor_must_be_inside_date"`
	CursorMustBeInsideSource     string `json:"cursor_must_be_inside_source"`
	CursorMustBeInsideText       string `json:"cursor_must_be_inside_text"`
	CursorMustBeInsideExercise   string `json:"cursor_must_be_inside_exercise"`
	CursorMustBeInsideGame       string `json:"cursor_must_be_inside_game"`
	CursorMustBeInsideFamily     string `json:"cursor_must_be_inside_family"`
	CursorMustBeInsidePeople     string `json:"cursor_must_be_inside_people"`
	CursorMustBeInsideParents    string `json:"cursor_must_be_inside_parents"`
	CursorMustBeInsideMarriages  string `json:"cursor_must_be_inside_marriages"`
	CursorMustBeInsideDivorced   string `json:"cursor_must_be_inside_divorced"`
	CursorMustBeInsideBirth      string `json:"cursor_must_be_inside_birth"`
	CursorMustBeInsideBaptism    string `json:"cursor_must_be_inside_baptism"`
	CursorMustBeInsideDeath      string `json:"cursor_must_be_inside_death"`
	CursorMustBeInsideHaplogroup string `json:"cursor_must_be_inside_haplogroup"`

	ErrorCreatingTemplate string `json:"error_creating_template"`
	UnknownTemplateType   string `json:"unknown_template_type"`

	EditorWindowTitle string `json:"editor_window_title"`
	GoTextEditor      string `json:"go_text_editor"`

	Untitled string `json:"untitled"`
}

type HTLanguageConfig struct {
	CurrentLanguage    string            `json:"current_language"`
	AvailableLanguages []string          `json:"available_languages"`
	LanguagePaths      map[string]string `json:"language_paths"`
}

var (
	LangConfig HTLanguageConfig
	I18n       HTEditorI18n
)

func htInitLanguage() error {
	// Get user config directory
	configDir, err := os.UserConfigDir()
	if err != nil {
		return fmt.Errorf("failed to get user config dir: %v", err)
	}

	// Check for language config file
	langConfigPath := filepath.Join(configDir, "historytracers", "editor_lang.json")

	// Try to load existing config
	if _, err := os.Stat(langConfigPath); err == nil {
		byteValue, err := os.ReadFile(langConfigPath)
		if err != nil {
			// Default to English if config exists but is unreadable
			LangConfig.CurrentLanguage = "en-US"
		} else {
			err = json.Unmarshal(byteValue, &LangConfig)
			if err != nil {
				LangConfig.CurrentLanguage = "en-US"
			} else if LangConfig.CurrentLanguage == "" {
				// Ensure we always have a default language
				LangConfig.CurrentLanguage = "en-US"
			}
		}
	} else {
		// Create default config if it doesn't exist
		LangConfig = HTLanguageConfig{
			CurrentLanguage:    "en-US",
			AvailableLanguages: []string{"en-US", "pt-BR", "es-ES"},
			LanguagePaths: map[string]string{
				"en-US": "lang/editor/en-US/editor.json",
				"pt-BR": "lang/editor/pt-BR/editor.json",
				"es-ES": "lang/editor/es-ES/editor.json",
			},
		}

		// Create directory if it doesn't exist
		if err := os.MkdirAll(filepath.Dir(langConfigPath), 0755); err != nil {
			return fmt.Errorf("failed to create language config dir: %v", err)
		}

		// Save default config
		err = htSaveLanguageConfig()
		if err != nil {
			return fmt.Errorf("failed to save default language config: %v", err)
		}
	}

	// Load the appropriate language file
	return htLoadLanguage(LangConfig.CurrentLanguage)
}

func htSetInternalEnglishValues() {
	I18n = HTEditorI18n{
		FileMenu:     "File",
		EditMenu:     "Edit",
		ViewMenu:     "View",
		InsertMenu:   "Insert",
		SettingsMenu: "Settings",
		HelpMenu:     "Help",
		TabsMenu:     "Tabs",
		WindowMenu:   "Window",

		Open:         "Open",
		OpenInNewTab: "Open in New Tab",
		New:          "New",
		Save:         "Save",
		SaveAs:       "Save As",
		SaveAll:      "Save All",
		CloseTab:     "Close Tab",
		CloseAllTabs: "Close All Tabs",
		Document:     "Document",

		Cut:             "Cut",
		Copy:            "Copy",
		Paste:           "Paste",
		SelectAll:       "Select All",
		Find:            "Find",
		FindNext:        "Find Next",
		EnterText:       "Enter text",
		FindPlaceholder: "Find text...",

		Content:    "Content",
		Tools:      "Tools",
		Audio:      "Audio",
		Exercise:   "Exercise",
		Game:       "Game",
		FamilyTree: "Family Tree",
		Atlas:      "Atlas",
		Map:        "Map",

		Date:       "Date",
		Source:     "Source",
		Text:       "Text",
		Haplogroup: "Haplogroup",
		Birth:      "Birth",
		Baptism:    "Baptism",
		Death:      "Death",
		Person:     "Person",
		Parents:    "Parents",
		Marriage:   "Marriage",
		Divorced:   "Divorced",
		Family:     "Family",

		NextTab:     "Next Tab",
		PreviousTab: "Previous Tab",
		ListAllTabs: "List All Tabs",

		About:        "About",
		OpenSettings: "Open Settings",

		Toolbar:        "Toolbar",
		ContentToolbar: "Content Toolbar",
		FamilyToolbar:  "Family Toolbar",

		Settings:    "Settings",
		Port:        "Port",
		SourcePath:  "Source Path",
		ContentPath: "Content Path",
		LogPath:     "Log Path",
		ConfigPath:  "Config Path",
		Language:    "Language",
		SaveBtn:     "Save",

		StatusReady:    "Ready",
		StatusModified: "Modified",
		StatusSwitched: "Switched to",

		LoadTemplate:   "Load Template",
		AtlasTemplate:  "Atlas Template",
		ClassTemplate:  "Class Template",
		FamilyTemplate: "Family Template",
		SourceTemplate: "Source Template",

		AtlasDesc:  "Create an Atlas document with maps and geographical content",
		ClassDesc:  "Create a Class document with educational content",
		FamilyDesc: "Create a Family Tree document with genealogical data",
		SourceDesc: "Create a Source document with citations and references",
		Close:      "Close",

		UnsavedChanges:          "Unsaved Changes",
		SaveChangesPrompt:       "Save changes before closing?",
		YouHaveUnsavedDocuments: "You have unsaved documents",
		QuitAnyway:              "Quit Anyway",

		FailedGetConfigDir: "Failed to get config directory",
		FailedCreateConfig: "Failed to create config",
		FailedReadConfig:   "Failed to read config",

		CursorMustBeInsideAudio:      "Cursor must be inside audio array",
		CursorMustBeInsideAtlas:      "Cursor must be inside atlas array",
		CursorMustBeInsideDate:       "Cursor must be inside date array",
		CursorMustBeInsideSource:     "Cursor must be inside source array",
		CursorMustBeInsideText:       "Cursor must be inside text array",
		CursorMustBeInsideExercise:   "Cursor must be inside exercise array",
		CursorMustBeInsideGame:       "Cursor must be inside game array",
		CursorMustBeInsideFamily:     "Cursor must be inside family array",
		CursorMustBeInsidePeople:     "Cursor must be inside people array",
		CursorMustBeInsideParents:    "Cursor must be inside parents array",
		CursorMustBeInsideMarriages:  "Cursor must be inside marriages array",
		CursorMustBeInsideDivorced:   "Cursor must be inside divorced array",
		CursorMustBeInsideBirth:      "Cursor must be inside birth array",
		CursorMustBeInsideBaptism:    "Cursor must be inside baptism array",
		CursorMustBeInsideDeath:      "Cursor must be inside death array",
		CursorMustBeInsideHaplogroup: "Cursor must be inside haplogroup array",

		ErrorCreatingTemplate: "Error creating template: %v",
		UnknownTemplateType:   "Unknown template type: %s",

		EditorWindowTitle: "History Tracers Editor",
		GoTextEditor:      "History Tracers Go Text Editor",

		Untitled: "Untitled",
	}
}

func htLoadLanguage(langCode string) error {
	// Get the language file path
	langPath, exists := LangConfig.LanguagePaths[langCode]
	if !exists {
		langPath = LangConfig.LanguagePaths["en-US"] // Fallback to English
		langCode = "en-US"
	}

	// Try to read the language file from the project directory first
	if byteValue, err := os.ReadFile(langPath); err == nil {
		err = json.Unmarshal(byteValue, &I18n)
		if err != nil {
			// If parsing fails, fall back to internal English values
			htSetInternalEnglishValues()
		}
	} else {
		// If file doesn't exist, use internal English values
		htSetInternalEnglishValues()
	}

	LangConfig.CurrentLanguage = langCode
	return nil
}

func htSaveLanguageConfig() error {
	// Get user config directory
	configDir, err := os.UserConfigDir()
	if err != nil {
		return fmt.Errorf("failed to get user config dir: %v", err)
	}

	langConfigPath := filepath.Join(configDir, "historytracers", "editor_lang.json")

	// Create directory if it doesn't exist
	if err := os.MkdirAll(filepath.Dir(langConfigPath), 0755); err != nil {
		return fmt.Errorf("failed to create language config dir: %v", err)
	}

	// Save config to JSON
	byteValue, err := json.MarshalIndent(LangConfig, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal language config: %v", err)
	}

	return os.WriteFile(langConfigPath, byteValue, 0644)
}

func htGetText(key string) string {
	// Use reflection to get the field value by name
	switch key {
	case "file_menu":
		return I18n.FileMenu
	case "edit_menu":
		return I18n.EditMenu
	case "view_menu":
		return I18n.ViewMenu
	case "insert_menu":
		return I18n.InsertMenu
	case "settings_menu":
		return I18n.SettingsMenu
	case "help_menu":
		return I18n.HelpMenu
	case "tabs_menu":
		return I18n.TabsMenu
	case "window_menu":
		return I18n.WindowMenu
	case "open":
		return I18n.Open
	case "open_in_new_tab":
		return I18n.OpenInNewTab
	case "new":
		return I18n.New
	case "save":
		return I18n.Save
	case "save_as":
		return I18n.SaveAs
	case "save_all":
		return I18n.SaveAll
	case "close_tab":
		return I18n.CloseTab
	case "close_all_tabs":
		return I18n.CloseAllTabs
	case "document":
		return I18n.Document
	case "cut":
		return I18n.Cut
	case "copy":
		return I18n.Copy
	case "paste":
		return I18n.Paste
	case "select_all":
		return I18n.SelectAll
	case "find":
		return I18n.Find
	case "find_next":
		return I18n.FindNext
	case "enter_text":
		return I18n.EnterText
	case "find_placeholder":
		return I18n.FindPlaceholder
	case "content":
		return I18n.Content
	case "tools":
		return I18n.Tools
	case "audio":
		return I18n.Audio
	case "exercise":
		return I18n.Exercise
	case "game":
		return I18n.Game
	case "family_tree":
		return I18n.FamilyTree
	case "atlas":
		return I18n.Atlas
	case "map":
		return I18n.Map
	case "date":
		return I18n.Date
	case "source":
		return I18n.Source
	case "text":
		return I18n.Text
	case "haplogroup":
		return I18n.Haplogroup
	case "birth":
		return I18n.Birth
	case "baptism":
		return I18n.Baptism
	case "death":
		return I18n.Death
	case "person":
		return I18n.Person
	case "parents":
		return I18n.Parents
	case "marriage":
		return I18n.Marriage
	case "divorced":
		return I18n.Divorced
	case "family":
		return I18n.Family
	case "next_tab":
		return I18n.NextTab
	case "previous_tab":
		return I18n.PreviousTab
	case "list_all_tabs":
		return I18n.ListAllTabs
	case "about":
		return I18n.About
	case "open_settings":
		return I18n.OpenSettings
	case "toolbar":
		return I18n.Toolbar
	case "content_toolbar":
		return I18n.ContentToolbar
	case "family_toolbar":
		return I18n.FamilyToolbar
	case "settings":
		return I18n.Settings
	case "port":
		return I18n.Port
	case "source_path":
		return I18n.SourcePath
	case "content_path":
		return I18n.ContentPath
	case "log_path":
		return I18n.LogPath
	case "config_path":
		return I18n.ConfigPath
	case "language":
		return I18n.Language
	case "status_ready":
		return I18n.StatusReady
	case "status_modified":
		return I18n.StatusModified
	case "status_switched_to":
		return I18n.StatusSwitched
	case "load_template":
		return I18n.LoadTemplate
	case "atlas_template":
		return I18n.AtlasTemplate
	case "class_template":
		return I18n.ClassTemplate
	case "family_template":
		return I18n.FamilyTemplate
	case "source_template":
		return I18n.SourceTemplate
	case "atlas_desc":
		return I18n.AtlasDesc
	case "class_desc":
		return I18n.ClassDesc
	case "family_desc":
		return I18n.FamilyDesc
	case "source_desc":
		return I18n.SourceDesc
	case "close":
		return I18n.Close
	case "unsaved_changes":
		return I18n.UnsavedChanges
	case "save_changes_prompt":
		return I18n.SaveChangesPrompt
	case "you_have_unsaved_documents":
		return I18n.YouHaveUnsavedDocuments
	case "quit_anyway":
		return I18n.QuitAnyway
	case "failed_get_config_dir":
		return I18n.FailedGetConfigDir
	case "failed_create_config":
		return I18n.FailedCreateConfig
	case "failed_read_config":
		return I18n.FailedReadConfig
	case "cursor_must_be_inside_audio":
		return I18n.CursorMustBeInsideAudio
	case "cursor_must_be_inside_atlas":
		return I18n.CursorMustBeInsideAtlas
	case "cursor_must_be_inside_date":
		return I18n.CursorMustBeInsideDate
	case "cursor_must_be_inside_source":
		return I18n.CursorMustBeInsideSource
	case "cursor_must_be_inside_text":
		return I18n.CursorMustBeInsideText
	case "cursor_must_be_inside_exercise":
		return I18n.CursorMustBeInsideExercise
	case "cursor_must_be_inside_game":
		return I18n.CursorMustBeInsideGame
	case "cursor_must_be_inside_family":
		return I18n.CursorMustBeInsideFamily
	case "cursor_must_be_inside_people":
		return I18n.CursorMustBeInsidePeople
	case "cursor_must_be_inside_parents":
		return I18n.CursorMustBeInsideParents
	case "cursor_must_be_inside_marriages":
		return I18n.CursorMustBeInsideMarriages
	case "cursor_must_be_inside_divorced":
		return I18n.CursorMustBeInsideDivorced
	case "cursor_must_be_inside_birth":
		return I18n.CursorMustBeInsideBirth
	case "cursor_must_be_inside_baptism":
		return I18n.CursorMustBeInsideBaptism
	case "cursor_must_be_inside_death":
		return I18n.CursorMustBeInsideDeath
	case "cursor_must_be_inside_haplogroup":
		return I18n.CursorMustBeInsideHaplogroup
	case "error_creating_template":
		return I18n.ErrorCreatingTemplate
	case "unknown_template_type":
		return I18n.UnknownTemplateType
	case "editor_window_title":
		return I18n.EditorWindowTitle
	case "go_text_editor":
		return I18n.GoTextEditor
	case "untitled":
		return I18n.Untitled
	default:
		return key // Fallback to key if not found
	}
}

func htSetLanguage(langCode string) error {
	if err := htLoadLanguage(langCode); err != nil {
		return err
	}
	return htSaveLanguageConfig()
}
