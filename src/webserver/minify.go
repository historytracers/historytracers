// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"fmt"
	"os"

	"github.com/tdewolff/minify/v2"
	//"github.com/tdewolff/minify/v2/css"
	"github.com/tdewolff/minify/v2/html"
	//"github.com/tdewolff/minify/v2/js"
	//"github.com/tdewolff/minify/v2/json"
	//"github.com/tdewolff/minify/v2/svg"
	// "github.com/tdewolff/minify/v2/xml"
)

func htMinifyHTML() error {
	outFile := fmt.Sprintf("%s/index.html", CFG.contentPath)
	inFile := fmt.Sprintf("%s/index.html", CFG.srcPath)

	m := minify.New()
	m.AddFunc("text/html", html.Minify)

	r, err1 := os.Open(inFile)
	if err1 != nil {
		return err1
	}

	w, err2 := os.Create(outFile)
	if err2 != nil {
		return err2
	}

	if err3 := m.Minify("text/html", w, r); err3 != nil {
		return err3
	}

	err4 := w.Close()
	if err4 != nil {
		return err4
	}

	return nil
}

func HTMinifyAllFiles() {
	htCreateDirectories(CFG.contentPath)

	html := htMinifyHTML()
	if html != nil {
		panic(html)
	}
}
