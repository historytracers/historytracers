// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"io/ioutil"
	"os"
)

type htConfig struct {
	DevMode bool   `json:"devmode"`
	Port    int    `json:"port"`
	Path    string `json:"port"`
}

func NewHTConfig() *htConfig {
	return &htConfig{DevMode: false, Port: 12345, Path: "./"}
}

func HTLoadCondig() *htConfig {
	jsonFile, err := os.Open(".options.json")
	if err != nil {
		ret := NewHTConfig()
		return ret
	}
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	cfg := NewHTConfig()

	json.Unmarshal(byteValue, cfg)

	return cfg
}
