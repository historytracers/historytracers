// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"

	"jaytaylor.com/html2text"
)

func htTextToHumanText(txt *HTText) string {
	var finalText string = ""
	var htmlText string
	var err error

	if txt.Format == "html" {
		htmlText = txt.Text
	} else if txt.Format == "markdown" {
		work := txt.Text
		if len(txt.PostMention) > 0 {
			work += txt.PostMention
		}
		// Change <htdate?> according to number of dates in the array.
		size := len(txt.FillDates)
		if size > 0 {
			for i := 0; i < size; i++ {
				dt := htDateToString(&txt.FillDates[i])
				overwrite := "<htade" + strconv.Itoa(i) + ">"
				work = strings.Replace(work, overwrite, dt, 1)
			}
		}

		extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
		p := parser.NewWithExtensions(extensions)
		md := []byte(txt.Text)
		doc := p.Parse(md)

		htmlFlags := html.CommonFlags | html.HrefTargetBlank
		opts := html.RendererOptions{Flags: htmlFlags}
		renderer := html.NewRenderer(opts)

		out := markdown.Render(doc, renderer)

		htmlText = string(out)
	} else {
		return finalText
	}

	finalText, err = html2text.FromString(htmlText, html2text.Options{PrettyTables: true})
	if err != nil {
		panic(err)
	}

	return finalText
}

func htLoadFamilyIndex(fileName string, lang string) error {
	if verboseFlag {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR Adjusting file", fileName)
		return err
	}

	var index IdxFamily
	err = json.Unmarshal(byteValue, &index)
	if err != nil {
		htCommonJsonError(byteValue, err)
		return err
	}

	return nil
}

func htFamiliesToAudio() {
	for i := 0; i < len(htLangPaths); i++ {
		localPath := fmt.Sprintf("%slang/%s/families.json", CFG.SrcPath, htLangPaths[i])
		err := htLoadFamilyIndex(localPath, htLangPaths[i])
		if err != nil {
			return
		}
	}
}
