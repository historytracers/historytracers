// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"

	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/historytracers/common"
)

const (
	SoftwareName    = "historytracers-editor"
	LocalConfigFile = "historytracers.conf"
)

type htConfig struct {
	common.HTConfigBase
	ConfPath string `json:"config"`
}

var (
	portFlag     int       = 12345
	confPath     string    = "/etc/historytracers/historytracers.conf"
	personalPath string    = "~/.config/historytracers/historytracers.conf"
	srcPath      string    = "/var/www/historytracers/"
	contentPath  string    = "/var/www/historytracers/www/"
	logPath      string    = "/var/log/historytracers/"
	CFG          *htConfig = nil
)

func NewHTConfig() *htConfig {
	return &htConfig{
		HTConfigBase: *common.NewHTConfigBase(portFlag, srcPath, contentPath, logPath),
		ConfPath:     personalPath,
	}
}

func HTCreateDir() error {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return err
	}

	dirPath := filepath.Join(configDir, SoftwareName)
	_, err = os.Stat(dirPath)
	if errors.Is(err, os.ErrNotExist) {
		err := os.MkdirAll(dirPath, 0755)
		if err != nil {
			return err
		}
	}

	return nil
}

func HTCreateConfig(configPath string) error {
	if CFG == nil {
		CFG = NewHTConfig()
	}

	data, err := json.MarshalIndent(CFG, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %s", err)
	}

	if err := os.WriteFile(configPath, data, 0640); err != nil {
		return fmt.Errorf("failed to write config file: %s", err)
	}

	return nil
}

func HTParseConfig(configPath string) error {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return fmt.Errorf("failed to read config file: %s", err)
	}

	if err := json.Unmarshal(data, CFG); err != nil {
		return fmt.Errorf("failed to parse JSON: %s", err)
	}
	return nil
}

func HTParseCreateConfig() error {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return err
	}

	localPath := filepath.Join(configDir, SoftwareName+"/"+LocalConfigFile)
	_, err = os.Stat(localPath)
	if errors.Is(err, os.ErrNotExist) {
		return HTCreateConfig(localPath)
	}

	return HTParseConfig(localPath)
}
