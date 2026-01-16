// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/google/uuid"
	. "github.com/historytracers/common"
)

var localClassIDXUpdate bool

func htAddNewClassToIdx(index *ClassIdx, newFile string) {
	lastContent := len(index.Content) - 1
	if lastContent < 0 {
		return
	}

	content := &index.Content[lastContent]

	newValue := ClassContentValue{ID: newFile, Name: "", Desc: ""}

	content.Value = append(content.Value, newValue)

	index.LastUpdate[0] = HTUpdateTimestamp()
}

func htSetDefaultTemplateValues(fp *ClassTemplateFile, newFile string) {
	fp.Title = ""
	fp.Header = ""
	fp.Sources[0] = newFile
	fp.Scripts[0] = newFile
	fp.Index[0] = classTemplate
	fp.LastUpdate[0] = HTUpdateTimestamp()
	fp.Authors[0] = ""
	fp.Reviewers[0] = ""
	fp.Type = "class"
	fp.Version = 2
}

func htWriteTemplateFile(lang string, newFile string, template *ClassTemplateFile) error {
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

	var localTemplateFile ClassTemplateFile
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

	var index ClassIdx
	err = json.Unmarshal(byteValue, &index)
	if err != nil {
		htCommonJSONError(byteValue, err)
		return err
	}

	if localClassIDXUpdate {
		htAddNewClassToIdx(&index, newFile)
	}

	_, fileWasModified := htGitModifiedMap[fileName]
	if fileWasModified {
		index.LastUpdate[0] = HTUpdateTimestamp()
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
	for _, dir := range htLangPaths {
		localClassIDXUpdate = false
		idxPath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, dir, classTemplate)
		fmt.Println("Working with", idxPath)
		err := htOpenClassIdx(idxPath, fileName, dir)
		if err != nil {
			panic(err)
		}
	}
	htAddNewJSToDirectory(fileName)
	htAddNewSourceToDirectory(fileName)
}

func htRewriteClassFileTemplate() {
	var cf ClassTemplateFile
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
	}
}
