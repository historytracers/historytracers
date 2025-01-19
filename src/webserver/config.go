// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"os"
)

type htConfig struct {
	DevMode     bool   `json:"devmode"`
	Port        int    `json:"port"`
	srcPath     string `json:"src"`
	contentPath string `json:"content"`
}

var (
	devFlag     bool   = false
	portFlag    int    = 12345
	confPath    string = "/etc/historytracers/"
	srcPath     string = "/var/www/historytracers/"
	contentPath string = "/var/www/historytracers/www/"
	CFG         *htConfig
)

func HTParseArg() {
	CFG = NewHTConfig()

	flag.BoolVar(&CFG.DevMode, "devmode", devFlag, "Is the software running in development mode? Default: false")
	flag.IntVar(&CFG.Port, "port", portFlag, "The port History Tracers listens on. Default: 12345")
	flag.StringVar(&CFG.srcPath, "src", srcPath, "Directory containing all source files. Default: /var/www/historytracers/")
	flag.StringVar(&CFG.contentPath, "www", contentPath, "Directory for user-facing content. Default: /var/www/historytracers/www/")

	flag.StringVar(&confPath, "conf", confPath, "Path to the configuration file. Default: /etc/historytracers/")

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

	if CFG.contentPath == contentPath {
		CFG.contentPath = cfg.contentPath
	}
}

func HTLoadConfig() {
	jsonFile, err := os.Open(".options.json")
	if err != nil {
		return
	}
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	cfg := NewHTConfig()

	json.Unmarshal(byteValue, cfg)
	htUpdateConfig(cfg)
}
