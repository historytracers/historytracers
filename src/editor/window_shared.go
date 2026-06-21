// SPDX-License-Identifier: GPL-3.0-or-later
package main

var welcomePage = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>HistoryTracers Editor</title></head>
<body style="margin:0;font-family:verdana,arial,helvetica;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f0f0">
<div style="text-align:center;padding:40px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15)">
<h2>HistoryTracers Editor</h2>
<p id="msg">No content directory was found.</p>
<p><button onclick="closeWin()" style="padding:10px 24px;font-size:1em;cursor:pointer;border-radius:6px;border:1px solid #999;background:#e8e8e8">Close</button></p>
</div>
<script>
var loc=window.__ht_lang||navigator.language||'en-US';
var L={'pt-BR':{msg:'Diret\u00f3rio de conte\u00fado n\u00e3o encontrado.',close:'Fechar'},'es-ES':{msg:'No se encontr\u00f3 el directorio de contenido.',close:'Cerrar'}};
var l=L[loc]||L[loc.substring(0,2)]||{msg:'No content directory was found.',close:'Close'};
document.getElementById('msg').textContent=l.msg;
document.querySelector('button').textContent=l.close;
function closeWin(){closeWindow()}
</script>
</body>
</html>`

var editorBarJS = `
(function(){
	(function(){
		try{var _ht_ss=sessionStorage.__ht_token;if(_ht_ss)window.__ht_token=_ht_ss}catch(e){}
		try{sessionStorage.__ht_token=window.__ht_token}catch(e){}
		if(window.__ht_dev||window.location.pathname==='/api/dev/page')return;
		window.__ht_dev=true;
		var _ce=console.error;
		console.error=function(){
			try{_ce.apply(console,arguments);var msg=Array.prototype.join.call(arguments,' ');fetch('/api/dev/log',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'type=error&message='+encodeURIComponent(msg)+'&url='+encodeURIComponent(window.location.href)+'&time='+Date.now()})}catch(e){}
		};
		window.addEventListener('error',function(e){
			try{fetch('/api/dev/log',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'type=error&message='+encodeURIComponent(String(e.message||e.error||''))+'&url='+encodeURIComponent(window.location.href)+'&time='+Date.now()})}catch(ex){}
		});
		window.addEventListener('unhandledrejection',function(e){
			try{var msg=e.reason&&e.reason.message||String(e.reason||'');fetch('/api/dev/log',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'type=error&message='+encodeURIComponent(msg)+'&url='+encodeURIComponent(window.location.href)+'&time='+Date.now()})}catch(ex){}
		});
		function _htToken(){var t=window.__ht_token;if(!t)try{t=parent.__ht_token}catch(e){}if(!t)try{t=sessionStorage.__ht_token}catch(e){}return t||''}
		function _htSetToken(v){window.__ht_token=v;try{sessionStorage.__ht_token=v}catch(e){}try{if(parent&&parent.__ht_token!==undefined)parent.__ht_token=v}catch(e){}}
		var _of=window.fetch;
		window.fetch=function(){
			var a=arguments,url=a[0] instanceof Request?a[0].url:String(a[0]);
			if(url.indexOf('/api/dev/')>=0)return _of.apply(this,a);
			var m=a[1]&&a[1].method?a[1].method:'GET',st=Date.now(),tk=_htToken();
			if(m==='POST'&&typeof url==='string'&&url.indexOf('/api/')===0&&tk){
				if(!a[1])a[1]={};
				if(!a[1].headers)a[1].headers={};
				a[1].headers['X-HT-Token']=tk;
			}
			return _of.apply(this,a).then(function(r){
				try{var nt=r.headers.get('X-HT-Next-Token');if(nt)_htSetToken(nt)}catch(e){}
				try{fetch('/api/dev/log',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-HT-Token':_htToken()},body:'type=network&url='+encodeURIComponent(url)+'&method='+encodeURIComponent(m)+'&status='+r.status+'&duration='+(Date.now()-st)+'&time='+st})}catch(e){}
				return r;
			}).catch(function(err){
				try{fetch('/api/dev/log',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-HT-Token':_htToken()},body:'type=network&url='+encodeURIComponent(url)+'&method='+encodeURIComponent(m)+'&status=0&duration='+(Date.now()-st)+'&message='+encodeURIComponent(err.message)+'&time='+st})}catch(e){}
				throw err;
			});
		};
		var _OX=window.XMLHttpRequest;
		window.XMLHttpRequest=function(){
			var x=new _OX(),_op=x.open;
			x.open=function(m,u){
				x._du=u;x._dm=m;x._ds=Date.now();
				var r=_op.apply(x,arguments);
				var tk=_htToken();
				if(m==='POST'&&typeof u==='string'&&u.indexOf('/api/')===0&&tk){
					try{x.setRequestHeader('X-HT-Token',tk)}catch(e){}
				}
				return r;
			};
			var _sd=x.send;
			x.send=function(){
				x._ds=Date.now();
				var st=Date.now(),su=x._du,sm=x._dm;
				x.addEventListener('loadend',function(){
					try{var nt=x.getResponseHeader('X-HT-Next-Token');if(nt)_htSetToken(nt)}catch(e){}
					try{if(su&&su.indexOf('/api/dev/')<0)fetch('/api/dev/log',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-HT-Token':_htToken()},body:'type=network&url='+encodeURIComponent(su)+'&method='+encodeURIComponent(sm||'GET')+'&status='+(x.status||0)+'&duration='+(Date.now()-st)+'&time='+st})}catch(e){}
				});
				return _sd.apply(x,arguments);
			};
			return x;
		};
	})();
	if(window!==window.top)return;
	function addBar(){
		if(!document.documentElement||!document.body){setTimeout(addBar,1);return}
		if(document.getElementById('__ht_addr'))return;
		var ADDR_H=32;
		var loc='';
		try{var _lu2=new URL(window.location.href);loc=_lu2.searchParams.get('lang')||''}catch(e){}
		if(!loc)loc=window.__ht_lang||navigator.language||'en-US';
		var L={};
L['pt-BR']={homeTitle:'P\u00e1gina inicial',menuTitle:'Menu',exitTitle:'Sair',devTitle:'Dev',debugTitle:'Depurador',editorTitle:'Editor',openTitle:'Abrir no Navegador'};
L['es-ES']={homeTitle:'P\u00e1gina de inicio',menuTitle:'Men\u00fa',exitTitle:'Salir',devTitle:'Dev',debugTitle:'Depurador',editorTitle:'Editor',openTitle:'Abrir en el Navegador'};
L['en-US']={homeTitle:'Home page',menuTitle:'Menu',exitTitle:'Exit',devTitle:'Dev',debugTitle:'Debug',editorTitle:'Editor',openTitle:'Open in Browser'};
		var l=L[loc]||L[loc.substring(0,2)]||L['en-US'];
		var s=document.createElement('style');
		s.id='__ht_style';
		s.textContent='.top-bar-right{top:36px!important}.top-bar-left{margin-top:36px!important}.side-bar{top:32px!important}.hamburger{top:36px!important}';
		document.documentElement.appendChild(s);
		var b=document.createElement('div');
		b.id='__ht_addr';
		b.style.cssText='position:fixed;top:0;left:0;right:0;height:'+ADDR_H+'px;background:#263238;border-bottom:1px solid #444;z-index:2147483647;display:flex;align-items:center;padding:0 8px;font:13px/1 sans-serif;overflow:hidden;color:#eceff1;';
		var title=document.createElement('span');
		title.textContent='Editor';
		title.style.cssText='font-weight:bold;margin-right:12px;color:#80cbc4;';
		b.appendChild(title);
		var u=document.createElement('input');
		u.id='__ht_url';
		u.type='text';
		u.readOnly=true;
		u.value=window.location.href;
		u.style.cssText='flex:1;min-width:0;border:none;padding:0 6px;font:12px/1 monospace;background:transparent;color:#eceff1;outline:none;text-overflow:ellipsis;overflow:hidden;';
		b.appendChild(u);
		var openBtn=document.createElement('button');
		openBtn.textContent='\u2197';
		openBtn.title=l.openTitle;
		openBtn.style.cssText='border:none;background:transparent;cursor:pointer;font:18px/1 monospace;padding:0 6px;color:#80cbc4;';
		openBtn.onclick=function(){fetch('/api/open/external?url='+encodeURIComponent(window.location.href))};
		b.appendChild(openBtn);
		var menuBtn=document.createElement('button');
		menuBtn.id='__ht_menu_btn';
		menuBtn.textContent='\u22EE';
		menuBtn.title=l.menuTitle;
		menuBtn.style.cssText='border:none;background:transparent;cursor:pointer;font:bold 20px/1 monospace;padding:0 8px;color:#eceff1;margin-left:4px;';
		_el.push(menuBtn);
		b.appendChild(menuBtn);
		var _el=[menuBtn];
		var menuDrop=document.createElement('div');
		menuDrop.id='__ht_menu_drop';
		menuDrop.style.cssText='position:fixed;display:none;background:#37474f;border:1px solid #555;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:2147483647;min-width:140px;right:4px;padding:4px 0;';
		document.documentElement.appendChild(menuDrop);
		menuBtn.onclick=function(e){
			e.stopPropagation();
			var r=menuBtn.getBoundingClientRect();
			menuDrop.style.top=(r.bottom+2)+'px';
			menuDrop.style.display=(menuDrop.style.display=='none'||menuDrop.style.display=='')?'block':'none';
		};
		document.addEventListener('click',function(){menuDrop.style.display='none'});
		menuDrop.onclick=function(e){e.stopPropagation()};
		function addMenuItem(id,label){
			var item=document.createElement('a');
			item.id=id;
			item.href='#';
			item.textContent=label;
			item.style.cssText='display:block;padding:8px 16px;text-decoration:none;color:#eceff1;font:13px/1.4 sans-serif;cursor:pointer;';
			item.onmouseover=function(){this.style.background='#455a64'};
			item.onmouseout=function(){this.style.background='transparent'};
			_el.push(item);
			menuDrop.appendChild(item);
			return item;
		}
		var dbg=addMenuItem('__ht_dbg_item',l.debugTitle);
		dbg.onclick=function(e){e.preventDefault();menuDrop.style.display='none';toggleDevPanel()};
		var sep=document.createElement('div');
		sep.style.cssText='height:1px;background:#555;margin:4px 0;';
		menuDrop.appendChild(sep);
		var exit=addMenuItem('__ht_exit_item',l.exitTitle);
		exit.onclick=function(e){e.preventDefault();menuDrop.style.display='none';closeWindow()};
		document.documentElement.insertBefore(b,document.documentElement.firstChild);
		document.body.style.marginTop=ADDR_H+'px';
		function toggleDevPanel(){
			var dp=document.getElementById('__ht_dev_panel');
			if(dp){dp.style.display=dp.style.display==='none'?'':'none';return}
			dp=document.createElement('div');
			dp.id='__ht_dev_panel';
			dp.style.cssText='position:fixed;top:'+ADDR_H+'px;right:0;width:45%;bottom:0;background:#1e1e1e;border-left:2px solid #444;z-index:999999;display:flex;flex-direction:column;';
			var hdr=document.createElement('div');
			hdr.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:#2d2d2d;color:#ccc;font:13px/1.4 sans-serif;border-bottom:1px solid #444;';
			hdr.textContent='DevTools';
			var cls=document.createElement('span');
			cls.textContent='\u00D7';
			cls.style.cssText='cursor:pointer;font:bold 18px/1 monospace;color:#999;padding:0 4px;';
			cls.onclick=function(){dp.style.display='none'};
			hdr.appendChild(cls);
			dp.appendChild(hdr);
			var fi=document.createElement('iframe');
			fi.src=window.location.origin+'/api/dev/page';
			fi.style.cssText='flex:1;border:none;width:100%;';
			dp.appendChild(fi);
			document.documentElement.appendChild(dp);
		}
	}
	addBar();
})();
`
