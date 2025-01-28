// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"crypto/sha256"
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

	s, err := os.Open(sFile)
	if err != nil {
		return false, err
	}
	defer s.Close()

	hf := sha256.New()
	if _, err := io.Copy(hf, f); err != nil {
		return false, err
	}

	hs := sha256.New()
	if _, err := io.Copy(hs, s); err != nil {
		return false, err
	}

	fstr := fmt.Sprintf("%x", hf.Sum(nil))
	sstr := fmt.Sprintf("%x", hs.Sum(nil))

	if fstr == sstr {
		return true, nil
	}

	return false, nil
}
