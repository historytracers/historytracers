// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"sort"
	"strings"

	"github.com/historytracers/common"
)

var readmeEntryPat = regexp.MustCompile("^- `([^`]+)`: (.+)$")
var mdLinkPat = regexp.MustCompile(`\[([^\]]+)\]\([^)]+\)`)
var camelSplitPat = regexp.MustCompile(`([a-z])([A-Z])`)

func parseGalleryReadme(lang string) ([]common.ClassContentValue, error) {
	readmeFile := fmt.Sprintf("%s/images/README.md", CFG.SrcPath)
	if lang == "pt-BR" {
		readmeFile = fmt.Sprintf("%s/images/README-PT-BR.md", CFG.SrcPath)
	} else if lang == "es-ES" {
		readmeFile = fmt.Sprintf("%s/images/README-ES.md", CFG.SrcPath)
	}

	f, err := os.Open(readmeFile)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var values []common.ClassContentValue
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := scanner.Text()
		m := readmeEntryPat.FindStringSubmatch(line)
		if m == nil {
			continue
		}
		dirname := m[1]
		rest := m[2]

		desc := mdLinkPat.ReplaceAllString(rest, "$1")
		desc = strings.TrimSpace(desc)
		desc = strings.TrimRight(desc, ".")

		nameDisplay := camelSplitPat.ReplaceAllString(dirname, "${1} ${2}")
		upperSplitPat := regexp.MustCompile(`([A-Z])([A-Z][a-z])`)
		nameDisplay = upperSplitPat.ReplaceAllString(nameDisplay, "${1} ${2}")
		if len(nameDisplay) > 0 && nameDisplay[0] >= 'a' && nameDisplay[0] <= 'z' {
			nameDisplay = string(nameDisplay[0]-32) + nameDisplay[1:]
		}

		values = append(values, common.ClassContentValue{
			FamilyId: "",
			PersonId: "",
			ID:       "",
			Name:     nameDisplay,
			Desc:     desc,
			DateTime: nil,
		})
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	sort.Slice(values, func(i, j int) bool {
		return values[i].Name < values[j].Name
	})
	return values, nil
}

func HTGenerateGalleryIndex() {
	langTitles := map[string]string{
		"en-US": "Images used by History Tracers",
		"pt-BR": "Imagens utilizadas pelo History Tracers",
		"es-ES": "Im\u00e1genes utilizadas por History Tracers",
	}
	langHeaders := map[string]string{
		"en-US": "Image directories",
		"pt-BR": "Diret\u00f3rios de imagens",
		"es-ES": "Directorios de im\u00e1genes",
	}
	langIntros := map[string]string{
		"en-US": "<p><hr /></p><p><h3>Images used by History Tracers</h3>This chapter lists all image directories used throughout the project, organized by source.</p>",
		"pt-BR": "<p><hr /></p><p><h3>Imagens utilizadas pelo History Tracers</h3>Este cap\u00edtulo lista todos os diret\u00f3rios de imagens usados no projeto, organizados por fonte.</p>",
		"es-ES": "<p><hr /></p><p><h3>Im\u00e1genes utilizadas por History Tracers</h3>Este cap\u00edtulo lista todos los directorios de im\u00e1genes utilizados en el proyecto, organizados por fuente.</p>",
	}

	for _, lang := range htLangPaths {
		values, err := parseGalleryReadme(lang)
		if err != nil {
			fmt.Fprintln(os.Stderr, "gallery: readme error for", lang, ":", err)
			continue
		}

		title := langTitles[lang]
		intro := langIntros[lang]

		content := []common.ClassContent{
			{
				ID:        "introduction",
				Target:    "",
				Page:      "",
				ValueType: "",
				HTMLValue: intro,
				Value:     nil,
				DateTime:  nil,
			},
			{
				ID:        "gallery_header",
				Target:    "gallery",
				Page:      "",
				ValueType: "",
				HTMLValue: "<h3>" + langHeaders[lang] + "</h3>",
				Value:     nil,
				DateTime:  nil,
			},
			{
				ID:        "groups_gallery",
				Target:    "gallery",
				Page:      "class_content",
				ValueType: "group-list",
				HTMLValue: "",
				Value:     values,
				DateTime:  nil,
			},
		}

		idx := common.ClassIdx{
			Title:      title,
			Header:     title,
			Audio:      nil,
			LastUpdate: []string{"1755950742"},
			Sources:    []string{"gallery"},
			Scripts:    nil,
			License:    []string{"SPDX-License-Identifier: GPL-3.0-or-later", "CC BY-NC 4.0 DEED"},
			Version:    2,
			Type:       "index",
			Content:    content,
			DateTime:   nil,
		}

		existingPath := fmt.Sprintf("%slang/%s/gallery.json", CFG.SrcPath, lang)
		if raw, err := os.ReadFile(existingPath); err == nil {
			var existing common.ClassIdx
			if json.Unmarshal(raw, &existing) == nil {
				for _, ec := range existing.Content {
					if ec.ID == "groups_gallery" {
						existingByName := map[string]common.ClassContentValue{}
						for _, ev := range ec.Value {
							if ev.Name != "" {
								existingByName[ev.Name] = ev
							}
						}
						for i := range values {
							if ev, ok := existingByName[values[i].Name]; ok {
								values[i].Name = ev.Name
								if ev.ID != "" {
									values[i].ID = ev.ID
								}
							}
						}
						break
					}
				}
			}
		}

		path := existingPath
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
