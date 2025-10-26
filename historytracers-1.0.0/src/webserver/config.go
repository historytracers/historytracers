// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"flag"
	"fmt"
	"github.com/BurntSushi/toml"
	"log"
	"os"
)

type htConfig struct {
	DevMode     bool
	Port        int
	SrcPath     string
	ContentPath string
	LogPath     string
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
	confPath            string = "/etc/historytracers/"
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
	flag.StringVar(&confPath, "conf", confPath, "Path to the configuration direction.")
	flag.StringVar(&classTemplate, "class", classTemplate, "Create a foundation for a new class (history, indigenous_who, first_steps, literature, biology, chemistry, physics, historical_events).")

	flag.Parse()
}

func NewHTConfig() *htConfig {
	return &htConfig{DevMode: devFlag, Port: portFlag, SrcPath: srcPath, ContentPath: contentPath}
}

func htUpdateConfig(cfg *htConfig) {
	if cfg.DevMode != devFlag {
		CFG.DevMode = cfg.DevMode
	}

	if cfg.Port != portFlag {
		CFG.Port = cfg.Port
	}

	if cfg.SrcPath != srcPath {
		CFG.SrcPath = cfg.SrcPath
	}

	if cfg.LogPath != logPath {
		CFG.LogPath = cfg.LogPath
	}

	if cfg.ContentPath != contentPath {
		CFG.ContentPath = cfg.ContentPath
	}
}

func htPrintOptions() {
	fmt.Println("History Tracers was compiled with the following options:\n\nConfig Dir:", confPath, "\nSource Path:", CFG.SrcPath, "\nContent Path:", CFG.ContentPath, "\nLog Path:", CFG.LogPath, "\n\n")
}

func HTLoadConfig() {
	fileName := fmt.Sprintf("%s/historytracers.conf", confPath)
	_, err := os.Stat(fileName)
	if err != nil {
		return
	}

	var cfg htConfig

	if _, err := toml.DecodeFile(fileName, &cfg); err != nil {
		log.Fatalf("Error: %s", err)
		return
	}

	htUpdateConfig(&cfg)
}
