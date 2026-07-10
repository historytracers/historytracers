module historytracers

go 1.25.0

require (
	github.com/BurntSushi/toml v1.5.0
	github.com/gomarkdown/markdown v0.0.0-20250810172220-2e2c11897d1a
	github.com/google/uuid v1.6.0
	github.com/tdewolff/minify/v2 v2.24.13
	golang.org/x/net v0.46.0
	modernc.org/sqlite v1.37.1
)

require (
	github.com/dustin/go-humanize v1.0.1 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/ncruces/go-strftime v0.1.9 // indirect
	github.com/remyoudompheng/bigfft v0.0.0-20230129092748-24d4a6f8daec // indirect
	github.com/tdewolff/parse/v2 v2.8.12 // indirect
	golang.org/x/exp v0.0.0-20250408133849-7e4ce0ab07d0 // indirect
	golang.org/x/sys v0.43.0 // indirect
	modernc.org/libc v1.65.7 // indirect
	modernc.org/mathutil v1.7.1 // indirect
	modernc.org/memory v1.11.0 // indirect
)

replace github.com/historytracers/common => ../common/src/go

require github.com/historytracers/common v0.0.0-20260702181604-c40f654376d7
