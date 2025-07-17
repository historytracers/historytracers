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

type HTGameDesc struct {
	ImageDesc string   `json:"imageDesc"`
	DateTime  []HTDate `json:"date_time"`
}

type classTemplateFile struct {
	Title      string                 `json:"title"`
	Header     string                 `json:"header"`
	Sources    []string               `json:"sources"`
	Scripts    []string               `json:"scripts"`
	Audio      []HTAudio              `json:"audio"`
	Index      []string               `json:"index"`
	License    []string               `json:"license"`
	LastUpdate []string               `json:"last_update"`
	Authors    []string               `json:"authors"`
	Reviewers  []string               `json:"reviewers"`
	Type       string                 `json:"type"`
	Version    int                    `json:"version"`
	Editing    bool                   `json:"editing"`
	Content    []classTemplateContent `json:"content"`
	Exercises  []HTExercise           `json:"exercise_v2"`
	GameV1     []HTGameDesc           `json:"game_v2"`
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
	HTMLValue string              `json:"html_value"`
	Value     []classContentValue `json:"value"`
}

type classIdx struct {
	Title      string         `json:"title"`
	Header     string         `json:"header"`
	Audio      []HTAudio      `json:"audio"`
	LastUpdate []string       `json:"last_update"`
	Sources    []string       `json:"sources"`
	License    []string       `json:"license"`
	Version    int            `json:"version"`
	Content    []classContent `json:"content"`
	DateTime   []HTDate       `json:"date_time"`
}

var localClassIDXUpdate bool

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

func htWriteTemplateFile(lang string, newFile string, template *classTemplateFile) error {
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
		htCommonJSONError(byteValue, err)
		return err
	}

	htSetDefaultTemplateValues(&localTemplateFile, newFile)

	err = htWriteTemplateFile(lang, newFile, &localTemplateFile)
	if err != nil {
		htCommonJSONError(byteValue, err)
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
		htCommonJSONError(byteValue, err)
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
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	err = htAddNewClassTemplateToDirectory(newFile, lang)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	return nil
}

func htCreateOrTestClass(fileName string) {
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

func htRewriteClassFileTemplate() {
	var cf classTemplateFile
	fileName := fmt.Sprintf("%ssrc/json/class_template.json", CFG.SrcPath)
	if verboseFlag {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR Adjusting file", fileName)
		panic(err)
	}

	err = json.Unmarshal(byteValue, &cf)
	if err != nil {
		htCommonJSONError(byteValue, err)
		panic(err)
	}

	newFile, err := htWriteTmpFile(htLangPaths[0], &cf)
	HTCopyFilesWithoutChanges(fileName, newFile)
	err = os.Remove(newFile)
	if err != nil {
		panic(err)
	}
}

func htCreateNewClass() {
	id := uuid.New()
	strID := id.String()

	htRewriteClassFileTemplate()
	htRewriteSourceFileTemplate()

	htCreateOrTestClass(strID)
	fmt.Printf("Class %s created for %s classTemplate\n", strID, classTemplate)
}

func htValidateClassFormats() {
	for i := 0; i < len(indexFiles); i++ {
		classTemplate = indexFiles[i]
		htCreateOrTestClass("")
	}
}
