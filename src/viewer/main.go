package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
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
	historyMu   sync.Mutex
	historyFile string
)

func initHistory() {
	home, err := os.UserHomeDir()
	if err != nil {
		log.Printf("Warning: cannot get home directory for history: %v", err)
		historyFile = ""
		return
	}
	historyFile = filepath.Join(home, "history.csv")
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

	addr := resolveAddr(*port)
	pageURL = buildPageURL(addr, *class, *lang, *cal)

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

	initHistory()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/history/add", historyAddHandler)
	mux.HandleFunc("/api/history/list", historyListHandler)
	mux.HandleFunc("/api/history/page", historyPageHandler)
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
