// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

var htGitModifiedMap map[string]bool

func htFillModifiedGit() {
	cmd := exec.Command("git", "ls-files", "-m")
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR: ", err)
		return
	}

	htGitModifiedMap = make(map[string]bool)
	modifiedFiles := strings.Split(strings.TrimSpace(string(output)), "\n")
	for _, file := range modifiedFiles {
		if file == "" {
			continue
		}

		pathFile := fmt.Sprintf("%s%s", CFG.SrcPath, file)
		htGitModifiedMap[pathFile] = true

		if verboseFlag {
			fmt.Println("GIT: The file ", pathFile, " was modified.")
		}
	}
}
