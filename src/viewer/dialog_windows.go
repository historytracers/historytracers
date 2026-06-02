//go:build windows

package main

import (
	"os"
	"path/filepath"
	"syscall"
	"unsafe"
)

var (
	comdlg32             = syscall.NewLazyDLL("comdlg32.dll")
	procGetOpenFileNameW = comdlg32.NewProc("GetOpenFileNameW")
	kernel32             = syscall.NewLazyDLL("kernel32.dll")
	procFreeConsole      = kernel32.NewProc("FreeConsole")
	ole32                = syscall.NewLazyDLL("ole32.dll")
	procCoInitializeEx   = ole32.NewProc("CoInitializeEx")
	procCoUninitialize   = ole32.NewProc("CoUninitialize")
)

type openFileNameW struct {
	lStructSize       uint32
	hwndOwner         uintptr
	hInstance         uintptr
	lpstrFilter       *uint16
	lpstrCustomFilter *uint16
	nMaxCustFilter    uint32
	nFilterIndex      uint32
	lpstrFile         *uint16
	nMaxFile          uint32
	lpstrFileTitle    *uint16
	nMaxFileTitle     uint32
	lpstrInitialDir   *uint16
	lpstrTitle        *uint16
	Flags             uint32
	nFileOffset       uint16
	nFileExtension    uint16
	lpstrDefExt       *uint16
	lCustData         uintptr
	lpfnHook          uintptr
	lpTemplateName    *uint16
	pvReserved        unsafe.Pointer
	dwReserved        uint32
	FlagsEx           uint32
}

const (
	ofnFileMustExist = 0x00001000
	ofnHideReadOnly  = 0x00000004
	ofnPathMustExist = 0x00000800
	ofnExplorer      = 0x00080000
	ofnLongNames     = 0x00200000
)

func hideConsole() {
	procFreeConsole.Call()
}

func coInit() {
	procCoInitializeEx.Call(0, 2) // COINIT_APARTMENTTHREADED
}

func coUninit() {
	procCoUninitialize.Call()
}

func nativePickFile(hwndOwner uintptr) string {
	exe, _ := os.Executable()
	exeDir := filepath.Dir(exe)

	var buf [260]uint16
	buf[0] = 0

	filter := "HTML Files (*.html;*.htm)\x00*.html;*.htm\x00All Files (*.*)\x00*.*\x00\x00"
	filterPtr := &([]uint16(syscall.StringToUTF16(filter)))[0]

	title := "Select index.html from the content directory"
	titlePtr := &([]uint16(syscall.StringToUTF16(title)))[0]

	ofn := &openFileNameW{
		lStructSize:     uint32(unsafe.Sizeof(openFileNameW{})),
		hwndOwner:       hwndOwner,
		lpstrFilter:     filterPtr,
		lpstrFile:       &buf[0],
		nMaxFile:        260,
		lpstrInitialDir: &([]uint16(syscall.StringToUTF16(exeDir + "\\")))[0],
		lpstrTitle:      titlePtr,
		Flags:           ofnFileMustExist | ofnHideReadOnly | ofnPathMustExist | ofnExplorer | ofnLongNames,
	}

	ret, _, _ := procGetOpenFileNameW.Call(uintptr(unsafe.Pointer(ofn)))
	if ret == 0 {
		return ""
	}

	return syscall.UTF16ToString(buf[:])
}
