// SPDX-License-Identifier: GPL-3.0-or-later
package main

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"
)

func TestBuildPageURL(t *testing.T) {
	tests := []struct {
		name     string
		addr     string
		class    string
		lang     string
		cal      string
		font     string
		want     string
		wantHost string
	}{
		{
			name: "no params",
			addr: "127.0.0.1:8080",
			want: "http://127.0.0.1:8080/index.html",
		},
		{
			name: "lang only",
			addr: "127.0.0.1:12345",
			lang: "pt-BR",
			want: "http://127.0.0.1:12345/index.html?lang=pt-BR",
		},
		{
			name:  "class only",
			addr:  "127.0.0.1:9999",
			class: "abc-123",
			want:  "http://127.0.0.1:9999/index.html?page=class_content&arg=abc-123",
		},
		{
			name:  "class and lang",
			addr:  "127.0.0.1:54321",
			class: "d290f1ee-6c54-4b01-90e6-d701748f0851",
			lang:  "es-ES",
			want:  "http://127.0.0.1:54321/index.html?page=class_content&arg=d290f1ee-6c54-4b01-90e6-d701748f0851&lang=es-ES",
		},
		{
			name:  "class with special chars",
			addr:  "127.0.0.1:7777",
			class: "a b/c",
			want:  "http://127.0.0.1:7777/index.html?page=class_content&arg=a+b%2Fc",
		},
		{
			name: "cal only",
			addr: "127.0.0.1:8080",
			cal:  "hebrew",
			want: "http://127.0.0.1:8080/index.html?cal=hebrew",
		},
		{
			name:  "class, lang, cal",
			addr:  "127.0.0.1:54321",
			class: "d290f1ee-6c54-4b01-90e6-d701748f0851",
			lang:  "es-ES",
			cal:   "julian",
			want:  "http://127.0.0.1:54321/index.html?page=class_content&arg=d290f1ee-6c54-4b01-90e6-d701748f0851&lang=es-ES&cal=julian",
		},
		{
			name: "font only",
			addr: "127.0.0.1:8080",
			font: "large",
			want: "http://127.0.0.1:8080/index.html?font=large",
		},
		{
			name:  "class, lang, cal, font",
			addr:  "127.0.0.1:54321",
			class: "d290f1ee-6c54-4b01-90e6-d701748f0851",
			lang:  "es-ES",
			cal:   "julian",
			font:  "small",
			want:  "http://127.0.0.1:54321/index.html?page=class_content&arg=d290f1ee-6c54-4b01-90e6-d701748f0851&lang=es-ES&cal=julian&font=small",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := buildPageURL(tt.addr, tt.class, tt.lang, tt.cal, tt.font)
			if got != tt.want {
				t.Errorf("buildPageURL() = %q, want %q", got, tt.want)
			}
			if !strings.HasPrefix(got, "http://"+tt.addr+"/") {
				t.Errorf("buildPageURL() host part mismatch: %q does not start with %q", got, "http://"+tt.addr+"/")
			}
		})
	}
}

func TestBuildPageURLEmptyAddr(t *testing.T) {
	got := buildPageURL("", "id", "", "", "")
	if !strings.HasPrefix(got, "http://") {
		t.Errorf("expected http prefix, got %q", got)
	}
	if !strings.Contains(got, "index.html") {
		t.Errorf("expected index.html in URL, got %q", got)
	}
}

func TestBuildPageURLOrder(t *testing.T) {
	got := buildPageURL("127.0.0.1:1", "myclass", "en", "", "")
	parts := strings.SplitN(got, "?", 2)
	if len(parts) != 2 {
		t.Fatalf("expected query string, got %q", got)
	}
	query := parts[1]
	params := strings.Split(query, "&")
	if len(params) < 2 {
		t.Fatalf("expected at least 2 params, got %d: %v", len(params), params)
	}
	if params[0] != "page=class_content" {
		t.Errorf("first param should be page=class_content, got %q", params[0])
	}
	if params[1] != "arg=myclass" {
		t.Errorf("second param should be arg=myclass, got %q", params[1])
	}
	if len(params) == 3 && params[2] != "lang=en" {
		t.Errorf("third param should be lang=en, got %q", params[2])
	}
}

func TestResolveAddrFixedPort(t *testing.T) {
	got := resolveAddr(8080)
	want := "127.0.0.1:8080"
	if got != want {
		t.Errorf("resolveAddr(8080) = %q, want %q", got, want)
	}
}

func TestResolveAddrPortZero(t *testing.T) {
	got := resolveAddr(0)
	if got == "" {
		t.Fatal("resolveAddr(0) returned empty string")
	}
	if !strings.HasPrefix(got, "127.0.0.1:") {
		t.Errorf("resolveAddr(0) = %q, want 127.0.0.1:<port>", got)
	}
	portStr := strings.TrimPrefix(got, "127.0.0.1:")
	if portStr == "" {
		t.Errorf("resolveAddr(0) missing port number: %q", got)
	}
}

func TestStatusWriter(t *testing.T) {
	w := httptest.NewRecorder()
	sw := &statusWriter{ResponseWriter: w, status: 0}
	if sw.status != 0 {
		t.Errorf("initial status = %d, want 0", sw.status)
	}
	sw.WriteHeader(http.StatusNotFound)
	if sw.status != http.StatusNotFound {
		t.Errorf("after WriteHeader(404) status = %d, want 404", sw.status)
	}
	// net/http honours the first WriteHeader call; the recorder must do
	// the same so the access log shows the code the client saw.
	sw.WriteHeader(http.StatusInternalServerError)
	if sw.status != http.StatusNotFound {
		t.Errorf("after WriteHeader(500) status = %d, want 404 (first wins)", sw.status)
	}
	if w.Code != http.StatusNotFound {
		t.Errorf("underlying recorder code = %d, want 404 (first wins)", w.Code)
	}
}

func TestLogMiddleware(t *testing.T) {
	var buf bytes.Buffer
	accessLog = log.New(&buf, "", 0)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	req := httptest.NewRequest("GET", "/test-path", nil)
	rec := httptest.NewRecorder()

	logMiddleware(handler).ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusOK)
	}
	if rec.Body.String() != "ok" {
		t.Errorf("body = %q, want %q", rec.Body.String(), "ok")
	}

	logLine := strings.TrimSpace(buf.String())
	if !strings.Contains(logLine, "GET") {
		t.Errorf("log missing GET: %q", logLine)
	}
	if !strings.Contains(logLine, "/test-path") {
		t.Errorf("log missing path: %q", logLine)
	}
	if !strings.Contains(logLine, "200") {
		t.Errorf("log missing status: %q", logLine)
	}
}

func TestBuildPageURLLangAlone(t *testing.T) {
	got := buildPageURL("127.0.0.1:9999", "", "es-ES", "", "")
	if !strings.HasSuffix(got, "lang=es-ES") {
		t.Errorf("expected lang param, got %q", got)
	}
}

func TestCacheControlMiddleware(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	tests := []struct {
		path string
		want string
	}{
		{"/", "no-cache"},
		{"/index.html", "no-cache"},
		{"/js/ht_chart.js", "no-cache"},
		{"/css/ht_math.css", "no-cache"},
		{"/lang/en-US/abc.json", "no-cache"},
		{"/index.md", "no-cache"},
		{"/sitemap.xml", "no-cache"},
		{"/llms.txt", "no-cache"},
		{"/images/photo.jpg", ""},
		{"/audios/track.ogg", ""},
		{"/webfonts/fa-solid-900.woff2", ""},
	}
	for _, tt := range tests {
		req := httptest.NewRequest("GET", tt.path, nil)
		rec := httptest.NewRecorder()
		cacheControlMiddleware(handler).ServeHTTP(rec, req)
		if got := rec.Header().Get("Cache-Control"); got != tt.want {
			t.Errorf("%s: Cache-Control = %q, want %q", tt.path, got, tt.want)
		}
	}
}

func TestCacheControlMiddlewareFileServerRoot(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "index.html"), []byte("ok"), 0o644); err != nil {
		t.Fatal(err)
	}
	srv := httptest.NewServer(cacheControlMiddleware(http.FileServer(http.Dir(dir))))
	defer srv.Close()

	resp, err := srv.Client().Get(srv.URL + "/index.html")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	if got, want := resp.Request.URL.Path, "/"; got != want {
		t.Fatalf("final request path = %q, want %q (redirect not followed)", got, want)
	}
	if got, want := resp.Header.Get("Cache-Control"), "no-cache"; got != want {
		t.Errorf("Cache-Control after redirect = %q, want %q", got, want)
	}
}

func TestAddContentVersion(t *testing.T) {
	tests := []struct {
		name    string
		pageURL string
		version string
		want    string
	}{
		{"no query", "http://127.0.0.1:1/index.html", "abc123", "http://127.0.0.1:1/index.html?v=abc123"},
		{"with query", "http://127.0.0.1:1/index.html?page=class_content", "abc123", "http://127.0.0.1:1/index.html?page=class_content&v=abc123"},
		{"with existing version", "http://127.0.0.1:1/index.html?v=old&page=class_content", "abc123", "http://127.0.0.1:1/index.html?page=class_content&v=abc123"},
		{"with fragment", "http://127.0.0.1:1/index.html#section", "abc123", "http://127.0.0.1:1/index.html?v=abc123#section"},
		{"with query and fragment", "http://127.0.0.1:1/index.html?page=class_content&lang=en#section", "abc123", "http://127.0.0.1:1/index.html?lang=en&page=class_content&v=abc123#section"},
		{"empty version keeps URL", "http://127.0.0.1:1/index.html", "", "http://127.0.0.1:1/index.html"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := addContentVersion(tt.pageURL, tt.version); got != tt.want {
				t.Errorf("addContentVersion(%q, %q) = %q, want %q", tt.pageURL, tt.version, got, tt.want)
			}
		})
	}
}

func TestContentVersionTracksIndex(t *testing.T) {
	dir := t.TempDir()
	index := filepath.Join(dir, "index.html")

	if got := contentVersion(dir); got != "" {
		t.Errorf("contentVersion(missing) = %q, want empty", got)
	}
	if got := contentVersion(""); got != "" {
		t.Errorf("contentVersion(\"\") = %q, want empty", got)
	}

	if err := os.WriteFile(index, []byte("build one"), 0644); err != nil {
		t.Fatal(err)
	}
	first := contentVersion(dir)
	if first == "" {
		t.Fatal("contentVersion returned empty for existing index.html")
	}
	if len(first) != 12 {
		t.Errorf("contentVersion length = %d, want 12", len(first))
	}

	if err := os.WriteFile(index, []byte("build two"), 0644); err != nil {
		t.Fatal(err)
	}
	second := contentVersion(dir)
	if second == first {
		t.Errorf("contentVersion did not change after index.html changed (%q)", first)
	}
}

func TestMetricsHandler(t *testing.T) {
	// Record a few metric entries to populate counters
	metricsRecord("GET", "/index.html", 200, 50*time.Millisecond, 0, 2048)
	metricsRecord("GET", "/index.html?page=main", 200, 30*time.Millisecond, 0, 1024)
	metricsRecord("POST", "/api/history/add", 204, 10*time.Millisecond, 256, 0)
	metricsRecord("GET", "/nonexistent", 404, 5*time.Millisecond, 0, 128)

	req := httptest.NewRequest("GET", "/metrics", nil)
	rec := httptest.NewRecorder()
	metricsHandler(rec, req)

	body := rec.Body.String()
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	checks := []string{
		"historytracers_uptime_seconds",
		`historytracers_http_requests_total{method="GET",status_class="2xx"`,
		`historytracers_http_requests_total{method="POST",status_class="2xx"`,
		`historytracers_http_requests_total{method="GET",status_class="4xx"`,
		"historytracers_http_request_duration_seconds_bucket{le=",
		"historytracers_http_requests_in_flight",
		`historytracers_http_errors_total{method="GET",status_class="4xx"`,
		`historytracers_http_requests_by_path{path="/index.html"`,
		`historytracers_http_requests_by_path{path="/nonexistent"`,
		"historytracers_http_request_size_bytes",
		"historytracers_http_response_size_bytes",
		"historytracers_http_request_duration_seconds_sum",
	}
	for _, c := range checks {
		if !strings.Contains(body, c) {
			t.Errorf("expected metrics output to contain %q", c)
		}
	}

	// Verify counts — the output includes a my_name label
	if !strings.Contains(body, `status_class="2xx"`+`,my_name="empty"} 2`) {
		t.Errorf("expected 2 GET 2xx requests, got:\n%s", body)
	}
}

func init() {
	// Reset metrics between tests
	metricsMu.Lock()
	metricsCounts = map[string]int64{}
	metricsErrors = map[string]int64{}
	metricsDurationCounts = map[string]int64{}
	metricsPathCounts = map[string]int64{}
	metricsReqBytesTotal = 0
	metricsResBytesTotal = 0
	metricsDurationSumNs = 0
	metricsMu.Unlock()
}

func TestViewerWindowOpenOverride(t *testing.T) {
	js := addressBarJS
	if !strings.Contains(js, "isPrintWindow") {
		t.Errorf("expected isPrintWindow check in addressBarJS")
	}
	// Regression: window.open shim should handle print preview and normal tabs
	if !strings.Contains(js, "openTab") {
		t.Errorf("expected openTab in window.open override")
	}
	// Check that print preview handles _closed guard
	if !strings.Contains(js, "_closed") {
		t.Errorf("expected _closed guard in print preview")
	}
}

func TestViewerPrintWindowNavigable(t *testing.T) {
	// Regression for viewer print: window.open('about:blank') may return shim without location
	data, err := os.ReadFile("../../src/js/ht_common.js")
	if err != nil {
		t.Fatalf("failed to read ht_common.js: %v", err)
	}
	content := string(data)
	if !strings.Contains(content, "typeof printWindow.location") {
		t.Errorf("expected location check for printWindow in ht_common.js")
	}
	if !strings.Contains(content, "printWindow.close()") {
		t.Errorf("expected close handling for non-navigable printWindow")
	}
	if !strings.Contains(content, "htBuildPrintDocument") {
		t.Errorf("expected htBuildPrintDocument usage")
	}
	// Ensure viewer print does not leave empty preview
	if !strings.Contains(content, "window.open('about:blank'") {
		t.Errorf("expected placeholder window.open for viewer print")
	}
}

func TestContentTitlePrefersJSONTitle(t *testing.T) {
	contentDir = "../../www"
	contentTitleCache = sync.Map{}
	defer func() {
		contentDir = ""
		contentTitleCache = sync.Map{}
	}()

	tests := []struct {
		name   string
		page   string
		arg    string
		lang   string
		stored string
		want   string
	}{
		{
			name:   "index page resolves title over project name",
			page:   "physics",
			stored: "History Tracers",
			want:   "Universe",
		},
		{
			name:   "class content resolves by arg",
			page:   "class_content",
			arg:    "acknowledgement",
			stored: "History Tracers",
			want:   "Acknowledgement",
		},
		{
			name:   "family tree resolves by arg uuid",
			page:   "tree",
			arg:    "33c83383-b9b5-43ec-987d-68f027f342b2",
			stored: "History Tracers",
			want:   "Humans",
		},
		{
			name:   "stale stored title is overridden by JSON title",
			page:   "math_games",
			stored: "Universe",
			want:   "Mathematical Games",
		},
		{
			name:   "title field preferred over header field",
			page:   "families",
			stored: "History Tracers",
			want:   "Families",
		},
		{
			name:   "unresolvable page falls back to stored",
			page:   "license",
			stored: "History Tracers",
			want:   "History Tracers",
		},
		{
			name:   "unsafe key falls back to stored",
			page:   "class_content",
			arg:    "../evil",
			stored: "History Tracers",
			want:   "History Tracers",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := contentTitle(tt.page, tt.arg, tt.lang, tt.stored)
			if got != tt.want {
				t.Errorf("contentTitle(%q, %q, %q, %q) = %q, want %q", tt.page, tt.arg, tt.lang, tt.stored, got, tt.want)
			}
		})
	}
}

func TestViewerTabScrollRestore(t *testing.T) {
	js := addressBarJS
	if !strings.Contains(js, "htTabSaveScroll") {
		t.Errorf("expected htTabSaveScroll in addressBarJS")
	}
	if !strings.Contains(js, "htTabRestoreScroll") {
		t.Errorf("expected htTabRestoreScroll in addressBarJS")
	}
	// selTab must save the outgoing tab offset before hiding it...
	if !strings.Contains(js, "htTabSaveScroll(active)") {
		t.Errorf("expected selTab to save the active tab scroll offset")
	}
	// ...and restore the incoming tab offset after showing it.
	if !strings.Contains(js, "htTabRestoreScroll(idx)") {
		t.Errorf("expected selTab to restore the selected tab scroll offset")
	}
}

func TestTokenRotationConcurrent(t *testing.T) {
	// The token is rotated from request handlers and read on every
	// authenticated request; concurrent access must not race (verified
	// with -race). Note: checkToken is NOT asserted here because a
	// concurrent rotation legitimately invalidates a just-read token.
	rotateToken()
	var wg sync.WaitGroup
	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for j := 0; j < 25; j++ {
				rotateToken()
				if tok := currentToken(); len(tok) != 64 {
					t.Errorf("token has length %d, want 64 hex chars", len(tok))
					return
				}
			}
		}()
	}
	wg.Wait()
	// Sequential sanity: the current token authenticates.
	r, _ := http.NewRequest("POST", "/api/history/add", nil)
	r.Header.Set("X-HT-Token", currentToken())
	if !checkToken(r) {
		t.Error("checkToken rejected the current token")
	}
	r.Header.Set("X-HT-Token", "wrong")
	if checkToken(r) {
		t.Error("checkToken accepted a wrong token")
	}
}

func TestParseInt64Strict(t *testing.T) {
	cases := []struct {
		in   string
		want int64
	}{
		{"42", 42},
		{"  42  ", 42},
		{"-5", -5},
		{"", 0},
		{"12abc", 0},
		{"abc", 0},
		{"0x10", 0},
	}
	for _, c := range cases {
		if got := parseInt64(c.in); got != c.want {
			t.Errorf("parseInt64(%q) = %d, want %d", c.in, got, c.want)
		}
	}
}

func TestWriteHistoryLockedRoundTrip(t *testing.T) {
	dir := t.TempDir()
	old := historyFile
	historyFile = dir + "/history.csv"
	defer func() { historyFile = old }()

	entries := []historyEntry{
		{Page: "main", ArgUUID: "a", People: "p", Time: 123, Title: "T", Lang: "en-US", Cal: "gregory"},
	}
	if err := writeHistoryLocked(entries); err != nil {
		t.Fatalf("writeHistoryLocked failed: %v", err)
	}
	got := readHistoryLocked()
	if len(got) != 1 || got[0].Title != "T" || got[0].Time != 123 {
		t.Fatalf("round trip mismatch: %+v", got)
	}
}

func TestWriteHistoryLockedError(t *testing.T) {
	old := historyFile
	historyFile = "/nonexistent-dir-ht/history.csv"
	defer func() { historyFile = old }()
	if err := writeHistoryLocked([]historyEntry{{Page: "main"}}); err == nil {
		t.Fatal("expected error writing to an invalid path")
	}
	if err := writeFavoritesLocked([]historyEntry{{Page: "main"}}); err == nil {
		t.Fatal("expected error writing favorites to an invalid path")
	}
}

func TestMetricsPathCardinalityCap(t *testing.T) {
	// Snapshot and restore the shared counters so this test cannot
	// disturb count-sensitive tests.
	metricsMu.Lock()
	saved := metricsPathCounts
	metricsPathCounts = map[string]int64{}
	metricsMu.Unlock()
	defer func() {
		metricsMu.Lock()
		metricsPathCounts = saved
		metricsMu.Unlock()
	}()

	for i := 0; i < 600; i++ {
		metricsRecord("GET", "/probe-"+strings.Repeat("x", 10)+"-"+string(rune('a'+i%26))+strings.Repeat("y", i%50), 200, time.Millisecond, 0, 0)
	}
	metricsMu.Lock()
	n := len(metricsPathCounts)
	_, overflow := metricsPathCounts["/other"]
	metricsMu.Unlock()
	if n > 513 {
		t.Fatalf("metricsPathCounts grew to %d entries, want at most 513", n)
	}
	if !overflow {
		t.Fatal("expected overflow bucket /other to be used")
	}
}

func TestMetricsNegativeSizesClamped(t *testing.T) {
	metricsMu.Lock()
	beforeReq := metricsReqBytesTotal
	beforeRes := metricsResBytesTotal
	metricsMu.Unlock()
	metricsRecord("GET", "/clamp-test", 200, time.Millisecond, -1, -1)
	metricsMu.Lock()
	dReq := metricsReqBytesTotal - beforeReq
	dRes := metricsResBytesTotal - beforeRes
	delete(metricsPathCounts, "/clamp-test")
	metricsMu.Unlock()
	if dReq != 0 || dRes != 0 {
		t.Fatalf("negative sizes changed counters by req=%d res=%d, want 0,0", dReq, dRes)
	}
}

func TestValidateOptionsMtObj(t *testing.T) {
	d := optionsData{MtObj: "19"}
	validateOptions(&d)
	if d.MtObj != "19" {
		t.Fatalf("valid mtobj %q was rejected", d.MtObj)
	}
	for _, invalid := range []string{"20", "99", "-1", "abc", "01"} {
		d = optionsData{MtObj: invalid}
		validateOptions(&d)
		if d.MtObj != "" {
			t.Fatalf("invalid mtobj %q was accepted", invalid)
		}
	}
}

func TestOptionsHandlerMtObjPartialUpdate(t *testing.T) {
	dir := t.TempDir()
	oldOptionsFile := optionsFile
	optionsFile = filepath.Join(dir, "options.gob")
	defer func() { optionsFile = oldOptionsFile }()

	if err := writeOptionsLocked(optionsData{Lang: "pt-BR", Cal: "gregory", MtObj: "1"}); err != nil {
		t.Fatalf("cannot seed options: %v", err)
	}
	rotateToken()

	req := httptest.NewRequest(http.MethodPost, "/api/options", strings.NewReader("mtobj=3"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("X-HT-Token", currentToken())
	rec := httptest.NewRecorder()
	optionsHandler(rec, req)
	if rec.Code != http.StatusNoContent {
		t.Fatalf("options POST failed: status=%d body=%s", rec.Code, rec.Body.String())
	}
	next := rec.Header().Get("X-HT-Next-Token")
	if next == "" {
		t.Fatal("expected a rotated token in X-HT-Next-Token")
	}
	data, err := readOptions()
	if err != nil {
		t.Fatalf("cannot read options: %v", err)
	}
	if data.MtObj != "3" {
		t.Fatalf("mtobj=%q, want 3", data.MtObj)
	}
	if data.Lang != "pt-BR" || data.Cal != "gregory" {
		t.Fatalf("partial update dropped other fields: %+v", data)
	}
	if savedOptions.MtObj != "3" {
		t.Fatalf("savedOptions not updated: %+v", savedOptions)
	}

	// Invalid values are ignored (the stored one survives).
	req = httptest.NewRequest(http.MethodPost, "/api/options", strings.NewReader("mtobj=banana"))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("X-HT-Token", next)
	rec = httptest.NewRecorder()
	optionsHandler(rec, req)
	if rec.Code != http.StatusNoContent {
		t.Fatalf("options POST failed: status=%d", rec.Code)
	}
	data, _ = readOptions()
	if data.MtObj != "3" {
		t.Fatalf("invalid mtobj replaced the stored one: %q", data.MtObj)
	}

	// Requests without the current token are refused.
	req = httptest.NewRequest(http.MethodPost, "/api/options", strings.NewReader("mtobj=4"))
	rec = httptest.NewRecorder()
	optionsHandler(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for missing token, got %d", rec.Code)
	}
}
