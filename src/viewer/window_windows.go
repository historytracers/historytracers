//go:build windows

package main

import (
	"log"
	"os"
	"path/filepath"

	webview2 "github.com/Krakinsight/go-webview2"
)

const welcomePage = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>HistoryTracers Viewer</title></head>
<body style="margin:0;font-family:verdana,arial,helvetica;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f0f0">
<div style="text-align:center;padding:40px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15)">
<h2>HistoryTracers Viewer</h2>
<p id="msg">No content directory was found.</p>
<p><button onclick="closeWin()" style="padding:10px 24px;font-size:1em;cursor:pointer;border-radius:6px;border:1px solid #999;background:#e8e8e8">Close</button></p>
</div>
<script>
var loc=navigator.language||'en-US';
var L={};
L['pt-BR']={msg:'Diret\u00f3rio de conte\u00fado n\u00e3o encontrado.',close:'Fechar'};
L['pt']=L['pt-BR'];
L['es-ES']={msg:'No se encontr\u00f3 el directorio de contenido.',close:'Cerrar'};
L['es']=L['es-ES'];
L['en-US']={msg:'No content directory was found.',close:'Close'};
L['en']=L['en-US'];
var l=L[loc]||L[loc.substring(0,2)]||L['en-US'];
document.getElementById('msg').textContent=l.msg;
document.querySelector('button').textContent=l.close;
function closeWin(){closeWindow()}
</script>
</body>
</html>`

const addressBarJS = `
(function(){
	if(window!==window.top)return;
	function addBar(){
		if(!document.documentElement||!document.body){setTimeout(addBar,1);return}
		if(document.getElementById('__ht_addr'))return;
		var TAB_H=22,ADDR_H=32,BAR_H=ADDR_H+TAB_H;
		var loc=navigator.language||'en-US';
		var L={};
		L['pt-BR']={main:'Principal',tab:'Aba',reloadTitle:'Recarregar p\u00e1gina (for\u00e7ado)',homeTitle:'P\u00e1gina inicial',gameTitle:'Jogos',atlasTitle:'Atlas',familyTitle:'Fam\u00edlia'};
		L['pt']=L['pt-BR'];
		L['es-ES']={main:'Principal',tab:'Pesta\u00f1a',reloadTitle:'Recargar p\u00e1gina (forzado)',homeTitle:'P\u00e1gina de inicio',gameTitle:'Juegos',atlasTitle:'Atlas',familyTitle:'Familia'};
		L['es']=L['es-ES'];
		L['en-US']={main:'Main',tab:'Tab',reloadTitle:'Reload page (hard)',homeTitle:'Home page',gameTitle:'Games',atlasTitle:'Atlas',familyTitle:'Family'};
		L['en']=L['en-US'];
		var l=L[loc]||L[loc.substring(0,2)]||L['en-US'];
		var s=document.createElement('style');
		s.id='__ht_style';
		s.textContent='.top-bar-right{top:'+(BAR_H+4)+'px!important}.top-bar-left{margin-top:'+(BAR_H+4)+'px!important}.side-bar{top:'+BAR_H+'px!important}.hamburger{top:'+(BAR_H+4)+'px!important}';
		document.documentElement.appendChild(s);
		var b=document.createElement('div');
		b.id='__ht_addr';
		b.style.cssText='position:fixed;top:0;left:0;right:0;height:'+ADDR_H+'px;background:#f5f5f5;border-bottom:1px solid #999;z-index:2147483647;display:flex;align-items:center;padding:0 2px;font:10px/1 sans-serif;overflow:hidden;';
		var h=document.createElement('button');
		h.id='__ht_home';
		h.textContent='⌂';
		h.title=l.homeTitle;
		h.style.cssText='border:none;background:transparent;cursor:pointer;font:bold 44px/1 monospace;padding:0 5px;color:#555;';
		h.onclick=function(){location.href=location.origin};
		b.appendChild(h);
		var r=document.createElement('button');
		r.id='__ht_rld';
		r.textContent='⟳';
		r.title=l.reloadTitle;
		r.style.cssText='border:none;background:transparent;cursor:pointer;font:bold 24px/1 monospace;padding:0 5px;color:#555;';
		r.onclick=function(){location.reload(true)};
		b.appendChild(r);
		var sep=document.createElement('div');
		sep.style.cssText='width:1px;height:16px;background:#999;margin:0 4px;flex-shrink:0;';
		b.appendChild(sep);
		function navBtn(id,symbol,title,url){
			var btn=document.createElement('button');
			btn.id=id;
			btn.textContent=symbol;
			btn.title=title;
			btn.style.cssText='border:none;background:transparent;cursor:pointer;font:24px/1 monospace;padding:0 5px;color:#555;';
			btn.onclick=function(){location.href=location.origin+'/'+url};
			b.appendChild(btn);
		}
		navBtn('__ht_game','\uD83C\uDFAE',l.gameTitle,'index.html?page=math_games');
		navBtn('__ht_atlas','\uD83C\uDF0D',l.atlasTitle,'index.html?page=atlas');
		navBtn('__ht_family','\uD83C\uDF33',l.familyTitle,'index.html?page=families');
		var sep2=document.createElement('div');
		sep2.style.cssText='width:1px;height:16px;background:#999;margin:0 4px;flex-shrink:0;';
		b.appendChild(sep2);
		var u=document.createElement('input');
		u.id='__ht_url';
		u.type='text';
		u.readOnly=true;
		u.value=window.location.href;
		u.style.cssText='flex:1;min-width:0;border:none;padding:0 4px;font:14px/1 monospace;background:transparent;color:#333;outline:none;box-sizing:border-box;text-overflow:ellipsis;overflow:hidden;';
		b.appendChild(u);
		document.documentElement.insertBefore(b,document.documentElement.firstChild);
		var tb=document.createElement('div');
		tb.id='__ht_tabs';
		tb.style.cssText='position:fixed;top:'+ADDR_H+'px;left:0;right:0;height:'+TAB_H+'px;background:#d0d0d0;border-bottom:1px solid #999;z-index:2147483646;display:flex;align-items:stretch;padding:0;font:13px/1 sans-serif;overflow:hidden;';
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
			ExStyle: 0,
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

	if _, err := os.Stat(filepath.Join(contentDir, "index.html")); os.IsNotExist(err) {
		w.Bind("closeWindow", func() {
			w.Destroy()
		})
		w.SetHtml(welcomePage)
		w.Run()
		return
	}

	w.Navigate(pageURL)
	w.Run()
}
