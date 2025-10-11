// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
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

func htIsJSONRequest(r *http.Request) bool {
	// Check based on URL path pattern, query parameter, or Content-Type
	return strings.HasSuffix(r.URL.Path, ".json") ||
		r.URL.Query().Get("format") == "json" ||
		r.Header.Get("Accept") == "application/json" ||
		r.Header.Get("Content-Type") == "application/json"
}

func htLoadJSONRequest(filePath string) ([]byte, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return nil, err
	}

	if CFG.DevMode {
		jsonData["editing"] = true
	}

	retData, err := json.Marshal(jsonData)
	if err != nil {
		return nil, err
	}

	return retData, nil
}

func htCommonHandler(w http.ResponseWriter, r *http.Request) {
	m := validURL.FindStringSubmatch(r.URL.Path)
	if m == nil {
		http.NotFound(w, r)
		ErrorLog.Printf("Blocked request: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
		return
	}

	if !htIsJSONRequest(r) {
		http.ServeFile(w, r, r.URL.Path[1:])
		return
	}

	fileName := fmt.Sprintf("%s%s", CFG.SrcPath, r.URL.Path[1:])
	data, err := htLoadJSONRequest(fileName)
	if err != nil {
		http.NotFound(w, r)
		ErrorLog.Printf("Error to load JSON: %s %s from %s", r.Method, r.URL.Path, r.RemoteAddr)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
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
