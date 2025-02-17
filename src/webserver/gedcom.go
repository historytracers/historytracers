// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"

	"github.com/google/uuid"
)

// Adjust Family Files before generating GEDCOM for them
type FamilyValue struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Desc   string `json:"desc,omitempty"`
	GEDCOM string `json:"gedcom,omitempty"`
}

type FamilyContent struct {
	ID        string        `json:"id"`
	Desc      string        `json:"desc,omitempty"`
	Target    string        `json:"target,omitempty"`
	Page      string        `json:"page,omitempty"`
	ValueType string        `json:"value_type,omitempty"`
	HTMLValue string        `json:"html_value,omitempty"`
	Value     []FamilyValue `json:"value,omitempty"`
}

type Family struct {
	Title      string          `json:"title,omitempty"`
	Header     string          `json:"header,omitempty"`
	License    []string        `json:"license"`
	Sources    []string        `json:"sources,omitempty"`
	LastUpdate []string        `json:"last_update,omitempty"`
	GEDCOM     string          `json:"gedcom,omitempty"`
	Contents   []FamilyContent `json:"content"`
	DateTime   []HTDate        `json:"date_time"`
}

func htParseFamilySetGedCOM(families *Family, lang string) {
	if len(families.GEDCOM) > 0 {
		return
	}

	families.GEDCOM = fmt.Sprintf("gedcom/families-%s.ged", lang)
	fmt.Println("Setting GEDCOM file to: ", families.GEDCOM)
}

func htWriteFamilyFile(lang string, families *Family) (string, error) {
	id := uuid.New()
	strID := id.String()

	tmpFile := fmt.Sprintf("%slang/%s/%s.tmp", CFG.SrcPath, lang, strID)

	fp, err := os.Create(tmpFile)
	if err != nil {
		return "", err
	}

	e := json.NewEncoder(fp)
	e.SetEscapeHTML(false)
	e.SetIndent("", "   ")
	e.Encode(families)

	fp.Close()

	return tmpFile, nil
}

func htParseFamilyFile(fileName string, lang string) error {
	fmt.Println("Adjusting file", fileName)
	jsonFile, err := os.Open(fileName)
	if err != nil {
		return err
	}

	byteValue, err := io.ReadAll(jsonFile)
	if err != nil {
		return err
	}
	jsonFile.Close()

	var families Family
	err = json.Unmarshal(byteValue, &families)
	if err != nil {
		return err
	}

	htParseFamilySetGedCOM(&families, lang)

	for i := 0; i < len(families.Contents); i++ {
	}

	families.LastUpdate[0] = htUpdateTimestamp()

	newFile, err := htWriteFamilyFile(lang, &families)
	if err != nil {
		return err
	}

	HTCopyFilesWithoutChanges(fileName, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Println("ERROR", err)
		return err
	}

	return nil
}

func htUpdateAllFamilies() error {
	htLangPaths := [3]string{"en-US", "es-ES", "pt-BR"}
	for i := 0; i < len(htLangPaths); i++ {
		localPath := fmt.Sprintf("%slang/%s/families.json", CFG.SrcPath, htLangPaths[i])
		err := htParseFamilyFile(localPath, htLangPaths[i])
		if err != nil {
			panic(err)
		}
	}

	return nil
}

// Create Directories
func htRemoveCurrentGEDCOMDirectory(path string) {
	err := os.RemoveAll(path)
	if err != nil {
		panic(err)
	}
}

func htCreateGEDCOMDirectory() {
	localPath := fmt.Sprintf("%sgedcom/", CFG.SrcPath)
	htRemoveCurrentGEDCOMDirectory(localPath)

	fmt.Println("Creating GEDCOM directory", localPath)
	htCreateDirectory(localPath)
}

// Entries
func htCreateGEDCOM() int {
	htCreateGEDCOMDirectory()

	htUpdateAllFamilies()
	return 0
}
