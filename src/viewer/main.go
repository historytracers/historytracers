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
	now := time.Now().Unix()

	historyMu.Lock()
	defer historyMu.Unlock()

	entries := readHistoryLocked()
	entries = append(entries, historyEntry{Page: page, ArgUUID: arg, People: people, Time: now, Title: title, Lang: lang})
	if len(entries) > 10 {
		entries = entries[len(entries)-10:]
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
		fmt.Fprintf(w, `{"page":"%s","arg":"%s","people":"%s","time":%d,"title":"%s","lang":"%s"}`,
			e.Page, argEsc, peopleEsc, e.Time, titleEsc, langEsc)
	}
	fmt.Fprint(w, "]")
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
		entries = append(entries, historyEntry{
			Page:    rec[0],
			ArgUUID: rec[1],
			People:  rec[2],
			Time:    t,
			Title:   title,
			Lang:    lang,
		})
	}
	if len(entries) > 10 {
		entries = entries[len(entries)-10:]
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
		w.Write([]string{e.Page, e.ArgUUID, e.People, fmt.Sprintf("%d", e.Time), e.Title, e.Lang})
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
	pageURL = buildPageURL(addr, *class, *lang)

	if *lang != "" {
		langJS := "window.__ht_lang='" + *lang + "';"
		welcomePage = langJS + welcomePage
		addressBarJS = langJS + addressBarJS
	}

	initHistory()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/history/add", historyAddHandler)
	mux.HandleFunc("/api/history/list", historyListHandler)
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

func buildPageURL(addr, class, lang string) string {
	u := fmt.Sprintf("http://%s/index.html", addr)
	sep := "?"
	if class != "" {
		u += sep + "page=class_content&arg=" + url.QueryEscape(class)
		sep = "&"
	}
	if lang != "" {
		u += sep + "lang=" + url.QueryEscape(lang)
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
