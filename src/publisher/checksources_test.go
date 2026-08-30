// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"testing"

	. "github.com/historytracers/common"
)

func TestHTIsCommonContentPath(t *testing.T) {
	// Both the common directory and the candidate paths are normalized to
	// forward slashes, so Windows-style backslash paths must be recognized
	// as common content the same way Unix-style paths are.
	cases := []struct {
		name string
		src  string
		path string
		want bool
	}{
		{
			name: "unix common smartphone file",
			src:  "/var/www/htdocs/historytracers/",
			path: "/var/www/htdocs/historytracers/src/common/src/smartphone/en-US/x.json",
			want: true,
		},
		{
			name: "unix common top dir",
			src:  "/var/www/htdocs/historytracers/",
			path: "/var/www/htdocs/historytracers/src/common",
			want: true,
		},
		{
			name: "unix non-common lang file",
			src:  "/var/www/htdocs/historytracers/",
			path: "/var/www/htdocs/historytracers/lang/en-US/x.json",
			want: false,
		},
		{
			name: "windows common smartphone file",
			src:  "C:\\inetpub\\wwwroot\\historytracers\\",
			path: "C:\\inetpub\\wwwroot\\historytracers\\src\\common\\src\\smartphone\\en-US\\x.json",
			want: true,
		},
		{
			name: "windows mixed separators",
			src:  "C:\\inetpub\\wwwroot\\historytracers\\",
			path: "C:\\inetpub\\wwwroot\\historytracers\\src/common/src/smartphone/pt-BR/y.json",
			want: true,
		},
		{
			name: "windows non-common lang file",
			src:  "C:\\inetpub\\wwwroot\\historytracers\\",
			path: "C:\\inetpub\\wwwroot\\historytracers\\lang\\en-US\\x.json",
			want: false,
		},
		{
			name: "windows sibling prefix not inside common",
			src:  "C:\\inetpub\\wwwroot\\historytracers\\",
			path: "C:\\inetpub\\wwwroot\\historytracers\\src\\commonity\\x.json",
			want: false,
		},
		{
			name: "unix sibling prefix not inside common",
			src:  "/var/www/htdocs/historytracers/",
			path: "/var/www/htdocs/historytracers/src/commonity/x.json",
			want: false,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			CFG = &htConfig{HTConfigBase: *NewHTConfigBase(0, tc.src, "", "")}
			if got := htIsCommonContentPath(tc.path); got != tc.want {
				t.Errorf("htIsCommonContentPath(%q) = %v, want %v", tc.path, got, tc.want)
			}
		})
	}
}
