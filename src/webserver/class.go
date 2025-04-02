// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/google/uuid"
)

type classTemplateContent struct {
	ID   string   `json:"id"`
	Text []HTText `json:"text"`
}

type classTemplateFile struct {
	Title      string                 `json:"title"`
	Header     string                 `json:"header"`
	Sources    []string               `json:"sources"`
	Scripts    []string               `json:"scripts"`
	Index      []string               `json:"index"`
	License    []string               `json:"license"`
	LastUpdate []string               `json:"last_update"`
	Authors    []string               `json:"authors"`
	Reviewers  []string               `json:"reviewers"`
	Type       string                 `json:"type"`
	Version    int                    `json:"version"`
	Content    []classTemplateContent `json:"content"`
	Exercises  []HTExercise           `json:"exercise_v2"`
	DateTime   []HTDate               `json:"date_time"`
}

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
	Audio      string         `json:"audio"`
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

func htSetDefaultTemplateValues(fp *classTemplateFile, newFile string) {
	fp.Title = ""
	fp.Header = ""
	fp.Sources[0] = newFile
	fp.Scripts[0] = newFile
	fp.Index[0] = classTemplate
	fp.LastUpdate[0] = htUpdateTimestamp()
	fp.Authors[0] = ""
	fp.Reviewers[0] = ""
}

func htWriteTemplateFileFile(lang string, newFile string, template *classTemplateFile) error {
	pathFile := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, newFile)

	fp, err := os.Create(pathFile)
	if err != nil {
		return err
	}

	e := json.NewEncoder(fp)
	e.SetEscapeHTML(false)
	e.SetIndent("", "   ")
	e.Encode(template)

	fp.Close()

	return nil
}

func htAddNewClassTemplateToDirectory(newFile string, lang string) error {
	templatePath := fmt.Sprintf("%ssrc/json/class_template.json", CFG.SrcPath)

	byteValue, err := htOpenFileReadClose(templatePath)
	if err != nil {
		return err
	}

	var localTemplateFile classTemplateFile
	err = json.Unmarshal(byteValue, &localTemplateFile)
	if err != nil {
		htCommonJsonError(byteValue, err)
		return err
	}

	htSetDefaultTemplateValues(&localTemplateFile, newFile)

	err = htWriteTemplateFileFile(lang, newFile, &localTemplateFile)
	if err != nil {
		htCommonJsonError(byteValue, err)
		return err
	}

	return nil
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

	err = htAddNewClassTemplateToDirectory(newFile, lang)
	if err != nil {
		fmt.Println("ERROR", err)
		return err
	}

	return nil
}

func htAddNewJSToDirectory(newFile string) {
	srcPath := fmt.Sprintf("%ssrc/js/classes.js", CFG.SrcPath)
	dstPath := fmt.Sprintf("%s/js/%s.js", CFG.SrcPath, newFile)

	HTCopyFilesWithoutChanges(dstPath, srcPath)
}

func htAddNewSourceToDirectory(newFile string) {
	srcPath := fmt.Sprintf("%ssrc/json/sources_template.json", CFG.SrcPath)
	dstPath := fmt.Sprintf("%s/lang/source/%s.json", CFG.SrcPath, newFile)

	HTCopyFilesWithoutChanges(dstPath, srcPath)
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
	htAddNewJSToDirectory(fileName)
	htAddNewSourceToDirectory(fileName)
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
