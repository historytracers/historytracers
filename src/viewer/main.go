package main

import (
	"encoding/csv"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

var srv *http.Server
var pageURL string
var contentDir string
var accessLog *log.Logger

type historyEntry struct {
	Page    string `json:"page"`
	ArgUUID string `json:"arg"`
	People  string `json:"people"`
	Time    int64  `json:"time"`
	Title   string `json:"title"`
	Lang    string `json:"lang"`
	Cal     string `json:"cal"`
}

var (
	historyMu     sync.Mutex
	historyFile   string
	favoritesMu   sync.Mutex
	favoritesFile string
	optionsMu     sync.Mutex
	optionsFile   string
	savedOptions  optionsData
)

type optionsData struct {
	Lang    string `json:"lang"`
	Cal     string `json:"cal"`
	Recreio string `json:"recreio"`
	Port    string `json:"port"`
	Home    string `json:"home"`
}

func openExternalHandler(w http.ResponseWriter, r *http.Request) {
	target := r.URL.Query().Get("url")
	if target == "" {
		http.Error(w, "missing url", http.StatusBadRequest)
		return
	}
	var cmd string
	var args []string
	switch runtime.GOOS {
	case "windows":
		cmd = "rundll32"
		args = []string{"url.dll,FileProtocolHandler", target}
	case "darwin":
		cmd = "open"
		args = []string{target}
	default:
		cmd = "xdg-open"
		args = []string{target}
	}
	exec.Command(cmd, args...).Start()
	w.WriteHeader(http.StatusNoContent)
}

type devEntry struct {
	Type     string `json:"type"`
	Message  string `json:"message"`
	URL      string `json:"url"`
	Method   string `json:"method"`
	Status   int    `json:"status"`
	Duration int64  `json:"duration"`
	Time     int64  `json:"time"`
}

var (
	devLog []devEntry
	devMu  sync.Mutex
	devMax = 500
)

func devLogHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		entry := devEntry{
			Type:     r.FormValue("type"),
			Message:  r.FormValue("message"),
			URL:      r.FormValue("url"),
			Method:   r.FormValue("method"),
			Duration: parseInt64(r.FormValue("duration")),
			Time:     parseInt64(r.FormValue("time")),
		}
		if s := r.FormValue("status"); s != "" {
			fmt.Sscanf(s, "%d", &entry.Status)
		}
		if entry.Time == 0 {
			entry.Time = time.Now().UnixMilli()
		}
		devMu.Lock()
		devLog = append(devLog, entry)
		if len(devLog) > devMax {
			devLog = devLog[len(devLog)-devMax:]
		}
		devMu.Unlock()
		w.WriteHeader(http.StatusNoContent)

	case http.MethodGet:
		devMu.Lock()
		entries := make([]devEntry, len(devLog))
		copy(entries, devLog)
		devMu.Unlock()

		// Newest first
		for i, j := 0, len(entries)-1; i < j; i, j = i+1, j-1 {
			entries[i], entries[j] = entries[j], entries[i]
		}

		w.Header().Set("Content-Type", "application/json")
		enc := json.NewEncoder(w)
		enc.Encode(entries)

	case http.MethodDelete:
		devMu.Lock()
		devLog = nil
		devMu.Unlock()
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "Method not allowed", 405)
	}
}

func devPageHandler(w http.ResponseWriter, r *http.Request) {
	lang := r.URL.Query().Get("lang")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>DevTools</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font:13px/1.4 sans-serif;background:#1e1e1e;color:#ccc;height:100vh;display:flex;flex-direction:column}
.tabs{display:flex;background:#2d2d2d;border-bottom:1px solid #444;flex-shrink:0}
.tab{padding:8px 16px;cursor:pointer;color:#999;border-bottom:2px solid transparent}
.tab.active{color:#fff;border-bottom-color:#4fc3f7;background:#333}
.content{flex:1;overflow-y:auto;padding:4px}
.entry{padding:4px 8px;border-bottom:1px solid #333;font:12px/1.4 monospace;white-space:pre-wrap;word-break:break-all}
.entry-error{color:#f48771}
.entry-network{color:#89ddff}
.entry .ts{color:#666;margin-right:8px}
.entry .url{color:#c792ea}
.entry .msg{color:#f48771}
.entry .ok{color:#aadd6c}
.entry .fail{color:#f48771}
.entry .meta{color:#666;font-size:11px}
.btn{float:right;padding:4px 10px;margin:4px;cursor:pointer;background:#444;border:none;color:#ccc;border-radius:3px}
.btn:hover{background:#555}
</style></head><body><script>
var loc="`+lang+`";
var l={};
l['pt-BR']={console:'Console',network:'Rede',noErrors:'Nenhum erro encontrado.',noNetwork:'Nenhuma requisi\u00e7\u00e3o de rede capturada.',clear:'Limpar',title:'Ferramentas de Desenvolvedor'};
l['pt']=l['pt-BR'];
l['es-ES']={console:'Consola',network:'Red',noErrors:'No se capturaron errores.',noNetwork:'No se capturaron solicitudes de red.',clear:'Limpiar',title:'Herramientas de Desarrollador'};
l['es']=l['es-ES'];
var lu=l[loc]||l[loc.substring(0,2)]||{console:'Console',network:'Network',noErrors:'No errors captured.',noNetwork:'No network requests captured.',clear:'Clear',title:'DevTools'};
document.title=lu.title;
document.write('<div class="tabs"><div class="tab active" onclick="switchTab(0)">'+lu.console+'</div><div class="tab" onclick="switchTab(1)">'+lu.network+'</div><button class="btn" onclick="clearLog()">'+lu.clear+'</button></div><div class="content" id="console"></div><div class="content" id="network" style="display:none"></div>');
var log=[];
function switchTab(i){document.querySelectorAll('.tab').forEach(function(t,j){t.className=j==i?'tab active':'tab'});document.getElementById('console').style.display=i==0?'':'none';document.getElementById('network').style.display=i==1?'':'none'}
function clearLog(){fetch('/api/dev/log',{method:'DELETE'}).then(function(){log=[];render()}).catch(function(){})}
function fetchLog(){fetch('/api/dev/log').then(function(r){return r.json()}).then(function(entries){log=entries;render()}).catch(function(){})}
function render(){var c=document.getElementById('console'),n=document.getElementById('network');c.innerHTML='';n.innerHTML='';var errCount=0,netCount=0;for(var i=0;i<log.length;i++){var e=log[i];var d=new Date(e.time).toLocaleTimeString();if(e.type==='error'){errCount++;c.innerHTML+='<div class="entry entry-error"><span class="ts">'+d+'</span><span class="msg">'+esc(e.message)+'</span><br><span class="meta">'+esc(e.url)+'</span></div>'}else if(e.type==='network'){if(e.url.indexOf('/api/')>=0)continue;netCount++;var statusClass=e.status>=200&&e.status<300?'ok':'fail';n.innerHTML+='<div class="entry entry-network"><span class="ts">'+d+'</span><span class="url">'+esc(e.url)+'</span><br><span class="meta">'+esc(e.method)+' <span class="'+statusClass+'">'+e.status+'</span> '+(e.duration>0?e.duration+'ms':'')+'</span></div>'}}if(errCount===0)c.innerHTML='<div style="padding:8px;color:#666;font-style:italic">'+lu.noErrors+'</div>';if(netCount===0)n.innerHTML='<div style="padding:8px;color:#666;font-style:italic">'+lu.noNetwork+'</div>'}
function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
setInterval(fetchLog,1000);
fetchLog();
</script></body></html>`)
}

func parseInt64(s string) int64 {
	var n int64
	fmt.Sscanf(s, "%d", &n)
	return n
}

var dataDir string

func initDataDir() {
	home, err := os.UserHomeDir()
	if err != nil {
		log.Printf("Warning: cannot get home directory: %v", err)
		dataDir = ""
		return
	}
	switch runtime.GOOS {
	case "windows":
		dataDir = filepath.Join(home, "HistoryTracers")
	default:
		dataDir = filepath.Join(home, ".config", "HistoryTracers")
	}
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		log.Printf("Warning: cannot create data directory %s: %v", dataDir, err)
		dataDir = ""
	}
}

func initHistory() {
	if dataDir == "" {
		historyFile = ""
		return
	}
	historyFile = filepath.Join(dataDir, "history.csv")
}

func initFavorites() {
	if dataDir == "" {
		favoritesFile = ""
		return
	}
	favoritesFile = filepath.Join(dataDir, "favorites.csv")
}

func initOptions() {
	if dataDir == "" {
		optionsFile = ""
		return
	}
	optionsFile = filepath.Join(dataDir, "options.json")
}

func optionsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		optionsMu.Lock()
		defer optionsMu.Unlock()
		data := readOptions()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)

	case http.MethodPost:
		optionsMu.Lock()
		defer optionsMu.Unlock()
		data := readOptions()
		if home := r.FormValue("home"); home != "" {
			trimmed := strings.TrimLeft(home, "/")
			if !strings.HasPrefix(trimmed, "index.html") {
				home = "/index.html"
			}
			data.Home = home
		}
		if v := r.FormValue("lang"); v != "" {
			data.Lang = v
		}
		if v := r.FormValue("cal"); v != "" {
			data.Cal = v
		}
		if v := r.FormValue("recreio"); v != "" {
			data.Recreio = v
		}
		if v := r.FormValue("port"); v != "" {
			data.Port = v
		}
		writeOptionsLocked(data)
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "Method not allowed", 405)
	}
}

func optionsPageHandler(w http.ResponseWriter, r *http.Request) {
	lang := r.URL.Query().Get("lang")
	cal := r.URL.Query().Get("cal")

	optionsMu.Lock()
	data := readOptions()
	optionsMu.Unlock()

	var curLang, curCal, curRecreio, curPort, curHome string
	if data.Lang != "" {
		curLang = data.Lang
	} else if lang != "" {
		curLang = lang
	} else {
		curLang = "en-US"
	}
	if data.Cal != "" {
		curCal = data.Cal
	} else if cal != "" {
		curCal = cal
	} else {
		curCal = "gregory"
	}
	if data.Recreio != "" {
		curRecreio = data.Recreio
	} else {
		curRecreio = "30"
	}
	curPort = data.Port
	curHome = data.Home
	if curHome == "" {
		curHome = "/index.html"
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprintf(w, `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>History Tracers</title>
<style>
*{box-sizing:border-box}
body{font-family:verdana,arial,helvetica;margin:20px;background:#f5f5f5;color:#333}
h2{color:#333;margin-bottom:16px}
.form-group{margin-bottom:14px}
label{display:block;font-weight:bold;margin-bottom:3px;color:#555;font-size:13px}
select,input[type=number],input[type=text]{width:280px;padding:5px 8px;border:1px solid #ccc;border-radius:3px;font:13px/1.4 sans-serif;background:#fff}
select{height:30px}
.btn{padding:7px 20px;background:#555;color:#fff;border:none;border-radius:3px;cursor:pointer;font:13px/1.4 sans-serif;margin-top:6px}
.btn:hover{background:#333}
.status{margin-top:10px;font-size:13px;color:#080}
.error{color:#c00}
.back{margin-top:20px;font-size:13px}
.back a{color:#06c;text-decoration:none}
.back a:hover{text-decoration:underline}
</style></head><body>
<script>
var lang=%q;
var cal=%q;
var L={};
L['pt-BR']={title:'Op\u00e7\u00f5es',langLabel:'Idioma',calLabel:'Calend\u00e1rio',recreioLabel:'Recreio',recreioM:'min',listenLabel:'Porta',homeLabel:'P\u00e1gina inicial',apply:'Aplicar',saved:'Op\u00e7\u00f5es salvas!',err:'Erro ao salvar: ',back:'\u00ab Voltar'};
L['pt']=L['pt-BR'];
L['es-ES']={title:'Opciones',langLabel:'Idioma',calLabel:'Calendario',recreioLabel:'Recreo',recreioM:'min',listenLabel:'Puerto',homeLabel:'P\u00e1gina de inicio',apply:'Aplicar',saved:'\u00a1Opciones guardadas!',err:'Error al guardar: ',back:'\u00ab Volver'};
L['es']=L['es-ES'];
L['en-US']={title:'Options',langLabel:'Language',calLabel:'Calendar',recreioLabel:'Break',recreioM:'min',listenLabel:'Listen port',homeLabel:'Home page',apply:'Apply',saved:'Options saved!',err:'Error saving: ',back:'\u00ab Go back'};
L['en']=L['en-US'];
var l=L[lang]||L[lang.substring(0,2)]||L['en-US'];
document.title=l.title;

var recVal=%q;
var portVal=%q;
var homeVal=%q;

var langs=['pt-BR','en-US','es-ES'];
var cals=['gregory','hebrew','hispanic','islamic','julian','mesoamerican','emesoamerican','persian','french','shaka','chinese','aymara','inca','javanese','japanese'];
var recreios=[15,25,30,35,45,50,60];

var html='<h2>'+l.title+'</h2>';
html+='<div class="form-group"><label>'+l.langLabel+'</label><select id="opt_lang">';
for(var i=0;i<langs.length;i++){html+='<option value="'+langs[i]+'"'+(langs[i]===lang?' selected':'')+'>'+langs[i]+'</option>'}
html+='</select></div>';
html+='<div class="form-group"><label>'+l.calLabel+'</label><select id="opt_cal">';
for(var i=0;i<cals.length;i++){
	var sc=(function(){try{return parent.document.querySelector('#site_calendar option[value="'+cals[i]+'"]')}catch(e){return null}})();
	var label=sc?sc.textContent:cals[i].charAt(0).toUpperCase()+cals[i].slice(1);
	html+='<option value="'+cals[i]+'"'+(cals[i]===cal?' selected':'')+'>'+label+'</option>';
}
html+='</select></div>';
html+='<div class="form-group"><label>'+l.recreioLabel+'</label><select id="opt_rec">';
for(var i=0;i<recreios.length;i++){html+='<option value="'+recreios[i]+'"'+(String(recreios[i])===recVal?' selected':'')+'>'+recreios[i]+' '+l.recreioM+'</option>'}
html+='</select></div>';
html+='<div class="form-group"><label>'+l.listenLabel+'</label><input type="number" id="opt_port" min="1" max="65535" placeholder="-1" value="'+portVal+'"></div>';
html+='<div class="form-group"><label>'+l.homeLabel+'</label><input type="text" id="opt_home" readonly value="'+homeVal+'"></div>';
html+='<button class="btn" id="opt_apply">'+l.apply+'</button>';
html+='<div id="opt_status"></div>';
html+='<div class="back"><a href="#" onclick="event.preventDefault();(parent.open||window.open)(window.location.origin+\'/index.html?page=\'+encodeURIComponent(parent.location.search.match(/[?&]page=([^&]*)/)?decodeURIComponent(RegExp.$1):\'main\')+\'&lang=\'+encodeURIComponent(lang)+\'&cal=\'+encodeURIComponent(cal))">'+l.back+'</a></div>';
document.body.innerHTML=html;

document.getElementById('opt_apply').onclick=function(){
	var nl=document.getElementById('opt_lang').value;
	var nc=document.getElementById('opt_cal').value;
	var nr=document.getElementById('opt_rec').value;
	var np=document.getElementById('opt_port').value;
	var nh=document.getElementById('opt_home').value||'/index.html';
	if(nh.indexOf('index.html')!==0&&nh.indexOf('/index.html')!==0){nh='/index.html'}
	var s=document.getElementById('opt_status');
	s.className='';s.textContent='...';
	fetch('/api/options',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'lang='+encodeURIComponent(nl)+'&cal='+encodeURIComponent(nc)+'&recreio='+encodeURIComponent(nr)+'&port='+encodeURIComponent(np)+'&home='+encodeURIComponent(nh)}).then(function(r){
		if(!r.ok)throw new Error(r.status);
		s.className='status';s.textContent=l.saved;
		try{parent.location.reload()}catch(e){}
	}).catch(function(e){
		s.className='status error';s.textContent=l.err+e.message;
	});
};
</script>
</body></html>`, curLang, curCal, curRecreio, curPort, curHome)
}

func readOptions() optionsData {
	var data optionsData
	f, err := os.Open(optionsFile)
	if err != nil {
		return data
	}
	defer f.Close()
	json.NewDecoder(f).Decode(&data)
	return data
}

func writeOptionsLocked(data optionsData) {
	f, err := os.Create(optionsFile)
	if err != nil {
		log.Printf("Warning: cannot write options.json: %v", err)
		return
	}
	defer f.Close()
	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	enc.Encode(data)
}

func allowedPage(name string) bool {
	switch name {
	case "genealogical_map", "main", "acknowledgement", "partnership",
		"sources", "genealogical_faq", "genealogical_first_steps",
		"license", "contact", "physics", "philosophy", "historical_events",
		"biology", "chemistry", "history", "families", "myths_believes",
		"first_steps_menu", "first_steps", "first_steps_volume2",
		"indigenous_who", "indigenous_time", "math_games", "release",
		"literature", "atlas", "tree", "class_content":
		return true
	}
	return false
}

func historyAddHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", 405)
		return
	}
	if historyFile == "" {
		http.Error(w, "History not available", 500)
		return
	}
	page := r.FormValue("page")
	if !allowedPage(page) {
		http.Error(w, "Invalid page", 400)
		return
	}
	arg := r.FormValue("arg")
	people := r.FormValue("people")
	title := r.FormValue("title")
	lang := r.FormValue("lang")
	cal := r.FormValue("cal")
	now := time.Now().Unix()

	historyMu.Lock()
	defer historyMu.Unlock()

	entries := readHistoryLocked()
	entries = append(entries, historyEntry{Page: page, ArgUUID: arg, People: people, Time: now, Title: title, Lang: lang, Cal: cal})
	if len(entries) > 256 {
		entries = entries[len(entries)-256:]
	}
	writeHistoryLocked(entries)
}

func historyListHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", 405)
		return
	}
	historyMu.Lock()
	defer historyMu.Unlock()

	entries := readHistoryLocked()
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Time > entries[j].Time
	})

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, "[")
	for i, e := range entries {
		if i > 0 {
			fmt.Fprint(w, ",")
		}
		argEsc := strings.ReplaceAll(e.ArgUUID, `"`, `\"`)
		peopleEsc := strings.ReplaceAll(e.People, `"`, `\"`)
		titleEsc := strings.ReplaceAll(e.Title, `"`, `\"`)
		langEsc := strings.ReplaceAll(e.Lang, `"`, `\"`)
		calEsc := strings.ReplaceAll(e.Cal, `"`, `\"`)
		fmt.Fprintf(w, `{"page":"%s","arg":"%s","people":"%s","time":%d,"title":"%s","lang":"%s","cal":"%s"}`,
			e.Page, argEsc, peopleEsc, e.Time, titleEsc, langEsc, calEsc)
	}
	fmt.Fprint(w, "]")
}

func historyPageHandler(w http.ResponseWriter, r *http.Request) {
	lang := r.URL.Query().Get("lang")
	cal := r.URL.Query().Get("cal")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprintf(w, `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>History Tracers</title>
<style>
body{font-family:verdana,arial,helvetica;margin:20px;background:#f5f5f5}
h2{color:#333}
table{border-collapse:collapse;width:100%%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #ddd;font-size:13px}
th{background:#555;color:#fff}
tr:hover{background:#f0f0f0}
a{color:#06c;text-decoration:none}
a:hover{text-decoration:underline}
.empty{color:#999;font-style:italic;padding:20px}
</style></head><body>
<h2 id="title"></h2>
<div id="hist"></div>
<script>
var loc=`+"`"+`%s`+"`"+`||window.__ht_lang||(parent.__ht_lang)||(function(){try{return parent.document.querySelector('#site_language').value}catch(e){return''}})()||'en-US';
var cal=`+"`"+`%s`+"`"+`||window.__ht_cal||(parent.__ht_cal)||(function(){try{return parent.document.querySelector('#site_calendar').value}catch(e){return''}})()||'gregory';
var L={};
L['pt-BR']={title:'Historiador — Hist\u00f3rico Completo',empty:'(vazio)',err:'Erro ao carregar hist\u00f3rico.',num:'#',page:'P\u00e1gina',titleCol:'T\u00edtulo',langCol:'Idioma',dtCol:'Data/Hora'};
L['pt']=L['pt-BR'];
L['es-ES']={title:'History Tracers — Historial Completo',empty:'(vac\u00edo)',err:'Error al cargar el historial.',num:'#',page:'P\u00e1gina',titleCol:'T\u00edtulo',langCol:'Idioma',dtCol:'Fecha/Hora'};
L['es']=L['es-ES'];
L['en-US']={title:'History Tracers — Full History',empty:'(empty)',err:'Error loading history.',num:'#',page:'Page',titleCol:'Title',langCol:'Language',dtCol:'Date/Time'};
L['en']=L['en-US'];
var l=L[loc]||L[loc.substring(0,2)]||L['en-US'];
document.getElementById('title').textContent=l.title;
fetch('/api/history/list').then(function(r){return r.json()}).then(function(entries){
	var h=document.getElementById('hist');
	if(!entries||entries.length===0){h.innerHTML='<p class="empty">'+l.empty+'</p>';return}
	var t='<table><tr><th>'+l.num+'</th><th>'+l.page+'</th><th>'+l.titleCol+'</th><th>'+l.langCol+'</th><th>'+l.dtCol+'</th></tr>';
	for(var i=0;i<entries.length;i++){
		var e=entries[i];
		var href=window.location.origin+'/index.html?page='+encodeURIComponent(e.page);
		if(e.arg)href+='&arg='+encodeURIComponent(e.arg);
		if(e.people)href+='&people='+encodeURIComponent(e.people);
		if(e.lang)href+='&lang='+encodeURIComponent(e.lang);
		if(e.cal)href+='&cal='+encodeURIComponent(e.cal);
		var label=e.title||e.page;
		if(!e.title){
			if(e.arg&&e.page!=='families'){label=e.arg.substring(0,32);if(e.arg.length>32)label+='\u2026'}
			else if(e.people){label=e.people.substring(0,32);if(e.people.length>32)label+='\u2026'}
		}
		var dt='';
		try{dt=parent.htConvertDate(cal,loc,e.time)}catch(ex){try{dt=new Date(e.time*1000).toLocaleString(loc)}catch(ex2){dt=''}}
		t+='<tr><td>'+(i+1)+'</td><td>'+escapeHtml(e.page)+'</td><td><a href="'+escapeHtml(href)+'" onclick="event.preventDefault();(parent.open||window.open)(this.href)">'+escapeHtml(label)+'</a></td><td>'+(e.lang||'-')+'</td><td>'+escapeHtml(dt)+'</td></tr>';
	}
	t+='</table>';
	h.innerHTML=t;
}).catch(function(){document.getElementById('hist').innerHTML='<p class="empty">'+l.err+'</p>'});
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
</script>
</body></html>`, lang, cal)
}

func favoritesAddHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", 405)
		return
	}
	if favoritesFile == "" {
		http.Error(w, "Favorites not available", 500)
		return
	}
	page := r.FormValue("page")
	arg := r.FormValue("arg")
	people := r.FormValue("people")
	title := r.FormValue("title")
	lang := r.FormValue("lang")
	cal := r.FormValue("cal")

	favoritesMu.Lock()
	defer favoritesMu.Unlock()

	entries := readFavoritesLocked()
	// Toggle: if exists with same page+arg+people, remove it; otherwise add
	key := page + "|" + arg + "|" + people
	found := -1
	for i, e := range entries {
		if e.Page+"|"+e.ArgUUID+"|"+e.People == key {
			found = i
			break
		}
	}
	if found >= 0 {
		entries = append(entries[:found], entries[found+1:]...)
	} else {
		entries = append(entries, historyEntry{
			Page: page, ArgUUID: arg, People: people,
			Time: time.Now().Unix(), Title: title, Lang: lang, Cal: cal,
		})
	}
	writeFavoritesLocked(entries)
}

func favoritesListHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", 405)
		return
	}
	favoritesMu.Lock()
	defer favoritesMu.Unlock()

	entries := readFavoritesLocked()
	// Sort newest first
	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Time > entries[j].Time
	})

	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, "[")
	for i, e := range entries {
		if i > 0 {
			fmt.Fprint(w, ",")
		}
		argEsc := strings.ReplaceAll(e.ArgUUID, `"`, `\"`)
		peopleEsc := strings.ReplaceAll(e.People, `"`, `\"`)
		titleEsc := strings.ReplaceAll(e.Title, `"`, `\"`)
		langEsc := strings.ReplaceAll(e.Lang, `"`, `\"`)
		calEsc := strings.ReplaceAll(e.Cal, `"`, `\"`)
		fmt.Fprintf(w, `{"page":"%s","arg":"%s","people":"%s","time":%d,"title":"%s","lang":"%s","cal":"%s"}`,
			e.Page, argEsc, peopleEsc, e.Time, titleEsc, langEsc, calEsc)
	}
	fmt.Fprint(w, "]")
}

func favoritesPageHandler(w http.ResponseWriter, r *http.Request) {
	lang := r.URL.Query().Get("lang")
	cal := r.URL.Query().Get("cal")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprintf(w, `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>History Tracers</title>
<style>
body{font-family:verdana,arial,helvetica;margin:20px;background:#f5f5f5}
h2{color:#333}
table{border-collapse:collapse;width:100%%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #ddd;font-size:13px}
th{background:#555;color:#fff}
tr:hover{background:#f0f0f0}
a{color:#06c;text-decoration:none}
a:hover{text-decoration:underline}
.empty{color:#999;font-style:italic;padding:20px}
</style></head><body>
<h2 id="title"></h2>
<div id="favs"></div>
<script>
var loc=`+"`"+`%s`+"`"+`||window.__ht_lang||(parent.__ht_lang)||(function(){try{return parent.document.querySelector('#site_language').value}catch(e){return''}})()||'en-US';
var cal=`+"`"+`%s`+"`"+`||window.__ht_cal||(parent.__ht_cal)||(function(){try{return parent.document.querySelector('#site_calendar').value}catch(e){return''}})()||'gregory';
var L={};
L['pt-BR']={title:'Historiador — Favoritos',empty:'(vazio)',err:'Erro ao carregar favoritos.',num:'#',page:'P\u00e1gina',titleCol:'T\u00edtulo',langCol:'Idioma',dtCol:'Data/Hora'};
L['pt']=L['pt-BR'];
L['es-ES']={title:'History Tracers — Favoritos',empty:'(vac\u00edo)',err:'Error al cargar favoritos.',num:'#',page:'P\u00e1gina',titleCol:'T\u00edtulo',langCol:'Idioma',dtCol:'Fecha/Hora'};
L['es']=L['es-ES'];
L['en-US']={title:'History Tracers — Favorites',empty:'(empty)',err:'Error loading favorites.',num:'#',page:'Page',titleCol:'Title',langCol:'Language',dtCol:'Date/Time'};
L['en']=L['en-US'];
var l=L[loc]||L[loc.substring(0,2)]||L['en-US'];
document.getElementById('title').textContent=l.title;
fetch('/api/favorites/list').then(function(r){return r.json()}).then(function(entries){
	var h=document.getElementById('favs');
	if(!entries||entries.length===0){h.innerHTML='<p class="empty">'+l.empty+'</p>';return}
	var t='<table><tr><th>'+l.num+'</th><th>'+l.page+'</th><th>'+l.titleCol+'</th><th>'+l.langCol+'</th><th>'+l.dtCol+'</th></tr>';
	for(var i=0;i<entries.length;i++){
		var e=entries[i];
		var href=window.location.origin+'/index.html?page='+encodeURIComponent(e.page);
		if(e.arg)href+='&arg='+encodeURIComponent(e.arg);
		if(e.people)href+='&people='+encodeURIComponent(e.people);
		if(e.lang)href+='&lang='+encodeURIComponent(e.lang);
		if(e.cal)href+='&cal='+encodeURIComponent(e.cal);
		var label=e.title||e.page;
		if(!e.title){
			if(e.arg&&e.page!=='families'){label=e.arg.substring(0,32);if(e.arg.length>32)label+='\u2026'}
			else if(e.people){label=e.people.substring(0,32);if(e.people.length>32)label+='\u2026'}
		}
		var dt='';
		try{dt=parent.htConvertDate(cal,loc,e.time)}catch(ex){try{dt=new Date(e.time*1000).toLocaleString(loc)}catch(ex2){dt=''}}
		t+='<tr><td>'+(i+1)+'</td><td>'+escapeHtml(e.page)+'</td><td><a href="'+escapeHtml(href)+'" onclick="event.preventDefault();(parent.open||window.open)(this.href)">'+escapeHtml(label)+'</a></td><td>'+(e.lang||'-')+'</td><td>'+escapeHtml(dt)+'</td></tr>';
	}
	t+='</table>';
	h.innerHTML=t;
}).catch(function(){document.getElementById('favs').innerHTML='<p class="empty">'+l.err+'</p>'});
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
</script>
</body></html>`, lang, cal)
}

func readFavoritesLocked() []historyEntry {
	f, err := os.Open(favoritesFile)
	if err != nil {
		return nil
	}
	defer f.Close()

	rd := csv.NewReader(f)
	records, err := rd.ReadAll()
	if err != nil {
		log.Printf("Warning: corrupt favorites.csv: %v", err)
		return nil
	}

	var entries []historyEntry
	for _, rec := range records {
		if len(rec) < 4 {
			continue
		}
		var t int64
		fmt.Sscanf(rec[3], "%d", &t)
		title := ""
		if len(rec) >= 5 {
			title = rec[4]
		}
		lang := ""
		if len(rec) >= 6 {
			lang = rec[5]
		}
		cal := ""
		if len(rec) >= 7 {
			cal = rec[6]
		}
		entries = append(entries, historyEntry{
			Page: rec[0], ArgUUID: rec[1], People: rec[2],
			Time: t, Title: title, Lang: lang, Cal: cal,
		})
	}
	return entries
}

func writeFavoritesLocked(entries []historyEntry) {
	f, err := os.Create(favoritesFile)
	if err != nil {
		log.Printf("Warning: cannot write favorites.csv: %v", err)
		return
	}
	defer f.Close()

	w := csv.NewWriter(f)
	for _, e := range entries {
		w.Write([]string{e.Page, e.ArgUUID, e.People, fmt.Sprintf("%d", e.Time), e.Title, e.Lang, e.Cal})
	}
	w.Flush()
}

func readHistoryLocked() []historyEntry {
	f, err := os.Open(historyFile)
	if err != nil {
		return nil
	}
	defer f.Close()

	rd := csv.NewReader(f)
	records, err := rd.ReadAll()
	if err != nil {
		log.Printf("Warning: corrupt history.csv: %v", err)
		return nil
	}

	var entries []historyEntry
	for _, rec := range records {
		if len(rec) < 4 {
			continue
		}
		if !allowedPage(rec[0]) {
			continue
		}
		var t int64
		fmt.Sscanf(rec[3], "%d", &t)
		title := ""
		if len(rec) >= 5 {
			title = rec[4]
		}
		lang := ""
		if len(rec) >= 6 {
			lang = rec[5]
		}
		cal := ""
		if len(rec) >= 7 {
			cal = rec[6]
		}
		entries = append(entries, historyEntry{
			Page:    rec[0],
			ArgUUID: rec[1],
			People:  rec[2],
			Time:    t,
			Title:   title,
			Lang:    lang,
			Cal:     cal,
		})
	}
	if len(entries) > 256 {
		entries = entries[len(entries)-256:]
	}
	return entries
}

func writeHistoryLocked(entries []historyEntry) {
	f, err := os.Create(historyFile)
	if err != nil {
		log.Printf("Warning: cannot write history.csv: %v", err)
		return
	}
	defer f.Close()

	w := csv.NewWriter(f)
	for _, e := range entries {
		w.Write([]string{e.Page, e.ArgUUID, e.People, fmt.Sprintf("%d", e.Time), e.Title, e.Lang, e.Cal})
	}
	w.Flush()
}

type liveDir struct{}

func (liveDir) Open(name string) (http.File, error) {
	return http.Dir(contentDir).Open(name)
}

func main() {
	hideConsole()

	port := flag.Int("port", 0, "HTTP port (0 = random available)")
	listen := flag.Int("listen", -1, "Static port in range 1-65535 (-1 = use -port)")
	path := flag.String("path", "", "Content directory (overrides -dir when set)")
	dir := flag.String("dir", "www", "Content directory to serve")
	lang := flag.String("lang", "", "Initial language (e.g. en-US, pt-BR, es-ES)")
	cal := flag.String("calendar", "", "Initial calendar (e.g. gregory, julian, hebrew, islamic, persian, french, shaka, hispanic, mesoamerican, emesoamerican, aymara, inca, chinese, javanese, japanese)")
	class := flag.String("class", "", "Initial class content UUID (e.g. d290f1ee-6c54-4b01-90e6-d701748f0851)")
	logFile := flag.String("log", "", "File to write access logs (default: no access log)")
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, "Usage: historytracers [options]\n\nOptions:\n")
		flag.PrintDefaults()
	}
	flag.Parse()

	contentDir = *dir
	if *path != "" {
		contentDir = *path
	}

	if *logFile != "" {
		f, err := os.Create(*logFile)
		if err != nil {
			log.Fatalf("Cannot open log file: %v", err)
		}
		accessLog = log.New(f, "", log.LstdFlags)
	} else {
		accessLog = log.New(io.Discard, "", log.LstdFlags)
	}

	initDataDir()
	initOptions()
	savedOptions = readOptions()

	if *lang == "" && savedOptions.Lang != "" {
		*lang = savedOptions.Lang
	}
	if *cal == "" && savedOptions.Cal != "" {
		*cal = savedOptions.Cal
	}
	if *listen == -1 && savedOptions.Port != "" {
		if p, err := strconv.Atoi(savedOptions.Port); err == nil && p >= 1 && p <= 65535 {
			*listen = p
		}
	}

	effectivePort := *port
	if *listen >= 1 && *listen <= 65535 {
		effectivePort = *listen
	}
	addr := resolveAddr(effectivePort)
	if *class != "" {
		pageURL = buildPageURL(addr, *class, *lang, *cal)
	} else if savedOptions.Home != "" && strings.HasPrefix(strings.TrimLeft(savedOptions.Home, "/"), "index.html") {
		trimmed := strings.TrimLeft(savedOptions.Home, "/")
		u := fmt.Sprintf("http://%s/%s", addr, trimmed)
		sep := "?"
		if strings.Contains(trimmed, "?") {
			sep = "&"
		}
		if *lang != "" {
			u += sep + "lang=" + url.QueryEscape(*lang)
			sep = "&"
		}
		if *cal != "" {
			u += sep + "cal=" + url.QueryEscape(*cal)
		}
		pageURL = u
	} else {
		pageURL = buildPageURL(addr, "", *lang, *cal)
	}

	if *lang != "" {
		langJS := "window.__ht_lang='" + *lang + "';"
		welcomePage = langJS + welcomePage
		addressBarJS = langJS + addressBarJS
	}
	if *cal != "" {
		calJS := "window.__ht_cal='" + *cal + "';"
		welcomePage = calJS + welcomePage
		addressBarJS = calJS + addressBarJS
	}
	if savedOptions.Home != "" {
		homeJS := "window.__ht_home='" + strings.ReplaceAll(savedOptions.Home, "'", "\\'") + "';"
		welcomePage = homeJS + welcomePage
		addressBarJS = homeJS + addressBarJS
	}

	initHistory()
	initFavorites()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/history/add", historyAddHandler)
	mux.HandleFunc("/api/history/list", historyListHandler)
	mux.HandleFunc("/api/history/page", historyPageHandler)
	mux.HandleFunc("/api/favorites/add", favoritesAddHandler)
	mux.HandleFunc("/api/favorites/list", favoritesListHandler)
	mux.HandleFunc("/api/favorites/page", favoritesPageHandler)
	mux.HandleFunc("/api/open/external", openExternalHandler)
	mux.HandleFunc("/api/dev/log", devLogHandler)
	mux.HandleFunc("/api/dev/page", devPageHandler)
	mux.HandleFunc("/api/options/page", optionsPageHandler)
	mux.HandleFunc("/api/options", optionsHandler)
	mux.HandleFunc("/metrics", metricsHandler)
	mux.Handle("/", metricsMiddleware(logMiddleware(http.FileServer(liveDir{}))))

	srv = &http.Server{Addr: addr, Handler: mux}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	fmt.Printf("HistoryTracers Viewer  %s\n", pageURL)

	runWindow()

	srv.Close()
	fmt.Println("Stopped.")
}

func buildPageURL(addr, class, lang, cal string) string {
	u := fmt.Sprintf("http://%s/index.html", addr)
	sep := "?"
	if class != "" {
		u += sep + "page=class_content&arg=" + url.QueryEscape(class)
		sep = "&"
	}
	if lang != "" {
		u += sep + "lang=" + url.QueryEscape(lang)
		sep = "&"
	}
	if cal != "" {
		u += sep + "cal=" + url.QueryEscape(cal)
	}
	return u
}

func resolveAddr(port int) string {
	if port >= 1 && port <= 65535 {
		l, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", port))
		if err == nil {
			l.Close()
			return fmt.Sprintf("127.0.0.1:%d", port)
		}
		log.Printf("Warning: port %d unavailable (%v), falling back to random port", port, err)
	}
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatalf("Cannot find free port: %v", err)
	}
	addr := l.Addr().(*net.TCPAddr)
	l.Close()
	return fmt.Sprintf("127.0.0.1:%d", addr.Port)
}

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (w *statusWriter) WriteHeader(code int) {
	w.status = code
	w.ResponseWriter.WriteHeader(code)
}

func logMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sw := &statusWriter{ResponseWriter: w, status: 200}
		next.ServeHTTP(sw, r)
		accessLog.Printf("%s %s %d", r.Method, r.URL.Path, sw.status)
	})
}
