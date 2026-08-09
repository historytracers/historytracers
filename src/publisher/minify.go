// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/css"
	"github.com/tdewolff/minify/v2/html"
	"github.com/tdewolff/minify/v2/js"
	mjson "github.com/tdewolff/minify/v2/json"

	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

type HTFileChanged struct {
	FileName string
	Equal    bool
}

// COMMON
const (
	HTCSSCommon = iota
	HTCSSMath
	HTJSCommon
	HTJSMath
	HTJSYupana
	HTJSChart

	HTLastFile
)

var htFiles [HTLastFile]string = [HTLastFile]string{"ht_common.css", "ht_math.css", "ht_common.js",
	"ht_math.js", "ht_yupana.js", "ht_chart.js"}

const (
	HTDirBodies = iota
	HTDirCSS
	HTDirCSV
	HTDirGEDCOM
	HTDirImages
	HTDirJS
	HTDirLang
	HTDirLangSources
	HTDirLangEnUS
	HTDirLangEnUSGames
	HTDirLangEnUSSmartphone
	HTDirLangEsES
	HTDirLangEsESGames
	HTDirLangEsESSmartphone
	HTDirLangPtBR
	HTDirLangPtBRGames
	HTDirLangPtBRSmartphone
	HTDirWebFonts
)

var htDirectories []string = []string{"bodies", "css", "csv", "gedcom", "images", "js", "lang",
	"lang/sources", "lang/en-US", "lang/en-US/smGame", "lang/en-US/smartphone",
	"lang/es-ES", "lang/es-ES/smGame", "lang/es-ES/smartphone", "lang/pt-BR",
	"lang/pt-BR/smGame", "lang/pt-BR/smartphone", "webfonts"}

var readmePattern = regexp.MustCompile("^README")
var htPattern = regexp.MustCompile("^ht_")
var faPattern = regexp.MustCompile("^fa_")
var chartPattern = regexp.MustCompile("^chart_")
var jqueryPattern = regexp.MustCompile("^jquery-")
var showdownPattern = regexp.MustCompile("^showdown.")
var rewriteHTML bool = false

// htMinifyJob is a single, self-contained file minification task. Each job
// references a distinct pair of input/output files, so the same file can
// never be processed by more than one worker at a time.
type htMinifyJob struct {
	MinifyType string
	InFile     string
	OutFile    string
}

// htRegisterMinifier registers the minifier matching the given mediatype on
// an minify.M instance. Only the relevant minifier is registered so that
// other minifiers never touch content of a different type (e.g. inline JS
// inside HTML must not be run through the JS minifier).
func htRegisterMinifier(m *minify.M, minifyType string) {
	switch minifyType {
	case "application/json":
		m.AddFunc("application/json", mjson.Minify)
	case "application/javascript":
		m.AddFunc("application/javascript", js.Minify)
	case "text/css":
		m.AddFunc("text/css", css.Minify)
	case "text/html":
		m.AddFunc("text/html", html.Minify)
	}
}

// htRunMinifyParallel runs the given jobs concurrently, one worker per
// available processor. Each worker owns its own minify.M instance (the
// minify library is not safe for concurrent use of a single instance), and
// the caller blocks until every job has finished. The first error (if any)
// is returned.
func htRunMinifyParallel(jobs []htMinifyJob) error {
	if len(jobs) == 0 {
		return nil
	}

	numWorkers := runtime.NumCPU()
	if numWorkers > len(jobs) {
		numWorkers = len(jobs)
	}

	jobCh := make(chan htMinifyJob)
	errCh := make(chan error, len(jobs))

	var wg sync.WaitGroup
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			ms := make(map[string]*minify.M)
			for job := range jobCh {
				m := ms[job.MinifyType]
				if m == nil {
					m = minify.New()
					htRegisterMinifier(m, job.MinifyType)
					ms[job.MinifyType] = m
				}
				if err := htMinifyCommonFile(m, job.MinifyType, job.InFile, job.OutFile); err != nil {
					errCh <- err
				}
			}
		}()
	}

	for _, job := range jobs {
		jobCh <- job
	}
	close(jobCh)
	wg.Wait()
	close(errCh)

	for err := range errCh {
		return err
	}
	return nil
}

func htMinifyCreateDirectories() {
	htCreateDirectory(CFG.ContentPath)
	var localPath string

	for _, dir := range htDirectories {
		localPath = CFG.ContentPath + dir
		if verboseFlag {
			fmt.Println("Creating directory", localPath)
		}
		htCreateDirectory(localPath)
	}
}

func htMinifyRemoveOldContent() {
	err := os.RemoveAll(CFG.ContentPath)
	if err != nil {
		panic(err)
	}
}

func htMinifyCommonFile(m *minify.M, minifyType string, inFile string, outFile string) error {
	r, err1 := os.Open(inFile)
	if err1 != nil {
		return err1
	}
	defer r.Close()

	w, err2 := os.Create(outFile)
	if err2 != nil {
		return err2
	}
	defer w.Close()

	if err3 := m.Minify(minifyType, w, r); err3 != nil {
		return err3
	}

	return w.Close()
}

func htUpdateHTCSS() error {
	var finalFile string
	var outFile string
	var inFile string

	m := minify.New()
	m.AddFunc("text/css", css.Minify)

	srcBodies := fmt.Sprintf("%ssrc/css/", CFG.SrcPath)
	entries, err := os.ReadDir(srcBodies)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	inBodies := fmt.Sprintf("%scss/", CFG.SrcPath)
	outBodies := fmt.Sprintf("%scss/", CFG.ContentPath)

	id := uuid.New()
	strID := id.String()

	tmpFile := fmt.Sprintf("%s%s", srcBodies, strID)
	for _, fileName := range entries {
		inFile = fmt.Sprintf("%s%s", srcBodies, fileName.Name())

		htMinifyCSSFile(m, inFile, tmpFile)

		outFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		finalFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())

		equal, err := HTAreFilesEqual(tmpFile, outFile)
		if !equal && err == nil {
			rewriteHTML = true
		}

		HTCopyFilesWithoutChanges(finalFile, tmpFile)
		HTCopyFilesWithoutChanges(outFile, finalFile)
	}

	err = os.Remove(tmpFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	return nil
}

// CSS
func htParseCSS(fileName string) bool {
	if faPattern.MatchString(fileName) {
		return true
	}
	return false
}

func htMinifyCSSFile(m *minify.M, inFile string, outFile string) error {
	if verboseFlag {
		fmt.Println("Minifying CSS", outFile)
	}
	return htMinifyCommonFile(m, "text/css", inFile, outFile)
}

func htMinifyCSS() {
	var outFile string
	var inFile string

	m := minify.New()
	m.AddFunc("text/css", css.Minify)

	// Copy only Font Awesome
	outBodies := fmt.Sprintf("%scss/", CFG.ContentPath)
	inBodies := fmt.Sprintf("%scss/", CFG.SrcPath)
	entries, err := os.ReadDir(inBodies)
	if err != nil {
		panic(err)
	}

	for _, fileName := range entries {
		if htParseCSS(fileName.Name()) == false {
			continue
		}

		outFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		HTCopyFilesWithoutChanges(outFile, inFile)
	}
}

// JSON
func htParseJSON(fileName string) bool {
	if readmePattern.MatchString(fileName) {
		return false
	}
	if fileName == "smGame" {
		return false
	}
	if !strings.HasSuffix(fileName, ".json") {
		return false
	}
	return true
}

func htRewriteAndMinifySMSubDir(lang string, srcDir string, outDir string) {
	entries, err := os.ReadDir(srcDir)
	if err != nil {
		return
	}

	// Rewrites mutate global source maps, so they must run sequentially.
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}

		smGameFile := srcDir + entry.Name()

		err = htRewriteSMGame(lang, smGameFile)
		if err != nil {
			fmt.Fprintln(os.Stderr, "ERROR rewriting SMGame:", err)
		}
	}

	var jobs []htMinifyJob
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}

		jobs = append(jobs, htMinifyJob{
			MinifyType: "application/json",
			InFile:     srcDir + entry.Name(),
			OutFile:    outDir + entry.Name(),
		})
	}

	err = htRunMinifyParallel(jobs)
	if err != nil {
		panic(err)
	}
}

func htRewriteAndMinifySMGame(lang string) {
	// smGame content stays in lang/<lang>/smGame/
	htRewriteAndMinifySMSubDir(lang,
		fmt.Sprintf("%slang/%s/smGame/", CFG.SrcPath, lang),
		fmt.Sprintf("%slang/%s/smGame/", CFG.ContentPath, lang))
	// smartphone content moved to src/common/src/smartphone/<lang>/ but the
	// published output keeps the historical lang/<lang>/smartphone/ location.
	htRewriteAndMinifySMSubDir(lang,
		fmt.Sprintf("%ssrc/common/src/smartphone/%s/", CFG.SrcPath, lang),
		fmt.Sprintf("%slang/%s/smartphone/", CFG.ContentPath, lang))
}

func htMinifyJSON() {
	var jobs []htMinifyJob

	for i := HTDirLangSources; i < HTDirWebFonts; i++ {
		if i == HTDirLangSources {
			continue
		}
		if i == HTDirLangEnUSSmartphone || i == HTDirLangEsESSmartphone || i == HTDirLangPtBRSmartphone {
			// Smartphone content now lives in src/common/src/smartphone/ and
			// is handled by htRewriteAndMinifySMGame.
			continue
		}

		outBodies := fmt.Sprintf("%s%s/", CFG.ContentPath, htDirectories[i])
		inBodies := fmt.Sprintf("%s%s/", CFG.SrcPath, htDirectories[i])
		entries, err1 := os.ReadDir(inBodies)
		if err1 != nil {
			panic(err1)
		}

		for _, fileName := range entries {
			if fileName.IsDir() {
				continue
			}
			if htParseJSON(fileName.Name()) == false {
				continue
			}

			jobs = append(jobs, htMinifyJob{
				MinifyType: "application/json",
				InFile:     fmt.Sprintf("%s%s", inBodies, fileName.Name()),
				OutFile:    fmt.Sprintf("%s%s", outBodies, fileName.Name()),
			})
		}
	}

	err := htRunMinifyParallel(jobs)
	if err != nil {
		panic(err)
	}
}

func htMinifySourcesFromDB() {
	dbPath := fmt.Sprintf("%slang/sources/history_tracers.db", CFG.SrcPath)
	outDir := fmt.Sprintf("%slang/sources/", CFG.ContentPath)

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		panic(fmt.Errorf("database file not found: %s", dbPath))
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		panic(fmt.Errorf("failed to open database: %w", err))
	}
	defer db.Close()

	rows, err := db.Query("SELECT fil_id FROM files ORDER BY fil_id")
	if err != nil {
		panic(fmt.Errorf("failed to query files: %w", err))
	}
	defer rows.Close()

	var jobs []htMinifyJob
	for rows.Next() {
		var fileID string
		if err := rows.Scan(&fileID); err != nil {
			panic(fmt.Errorf("failed to scan file ID: %w", err))
		}

		sf := htLoadHTSourceFileFromDB(db, fileID)
		if sf == nil {
			continue
		}

		outFile := outDir + fileID + ".json"

		id := uuid.New()
		tmpFile := fmt.Sprintf("%s%s.tmp", outDir, id.String())

		fp, err := os.Create(tmpFile)
		if err != nil {
			panic(fmt.Errorf("failed to create tmp file %s: %w", tmpFile, err))
		}
		e := json.NewEncoder(fp)
		e.SetEscapeHTML(false)
		e.Encode(sf)
		fp.Close()

		jobs = append(jobs, htMinifyJob{
			MinifyType: "application/json",
			InFile:     tmpFile,
			OutFile:    outFile,
		})
	}

	err = htRunMinifyParallel(jobs)
	if err != nil {
		panic(fmt.Errorf("failed to minify source files: %w", err))
	}

	for _, job := range jobs {
		err = os.Remove(job.InFile)
		if err != nil {
			fmt.Fprintf(os.Stderr, "ERROR removing tmp %s: %v\n", job.InFile, err)
		}
	}
}

func htCopyJSONWithoutChanges() {
	dstFile := fmt.Sprintf("%slang/lang_list.json", CFG.ContentPath)
	srcFile := fmt.Sprintf("%slang/lang_list.json", CFG.SrcPath)
	err := HTCopyFilesWithoutChanges(dstFile, srcFile)
	if err != nil {
		panic(err)
	}
}

// JS
func htMinifyJSFile(m *minify.M, inFile string, outFile string) error {
	if verboseFlag {
		fmt.Println("Minifying JS", outFile)
	}
	return htMinifyCommonFile(m, "application/javascript", inFile, outFile)
}

func htParseJS(fileName string, dstFile string, srcFile string) bool {
	if readmePattern.MatchString(fileName) {
		return false
	}

	if chartPattern.MatchString(fileName) ||
		jqueryPattern.MatchString(fileName) ||
		showdownPattern.MatchString(fileName) {
		err := HTCopyFilesWithoutChanges(dstFile, srcFile)
		if err != nil {
			panic(err)
		}
		return false
	}
	switch fileName {
	case "astro.js":
	case "calendar.js":
		err := HTCopyFilesWithoutChanges(dstFile, srcFile)
		if err != nil {
			panic(err)
		}
		return false
	default:
		return true
	}
	return true
}

func htMinifyJS() {
	var jobs []htMinifyJob

	outBodies := fmt.Sprintf("%sjs/", CFG.ContentPath)
	inBodies := fmt.Sprintf("%sjs/", CFG.SrcPath)
	entries, err1 := os.ReadDir(inBodies)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		outFile := fmt.Sprintf("%s%s", outBodies, fileName.Name())
		inFile := fmt.Sprintf("%s%s", inBodies, fileName.Name())
		if htParseJS(fileName.Name(), outFile, inFile) == false {
			continue
		}

		jobs = append(jobs, htMinifyJob{
			MinifyType: "application/javascript",
			InFile:     inFile,
			OutFile:    outFile,
		})
	}

	err := htRunMinifyParallel(jobs)
	if err != nil {
		panic(err)
	}
}

func htUpdateHTJS() {
	var finalFile string
	var outFile string
	var inFile string

	m := minify.New()
	m.AddFunc("application/javascript", js.Minify)

	srcBodies := fmt.Sprintf("%ssrc/js/", CFG.SrcPath)
	entries, err := os.ReadDir(srcBodies)
	if err != nil {
		panic(err)
	}

	inBodies := fmt.Sprintf("%sjs/", CFG.SrcPath)
	outBodies := fmt.Sprintf("%sjs/", CFG.ContentPath)

	id := uuid.New()
	strID := id.String()

	tmpFile := fmt.Sprintf("%s%s", srcBodies, strID)
	for _, fileName := range entries {
		if htPattern.MatchString(fileName.Name()) == false {
			continue
		}
		inFile = fmt.Sprintf("%s%s", srcBodies, fileName.Name())

		htMinifyJSFile(m, inFile, tmpFile)

		outFile = fmt.Sprintf("%s%s", inBodies, fileName.Name())
		finalFile = fmt.Sprintf("%s%s", outBodies, fileName.Name())

		equal, err := HTAreFilesEqual(tmpFile, outFile)
		if !equal && err == nil {
			rewriteHTML = true
		}

		HTCopyFilesWithoutChanges(finalFile, tmpFile)
		HTCopyFilesWithoutChanges(outFile, finalFile)
	}

	err = os.Remove(tmpFile)
	if err != nil {
		panic(err)
	}
}

// HTML
func htUpdateIndex() {
	indexFile := fmt.Sprintf("%sindex.html", CFG.SrcPath)
	index, err := os.ReadFile(indexFile)
	if err != nil {
		panic(err)
	}

	now := fmt.Sprintf("%d", time.Now().Unix())

	// Replace ALL numeric version timestamps (?v=digits) in the file.
	// UUID-based values (?v=hex-...) are left untouched.
	re := regexp.MustCompile(`\?v=\d+`)
	str := re.ReplaceAllString(string(index), "?v="+now)

	err = os.WriteFile(indexFile, []byte(str), 0644)
	if err != nil {
		panic(err)
	}
}

func htMinifyHTML() {
	var jobs []htMinifyJob

	jobs = append(jobs, htMinifyJob{
		MinifyType: "text/html",
		InFile:     fmt.Sprintf("%sindex.html", CFG.SrcPath),
		OutFile:    fmt.Sprintf("%sindex.html", CFG.ContentPath),
	})

	outBodies := fmt.Sprintf("%sbodies/", CFG.ContentPath)
	inBodies := fmt.Sprintf("%sbodies/", CFG.SrcPath)
	entries, err1 := os.ReadDir(inBodies)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		jobs = append(jobs, htMinifyJob{
			MinifyType: "text/html",
			InFile:     fmt.Sprintf("%s%s", inBodies, fileName.Name()),
			OutFile:    fmt.Sprintf("%s%s", outBodies, fileName.Name()),
		})
	}

	err := htRunMinifyParallel(jobs)
	if err != nil {
		panic(err)
	}
}

func htCopyWebFonts() {
	var outFile string
	var inFile string
	var err error

	outWebFonts := fmt.Sprintf("%swebfonts/", CFG.ContentPath)
	inWebFonts := fmt.Sprintf("%swebfonts/", CFG.SrcPath)

	entries, err1 := os.ReadDir(inWebFonts)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outWebFonts, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inWebFonts, fileName.Name())
		err = HTCopyFilesWithoutChanges(outFile, inFile)
		if err != nil {
			panic(err)
		}
	}
}

func htCopyCSV() {
	var outFile string
	var inFile string
	var err error

	outCSV := fmt.Sprintf("%scsv/", CFG.ContentPath)
	inCSV := fmt.Sprintf("%scsv/", CFG.SrcPath)

	entries, err1 := os.ReadDir(inCSV)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outCSV, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inCSV, fileName.Name())
		err = HTCopyFilesWithoutChanges(outFile, inFile)
		if err != nil {
			panic(err)
		}
	}
}

func htCopyGEDCOM() {
	var outFile string
	var inFile string
	var err error

	outGEDCOM := fmt.Sprintf("%sgedcom/", CFG.ContentPath)
	inGEDCOM := fmt.Sprintf("%sgedcom/", CFG.SrcPath)

	entries, err1 := os.ReadDir(inGEDCOM)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		outFile = fmt.Sprintf("%s%s", outGEDCOM, fileName.Name())
		inFile = fmt.Sprintf("%s%s", inGEDCOM, fileName.Name())
		err = HTCopyFilesWithoutChanges(outFile, inFile)
		if err != nil {
			panic(err)
		}
	}
}

func htCopyImagesSpecificDir(outImages string, inImages string) {
	var outFile string
	var inFile string
	var err error

	entries, err1 := os.ReadDir(inImages)
	if err1 != nil {
		panic(err1)
	}

	for _, fileName := range entries {
		if fileName.IsDir() {
			inImages := fmt.Sprintf("%simages/%s/", CFG.SrcPath, fileName.Name())
			outImages := fmt.Sprintf("%simages/%s/", CFG.ContentPath, fileName.Name())

			htCreateDirectory(outImages)

			htCopyImagesSpecificDir(outImages, inImages)
		} else {
			outFile = fmt.Sprintf("%s%s", outImages, fileName.Name())
			inFile = fmt.Sprintf("%s%s", inImages, fileName.Name())
			err = HTCopyFilesWithoutChanges(outFile, inFile)
			if err != nil {
				panic(err)
			}
		}
	}
}

func htCopyImages() {
	outImages := fmt.Sprintf("%simages/", CFG.ContentPath)
	inImages := fmt.Sprintf("%simages/", CFG.SrcPath)

	htCopyImagesSpecificDir(outImages, inImages)
}

// MAIN FUNCTION

func HTMinifyAllFiles() {
	// Remove Previous Content
	htMinifyRemoveOldContent()

	// Create directories
	htMinifyCreateDirectories()

	// Rewrite Sources from DB
	htRewriteSourcesFromDB()

	htMinifyJS()

	htUpdateHTJS()

	htMinifyJSON()

	htMinifySourcesFromDB()

	for _, lang := range htLangPaths {
		htRewriteAndMinifySMGame(lang)
	}

	htCopyJSONWithoutChanges()

	htMinifyCSS()

	htUpdateHTCSS()

	if rewriteHTML {
		htUpdateIndex()
	}

	htMinifyHTML()

	htCopyWebFonts()
	htCopyCSV()
	htCopyGEDCOM()
	htCopyImages()
	if verboseFlag {
		fmt.Println("Completed successfully!")
	}
}
