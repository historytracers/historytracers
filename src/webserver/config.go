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
	updateDateFlag      bool   = false
	devFlag             bool   = false
	MinifyFlag          bool   = false
	GedcomFlag          bool   = false
	verboseFlag         bool   = false
	ValidateFlag        bool   = false
	AudioFlag           bool   = false
	FamilyFlag          bool   = false
	ShowCompilationFlag bool   = false
	portFlag            int    = 12345
	confPath            string = "/etc/historytracers/historytracers.conf"
	srcPath             string = "/var/www/historytracers/"
	logPath             string = "/var/log/historytracers/"
	contentPath         string = "/var/www/historytracers/www/"
	classTemplate       string = ""
	CFG                 *htConfig
)

func HTParseArg() {
	CFG = NewHTConfig()

	flag.BoolVar(&CFG.DevMode, "devmode", false, "Is the software running in development mode? (default: false)")
	flag.BoolVar(&updateDateFlag, "timestamp", false, "Update the timestamp fields in all files. (default: false)")
	flag.BoolVar(&MinifyFlag, "minify", false, "Do not start the server, instead, minify all files. (default: false)")
	flag.BoolVar(&GedcomFlag, "gedcom", false, "Do not start the server, instead, generate all gedcom files. (default: false)")
	flag.BoolVar(&ValidateFlag, "validate", false, "Do not start the server, instead, validate JSON files. (default: false)")
	flag.BoolVar(&verboseFlag, "verbose", false, "Hide information messages during file processing. (default: false)")
	flag.BoolVar(&AudioFlag, "audiofiles", false, "Converting JSON to TXT for Piper Input. (default: false)")
	flag.BoolVar(&FamilyFlag, "family", false, "Create a foundation for a new family. (default: false)")
	flag.BoolVar(&ShowCompilationFlag, "compilation", false, "Show options software was compiled. (default: false)")
	flag.IntVar(&CFG.Port, "port", portFlag, "The port History Tracers listens on.")

	flag.StringVar(&CFG.SrcPath, "src", srcPath, "Directory containing all source files.")
	flag.StringVar(&CFG.LogPath, "log", logPath, "Directory containing all log files.")
	flag.StringVar(&CFG.ContentPath, "www", contentPath, "Directory for user-facing content.")
	flag.StringVar(&confPath, "conf", confPath, "Path to the configuration file.")
	flag.StringVar(&classTemplate, "class", classTemplate, "Create a foundation for a new class (history, indigenous_who, first_steps, first_steps_volume2, literature, biology, chemistry, physics, historical_events).")

	flag.Parse()
}

func NewHTConfig() *htConfig {
	return &htConfig{
		DevMode:      devFlag,
		HTConfigBase: *common.NewHTConfigBase(portFlag, srcPath, contentPath, logPath),
	}
}

func htPrintOptions() {
	fmt.Println("History Tracers was compiled with the following options:\n\nConfig Dir:", strings.TrimSpace(confPath), "\nSource Path:", strings.TrimSpace(CFG.SrcPath), "\nContent Path:", strings.TrimSpace(CFG.ContentPath), "\nLog Path:", strings.TrimSpace(CFG.LogPath), "\n\n")
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
