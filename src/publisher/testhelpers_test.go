// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"os"
	"testing"

	. "github.com/historytracers/common"
)

func TestMain(m *testing.M) {
	htInitializeCommonMaps()
	srcVal = "../../"
	CFG = htCreateConfig()
	commonKeywords = make([]string, 160)
	os.Exit(m.Run())
}

// useTempSource points CFG.SrcPath at an isolated temporary source tree.
func useTempSource(t *testing.T) string {
	t.Helper()

	previous := CFG
	dir := t.TempDir()
	CFG = &htConfig{HTConfigBase: *NewHTConfigBase(0, dir+"/", dir+"/www/", "")}
	t.Cleanup(func() {
		CFG = previous
	})

	return dir
}

// useRepoSource points CFG at the repository checked out next to this package.
func useRepoSource(t *testing.T) {
	t.Helper()

	previous := CFG
	srcVal = "../../"
	CFG = htCreateConfig()
	t.Cleanup(func() {
		CFG = previous
	})
}
