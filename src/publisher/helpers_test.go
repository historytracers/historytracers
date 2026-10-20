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

const (
	testUUID1 = "11111111-1111-4111-8111-111111111111"
	testUUID2 = "22222222-2222-4222-8222-222222222222"
	testUUID3 = "33333333-3333-4333-8333-333333333333"
)

func TestNormalizeSlashes(t *testing.T) {
	cases := map[string]string{
		`a\b\c`:   "a/b/c",
		"a/b/c":   "a/b/c",
		`a\b/c\d`: "a/b/c/d",
		"":        "",
	}
	for in, want := range cases {
		if got := normalizeSlashes(in); got != want {
			t.Errorf("normalizeSlashes(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestHTIsWithinDir(t *testing.T) {
	cases := []struct {
		dir, path string
		want      bool
	}{
		{dir: "/a/b", path: "/a/b", want: true},
		{dir: "/a/b", path: "/a/b/c", want: true},
		{dir: "/a/b", path: "/a/bc", want: false},
		{dir: "/a/b/", path: "/a/b/c", want: true},
		{dir: "/a/b/", path: "/a/bc", want: false},
	}
	for _, tc := range cases {
		if got := htIsWithinDir(tc.dir, tc.path); got != tc.want {
			t.Errorf("htIsWithinDir(%q, %q) = %v, want %v", tc.dir, tc.path, got, tc.want)
		}
	}
}

func TestCollectSourceUUIDsFlat(t *testing.T) {
	obj := map[string]interface{}{
		"source": []interface{}{
			map[string]interface{}{"uuid": testUUID1},
		},
		"content": []interface{}{
			map[string]interface{}{
				"source_menu": []interface{}{
					map[string]interface{}{"uuid": testUUID2},
				},
			},
		},
	}

	got := collectSourceUUIDsFlat(obj)
	counts := make(map[string]int)
	for _, id := range got {
		counts[id]++
	}
	if counts[testUUID1] != 1 || counts[testUUID2] != 1 {
		t.Errorf("collectSourceUUIDsFlat = %v", got)
	}
}

func TestCollectAllSourceUUIDs(t *testing.T) {
	oldPlaceholders := placeholderSourceUUIDs
	placeholderSourceUUIDs = map[string]string{"htChinaZhongguo": testUUID3}
	t.Cleanup(func() { placeholderSourceUUIDs = oldPlaceholders })

	obj := map[string]interface{}{
		"source": []interface{}{map[string]interface{}{"uuid": testUUID1}},
		"text": []interface{}{
			map[string]interface{}{
				"text": "See htFillReferenceSource('" + testUUID2 + "') and <p id=\"htChinaZhongguo\"></p>",
			},
		},
	}

	got := collectAllSourceUUIDs(obj)
	counts := make(map[string]int)
	for _, id := range got {
		counts[id]++
	}
	for _, want := range []string{testUUID1, testUUID2, testUUID3} {
		if counts[want] != 1 {
			t.Errorf("collectAllSourceUUIDs = %v, missing unique %q", got, want)
		}
	}
}

func TestFindMismatches(t *testing.T) {
	allSources := map[string]srcEntry{
		testUUID1: {Element: HTSourceElement{ID: testUUID1, PublishDate: "2024-01-01"}},
	}

	obj := map[string]interface{}{
		"source": []interface{}{
			map[string]interface{}{
				"uuid":      testUUID1,
				"date_time": map[string]interface{}{"year": "2023"},
			},
			map[string]interface{}{
				"uuid":      testUUID2,
				"date_time": map[string]interface{}{"year": "2020"},
			},
			map[string]interface{}{
				"uuid":      testUUID3,
				"date_time": map[string]interface{}{"year": ""},
			},
		},
	}

	fixes := findMismatches(obj, allSources)
	if len(fixes) != 2 {
		t.Fatalf("findMismatches returned %d fixes, want 2: %+v", len(fixes), fixes)
	}

	byUUID := make(map[string]srcFix)
	for _, fix := range fixes {
		byUUID[fix.srcUUID] = fix
	}
	if got := byUUID[testUUID1]; got.fileYear != "2023" || got.fixedTo != "2024" {
		t.Errorf("mismatch fix = %+v, want 2023 -> 2024", got)
	}
	if got := byUUID[testUUID2]; got.fileYear != "2020" || got.fixedTo != "(NOT-FOUND)" {
		t.Errorf("missing source fix = %+v, want (NOT-FOUND)", got)
	}
}

func TestHTFindContentFilePath(t *testing.T) {
	dir := useTempSource(t)
	if err := os.MkdirAll(filepath.Join(dir, "lang", "en-US"), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(dir, "common", "src", "smartphone", "pt-BR"), 0755); err != nil {
		t.Fatal(err)
	}
	langPath := filepath.Join(dir, "lang", "en-US", testUUID1+".json")
	smartPath := filepath.Join(dir, "common", "src", "smartphone", "pt-BR", testUUID2+".json")
	if err := os.WriteFile(langPath, []byte("{}"), 0644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(smartPath, []byte("{}"), 0644); err != nil {
		t.Fatal(err)
	}

	if got := htFindContentFilePath("en-US", testUUID1); got != langPath {
		t.Errorf("lang path = %q, want %q", got, langPath)
	}
	if got := htFindContentFilePath("pt-BR", testUUID2); got != smartPath {
		t.Errorf("smartphone path = %q, want %q", got, smartPath)
	}
	if got := htFindContentFilePath("en-US", testUUID3); got != "" {
		t.Errorf("missing path = %q, want empty", got)
	}
}

func TestIsExceptedUUID(t *testing.T) {
	if !isExceptedUUID("052e06b9-f10c-4e76-896d-9f0e68f07506") {
		t.Error("known exception was not recognized")
	}
	if isExceptedUUID(testUUID1) {
		t.Error("unexpected exception was recognized")
	}
}

func TestSortStrings(t *testing.T) {
	values := []string{"c", "a", "b"}
	sortStrings(values)
	want := []string{"a", "b", "c"}
	for i := range want {
		if values[i] != want[i] {
			t.Fatalf("sortStrings = %v, want %v", values, want)
		}
	}
}

func TestHTTestSingleUUID(t *testing.T) {
	dir := useTempSource(t)
	for _, lang := range htLangPaths {
		if err := os.MkdirAll(filepath.Join(dir, "lang", lang), 0755); err != nil {
			t.Fatal(err)
		}
	}

	same := "{\"title\":\"same\"}\n"
	for _, lang := range htLangPaths {
		path := filepath.Join(dir, "lang", lang, testUUID1+".json")
		if err := os.WriteFile(path, []byte(same), 0644); err != nil {
			t.Fatal(err)
		}
	}
	if out := htTestSingleUUID(testUUID1); out.failReason != "" {
		t.Errorf("matching files failed: %+v", out)
	}

	if err := os.WriteFile(filepath.Join(dir, "lang", "pt-BR", testUUID1+".json"), []byte("{\n\"title\":\"same\"\n}\n"), 0644); err != nil {
		t.Fatal(err)
	}
	if out := htTestSingleUUID(testUUID1); out.failReason != "LINE-MISMATCH" {
		t.Errorf("mismatched line counts = %+v, want LINE-MISMATCH", out)
	}

	if out := htTestSingleUUID(testUUID2); out.failReason != "MISSING-FILE" {
		t.Errorf("missing file = %+v, want MISSING-FILE", out)
	}
}

func TestHTParseCSS(t *testing.T) {
	cases := map[string]bool{
		"fa_solid.css": true,
		"ht_math.css":  false,
		"README.md":    false,
	}
	for name, want := range cases {
		if got := htParseCSS(name); got != want {
			t.Errorf("htParseCSS(%q) = %v, want %v", name, got, want)
		}
	}
}

func TestHTParseJSON(t *testing.T) {
	cases := map[string]bool{
		"README-en-US.json": false,
		"README.json":       false,
		"smGame":            false,
		"content.json":      true,
		"content.txt":       false,
	}
	for name, want := range cases {
		if got := htParseJSON(name); got != want {
			t.Errorf("htParseJSON(%q) = %v, want %v", name, got, want)
		}
	}
}

func TestParseGalleryReadme(t *testing.T) {
	dir := useTempSource(t)
	if err := os.MkdirAll(filepath.Join(dir, "images"), 0755); err != nil {
		t.Fatal(err)
	}
	readme := "# Images\n\n" +
		"- `GuatemalaAntropologia`: [Guatemala Anthropology](https://example.com)\n" +
		"- `BritishMuseum`: [British Museum objects](https://example.com)\n"
	if err := os.WriteFile(filepath.Join(dir, "images", "README.md"), []byte(readme), 0644); err != nil {
		t.Fatal(err)
	}

	values, err := parseGalleryReadme("en-US")
	if err != nil {
		t.Fatal(err)
	}
	if len(values) != 2 {
		t.Fatalf("parseGalleryReadme returned %d entries, want 2", len(values))
	}
	// Entries are sorted by display name: British Museum before Guatemala Anthropology.
	if values[0].Name != "British Museum" || values[0].Desc != "British Museum objects" {
		t.Errorf("first entry = %+v", values[0])
	}
	if values[1].Name != "Guatemala Antropologia" || values[1].Desc != "Guatemala Anthropology" {
		t.Errorf("second entry = %+v", values[1])
	}

	if _, err := parseGalleryReadme("pt-BR"); err == nil {
		t.Error("expected an error for a missing localized README")
	}
}

func TestHTXrefGEDCOM(t *testing.T) {
	if got := htXrefGEDCOM("P", testUUID1); got != "P11111111-1111-4111" {
		t.Errorf("htXrefGEDCOM = %q", got)
	}
}

func TestHTXrefGEDCOMPanicsOnShortID(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Error("expected panic for a short id")
		}
	}()
	htXrefGEDCOM("P", "short")
}

func TestHTSelectSourceNote(t *testing.T) {
	cases := []struct {
		lang string
		src  int
		want string
	}{
		{lang: "en-US", src: 0, want: "According to Primary Sources."},
		{lang: "pt-BR", src: 0, want: "Confirmado por fontes primárias."},
		{lang: "es-ES", src: 0, want: "De acuerdo con fuentes primarias."},
		{lang: "en-US", src: 1, want: "No primary source was found to confirm this."},
		{lang: "pt-BR", src: 1, want: "Não foram encontradas fontes primárias."},
		{lang: "es-ES", src: 1, want: "No se encontraron fuentes primarias."},
	}
	for _, tc := range cases {
		if got := htSelectSourceNote(tc.lang, tc.src); got != tc.want {
			t.Errorf("htSelectSourceNote(%q, %d) = %q, want %q", tc.lang, tc.src, got, tc.want)
		}
	}
}

func TestHTSelectCSVSource(t *testing.T) {
	old := sourceMap
	sourceMap = map[string]HTSourceElement{
		testUUID1: {ID: testUUID1, Citation: "Primary citation", URL: "https://example.com"},
		testUUID2: {ID: testUUID2, Citation: "Reference citation"},
	}
	t.Cleanup(func() { sourceMap = old })

	primary := []HTSource{
		{Type: 1, UUID: testUUID2, Text: "Reference text"},
		{Type: 0, UUID: testUUID1, Text: "Primary text"},
	}
	got, kind := htSelectCSVSource(primary)
	if kind != 0 || got != "Primary citation, (https://example.com)" {
		t.Errorf("primary source = (%q, %d)", got, kind)
	}

	reference := []HTSource{{Type: 1, UUID: testUUID2, Text: "Reference text"}}
	got, kind = htSelectCSVSource(reference)
	if kind != 1 || got != "Reference citation" {
		t.Errorf("reference source = (%q, %d)", got, kind)
	}

	unmapped := []HTSource{{Type: 1, UUID: testUUID3, Text: "Plain text"}}
	got, kind = htSelectCSVSource(unmapped)
	if kind != 1 || got != "Plain text" {
		t.Errorf("unmapped source = (%q, %d)", got, kind)
	}

	got, kind = htSelectCSVSource(nil)
	if kind != -1 || got != "" {
		t.Errorf("empty source = (%q, %d)", got, kind)
	}
}

func TestHTSelectSourceFromText(t *testing.T) {
	got, kind := htSelectSourceFromText([]HTText{
		{Source: nil},
		{Source: []HTSource{{Type: 1, UUID: testUUID1, Text: "Source text"}}},
	})
	if kind != 1 || got != "Source text" {
		t.Errorf("htSelectSourceFromText = (%q, %d)", got, kind)
	}

	got, kind = htSelectSourceFromText(nil)
	if kind != -1 || got != "" {
		t.Errorf("empty texts = (%q, %d)", got, kind)
	}
}

func TestInitPlaceholderSourceUUIDs(t *testing.T) {
	dir := useTempSource(t)
	if err := os.MkdirAll(filepath.Join(dir, "lang", "en-US"), 0755); err != nil {
		t.Fatal(err)
	}

	keywords := make([]string, 140)
	keywords[137] = "China: htFillReferenceSource('" + testUUID1 + "')"
	keywordPayload, _ := json.Marshal(HTKeywordsFormat{Keywords: keywords})
	if err := os.WriteFile(filepath.Join(dir, "lang", "en-US", "common_keywords.json"), keywordPayload, 0644); err != nil {
		t.Fatal(err)
	}

	old := placeholderSourceUUIDs
	placeholderSourceUUIDs = nil
	t.Cleanup(func() { placeholderSourceUUIDs = old })

	initPlaceholderSourceUUIDs()
	if got := placeholderSourceUUIDs["htChinaZhongguo"]; got != testUUID1 {
		t.Errorf("placeholder source = %q, want %q", got, testUUID1)
	}
}

func TestHTLoadDefaultSourcesFromTemplate(t *testing.T) {
	dir := useTempSource(t)
	if err := os.MkdirAll(filepath.Join(dir, "src", "json"), 0755); err != nil {
		t.Fatal(err)
	}

	sourceFile := HTSourceFile{
		PrimarySources: []HTSourceElement{
			{ID: testUUID1, Citation: "Primary"},
			{ID: "Unique identifier", Citation: "Ignored"},
		},
		ReferencesSources: []HTSourceElement{{ID: testUUID2, Citation: "Reference"}},
	}
	payload, _ := json.Marshal(sourceFile)
	if err := os.WriteFile(filepath.Join(dir, "src", "json", "sources_template.json"), payload, 0644); err != nil {
		t.Fatal(err)
	}

	got := htLoadDefaultSourcesFromTemplate()
	if len(got) != 2 {
		t.Fatalf("sources = %v, want 2 entries", got)
	}
	if got[testUUID1].Category != "primary_sources" || got[testUUID2].Category != "reference_sources" {
		t.Errorf("source categories = %+v", got)
	}

	useTempSource(t)
	if got := htLoadDefaultSourcesFromTemplate(); len(got) != 0 {
		t.Errorf("missing template = %v, want empty", got)
	}
}

func TestHTFillSourceMapForCheck(t *testing.T) {
	dst := make(map[string]srcEntry)
	fileIDs := make(map[string]bool)
	src := &HTSourceFile{
		PrimarySources:     []HTSourceElement{{ID: testUUID1}},
		ReferencesSources:  []HTSourceElement{{ID: testUUID2}},
		ReligiousSources:   []HTSourceElement{{ID: testUUID3}},
		SocialMediaSources: []HTSourceElement{{ID: "social"}},
	}

	htFillSourceMapForCheck(src, dst, fileIDs)
	if len(dst) != 4 || len(fileIDs) != 4 {
		t.Errorf("source map = %v, file ids = %v", dst, fileIDs)
	}
	if dst[testUUID1].Category != "primary_sources" || dst["social"].Category != "social_media_sources" {
		t.Errorf("categories = %+v", dst)
	}

	// Existing entries are preserved.
	existing := map[string]srcEntry{testUUID1: {Category: "existing"}}
	htFillSourceMapForCheck(src, existing, fileIDs)
	if existing[testUUID1].Category != "existing" {
		t.Errorf("existing entry was overwritten: %+v", existing[testUUID1])
	}
}

func TestFixDatesSurgically(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "content.json")
	content := `{
   "content": [
      {
         "source": [
            {
               "type": 1,
               "uuid": "` + testUUID1 + `",
               "date_time": {
                  "type": "gregory",
                  "year": "2023"
               }
            }
         ]
      }
   ]
}`
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}

	fixes := []srcFix{{srcUUID: testUUID1, fileYear: "2023", fixedTo: "2024"}}
	if err := fixDatesSurgically(path, fixes); err != nil {
		t.Fatal(err)
	}

	updated, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(updated), `"year": "2024"`) {
		t.Errorf("year was not fixed: %s", string(updated))
	}
	if strings.Contains(string(updated), `"year": "2023"`) {
		t.Errorf("old year remains: %s", string(updated))
	}
}

func TestHTValidateSMGameIDs(t *testing.T) {
	dir := t.TempDir()

	valid := filepath.Join(dir, "valid.json")
	if err := os.WriteFile(valid, []byte(`{"type":"sm_game","content":[{"id":"`+testUUID1+`"}]}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := htValidateSMGameIDs(valid); err != nil {
		t.Errorf("valid SM game rejected: %v", err)
	}

	invalid := filepath.Join(dir, "invalid.json")
	if err := os.WriteFile(invalid, []byte(`{"type":"sm_game","content":[{"id":"not-a-uuid"}]}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := htValidateSMGameIDs(invalid); err == nil {
		t.Error("invalid SM game id was accepted")
	}

	notSM := filepath.Join(dir, "notsm.json")
	if err := os.WriteFile(notSM, []byte(`{"type":"class","content":[{"id":"not-a-uuid"}]}`), 0644); err != nil {
		t.Fatal(err)
	}
	if err := htValidateSMGameIDs(notSM); err != nil {
		t.Errorf("non-SM file should be ignored: %v", err)
	}
}
