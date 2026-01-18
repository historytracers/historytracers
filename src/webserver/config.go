// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"flag"
	"fmt"
	"github.com/BurntSushi/toml"
	"github.com/historytracers/common"
	"log"
	"os"
	"strings"
)

type htConfig struct {
	DevMode bool
	common.HTConfigBase
}

var (
	updateDateFlag      bool
	devFlag             bool
	MinifyFlag          bool
	GedcomFlag          bool
	verboseFlag         bool
	ValidateFlag        bool
	AudioFlag           bool
	FamilyFlag          bool
	ShowCompilationFlag bool
	internalFlag        bool
	portFlag            int
	portVal             int
	confPath            string
	srcPath             string
	logPath             string
	contentPath         string
	srcVal              string
	logVal              string
	contentVal          string
	classTemplate       string
	devModeVal          bool
	compileConfPath     string
	compileSrcPath      string
	compileContentPath  string
	compileLogPath      string
	compilePort         int
	CFG                 *htConfig
)

func HTParseArg() {
	flag.BoolVar(&devModeVal, "devmode", false, "Is the software running in development mode? (default: false)")
	flag.BoolVar(&updateDateFlag, "timestamp", false, "Update the timestamp fields in all files. (default: false)")
	flag.BoolVar(&MinifyFlag, "minify", false, "Do not start the server, instead, minify all files. (default: false)")
	flag.BoolVar(&GedcomFlag, "gedcom", false, "Do not start the server, instead, generate all gedcom files. (default: false)")
	flag.BoolVar(&ValidateFlag, "validate", false, "Do not start the server, instead, validate JSON files. (default: false)")
	flag.BoolVar(&verboseFlag, "verbose", false, "Hide information messages during file processing. (default: false)")
	flag.BoolVar(&AudioFlag, "audiofiles", false, "Converting JSON to TXT for Piper Input. (default: false)")
	flag.BoolVar(&FamilyFlag, "family", false, "Create a foundation for a new family. (default: false)")
	flag.BoolVar(&ShowCompilationFlag, "compilation", false, "Show options software was compiled. (default: false)")
	flag.BoolVar(&internalFlag, "internal", false, "Run using only compiled options, ignore external config file. (default: false)")
	flag.IntVar(&portVal, "port", compilePort, "The port History Tracers listens on.")

	flag.StringVar(&srcVal, "src", compileSrcPath, "Directory containing all source files.")
	flag.StringVar(&logVal, "log", compileLogPath, "Directory containing all log files.")
	flag.StringVar(&contentVal, "www", compileContentPath, "Directory for user-facing content.")
	flag.StringVar(&confPath, "conf", compileConfPath, "Path to the configuration file.")
	flag.StringVar(&classTemplate, "class", classTemplate, "Create a foundation for a new class (history, indigenous_who, first_steps, first_steps_volume2, literature, biology, chemistry, physics, historical_events).")

	flag.Parse()

	CFG = htCreateConfig()
}

func htCreateConfig() *htConfig {
	if internalFlag {
		return &htConfig{
			DevMode:      devFlag,
			HTConfigBase: *common.NewHTConfigBase(compilePort, compileSrcPath, compileContentPath, compileLogPath),
		}
	}
	return &htConfig{
		DevMode:      devModeVal,
		HTConfigBase: *common.NewHTConfigBase(portVal, srcVal, contentVal, logVal),
	}
}

func init() {
	if len(confPath) == 0 {
		confPath = "/etc/historytracers/historytracers.conf"
	}
	if len(srcPath) == 0 {
		srcPath = "/var/www/htdocs/historytracers/"
	}
	if len(contentPath) == 0 {
		contentPath = "/var/www/htdocs/historytracers/www/"
	}
	if len(logPath) == 0 {
		logPath = "/var/log/historytracers/"
	}
	if portFlag == 0 {
		portFlag = 12345
	}

	compileConfPath = confPath
	compileSrcPath = srcPath
	compileContentPath = contentPath
	compileLogPath = logPath
	compilePort = portFlag
}

func htPrintOptions() {
	fmt.Println("History Tracers was compiled with the following options:\n\nConfig Dir:", strings.TrimSpace(compileConfPath), "\nSource Path:", strings.TrimSpace(compileSrcPath), "\nContent Path:", strings.TrimSpace(compileContentPath), "\nLog Path:", strings.TrimSpace(compileLogPath), "\nPort:", compilePort, "\n\n")
}

func HTLoadConfig() {
	if internalFlag {
		if verboseFlag {
			fmt.Println("Running in internal mode, using compiled options only.")
		}
		return
	}

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
