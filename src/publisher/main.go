// SPDX-License-Identifier: GPL-3.0-or-later

// Parts of the code was inspired in the following algorithms:
// (https://github.com/kelcheone/go-blog-code-snippets/blob/main/http-server/main.go
// https://github.com/MuxN4/lumenserver

package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/historytracers/common"
)

var (
	AccessLog *log.Logger
	DaemonLog *log.Logger
)

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

func htOpenLogs(name string) *log.Logger {
	if CFG.LogPath == "" {
		return nil
	}

	htCreateDirectory(CFG.LogPath)

	fileName := filepath.Join(CFG.LogPath, name)
	if _, err := os.Stat(fileName); os.IsNotExist(err) {
		fp, err := os.Create(fileName)
		if err != nil {
			panic(err)
		}
		return log.New(fp, "", log.LstdFlags)
	} else {
		fp, err := os.OpenFile(fileName, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0640)
		if err != nil {
			panic(err)
		}
		return log.New(fp, "", log.LstdFlags)
	}
}

func htLogInfo(logger *log.Logger, args ...interface{}) {
	if logger != nil {
		logger.Println(args...)
	}
}

func htLogFatal(logger *log.Logger, format string, args ...interface{}) {
	if logger != nil {
		logger.Fatalf(format, args...)
	}
	os.Exit(1)
}

func htLogPrintf(logger *log.Logger, format string, args ...interface{}) {
	if logger != nil {
		logger.Printf(format, args...)
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
	DaemonLog = htOpenLogs("daemon.log")
	AccessLog = htOpenLogs("access.log")

	htRunStopFlags()

	fmt.Println("No action specified. Use --help to see available options.")
}
