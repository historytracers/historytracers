// SPDX-License-Identifier: GPL-3.0-or-later
package main

import (
	"strings"
	"testing"
)

func TestJSStringEscapesScriptBreakout(t *testing.T) {
	for _, in := range []string{
		`</script><script>alert(1)</script>`,
		`"><img src=x onerror=alert(1)>`,
		"x\x00y",
		"line1\nline2",
	} {
		got := jsString(in)
		if strings.Contains(got, "</script>") {
			t.Fatalf("jsString(%q) allows </script> breakout: %s", in, got)
		}
		if !strings.HasPrefix(got, `"`) || !strings.HasSuffix(got, `"`) {
			t.Fatalf("jsString(%q) not a quoted literal: %s", in, got)
		}
	}
	if jsString("plain") != `"plain"` {
		t.Fatalf("unexpected jsString output: %s", jsString("plain"))
	}
}

func TestSanitizeLabelPath(t *testing.T) {
	for _, bad := range []string{"a<b", `a"b`, "a'b", "a`b", "a\nb", "a\rb", "a\x00b", strings.Repeat("a", 2048)} {
		if sanitizeLabelPath(bad) != "" {
			t.Fatalf("sanitizeLabelPath accepted %q", bad)
		}
	}
	if sanitizeLabelPath("/etc/historytracers/cert.pem") == "" {
		t.Fatal("sanitizeLabelPath rejected a legitimate path")
	}
}

func TestIsValidIndexName(t *testing.T) {
	for _, bad := range []string{"", ".", "..", ".hidden", "../evil", "/abs", "a/b", `a\b`, "a..b", `x"y`, "x'y", strings.Repeat("a", 200)} {
		if isValidIndexName(bad) {
			t.Fatalf("isValidIndexName accepted %q", bad)
		}
	}
	for _, good := range []string{"index", "atlas", "first_steps", "my-class2", "A1_-b"} {
		if !isValidIndexName(good) {
			t.Fatalf("isValidIndexName rejected %q", good)
		}
	}
}

func TestNormalizeSmartphonePrefixRejectsEscape(t *testing.T) {
	for _, bad := range []string{"../x", "..", "/abs/path", "a<>b", "a\nb", `a"b`} {
		if normalizeSmartphonePrefix(bad) != "" {
			t.Fatalf("normalizeSmartphonePrefix accepted %q", bad)
		}
	}
	if normalizeSmartphonePrefix("MYSMARTPHONE") != "MYSMARTPHONE" {
		t.Fatal("normalizeSmartphonePrefix rejected a legitimate prefix")
	}
}

func TestNormalizeImagesPathRejectsTraversal(t *testing.T) {
	for _, bad := range []string{"a/../b", "<img>", "a\nb"} {
		if normalizeImagesPath(bad) != "" {
			t.Fatalf("normalizeImagesPath accepted %q", bad)
		}
	}
}

func TestValidateEditPathContainment(t *testing.T) {
	old := rootDir
	rootDir = t.TempDir()
	defer func() { rootDir = old }()
	for _, bad := range []string{"../../etc/passwd", "lang/../../x.json", "/etc/passwd", ".."} {
		if _, err := validateEditPath(bad); err == nil {
			t.Fatalf("validateEditPath accepted %q", bad)
		}
	}
}

func TestSanitizeMetricsLabel(t *testing.T) {
	out := sanitizeMetricsLabel("x\"},evil{#\nnew\x00line")
	if strings.Contains(out, "\n") || strings.Contains(out, "\x00") {
		t.Fatalf("sanitizeMetricsLabel left control chars: %q", out)
	}
	if !strings.Contains(out, `\"`) {
		t.Fatalf("sanitizeMetricsLabel did not escape quote: %q", out)
	}
}

func TestEscapeHTMLText(t *testing.T) {
	got := escapeHTMLText(`</a><img src=x onerror=alert(1)>`)
	if strings.Contains(got, "<img") || strings.Contains(got, "</a>") {
		t.Fatalf("escapeHTMLText failed: %s", got)
	}
}
