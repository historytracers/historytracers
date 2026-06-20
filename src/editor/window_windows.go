//go:build windows

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
	_HWND_TOPMOST   = ^uintptr(0)
	_HWND_NOTOPMOST = ^uintptr(1)
	_SWP_NOMOVE     = 0x0002
	_SWP_NOSIZE     = 0x0001
	_SWP_NOACTIVATE = 0x0010
)

func bringToFront(hwnd unsafe.Pointer) {
	h := uintptr(hwnd)
	procSetWindowPos.Call(h, _HWND_TOPMOST, 0, 0, 0, 0, _SWP_NOMOVE|_SWP_NOSIZE)
	procSetWindowPos.Call(h, _HWND_NOTOPMOST, 0, 0, 0, 0, _SWP_NOMOVE|_SWP_NOSIZE)
	procSetForegroundWindow.Call(h)
}

func runWindow() {
	w, err := webview2.NewWithOptions(webview2.WebViewOptions{
		Debug:     true,
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title:   "HistoryTracers Editor",
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

	w.Init(editorBarJS)
	w.Bind("closeWindow", func() {
		w.Destroy()
	})

	bringToFront(w.Window())

	if _, err := os.Stat(filepath.Join(rootDir, "editor.html")); os.IsNotExist(err) {
		w.SetHtml(welcomePage)
		w.Run()
		return
	}

	w.Navigate(pageURL)
	w.Run()
}
