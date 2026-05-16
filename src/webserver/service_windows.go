// SPDX-License-Identifier: GPL-3.0-or-later
//go:build windows
// +build windows

package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"sync/atomic"
	"time"

	"golang.org/x/sys/windows/svc"
)

const (
	serviceName     = "historytracers"
	serviceFullName = "HistoryTracers Web Server"
	serviceDesc     = "A web server for historical content management"
)

func htInstallService() {
	executablePath, err := os.Executable()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to get executable path: %v\n", err)
		os.Exit(1)
	}

	cmd := exec.Command("sc", "create", serviceName, "binPath=", executablePath, "run", "DisplayName=", serviceFullName, "start=", "auto")
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to install service: %v\n%s\n", err, output)
		os.Exit(1)
	}

	cmd = exec.Command("sc", "description", serviceName, serviceDesc)
	output, err = cmd.CombinedOutput()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to set service description: %v\n%s\n", err, output)
	}

	fmt.Printf("Service '%s' installed successfully.\n", serviceName)
	fmt.Printf("To start the service, run: sc start %s\n", serviceName)
}

func htUninstallService() {
	cmd := exec.Command("sc", "stop", serviceName)
	cmd.Run()

	cmd = exec.Command("sc", "delete", serviceName)
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to remove service: %v\n%s\n", err, output)
		os.Exit(1)
	}

	fmt.Printf("Service '%s' removed successfully.\n", serviceName)
}

type htServiceHandler struct{}

func (h *htServiceHandler) Execute(args []string, r <-chan svc.ChangeRequest, changes chan<- svc.Status) (bool, uint32) {
	htInitializeCommonMaps()
	HTParseArg()
	HTLoadConfig()

	var daemonLog, accessLog *log.Logger
	daemonLog = htOpenLogs("daemon.log")
	accessLog = htOpenLogs("access.log")

	htRunStopFlags()

	devM := "with"
	if CFG.DevMode == false {
		devM += "out"
	} else {
		http.HandleFunc("/save", htSaveHandler)
	}

	http.HandleFunc("/", htCommonHandler)
	http.HandleFunc("GET /healthz", htHealthCheck)

	server := HTNewServer(accessLog)

	atomic.StoreInt32(&healthy, 1)

	go func() {
		daemonLog.Println("INFO: Server started, listening port", CFG.Port, devM, "devmode")
		if err := server.hServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			daemonLog.Fatalf("ERROR: ListenAndServe failed: %v\n", err)
		}
	}()

	stopped := false
	stopChan := make(chan bool)

	for {
		select {
		case c := <-r:
			switch c.Cmd {
			case svc.Stop, svc.Shutdown:
				if !stopped {
					stopped = true
					changes <- svc.Status{State: svc.StopPending}
					go func() {
						daemonLog.Println("INFO: Server is shutting down...")
						atomic.StoreInt32(&healthy, 0)

						ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
						defer cancel()

						server.hServer.SetKeepAlivesEnabled(false)
						if err := server.hServer.Shutdown(ctx); err != nil {
							daemonLog.Fatalf("ERROR: Graceful shutdown failed: %v\n", err)
						}

						daemonLog.Println("INFO: Good bye!")
						stopChan <- true
					}()
				}
			}
		case <-stopChan:
			changes <- svc.Status{State: svc.Stopped}
			return false, 0
		}
	}
}

func htRunService() {
	err := svc.Run(serviceName, &htServiceHandler{})
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to run service: %v\n", err)
		os.Exit(1)
	}
}