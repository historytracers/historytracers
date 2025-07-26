// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
)

type atlasTemplateContent struct {
	Image  string   `json:"image"`
	Author string   `json:"author"`
	Index  string   `json:"index"`
	Text   []HTText `json:"text"`
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

func htUpdateAtlasSources(localTemplateFile *atlasTemplateFile) {
	for _, atlasData := range localTemplateFile.Atlas {
		for _, textData := range atlasData.Text {
			if textData.Format == "markdown" {
				continue
			} else if textData.Format != "html" {
				log.Fatalf("Invalid type : %s", textData.Format)
			}

			if textData.Source == nil {
				continue
			}

			for i := 0; i < len(textData.Source); i++ {
				src := &textData.Source[i]
				element, ok := sourceMap[src.UUID]
				if ok {
					dt := &src.Date
					if len(dt.DateType) > 0 {
						continue
					}

					length := len(element.PublishDate)
					if length == 0 {
						continue
					}

					dt.DateType = "gregory"
					if length == 4 {
						dt.Year = element.PublishDate
					} else {
						fields := strings.Split(element.PublishDate, "-")
						length = len(fields)
						if length == 0 {
							continue
						}

						dt.Year = fields[0]
						dt.Month = fields[1]

						if length == 3 {
							dt.Day = fields[2]
						}
					}
				}
			}
		}
	}
}

func htLoopThroughAtlasFiles(Content []atlasTemplateContent) string {
	var ret string = ""
	for i := 0; i < len(Content); i++ {
		content := &Content[i]

		for j := 0; j < len(content.Text); j++ {
			text := &content.Text[j]
			ret += htTextToHumanText(text, false)
			ret += text.PostMention + "\n\n"
		}
		ret += ".\n\n"
	}

	return ret
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

	htLoadSourceFromFile(localTemplateFile.Sources)
	htUpdateAtlasSources(&localTemplateFile)

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
