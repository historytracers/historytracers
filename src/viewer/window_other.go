//go:build !windows

package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
)

func runWindow() {
	fmt.Println("Native window is not supported on this platform.")
	fmt.Println("Open your browser to:")
	fmt.Printf("  %s\n", pageURL)
	fmt.Println("Press Ctrl+C to stop.")

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
	<-sig
}
