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

	// Load all source files once into a lookup map
	allSources := htLoadAllSourceFiles()

	totalFixed := 0
	totalFilesFixed := 0
	totalNotFound := 0

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
				totalNotFound++
			}
		}
	}

	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("Files modified: %d\n", totalFilesFixed)
	fmt.Printf("Source entries fixed: %d\n", totalFixed)
	if totalNotFound > 0 {
		fmt.Printf("Source UUIDs not found in source files: %d\n", totalNotFound)
		fmt.Println("These need to be added to a source file in lang/sources/")
	}
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("Done.")
}

type srcFix struct {
	srcUUID  string
	fileYear string
	fixedTo  string
}

// findMismatches walks the parsed JSON to detect source entries whose
// date_time.year differs from the published field in allSources.
// It does NOT modify the map — it only collects fixes.
func findMismatches(obj interface{}, allSources map[string]HTSourceElement) []srcFix {
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

					if elem, found := allSources[srcUUID]; found {
						pubStr := elem.PublishDate
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

func htLoadAllSourceFiles() map[string]HTSourceElement {
	allSources := make(map[string]HTSourceElement)

	srcDir := fmt.Sprintf("%slang/sources/", CFG.SrcPath)
	entries, err := os.ReadDir(srcDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR reading source directory %s: %s\n", srcDir, err)
		return allSources
	}

	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		fpath := fmt.Sprintf("%slang/sources/%s", CFG.SrcPath, e.Name())
		bv, err := htOpenFileReadClose(fpath)
		if err != nil {
			continue
		}
		var sf HTSourceFile
		if err := json.Unmarshal(bv, &sf); err != nil {
			continue
		}
		htFillSourceMapForCheck(&sf, allSources)
	}

	return allSources
}

func htFillSourceMapForCheck(src *HTSourceFile, dst map[string]HTSourceElement) {
	add := func(list []HTSourceElement) {
		for _, elem := range list {
			if _, exists := dst[elem.ID]; !exists {
				dst[elem.ID] = elem
			}
		}
	}
	if src.PrimarySources != nil {
		add(src.PrimarySources)
	}
	if src.ReferencesSources != nil {
		add(src.ReferencesSources)
	}
	if src.ReligiousSources != nil {
		if rs, ok := src.ReligiousSources.([]HTSourceElement); ok {
			add(rs)
		}
	}
	if src.SocialMediaSources != nil {
		if sms, ok := src.SocialMediaSources.([]HTSourceElement); ok {
			add(sms)
		}
	}
}
