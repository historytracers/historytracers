// SPDX-License-Identifier: GPL-3.0-or-later
package main

import (
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

var metricsStartTime = time.Now()

const (
	metricsReqTotal    = "historytracers_http_requests_total"
	metricsReqDuration = "historytracers_http_request_duration_seconds"
	metricsReqInFlight = "historytracers_http_requests_in_flight"
	metricsErrorsTotal = "historytracers_http_errors_total"
	metricsUptime      = "historytracers_uptime_seconds"
	metricsReqBytes    = "historytracers_http_request_size_bytes"
	metricsResBytes    = "historytracers_http_response_size_bytes"
)

var (
	metricsActive int64

	metricsMu     sync.Mutex
	metricsCounts = map[string]int64{}
	metricsErrors = map[string]int64{}

	metricsDurationBuckets = []float64{0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10}
	metricsDurationCounts  = map[string]int64{}

	metricsPathCounts = map[string]int64{}
)

func statusClass(code int) string {
	switch {
	case code < 200:
		return "1xx"
	case code < 300:
		return "2xx"
	case code < 400:
		return "3xx"
	case code < 500:
		return "4xx"
	default:
		return "5xx"
	}
}

func metricsDurationBucket(d time.Duration) int {
	sec := d.Seconds()
	for i, b := range metricsDurationBuckets {
		if sec <= b {
			return i
		}
	}
	return len(metricsDurationBuckets)
}

func normaliseMetricPath(p string) string {
	if idx := strings.IndexByte(p, '?'); idx >= 0 {
		p = p[:idx]
	}
	parts := strings.Split(p, "/")
	for i, part := range parts {
		if len(part) == 36 && strings.Count(part, "-") == 4 {
			parts[i] = ":uuid"
		}
	}
	result := strings.Join(parts, "/")
	if result == "" {
		result = "/"
	}
	return result
}

type metricRecorder struct {
	http.ResponseWriter
	statusCode int
	method     string
	path       string
	start      time.Time
	reqSize    int64
	resSize    int64
}

func (r *metricRecorder) WriteHeader(code int) {
	r.statusCode = code
	r.ResponseWriter.WriteHeader(code)
}

func (r *metricRecorder) Write(b []byte) (int, error) {
	n, err := r.ResponseWriter.Write(b)
	r.resSize += int64(n)
	return n, err
}

func metricsRecord(method, path string, status int, dur time.Duration, reqSize, resSize int64) {
	sc := statusClass(status)
	key := method + ":" + sc
	bucketKey := key + ":" + strconv.Itoa(metricsDurationBucket(dur))
	normPath := normaliseMetricPath(path)

	metricsMu.Lock()
	metricsCounts[key]++
	if status >= 400 {
		metricsErrors[key]++
	}
	metricsDurationCounts[bucketKey]++
	metricsPathCounts[normPath]++
	metricsMu.Unlock()
}

func metricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		atomic.AddInt64(&metricsActive, 1)

		rec := &metricRecorder{
			ResponseWriter: w,
			statusCode:     200,
			method:         req.Method,
			path:           req.URL.RequestURI(),
			start:          time.Now(),
			reqSize:        req.ContentLength,
		}

		if req.URL.Path == "/metrics" {
			next.ServeHTTP(w, req)
			atomic.AddInt64(&metricsActive, -1)
			return
		}

		next.ServeHTTP(rec, req)

		dur := time.Since(rec.start)
		metricsRecord(rec.method, rec.path, rec.statusCode, dur, rec.reqSize, rec.resSize)

		atomic.AddInt64(&metricsActive, -1)
	})
}

func sortedKeys(m map[string]int64) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func metricsHandler(w http.ResponseWriter, r *http.Request) {
	uptime := time.Since(metricsStartTime).Seconds()

	metricsMu.Lock()
	counts := make(map[string]int64, len(metricsCounts))
	for k, v := range metricsCounts {
		counts[k] = v
	}
	errs := make(map[string]int64, len(metricsErrors))
	for k, v := range metricsErrors {
		errs[k] = v
	}
	durCounts := make(map[string]int64, len(metricsDurationCounts))
	for k, v := range metricsDurationCounts {
		durCounts[k] = v
	}
	pathCounts := make(map[string]int64, len(metricsPathCounts))
	for k, v := range metricsPathCounts {
		pathCounts[k] = v
	}
	metricsMu.Unlock()

	active := atomic.LoadInt64(&metricsActive)
	var totalReq int64
	for _, v := range counts {
		totalReq += v
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")

	b := &strings.Builder{}

	fmt.Fprintln(b, "# HELP", metricsUptime, "Server uptime in seconds")
	fmt.Fprintln(b, "# TYPE", metricsUptime, "gauge")
	fmt.Fprintf(b, "%s %.0f\n", metricsUptime, uptime)

	fmt.Fprintln(b)
	fmt.Fprintln(b, "# HELP", metricsReqInFlight, "Current number of in-flight HTTP requests")
	fmt.Fprintln(b, "# TYPE", metricsReqInFlight, "gauge")
	fmt.Fprintf(b, "%s %d\n", metricsReqInFlight, active)

	fmt.Fprintln(b)
	fmt.Fprintln(b, "# HELP", metricsReqTotal, "Total HTTP requests by method and status class")
	fmt.Fprintln(b, "# TYPE", metricsReqTotal, "counter")
	keys := sortedKeys(counts)
	for _, k := range keys {
		parts := strings.SplitN(k, ":", 2)
		method, sc := parts[0], parts[1]
		fmt.Fprintf(b, "%s{method=%q,status_class=%q} %d\n", metricsReqTotal, method, sc, counts[k])
	}
	fmt.Fprintf(b, "%s_total %d\n", metricsReqTotal, totalReq)

	fmt.Fprintln(b)
	fmt.Fprintln(b, "# HELP", metricsErrorsTotal, "Total HTTP errors (4xx/5xx) by method and status class")
	fmt.Fprintln(b, "# TYPE", metricsErrorsTotal, "counter")
	ekeys := sortedKeys(errs)
	for _, k := range ekeys {
		parts := strings.SplitN(k, ":", 2)
		method, sc := parts[0], parts[1]
		fmt.Fprintf(b, "%s{method=%q,status_class=%q} %d\n", metricsErrorsTotal, method, sc, errs[k])
	}

	fmt.Fprintln(b)
	fmt.Fprintln(b, "# HELP", metricsReqDuration, "Request duration histogram buckets")
	fmt.Fprintln(b, "# TYPE", metricsReqDuration, "histogram")
	fmt.Fprintf(b, "%s_bucket{le=%q} %d\n", metricsReqDuration, "+Inf", totalReq)
	for i := len(metricsDurationBuckets) - 1; i >= 0; i-- {
		var bucketTotal int64
		for dk, dv := range durCounts {
			parts := strings.SplitN(dk, ":", 3)
			bi, _ := strconv.Atoi(parts[2])
			if bi <= i {
				bucketTotal += dv
			}
		}
		fmt.Fprintf(b, "%s_bucket{le=%q} %d\n", metricsReqDuration, fmt.Sprintf("%.3f", metricsDurationBuckets[i]), bucketTotal)
	}
	fmt.Fprintf(b, "%s_count %d\n", metricsReqDuration, totalReq)
	fmt.Fprintf(b, "%s_sum %s\n", metricsReqDuration, "0")

	fmt.Fprintln(b)
	fmt.Fprintln(b, "# HELP", metricsReqBytes, "HTTP request size in bytes")
	fmt.Fprintln(b, "# TYPE", metricsReqBytes, "gauge")
	fmt.Fprintf(b, "%s %d\n", metricsReqBytes, 0)

	fmt.Fprintln(b)
	fmt.Fprintln(b, "# HELP", metricsResBytes, "HTTP response size in bytes")
	fmt.Fprintln(b, "# TYPE", metricsResBytes, "gauge")
	fmt.Fprintf(b, "%s %d\n", metricsResBytes, 0)

	fmt.Fprintln(b)
	fmt.Fprintln(b, "# HELP historytracers_http_requests_by_path Total requests by normalised path")
	fmt.Fprintln(b, "# TYPE historytracers_http_requests_by_path counter")
	pkeys := sortedKeys(pathCounts)
	for _, k := range pkeys {
		fmt.Fprintf(b, "historytracers_http_requests_by_path{path=%q} %d\n", k, pathCounts[k])
	}

	w.Write([]byte(b.String()))
}
