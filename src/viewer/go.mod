module github.com/historytracers/viewer

go 1.25.0

require (
	github.com/Krakinsight/go-webview2 v0.4.2
	github.com/webview/webview_go v0.0.0-20240831120633-6173450d4dd6
)

replace github.com/webview/webview_go => ./webview_patch

require (
	github.com/fxamacker/cbor/v2 v2.9.1 // indirect
	github.com/jchv/go-winloader v0.0.0-20250406163304-c1995be93bd1 // indirect
	github.com/x448/float16 v0.8.4 // indirect
	golang.org/x/sys v0.43.0 // indirect
)
