//go:build windows

// SPDX-License-Identifier: GPL-3.0-or-later
package main

import (
	"syscall"
)

var (
	kernel32        = syscall.NewLazyDLL("kernel32.dll")
	procFreeConsole = kernel32.NewProc("FreeConsole")
)

func hideConsole() {
	procFreeConsole.Call()
}
