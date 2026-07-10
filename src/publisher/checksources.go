// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"

	. "github.com/historytracers/common"
)

func htCheckSources() {
	allUUIDs := make(map[string]bool)

	for _, lang := range htLangPaths {
		dirPath := fmt.Sprintf("%slang/%s/", CFG.SrcPath, lang)
		entries, err := os.ReadDir(dirPath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "ERROR reading directory %s: %s\n", dirPath, err)
			os.Exit(1)
		}
		for _, e := range entries {
			if !e.IsDir() && uuidFileRE.MatchString(e.Name()) {
				allUUIDs[strings.TrimSuffix(e.Name(), ".json")] = true
			}
		}
	}

	sortedUUIDs := make([]string, 0, len(allUUIDs))
	for uid := range allUUIDs {
		sortedUUIDs = append(sortedUUIDs, uid)
	}
	sortStrings(sortedUUIDs)

	fmt.Printf("Checking and fixing source date_time.year vs published for %d UUID files\n", len(sortedUUIDs))
	fmt.Println(strings.Repeat("=", 60))

	// Load all source files from DB into a lookup map + per-file ID tracking
	allSources, srcFileIDs := htLoadAllSourceFilesFromDB()

	totalFixed := 0
	totalFilesFixed := 0
	totalAdded := 0
	totalMissing := 0

	for _, uid := range sortedUUIDs {
		for _, lang := range htLangPaths {
			fpath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, uid)
			if _, err := os.Stat(fpath); os.IsNotExist(err) {
				continue
			}
			bv, err := htOpenFileReadClose(fpath)
			if err != nil {
				continue
			}
			var anyVal interface{}
			if err := json.Unmarshal(bv, &anyVal); err != nil {
				continue
			}

			// Walk to find mismatches (does NOT modify anyVal)
			fixes := findMismatches(anyVal, allSources)

			var actualFixes, notFound []srcFix
			seen := make(map[string]bool)
			for _, f := range fixes {
				key := f.srcUUID + "|" + f.fileYear + "|" + f.fixedTo
				if seen[key] {
					continue
				}
				seen[key] = true
				if f.fixedTo == "(NOT-FOUND)" {
					notFound = append(notFound, f)
				} else {
					actualFixes = append(actualFixes, f)
				}
			}

			if len(actualFixes) > 0 {
				// Surgical byte replacement — preserves all formatting and key order
				if err := fixDatesSurgically(fpath, actualFixes); err != nil {
					fmt.Fprintf(os.Stderr, "ERROR fixing file %s: %s\n", fpath, err)
				} else {
					totalFilesFixed++
				}
			}

			for _, f := range actualFixes {
				fmt.Printf("[FIXED] %s/%s: source UUID %s date_time.year \"%s\" -> \"%s\"\n",
					lang, uid, f.srcUUID, f.fileYear, f.fixedTo)
				totalFixed++
			}
			for _, f := range notFound {
				fmt.Printf("[NOT-FOUND] %s/%s: source UUID %s has year \"%s\" but no source file found\n",
					lang, uid, f.srcUUID, f.fileYear)
			}
		}

		// Second pass: ensure DB contains all citation IDs
		// referenced by this UUID file's source entries
		existingIDs := srcFileIDs[uid]
		if existingIDs == nil {
			existingIDs = make(map[string]bool)
		}

		// Collect citation UUIDs from the first available language file
		var referenced []string
		for _, lang := range htLangPaths {
			fpath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, uid)
			if _, err := os.Stat(fpath); os.IsNotExist(err) {
				continue
			}
			bv, err := htOpenFileReadClose(fpath)
			if err != nil {
				continue
			}
			var anyVal interface{}
			if err := json.Unmarshal(bv, &anyVal); err != nil {
				continue
			}
			referenced = collectSourceUUIDsFlat(anyVal)
			break
		}

		for _, suuid := range referenced {
			if existingIDs[suuid] {
				continue
			}
			if entry, found := allSources[suuid]; found {
				if err := htAddEntryToSourceFileDB(uid, entry.Category, entry.Element); err != nil {
					fmt.Fprintf(os.Stderr, "ERROR adding citation %s to DB: %s\n", suuid, err)
					continue
				}
				existingIDs[suuid] = true
				if srcFileIDs[uid] == nil {
					srcFileIDs[uid] = make(map[string]bool)
				}
				srcFileIDs[uid][suuid] = true
				fmt.Printf("[ADDED] citation %s (%s) for file %s\n", suuid, entry.Category, uid)
				totalAdded++
			} else {
				fmt.Printf("[MISSING] citation UUID %s referenced by %s not found in any source file\n",
					suuid, uid)
				totalMissing++
			}
		}
	}

	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("Files modified: %d\n", totalFilesFixed)
	fmt.Printf("Source entries fixed: %d\n", totalFixed)
	if totalAdded > 0 {
		fmt.Printf("Citations added to source files: %d\n", totalAdded)
	}
	if totalMissing > 0 {
		fmt.Printf("Citations not found in any source file: %d\n", totalMissing)
		fmt.Println("These need to be added to a source file manually.")
	}
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("Done.")
}

type srcFix struct {
	srcUUID  string
	fileYear string
	fixedTo  string
}

// collectSourceUUIDsFlat walks the JSON and returns all source[uuid] values.
func collectSourceUUIDsFlat(obj interface{}) []string {
	var result []string
	switch v := obj.(type) {
	case map[string]interface{}:
		if srcArr, ok := v["source"].([]interface{}); ok {
			for _, srcElem := range srcArr {
				if srcMap, ok := srcElem.(map[string]interface{}); ok {
					if u, _ := srcMap["uuid"].(string); u != "" {
						result = append(result, u)
					}
				}
			}
		}
		for _, val := range v {
			result = append(result, collectSourceUUIDsFlat(val)...)
		}
	case []interface{}:
		for _, item := range v {
			result = append(result, collectSourceUUIDsFlat(item)...)
		}
	}
	return result
}

// findMismatches walks the parsed JSON to detect source entries whose
// date_time.year differs from the published field in allSources.
// It does NOT modify the map — it only collects fixes.
func findMismatches(obj interface{}, allSources map[string]srcEntry) []srcFix {
	var result []srcFix

	switch v := obj.(type) {
	case map[string]interface{}:
		if srcArr, ok := v["source"].([]interface{}); ok {
			for _, srcElem := range srcArr {
				if srcMap, ok := srcElem.(map[string]interface{}); ok {
					srcUUID, _ := srcMap["uuid"].(string)
					if srcUUID == "" {
						continue
					}
					dt, ok := srcMap["date_time"].(map[string]interface{})
					if !ok {
						continue
					}
					fileYear, _ := dt["year"].(string)
					if fileYear == "" {
						continue
					}

					if entry, found := allSources[srcUUID]; found {
						pubStr := entry.Element.PublishDate
						if pubStr == "" {
							continue
						}
						pubYear := pubStr
						if len(pubYear) > 4 {
							pubYear = strings.SplitN(pubYear, "-", 2)[0]
						}
						if pubYear == fileYear {
							continue
						}

						result = append(result, srcFix{
							srcUUID:  srcUUID,
							fileYear: fileYear,
							fixedTo:  pubYear,
						})
					} else {
						result = append(result, srcFix{
							srcUUID:  srcUUID,
							fileYear: fileYear,
							fixedTo:  "(NOT-FOUND)",
						})
					}
				}
			}
		}
		for _, val := range v {
			result = append(result, findMismatches(val, allSources)...)
		}

	case []interface{}:
		for _, item := range v {
			result = append(result, findMismatches(item, allSources)...)
		}
	}

	return result
}

// fixDatesSurgically applies the given fixes to the raw JSON bytes of fpath.
// For each fix it builds a regex that matches the source entry containing both
// the target UUID and the old year within the same JSON object,
// preserving all formatting and key ordering.
func fixDatesSurgically(fpath string, fixes []srcFix) error {
	bv, err := htOpenFileReadClose(fpath)
	if err != nil {
		return err
	}

	for _, f := range fixes {
		pattern := `"uuid":\s*"` + regexp.QuoteMeta(f.srcUUID) +
			`"[^}]*"date_time":\s*\{[^}]*"year":\s*"` +
			regexp.QuoteMeta(f.fileYear) + `"`
		re := regexp.MustCompile(pattern)

		oldPattern := []byte(`"year": "` + f.fileYear + `"`)
		newPattern := []byte(`"year": "` + f.fixedTo + `"`)

		// Find and fix ALL matching source entries
		for {
			loc := re.FindIndex(bv)
			if loc == nil {
				break
			}

			yearIdx := bytes.Index(bv[loc[0]:loc[1]], oldPattern)
			if yearIdx < 0 {
				break
			}

			pos := loc[0] + yearIdx

			if len(newPattern) == len(oldPattern) {
				copy(bv[pos:], newPattern)
			} else {
				newBv := make([]byte, 0, len(bv)+(len(newPattern)-len(oldPattern)))
				newBv = append(newBv, bv[:pos]...)
				newBv = append(newBv, newPattern...)
				newBv = append(newBv, bv[pos+len(oldPattern):]...)
				bv = newBv
			}
		}
	}

	return os.WriteFile(fpath, bv, 0644)
}

type srcEntry struct {
	Element    HTSourceElement
	Category   string
	SourceFile string
}

func htFillSourceMapForCheck(src *HTSourceFile, dst map[string]srcEntry, fileIDs map[string]bool) {
	add := func(list []HTSourceElement, cat string) {
		for _, elem := range list {
			fileIDs[elem.ID] = true
			if _, exists := dst[elem.ID]; !exists {
				dst[elem.ID] = srcEntry{
					Element:  elem,
					Category: cat,
				}
			}
		}
	}
	if src.PrimarySources != nil {
		add(src.PrimarySources, "primary_sources")
	}
	if src.ReferencesSources != nil {
		add(src.ReferencesSources, "reference_sources")
	}
	if src.ReligiousSources != nil {
		add(src.ReligiousSources, "religious_sources")
	}
	if src.SocialMediaSources != nil {
		add(src.SocialMediaSources, "social_media_sources")
	}
}
