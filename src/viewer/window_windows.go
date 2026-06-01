//go:build windows

package main

import (
	"log"
	"os/exec"
	"path/filepath"
	"strings"

	webview2 "github.com/Krakinsight/go-webview2"
)

const addressBarJS = `
(function(){
	function addBar(){
		if(!document.documentElement||!document.body){setTimeout(addBar,1);return}
		if(document.getElementById('__ht_addr'))return;
		var s=document.createElement('style');
		s.id='__ht_style';
		s.textContent='.top-bar-right{top:24px!important}';
		document.documentElement.appendChild(s);
		var b=document.createElement('div');
		b.id='__ht_addr';
		b.style.cssText='position:fixed;top:0;left:0;right:0;height:20px;background:#f5f5f5;border-bottom:1px solid #999;z-index:2147483647;display:flex;align-items:center;padding:1px 4px;font:11px/1 sans-serif;overflow:hidden;';
		var u=document.createElement('input');
		u.id='__ht_url';
		u.type='text';
		u.readOnly=true;
		u.value=window.location.href;
		u.style.cssText='flex:1;min-width:0;border:none;padding:0 2px;font:11px/1 monospace;background:transparent;color:#333;outline:none;box-sizing:border-box;text-overflow:ellipsis;overflow:hidden;';
		b.appendChild(u);
		document.documentElement.insertBefore(b,document.documentElement.firstChild);
		document.body.style.marginTop='24px';
		setInterval(function(){
			var e=document.getElementById('__ht_url');
			if(e&&e.value!==window.location.href)e.value=window.location.href;
		},200);
	}
	addBar();
})();
`

func promptContentDir() string {
	cmd := exec.Command("powershell", "-NoProfile", "-Command", `
Add-Type -AssemblyName System.Windows.Forms
$d = New-Object System.Windows.Forms.OpenFileDialog
$d.Filter = "HTML Files (*.html;*.htm)|*.html;*.htm|All Files (*.*)|*.*"
$d.Title = "Select index.html from the content directory"
if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output $d.FileName
}`)
	out, err := cmd.Output()
	if err != nil {
		return ""
	}
	filePath := strings.TrimSpace(string(out))
	if filePath == "" {
		return ""
	}
	idx := strings.LastIndex(filePath, "index.html")
	if idx >= 0 {
		return filePath[:idx]
	}
	return filepath.Dir(filePath) + "\\"
}

func runWindow() {
	w, err := webview2.NewWithOptions(webview2.WebViewOptions{
		Debug:     true,
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title:   "HistoryTracers Viewer",
			Width:   1280,
			Height:  800,
			Center:  true,
			Style:   webview2.WindowStyleDefault,
			ExStyle: webview2.WindowExStyleTopMost,
		},
	})
	if err != nil {
		log.Fatalf("Failed to create webview: %v", err)
	}
	if w == nil {
		log.Fatal("Failed to create webview window")
	}
	defer w.Destroy()

	w.Init(addressBarJS)
	w.Navigate(pageURL)
	w.Run()
}
