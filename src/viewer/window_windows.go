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
	if(window!==window.top)return;
	function addBar(){
		if(!document.documentElement||!document.body){setTimeout(addBar,1);return}
		if(document.getElementById('__ht_addr'))return;
		var TAB_H=18,ADDR_H=16,BAR_H=ADDR_H+TAB_H;
		var loc=navigator.language||'en-US';
		var L={};
		L['pt-BR']={main:'Principal',tab:'Aba',reloadTitle:'Recarregar p\u00e1gina (for\u00e7ado)'};
		L['pt']=L['pt-BR'];
		L['es-ES']={main:'Principal',tab:'Pesta\u00f1a',reloadTitle:'Recargar p\u00e1gina (forzado)'};
		L['es']=L['es-ES'];
		L['en-US']={main:'Main',tab:'Tab',reloadTitle:'Reload page (hard)'};
		L['en']=L['en-US'];
		var l=L[loc]||L[loc.substring(0,2)]||L['en-US'];
		var s=document.createElement('style');
		s.id='__ht_style';
		s.textContent='.top-bar-right{top:'+(BAR_H+4)+'px!important}.top-bar-left{margin-top:8px!important}.side-bar{top:'+BAR_H+'px!important}';
		document.documentElement.appendChild(s);
		var b=document.createElement('div');
		b.id='__ht_addr';
		b.style.cssText='position:fixed;top:0;left:0;right:0;height:'+ADDR_H+'px;background:#f5f5f5;border-bottom:1px solid #999;z-index:2147483647;display:flex;align-items:center;padding:0 2px;font:10px/1 sans-serif;overflow:hidden;';
		var r=document.createElement('button');
		r.id='__ht_rld';
		r.textContent='⟳';
		r.title=l.reloadTitle;
		r.style.cssText='border:none;background:transparent;cursor:pointer;font:bold 12px/1 monospace;padding:0 3px;color:#555;';
		r.onclick=function(){location.reload(true)};
		b.appendChild(r);
		var u=document.createElement('input');
		u.id='__ht_url';
		u.type='text';
		u.readOnly=true;
		u.value=window.location.href;
		u.style.cssText='flex:1;min-width:0;border:none;padding:0 2px;font:10px/1 monospace;background:transparent;color:#333;outline:none;box-sizing:border-box;text-overflow:ellipsis;overflow:hidden;';
		b.appendChild(u);
		document.documentElement.insertBefore(b,document.documentElement.firstChild);
		var tb=document.createElement('div');
		tb.id='__ht_tabs';
		tb.style.cssText='position:fixed;top:'+ADDR_H+'px;left:0;right:0;height:'+TAB_H+'px;background:#d0d0d0;border-bottom:1px solid #999;z-index:2147483646;display:flex;align-items:stretch;padding:0;font:10px/1 sans-serif;overflow:hidden;';
		document.documentElement.appendChild(tb);
		var tabs={0:{type:'main',el:null,iframe:null,url:window.location.href}},cnt=1,active=0;
		function mkTab(idx){
			var t=document.createElement('div');
			t.className='__ht_t';t.dataset.idx=idx;
			t.style.cssText='padding:2px 6px;cursor:pointer;border-right:1px solid #999;display:flex;align-items:center;white-space:nowrap;';
			return t;
		}
		function selTab(idx){
			for(var k in tabs){
				if(tabs[k].el){
					tabs[k].el.style.background=(k==idx?'#f5f5f5':'#d0d0d0');
					tabs[k].el.style.fontWeight=(k==idx?'bold':'normal');
				}
				if(tabs[k].iframe)tabs[k].iframe.style.display=(k==idx?'':'none');
			}
			document.body.style.display=(idx==0?'':'none');
			active=idx;
			var e=document.getElementById('__ht_url');
			if(e&&tabs[idx])e.value=tabs[idx].url||window.location.href;
		}
		function closeTab(idx){
			if(idx==0||!tabs[idx])return;
			if(tabs[idx].iframe)tabs[idx].iframe.remove();
			if(tabs[idx].el)tabs[idx].el.remove();
			delete tabs[idx];
			if(active==idx)selTab(0);
		}
		function openTab(url){
			var idx=cnt++;
			var t=mkTab(idx);
			t.style.background='#d0d0d0';
			var sp=document.createElement('span');
			try{sp.textContent=new URL(url).pathname.split('/').pop()||l.tab}catch(e){sp.textContent=l.tab}
			t.appendChild(sp);
			var x=document.createElement('span');
			x.textContent='×';x.style.cssText='margin-left:5px;cursor:pointer;font-weight:bold;color:#666;';
			x.onclick=function(e){e.stopPropagation();closeTab(idx)};
			t.appendChild(x);
			t.onclick=function(){selTab(idx)};
			tb.appendChild(t);
			var f=document.createElement('iframe');
			f.src=url;
			f.style.cssText='position:fixed;top:'+BAR_H+'px;left:0;right:0;bottom:0;width:100%;height:calc(100vh - '+BAR_H+'px);border:none;z-index:1000;';
			f.style.display='none';
			document.documentElement.appendChild(f);
			tabs[idx]={type:'iframe',el:t,iframe:f,url:url};
			selTab(idx);
			return{closed:false,close:function(){closeTab(idx)}};
		}
		var t0=mkTab(0);
		t0.style.background='#f5f5f5';t0.style.fontWeight='bold';
		t0.textContent=l.main;
		t0.onclick=function(){selTab(0)};
		tb.appendChild(t0);
		tabs[0].el=t0;
		document.body.style.marginTop=BAR_H+'px';
		window.open=function(url){return openTab(url)};
		document.addEventListener('click',function(e){
			var a=e.target.closest('a');
			if(a&&a.target==='_blank'){e.preventDefault();openTab(a.href)}
		});
		setInterval(function(){
			var e=document.getElementById('__ht_url');
			if(!e)return;
			if(active==0)e.value=window.location.href;
			else if(tabs[active])e.value=tabs[active].url;
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
