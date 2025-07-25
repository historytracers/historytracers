// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type atlasTemplateContent struct {
	ID   string   `json:"id"`
	Text []HTText `json:"text"`
}

type atlasTemplateFile struct {
	Title      string                 `json:"title"`
	Header     string                 `json:"header"`
	Sources    []string               `json:"sources"`
	Scripts    []string               `json:"scripts"`
	Audio      []HTAudio              `json:"audio"`
	License    []string               `json:"license"`
	LastUpdate []string               `json:"last_update"`
	Authors    []string               `json:"authors"`
	Reviewers  []string               `json:"reviewers"`
	Type       string                 `json:"type"`
	Version    int                    `json:"version"`
	Editing    bool                   `json:"editing"`
	Content    []classTemplateContent `json:"content"`
	Atlas      []atlasTemplateContent `json:"atlas"`
}

func htRewriteAtlas(lang string) {
	fileName := fmt.Sprintf("%slang/%s/atlas.json", CFG.SrcPath, lang)

	if verboseFlag {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		panic(err)
	}

	var localTemplateFile atlasTemplateFile
	err = json.Unmarshal(byteValue, &localTemplateFile)
	if err != nil {
		htCommonJSONError(byteValue, err)
		panic(err)
	}

	newFile, err := htWriteTmpFile(lang, &localTemplateFile)
	HTCopyFilesWithoutChanges(fileName, newFile)
	err = os.Remove(newFile)
	if err != nil {
		panic(err)
	}
}

func htValidateAtlasFormats() {
	for i := 0; i < len(htLangPaths); i++ {
		htRewriteAtlas(htLangPaths[i])
	}
}
