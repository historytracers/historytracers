//go:build windows

package main

import (
	"log"

	webview2 "github.com/Krakinsight/go-webview2"
)

func runWindow() {
	w, err := webview2.NewWithOptions(webview2.WebViewOptions{
		Debug:     true,
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title:  "HistoryTracers Viewer",
			Width:  1280,
			Height: 800,
			Center: true,
			Style:  webview2.WindowStyleDefault,
		},
	})
	if err != nil {
		log.Fatalf("Failed to create webview: %v", err)
	}
	if w == nil {
		log.Fatal("Failed to create webview window")
	}
	defer w.Destroy()

	w.Navigate(pageURL)
	w.Run()
}
