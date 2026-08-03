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
	for _, lang := range htLangPaths {
		values, err := parseGalleryReadme(lang)
		if err != nil {
			fmt.Fprintln(os.Stderr, "gallery: readme error for", lang, ":", err)
			continue
		}

		existingPath := fmt.Sprintf("%slang/%s/gallery.json", CFG.SrcPath, lang)
		raw, err := os.ReadFile(existingPath)
		if err != nil {
			fmt.Fprintln(os.Stderr, "gallery: read error for", existingPath, ":", err)
			continue
		}

		var idx common.ClassIdx
		if err := json.Unmarshal(raw, &idx); err != nil {
			fmt.Fprintln(os.Stderr, "gallery: parse error for", existingPath, ":", err)
			continue
		}

		var existingValues []common.ClassContentValue
		for _, ec := range idx.Content {
			if ec.ID == "groups_gallery" {
				existingValues = ec.Value
				break
			}
		}

		existingByName := map[string]common.ClassContentValue{}
		for _, ev := range existingValues {
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

		for i := range idx.Content {
			if idx.Content[i].ID == "groups_gallery" {
				idx.Content[i].Value = values
				break
			}
		}

		tmpFile, err := htWriteTmpFile(lang, &idx)
		if err != nil {
			fmt.Fprintln(os.Stderr, "gallery: write error:", err)
			continue
		}
		HTCopyFilesWithoutChanges(existingPath, tmpFile)
		os.Remove(tmpFile)
		if verboseFlag {
			fmt.Println("gallery: updated", existingPath)
		}
	}
}
