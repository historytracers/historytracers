// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/google/uuid"
)

type classContentValue struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Desc string `json:"desc"`
}

type classContent struct {
	ID        string              `json:"id"`
	Target    string              `json:"target"`
	Page      string              `json:"page"`
	ValueType string              `json:"value_type"`
	HtmlValue string              `json:"html_value"`
	Value     []classContentValue `json:"value"`
}

type classIdx struct {
	Title      string         `json:"title"`
	Header     string         `json:"header"`
	LastUpdate []string       `json:"last_update"`
	Sources    []string       `json:"sources"`
	License    []string       `json:"license"`
	Version    int            `json:"version"`
	Content    []classContent `json:"content"`
}

var localClassIDXUpdate bool

func htWriteClassIndexFile(lang string, index *classIdx) (string, error) {
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
	e.Encode(index)

	fp.Close()

	return tmpFile, nil
}

func htAddNewClassToIdx(index *classIdx, newFile string) {
	lastContent := len(index.Content) - 1
	if lastContent < 0 {
		return
	}

	content := &index.Content[lastContent]
	if content.Value == nil {
		return
	}

	newValue := classContentValue{ID: newFile, Name: "", Desc: ""}

	content.Value = append(content.Value, newValue)

	index.LastUpdate[0] = htUpdateTimestamp()
}

func htOpenClassIdx(fileName string, newFile string, lang string) error {
	localClassIDXUpdate = len(newFile) > 0
	if verboseFlag && localClassIDXUpdate {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		return err
	}

	var index classIdx
	err = json.Unmarshal(byteValue, &index)
	if err != nil {
		htCommonJsonError(byteValue, err)
		return err
	}

	if localClassIDXUpdate {
		htAddNewClassToIdx(&index, newFile)
	}

	tmpName, err1 := htWriteClassIndexFile(lang, &index)
	if err1 != nil {
		return err1
	}

	HTCopyFilesWithoutChanges(fileName, tmpName)
	err = os.Remove(tmpName)
	if err != nil {
		fmt.Println("ERROR", err)
		return err
	}

	return nil
}

func htCreateTestClass(fileName string) {
	htLangPaths := [3]string{"en-US", "es-ES", "pt-BR"}
	for i := 0; i < len(htLangPaths); i++ {
		localClassIDXUpdate = false
		idxPath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, htLangPaths[i], classTemplate)
		fmt.Println("Working with", idxPath)
		err := htOpenClassIdx(idxPath, fileName, htLangPaths[i])
		if err != nil {
			panic(err)
		}
	}
}

func htCreateNewClass() {
	id := uuid.New()
	strID := id.String()

	htCreateTestClass(strID)
	fmt.Printf("Class %s created for %s classTemplate\n", strID, classTemplate)
}

func htValidateClassFormats() {
	classTemplates := [5]string{"science", "history", "indigenous_who", "first_steps", "literature"}

	for i := 0; i < len(classTemplates); i++ {
		classTemplate = classTemplates[i]
		htCreateTestClass("")
	}
}
