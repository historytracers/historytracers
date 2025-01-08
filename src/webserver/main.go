// SPDX-License-Identifier: GPL-3.0-or-later

// Parts of the code was inspired in the following algorithms:
// (https://github.com/kelcheone/go-blog-code-snippets/blob/main/http-server/main.go
// https://github.com/MuxN4/lumenserver

package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync/atomic"
	"syscall"
	"time"
)

var healthy int32

type key int

const (
	htRequestIDKey key = 0
)

func htSaveHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.NotFound(w, r)
		return
	}
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

	devM := "with"
	if cfg.DevMode == false {
		devM += "out"
	} else {
		http.HandleFunc("/save", htSaveHandler)
	}

	http.HandleFunc("/", htCommonHandler)
	http.HandleFunc("GET /healthz", htHealthCheck)

	server := HTNewServer(cfg, logger)

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

		server.hServer.SetKeepAlivesEnabled(false)
		if err := server.hServer.Shutdown(ctx); err != nil {
			logger.Fatalf("I could not gracefully shutdown the server: %v\n", err)
		}
		close(done)
	}()

	logger.Println("Ready to run listening port", cfg.Port, devM, "devmode")

	if err := server.hServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Fatalf("Listening Port", cfg.Port, devM, "devmode", "content", cfg.Path)
	}
	<-done
	logger.Println("Good bye!")
}
