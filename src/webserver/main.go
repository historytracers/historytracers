// SPDX-License-Identifier: GPL-3.0-or-later

// Parts of the code was inspired in the following algorithms:
// (https://github.com/kelcheone/go-blog-code-snippets/blob/main/http-server/main.go
// https://github.com/MuxN4/lumenserver

package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync/atomic"
	"syscall"
	"time"
)

var (
	AccessLog *log.Logger
	DaemonLog *log.Logger
	healthy   int32
)

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

func htCreateDirectory(name string) {
	if stat, err := os.Stat(name); err != nil {
		e := os.Mkdir(name, 0755)
		if e != nil {
			panic(e)
		}
	} else if stat.IsDir() == false {
		panic("This is not a directory")
	}
}

func htOpenLogs(name string) *log.Logger {
	htCreateDirectory(CFG.logPath)

	fileName := fmt.Sprintf("%s/%s", CFG.logPath, name)
	if _, err := os.Stat(fileName); os.IsNotExist(err) {
		fp, err := os.Create(fileName)
		if err != nil {
			panic(err)
		}
		return log.New(fp, "", log.LstdFlags)
	} else {
		fp, err := os.OpenFile(fileName, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0640)
		if err != nil {
			panic(err)
		}
		return log.New(fp, "", log.LstdFlags)
	}
}

func main() {
	HTParseArg()
	HTLoadConfig()
	DaemonLog := htOpenLogs("daemon.log")
	AccessLog := htOpenLogs("access.log")

	if minifyFlag {
		HTMinifyAllFiles()
		return
	}

	devM := "with"
	if CFG.DevMode == false {
		devM += "out"
	} else {
		http.HandleFunc("/save", htSaveHandler)
	}

	http.HandleFunc("/", htCommonHandler)
	http.HandleFunc("GET /healthz", htHealthCheck)

	server := HTNewServer(AccessLog)

	done := make(chan bool)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	atomic.StoreInt32(&healthy, 1)

	go func() {
		<-quit
		DaemonLog.Println("INFO: Server is shutting down...")
		atomic.StoreInt32(&healthy, 0)

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		server.hServer.SetKeepAlivesEnabled(false)
		if err := server.hServer.Shutdown(ctx); err != nil {
			DaemonLog.Fatalf("ERROR: I could not gracefully shutdown the server: %v\n", err)
		}
		close(done)
	}()

	DaemonLog.Println("INFO: Ready to run listening port", CFG.Port, devM, "devmode")

	if err := server.hServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		DaemonLog.Fatalf("ERROR: Listening Port", CFG.Port, devM, "devmode", "content", CFG.contentPath)
	}
	<-done
	DaemonLog.Println("INFO: Good bye!")
}
