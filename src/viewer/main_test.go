// SPDX-License-Identifier: GPL-3.0-or-later
package main

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
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
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := buildPageURL(tt.addr, tt.class, tt.lang, tt.cal)
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
	got := buildPageURL("", "id", "", "")
	if !strings.HasPrefix(got, "http://") {
		t.Errorf("expected http prefix, got %q", got)
	}
	if !strings.Contains(got, "index.html") {
		t.Errorf("expected index.html in URL, got %q", got)
	}
}

func TestBuildPageURLOrder(t *testing.T) {
	got := buildPageURL("127.0.0.1:1", "myclass", "en", "")
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
	sw.WriteHeader(http.StatusInternalServerError)
	if sw.status != http.StatusInternalServerError {
		t.Errorf("after WriteHeader(500) status = %d, want 500", sw.status)
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
	got := buildPageURL("127.0.0.1:9999", "", "es-ES", "")
	if !strings.HasSuffix(got, "lang=es-ES") {
		t.Errorf("expected lang param, got %q", got)
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
