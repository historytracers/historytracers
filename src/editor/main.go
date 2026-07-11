// SPDX-License-Identifier: GPL-3.0-or-later
package main

import (
	"bytes"
	"crypto/rand"
	"database/sql"
	"encoding/gob"
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

	git "github.com/go-git/go-git/v5"

	"github.com/google/uuid"
	"github.com/historytracers/common"
	_ "modernc.org/sqlite"
)

var srv *http.Server
var pageURL string
var contentDir string
var rootDir string
var accessLog *log.Logger
var viewerToken string
var tlsCertFile string
var tlsKeyFile string
var useTLS bool

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
	sessionID := r.Header.Get("X-HT-Session")
	fileLocksMu.Lock()
	fileLocks[fileParam] = sessionID
	fileLocksMu.Unlock()
	data, err := os.ReadFile(absPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"content": string(data),
		"path":    fileParam,
		"locked":  false,
	})
}

func editorSaveHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
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
	content = strings.ReplaceAll(content, "\r\n", "\n")

	if strings.HasPrefix(fileParam, ".ht_src_cache/") {
		uuidStr := strings.TrimSuffix(filepath.Base(fileParam), ".json")
		if err := htSaveSourceFileToDB(uuidStr, []byte(content)); err != nil {
			log.Printf("ERROR saving source to DB: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	if err := os.WriteFile(absPath, []byte(content), 0644); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	rotateToken()
	w.Header().Set("X-HT-Next-Token", viewerToken)
	w.WriteHeader(http.StatusNoContent)
}

func editorUnlockHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	fileParam := r.FormValue("file")
	sessionID := r.Header.Get("X-HT-Session")
	if fileParam == "" || sessionID == "" {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	fileLocksMu.Lock()
	if fileLocks[fileParam] == sessionID {
		delete(fileLocks, fileParam)
	}
	fileLocksMu.Unlock()
	w.WriteHeader(http.StatusNoContent)
}

var projectFiles map[string]bool

var (
	fileLocks   map[string]string
	fileLocksMu sync.Mutex
)

var editorLangs = []string{"en-US", "es-ES", "pt-BR"}

func copyFile(dst, src string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, in)
	return err
}

type indexContentItem struct {
	ID        string `json:"id"`
	Value     string `json:"value,omitempty"`
	HTMLValue string `json:"html_value,omitempty"`
}

type indexFile struct {
	Title   string             `json:"title"`
	Header  string             `json:"header"`
	Content []indexContentItem `json:"content"`
}

func updateFeedInAllLangs(pageType string, arg string, displayName string) {
	link := fmt.Sprintf(`<a href="index.html?page=%s&arg=%s" onclick="htLoadPage('%s','html', '%s', false); return false;">%s</a>`, pageType, arg, pageType, arg, displayName)
	for _, lang := range editorLangs {
		idxPath := filepath.Join(rootDir, "lang", lang, "index.json")
		data, err := os.ReadFile(idxPath)
		if err != nil {
			continue
		}
		var idx indexFile
		if err := json.Unmarshal(data, &idx); err != nil {
			continue
		}
		found := false
		for i := range idx.Content {
			if idx.Content[i].ID == "sbFeed" {
				idx.Content[i].HTMLValue = link
				found = true
				break
			}
		}
		if !found {
			continue
		}
		tmpPath := filepath.Join(rootDir, "lang", lang, arg+"_idx.tmp")
		fp, err := os.Create(tmpPath)
		if err != nil {
			continue
		}
		e := json.NewEncoder(fp)
		e.SetEscapeHTML(false)
		e.SetIndent("", "   ")
		if err := e.Encode(idx); err != nil {
			fp.Close()
			os.Remove(tmpPath)
			continue
		}
		fp.Close()
		if err := copyFile(idxPath, tmpPath); err != nil {
			os.Remove(tmpPath)
			continue
		}
		os.Remove(tmpPath)
	}
}

func htInsertSourceFileEntry(fileID string, description string) error {
	dbPath := filepath.Join(rootDir, "lang", "sources", "history_tracers.db")

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		return fmt.Errorf("database not found: %s", dbPath)
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	_, err = db.Exec(`INSERT OR IGNORE INTO files (fil_id, fil_desc) VALUES (?, ?)`, fileID, description)
	if err != nil {
		return fmt.Errorf("failed to insert file entry: %w", err)
	}

	return nil
}

func createClassHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	className := r.FormValue("className")
	if className == "" {
		http.Error(w, "missing className", http.StatusBadRequest)
		return
	}
	id := uuid.New()
	strID := id.String()

	tplPath := filepath.Join(rootDir, "src", "json", "class_template.json")
	data, err := os.ReadFile(tplPath)
	if err != nil {
		log.Printf("ERROR createClass: cannot read template %s: %v", tplPath, err)
		http.Error(w, fmt.Sprintf("cannot read template: %v", err), http.StatusInternalServerError)
		return
	}
	var tpl common.ClassTemplateFile
	if err := json.Unmarshal(data, &tpl); err != nil {
		log.Printf("ERROR createClass: invalid template %s: %v", tplPath, err)
		http.Error(w, fmt.Sprintf("invalid template: %v", err), http.StatusInternalServerError)
		return
	}
	common.HTSetDefaultClassTemplateValues(&tpl, strID, className)

	for _, lang := range editorLangs {
		langPath := filepath.Join(rootDir, "lang", lang)
		if err := os.MkdirAll(langPath, 0755); err != nil {
			log.Printf("ERROR createClass: mkdir %s: %v", langPath, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		tplFile := filepath.Join(langPath, strID+".json")
		fp, err := os.Create(tplFile)
		if err != nil {
			log.Printf("ERROR createClass: create %s: %v", tplFile, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		e := json.NewEncoder(fp)
		e.SetEscapeHTML(false)
		e.SetIndent("", "   ")
		if err := e.Encode(tpl); err != nil {
			fp.Close()
			os.Remove(tplFile)
			log.Printf("ERROR createClass: encode %s: %v", tplFile, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fp.Close()

		idxPath := filepath.Join(rootDir, "lang", lang, className+".json")
		idxData, err := os.ReadFile(idxPath)
		if err != nil {
			log.Printf("ERROR createClass: cannot read index %s: %v", idxPath, err)
			http.Error(w, fmt.Sprintf("cannot read index %s: %v", idxPath, err), http.StatusInternalServerError)
			return
		}
		var idx common.ClassIdx
		if err := json.Unmarshal(idxData, &idx); err != nil {
			log.Printf("ERROR createClass: invalid index %s: %v", idxPath, err)
			http.Error(w, fmt.Sprintf("invalid index: %v", err), http.StatusInternalServerError)
			return
		}
		common.HTAddNewClassToIdx(&idx, strID)
		if len(idx.LastUpdate) == 0 {
			idx.LastUpdate = []string{common.HTUpdateTimestamp()}
		} else {
			idx.LastUpdate[0] = common.HTUpdateTimestamp()
		}

		tmpPath := filepath.Join(rootDir, "lang", lang, strID+"_idx.tmp")
		fp2, err := os.Create(tmpPath)
		if err != nil {
			log.Printf("ERROR createClass: create tmp %s: %v", tmpPath, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		e2 := json.NewEncoder(fp2)
		e2.SetEscapeHTML(false)
		e2.SetIndent("", "   ")
		if err := e2.Encode(idx); err != nil {
			fp2.Close()
			os.Remove(tmpPath)
			log.Printf("ERROR createClass: encode tmp %s: %v", tmpPath, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fp2.Close()
		if err := copyFile(idxPath, tmpPath); err != nil {
			os.Remove(tmpPath)
			log.Printf("ERROR createClass: copy %s <- %s: %v", idxPath, tmpPath, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		os.Remove(tmpPath)
	}

	if err := htInsertSourceFileEntry(strID, className); err != nil {
		log.Printf("ERROR createClass: insert source entry: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	jsSrc := filepath.Join(rootDir, "src", "js", "ht_classes.js")
	jsDst := filepath.Join(rootDir, "js", strID+".js")
	if err := os.MkdirAll(filepath.Join(rootDir, "js"), 0755); err != nil {
		log.Printf("ERROR createClass: mkdir js: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := copyFile(jsDst, jsSrc); err != nil {
		log.Printf("ERROR createClass: copy js %s <- %s: %v", jsDst, jsSrc, err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	updateFeedInAllLangs("class_content", strID, className)
	rotateToken()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-HT-Next-Token", viewerToken)
	json.NewEncoder(w).Encode(map[string]string{"uuid": strID})
}

func createFamilyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	id := uuid.New()
	strID := id.String()

	tplPath := filepath.Join(rootDir, "src", "json", "family_template.json")
	data, err := os.ReadFile(tplPath)
	if err != nil {
		http.Error(w, fmt.Sprintf("cannot read template: %v", err), http.StatusInternalServerError)
		return
	}
	var family common.Family
	if err := json.Unmarshal(data, &family); err != nil {
		http.Error(w, fmt.Sprintf("invalid template: %v", err), http.StatusInternalServerError)
		return
	}

	for _, lang := range editorLangs {
		common.HTNewFamilySetDefaultValues(&family, lang, strID)

		langPath := filepath.Join(rootDir, "lang", lang)
		os.MkdirAll(langPath, 0755)
		famFile := filepath.Join(langPath, strID+".json")
		fp, err := os.Create(famFile)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		e := json.NewEncoder(fp)
		e.SetEscapeHTML(false)
		e.SetIndent("", "   ")
		e.Encode(family)
		fp.Close()

		idxPath := filepath.Join(rootDir, "lang", lang, "families.json")
		idxData, err := os.ReadFile(idxPath)
		if err != nil {
			http.Error(w, fmt.Sprintf("cannot read index %s: %v", idxPath, err), http.StatusInternalServerError)
			return
		}
		var idx common.IdxFamily
		if err := json.Unmarshal(idxData, &idx); err != nil {
			http.Error(w, fmt.Sprintf("invalid index: %v", err), http.StatusInternalServerError)
			return
		}
		common.HTAddNewFamilyToIdx(&idx, strID, lang)
		idx.LastUpdate[0] = common.HTUpdateTimestamp()

		tmpPath := filepath.Join(rootDir, "lang", lang, strID+"_idx.tmp")
		fp2, err := os.Create(tmpPath)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		e2 := json.NewEncoder(fp2)
		e2.SetEscapeHTML(false)
		e2.SetIndent("", "   ")
		e2.Encode(idx)
		fp2.Close()
		if err := copyFile(idxPath, tmpPath); err != nil {
			os.Remove(tmpPath)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		os.Remove(tmpPath)
	}

	if err := htInsertSourceFileEntry(strID, strID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	jsSrc := filepath.Join(rootDir, "src", "js", "ht_classes.js")
	jsDst := filepath.Join(rootDir, "js", strID+".js")
	os.MkdirAll(filepath.Join(rootDir, "js"), 0755)
	if err := copyFile(jsDst, jsSrc); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	updateFeedInAllLangs("tree", strID, strID)
	rotateToken()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-HT-Next-Token", viewerToken)
	json.NewEncoder(w).Encode(map[string]string{"uuid": strID})
}

func createSmartphoneHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	id := uuid.New()
	strID := id.String()

	tplPath := filepath.Join(rootDir, "src", "json", "scientific_method_game_template.json")
	data, err := os.ReadFile(tplPath)
	if err != nil {
		log.Printf("ERROR createSmartphone: cannot read template %s: %v", tplPath, err)
		http.Error(w, fmt.Sprintf("cannot read template: %v", err), http.StatusInternalServerError)
		return
	}
	var tpl common.SMGameFile
	if err := json.Unmarshal(data, &tpl); err != nil {
		log.Printf("ERROR createSmartphone: invalid template %s: %v", tplPath, err)
		http.Error(w, fmt.Sprintf("invalid template: %v", err), http.StatusInternalServerError)
		return
	}

	tpl.Sources = []string{strID}
	tpl.License = []string{"SPDX-License-Identifier: GPL-3.0-or-later"}
	tpl.LastUpdate = []string{common.HTUpdateTimestamp()}
	tpl.Authors = ""
	tpl.Reviewers = ""
	tpl.Version = 1
	tpl.Type = "sm_game"
	tpl.Content = []common.SMGameContent{}
	tpl.Levels = []common.SMGameLevel{}
	tpl.DateTime = []common.HTDate{}

	for _, lang := range editorLangs {
		smartphoneDir := filepath.Join(rootDir, "lang", lang, "smartphone")
		if err := os.MkdirAll(smartphoneDir, 0755); err != nil {
			log.Printf("ERROR createSmartphone: mkdir %s: %v", smartphoneDir, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		tplFile := filepath.Join(smartphoneDir, strID+".json")
		fp, err := os.Create(tplFile)
		if err != nil {
			log.Printf("ERROR createSmartphone: create %s: %v", tplFile, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		e := json.NewEncoder(fp)
		e.SetEscapeHTML(false)
		e.SetIndent("", "   ")
		if err := e.Encode(tpl); err != nil {
			fp.Close()
			os.Remove(tplFile)
			log.Printf("ERROR createSmartphone: encode %s: %v", tplFile, err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fp.Close()
	}

	rotateToken()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-HT-Next-Token", viewerToken)
	json.NewEncoder(w).Encode(map[string]string{"uuid": strID})
}

func gitStatusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	type changeEntry struct {
		Path   string `json:"path"`
		Status string `json:"status"`
		Staged bool   `json:"staged"`
	}
	files := make([]changeEntry, 0)
	repo, err := git.PlainOpen(rootDir)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{"files": files, "error": fmt.Sprintf("PlainOpen: %v", err)})
		return
	}
	tree, err := repo.Worktree()
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{"files": files, "error": fmt.Sprintf("Worktree: %v", err)})
		return
	}
	status, err := tree.Status()
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{"files": files, "error": fmt.Sprintf("Status: %v", err)})
		return
	}
	for path, fs := range status {
		if fs.Worktree == git.Deleted || fs.Staging == git.Deleted {
			continue
		}
		if !isAllowedEditFile(path) {
			continue
		}
		var st string
		staged := false
		switch {
		case fs.Staging != git.Untracked:
			st = string(fs.Staging)
			staged = true
		case fs.Worktree != git.Untracked:
			st = string(fs.Worktree)
		default:
			st = "??"
		}
		files = append(files, changeEntry{
			Path:   path,
			Status: st,
			Staged: staged,
		})
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"files": files})
}

var (
	sessionMu    sync.Mutex
	sessionFile  string
	dataDir      string
	optionsFile  string
	savedOptions optionsData
)

type optionsData struct {
	Lang         string `json:"lang"`
	Port         string `json:"port"`
	TLSCert      string `json:"tls_cert"`
	TLSKey       string `json:"tls_key"`
	OpenNewFiles bool   `json:"open_new_files"`
	Design       string `json:"design"`
}

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
	if dataDir != "" {
		sessionFile = filepath.Join(dataDir, "session.json")
		optionsFile = filepath.Join(dataDir, "editor_options.json")
	}
}

func readEditorOptions() optionsData {
	if optionsFile == "" {
		return optionsData{}
	}
	b, err := os.ReadFile(optionsFile)
	if err != nil {
		return optionsData{}
	}
	var data optionsData
	if err := json.Unmarshal(b, &data); err != nil {
		return optionsData{}
	}
	validateEditorOptions(&data)
	return data
}

func writeEditorOptions(data optionsData) {
	if optionsFile == "" {
		return
	}
	validateEditorOptions(&data)
	b, err := json.Marshal(data)
	if err != nil {
		return
	}
	os.WriteFile(optionsFile, b, 0644)
}

func validateEditorOptions(data *optionsData) {
	if data.Lang != "en-US" && data.Lang != "pt-BR" && data.Lang != "es-ES" {
		data.Lang = ""
	}
	if data.Port != "" {
		p := 0
		fmt.Sscanf(data.Port, "%d", &p)
		if p < 1 || p > 65535 {
			data.Port = ""
		}
	}
	if (data.TLSCert != "") != (data.TLSKey != "") {
		data.TLSCert = ""
		data.TLSKey = ""
	}
}

type sessionTab struct {
	Path      string `json:"path"`
	CursorPos int    `json:"cursorPos"`
	ScrollPos int    `json:"scrollPos"`
}

func loadSession() []sessionTab {
	if sessionFile == "" {
		return nil
	}
	sessionMu.Lock()
	defer sessionMu.Unlock()
	b, err := os.ReadFile(sessionFile)
	if err != nil {
		return nil
	}
	var tabs []sessionTab
	if err := json.Unmarshal(b, &tabs); err != nil {
		log.Printf("Warning: corrupt session file: %v", err)
		return nil
	}
	// Filter out tabs whose paths are no longer valid
	valid := tabs[:0]
	for _, t := range tabs {
		if _, err := validateEditPath(t.Path); err == nil {
			valid = append(valid, t)
		}
	}
	return valid
}

func saveSession(tabs []sessionTab) {
	if sessionFile == "" {
		return
	}
	sessionMu.Lock()
	defer sessionMu.Unlock()
	b, err := json.Marshal(tabs)
	if err != nil {
		log.Printf("Warning: cannot marshal session: %v", err)
		return
	}
	if err := os.WriteFile(sessionFile, b, 0644); err != nil {
		log.Printf("Warning: cannot write session: %v", err)
	}
}

func sessionHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		w.Header().Set("Content-Type", "application/json")
		tabs := loadSession()
		if tabs == nil {
			tabs = []sessionTab{}
		}
		json.NewEncoder(w).Encode(tabs)
	case http.MethodPost:
		var tabs []sessionTab
		if err := json.NewDecoder(r.Body).Decode(&tabs); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		saveSession(tabs)
		w.WriteHeader(http.StatusNoContent)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func optionsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(readEditorOptions())
	case http.MethodPost:
		data := readEditorOptions()
		if v := r.FormValue("lang"); v != "" {
			data.Lang = v
		}
		if v := r.FormValue("port"); v != "" {
			data.Port = v
		}
		if v := r.FormValue("tls_cert"); v != "" {
			data.TLSCert = v
		} else {
			data.TLSCert = ""
		}
		if v := r.FormValue("tls_key"); v != "" {
			data.TLSKey = v
		} else {
			data.TLSKey = ""
		}
		if v := r.FormValue("open_new_files"); v != "" {
			data.OpenNewFiles = v == "true" || v == "on" || v == "1"
		}
		if v := r.FormValue("design"); v != "" {
			data.Design = v
		}
		writeEditorOptions(data)
		rotateToken()
		w.Header().Set("X-HT-Next-Token", viewerToken)
		w.WriteHeader(http.StatusNoContent)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func importViewerOptionsHandler(w http.ResponseWriter, r *http.Request) {
	viewerFile := filepath.Join(dataDir, "options.bin")
	var viewerLang, viewerPort string
	f, err := os.Open(viewerFile)
	if err == nil {
		defer f.Close()
		dec := gob.NewDecoder(f)
		var v struct {
			Lang string
			Port string
		}
		if err := dec.Decode(&v); err == nil {
			viewerLang = v.Lang
			viewerPort = v.Port
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"lang": viewerLang, "port": viewerPort})
}

func optionsPageHandler(w http.ResponseWriter, r *http.Request) {
	data := readEditorOptions()
	curLang := data.Lang
	if curLang == "" {
		curLang = "en-US"
	}
	curPort := data.Port
	curTLSCert := data.TLSCert
	curTLSKey := data.TLSKey
	openNewFiles := data.OpenNewFiles
	curDesign := data.Design
	if curDesign == "" {
		curDesign = "default"
	}
	defaultTLSDir := "/etc/historytracers/"
	if runtime.GOOS == "windows" {
		defaultTLSDir = "C:\\ProgramData\\historytracers\\"
	}
	token := r.URL.Query().Get("token")

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	fmt.Fprintf(w, `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>HistoryTracers Editor Config</title>
<style>
*{box-sizing:border-box}
body{font-family:verdana,arial,helvetica;margin:20px;background:#f5f5f5;color:#333}
h2{color:#333;margin-bottom:16px}
.form-group{margin-bottom:14px}
label{display:block;font-weight:bold;margin-bottom:3px;color:#555;font-size:13px}
select,input[type=number]{width:280px;padding:5px 8px;border:1px solid #ccc;border-radius:3px;font:13px/1.4 sans-serif;background:#fff}
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
var portVal=%q;
var tlsCertVal=%q;
var tlsKeyVal=%q;
var certDir=%q;
var token=%q;
var openNewFiles=%q;
var curDesign=%q;
var L={};
L['pt-BR']={title:'Configura\u00e7\u00e3o',langLabel:'Idioma',listenLabel:'Porta',tlsLabel:'Certificado TLS',tlsKeyLabel:'Chave TLS',tlsNote:'Rein\u00edcio necess\u00e1rio para aplicar',apply:'Aplicar',saved:'Configura\u00e7\u00f5es salvas!',err:'Erro ao salvar: ',back:'\u00ab Voltar',importViewer:'Importar do Viewer',imported:'Prefer\u00eancias importadas!',openNewFilesLabel:'Abrir novos arquivos',designLabel:'Design',designDefault:'Padr\u00e3o',designLight:'Claro'};
L['es-ES']={title:'Configuraci\u00f3n',langLabel:'Idioma',listenLabel:'Puerto',tlsLabel:'Certificado TLS',tlsKeyLabel:'Clave TLS',tlsNote:'Reinicio necesario para aplicar',apply:'Aplicar',saved:'\u00a1Configuraci\u00f3n guardada!',err:'Error al guardar: ',back:'\u00ab Volver',importViewer:'Importar del Viewer',imported:'\u00a1Preferencias importadas!',openNewFilesLabel:'Abrir nuevos archivos',designLabel:'Dise\u00f1o',designDefault:'Predeterminado',designLight:'Claro'};
L['en-US']={title:'Configuration',langLabel:'Language',listenLabel:'Listen port',tlsLabel:'TLS Certificate',tlsKeyLabel:'TLS Key',tlsNote:'Restart required to apply',apply:'Apply',saved:'Configuration saved!',err:'Error saving: ',back:'\u00ab Go back',importViewer:'Import from Viewer',imported:'Preferences imported!',openNewFilesLabel:'Open new files',designLabel:'Design',designDefault:'Default',designLight:'Light'};
var l=L[lang]||L[lang.substring(0,2)]||L['en-US'];
document.title=l.title;

var langNames={'en-US':'English (US)','pt-BR':'Portugu\u00eas (BR)','es-ES':'Espa\u00f1ol (ES)'};
var langs=['en-US','pt-BR','es-ES'];

var html='<h2>'+l.title+'</h2>';
html+='<div class="form-group"><label>'+l.langLabel+'</label><select id="opt_lang">';
for(var i=0;i<langs.length;i++){html+='<option value="'+langs[i]+'"'+(langs[i]===lang?' selected':'')+'>'+(langNames[langs[i]]||langs[i])+'</option>'}
html+='</select></div>';
html+='<div class="form-group"><label>'+l.listenLabel+'</label><input type="number" id="opt_port" min="1" max="65535" placeholder="0" value="'+portVal+'"></div>';
html+='<div class="form-group"><label>'+l.tlsLabel+'</label><input type="text" id="opt_tls_cert" placeholder="'+certDir+'cert.pem" value="'+tlsCertVal+'"></div>';
html+='<div class="form-group"><label>'+l.tlsKeyLabel+'</label><input type="text" id="opt_tls_key" placeholder="'+certDir+'key.pem" value="'+tlsKeyVal+'"></div>';
html+='<div style="font-size:12px;color:#999;margin:-8px 0 14px 0">'+l.tlsNote+'</div>';
html+='<div class="form-group"><label><input type="checkbox" id="opt_open_new_files"'+(openNewFiles==='true'?' checked':'')+'> '+l.openNewFilesLabel+'</label></div>';
html+='<div class="form-group"><label>'+l.designLabel+'</label><select id="opt_design"><option value="default"'+(curDesign==='default'?' selected':'')+'>'+l.designDefault+'</option><option value="light"'+(curDesign==='light'?' selected':'')+'>'+l.designLight+'</option></select></div>';
html+='<button class="btn" id="opt_apply">'+l.apply+'</button>';
html+='<button class="btn" id="opt_import" style="margin-left:8px;background:#00695c">'+l.importViewer+'</button>';
html+='<div id="opt_status"></div>';
html+='<div class="back"><a href="#" onclick="event.preventDefault();window.top.location.href=window.location.origin+\'/editor.html\'">'+l.back+'</a></div>';
document.body.innerHTML=html;

document.getElementById('opt_apply').onclick=function(){
	var nl=document.getElementById('opt_lang').value;
	var np=document.getElementById('opt_port').value;
	var tc=document.getElementById('opt_tls_cert').value;
	var tk=document.getElementById('opt_tls_key').value;
	var s=document.getElementById('opt_status');
	s.className='';s.textContent='...';
	var h={'Content-Type':'application/x-www-form-urlencoded'};
	if(token)h['X-HT-Token']=token;
	var nof=document.getElementById('opt_open_new_files').checked?'true':'false';
	var nd=document.getElementById('opt_design').value;
	fetch('/api/editor/options',{method:'POST',headers:h,body:'lang='+encodeURIComponent(nl)+'&port='+encodeURIComponent(np)+'&tls_cert='+encodeURIComponent(tc)+'&tls_key='+encodeURIComponent(tk)+'&open_new_files='+encodeURIComponent(nof)+'&design='+encodeURIComponent(nd)}).then(function(r){
		if(r.ok&&window.parent&&window.parent.htApplyDesign)window.parent.htApplyDesign(nd);
		if(!r.ok)throw new Error(r.status);
		s.className='status';s.textContent=l.saved;
	}).catch(function(e){
		s.className='status error';s.textContent=l.err+e.message;
	});
};
document.getElementById('opt_import').onclick=function(){
	var s=document.getElementById('opt_status');
	s.className='';s.textContent='...';
	fetch('/api/editor/options/import-viewer').then(function(r){return r.json()}).then(function(d){
		if(d.lang){document.getElementById('opt_lang').value=d.lang}
		if(d.port){document.getElementById('opt_port').value=d.port}
		s.className='status';s.textContent=l.imported;
	}).catch(function(e){
		s.className='status error';s.textContent=l.err+e.message;
	});
};
</script>
</body></html>`, curLang, curPort, curTLSCert, curTLSKey, defaultTLSDir, token, fmt.Sprint(openNewFiles), curDesign)
}

func init() {
	fileLocks = make(map[string]string)
}

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
	tlsCert := flag.String("tls-cert", "", "TLS certificate file (enables HTTPS)")
	tlsKey := flag.String("tls-key", "", "TLS key file (enables HTTPS)")
	flag.Parse()

	contentDir = *dir
	rootDir = *root
	if rootDir == "" {
		absContent, _ := filepath.Abs(contentDir)
		rootDir = filepath.Dir(absContent)
	}
	tlsCertFile = *tlsCert
	tlsKeyFile = *tlsKey
	if (tlsCertFile != "") != (tlsKeyFile != "") {
		log.Fatalf("Both -tls-cert and -tls-key must be specified together")
	}
	useTLS = tlsCertFile != "" && tlsKeyFile != ""
	initDataDir()
	initProjectFiles()
	savedOptions = readEditorOptions()
	// Apply saved TLS options if not overridden by CLI
	if tlsCertFile == "" && savedOptions.TLSCert != "" {
		tlsCertFile = savedOptions.TLSCert
	}
	if tlsKeyFile == "" && savedOptions.TLSKey != "" {
		tlsKeyFile = savedOptions.TLSKey
	}
	useTLS = tlsCertFile != "" && tlsKeyFile != ""

	if *lang == "" && savedOptions.Lang != "" {
		*lang = savedOptions.Lang
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

	{
		buf := make([]byte, 32)
		if _, err := rand.Read(buf); err == nil {
			viewerToken = hex.EncodeToString(buf)
		} else {
			viewerToken = "insecure-fallback-token"
		}
	}

	if *listen == -1 && savedOptions.Port != "" && *port == 0 {
		p := 0
		fmt.Sscanf(savedOptions.Port, "%d", &p)
		if p >= 1 && p <= 65535 {
			*port = p
		}
	}

	addr := resolveAddr(*port, *listen)
	pageURL = buildPageURL(addr, *lang)

	mux := http.NewServeMux()
	mux.HandleFunc("/api/editor/tree", editorTreeHandler)
	mux.HandleFunc("/api/editor/read", editorReadHandler)
	mux.HandleFunc("/api/editor/save", editorSaveHandler)
	mux.HandleFunc("/api/editor/unlock", editorUnlockHandler)
	mux.HandleFunc("/api/editor/create-class", createClassHandler)
	mux.HandleFunc("/api/editor/create-family", createFamilyHandler)
	mux.HandleFunc("/api/editor/create-smartphone", createSmartphoneHandler)
	mux.HandleFunc("/api/editor/git-status", gitStatusHandler)
	mux.HandleFunc("/api/editor/session", sessionHandler)
	mux.HandleFunc("/api/editor/related-files", relatedFilesHandler)
	mux.HandleFunc("/api/editor/file-indexes", fileIndexesHandler)
	mux.HandleFunc("/api/editor/options", optionsHandler)
	mux.HandleFunc("/api/editor/options/page", optionsPageHandler)
	mux.HandleFunc("/api/editor/options/import-viewer", importViewerOptionsHandler)
	mux.HandleFunc("/api/open/external", openExternalHandler)
	mux.HandleFunc("/api/dev/log", devLogHandler)
	mux.HandleFunc("/api/dev/page", devPageHandler)
	mux.HandleFunc("/metrics", metricsHandler)
	mux.HandleFunc("/api/editor/viewer", viewHandler)
	fs := http.FileServer(projectFS{})
	mux.Handle("/", logMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.Redirect(w, r, "/editor.html", http.StatusFound)
			return
		}
		fs.ServeHTTP(w, r)
	})))

	srv = &http.Server{Addr: addr, Handler: metricsMiddleware(mux)}

	go func() {
		var err error
		if tlsCertFile != "" && tlsKeyFile != "" {
			err = srv.ListenAndServeTLS(tlsCertFile, tlsKeyFile)
		} else {
			err = srv.ListenAndServe()
		}
		if err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	fmt.Printf("HistoryTracers Editor  %s\n", pageURL)

	runWindow()

	srv.Close()
	fmt.Println("Stopped.")
}

func htBuildSourceFileFromDB(uuid string) ([]byte, error) {
	dbPath := filepath.Join(rootDir, "lang", "sources", "history_tracers.db")

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("database not found: %s", dbPath)
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM files WHERE fil_id = ?", uuid).Scan(&count)
	if err != nil || count == 0 {
		return nil, fmt.Errorf("source file %s not found in database", uuid)
	}

	rows, err := db.Query(`
		SELECT c.cit_type, s.src_id, COALESCE(s.sfo_id, ''), s.src_citation, s.src_date, s.src_publish_date, COALESCE(s.src_url, '')
		FROM citation c
		JOIN sources s ON c.src_id = s.src_id
		WHERE c.fil_id = ?
	`, uuid)
	if err != nil {
		return nil, fmt.Errorf("failed to query sources: %w", err)
	}
	defer rows.Close()

	sf := common.HTSourceFile{
		License:    []string{"SPDX-License-Identifier: GPL-3.0-or-later", "CC BY-NC 4.0 DEED"},
		LastUpdate: []string{""},
		Version:    1,
		Type:       "sources",
	}

	for rows.Next() {
		var citType int
		var elem common.HTSourceElement
		if err := rows.Scan(&citType, &elem.ID, &elem.SfoID, &elem.Citation, &elem.Date, &elem.PublishDate, &elem.URL); err != nil {
			continue
		}
		switch citType {
		case 0:
			sf.PrimarySources = append(sf.PrimarySources, elem)
		case 1:
			sf.ReferencesSources = append(sf.ReferencesSources, elem)
		case 2:
			sf.ReligiousSources = append(sf.ReligiousSources, elem)
		case 3:
			sf.SocialMediaSources = append(sf.SocialMediaSources, elem)
		}
	}

	var buf bytes.Buffer
	e := json.NewEncoder(&buf)
	e.SetEscapeHTML(false)
	e.SetIndent("", "   ")
	if err := e.Encode(sf); err != nil {
		return nil, fmt.Errorf("failed to marshal source file: %w", err)
	}

	return buf.Bytes(), nil
}

func htGenerateSourceTempFile(uuid string) (string, error) {
	data, err := htBuildSourceFileFromDB(uuid)
	if err != nil {
		return "", err
	}

	cacheDir := filepath.Join(rootDir, ".ht_src_cache")
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create cache directory: %w", err)
	}

	dst := filepath.Join(cacheDir, uuid+".json")
	if err := os.WriteFile(dst, data, 0644); err != nil {
		return "", fmt.Errorf("failed to write source file: %w", err)
	}

	return filepath.Join(".ht_src_cache", uuid+".json"), nil
}

func htSaveSourceFileToDB(uuid string, data []byte) error {
	var sf common.HTSourceFile
	if err := json.Unmarshal(data, &sf); err != nil {
		return fmt.Errorf("invalid source file JSON: %w", err)
	}

	dbPath := filepath.Join(rootDir, "lang", "sources", "history_tracers.db")
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		return fmt.Errorf("database not found: %s", dbPath)
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	fileStmt, err := tx.Prepare(`INSERT OR IGNORE INTO files (fil_id, fil_desc) VALUES (?, ?)`)
	if err != nil {
		return fmt.Errorf("failed to prepare file statement: %w", err)
	}
	defer fileStmt.Close()

	srcStmt, err := tx.Prepare(`INSERT OR REPLACE INTO sources (src_id, sfo_id, src_citation, src_date, src_publish_date, src_url) VALUES (?, ?, ?, ?, ?, ?)`)
	if err != nil {
		return fmt.Errorf("failed to prepare source statement: %w", err)
	}
	defer srcStmt.Close()

	citStmt, err := tx.Prepare(`INSERT OR IGNORE INTO citation (fil_id, src_id, cit_type) VALUES (?, ?, ?)`)
	if err != nil {
		return fmt.Errorf("failed to prepare citation statement: %w", err)
	}
	defer citStmt.Close()

	if _, err := tx.Exec("DELETE FROM citation WHERE fil_id = ?", uuid); err != nil {
		return fmt.Errorf("failed to delete citations: %w", err)
	}

	apaUUID := "a1b2c3d4-0000-4000-8000-000000000001"

	insertSources := func(elems []common.HTSourceElement, citType int) {
		for _, elem := range elems {
			sfoID := elem.SfoID
			if sfoID == "" {
				sfoID = apaUUID
			}
			srcStmt.Exec(elem.ID, sfoID, elem.Citation, elem.Date, elem.PublishDate, elem.URL)
			citStmt.Exec(uuid, elem.ID, citType)
		}
	}

	insertSources(sf.PrimarySources, 0)
	insertSources(sf.ReferencesSources, 1)
	insertSources(sf.ReligiousSources, 2)
	insertSources(sf.SocialMediaSources, 3)

	fileStmt.Exec(uuid, "")

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func relatedFilesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	uuidStr := r.URL.Query().Get("uuid")
	if uuidStr == "" {
		json.NewEncoder(w).Encode([]map[string]string{})
		return
	}
	if _, err := uuid.Parse(uuidStr); err != nil {
		json.NewEncoder(w).Encode([]map[string]string{})
		return
	}
	result := make([]map[string]string, 0)
	langDir := filepath.Join(rootDir, "lang")
	langEntries, err := os.ReadDir(langDir)
	if err == nil {
		for _, e := range langEntries {
			if !e.IsDir() || e.Name() == "sources" {
				continue
			}
			if !strings.Contains(e.Name(), "-") {
				continue
			}
			candidate := filepath.Join(langDir, e.Name(), uuidStr+".json")
			if info, err := os.Stat(candidate); err == nil && !info.IsDir() {
				rel, _ := filepath.Rel(rootDir, candidate)
				result = append(result, map[string]string{
					"path":  filepath.ToSlash(rel),
					"label": e.Name(),
				})
			}
		}
	}
	dbPath := filepath.Join(rootDir, "lang", "sources", "history_tracers.db")
	if _, err := os.Stat(dbPath); err == nil {
		db, err := sql.Open("sqlite", dbPath)
		if err == nil {
			var count int
			if db.QueryRow("SELECT COUNT(*) FROM files WHERE fil_id = ?", uuidStr).Scan(&count) == nil && count > 0 {
				if tempPath, err := htGenerateSourceTempFile(uuidStr); err == nil {
					result = append(result, map[string]string{
						"path":  tempPath,
						"label": "Source",
					})
				}
			}
			db.Close()
		}
	}
	jsCandidate := filepath.Join(rootDir, "js", uuidStr+".js")
	if info, err := os.Stat(jsCandidate); err == nil && !info.IsDir() {
		rel, _ := filepath.Rel(rootDir, jsCandidate)
		result = append(result, map[string]string{
			"path":  filepath.ToSlash(rel),
			"label": "JavaScript",
		})
	}
	json.NewEncoder(w).Encode(result)
}

func fileIndexesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	lang := r.URL.Query().Get("lang")
	uuidStr := r.URL.Query().Get("uuid")
	if lang == "" || uuidStr == "" {
		json.NewEncoder(w).Encode([]map[string]string{})
		return
	}
	if _, err := uuid.Parse(uuidStr); err != nil {
		json.NewEncoder(w).Encode([]map[string]string{})
		return
	}
	result := make([]map[string]string, 0)
	langDir := filepath.Join(rootDir, "lang", lang)
	entries, err := os.ReadDir(langDir)
	if err != nil {
		json.NewEncoder(w).Encode(result)
		return
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		name := strings.TrimSuffix(e.Name(), ".json")
		if _, err := uuid.Parse(name); err == nil {
			continue
		}
		candidate := filepath.Join(langDir, e.Name())
		data, err := os.ReadFile(candidate)
		if err != nil {
			continue
		}
		if strings.Contains(string(data), uuidStr) {
			rel, _ := filepath.Rel(rootDir, candidate)
			result = append(result, map[string]string{
				"path":  filepath.ToSlash(rel),
				"label": name,
			})
		}
	}
	json.NewEncoder(w).Encode(result)
}

func viewHandler(w http.ResponseWriter, r *http.Request) {
	path := filepath.Join(rootDir, "www", "index.html")
	data, err := os.ReadFile(path)
	if err != nil {
		http.Error(w, "Viewer not available", http.StatusNotFound)
		return
	}
	s := string(data)
	s = strings.Replace(s, `<base href="./">`, `<base href="/">`, 1)
	s = strings.Replace(s, `<base href=./>`, `<base href="/">`, 1)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(s))
}

func buildPageURL(addr, lang string) string {
	scheme := "http"
	if useTLS {
		scheme = "https"
	}
	u := fmt.Sprintf("%s://%s/editor.html", scheme, addr)
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
