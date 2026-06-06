package main

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
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
