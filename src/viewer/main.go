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
		data := optionsData{
			Lang:    r.FormValue("lang"),
			Cal:     r.FormValue("cal"),
			Recreio: r.FormValue("recreio"),
			Home:    r.FormValue("home"),
		}
		writeOptionsLocked(data)
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "Method not allowed", 405)
	}
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
	path := flag.String("path", "", "Content directory (overrides -dir when set)")
	dir := flag.String("dir", "www", "Content directory to serve")
	lang := flag.String("lang", "", "Initial language (e.g. en-US, pt-BR, es-ES)")
	cal := flag.String("calendar", "", "Initial calendar (e.g. gregory, julian, hebrew, islamic, persian, french, shaka, hispanic, mesoamerican, emesoamerican)")
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

	addr := resolveAddr(*port)
	if *class != "" {
		pageURL = buildPageURL(addr, *class, *lang, *cal)
	} else if savedOptions.Home != "" {
		u := fmt.Sprintf("http://%s/%s", addr, strings.TrimLeft(savedOptions.Home, "/"))
		sep := "?"
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
	mux.HandleFunc("/api/options", optionsHandler)
	mux.Handle("/", logMiddleware(http.FileServer(liveDir{})))

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
	if port > 0 {
		return fmt.Sprintf("127.0.0.1:%d", port)
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
