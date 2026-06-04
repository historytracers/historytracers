//go:build !windows

package main

import (
	"os"
	"path/filepath"

	"github.com/webview/webview_go"
)

func hideConsole() {}

func runWindow() {
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("HistoryTracers Viewer")
	w.SetSize(1280, 800, webview.HintNone)

	w.Init(addressBarJS)
	w.Bind("closeWindow", func() {
		w.Terminate()
	})

	if _, err := os.Stat(filepath.Join(contentDir, "index.html")); os.IsNotExist(err) {
		w.SetHtml(welcomePage)
		w.Run()
		return
	}

	w.Navigate(pageURL)
	w.Run()
}
