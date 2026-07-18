// SPDX-License-Identifier: GPL-3.0-or-later

// Parts of the code was inspired in the following algorithms:
// (https://github.com/kelcheone/go-blog-code-snippets/blob/main/http-server/main.go
// https://github.com/MuxN4/lumenserver

package main

import (
	"fmt"
	"os"

	"github.com/historytracers/common"
)

var ()

func htCreateDirectory(name string) {
	if stat, err := os.Stat(name); err != nil {
		e := os.Mkdir(name, 0755)
		if e != nil {
			panic(e)
		}
	} else if stat.IsDir() == false {
		panic("This is not a directory")
	}
}

func htRunStopFlags() {
	htFillModifiedGit()

	var stopRun bool = false
	if ShowCompilationFlag {
		htPrintOptions()
		os.Exit(0)
	}

	if ValidateFlag {
		fmt.Println("TODO: Validate is creating empty files, it is necessary to fix it.")
		stopRun = true
	}

	if GedcomFlag {
		htCreateGEDCOM()
		stopRun = true
	}

	if FamilyFlag {
		htNewFamily()
		stopRun = true
	}

	if len(classTemplate) > 0 {
		htCreateNewClass()
		stopRun = true
	}

	if len(smGameTemplate) > 0 {
		htCreateNewSMGame()
		stopRun = true
	}

	if MinifyFlag {
		HTMinifyAllFiles()
		stopRun = true
	}

	if AudioFlag {
		htConvertTextsToAudio()
		stopRun = true
	}

	if len(langTestFlag) > 0 {
		htLangTest(langTestFlag)
		stopRun = true
	}

	if globalLangTestFlag {
		htGlobalLangTest()
		stopRun = true
	}

	if checkSourcesFlag {
		htCheckSources()
		stopRun = true
	}

	if dbFileFlag != "" {
		if _, err := os.Stat(dbFileFlag); err == nil {
			htReadDatabase(dbFileFlag)
		}
	}

	if CreateDBFlag {
		htCreateDatabase(dbFileFlag)
		stopRun = true
	}

	if stopRun {
		os.Exit(0)
	}
}

func htInitializeCommonMaps() {
	sourceMap = make(map[string]common.HTSourceElement)
	allSourceMap = make(map[string]common.HTSourceElement)
}

func main() {
	htInitializeCommonMaps()
	HTParseArg()

	if logFileFlag != "" {
		f, err := os.Create(logFileFlag)
		if err != nil {
			panic(err)
		}
		defer f.Close()
		os.Stdout = f
		os.Stderr = f
	}

	HTLoadConfig()

	// Re-apply explicit --src flag value; the TOML config may have overridden it
	if srcVal != compileSrcPath {
		CFG.SrcPath = srcVal
	}

	htRunStopFlags()

	fmt.Println("No action specified. Use --help to see available options.")
}
