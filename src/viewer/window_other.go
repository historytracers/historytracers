//go:build !windows

// SPDX-License-Identifier: GPL-3.0-or-later
package main

/*
#cgo linux openbsd freebsd netbsd pkg-config: gtk+-3.0
#cgo darwin LDFLAGS: -framework Cocoa

#if defined(__APPLE__)
#include <Cocoa/Cocoa.h>
static void bringWindowToFront(void *w) {
    [(NSWindow*)w makeKeyAndOrderFront:nil];
}
static void setWindowIcon(void *w, const char *path) {
    NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
    NSString *nsPath = [NSString stringWithUTF8String:path];
    NSImage *img = [[NSImage alloc] initWithContentsOfFile:nsPath];
    if (img) {
        [NSApp setApplicationIconImage:img];
        if (w) [(NSWindow*)w setContentView:[(NSWindow*)w contentView]];
    }
    [pool release];
}
#else
#include <gtk/gtk.h>
static void bringWindowToFront(void *w) {
    if (w) gtk_window_present(GTK_WINDOW(w));
}
static void setWindowIcon(void *w, const char *path) {
    if (!w || !path) return;
    GError *err = NULL;
    gtk_window_set_icon_from_file(GTK_WINDOW(w), path, &err);
    if (err) g_error_free(err);
}
#endif
*/
import "C"

import (
	"os"
	"path/filepath"
	"unsafe"

	"github.com/webview/webview_go"
)

func hideConsole() {}

func runWindow() {
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("HistoryTracers Viewer")
	w.SetSize(1280, 800, webview.HintNone)
	pngPath, _ := writeTempIcon()
	if pngPath != "" {
		cpath := C.CString(pngPath)
		C.setWindowIcon(w.Window(), cpath)
		C.free(unsafe.Pointer(cpath))
		_ = os.RemoveAll(filepath.Dir(pngPath))
	}

	w.Init(addressBarJS)
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
