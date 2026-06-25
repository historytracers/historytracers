// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"fmt"
	"os"

	"github.com/historytracers/common"
)

func HTGenerateGalleryIndex() {
	content := []common.ClassContent{
		{
			ID:        "introduction",
			Target:    "",
			Page:      "",
			ValueType: "",
			HTMLValue: "<p><hr /></p><p><h3>Gallery</h3>Images used throughout the project.</p>",
			Value:     nil,
			DateTime:  nil,
		},
	}

	idx := common.ClassIdx{
		Title:  "Gallery",
		Header: "Gallery",
		Audio: []common.HTAudio{
			{URL: "https://www.historytracers.org/audios/", External: true, Spotify: false},
			{URL: "https://open.spotify.com/episode/", External: true, Spotify: true},
		},
		LastUpdate: []string{"1755950742"},
		Sources:    nil,
		Scripts:    nil,
		License:    []string{"SPDX-License-Identifier: GPL-3.0-or-later", "CC BY-NC 4.0 DEED"},
		Version:    2,
		Type:       "index",
		Content:    content,
		DateTime:   nil,
	}

	for _, lang := range htLangPaths {
		path := fmt.Sprintf("%slang/%s/gallery.json", CFG.SrcPath, lang)
		tmpFile, err := htWriteTmpFile(lang, &idx)
		if err != nil {
			fmt.Fprintln(os.Stderr, "gallery: write error:", err)
			continue
		}
		HTCopyFilesWithoutChanges(path, tmpFile)
		os.Remove(tmpFile)
		if verboseFlag {
			fmt.Println("gallery: updated", path)
		}
	}
}
