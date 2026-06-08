// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"

	. "github.com/historytracers/common"
)

var uuidFileRE = regexp.MustCompile(`^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}\.json$`)

type uuidTestOutcome struct {
	uid        string
	failReason string
	lines      []langLines
}

func htGlobalLangTest() {
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

	total := len(sortedUUIDs)
	passed := 0
	var failures []uuidTestOutcome

	fmt.Printf("Testing %d UUID files across %d languages\n", total, len(htLangPaths))
	fmt.Println(strings.Repeat("=", 60))

	for _, uid := range sortedUUIDs {
		out := htTestSingleUUID(uid)

		if out.failReason != "" {
			fmt.Printf("[FAIL] %-36s %s", uid, out.failReason)
			if len(out.lines) > 0 {
				for _, l := range out.lines {
					fmt.Printf(" %s:%d", l.lang, l.lines)
				}
			}
			fmt.Println()
			failures = append(failures, out)
			continue
		}

		passed++
	}

	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("Total: %d | Passed: %d | Failed: %d\n", total, passed, len(failures))
	if len(failures) > 0 {
		fmt.Println("\nFailed UUIDs:")
		for _, f := range failures {
			fmt.Printf("  %s: %s\n", f.uid, f.failReason)
		}
		os.Exit(1)
	}
	os.Exit(0)
}

func sortStrings(s []string) {
	for i := 0; i < len(s); i++ {
		for j := i + 1; j < len(s); j++ {
			if s[i] > s[j] {
				s[i], s[j] = s[j], s[i]
			}
		}
	}
}

type langLines struct {
	lang  string
	lines int
}

func htTestSingleUUID(uid string) uuidTestOutcome {
	out := uuidTestOutcome{uid: uid}

	for _, lang := range htLangPaths {
		fpath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, uid)
		if _, err := os.Stat(fpath); os.IsNotExist(err) {
			out.failReason = "MISSING-FILE"
			out.lines = append(out.lines, langLines{lang: lang, lines: -1})
			continue
		}
		bv, err := htOpenFileReadClose(fpath)
		if err != nil {
			out.failReason = "READ-ERROR"
			out.lines = append(out.lines, langLines{lang: lang, lines: -1})
			continue
		}
		var anyVal interface{}
		if err := json.Unmarshal(bv, &anyVal); err != nil {
			out.failReason = "JSON-ERROR"
			out.lines = append(out.lines, langLines{lang: lang, lines: -1})
			continue
		}
		cnt, err := htCountLines(fpath)
		if err != nil {
			out.failReason = "COUNT-ERROR"
			out.lines = append(out.lines, langLines{lang: lang, lines: -1})
			continue
		}
		out.lines = append(out.lines, langLines{lang: lang, lines: cnt})
	}

	if out.failReason != "" {
		return out
	}

	if uid != "052e06b9-f10c-4e76-896d-9f0e68f07506" && len(out.lines) >= 2 {
		base := out.lines[0].lines
		for _, l := range out.lines[1:] {
			if l.lines != base {
				out.failReason = "LINE-MISMATCH"
				return out
			}
		}
	}

	return out
}

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
