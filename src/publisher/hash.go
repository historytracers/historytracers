// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
)

func HTAreFilesEqual(fFile string, sFile string) (bool, error) {
	f, err := os.Open(fFile)
	if err != nil {
		return false, err
	}
	defer f.Close()

	hf := sha256.New()
	if _, err := io.Copy(hf, f); err != nil {
		return false, err
	}

	s, err := os.Open(sFile)
	if err != nil {
		return false, err
	}
	defer s.Close()

	hs := sha256.New()
	if _, err := io.Copy(hs, s); err != nil {
		return false, err
	}

	fstr := hex.EncodeToString(hf.Sum(nil))
	sstr := hex.EncodeToString(hs.Sum(nil))

	if fstr == sstr {
		if verboseFlag {
			fmt.Println("Comparing files", fFile, " and ", sFile, ": equal files")
		}
		return true, nil
	}

	if verboseFlag {
		fmt.Println("Comparing files", fFile, " and ", sFile, ": not equal files")
	}
	return false, nil
}
