// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
)

type htConfig struct {
	DevMode bool   `json:"devmode"`
	Port    int    `json:"port"`
	Path    string `json:"port"`
}

func NewHTConfig() *htConfig {
	return &htConfig{DevMode: false, Port: 12345, Path: "/"}
}

func HTLoadCondig() *htConfig {
	jsonFile, err := os.Open("users.json")
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

// Normal URL when we are not developing
var validURL = regexp.MustCompile("^*$")

func main() {
	cfg := HTLoadCondig()
	devM := "with"
	if cfg.DevMode == false {
		devM += "out"
	}
	fmt.Println("Listening Port", cfg.Port, devM, "devmode", "content", cfg.Path)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		m := validURL.FindStringSubmatch(r.URL.Path)
		if m == nil {
			http.NotFound(w, r)
			return
		}
		http.ServeFile(w, r, r.URL.Path[1:])
	})

	usePort := ":" + strconv.Itoa(cfg.Port)
	log.Fatal(http.ListenAndServe(usePort, nil))
}
