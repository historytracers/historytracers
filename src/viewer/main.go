package main

import (
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
)

var srv *http.Server
var pageURL string

func main() {
	port := flag.Int("port", 0, "HTTP port (0 = random available)")
	dir := flag.String("dir", "www", "Content directory to serve")
	flag.Parse()

	addr := resolveAddr(*port)
	pageURL = fmt.Sprintf("http://%s/", addr)

	mux := http.NewServeMux()
	fs := http.FileServer(http.Dir(*dir))
	mux.Handle("/", logMiddleware(fs))

	srv = &http.Server{Addr: addr, Handler: mux}

	go func() {
		fmt.Printf("Serving content from %s\n", *dir)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	fmt.Printf("HistoryTracers Viewer  %s\n", pageURL)

	runWindow()

	srv.Close()
	fmt.Println("Stopped.")
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
		fmt.Printf("%s %s %d\n", r.Method, r.URL.Path, sw.status)
	})
}
