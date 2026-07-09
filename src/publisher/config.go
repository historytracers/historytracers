// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"runtime"
	"strings"

	"github.com/BurntSushi/toml"
	"github.com/historytracers/common"
)

type htConfig struct {
	common.HTConfigBase
}

var (
	updateDateFlag      bool
	MinifyFlag          bool
	GedcomFlag          bool
	verboseFlag         bool
	ValidateFlag        bool
	AudioFlag           bool
	FamilyFlag          bool
	ShowCompilationFlag bool
	globalLangTestFlag  bool
	confPath            string
	srcPath             string
	logPath             string
	contentPath         string
	srcVal              string
	contentVal          string
	logFileFlag         string
	classTemplate       string
	smGameTemplate      string
	langTestFlag        string
	checkSourcesFlag    bool
	CreateDBFlag        bool
	compileConfPath     string
	compileSrcPath      string
	compileContentPath  string
	compileLogPath      string
	CFG                 *htConfig
)

func HTParseArg() {
	flag.BoolVar(&updateDateFlag, "timestamp", false, "Update the timestamp fields in all files. (default: false)")
	flag.BoolVar(&MinifyFlag, "minify", false, "Do not start the server, instead, minify all files. (default: false)")
	flag.BoolVar(&GedcomFlag, "gedcom", false, "Do not start the server, instead, generate all gedcom files. (default: false)")
	flag.BoolVar(&ValidateFlag, "validate", false, "Do not start the server, instead, validate JSON files. (default: false)")
	flag.BoolVar(&verboseFlag, "verbose", false, "Hide information messages during file processing. (default: false)")
	flag.BoolVar(&AudioFlag, "audiofiles", false, "Converting JSON to TXT for Piper Input. (default: false)")
	flag.BoolVar(&FamilyFlag, "family", false, "Create a foundation for a new family. (default: false)")
	flag.BoolVar(&ShowCompilationFlag, "compilation", false, "Show options software was compiled. (default: false)")

	flag.StringVar(&srcVal, "src", compileSrcPath, "Directory containing all source files.")
	flag.StringVar(&contentVal, "www", compileContentPath, "Directory for user-facing content.")
	flag.StringVar(&confPath, "conf", compileConfPath, "Path to the configuration file.")
	flag.StringVar(&logFileFlag, "logfile", "", "Path to log file (truncates on open). All output is redirected here.")
	flag.StringVar(&classTemplate, "class", classTemplate, "Create a foundation for a new class (history, indigenous_who, first_steps, first_steps_volume2, literature, biology, chemistry, physics, historical_events, philosophy).")
	flag.StringVar(&smGameTemplate, "smgame", smGameTemplate, "Create a foundation for a new SM Game.")
	flag.StringVar(&langTestFlag, "langtest", "", "Test a language file: 'lang:uuid' (e.g. en-US:03bb4b8e-...). Validates JSON, counts lines, and compares across languages.")
	flag.BoolVar(&globalLangTestFlag, "globalangtest", false, "Test all UUID files in lang/??-??/. Validates JSON and compares line counts across all languages.")
	flag.BoolVar(&checkSourcesFlag, "checksources", false, "Check and fix date_time.year mismatches in UUID files against published field in lang/sources/.")
	flag.BoolVar(&CreateDBFlag, "createdb", false, "Create a local SQLite database with all sources from lang/sources/. (default: false)")

	flag.Parse()

	CFG = htCreateConfig()
}

func htCreateConfig() *htConfig {
	return &htConfig{
		HTConfigBase: *common.NewHTConfigBase(0, srcVal, contentVal, compileLogPath),
	}
}

func init() {
	if len(confPath) == 0 {
		if runtime.GOOS == "windows" {
			confPath = "C:\\ProgramData\\historytracers\\historytracers.conf"
		} else {
			confPath = "/etc/historytracers/historytracers.conf"
		}
	}
	if len(srcPath) == 0 {
		if runtime.GOOS == "windows" {
			srcPath = "C:\\inetpub\\wwwroot\\historytracers\\"
		} else {
			srcPath = "/var/www/htdocs/historytracers/"
		}
	}
	if len(contentPath) == 0 {
		if runtime.GOOS == "windows" {
			contentPath = "C:\\inetpub\\wwwroot\\historytracers\\www\\"
		} else {
			contentPath = "/var/www/htdocs/historytracers/www/"
		}
	}
	if len(logPath) == 0 {
		logPath = ""
	}

	compileConfPath = confPath
	compileSrcPath = srcPath
	compileContentPath = contentPath
	compileLogPath = logPath
}

func htPrintOptions() {
	fmt.Println("History Tracers was compiled with the following options:\n\nConfig Dir:", strings.TrimSpace(compileConfPath), "\nSource Path:", strings.TrimSpace(compileSrcPath), "\nContent Path:", strings.TrimSpace(compileContentPath), "\nLog Path:", strings.TrimSpace(compileLogPath))
}

func HTLoadConfig() {
	_, err := os.Stat(confPath)
	if err != nil {
		fmt.Println("Config not found. Runnin with default options.")
		return
	}

	if _, err := toml.DecodeFile(confPath, CFG); err != nil {
		log.Fatalf("Error: %s", err)
		return
	}
}
