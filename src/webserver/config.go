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
	devFlag       bool   = false
	minifyFlag    bool   = false
	gedcomFlag    bool   = false
	verboseFlag   bool   = false
	validateFlag  bool   = false
	audioFlag     bool   = false
	portFlag      int    = 12345
	confPath      string = "/etc/historytracers/"
	srcPath       string = "/var/www/historytracers/"
	logPath       string = "/var/log/historytracers/"
	contentPath   string = "/var/www/historytracers/www/"
	classTemplate string = ""
	CFG           *htConfig
)

func HTParseArg() {
	CFG = NewHTConfig()

	flag.BoolVar(&CFG.DevMode, "devmode", devFlag, "Is the software running in development mode? (default: false)")
	flag.BoolVar(&minifyFlag, "minify", minifyFlag, "Do not start the server, instead, minify all files. (default: false)")
	flag.BoolVar(&gedcomFlag, "gedcom", gedcomFlag, "Do not start the server, instead, generate all gedcom files. (default: false)")
	flag.BoolVar(&validateFlag, "validate", gedcomFlag, "Do not start the server, instead, validate JSON files. (default: false)")
	flag.BoolVar(&verboseFlag, "verbose", verboseFlag, "Hide information messages during file processing. (default: false)")
	flag.BoolVar(&audioFlag, "audio", audioFlag, "Converting JSON to TXT for Piper Input. (default: false)")
	flag.IntVar(&CFG.Port, "port", portFlag, "The port History Tracers listens on.")

	flag.StringVar(&CFG.SrcPath, "src", srcPath, "Directory containing all source files.")
	flag.StringVar(&CFG.LogPath, "log", logPath, "Directory containing all log files.")
	flag.StringVar(&CFG.ContentPath, "www", contentPath, "Directory for user-facing content.")
	flag.StringVar(&confPath, "conf", confPath, "Path to the configuration file.")
	flag.StringVar(&classTemplate, "class", classTemplate, "Create a foundation for a new class (history, indigenous_who, first_steps, or literature).")

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
	if CFG.DevMode == false {
		return
	}

	if verboseFlag {
		fmt.Println("Config Dir:", confPath, "Dev Mode:", CFG.DevMode, "Port:", CFG.Port, "Source Path:", CFG.SrcPath, "Content Path:", CFG.ContentPath, "Log Path:", CFG.LogPath)
	}
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
	htPrintOptions()
}
