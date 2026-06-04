package main

import (
	"flag"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
)

var srv *http.Server
var pageURL string
var contentDir string
var accessLog *log.Logger

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

	mux := http.NewServeMux()
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
