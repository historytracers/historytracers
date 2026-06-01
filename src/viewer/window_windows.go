//go:build windows

package main

import (
	"log"
	"os/exec"
	"path/filepath"
	"strings"

	webview2 "github.com/Krakinsight/go-webview2"
)

func promptContentDir() string {
	cmd := exec.Command("powershell", "-NoProfile", "-Command", `
Add-Type -AssemblyName System.Windows.Forms
$d = New-Object System.Windows.Forms.OpenFileDialog
$d.Filter = "HTML Files (*.html;*.htm)|*.html;*.htm|All Files (*.*)|*.*"
$d.Title = "Select index.html from the content directory"
if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output $d.FileName
}`)
	out, err := cmd.Output()
	if err != nil {
		return ""
	}
	filePath := strings.TrimSpace(string(out))
	if filePath == "" {
		return ""
	}
	idx := strings.LastIndex(filePath, "index.html")
	if idx >= 0 {
		return filePath[:idx]
	}
	return filepath.Dir(filePath) + "\\"
}

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
