// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

type HTServer struct {
	hServer *http.Server
}

var ErrorLog *log.Logger = nil

// TODO: CHANGE FROM CURRENT bool TO STRING MAPPING REQUEST TO UUID
var validMaps map[string]bool

func HTNewServer(logger *log.Logger) *HTServer {
	useAddr := ":" + strconv.Itoa(CFG.Port)

	ErrorLog = htOpenLogs("error.log")

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

func htLogging(logger *log.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				requestID, ok := r.Context().Value(htRequestIDKey).(string)
				if !ok {
					requestID = "unknown"
				}

				logger.Println(requestID, r.Method, r.URL.Path, r.RemoteAddr, r.UserAgent())
			}()
			next.ServeHTTP(w, r)
		})
	}
}

// Normal URL when we are not developing
var validURL = regexp.MustCompile("^/|^/bodies/*$|^/css/*$|^/images/*$|^/js/*.js$|^/lang*$|^/webfonts/*$|^/*.html$|")

func htCommonHandler(w http.ResponseWriter, r *http.Request) {
	if strings.Contains(r.URL.Path, "edit") {
		htIsEditionEnabled(w, r)
		return
	}

	m := validURL.FindStringSubmatch(r.URL.Path)
	if m == nil {
		http.NotFound(w, r)
		ErrorLog.Printf("Blocked request: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
		return
	}
	http.ServeFile(w, r, r.URL.Path[1:])
}

func htIsEditionEnabled(w http.ResponseWriter, r *http.Request) {
	if CFG.DevMode == false {
		http.NotFound(w, r)
		ErrorLog.Printf("Blocked request: %s %s from %s, because devmode is disabled", r.Method, r.URL.Path, r.RemoteAddr)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	id := uuid.New()
	strID := id.String()

	if validMaps == nil {
		validMaps = make(map[string]bool)
	}

	validMaps[strID] = true

	resp := make(map[string]string)
	resp["editable"] = strID
	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("Error happened in JSON marshal. Err: %s", err)
	}
	w.Write(jsonResp)
}
