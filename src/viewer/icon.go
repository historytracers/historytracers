// SPDX-License-Identifier: GPL-3.0-or-later
package main

import (
	_ "embed"
	"os"
	"path/filepath"
)

//go:embed icon.png
var iconPNG []byte

//go:embed icon.ico
var iconICO []byte

func writeTempIcon() (string, string) {
	dir := os.TempDir()
	pngPath := filepath.Join(dir, "historytracers-viewer-icon.png")
	icoPath := filepath.Join(dir, "historytracers-viewer-icon.ico")
	// Write PNG (used on Linux/macOS)
	_ = os.WriteFile(pngPath, iconPNG, 0644)
	// Write ICO (used on Windows)
	_ = os.WriteFile(icoPath, iconICO, 0644)
	return pngPath, icoPath
}
