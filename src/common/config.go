// SPDX-License-Identifier: GPL-3.0-or-later

package common

type HTConfigBase struct {
	Port        int
	SrcPath     string
	ContentPath string
	LogPath     string
}

func NewHTConfigBase(port int, srcPath, contentPath, logPath string) *HTConfigBase {
	return &HTConfigBase{
		Port:        port,
		SrcPath:     srcPath,
		ContentPath: contentPath,
		LogPath:     logPath,
	}
}
