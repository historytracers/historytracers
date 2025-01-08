// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"time"
)

type HTServer struct {
	hServer *http.Server
}

func HTNewServer(cfg *htConfig, logger *log.Logger) *HTServer {
	useAddr := ":" + strconv.Itoa(cfg.Port)

	nextRequestID := func() string {
		return strconv.FormatInt(time.Now().UnixNano(), 10)
	}

	server := &http.Server{
		Addr:         useAddr,
		Handler:      htTracing(nextRequestID)(htLogging(logger)(http.DefaultServeMux)),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  15 * time.Second,
	}

	return &HTServer{hServer: server}
}

// Normal URL when we are not developing
var validURL = regexp.MustCompile("^/|^/bodies/*$|^/css/*$|^/images/*$|^/js/*.js$|^/lang*$|^/webfonts/*$|^/*.html$|")

func htCommonHandler(w http.ResponseWriter, r *http.Request) {
	htOUT := log.New(os.Stdout, "HT HTTP (INFO): ", log.LstdFlags)
	htERR := log.New(os.Stderr, "HT HTTP (ERROR): ", log.LstdFlags)
	m := validURL.FindStringSubmatch(r.URL.Path)
	if m == nil {
		http.NotFound(w, r)
		htERR.Printf("Blocked request: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
		return
	}
	htOUT.Printf("Received request: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
	http.ServeFile(w, r, r.URL.Path[1:])
}
