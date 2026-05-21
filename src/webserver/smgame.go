// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/google/uuid"
	. "github.com/historytracers/common"
)

func htRewriteSMGame(smGameFile string) error {
	if verboseFlag {
		fmt.Println("Adjusting file", smGameFile)
	}

	byteValue, err := htOpenFileReadClose(smGameFile)
	if err != nil {
		return err
	}

	var localSMGameFile SMGameFile
	err = json.Unmarshal(byteValue, &localSMGameFile)
	if err != nil {
		htCommonJSONError(byteValue, err)
		return err
	}

	if localSMGameFile.Sources != nil {
		htLoadSourceFromFile(localSMGameFile.Sources)
	}

	_, fileWasModified := htGitModifiedMap[smGameFile]
	if fileWasModified {
		localSMGameFile.LastUpdate[0] = HTUpdateTimestamp()
	}

	newFile, err := htWriteTmpFile("", &localSMGameFile)
	if err != nil {
		return err
	}
	HTCopyFilesWithoutChanges(smGameFile, newFile)
	return os.Remove(newFile)
}

func htValidateSMGameFormats() {
	for _, dir := range htLangPaths {
		smGameDir := fmt.Sprintf("%slang/%s/smGame/", CFG.SrcPath, dir)
		entries, err := os.ReadDir(smGameDir)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			smGameFile := smGameDir + entry.Name()
			err := htRewriteSMGame(smGameFile)
			if err != nil {
				fmt.Fprintln(os.Stderr, "ERROR:", err)
			}
		}
	}
}

func htWriteSMGameFile(lang string, newFile string, template *SMGameFile) error {
	pathFile := fmt.Sprintf("%slang/%s/smGame/%s/index.json", CFG.SrcPath, lang, newFile)

	dirPath := fmt.Sprintf("%slang/%s/smGame/%s", CFG.SrcPath, lang, newFile)
	err := os.MkdirAll(dirPath, 0755)
	if err != nil {
		return err
	}

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

func htSetDefaultSMGameValues(fp *SMGameFile, newFile string) {
	fp.Sources = []string{newFile}
	fp.License = []string{"SPDX-License-Identifier: GPL-3.0-or-later"}
	fp.LastUpdate = []string{HTUpdateTimestamp()}
	fp.Authors = ""
	fp.Reviewers = ""
	fp.Version = 1
	fp.Type = "sm_game"
	fp.Content = []SMGameContent{}
	fp.Levels = []SMGameLevel{}
	fp.DateTime = []HTDate{}
}

func htCreateNewSMGame() {
	id := uuid.New()
	strID := id.String()

	for _, dir := range htLangPaths {
		var localSMGameFile SMGameFile
		htSetDefaultSMGameValues(&localSMGameFile, strID)

		err := htWriteSMGameFile(dir, strID, &localSMGameFile)
		if err != nil {
			panic(err)
		}
		fmt.Printf("SMGame %s created in %s\n", strID, dir)
	}

	htAddNewJSToDirectory(strID)
	htAddNewSourceToDirectory(strID)
}
