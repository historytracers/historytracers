// SPDX-License-Identifier: GPL-3.0-or-later
//go:build !windows
// +build !windows

package main

import (
	"fmt"
	"os"
)

func htInstallService() {
	fmt.Println("Service installation is only supported on Windows")
	os.Exit(1)
}

func htUninstallService() {
	fmt.Println("Service removal is only supported on Windows")
	os.Exit(1)
}

func htRunService() {
	fmt.Println("Service mode is only supported on Windows")
	os.Exit(1)
}