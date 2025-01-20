// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
)

type htConfig struct {
	DevMode     bool   `json:"devmode"`
	Port        int    `json:"port"`
	srcPath     string `json:"src"`
	contentPath string `json:"content"`
	logPath     string `json:"log"`
}

var (
	devFlag     bool   = false
	minifyFlag  bool   = false
	portFlag    int    = 12345
	confPath    string = "/etc/historytracers/"
	srcPath     string = "/var/www/historytracers/"
	logPath     string = "/var/log/historytracers/"
	contentPath string = "/var/www/historytracers/www/"
	CFG         *htConfig
)

func HTParseArg() {
	CFG = NewHTConfig()

	flag.BoolVar(&CFG.DevMode, "devmode", devFlag, "Is the software running in development mode? (default: false)")
	flag.BoolVar(&minifyFlag, "minify", minifyFlag, "Do not start the server, instead, minify all files. (default: false)")
	flag.IntVar(&CFG.Port, "port", portFlag, "The port History Tracers listens on.")

	flag.StringVar(&CFG.srcPath, "src", srcPath, "Directory containing all source files")
	flag.StringVar(&CFG.logPath, "log", logPath, "Directory containing all log files")
	flag.StringVar(&CFG.contentPath, "www", contentPath, "Directory for user-facing content")
	flag.StringVar(&confPath, "conf", confPath, "Path to the configuration file.")

	flag.Parse()
}

func NewHTConfig() *htConfig {
	return &htConfig{DevMode: devFlag, Port: portFlag, srcPath: srcPath, contentPath: contentPath}
}

func htUpdateConfig(cfg *htConfig) {
	if CFG.DevMode == devFlag {
		CFG.DevMode = cfg.DevMode
	}

	if CFG.Port == portFlag {
		CFG.Port = cfg.Port
	}

	if CFG.srcPath == srcPath {
		CFG.srcPath = cfg.srcPath
	}

	if CFG.logPath == logPath {
		CFG.logPath = cfg.logPath
	}

	if CFG.contentPath == contentPath {
		CFG.contentPath = cfg.contentPath
	}
}

func HTLoadConfig() {
	fileName := fmt.Sprintf("%s/historytracers.conf", confPath)
	jsonFile, err := os.Open(fileName)
	if err != nil {
		return
	}
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	cfg := NewHTConfig()

	json.Unmarshal(byteValue, cfg)
	htUpdateConfig(cfg)
}
