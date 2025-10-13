// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"fmt"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/css"
	"github.com/tdewolff/minify/v2/html"
	"github.com/tdewolff/minify/v2/js"
	"github.com/tdewolff/minify/v2/json"

	"github.com/google/uuid"
)

type HTFileChanged struct {
	FileName string
	Equal    bool
}

// COMMON
const (
	HTCSSCommon = iota
	HTCSSMath
	HTJSCommon
	HTJSMath
	HTJSChart

	HTLastFile
)

var htFiles [HTLastFile]string = [HTLastFile]string{"ht_common.css", "ht_math.css", "ht_common.js",
	"ht_math.js", "ht_chart.js"}

const (
	HTDirBodies = iota
	HTDirCSS
	HTDirCSV
	HTDirGEDCOM
	HTDirImages
	HTDirJS
	HTDirLang
	HTDirLangSources
	HTDirLangEnUS
	HTDirLangEnUSGames
	HTDirLangEsES
	HTDirLangEsESGames
	HTDirLangPtBR
	HTDirLangPtBRGames
	HTDirWebFonts
)

var htDirectories []string = []string{"bodies", "css", "csv", "gedcom", "images", "js", "lang",
	"lang/sources", "lang/en-US", "lang/en-US/smGame",
	"lang/es-ES", "lang/es-ES/smGame", "lang/pt-BR",
	"lang/pt-BR/smGame", "webfonts"}

var readmePattern = regexp.MustCompile("^README")
var htPattern = regexp.MustCompile("^ht_")
var faPattern = regexp.MustCompile("^fa_")
var chartPattern = regexp.MustCompile("^chart_")
var jqueryPattern = regexp.MustCompile("^jquery-")
var showdownPattern = regexp.MustCompile("^showdown.")
var rewriteHTML bool = false

func htMinifyCreateDirectories() {
	htCreateDirectory(CFG.ContentPath)
	var localPath string

	for _, dir := range htDirectories {
		localPath = CFG.ContentPath + dir
		if verboseFlag {
			fmt.Println("Creating directory", localPath)
		}
		htCreateDirectory(localPath)
	}
}

func htMinifyRemoveOldContent() {
	err := os.RemoveAll(CFG.ContentPath)
	if err != nil {
		panic(err)
	}
}

func htMinifyCommonFile(m *minify.M, minifyType string, inFile string, outFile string) error {
	r, err1 := os.Open(inFile)
	if err1 != nil {
		return err1
	}

	w, err2 := os.Create(outFile)
	if err2 != nil {
		return err2
	}

	if err3 := m.Minify(minifyType, w, r); err3 != nil {
		return err3
	}

	err4 := w.Close()
	if err4 != nil {
		return err4
	}

	return nil
}

func htUpdateHTCSS() error {
	var finalFile string
	var outFile string
	var inFile string

	m := minify.New()
	m.AddFunc("text/css", css.Minify)

	srcBodies := fmt.Sprintf("%ssrc/css/", CFG.SrcPath)
	entries, err := os.ReadDir(srcBodies)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	inBodies := fmt.Sprintf("%scss/", CFG.SrcPath)
	outBodies := fmt.Sprintf("%scss/", CFG.ContentPath)

	id := uuid.New()
	strID := id.String()

	tmpFile := fmt.Sprintf("%s%s", srcBodies, strID)
	for _, fileName := range entries {
		inFile = fmt.Sprintf("%s%s", srcBodies, fileName.Name())

		htMinifyCSSFile(m, inFile, tmpFile)

		outFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		finalFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())

		equal, err := HTAreFilesEqual(tmpFile, outFile)
		if !equal && err == nil {
			rewriteHTML = true
		}

		HTCopyFilesWithoutChanges(finalFile, tmpFile)
		HTCopyFilesWithoutChanges(outFile, finalFile)
	}

	err = os.Remove(tmpFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	return nil
}

// CSS
func htParseCSS(fileName string) bool {
	if faPattern.MatchString(fileName) {
		return true
	}
	return false
}

func htMinifyCSSFile(m *minify.M, inFile string, outFile string) error {
	if verboseFlag {
		fmt.Println("Minifying CSS", outFile)
	}
	return htMinifyCommonFile(m, "text/css", inFile, outFile)
}

func htMinifyCSS() {
	var outFile string
	var inFile string

	m := minify.New()
	m.AddFunc("text/css", css.Minify)

	// Copy only Font Awesome
	outBodies := fmt.Sprintf("%scss/", CFG.ContentPath)
	inBodies := fmt.Sprintf("%scss/", CFG.SrcPath)
	entries, err := os.ReadDir(inBodies)
	if err != nil {
		panic(err)
	}

	for _, fileName := range entries {
		if htParseCSS(fileName.Name()) == false {
			continue
		}

		outFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		HTCopyFilesWithoutChanges(outFile, inFile)
	}
}

// JSON
func htParseJSON(fileName string) bool {
	if readmePattern.MatchString(fileName) {
		return false
	}

	switch fileName {
	case "smGame":
		return false
	default:
		return true
	}
	return true
}

func htMinifyJSONFile(m *minify.M, inFile string, outFile string) error {
	if verboseFlag {
		fmt.Println("Minifying JSON", outFile)
	}
	return htMinifyCommonFile(m, "application/json", inFile, outFile)
}

func htMinifyJSON() {
	var outFile string
	var inFile string
	var err error

	m := minify.New()
	m.AddFunc("application/json", json.Minify)

	for i := HTDirLangSources; i < HTDirWebFonts; i++ {
		outBodies := fmt.Sprintf("%s%s/", CFG.ContentPath, htDirectories[i])
		inBodies := fmt.Sprintf("%s%s/", CFG.SrcPath, htDirectories[i])
		entries, err1 := os.ReadDir(inBodies)
		if err1 != nil {
			panic(err1)
		}

		for _, fileName := range entries {
			if htParseJSON(fileName.Name()) == false {
				continue
			}

			outFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())
			inFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
			err = htMinifyJSONFile(m, inFile, outFile)
			if err != nil {
				panic(err)
			}
		}
	}
}

func htCopyJSONWithoutChanges() {
	dstFile := fmt.Sprintf("%slang/lang_list.json", CFG.ContentPath)
	srcFile := fmt.Sprintf("%slang/lang_list.json", CFG.SrcPath)
	err := HTCopyFilesWithoutChanges(dstFile, srcFile)
	if err != nil {
		panic(err)
	}
}

// JS
func htMinifyJSFile(m *minify.M, inFile string, outFile string) error {
	if verboseFlag {
		fmt.Println("Minifying JS", outFile)
	}
	return htMinifyCommonFile(m, "application/javascript", inFile, outFile)
}

func htParseJS(fileName string, dstFile string, srcFile string) bool {
	if readmePattern.MatchString(fileName) {
		return false
	}

	if chartPattern.MatchString(fileName) ||
		jqueryPattern.MatchString(fileName) ||
		showdownPattern.MatchString(fileName) {
		err := HTCopyFilesWithoutChanges(dstFile, srcFile)
		if err != nil {
			panic(err)
		}
		return false
	}
	switch fileName {
	case "astro.js":
	case "calendar.js":
		err := HTCopyFilesWithoutChanges(dstFile, srcFile)
		if err != nil {
			panic(err)
		}
		return false
	default:
		return true
	}
	return true
}

func htMinifyJS() {
	var outFile string
	var inFile string

	m := minify.New()
	var err error
	m.AddFunc("application/javascript", js.Minify)

	outBodies := fmt.Sprintf("%sjs/", CFG.ContentPath)
	inBodies := fmt.Sprintf("%sjs/", CFG.SrcPath)
	entries, err1 := os.ReadDir(inBodies)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		if htParseJS(fileName.Name(), outFile, inFile) == false {
			continue
		}

		err = htMinifyJSFile(m, inFile, outFile)
		if err != nil {
			panic(err)
		}
	}
}

func htUpdateHTJS() {
	var finalFile string
	var outFile string
	var inFile string

	m := minify.New()
	m.AddFunc("application/javascript", js.Minify)

	srcBodies := fmt.Sprintf("%ssrc/js/", CFG.SrcPath)
	entries, err := os.ReadDir(srcBodies)
	if err != nil {
		panic(err)
	}

	inBodies := fmt.Sprintf("%sjs/", CFG.SrcPath)
	outBodies := fmt.Sprintf("%sjs/", CFG.ContentPath)

	id := uuid.New()
	strID := id.String()

	tmpFile := fmt.Sprintf("%s%s", srcBodies, strID)
	for _, fileName := range entries {
		if htPattern.MatchString(fileName.Name()) == false {
			continue
		}
		inFile = fmt.Sprintf("%s%s", srcBodies, fileName.Name())

		htMinifyJSFile(m, inFile, tmpFile)

		outFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		finalFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())

		equal, err := HTAreFilesEqual(tmpFile, outFile)
		if !equal && err == nil {
			rewriteHTML = true
		}

		HTCopyFilesWithoutChanges(finalFile, tmpFile)
		HTCopyFilesWithoutChanges(outFile, finalFile)
	}

	err = os.Remove(tmpFile)
	if err != nil {
		panic(err)
	}
}

// HTML
func htUpdateIndex() {
	var searchFile string
	var newStr string
	indexFile := fmt.Sprintf("%sindex.html", CFG.SrcPath)
	index, err := os.ReadFile(indexFile)
	if err != nil {
		panic(err)
	}

	str := string(index)
	for i := 0; i < len(htFiles); i++ {
		if i < HTJSCommon {
			searchFile = fmt.Sprintf("<link rel=\"stylesheet\" href=\"css/%s?v=", htFiles[i])
		} else {
			searchFile = fmt.Sprintf("<script type=\"text/javascript\" src=\"js/%s?v=", htFiles[i])
		}

		idx := strings.Index(str, searchFile)
		if idx == -1 {
			continue
		}

		overwriteStr := str[idx : idx+len(searchFile)+12]
		newStr = fmt.Sprintf("%s%d\">", searchFile, time.Now().Unix())

		str = strings.Replace(str, overwriteStr, newStr, -1)
	}

	err = os.WriteFile(indexFile, []byte(str), 0644)
	if err != nil {
		panic(err)
	}
}

func htMinifyHTMLFile(m *minify.M, inFile string, outFile string) error {
	if verboseFlag {
		fmt.Println("Minifying HTML", outFile)
	}
	return htMinifyCommonFile(m, "text/html", inFile, outFile)
}

func htMinifyHTML() {
	var outFile string
	var inFile string

	outFile = fmt.Sprintf("%sindex.html", CFG.ContentPath)
	inFile = fmt.Sprintf("%sindex.html", CFG.SrcPath)

	m := minify.New()
	var err error
	m.AddFunc("text/html", html.Minify)

	err0 := htMinifyHTMLFile(m, inFile, outFile)
	if err0 != nil {
		panic(err0)
	}

	outBodies := fmt.Sprintf("%sbodies/", CFG.ContentPath)
	inBodies := fmt.Sprintf("%sbodies/", CFG.SrcPath)
	entries, err1 := os.ReadDir(inBodies)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		err = htMinifyHTMLFile(m, inFile, outFile)
		if err != nil {
			panic(err)
		}
	}
}

func htCopyWebFonts() {
	var outFile string
	var inFile string
	var err error

	outWebFonts := fmt.Sprintf("%swebfonts/", CFG.ContentPath)
	inWebFonts := fmt.Sprintf("%swebfonts/", CFG.SrcPath)

	entries, err1 := os.ReadDir(inWebFonts)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outWebFonts, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inWebFonts, fileName.Name())
		err = HTCopyFilesWithoutChanges(outFile, inFile)
		if err != nil {
			panic(err)
		}
	}
}

func htCopyCSV() {
	var outFile string
	var inFile string
	var err error

	outCSV := fmt.Sprintf("%scsv/", CFG.ContentPath)
	inCSV := fmt.Sprintf("%scsv/", CFG.SrcPath)

	entries, err1 := os.ReadDir(inCSV)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outCSV, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inCSV, fileName.Name())
		err = HTCopyFilesWithoutChanges(outFile, inFile)
		if err != nil {
			panic(err)
		}
	}
}

func htCopyGEDCOM() {
	var outFile string
	var inFile string
	var err error

	outGEDCOM := fmt.Sprintf("%sgedcom/", CFG.ContentPath)
	inGEDCOM := fmt.Sprintf("%sgedcom/", CFG.SrcPath)

	entries, err1 := os.ReadDir(inGEDCOM)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outGEDCOM, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inGEDCOM, fileName.Name())
		err = HTCopyFilesWithoutChanges(outFile, inFile)
		if err != nil {
			panic(err)
		}
	}
}

func htCopyImagesSpecificDir(outImages string, inImages string) {
	var outFile string
	var inFile string
	var err error

	entries, err1 := os.ReadDir(inImages)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		if fileName.IsDir() {
			inImages := fmt.Sprintf("%simages/%s/", CFG.SrcPath, fileName.Name())
			outImages := fmt.Sprintf("%simages/%s/", CFG.ContentPath, fileName.Name())

			htCreateDirectory(outImages)

			htCopyImagesSpecificDir(outImages, inImages)
		} else {
			outFile = fmt.Sprintf("%s%s", outImages, fileName.Name())
			inFile = fmt.Sprintf("%s%s", inImages, fileName.Name())
			err = HTCopyFilesWithoutChanges(outFile, inFile)
			if err != nil {
				panic(err)
			}
		}
	}
}

func htCopyImages() {
	outImages := fmt.Sprintf("%simages/", CFG.ContentPath)
	inImages := fmt.Sprintf("%simages/", CFG.SrcPath)

	htCopyImagesSpecificDir(outImages, inImages)
}

// MAIN FUNCTION

func HTMinifyAllFiles() {
	// Remove Previous Content
	htMinifyRemoveOldContent()

	// Create directories
	htMinifyCreateDirectories()

	// Rewrite Sources
	htRewriteSources()

	htMinifyJS()

	htUpdateHTJS()

	htMinifyJSON()

	htCopyJSONWithoutChanges()

	htMinifyCSS()

	htUpdateHTCSS()

	if rewriteHTML {
		htUpdateIndex()
	}

	htMinifyHTML()

	htCopyWebFonts()
	htCopyCSV()
	htCopyGEDCOM()
	htCopyImages()
	if verboseFlag {
		fmt.Println("Completed successfully!")
	}
}
