//go:build windows

// SPDX-License-Identifier: GPL-3.0-or-later
package main

import (
	"log"
	"os"
	"path/filepath"
	"sync/atomic"
	"syscall"
	"unsafe"

	webview2 "github.com/Krakinsight/go-webview2"
)

var (
	modUser32               = syscall.NewLazyDLL("user32.dll")
	procSetWindowPos        = modUser32.NewProc("SetWindowPos")
	procSetForegroundWindow = modUser32.NewProc("SetForegroundWindow")
	procGetWindowLongPtrW   = modUser32.NewProc("GetWindowLongPtrW")
	procSetWindowLongPtrW   = modUser32.NewProc("SetWindowLongPtrW")
	procCallWindowProcW     = modUser32.NewProc("CallWindowProcW")
)

const (
	_HWND_TOPMOST   = ^uintptr(0)
	_HWND_NOTOPMOST = ^uintptr(1)
	_SWP_NOMOVE     = 0x0002
	_SWP_NOSIZE     = 0x0001
	_SWP_NOACTIVATE = 0x0010
	_WM_CLOSE       = 0x0010
)

var (
	origWndProc    uintptr
	theView        webview2.WebView
	closeFinalized uintptr // atomic flag (0 = pending, 1 = finalized)
	gwlWndproc     = -4
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

	theView = w

	w.Init(editorBarJS)
	w.Bind("closeWindow", func() {
		w.Eval("onCloseRequested()")
	})
	w.Bind("finalizeClose", func() {
		atomic.StoreUintptr(&closeFinalized, 1)
		theView = nil
		w.Destroy()
	})

	// Subclass the native window to intercept WM_CLOSE
	hwnd := uintptr(w.Window())
	origWndProc, _, _ = procGetWindowLongPtrW.Call(hwnd, uintptr(gwlWndproc))
	subclassCB := syscall.NewCallback(func(h, msg, wp, lp uintptr) uintptr {
		if msg == _WM_CLOSE {
			if atomic.LoadUintptr(&closeFinalized) != 0 || theView == nil {
				ret, _, _ := procCallWindowProcW.Call(origWndProc, h, msg, wp, lp)
				return ret
			}
			theView.Eval("onCloseRequested()")
			return 0
		}
		ret, _, _ := procCallWindowProcW.Call(origWndProc, h, msg, wp, lp)
		return ret
	})
	procSetWindowLongPtrW.Call(hwnd, uintptr(gwlWndproc), subclassCB)

	bringToFront(w.Window())

	if _, err := os.Stat(filepath.Join(rootDir, "editor.html")); os.IsNotExist(err) {
		w.SetHtml(welcomePage)
		w.Run()
		return
	}

	w.Navigate(pageURL)
	w.Run()
}
