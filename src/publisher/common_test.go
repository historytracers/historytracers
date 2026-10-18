// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	. "github.com/historytracers/common"
)

func TestHTCountLines(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "lines.txt")
	if err := os.WriteFile(path, []byte("one\ntwo\nthree\n"), 0644); err != nil {
		t.Fatal(err)
	}

	got, err := htCountLines(path)
	if err != nil {
		t.Fatal(err)
	}
	if got != 3 {
		t.Errorf("htCountLines = %d, want 3", got)
	}

	if _, err := htCountLines(filepath.Join(dir, "missing.txt")); err == nil {
		t.Error("expected an error for a missing file")
	}
}

func TestHTCopyFilesWithoutChanges(t *testing.T) {
	dir := t.TempDir()
	src := filepath.Join(dir, "src.txt")
	dst := filepath.Join(dir, "dst.txt")
	content := "line one\nline two\n"
	if err := os.WriteFile(src, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	if err := HTCopyFilesWithoutChanges(dst, src); err != nil {
		t.Fatal(err)
	}

	got, err := os.ReadFile(dst)
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != content {
		t.Errorf("copied content = %q, want %q", string(got), content)
	}
}

func TestHTAreFilesEqual(t *testing.T) {
	dir := t.TempDir()
	first := filepath.Join(dir, "first.txt")
	second := filepath.Join(dir, "second.txt")
	if err := os.WriteFile(first, []byte("same"), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(second, []byte("same"), 0644); err != nil {
		t.Fatal(err)
	}

	equal, err := HTAreFilesEqual(first, second)
	if err != nil || !equal {
		t.Errorf("HTAreFilesEqual equal files = (%v, %v), want (true, nil)", equal, err)
	}

	if err := os.WriteFile(second, []byte("different"), 0644); err != nil {
		t.Fatal(err)
	}
	equal, err = HTAreFilesEqual(first, second)
	if err != nil || equal {
		t.Errorf("HTAreFilesEqual different files = (%v, %v), want (false, nil)", equal, err)
	}

	if _, err := HTAreFilesEqual(first, filepath.Join(dir, "missing")); err == nil {
		t.Error("expected an error for a missing file")
	}
}

func TestHTDateToString(t *testing.T) {
	full := &HTDate{DateType: "gregory", Year: "2024", Month: "2", Day: "29"}
	yearOnly := &HTDate{DateType: "gregory", Year: "2024", Month: "-1", Day: "-1"}
	negative := &HTDate{DateType: "gregory", Year: "-500", Month: "-1", Day: "-1"}

	cases := []struct {
		name string
		date *HTDate
		lang string
		abbr bool
		want string
	}{
		{name: "english full", date: full, lang: "en-US", want: "February 29, 2024"},
		{name: "english abbreviated", date: full, lang: "en-US", abbr: true, want: "Feb 29, 2024"},
		{name: "portuguese full", date: full, lang: "pt-BR", want: "29 de fevereiro de 2024"},
		{name: "spanish full", date: full, lang: "es-ES", want: "29 de febrero de 2024"},
		{name: "year only", date: yearOnly, lang: "en-US", want: "2024"},
		{name: "negative english", date: negative, lang: "en-US", want: "500 B.E.C."},
		{name: "negative portuguese", date: negative, lang: "pt-BR", want: "500 A.E.C."},
		{name: "nil", date: nil, lang: "en-US", want: ""},
		{name: "non gregorian", date: &HTDate{DateType: "julian", Year: "2024"}, lang: "en-US", want: ""},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := htDateToString(tc.date, tc.lang, tc.abbr); got != tc.want {
				t.Errorf("htDateToString = %q, want %q", got, tc.want)
			}
		})
	}
}

func TestHTConvertDateStringToHTDate(t *testing.T) {
	cases := []struct {
		in   string
		want HTDate
	}{
		{in: "2024", want: HTDate{DateType: "gregory", Year: "2024"}},
		{in: "2024-02", want: HTDate{DateType: "gregory", Year: "2024", Month: "02"}},
		{in: "2024-02-29", want: HTDate{DateType: "gregory", Year: "2024", Month: "02", Day: "29"}},
		{in: "", want: HTDate{}},
	}
	for _, tc := range cases {
		if got := htConvertDateStringToHTDate(tc.in); got != tc.want {
			t.Errorf("htConvertDateStringToHTDate(%q) = %+v, want %+v", tc.in, got, tc.want)
		}
	}
}

func TestHTCompareSources(t *testing.T) {
	first := &HTSourceElement{ID: "id", Citation: "citation", PublishDate: "2024-01-01", URL: "https://example.com"}
	sameIgnoringDate := &HTSourceElement{ID: "id", Citation: "citation", Date: "different", PublishDate: "2024-01-01", URL: "https://example.com"}
	if !htCompareSources(first, sameIgnoringDate) {
		t.Error("sources with the same identity fields should compare equal")
	}

	different := []*HTSourceElement{
		{ID: "other", Citation: "citation", PublishDate: "2024-01-01", URL: "https://example.com"},
		{ID: "id", Citation: "other", PublishDate: "2024-01-01", URL: "https://example.com"},
		{ID: "id", Citation: "citation", PublishDate: "2025-01-01", URL: "https://example.com"},
		{ID: "id", Citation: "citation", PublishDate: "2024-01-01", URL: "https://other.example.com"},
	}
	for _, candidate := range different {
		if htCompareSources(first, candidate) {
			t.Errorf("sources %+v should not compare equal", candidate)
		}
	}
}

func TestHTWriteAudioFile(t *testing.T) {
	dir := useTempSource(t)

	if err := htWriteAudioFile("sample", "en-US", "Hello..\n.\n"); err != nil {
		t.Fatal(err)
	}

	path := filepath.Join(dir, "audios", "sample_en-US.txt")
	got, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != "Hello.\n" {
		t.Errorf("audio content = %q, want %q", string(got), "Hello.\n")
	}
}

func TestHTWriteTmpFile(t *testing.T) {
	dir := useTempSource(t)
	if err := os.MkdirAll(filepath.Join(dir, "lang", "en-US"), 0755); err != nil {
		t.Fatal(err)
	}

	value := &HTText{Text: "Hello", Format: "html"}
	path, err := htWriteTmpFile("en-US", value)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(path, ".tmp") {
		t.Errorf("temporary file path = %q", path)
	}

	got, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	var decoded HTText
	if err := json.Unmarshal(got, &decoded); err != nil {
		t.Fatal(err)
	}
	if decoded.Text != "Hello" || decoded.Format != "html" {
		t.Errorf("decoded value = %+v", decoded)
	}
}

func TestHTWriteFamilyAndClassIndexFiles(t *testing.T) {
	dir := useTempSource(t)
	for _, lang := range []string{"en-US", "es-ES", "pt-BR"} {
		if err := os.MkdirAll(filepath.Join(dir, "lang", lang), 0755); err != nil {
			t.Fatal(err)
		}
	}

	family := &IdxFamily{Title: "Family", Contents: []IdxFamilyContent{{ID: "content"}}}
	path, err := htWriteFamilyIndexFile("en-US", family)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(path, ".tmp") {
		t.Errorf("family index path = %q", path)
	}

	class := &ClassIdx{Title: "Class", Content: []ClassContent{{ID: "content"}}}
	path, err = htWriteClassIndexFile("pt-BR", class)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(path, ".tmp") {
		t.Errorf("class index path = %q", path)
	}
}

func TestHTLoadKeywordsDirect(t *testing.T) {
	dir := useTempSource(t)
	if err := os.MkdirAll(filepath.Join(dir, "lang", "en-US"), 0755); err != nil {
		t.Fatal(err)
	}

	mathPayload, _ := json.Marshal(HTMathKeywordsFormat{Keywords: []string{"zero", "one", "two"}})
	if err := os.WriteFile(filepath.Join(dir, "lang", "en-US", "math_keywords.json"), mathPayload, 0644); err != nil {
		t.Fatal(err)
	}
	commonPayload, _ := json.Marshal(HTKeywordsFormat{Keywords: []string{"alpha", "beta"}})
	if err := os.WriteFile(filepath.Join(dir, "lang", "en-US", "common_keywords.json"), commonPayload, 0644); err != nil {
		t.Fatal(err)
	}

	got, err := htLoadKeywordsDirect("en-US", "math_keywords")
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 3 || got[2] != "two" {
		t.Errorf("math keywords = %v", got)
	}

	got, err = htLoadKeywordsDirect("en-US", "common_keywords")
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 2 || got[1] != "beta" {
		t.Errorf("common keywords = %v", got)
	}

	if _, err := htLoadKeywordsDirect("en-US", "missing"); err == nil {
		t.Error("expected an error for a missing keyword file")
	}
}

func TestHTLoadKeywordFile(t *testing.T) {
	dir := useTempSource(t)
	if err := os.MkdirAll(filepath.Join(dir, "lang", "pt-BR"), 0755); err != nil {
		t.Fatal(err)
	}

	commonPayload, _ := json.Marshal(HTKeywordsFormat{Keywords: []string{"um", "dois"}})
	mathPayload, _ := json.Marshal(HTMathKeywordsFormat{Keywords: []string{"zero", "um"}})
	if err := os.WriteFile(filepath.Join(dir, "lang", "pt-BR", "common_keywords.json"), commonPayload, 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "lang", "pt-BR", "math_keywords.json"), mathPayload, 0644); err != nil {
		t.Fatal(err)
	}

	oldCommon := commonKeywords
	oldMath := mathKeywords
	t.Cleanup(func() {
		commonKeywords = oldCommon
		mathKeywords = oldMath
	})

	if err := htLoadKeywordFile("common_keywords", "pt-BR"); err != nil {
		t.Fatal(err)
	}
	if len(commonKeywords) != 2 || commonKeywords[1] != "dois" {
		t.Errorf("common keywords = %v", commonKeywords)
	}

	if err := htLoadKeywordFile("math_keywords", "pt-BR"); err != nil {
		t.Fatal(err)
	}
	if len(mathKeywords) != 2 || mathKeywords[0] != "zero" {
		t.Errorf("math keywords = %v", mathKeywords)
	}
}

func TestHTChangeTag2Keywords(t *testing.T) {
	old := commonKeywords
	commonKeywords = make([]string, 160)
	commonKeywords[52] = "Common note"
	commonKeywords[69] = "Religious note"
	commonKeywords[84] = "Zoom"
	commonKeywords[85] = "Abya Yala"
	commonKeywords[112] = "Chart"
	commonKeywords[131] = "Age"
	commonKeywords[137] = "China"
	commonKeywords[139] = "Japan"
	t.Cleanup(func() { commonKeywords = old })

	text := `<span id="htZoomImageMsg"></span><span id="htAmericaAbyaYalaMsg"></span>` +
		`<span id="family_common_sn"></span><span id="htChartMsg"></span>` +
		`<span id="htAgeMsg"></span><p id="htChinaZhongguo"></p><p id="htJapanNipponNihonKoku"></p>`
	got := htChangeTag2Keywords(text)

	for _, want := range []string{"Zoom", "Abya Yala", "Common note", "Chart", "Age", "China", "Japan"} {
		if !strings.Contains(got, want) {
			t.Errorf("htChangeTag2Keywords output %q missing %q", got, want)
		}
	}
}

func TestHTPrepareQuestions(t *testing.T) {
	old := commonKeywords
	commonKeywords = make([]string, 160)
	commonKeywords[50] = "Questions"
	commonKeywords[134] = "Answer"
	t.Cleanup(func() { commonKeywords = old })

	questions := []HTExercise{
		{Question: "Is this a question?", YesNoAnswer: "Yes", AdditionalInfo: "Yes, it is."},
	}
	got := htPrepareQuestions(questions, "en-US")

	for _, want := range []string{"Questions.", "1. ", "Is this a question?", "Answers.", "Answer 1.", "Yes, it is."} {
		if !strings.Contains(got, want) {
			t.Errorf("htPrepareQuestions output %q missing %q", got, want)
		}
	}
}

func TestHTTextCommonContent(t *testing.T) {
	idx := &HTCommonContent{
		HTMLValue: []HTText{{Text: "<p>Common text</p>", Format: "html"}},
	}
	if got := htTextCommonContent(idx, "en-US"); !strings.Contains(got, "Common text") {
		t.Errorf("HTML common content = %q", got)
	}

	idx = &HTCommonContent{
		Value: []IdxFamilyValue{{Name: "Family", Desc: "Description"}},
	}
	if got := htTextCommonContent(idx, "en-US"); !strings.Contains(got, "Family") || !strings.Contains(got, "Description") {
		t.Errorf("value common content = %q", got)
	}

	if got := htTextCommonContent(&HTCommonContent{}, "en-US"); got != "" {
		t.Errorf("empty common content = %q, want empty", got)
	}
}

func TestHTLoopThroughContentFiles(t *testing.T) {
	content := []ClassTemplateContent{
		{Text: []HTText{{Text: "<p>First</p>", Format: "html"}}},
	}
	got := htLoopThroughContentFiles("Title", content, "en-US")
	if !strings.Contains(got, "Title.") || !strings.Contains(got, "First") {
		t.Errorf("htLoopThroughContentFiles = %q", got)
	}
}

func TestHTCreateDirectory(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "created")
	htCreateDirectory(path)
	htCreateDirectory(path)
	if stat, err := os.Stat(path); err != nil || !stat.IsDir() {
		t.Errorf("directory was not created: %v", err)
	}
}

func TestHTDirectoryExists(t *testing.T) {
	dir := t.TempDir()
	if !htDirectoryExists(dir) {
		t.Error("existing directory was not found")
	}
	if htDirectoryExists(filepath.Join(dir, "missing")) {
		t.Error("missing directory was reported as existing")
	}
	file := filepath.Join(dir, "file.txt")
	if err := os.WriteFile(file, []byte("x"), 0644); err != nil {
		t.Fatal(err)
	}
	if htDirectoryExists(file) {
		t.Error("file was reported as a directory")
	}
}

func TestHTFormatNotExpected(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Error("expected panic for an unsupported format")
		}
	}()
	htFormatNotExpected("xml")
}

func TestHTAddNewJSToDirectory(t *testing.T) {
	dir := useTempSource(t)
	if err := os.MkdirAll(filepath.Join(dir, "src", "js"), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(dir, "js"), 0755); err != nil {
		t.Fatal(err)
	}
	content := "function example() {}\n"
	if err := os.WriteFile(filepath.Join(dir, "src", "js", "ht_classes.js"), []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	htAddNewJSToDirectory("new-class")

	got, err := os.ReadFile(filepath.Join(dir, "js", "new-class.js"))
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != content {
		t.Errorf("copied JS = %q, want %q", string(got), content)
	}
}

func TestHTFillSourceMap(t *testing.T) {
	oldSourceMap := sourceMap
	oldAllSourceMap := allSourceMap
	t.Cleanup(func() {
		sourceMap = oldSourceMap
		allSourceMap = oldAllSourceMap
	})

	sourceMap = make(map[string]HTSourceElement)
	allSourceMap = make(map[string]HTSourceElement)

	first := HTSourceElement{ID: testUUID1, Citation: "First", PublishDate: "2024-01-01"}
	second := HTSourceElement{ID: testUUID2, Citation: "Second", PublishDate: "2025-01-01"}
	htFillSourceMap([]HTSourceElement{first, second}, "file")

	if sourceMap[testUUID1].Citation != "First" || sourceMap[testUUID2].Citation != "Second" {
		t.Errorf("source map = %v", sourceMap)
	}
	if len(allSourceMap) != 2 {
		t.Errorf("all source map = %v", allSourceMap)
	}

	file := &HTSourceFile{
		PrimarySources:     []HTSourceElement{{ID: testUUID3, Citation: "Primary"}},
		ReferencesSources:  []HTSourceElement{{ID: "ref", Citation: "Reference"}},
		ReligiousSources:   []HTSourceElement{{ID: "religious", Citation: "Religious"}},
		SocialMediaSources: []HTSourceElement{{ID: "social", Citation: "Social"}},
	}
	htFillSourcesMap(file, "file")
	for _, id := range []string{testUUID3, "ref", "religious", "social"} {
		if _, ok := sourceMap[id]; !ok {
			t.Errorf("source map missing %q", id)
		}
	}
}

func TestHTUpdateSourcesData(t *testing.T) {
	oldSourceMap := sourceMap
	t.Cleanup(func() { sourceMap = oldSourceMap })

	sourceMap = map[string]HTSourceElement{
		testUUID1: {ID: testUUID1, PublishDate: "2024-02-29"},
	}

	sources := []HTSource{
		{UUID: testUUID1},
		{UUID: testUUID2, Date: HTDate{DateType: "gregory", Year: "1999", Month: "-1", Day: "-1"}},
	}
	htUpdateSourcesData(sources)

	want := HTDate{DateType: "gregory", Year: "2024", Month: "02", Day: "29"}
	if sources[0].Date != want {
		t.Errorf("updated date = %+v, want %+v", sources[0].Date, want)
	}
	if sources[1].Date.Year != "1999" {
		t.Errorf("unmapped source date was changed: %+v", sources[1].Date)
	}

	htUpdateSourcesData(nil)
}
