// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	. "github.com/historytracers/common"
)

func htLangTest(testArg string) {
	parts := strings.SplitN(testArg, ":", 2)
	if len(parts) != 2 {
		fmt.Fprintf(os.Stderr, "ERROR: -langtest must be in format 'lang:uuid', got '%s'\n", testArg)
		os.Exit(1)
	}
	testLang := parts[0]
	testUUID := strings.TrimSuffix(parts[1], ".json")

	if len(testUUID) != 36 {
		fmt.Fprintf(os.Stderr, "ERROR: invalid UUID '%s'\n", testUUID)
		os.Exit(1)
	}

	langOK := false
	for _, l := range htLangPaths {
		if l == testLang {
			langOK = true
			break
		}
	}
	if !langOK {
		fmt.Fprintf(os.Stderr, "ERROR: invalid language '%s'. Must be one of: %s\n", testLang, strings.Join(htLangPaths, ", "))
		os.Exit(1)
	}

	success := true

	type langResult struct {
		lang  string
		lines int
		path  string
		err   error
	}

	var results []langResult
	var firstResult *langResult

	for _, lang := range htLangPaths {
		filePath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, testUUID)

		if _, statErr := os.Stat(filePath); os.IsNotExist(statErr) {
			results = append(results, langResult{lang: lang, err: fmt.Errorf("file not found: %s", filePath)})
			continue
		}

		byteValue, err := htOpenFileReadClose(filePath)
		if err != nil {
			results = append(results, langResult{lang: lang, err: fmt.Errorf("error reading: %s", err)})
			continue
		}

		var cf ClassTemplateFile
		err = json.Unmarshal(byteValue, &cf)
		if err != nil {
			htCommonJSONError(byteValue, err)
			results = append(results, langResult{lang: lang, err: fmt.Errorf("JSON parse error: %s", err)})
			continue
		}

		lines, errL := htCountLines(filePath)
		if errL != nil {
			results = append(results, langResult{lang: lang, err: fmt.Errorf("line count error: %s", errL)})
			continue
		}

		r := langResult{lang: lang, lines: lines, path: filePath}
		results = append(results, r)
		if lang == testLang {
			firstResult = &r
		}
	}

	fmt.Printf("Testing UUID: %s\n", testUUID)
	fmt.Println("---")

	for _, r := range results {
		if r.err != nil {
			fmt.Fprintf(os.Stderr, "FAIL [%s]: %s\n", r.lang, r.err)
			success = false
		} else {
			fmt.Printf("OK   [%s]: %d lines (%s)\n", r.lang, r.lines, r.path)
		}
	}

	if firstResult == nil {
		fmt.Fprintf(os.Stderr, "FAIL: requested language '%s' could not be loaded\n", testLang)
		success = false
	}

	if testUUID != "052e06b9-f10c-4e76-896d-9f0e68f07506" {
		var validResults []langResult
		for _, r := range results {
			if r.err == nil {
				validResults = append(validResults, r)
			}
		}
		if len(validResults) >= 2 {
			base := validResults[0].lines
			mismatch := false
			for _, r := range validResults[1:] {
				if r.lines != base {
					fmt.Fprintf(os.Stderr, "LINE-MISMATCH [%s]: %d lines, expected %d\n", r.lang, r.lines, base)
					mismatch = true
					success = false
				}
			}
			if !mismatch {
				fmt.Printf("OK: line counts consistent (%d lines across %d languages)\n", base, len(validResults))
			}
		}
	} else {
		fmt.Println("SKIP: exception UUID (line count not cross-checked)")
	}

	if success {
		fmt.Println("\nRESULT: PASS")
		os.Exit(0)
	} else {
		fmt.Println("\nRESULT: FAIL")
		os.Exit(1)
	}
}
