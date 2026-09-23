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
	dir, err := os.MkdirTemp("", "historytracers-viewer-*")
	if err != nil {
		return "", ""
	}
	pngPath := filepath.Join(dir, "icon.png")
	icoPath := filepath.Join(dir, "icon.ico")
	if err := os.WriteFile(pngPath, iconPNG, 0600); err != nil {
		_ = os.RemoveAll(dir)
		return "", ""
	}
	if err := os.WriteFile(icoPath, iconICO, 0600); err != nil {
		_ = os.RemoveAll(dir)
		return "", ""
	}
	return pngPath, icoPath
}
