//go:build windows

// SPDX-License-Identifier: GPL-3.0-or-later
package main

import (
	"log"
	"os"
	"path/filepath"
	"syscall"
	"unsafe"

	webview2 "github.com/Krakinsight/go-webview2"
)

var (
	modUser32               = syscall.NewLazyDLL("user32.dll")
	procSetWindowPos        = modUser32.NewProc("SetWindowPos")
	procSetForegroundWindow = modUser32.NewProc("SetForegroundWindow")
)

const (
	_HWND_TOPMOST   = ^uintptr(0) // -1
	_HWND_NOTOPMOST = ^uintptr(1) // -2
	_SWP_NOMOVE     = 0x0002
	_SWP_NOSIZE     = 0x0001
	_SWP_NOACTIVATE = 0x0010
)

func bringToFront(hwnd unsafe.Pointer) {
	h := uintptr(hwnd)
	// Step 1: briefly make the window topmost — this forces it to the front
	// regardless of foreground lock restrictions.
	procSetWindowPos.Call(h, _HWND_TOPMOST, 0, 0, 0, 0, _SWP_NOMOVE|_SWP_NOSIZE)
	// Step 2: remove topmost so other windows can overlap during runtime,
	// while keeping the window at the top of the normal Z-order.
	procSetWindowPos.Call(h, _HWND_NOTOPMOST, 0, 0, 0, 0, _SWP_NOMOVE|_SWP_NOSIZE)
	procSetForegroundWindow.Call(h)
}

func runWindow() {
	w, err := webview2.NewWithOptions(webview2.WebViewOptions{
		Debug:     true,
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title:   "HistoryTracers Viewer",
			Width:   1280,
			Height:  800,
			Center:  true,
			Style:   webview2.WindowStyleDefault,
			ExStyle: 0,
		},
	})
	if err != nil {
		log.Fatalf("Failed to create webview: %v", err)
	}
	if w == nil {
		log.Fatal("Failed to create webview window")
	}
	defer w.Destroy()

	w.Init(addressBarJS)
	w.Bind("closeWindow", func() {
		w.Destroy()
	})

	bringToFront(w.Window())

	if _, err := os.Stat(filepath.Join(contentDir, "index.html")); os.IsNotExist(err) {
		w.SetHtml(welcomePage)
		w.Run()
		return
	}

	w.Navigate(pageURL)
	w.Run()
}
