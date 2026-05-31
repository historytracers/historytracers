//go:build !windows

package main

import (
	"github.com/webview/webview_go"
)

func runWindow() {
	w := webview_go.New(true)
	defer w.Destroy()
	w.SetTitle("HistoryTracers Viewer")
	w.SetSize(1280, 800, webview_go.HintNone)
	w.Navigate(pageURL)
	w.Run()
}
