// SPDX-License-Identifier: GPL-3.0-or-later

// Part of the code was inspired in https://www.kelche.co/blog/go/http-server/
// (https://github.com/kelcheone/go-blog-code-snippets/blob/main/http-server/main.go)

package main

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/signal"
	"regexp"
	"strconv"
	"sync/atomic"
	"syscall"
	"time"
)

var healthy int32

type key int

const (
	htRequestIDKey key = 0
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

func htSaveHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.NotFound(w, r)
		return
	}
}

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

func htHealthCheck(w http.ResponseWriter, r *http.Request) {
	if atomic.LoadInt32(&healthy) == 1 {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	w.WriteHeader(http.StatusServiceUnavailable)
}

func htTracing(nextReuestID func() string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			requestID := r.Header.Get("X-Request-Id")
			if requestID == "" {
				requestID = nextReuestID()
			}
			ctx := context.WithValue(r.Context(), htRequestIDKey, requestID)
			w.Header().Set("X-Request-Id", requestID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
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

func main() {
	cfg := HTLoadCondig()
	logger := log.New(os.Stdout, "HT HTTP (DAEMON): ", log.LstdFlags)

	nextRequestID := func() string {
		return strconv.FormatInt(time.Now().UnixNano(), 10)
	}

	devM := "with"
	if cfg.DevMode == false {
		devM += "out"
	} else {
		http.HandleFunc("/save", htSaveHandler)
	}

	http.HandleFunc("/", htCommonHandler)
	http.HandleFunc("GET /healthz", htHealthCheck)

	useAddr := ":" + strconv.Itoa(cfg.Port)
	server := &http.Server{
		Addr:         useAddr,
		Handler:      htTracing(nextRequestID)(htLogging(logger)(http.DefaultServeMux)),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  15 * time.Second,
	}

	done := make(chan bool)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	atomic.StoreInt32(&healthy, 1)

	go func() {
		<-quit
		logger.Println("Server is shutting down...")
		atomic.StoreInt32(&healthy, 0)

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		server.SetKeepAlivesEnabled(false)
		if err := server.Shutdown(ctx); err != nil {
			logger.Fatalf("I could not gracefully shutdown the server: %v\n", err)
		}
		close(done)
	}()

	logger.Println("Ready to run listening port", cfg.Port, devM, "devmode")

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Fatalf("Listening Port", cfg.Port, devM, "devmode", "content", cfg.Path)
	}
	<-done
	logger.Println("Good bye!")
}
