// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	. "github.com/historytracers/common"
)

func htUpdateAtlasSources(localTemplateFile *AtlasTemplateFile) {
	for _, atlasData := range localTemplateFile.Atlas {
		for _, textData := range atlasData.Text {
			if textData.Format != "markdown" && textData.Format != "html" {
				log.Fatalf("Invalid type : %s", textData.Format)
			}

			if textData.Source == nil {
				continue
			}

			for _, src := range textData.Source {
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

func htLoopThroughAtlasFiles(Content []AtlasTemplateContent, lang string) string {
	var ret string = ""
	for _, content := range Content {
		for j := 0; j < len(content.Text); j++ {
			text := &content.Text[j]
			ret += htTextToHumanText(text, lang, false)
			if len(text.PostMention) > 0 {
				ret += text.PostMention
			}
			ret += ".\n\n"
		}
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

	var localTemplateFile AtlasTemplateFile
	err = json.Unmarshal(byteValue, &localTemplateFile)
	if err != nil {
		htCommonJSONError(byteValue, err)
		panic(err)
	}

	htLoadSourceFromFile(localTemplateFile.Sources)
	htUpdateAtlasSources(&localTemplateFile)

	_, fileWasModified := htGitModifiedMap[fileName]
	if fileWasModified {
		localTemplateFile.LastUpdate[0] = HTUpdateTimestamp()
	}

	newFile, err := htWriteTmpFile(lang, &localTemplateFile)
	if err != nil {
		panic(err)
	}
	HTCopyFilesWithoutChanges(fileName, newFile)
	err = os.Remove(newFile)
	if err != nil {
		panic(err)
	}
}

func htValidateAtlasFormats() {
	for _, dir := range htLangPaths {
		htRewriteAtlas(dir)
	}
}
