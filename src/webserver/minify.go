// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"fmt"
	"os"
	"regexp"

	"github.com/tdewolff/minify/v2"
	//"github.com/tdewolff/minify/v2/css"
	"github.com/tdewolff/minify/v2/html"
	"github.com/tdewolff/minify/v2/js"
	"github.com/tdewolff/minify/v2/json"
	//"github.com/tdewolff/minify/v2/svg"
	// "github.com/tdewolff/minify/v2/xml"
)

// COMMON
var htDirectories [13]string

var readmePattern = regexp.MustCompile("^README")
var htPattern = regexp.MustCompile("^ht_")
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

// MAIN FUNCTIONS

func HTMinifyAllFiles() {
	// Remove Previous Content
	htMinifyRemoveOldContent()

	// Create directories
	htMififyFillDirectories()
	htMinifyCreateDirectories()

	// Conver JS files
	var err error
	err = htMinifyJS()
	if err != nil {
		panic(err)
	}

	// Conver JSON files
	err = htMinifyJSON()
	if err != nil {
		panic(err)
	}

	// Convert HTML files
	err = htMinifyHTML()
	if err != nil {
		panic(err)
	}
}
