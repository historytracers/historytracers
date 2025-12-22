// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	// "encoding/json"

	"errors"
	"flag"
	"os"
	"path/filepath"
)

const (
	SoftwareName = "historytracers-editor"
)

type htConfig struct {
	Port        int    `json:"port"`
	SrcPath     string `json:"src"`
	ContentPath string `json:"content"`
	ConfPath    string `json:"content"`
	LogPath     string `json:"log"`
	confPath    string `json:"config"`
}

var (
	portFlag     int    = 12345
	confPath     string = "/etc/historytracers/historytracers.conf"
	personalPath string = "~/.config/historytracers/historytracers.conf"
	srcPath      string = "/var/www/historytracers/"
	contentPath  string = "/var/www/historytracers/www/"
	logPath      string = "/var/log/historytracers/"
	CFG          *htConfig
)

func HTParseArg() {
	CFG = NewHTConfig()

	flag.IntVar(&CFG.Port, "port", portFlag, "The port History Tracers listens on.")
	flag.StringVar(&CFG.SrcPath, "src", srcPath, "Directory containing all source files.")
	flag.StringVar(&CFG.LogPath, "log", logPath, "Directory containing all log files.")
	flag.StringVar(&CFG.ContentPath, "www", contentPath, "Directory for user-facing content.")
	flag.StringVar(&CFG.ConfPath, "conf", confPath, "Directory for user personal options.")
}

func NewHTConfig() *htConfig {
	return &htConfig{Port: portFlag, SrcPath: srcPath, ContentPath: contentPath, LogPath: logPath}
}

func HTCreateDir() error {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return err
	}

	dirPath := filepath.Join(configDir, ".config/"+SoftwareName)
	_, err = os.Stat(dirPath)
	if errors.Is(err, os.ErrNotExist) {
		err := os.MkdirAll(dirPath, 0755)
		if err != nil {
			return err
		}
	}

	return nil
}
