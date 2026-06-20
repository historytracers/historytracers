//go:build !windows

package main

/*
#cgo linux openbsd freebsd netbsd pkg-config: gtk+-3.0
#cgo darwin LDFLAGS: -framework Cocoa

#if defined(__APPLE__)
#include <Cocoa/Cocoa.h>
static void bringWindowToFront(void *w) {
    [(NSWindow*)w makeKeyAndOrderFront:nil];
}
#else
#include <gtk/gtk.h>
static void bringWindowToFront(void *w) {
    if (w) gtk_window_present(GTK_WINDOW(w));
}
#endif
*/
import "C"

import (
	"os"
	"path/filepath"

	"github.com/webview/webview_go"
)

func hideConsole() {}

func runWindow() {
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("HistoryTracers Editor")
	w.SetSize(1280, 800, webview.HintNone)

	w.Init(editorBarJS)
	w.Bind("closeWindow", func() {
		w.Terminate()
	})

	if _, err := os.Stat(filepath.Join(contentDir, "index.html")); os.IsNotExist(err) {
		w.SetHtml(welcomePage)
		C.bringWindowToFront(w.Window())
		w.Run()
		return
	}

	w.Navigate(pageURL)
	C.bringWindowToFront(w.Window())
	w.Run()
}
