// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

// Adjust Family Files before generating GEDCOM for them
type FamilyValue struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Desc   string `json:"desc"`
	GedCom string `json:"gedcom"`
}

type FamilyContent struct {
	ID        string        `json:"id"`
	Desc      string        `json:"desc"`
	Target    string        `json:"target"`
	Page      string        `json:"page"`
	ValueType string        `json:"value_type"`
	HTMLValue string        `json:"html_value"`
	Value     []FamilyValue `json:"value"`
}

type Family struct {
	Title      string          `json:"title"`
	Header     string          `json:"header"`
	License    []string        `json:"license"`
	Sources    []string        `json:"sources"`
	LastUpdate []string        `json:"last_update"`
	GedCom     string          `json:"gedcom"`
	Contents   []FamilyContent `json:"content"`
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

	for i := 0; i < len(families.Contents); i++ {
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
