package main

var welcomePage = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>HistoryTracers Viewer</title></head>
<body style="margin:0;font-family:verdana,arial,helvetica;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f0f0">
<div style="text-align:center;padding:40px;background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15)">
<h2>HistoryTracers Viewer</h2>
<p id="msg">No content directory was found.</p>
<p><button onclick="closeWin()" style="padding:10px 24px;font-size:1em;cursor:pointer;border-radius:6px;border:1px solid #999;background:#e8e8e8">Close</button></p>
</div>
<script>
var loc=window.__ht_lang||navigator.language||'en-US';
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

var addressBarJS = `
(function(){
	(function(){
		if(window.__ht_dev||window.location.pathname==='/api/dev/page'||window.location.pathname==='/api/history/page'||window.location.pathname==='/api/favorites/page')return;
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
		var _of=window.fetch;
		window.fetch=function(){
			var a=arguments,url=a[0] instanceof Request?a[0].url:String(a[0]);
			if(url.indexOf('/api/dev/')>=0)return _of.apply(this,a);
			var m=a[1]&&a[1].method?a[1].method:'GET',st=Date.now();
			return _of.apply(this,a).then(function(r){
				try{fetch('/api/dev/log',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'type=network&url='+encodeURIComponent(url)+'&method='+encodeURIComponent(m)+'&status='+r.status+'&duration='+(Date.now()-st)+'&time='+st})}catch(e){}
				return r;
			}).catch(function(err){
				try{fetch('/api/dev/log',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'type=network&url='+encodeURIComponent(url)+'&method='+encodeURIComponent(m)+'&status=0&duration='+(Date.now()-st)+'&message='+encodeURIComponent(err.message)+'&time='+st})}catch(e){}
				throw err;
			});
		};
		var _OX=window.XMLHttpRequest;
		window.XMLHttpRequest=function(){
			var x=new _OX(),_op=x.open;
			x.open=function(m,u){
				x._du=u;x._dm=m;x._ds=Date.now();
				return _op.apply(x,arguments);
			};
			var _sd=x.send;
			x.send=function(){
				x._ds=Date.now();
				x.addEventListener('loadend',function(){
					try{if(x._du&&x._du.indexOf('/api/dev/')<0)fetch('/api/dev/log',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'type=network&url='+encodeURIComponent(x._du)+'&method='+encodeURIComponent(x._dm||'GET')+'&status='+(x.status||0)+'&duration='+(Date.now()-x._ds)+'&time='+x._ds})}catch(e){}
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
		var TAB_H=22,ADDR_H=32,BAR_H=ADDR_H+TAB_H;
		var loc=window.__ht_lang||'';
		if(!loc){
			try{var _lu2=new URL(window.location.href);loc=_lu2.searchParams.get('lang')||navigator.language||'en-US'}catch(e){loc=navigator.language||'en-US'}
		}
		var L={};
L['pt-BR']={main:'Principal',tab:'Aba',reloadTitle:'Recarregar p\u00e1gina (for\u00e7ado)',homeTitle:'P\u00e1gina inicial',firstStepsTitle:'Primeiros passos',gameTitle:'Jogos',atlasTitle:'Atlas',familyTitle:'Fam\u00edlia',menuTitle:'Menu',exitTitle:'Sair',historyTitle:'Hist\u00f3rico',emptyTitle:'(vazio)',expandTitle:'Expandir Hist\u00f3rico',favBtnTitle:'Adicionar/Remover Favorito',favTitle:'Favoritos',favExpandTitle:'Expandir Favoritos',favEmpty:'(nenhum favorito)',devTitle:'Dev',debugTitle:'Depurador',optionsTitle:'Op\u00e7\u00f5es',optionsLangLabel:'Idioma',optionsCalLabel:'Calend\u00e1rio',optionsHomeLabel:'P\u00e1gina inicial',optionsApply:'Aplicar'};
L['pt']=L['pt-BR'];
L['es-ES']={main:'Principal',tab:'Pesta\u00f1a',reloadTitle:'Recargar p\u00e1gina (forzado)',homeTitle:'P\u00e1gina de inicio',firstStepsTitle:'Primeros pasos',gameTitle:'Juegos',atlasTitle:'Atlas',familyTitle:'Familia',menuTitle:'Men\u00fa',exitTitle:'Salir',historyTitle:'Historial',emptyTitle:'(vac\u00edo)',expandTitle:'Expandir Historial',favBtnTitle:'Agregar/Quitar Favorito',favTitle:'Favoritos',favExpandTitle:'Expandir Favoritos',favEmpty:'(ning\u00fan favorito)',devTitle:'Dev',debugTitle:'Depurador',optionsTitle:'Opciones',optionsLangLabel:'Idioma',optionsCalLabel:'Calendario',optionsHomeLabel:'P\u00e1gina de inicio',optionsApply:'Aplicar'};
L['es']=L['es-ES'];
L['en-US']={main:'Main',tab:'Tab',reloadTitle:'Reload page (hard)',homeTitle:'Home page',firstStepsTitle:'First steps',gameTitle:'Games',atlasTitle:'Atlas',familyTitle:'Family',menuTitle:'Menu',exitTitle:'Exit',historyTitle:'History',emptyTitle:'(empty)',expandTitle:'Expand History',favBtnTitle:'Add/Remove Favorite',favTitle:'Favorites',favExpandTitle:'Expand Favorites',favEmpty:'(no favorites)',devTitle:'Dev',debugTitle:'Debug',optionsTitle:'Options',optionsLangLabel:'Language',optionsCalLabel:'Calendar',optionsHomeLabel:'Home page',optionsApply:'Apply'};
L['en']=L['en-US'];
		var l=L[loc]||L[loc.substring(0,2)]||L['en-US'];
		var _lang=window.__ht_lang||'';
		if(!_lang){
			try{var _lu=new URL(window.location.href);_lang=_lu.searchParams.get('lang')||''}catch(e){}
		}
		var _cal=window.__ht_cal||'';
		if(!_cal){
			try{var _cu=new URL(window.location.href);_cal=_cu.searchParams.get('cal')||''}catch(e){}
		}
		var _el=[];
		(function(){
			var x=new XMLHttpRequest();
			x.open('GET','/api/options',true);
			x.onload=function(){
				try{var d=JSON.parse(x.responseText);if(d&&typeof d==='object'){
					if(!_lang&&d.lang){_lang=d.lang;var nl=L[_lang]||L[_lang.substring(0,2)]||L['en-US'];l=nl;refreshLang()}
					if(!_cal&&d.cal){_cal=d.cal;refreshCal()}
				}}catch(e){}
			};
			x.send();
		})();
		function refreshLang(){
			var old=loc;
			loc=getLang()||window.__ht_lang||navigator.language||'en-US';
			var nl=L[loc]||L[loc.substring(0,2)]||L['en-US'];
			l=nl;
			for(var i=0;i<_el.length;i++){
				var e=_el[i];
				if(e.id==='__ht_home')e.title=l.homeTitle;
				else if(e.id==='__ht_rld')e.title=l.reloadTitle;
				else if(e.id==='__ht_firststeps')e.title=l.firstStepsTitle;
				else if(e.id==='__ht_game')e.title=l.gameTitle;
				else if(e.id==='__ht_atlas')e.title=l.atlasTitle;
				else if(e.id==='__ht_family')e.title=l.familyTitle;
				else if(e.id==='__ht_menu_btn')e.title=l.menuTitle;
				else if(e.id==='__ht_fav_btn')e.title=l.favBtnTitle;
				else if(e.id==='__ht_history_item'){if(e.firstChild)e.firstChild.textContent=l.historyTitle+'\u25B6'}
				else if(e.id==='__ht_fav_item'){if(e.firstChild)e.firstChild.textContent=l.favTitle+'\u25B6'}
				else if(e.id==='__ht_exit_item')e.textContent=l.exitTitle;
				else if(e.id==='__ht_dev_item'){if(e.firstChild)e.firstChild.textContent=l.devTitle+'\u25B6'}
				else if(e.id==='__ht_dbg_item')e.textContent=l.debugTitle;
				else if(e.id==='__ht_options_item'){if(e.firstChild)e.firstChild.textContent=l.optionsTitle+'\u25B6'}
			}
			var oll=document.getElementById('__ht_opt_lang_label');
			if(oll)oll.textContent=l.optionsLangLabel+':';
			var ocl=document.getElementById('__ht_opt_cal_label');
			if(ocl)ocl.textContent=l.optionsCalLabel+':';
			var ohl=document.getElementById('__ht_opt_home_label');
			if(ohl)ohl.textContent=l.optionsHomeLabel+':';
			var oa=document.getElementById('__ht_opt_apply');
			if(oa)oa.textContent=l.optionsApply;
			var hs=document.getElementById('__ht_hist_sub');
			if(hs)hs.removeAttribute('data-loaded');
		}
		document.addEventListener('change',function(e){
			if(e.target&&e.target.id==='site_language')refreshLang();
			if(e.target&&e.target.id==='site_calendar')refreshCal();
		});
		function getLang(){
			try{var s=$('#site_language');if(s.length)return s.val()}catch(e){}
			return _lang;
		}
		function getCal(){
			try{var s=$('#site_calendar');if(s.length)return s.val()}catch(e){}
			return _cal;
		}
		function refreshCal(){
			var hs=document.getElementById('__ht_hist_sub');
			if(hs)hs.removeAttribute('data-loaded');
			var fs=document.getElementById('__ht_fav_sub');
			if(fs)fs.removeAttribute('data-loaded');
		}
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
		h.onclick=function(){var g=getLang(),c=getCal(),u=location.origin+'/index.html';if(g)u+='?lang='+encodeURIComponent(g);if(c)u+=(u.indexOf('?')>=0?'&':'?')+'cal='+encodeURIComponent(c);location.href=u};
		_el.push(h);
		b.appendChild(h);
		var r=document.createElement('button');
		r.id='__ht_rld';
		r.textContent='⟳';
		r.title=l.reloadTitle;
		r.style.cssText='border:none;background:transparent;cursor:pointer;font:bold 24px/1 monospace;padding:0 5px;color:#555;';
		r.onclick=function(){var g=getLang(),c=getCal(),u=new URL(window.location.href);if(g)u.searchParams.set('lang',g);if(c)u.searchParams.set('cal',c);location.href=u.toString()};
		_el.push(r);
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
			btn.onclick=function(){var g=getLang(),c=getCal(),u=location.origin+'/'+url;if(g)u+='&lang='+encodeURIComponent(g);if(c)u+='&cal='+encodeURIComponent(c);location.href=u};
			_el.push(btn);
			b.appendChild(btn);
		}
		navBtn('__ht_firststeps','\uD83D\uDC63',l.firstStepsTitle,'index.html?page=first_steps_menu');
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
		var favBtn=document.createElement('button');
		favBtn.id='__ht_fav_btn';
		favBtn.textContent='\u2606';
		favBtn.title=l.favBtnTitle;
		favBtn.style.cssText='border:none;background:transparent;cursor:pointer;font:20px/1 monospace;padding:0 6px;color:#d4a017;';
		favBtn.onclick=function(){
			var _this=this;
			var curUrl=tabs[active]?tabs[active].url:window.location.href;
			var p=(new URL(curUrl)).searchParams.get('page')||'';
			var a=(new URL(curUrl)).searchParams.get('arg')||'';
			var pp=(new URL(curUrl)).searchParams.get('people')||'';
			fetch('/api/favorites/add',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'page='+encodeURIComponent(p)+'&arg='+encodeURIComponent(a)+'&people='+encodeURIComponent(pp)+'&title='+encodeURIComponent(document.title||'')+'&lang='+encodeURIComponent(getLang())+'&cal='+encodeURIComponent(getCal())}).then(function(){
				_this.textContent=(_this.textContent=='\u2606')?'\u2605':'\u2606';
				var fs=document.getElementById('__ht_fav_sub');
				if(fs)fs.removeAttribute('data-loaded');
			}).catch(function(){});
		};
		_el.push(favBtn);
		b.appendChild(favBtn);
		var _favGen=0;
		function checkFavStar(url){
			var u=url||window.location.href;
			var gen=++_favGen;
			var p=(new URL(u)).searchParams.get('page')||'';
			var a=(new URL(u)).searchParams.get('arg')||'';
			var pp=(new URL(u)).searchParams.get('people')||'';
			var key=p+'|'+a+'|'+pp;
			fetch('/api/favorites/list').then(function(r){return r.json()}).then(function(entries){
				if(gen!==_favGen)return;
				var starred=false;
				for(var i=0;i<entries.length;i++){
					var e=entries[i];
					if(e.page+'|'+(e.arg||'')+'|'+(e.people||'')===key){starred=true;break}
				}
				var fb=document.getElementById('__ht_fav_btn');
				if(fb)fb.textContent=starred?'\u2605':'\u2606';
			}).catch(function(){});
		}
		setTimeout(checkFavStar,100);
		var menuBtn=document.createElement('button');
		menuBtn.id='__ht_menu_btn';
		menuBtn.textContent='\u22EE';
		menuBtn.title=l.menuTitle;
		menuBtn.style.cssText='border:none;background:transparent;cursor:pointer;font:bold 20px/1 monospace;padding:0 8px;color:#555;margin-left:auto;';
		_el.push(menuBtn);
		b.appendChild(menuBtn);
		var menuDrop=document.createElement('div');
		menuDrop.id='__ht_menu_drop';
		menuDrop.style.cssText='position:fixed;display:none;background:#fff;border:1px solid #999;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:2147483647;min-width:120px;right:4px;padding:4px 0;';
		document.documentElement.appendChild(menuDrop);
		var historyItem=document.createElement('div');
		historyItem.id='__ht_history_item';
		historyItem.style.cssText='position:relative;display:block;padding:6px 16px;text-decoration:none;color:#333;font:14px/1.4 sans-serif;cursor:pointer;';
		historyItem.textContent=l.historyTitle+'\u25B6';
		_el.push(historyItem);
		menuDrop.appendChild(historyItem);
		var histSub=document.createElement('div');
		histSub.id='__ht_hist_sub';
		histSub.style.cssText='position:absolute;display:none;right:100%;left:auto;top:0;background:#fff;border:1px solid #999;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:2147483647;min-width:160px;padding:4px 0;white-space:nowrap;';
		historyItem.appendChild(histSub);
		histSub.onclick=function(e){
			var link=e.target.closest('a');
			if(!link)return;
			e.preventDefault();
			histSub.style.display='none';menuDrop.style.display='none';
			openTab(link.href);
		};
		historyItem.onmouseenter=function(){
			this.style.background='#e8e8e8';
			histSub.style.display='block';
			if(!histSub.dataset.loaded){
				histSub.dataset.loaded='1';
				fetch('/api/history/list').then(function(r){return r.json()}).then(function(entries){
					histSub.innerHTML='';
					if(!entries||entries.length===0){
						var e=document.createElement('div');
						e.style.cssText='padding:6px 16px;color:#999;font:13px/1.4 sans-serif;font-style:italic;';
						e.textContent=l.emptyTitle;
						histSub.appendChild(e);
						return;
					}
					for(var i=0;i<entries.length&&i<10;i++){
						var e=entries[i];
						var div=document.createElement('div');
						div.style.cssText='padding:0 16px;';
					var a=document.createElement('a');
					var href=window.location.origin+'/index.html?page='+encodeURIComponent(e.page);
					if(e.arg)href+='&arg='+encodeURIComponent(e.arg);
					if(e.people)href+='&people='+encodeURIComponent(e.people);
					if(e.lang)href+='&lang='+encodeURIComponent(e.lang);
					if(e.cal)href+='&cal='+encodeURIComponent(e.cal);
						a.href=href;
						var label=e.title||e.page;
						if(!e.title){
							if(e.arg&&e.page!=='families'){label=e.arg.substring(0,24);if(e.arg.length>24)label+='\u2026'}
							else if(e.people){label=e.people.substring(0,24);if(e.people.length>24)label+='\u2026'}
						}
						a.textContent=label;
						a.style.cssText='display:block;text-decoration:none;color:#333;font:13px/1.4 sans-serif;cursor:pointer;overflow:hidden;text-overflow:ellipsis;';
						a.onmouseover=function(){this.style.background='#e8e8e8'};
						a.onmouseout=function(){this.style.background='transparent'};
						div.appendChild(a);
						if(e.time){
							var ts=document.createElement('span');
							try{ts.textContent=window.htConvertDate(getCal(),getLang(),e.time)}catch(ex){try{ts.textContent=new Date(e.time*1000).toLocaleString(getLang())}catch(ex2){ts.textContent=''}}
							ts.style.cssText='display:block;font:10px/1.2 sans-serif;color:#999;padding:0 0 2px 0;';
							div.appendChild(ts);
						}
						histSub.appendChild(div);
					}
					var sepEx=document.createElement('div');
					sepEx.style.cssText='height:1px;background:#ddd;margin:4px 0;';
					histSub.appendChild(sepEx);
					var exLink=document.createElement('a');
					exLink.href='#';
					exLink.textContent=l.expandTitle||'Expand History';
					exLink.style.cssText='display:block;padding:6px 16px;text-decoration:none;color:#333;font:13px/1.4 sans-serif;cursor:pointer;';
					exLink.onmouseover=function(){this.style.background='#e8e8e8'};
					exLink.onmouseout=function(){this.style.background='transparent'};
					exLink.onclick=function(e){e.preventDefault();e.stopPropagation();histSub.style.display='none';menuDrop.style.display='none';var gl=getLang(),gc=getCal();openTab(window.location.origin+'/api/history/page'+(gl?'?lang='+encodeURIComponent(gl):'')+(gc?'&cal='+encodeURIComponent(gc):''))};
					histSub.appendChild(exLink);
				}).catch(function(){});
			}
		};
		historyItem.onmouseleave=function(){
			this.style.background='transparent';
			setTimeout(function(){if(!histSub.matches(':hover'))histSub.style.display='none'},100);
		};
		histSub.onmouseleave=function(){this.style.display='none'};
		var favItem=document.createElement('div');
		favItem.id='__ht_fav_item';
		favItem.style.cssText='position:relative;display:block;padding:6px 16px;text-decoration:none;color:#333;font:14px/1.4 sans-serif;cursor:pointer;';
		favItem.textContent=l.favTitle+'\u25B6';
		_el.push(favItem);
		menuDrop.appendChild(favItem);
		var favSub=document.createElement('div');
		favSub.id='__ht_fav_sub';
		favSub.style.cssText='position:absolute;display:none;right:100%;left:auto;top:0;background:#fff;border:1px solid #999;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:2147483647;min-width:160px;padding:4px 0;white-space:nowrap;';
		favItem.appendChild(favSub);
		favSub.onclick=function(e){
			var link=e.target.closest('a');
			if(!link)return;
			e.preventDefault();
			favSub.style.display='none';menuDrop.style.display='none';
			openTab(link.href);
		};
		favItem.onmouseenter=function(){
			this.style.background='#e8e8e8';
			favSub.style.display='block';
			if(!favSub.dataset.loaded){
				favSub.dataset.loaded='1';
				fetch('/api/favorites/list').then(function(r){return r.json()}).then(function(entries){
					favSub.innerHTML='';
					if(!entries||entries.length===0){
						var e=document.createElement('div');
						e.style.cssText='padding:6px 16px;color:#999;font:13px/1.4 sans-serif;font-style:italic;';
						e.textContent=l.favEmpty;
						favSub.appendChild(e);
						return;
					}
					for(var i=0;i<entries.length;i++){
						var e=entries[i];
						var div=document.createElement('div');
						div.style.cssText='padding:0 16px;';
						var a=document.createElement('a');
						var href=window.location.origin+'/index.html?page='+encodeURIComponent(e.page);
						if(e.arg)href+='&arg='+encodeURIComponent(e.arg);
						if(e.people)href+='&people='+encodeURIComponent(e.people);
						if(e.lang)href+='&lang='+encodeURIComponent(e.lang);
						if(e.cal)href+='&cal='+encodeURIComponent(e.cal);
						a.href=href;
						var label=e.title||e.page;
						if(!e.title){
							if(e.arg&&e.page!=='families'){label=e.arg.substring(0,24);if(e.arg.length>24)label+='\u2026'}
							else if(e.people){label=e.people.substring(0,24);if(e.people.length>24)label+='\u2026'}
						}
						a.textContent=label;
						a.style.cssText='display:block;text-decoration:none;color:#333;font:13px/1.4 sans-serif;cursor:pointer;overflow:hidden;text-overflow:ellipsis;';
						a.onmouseover=function(){this.style.background='#e8e8e8'};
						a.onmouseout=function(){this.style.background='transparent'};
						div.appendChild(a);
						favSub.appendChild(div);
					}
					var sepFav=document.createElement('div');
					sepFav.style.cssText='height:1px;background:#ddd;margin:4px 0;';
					favSub.appendChild(sepFav);
					var exFav=document.createElement('a');
					exFav.href='#';
					exFav.textContent=l.favExpandTitle||'Expand Favorites';
					exFav.style.cssText='display:block;padding:6px 16px;text-decoration:none;color:#333;font:13px/1.4 sans-serif;cursor:pointer;';
					exFav.onmouseover=function(){this.style.background='#e8e8e8'};
					exFav.onmouseout=function(){this.style.background='transparent'};
					exFav.onclick=function(e){e.preventDefault();e.stopPropagation();favSub.style.display='none';menuDrop.style.display='none';var gl=getLang(),gc=getCal();openTab(window.location.origin+'/api/favorites/page'+(gl?'?lang='+encodeURIComponent(gl):'')+(gc?'&cal='+encodeURIComponent(gc):''))};
					favSub.appendChild(exFav);
				}).catch(function(){});
			}
		};
		favItem.onmouseleave=function(){
			this.style.background='transparent';
			setTimeout(function(){if(!favSub.matches(':hover'))favSub.style.display='none'},100);
		};
		favSub.onmouseleave=function(){this.style.display='none'};
		var devItem=document.createElement('div');
		devItem.id='__ht_dev_item';
		devItem.style.cssText='position:relative;display:block;padding:6px 16px;text-decoration:none;color:#333;font:14px/1.4 sans-serif;cursor:pointer;';
		devItem.textContent=l.devTitle+'\u25B6';
		_el.push(devItem);
		menuDrop.appendChild(devItem);
		var devSub=document.createElement('div');
		devSub.id='__ht_dev_sub';
		devSub.style.cssText='position:absolute;display:none;right:100%;left:auto;top:0;background:#fff;border:1px solid #999;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:2147483647;min-width:120px;padding:4px 0;white-space:nowrap;';
		devItem.appendChild(devSub);
		var dbg=document.createElement('a');
		dbg.id='__ht_dbg_item';
		_el.push(dbg);
		dbg.href='#';
		dbg.textContent=l.debugTitle;
		dbg.style.cssText='display:block;padding:6px 16px;text-decoration:none;color:#333;font:13px/1.4 sans-serif;cursor:pointer;';
		dbg.onmouseover=function(){this.style.background='#e8e8e8'};
		dbg.onmouseout=function(){this.style.background='transparent'};
		dbg.onclick=function(e){e.preventDefault();e.stopPropagation();			devSub.style.display='none';menuDrop.style.display='none';toggleDevPanel()};
		devSub.appendChild(dbg);
		devItem.onmouseenter=function(){this.style.background='#e8e8e8';devSub.style.display='block'};
		devItem.onmouseleave=function(){this.style.background='transparent';setTimeout(function(){if(!devSub.matches(':hover'))devSub.style.display='none'},100)};
		devSub.onmouseleave=function(){this.style.display='none'};
		var optionsItem=document.createElement('div');
		optionsItem.id='__ht_options_item';
		optionsItem.style.cssText='position:relative;display:block;padding:6px 16px;text-decoration:none;color:#333;font:14px/1.4 sans-serif;cursor:pointer;';
		optionsItem.textContent=l.optionsTitle+'\u25B6';
		_el.push(optionsItem);
		menuDrop.appendChild(optionsItem);
		var optSub=document.createElement('div');
		optSub.id='__ht_opt_sub';
		optSub.style.cssText='position:absolute;display:none;right:100%;left:auto;top:0;background:#fff;border:1px solid #999;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:2147483647;min-width:180px;padding:8px;white-space:nowrap;font:13px/1.4 sans-serif;';
		optionsItem.appendChild(optSub);
		var optLangLabel=document.createElement('div');
		optLangLabel.id='__ht_opt_lang_label';
		optLangLabel.textContent=l.optionsLangLabel+':';
		optLangLabel.style.cssText='margin-bottom:2px;color:#555;';
		optSub.appendChild(optLangLabel);
		var optLangSel=document.createElement('select');
		optLangSel.id='__ht_opt_lang';
		optLangSel.style.cssText='width:100%;margin-bottom:6px;padding:2px;';
		var langs=['pt-BR','en-US','es-ES'];
		for(var oi=0;oi<langs.length;oi++){var o=document.createElement('option');o.value=langs[oi];o.textContent=langs[oi];if(langs[oi]===_lang)o.selected=true;optLangSel.appendChild(o)}
		optSub.appendChild(optLangSel);
		var optCalLabel=document.createElement('div');
		optCalLabel.id='__ht_opt_cal_label';
		optCalLabel.textContent=l.optionsCalLabel+':';
		optCalLabel.style.cssText='margin-bottom:2px;color:#555;';
		optSub.appendChild(optCalLabel);
		var optCalSel=document.createElement('select');
		optCalSel.id='__ht_opt_cal';
		optCalSel.style.cssText='width:100%;margin-bottom:6px;padding:2px;';
		var cals=['gregory','hebrew','hispanic','islamic','julian','mesoamerican','emesoamerican','persian','french','shaka'];
		for(var oi=0;oi<cals.length;oi++){var o=document.createElement('option');o.value=cals[oi];o.textContent=cals[oi];if(cals[oi]===_cal)o.selected=true;optCalSel.appendChild(o)}
		optSub.appendChild(optCalSel);
		var optHomeLabel=document.createElement('div');
		optHomeLabel.id='__ht_opt_home_label';
		optHomeLabel.textContent=l.optionsHomeLabel+':';
		optHomeLabel.style.cssText='margin-bottom:2px;color:#555;';
		optSub.appendChild(optHomeLabel);
		var optHomeInp=document.createElement('input');
		optHomeInp.id='__ht_opt_home';
		optHomeInp.type='text';
		optHomeInp.value=window.__ht_home||'/index.html';
		optHomeInp.style.cssText='width:100%;margin-bottom:8px;padding:2px;box-sizing:border-box;font:13px/1.4 sans-serif;';
		optSub.appendChild(optHomeInp);
		var optApply=document.createElement('button');
		optApply.id='__ht_opt_apply';
		optApply.textContent=l.optionsApply;
		optApply.style.cssText='display:block;width:100%;padding:4px 8px;background:#555;color:#fff;border:none;border-radius:3px;cursor:pointer;font:13px/1.4 sans-serif;';
		optApply.onmouseover=function(){this.style.background='#333'};
		optApply.onmouseout=function(){this.style.background='#555'};
		optApply.onclick=function(e){
			e.preventDefault();e.stopPropagation();
			var nl=optLangSel.value,nc=optCalSel.value,nh=optHomeInp.value||'/index.html';
			fetch('/api/options',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'lang='+encodeURIComponent(nl)+'&cal='+encodeURIComponent(nc)+'&home='+encodeURIComponent(nh)}).then(function(){
				optSub.style.display='none';menuDrop.style.display='none';
				var u=window.location.origin+'/'+nh.replace(/^\//,'');
				var up=new URL(window.location.href);
				var upPage=up.searchParams.get('page');
				if(upPage){u+=(u.indexOf('?')>=0?'&':'?')+'page='+encodeURIComponent(upPage)}
				var a=up.searchParams.get('arg');
				if(a)u+='&arg='+encodeURIComponent(a);
				var p=up.searchParams.get('people');
				if(p)u+='&people='+encodeURIComponent(p);
				if(nl)u+='&lang='+encodeURIComponent(nl);
				if(nc)u+='&cal='+encodeURIComponent(nc);
				window.location.href=u;
			}).catch(function(){});
		};
		optSub.appendChild(optApply);
		optionsItem.onmouseenter=function(){this.style.background='#e8e8e8';optSub.style.display='block'};
		optionsItem.onmouseleave=function(){this.style.background='transparent';setTimeout(function(){if(!optSub.matches(':hover'))optSub.style.display='none'},100)};
		optSub.onmouseleave=function(){this.style.display='none'};
		var sep3=document.createElement('div');
		sep3.style.cssText='height:1px;background:#ddd;margin:4px 0;';
		menuDrop.appendChild(sep3);
		var exitItem=document.createElement('a');
		exitItem.id='__ht_exit_item';
		exitItem.href='#';
		exitItem.textContent=l.exitTitle;
		exitItem.style.cssText='display:block;padding:6px 16px;text-decoration:none;color:#333;font:14px/1.4 sans-serif;cursor:pointer;';
		exitItem.onclick=function(e){e.preventDefault();menuDrop.style.display='none';closeWindow()};
		exitItem.onmouseover=function(){this.style.background='#e8e8e8'};
		exitItem.onmouseout=function(){this.style.background='transparent'};
		_el.push(exitItem);
		menuDrop.appendChild(exitItem);
		menuBtn.onclick=function(e){
			e.stopPropagation();
			var r=menuBtn.getBoundingClientRect();
			menuDrop.style.top=(r.bottom+2)+'px';
			menuDrop.style.display=(menuDrop.style.display=='none'||menuDrop.style.display=='')?'block':'none';
		};
		document.addEventListener('click',function(){menuDrop.style.display='none'});
		menuDrop.onclick=function(e){e.stopPropagation()};
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
			checkFavStar(tabs[idx]?tabs[idx].url:window.location.href);
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
			f.addEventListener('load',function(){
				try{
					var idoc=f.contentDocument||f.contentWindow.document;
					if(!idoc)return;
					var iw=f.contentWindow;
					tabs[idx].url=iw.location.href;
					_favGen++;
					if(active==idx){
						var urlEl=document.getElementById('__ht_url');
						if(urlEl)urlEl.value=iw.location.href;
						checkFavStar(tabs[idx].url);
					}
					var titleEl=idoc.querySelector('title');
					if(!titleEl){sp.textContent=new URL(iw.location.href).pathname.split('/').pop()||l.tab;return}
					var update=function(){sp.textContent=idoc.title||new URL(iw.location.href).pathname.split('/').pop()||l.tab};
					update();
					var mo=new MutationObserver(update);
					mo.observe(titleEl,{childList:true,subtree:true,characterData:true});
					idoc.addEventListener('click',function(ie){
						var ia=ie.target.closest('a');
						if(ia&&ia.target==='_blank'){ie.preventDefault();openOrExternal(ia.href)}
					});
					var _irs=iw.history.replaceState;
					iw.history.replaceState=function(){
						var oldUrl=iw.location.href;
						_irs.apply(this,arguments);
						try{
							var nu=new URL(arguments[2],oldUrl);
							tabs[idx].url=nu.href;
							_favGen++;
							if(active==idx){var urlEl=document.getElementById('__ht_url');if(urlEl)urlEl.value=nu.href;checkFavStar(nu.href)}
						}catch(e){}
					};
					var _ips=iw.history.pushState;
					iw.history.pushState=function(){
						var oldUrl=iw.location.href;
						_ips.apply(this,arguments);
						try{
							var nu=new URL(arguments[2],oldUrl);
							tabs[idx].url=nu.href;
							_favGen++;
							if(active==idx){var urlEl=document.getElementById('__ht_url');if(urlEl)urlEl.value=nu.href;checkFavStar(nu.href)}
						}catch(e){}
					};
					iw.addEventListener('popstate',function(){
						tabs[idx].url=iw.location.href;
						_favGen++;
						if(active==idx){var urlEl=document.getElementById('__ht_url');if(urlEl)urlEl.value=iw.location.href;checkFavStar(iw.location.href)}
					});
				}catch(e){}
			});
			selTab(idx);
			return{closed:false,close:function(){closeTab(idx)}};
		}
		var t0=mkTab(0);
		t0.style.background='#f5f5f5';t0.style.fontWeight='bold';
		t0.textContent=l.main;
		t0.onclick=function(){selTab(0)};
		tb.appendChild(t0);
		tabs[0].el=t0;
		(function(){
			var titleEl=document.querySelector('title');
			if(!titleEl)return;
			var mo=new MutationObserver(function(){t0.textContent=document.title||l.main});
			mo.observe(titleEl,{childList:true,subtree:true,characterData:true});
		})();
		document.body.style.marginTop=BAR_H+'px';
		function openOrExternal(url){
			try{
				var u=new URL(url,window.location.origin);
				if(u.origin!==window.location.origin){
					fetch('/api/open/external?url='+encodeURIComponent(url));
					return;
				}
			}catch(e){}
			openTab(url);
		}
		window.open=function(url){return openOrExternal(url)};
		function toggleDevPanel(){
			var dp=document.getElementById('__ht_dev_panel');
			if(dp){dp.style.display=dp.style.display==='none'?'':'none';return}
			dp=document.createElement('div');
			dp.id='__ht_dev_panel';
			dp.style.cssText='position:fixed;top:'+BAR_H+'px;right:0;width:45%;bottom:0;background:#1e1e1e;border-left:2px solid #444;z-index:999999;display:flex;flex-direction:column;';
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
			fi.src=window.location.origin+'/api/dev/page?lang='+encodeURIComponent(getLang())+'&cal='+encodeURIComponent(getCal());
			fi.style.cssText='flex:1;border:none;width:100%;';
			dp.appendChild(fi);
			document.documentElement.appendChild(dp);
		}
		document.addEventListener('click',function(e){
			var a=e.target.closest('a');
			if(a&&a.target==='_blank'){e.preventDefault();openOrExternal(a.href)}
		});
		(function(){
			function trackNav(urlParam){
				try{
					var u=new URL(urlParam,window.location.origin);
					tabs[0].url=u.href;
					var urlEl=document.getElementById('__ht_url');
					if(urlEl)urlEl.value=u.href;
					var p=u.searchParams.get('page');
					if(!p)return;
					var a=u.searchParams.get('arg')||'';
					var pp=u.searchParams.get('people')||'';
					var cl=u.searchParams.get('cal')||getCal()||'';
					setTimeout(function(){
						try{fetch('/api/history/add',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'page='+encodeURIComponent(p)+'&arg='+encodeURIComponent(a)+'&people='+encodeURIComponent(pp)+'&title='+encodeURIComponent(document.title||'')+'&lang='+encodeURIComponent(getLang())+'&cal='+encodeURIComponent(cl)})}catch(e2){}
					},800);
				}catch(e){}
			}
			var _rs=window.history.replaceState;
			window.history.replaceState=function(){
				_rs.apply(this,arguments);
				_favGen++;
				trackNav(arguments[2]);
				setTimeout(checkFavStar,200);
			};
			var _ps=window.history.pushState;
			window.history.pushState=function(){
				_ps.apply(this,arguments);
				_favGen++;
				trackNav(arguments[2]);
				setTimeout(checkFavStar,200);
			};
			window.addEventListener('popstate',function(){_favGen++;tabs[0].url=window.location.href;var urlEl=document.getElementById('__ht_url');if(urlEl)urlEl.value=window.location.href;setTimeout(checkFavStar,200)});
		})();
	}
	addBar();
})();
`
