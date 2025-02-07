// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"fmt"
	"io"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/css"
	"github.com/tdewolff/minify/v2/html"
	"github.com/tdewolff/minify/v2/js"
	"github.com/tdewolff/minify/v2/json"
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

var htDirectories [13]string
var htFiles [HTLastFile]string

var readmePattern = regexp.MustCompile("^README")
var htPattern = regexp.MustCompile("^ht_")
var faPattern = regexp.MustCompile("^fa_")
var chartPattern = regexp.MustCompile("^chart_")
var jqueryPattern = regexp.MustCompile("^jquery-")
var showdownPattern = regexp.MustCompile("^showdown.")

func htMinifyFillVectors() {
	htDirectories = [13]string{"bodies", "css", "images", "js", "lang", "lang/sources", "lang/en-US", "lang/en-US/smGame", "lang/es-ES", "lang/es-ES/smGame", "lang/pt-BR", "lang/pt-BR/smGame", "webfonts"}
	htFiles = [HTLastFile]string{"ht_common.css", "ht_math.css", "ht_common.js", "ht_math.js", "ht_chart.js"}
}

func htMinifyCreateDirectories() {
	htCreateDirectory(CFG.ContentPath)
	var localPath string

	for i := 0; i < len(htDirectories); i++ {
		localPath = fmt.Sprintf("%s%s", CFG.ContentPath, htDirectories[i])
		fmt.Println("Creating directory", localPath)
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

func HTCopyFilesWithoutChanges(dstFile string, srcFile string) error {
	srcStat, err := os.Stat(srcFile)
	if err != nil {
		return err
	}

	if !srcStat.Mode().IsRegular() {
		return nil
	}

	sfp, err := os.Open(srcFile)
	if err != nil {
		return err
	}
	defer sfp.Close()

	dfp, err := os.Create(dstFile)
	if err != nil {
		return err
	}
	defer dfp.Close()
	bytes, err := io.Copy(dfp, sfp)
	if bytes == 0 || err != nil {
		return err
	}
	fmt.Println("Copying file", srcFile)
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
		fmt.Println("ERROR", err)
		return err
	}

	inBodies := fmt.Sprintf("%scss/", CFG.SrcPath)
	outBodies := fmt.Sprintf("%scss/", CFG.ContentPath)

	tmpFile := fmt.Sprintf("%stmp", srcBodies)
	for _, fileName := range entries {
		inFile = fmt.Sprintf("%s%s", srcBodies, fileName.Name())

		htMinifyCSSFile(m, inFile, tmpFile)

		outFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		finalFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())

		HTCopyFilesWithoutChanges(finalFile, tmpFile)
		HTCopyFilesWithoutChanges(outFile, finalFile)
	}

	err = os.Remove(tmpFile)
	if err != nil {
		fmt.Println("ERROR", err)
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
	fmt.Println("Minifying CSS", inFile)
	return htMinifyCommonFile(m, "text/css", inFile, outFile)
}

func htMinifyCSS() error {
	var outFile string
	var inFile string

	m := minify.New()
	m.AddFunc("text/css", css.Minify)

	// Copy only Font Awesome
	outBodies := fmt.Sprintf("%scss/", CFG.ContentPath)
	inBodies := fmt.Sprintf("%scss/", CFG.SrcPath)
	entries, err := os.ReadDir(inBodies)
	if err != nil {
		return err
	}

	for _, fileName := range entries {
		if htParseCSS(fileName.Name()) == false {
			continue
		}

		outFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		HTCopyFilesWithoutChanges(outFile, inFile)
	}

	return nil
}

// JSON
func htParseJSON(fileName string) bool {
	switch fileName {
	case "smGame":
		return false
	default:
		return true
	}
	return true
}

func htMinifyJSONFile(m *minify.M, inFile string, outFile string) error {
	fmt.Println("Minifying JSON", inFile)
	return htMinifyCommonFile(m, "application/json", inFile, outFile)
}

func htMinifyJSON() error {
	var outFile string
	var inFile string
	var err error

	m := minify.New()
	m.AddFunc("application/json", json.Minify)

	for i := 5; i < 12; i++ {
		outBodies := fmt.Sprintf("%s%s/", CFG.ContentPath, htDirectories[i])
		inBodies := fmt.Sprintf("%s%s/", CFG.SrcPath, htDirectories[i])
		entries, err1 := os.ReadDir(inBodies)
		if err1 != nil {
			return err1
		}

		for _, fileName := range entries {
			if htParseJSON(fileName.Name()) == false {
				continue
			}

			outFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())
			inFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
			err = htMinifyJSONFile(m, inFile, outFile)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

// JS
func htMinifyJSFile(m *minify.M, inFile string, outFile string) error {
	fmt.Println("Minifying JS", inFile)
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

func htMinifyJS() error {
	var outFile string
	var inFile string

	m := minify.New()
	var err error
	m.AddFunc("application/javascript", js.Minify)

	outBodies := fmt.Sprintf("%sjs/", CFG.ContentPath)
	inBodies := fmt.Sprintf("%sjs/", CFG.SrcPath)
	entries, err1 := os.ReadDir(inBodies)
	if err1 != nil {
		return err1
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		if htParseJS(fileName.Name(), outFile, inFile) == false {
			continue
		}

		err = htMinifyJSFile(m, inFile, outFile)
		if err != nil {
			return err
		}
	}

	return nil
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
	fmt.Println("Minifying HTML", inFile)
	return htMinifyCommonFile(m, "text/html", inFile, outFile)
}

func htMinifyHTML() error {
	var outFile string
	var inFile string

	outFile = fmt.Sprintf("%sindex.html", CFG.ContentPath)
	inFile = fmt.Sprintf("%sindex.html", CFG.SrcPath)

	m := minify.New()
	var err error
	m.AddFunc("text/html", html.Minify)

	err0 := htMinifyHTMLFile(m, inFile, outFile)
	if err0 != nil {
		return err0
	}

	outBodies := fmt.Sprintf("%sbodies/", CFG.ContentPath)
	inBodies := fmt.Sprintf("%sbodies/", CFG.SrcPath)
	entries, err1 := os.ReadDir(inBodies)
	if err1 != nil {
		return err1
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		err = htMinifyHTMLFile(m, inFile, outFile)
		if err != nil {
			return err
		}
	}

	return nil
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

func htCopyImagesSpecificDir(outImages string, inImages string) {
	var outFile string
	var inFile string
	var err error

	entries, err1 := os.ReadDir(inImages)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outImages, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inImages, fileName.Name())
		err = HTCopyFilesWithoutChanges(outFile, inFile)
		if err != nil {
			panic(err)
		}
	}
}

func htCopyImages() {
	var outImages string
	var inImages string

	htImgDirs := []string{"ANTT", "Athens", "Ashmolean", "BibliotecaNacionalDigital", "BritshMuseum", "CreativeCommons", "HistoryTracers", "UNESCO", "USGS", "mapswire"}

	outImages = fmt.Sprintf("%simages/", CFG.ContentPath)
	inImages = fmt.Sprintf("%simages/", CFG.SrcPath)

	htCopyImagesSpecificDir(outImages, inImages)

	for i := 0; i < len(htImgDirs); i++ {
		outImages = fmt.Sprintf("%simages/%s/", CFG.ContentPath, htImgDirs[i])
		inImages = fmt.Sprintf("%simages/%s/", CFG.SrcPath, htImgDirs[i])

		htCreateDirectory(outImages)

		htCopyImagesSpecificDir(outImages, inImages)
	}
}

// MAIN FUNCTION

func HTMinifyAllFiles() {
	// Remove Previous Content
	htMinifyRemoveOldContent()

	// Create directories
	htMinifyFillVectors()
	htMinifyCreateDirectories()

	var err error
	err = htMinifyJS()
	if err != nil {
		panic(err)
	}

	err = htMinifyJSON()
	if err != nil {
		panic(err)
	}

	err = htMinifyCSS()
	if err != nil {
		panic(err)
	}

	htUpdateHTCSS()

	htUpdateIndex()
	err = htMinifyHTML()
	if err != nil {
		panic(err)
	}

	htCopyWebFonts()
	htCopyImages()
	fmt.Println("Completed successfully!")
}
