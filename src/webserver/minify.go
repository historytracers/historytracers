// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"fmt"
	"io"
	"os"
	"regexp"

	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/css"
	"github.com/tdewolff/minify/v2/html"
	"github.com/tdewolff/minify/v2/js"
	"github.com/tdewolff/minify/v2/json"
)

// COMMON
var htDirectories [13]string
var HTCSS [2]string

const (
	HTCSSCommon = iota
	HTCSSMath
)

var readmePattern = regexp.MustCompile("^README")
var htPattern = regexp.MustCompile("^ht_")
var faPattern = regexp.MustCompile("^fa_")
var chartPattern = regexp.MustCompile("^chart_")
var jqueryPattern = regexp.MustCompile("^jquery-")
var showdownPattern = regexp.MustCompile("^showdown.")

func htMififyFillDirectories() {
	htDirectories = [13]string{"bodies", "css", "images", "js", "lang", "lang/sources", "lang/en-US", "lang/en-US/smGame", "lang/es-ES", "lang/es-ES/smGame", "lang/pt-BR", "lang/pt-BR/smGame", "webfonts"}
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
		return err
	}

	inBodies := fmt.Sprintf("%scss/", CFG.SrcPath)
	outBodies := fmt.Sprintf("%scss/", CFG.ContentPath)

	tmpFile := fmt.Sprintf("%stmp", srcBodies)
	for _, fileName := range entries {
		inFile = fmt.Sprintf("%s%s", srcBodies, fileName.Name())

		htMinifyCSSFile(m, inFile, tmpFile)

		if fileName.Name() == "ht_math.css" {
			outFile = fmt.Sprintf("%s%s", inBodies, HTCSS[HTCSSMath])
			finalFile = fmt.Sprintf("%s%s", outBodies, HTCSS[HTCSSMath])
		} else {
			outFile = fmt.Sprintf("%s%s", inBodies, HTCSS[HTCSSCommon])
			finalFile = fmt.Sprintf("%s%s", outBodies, HTCSS[HTCSSCommon])
		}

		test, err := HTAreFilesEqual(tmpFile, outFile)
		if err != nil {
			return err
		}
		if test == false {
			fmt.Println(test, tmpFile, outFile, finalFile)
			HTCopyFilesWithoutChanges(finalFile, tmpFile)
		}

		HTCopyFilesWithoutChanges(outFile, finalFile)
	}

	err = os.Remove(tmpFile)
	if err != nil {
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
			test := fileName.Name()
			ht := test[:3]
			if ht == "ht_" {
				math := test[:7]
				fmt.Println("MATH", math)
				if math == "ht_math" {
					HTCSS[HTCSSMath] = fileName.Name()
				} else {
					HTCSS[HTCSSCommon] = fileName.Name()
				}
			}
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
				htMinifyInternalJS(fileName.Name())
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

func htParseJS(fileName string) bool {
	if readmePattern.MatchString(fileName) ||
		htPattern.MatchString(fileName) ||
		chartPattern.MatchString(fileName) ||
		jqueryPattern.MatchString(fileName) ||
		showdownPattern.MatchString(fileName) {
		return false
	}

	switch fileName {
	case "astro.js":
	case "calendar.js":
		return false
	default:
		return true
	}
	return true
}

func htMinifyInternalJS(fileName string) error {
	// TODO: Add a function to only copy files
	//	 Add checksum to verify necessity to change the file
	//       Modiy index.html
	if htPattern.MatchString(fileName) == false {
		return nil
	}

	return nil
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
		if htParseJS(fileName.Name()) == false {
			htMinifyInternalJS(fileName.Name())
			continue
		}

		outFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		err = htMinifyJSFile(m, inFile, outFile)
		if err != nil {
			return err
		}
	}

	return nil
}

// HTML
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

	htImgDirs := []string{"ANTT", "Ashmolean", "BibliotecaNacionalDigital", "BritshMuseum", "CreativeCommons", "HistoryTracers", "UNESCO", "USGS", "mapswire"}

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
	htMififyFillDirectories()
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

	err = htMinifyHTML()
	if err != nil {
		panic(err)
	}

	htCopyWebFonts()
	htCopyImages()
}
