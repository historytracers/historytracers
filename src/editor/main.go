package main

import (
	"crypto/rand"
	"encoding/hex"
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
	"path"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

var srv *http.Server
var pageURL string
var contentDir string
var rootDir string
var accessLog *log.Logger
var viewerToken string

func checkToken(r *http.Request) bool {
	return r.Header.Get("X-HT-Token") == viewerToken
}

func rotateToken() string {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err == nil {
		viewerToken = hex.EncodeToString(buf)
	} else {
		viewerToken = "insecure-fallback-token"
	}
	return viewerToken
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
		if !checkToken(r) {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
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

		for i, j := 0, len(entries)-1; i < j; i, j = i+1, j-1 {
			entries[i], entries[j] = entries[j], entries[i]
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(entries)

	case http.MethodDelete:
		devMu.Lock()
		devLog = nil
		devMu.Unlock()
		w.WriteHeader(http.StatusNoContent)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func parseInt64(s string) int64 {
	var n int64
	fmt.Sscanf(s, "%d", &n)
	return n
}

func devPageHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprint(w, devPageHTML)
}

var devPageHTML = `<!DOCTYPE html>
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
</style></head><body>
<script>
var loc=window.__ht_loc||navigator.language||'en-US';
var L={'pt-BR':{console:'Console',network:'Rede',noErrors:'Nenhum erro encontrado.',noNetwork:'Nenhuma requisi\u00e7\u00e3o capturada.',clear:'Limpar',title:'Ferramentas'},'es-ES':{console:'Consola',network:'Red',noErrors:'No se capturaron errores.',noNetwork:'No se capturaron solicitudes.',clear:'Limpiar',title:'Herramientas'}};
var lu=L[loc]||L[loc.substring(0,2)]||{console:'Console',network:'Network',noErrors:'No errors captured.',noNetwork:'No network requests captured.',clear:'Clear',title:'DevTools'};
document.title=lu.title;
document.write('<div class="tabs"><div class="tab active" onclick="switchTab(0)">'+lu.console+'</div><div class="tab" onclick="switchTab(1)">'+lu.network+'</div><button class="btn" onclick="clearLog()">'+lu.clear+'</button></div><div class="content" id="console"></div><div class="content" id="network" style="display:none"></div>');
var log=[];
function switchTab(i){document.querySelectorAll('.tab').forEach(function(t,j){t.className=j==i?'tab active':'tab'});document.getElementById('console').style.display=i==0?'':'none';document.getElementById('network').style.display=i==1?'':'none'}
function clearLog(){fetch('/api/dev/log',{method:'DELETE'}).then(function(){log=[];render()})}
function fetchLog(){fetch('/api/dev/log').then(function(r){return r.json()}).then(function(e){log=e;render()})}
function render(){var c=document.getElementById('console'),n=document.getElementById('network');c.innerHTML='';n.innerHTML='';var ec=0,nc=0;for(var i=0;i<log.length;i++){var e=log[i];var d=new Date(e.time).toLocaleTimeString();if(e.type==='error'){ec++;c.innerHTML+='<div class="entry entry-error"><span class="ts">'+d+'</span><span class="msg">'+esc(e.message)+'</span><br><span class="meta">'+esc(e.url)+'</span></div>'}else if(e.type==='network'){nc++;n.innerHTML+='<div class="entry entry-network"><span class="ts">'+d+'</span><span class="url">'+esc(e.url)+'</span><br><span class="meta">'+esc(e.method)+' '+(e.status?'<span class="'+(e.status>=200&&e.status<300?'ok':'fail')+'">'+e.status+'</span>':'')+(e.duration?' '+e.duration+'ms':'')+'</span></div>'}}if(ec===0)c.innerHTML='<div style="padding:8px;color:#666;font-style:italic">'+lu.noErrors+'</div>';if(nc===0)n.innerHTML='<div style="padding:8px;color:#666;font-style:italic">'+lu.noNetwork+'</div>'}
function esc(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
setInterval(fetchLog,1000);fetchLog();
</script></body></html>`

var allowedEditExts = map[string]bool{
	".html": true, ".css": true, ".js": true, ".json": true,
	".md": true, ".txt": true,
}

func isAllowedEditFile(filePath string) bool {
	ext := strings.ToLower(path.Ext(filePath))
	return allowedEditExts[ext]
}

func validateEditPath(filePath string) (string, error) {
	clean := path.Clean(filePath)
	if strings.Contains(clean, "..") || path.IsAbs(clean) {
		return "", fmt.Errorf("invalid path")
	}
	abs := filepath.Join(rootDir, clean)
	absRoot, _ := filepath.Abs(rootDir)
	absFile, err := filepath.Abs(abs)
	if err != nil {
		return "", fmt.Errorf("invalid path: %v", err)
	}
	if !strings.HasPrefix(absFile, absRoot) {
		return "", fmt.Errorf("path outside project root")
	}
	if !isAllowedEditFile(clean) {
		return "", fmt.Errorf("file type not allowed for editing")
	}
	return absFile, nil
}

func dirHasAllowedFiles(dir string) bool {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return false
	}
	for _, e := range entries {
		name := e.Name()
		if strings.HasPrefix(name, ".") {
			continue
		}
		if e.IsDir() {
			if name == ".git" || name == ".svn" || name == "node_modules" || name == "build" || name == "target" || name == ".cache" {
				continue
			}
			if dirHasAllowedFiles(filepath.Join(dir, name)) {
				return true
			}
		} else if isAllowedEditFile(name) {
			return true
		}
	}
	return false
}

func editorTreeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	basePath := r.URL.Query().Get("path")
	if basePath == "" {
		basePath = "."
	}
	clean := path.Clean(basePath)
	if strings.Contains(clean, "..") || path.IsAbs(clean) {
		http.Error(w, `[]`, http.StatusBadRequest)
		return
	}
	abs := filepath.Join(rootDir, clean)
	info, err := os.Stat(abs)
	if err != nil || !info.IsDir() {
		http.Error(w, `[]`, http.StatusBadRequest)
		return
	}
	entries, err := os.ReadDir(abs)
	if err != nil {
		http.Error(w, `[]`, http.StatusInternalServerError)
		return
	}
	result := make([]map[string]interface{}, 0)
	for _, e := range entries {
		name := e.Name()
		if strings.HasPrefix(name, ".") {
			continue
		}
		if e.IsDir() {
			if !dirHasAllowedFiles(filepath.Join(abs, name)) {
				continue
			}
		} else if !isAllowedEditFile(name) {
			continue
		}
		relPath := path.Join(clean, name)
		item := map[string]interface{}{
			"name": name,
			"path": relPath,
			"dir":  e.IsDir(),
		}
		if !e.IsDir() {
			item["editable"] = true
		}
		result = append(result, item)
	}
	json.NewEncoder(w).Encode(result)
}

func editorReadHandler(w http.ResponseWriter, r *http.Request) {
	fileParam := r.URL.Query().Get("file")
	if fileParam == "" {
		http.Error(w, "missing file", http.StatusBadRequest)
		return
	}
	absPath, err := validateEditPath(fileParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	data, err := os.ReadFile(absPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"content": string(data),
		"path":    fileParam,
	})
}

func editorSaveHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if !checkToken(r) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	fileParam := r.FormValue("file")
	content := r.FormValue("content")
	if fileParam == "" {
		http.Error(w, "missing file", http.StatusBadRequest)
		return
	}
	absPath, err := validateEditPath(fileParam)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := os.WriteFile(absPath, []byte(content), 0644); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	rotateToken()
	w.Header().Set("X-HT-Next-Token", viewerToken)
	w.WriteHeader(http.StatusNoContent)
}

var projectFiles map[string]bool

func initProjectFiles() {
	projectFiles = make(map[string]bool)
	err := filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			name := info.Name()
			if name == ".git" || name == ".svn" || name == "node_modules" || name == "build" || name == "target" || name == ".cache" {
				return filepath.SkipDir
			}
			return nil
		}
		rel, err := filepath.Rel(rootDir, path)
		if err != nil {
			return nil
		}
		projectFiles["/"+filepath.ToSlash(rel)] = true
		return nil
	})
	if err != nil {
		log.Printf("Warning: cannot scan %s: %v", rootDir, err)
	}
}

func isAllowedProjectFile(name string) bool {
	clean := path.Clean(name)
	if projectFiles[clean] {
		return true
	}
	if clean == "/" || clean == "." {
		return true
	}
	if clean == "index.html" && projectFiles["/index.html"] {
		return true
	}
	return false
}

type projectFS struct{}

func (projectFS) Open(name string) (http.File, error) {
	if !isAllowedProjectFile(name) {
		return nil, os.ErrNotExist
	}
	return http.Dir(rootDir).Open(name)
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

func main() {
	hideConsole()

	port := flag.Int("port", 0, "HTTP port (0 = random available)")
	listen := flag.Int("listen", -1, "Static port")
	dir := flag.String("dir", "www", "Content directory to serve (for viewing)")
	root := flag.String("root", "", "Project root for editing (default: parent of content dir)")
	lang := flag.String("lang", "", "Initial language (en-US, pt-BR, es-ES)")
	logFile := flag.String("log", "", "Access log file")
	flag.Parse()

	contentDir = *dir
	rootDir = *root
	if rootDir == "" {
		absContent, _ := filepath.Abs(contentDir)
		rootDir = filepath.Dir(absContent)
	}
	initProjectFiles()

	if *logFile != "" {
		f, err := os.Create(*logFile)
		if err != nil {
			log.Fatalf("Cannot open log file: %v", err)
		}
		accessLog = log.New(f, "", log.LstdFlags)
	} else {
		accessLog = log.New(io.Discard, "", log.LstdFlags)
	}

	{
		buf := make([]byte, 32)
		if _, err := rand.Read(buf); err == nil {
			viewerToken = hex.EncodeToString(buf)
		} else {
			viewerToken = "insecure-fallback-token"
		}
	}

	addr := resolveAddr(*port, *listen)
	pageURL = buildPageURL(addr, *lang)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/editor/tree", editorTreeHandler)
	mux.HandleFunc("/api/editor/read", editorReadHandler)
	mux.HandleFunc("/api/editor/save", editorSaveHandler)
	mux.HandleFunc("/api/open/external", openExternalHandler)
	mux.HandleFunc("/api/dev/log", devLogHandler)
	mux.HandleFunc("/api/dev/page", devPageHandler)
	mux.Handle("/", logMiddleware(http.FileServer(projectFS{})))

	srv = &http.Server{Addr: addr, Handler: mux}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	fmt.Printf("HistoryTracers Editor  %s\n", pageURL)

	runWindow()

	srv.Close()
	fmt.Println("Stopped.")
}

func buildPageURL(addr, lang string) string {
	u := fmt.Sprintf("http://%s/editor.html", addr)
	if lang != "" {
		u += "?lang=" + url.QueryEscape(lang)
	}
	return u
}

func resolveAddr(port, listen int) string {
	effectivePort := port
	if listen >= 1 && listen <= 65535 {
		effectivePort = listen
	}
	if effectivePort >= 1 && effectivePort <= 65535 {
		l, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", effectivePort))
		if err == nil {
			l.Close()
			return fmt.Sprintf("127.0.0.1:%d", effectivePort)
		}
		log.Printf("Warning: port %d unavailable (%v)", effectivePort, err)
	}
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatalf("Cannot find free port: %v", err)
	}
	addr := l.Addr().(*net.TCPAddr)
	l.Close()
	return fmt.Sprintf("127.0.0.1:%d", addr.Port)
}
