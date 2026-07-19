// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	_ "modernc.org/sqlite"

	"github.com/historytracers/common"
)

var apaFormatUUID = uuid.MustParse("a1b2c3d4-0000-4000-8000-000000000001")

func htReadDatabase(dbPath string) {
	if dbPath == "" {
		dbPath = "history_tracers.db"
	}

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		fmt.Fprintf(os.Stderr, "Database file not found: %s\n", dbPath)
		return
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR opening database: %v\n", err)
		return
	}
	defer db.Close()

	rows, err := db.Query(`SELECT 'files' AS tbl, COUNT(*) FROM files UNION ALL SELECT 'sources', COUNT(*) FROM sources UNION ALL SELECT 'source_format', COUNT(*) FROM source_format UNION ALL SELECT 'citation', COUNT(*) FROM citation`)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR querying database: %v\n", err)
		return
	}
	defer rows.Close()

	fmt.Println("Database:", dbPath)
	for rows.Next() {
		var table string
		var count int
		if err := rows.Scan(&table, &count); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR scanning row: %v\n", err)
			continue
		}
		fmt.Printf("  %s: %d\n", table, count)
	}
}

func htCreateDatabase(dbPath string) {
	if dbPath == "" {
		dbPath = "history_tracers.db"
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		panic(fmt.Errorf("failed to open database: %w", err))
	}
	defer db.Close()

	htCreateSourceFormatTable(db)
	htCreateSourcesTable(db)
	htCreateFilesTable(db)
	htCreateCitationTable(db)

	// Scan both lang/sources/ and www/lang/sources/ for JSON source files
	srcDirs := []string{
		fmt.Sprintf("%slang/sources/", CFG.SrcPath),
		fmt.Sprintf("%swww/lang/sources/", CFG.SrcPath),
	}

	seen := make(map[string]bool)
	tx, err := db.Begin()
	if err != nil {
		panic(fmt.Errorf("failed to begin transaction: %w", err))
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`INSERT OR IGNORE INTO sources (src_id, sfo_id, src_citation, src_date, src_publish_date, src_url) VALUES (?, ?, ?, ?, ?, ?)`)
	if err != nil {
		panic(fmt.Errorf("failed to prepare statement: %w", err))
	}
	defer stmt.Close()

	fileStmt, err := tx.Prepare(`INSERT OR IGNORE INTO files (fil_id, fil_desc) VALUES (?, ?)`)
	if err != nil {
		panic(fmt.Errorf("failed to prepare file statement: %w", err))
	}
	defer fileStmt.Close()

	citationStmt, err := tx.Prepare(`INSERT OR IGNORE INTO citation (fil_id, src_id, cit_type) VALUES (?, ?, ?)`)
	if err != nil {
		panic(fmt.Errorf("failed to prepare citation statement: %w", err))
	}
	defer citationStmt.Close()

	for _, srcDir := range srcDirs {
		entries, err := os.ReadDir(srcDir)
		if err != nil {
			continue
		}
		for _, entry := range entries {
			if entry.IsDir() || filepath.Ext(entry.Name()) != ".json" {
				continue
			}

			filePath := filepath.Join(srcDir, entry.Name())
			byteValue, err := os.ReadFile(filePath)
			if err != nil {
				fmt.Fprintf(os.Stderr, "ERROR reading %s: %v\n", filePath, err)
				continue
			}

			var sf common.HTSourceFile
			if err := json.Unmarshal(byteValue, &sf); err != nil {
				fmt.Fprintf(os.Stderr, "ERROR parsing %s: %v\n", filePath, err)
				continue
			}

			fileID := strings.TrimSuffix(entry.Name(), ".json")
			fileDesc := htGetFileTitle(fileID)
			if _, err := fileStmt.Exec(fileID, fileDesc); err != nil {
				fmt.Fprintf(os.Stderr, "ERROR inserting file %s: %v\n", fileID, err)
			}

			htInsertSourceElements(stmt, seen, sf.PrimarySources)
			htInsertSourceElements(stmt, seen, sf.ReferencesSources)
			htInsertSourceElements(stmt, seen, sf.ReligiousSources)
			htInsertSourceElements(stmt, seen, sf.SocialMediaSources)

			htInsertCitationElements(citationStmt, fileID, sf.PrimarySources, 0)
			htInsertCitationElements(citationStmt, fileID, sf.ReferencesSources, 1)
			htInsertCitationElements(citationStmt, fileID, sf.ReligiousSources, 2)
			htInsertCitationElements(citationStmt, fileID, sf.SocialMediaSources, 3)
		}
	}

	// Also seed default citations from the sources template
	templateSources := htLoadDefaultSourcesFromTemplate()
	for _, entry := range templateSources {
		htInsertSourceElements(stmt, seen, []common.HTSourceElement{entry.Element})
	}

	if err := tx.Commit(); err != nil {
		panic(fmt.Errorf("failed to commit transaction: %w", err))
	}

	htCreateSourcesIndex(db)

	fmt.Printf("Database created successfully at %s\n", dbPath)

	htUpdateFileDescriptions(dbPath)
}

func htGetFileTitle(fileID string) string {
	for _, lang := range htLangPaths {
		langFilePath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, fileID)
		byteValue, err := os.ReadFile(langFilePath)
		if err != nil {
			continue
		}
		var titleStruct struct {
			Title string `json:"title"`
		}
		if err := json.Unmarshal(byteValue, &titleStruct); err != nil {
			continue
		}
		if titleStruct.Title != "" {
			return titleStruct.Title
		}
	}
	return "Title not defined"
}

func htCreateCitationTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS citation (
		fil_id          TEXT    NOT NULL,
		src_id          TEXT    NOT NULL,
		cit_type        TINYINT NOT NULL,
		PRIMARY KEY (fil_id, src_id, cit_type)
	)`
	if _, err := db.Exec(query); err != nil {
		panic(fmt.Errorf("failed to create citation table: %w", err))
	}
}

func htInsertCitationElements(stmt *sql.Stmt, fileID string, elements []common.HTSourceElement, citType int) {
	for _, elem := range elements {
		if _, err := stmt.Exec(fileID, elem.ID, citType); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR inserting citation %s/%s: %v\n", fileID, elem.ID, err)
		}
	}
}

func htCreateSourceFormatTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS source_format (
		sfo_id          TEXT    NOT NULL PRIMARY KEY,
		sfo_name        TEXT    NOT NULL,
		sfo_description TEXT    NOT NULL
	)`
	if _, err := db.Exec(query); err != nil {
		panic(fmt.Errorf("failed to create source_format table: %w", err))
	}

	insert := `INSERT OR IGNORE INTO source_format (sfo_id, sfo_name, sfo_description) VALUES (?, ?, ?)`
	if _, err := db.Exec(insert, apaFormatUUID.String(), "APA", "American Psychological Association"); err != nil {
		panic(fmt.Errorf("failed to insert APA format: %w", err))
	}
}

func htCreateSourcesTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS sources (
		src_id          TEXT    NOT NULL PRIMARY KEY,
		sfo_id          TEXT    NOT NULL,
		src_citation    TEXT    NOT NULL,
		src_date        TEXT    NOT NULL,
		src_publish_date TEXT   NOT NULL,
		src_url         TEXT    NOT NULL
	)`
	if _, err := db.Exec(query); err != nil {
		panic(fmt.Errorf("failed to create sources table: %w", err))
	}
}

func htCreateFilesTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS files (
		fil_id          TEXT    NOT NULL PRIMARY KEY,
		fil_desc        TEXT    NOT NULL
	)`
	if _, err := db.Exec(query); err != nil {
		panic(fmt.Errorf("failed to create files table: %w", err))
	}
}

func htLoadHTSourceFileFromDB(db *sql.DB, fileID string) *common.HTSourceFile {
	rows, err := db.Query(`
		SELECT c.cit_type, s.src_id, COALESCE(s.sfo_id, ''), s.src_citation, s.src_date, s.src_publish_date, COALESCE(s.src_url, '')
		FROM citation c
		JOIN sources s ON c.src_id = s.src_id
		WHERE c.fil_id = ?
	`, fileID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR querying sources for %s: %v\n", fileID, err)
		return nil
	}
	defer rows.Close()

	sf := &common.HTSourceFile{
		License:    []string{"SPDX-License-Identifier: GPL-3.0-or-later", "CC BY-NC 4.0 DEED"},
		LastUpdate: []string{""},
		Version:    1,
		Type:       "sources",
	}

	for rows.Next() {
		var citType int
		var elem common.HTSourceElement
		if err := rows.Scan(&citType, &elem.ID, &elem.SfoID, &elem.Citation, &elem.Date, &elem.PublishDate, &elem.URL); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR scanning row for %s: %v\n", fileID, err)
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
	return sf
}

func htRewriteSourcesFromDB() {
	dbPath := fmt.Sprintf("%slang/sources/history_tracers.db", CFG.SrcPath)

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

	for rows.Next() {
		var fileID string
		if err := rows.Scan(&fileID); err != nil {
			panic(fmt.Errorf("failed to scan file ID: %w", err))
		}

		sf := htLoadHTSourceFileFromDB(db, fileID)
		if sf == nil {
			continue
		}

		htFillSourcesMap(sf, fileID)
	}
}

func htLoadAllSourceFilesFromDB() (map[string]srcEntry, map[string]map[string]bool) {
	allSources := make(map[string]srcEntry)
	srcFileIDs := make(map[string]map[string]bool)

	dbPath := fmt.Sprintf("%slang/sources/history_tracers.db", CFG.SrcPath)
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		return allSources, srcFileIDs
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return allSources, srcFileIDs
	}
	defer db.Close()

	rows, err := db.Query("SELECT fil_id FROM files")
	if err != nil {
		return allSources, srcFileIDs
	}
	defer rows.Close()

	for rows.Next() {
		var fileID string
		if err := rows.Scan(&fileID); err != nil {
			continue
		}

		sf := htLoadHTSourceFileFromDB(db, fileID)
		if sf == nil {
			continue
		}

		if srcFileIDs[fileID] == nil {
			srcFileIDs[fileID] = make(map[string]bool)
		}
		htFillSourceMapForCheck(sf, allSources, srcFileIDs[fileID])
	}

	return allSources, srcFileIDs
}

func htAddEntryToSourceFileDB(uid, cat string, elem common.HTSourceElement) error {
	dbPath := fmt.Sprintf("%slang/sources/history_tracers.db", CFG.SrcPath)

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

	if _, err := tx.Exec("INSERT OR IGNORE INTO files (fil_id, fil_desc) VALUES (?, ?)", uid, ""); err != nil {
		return fmt.Errorf("failed to insert file entry: %w", err)
	}

	sfoID := elem.SfoID
	if sfoID == "" {
		sfoID = apaFormatUUID.String()
	}
	if _, err := tx.Exec(`INSERT OR REPLACE INTO sources (src_id, sfo_id, src_citation, src_date, src_publish_date, src_url) VALUES (?, ?, ?, ?, ?, ?)`,
		elem.ID, sfoID, elem.Citation, elem.Date, elem.PublishDate, elem.URL); err != nil {
		return fmt.Errorf("failed to insert source: %w", err)
	}

	citType := 0
	switch cat {
	case "reference_sources":
		citType = 1
	case "religious_sources":
		citType = 2
	case "social_media_sources":
		citType = 3
	}

	if _, err := tx.Exec(`INSERT OR IGNORE INTO citation (fil_id, src_id, cit_type) VALUES (?, ?, ?)`,
		uid, elem.ID, citType); err != nil {
		return fmt.Errorf("failed to insert citation: %w", err)
	}

	return tx.Commit()
}

func htLoadSourceFromDB(srcs []string) {
	dbPath := fmt.Sprintf("%slang/sources/history_tracers.db", CFG.SrcPath)

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		panic(fmt.Errorf("database file not found: %s", dbPath))
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		panic(fmt.Errorf("failed to open database: %w", err))
	}
	defer db.Close()

	for _, ptr := range srcs {
		sf := htLoadHTSourceFileFromDB(db, ptr)
		if sf == nil {
			continue
		}
		htFillSourcesMap(sf, ptr)
	}
}

func htAddNewSourceEntryToDB(newFile string) {
	dbPath := fmt.Sprintf("%slang/sources/history_tracers.db", CFG.SrcPath)

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		panic(fmt.Errorf("failed to open database: %w", err))
	}
	defer db.Close()

	_, err = db.Exec("INSERT OR IGNORE INTO files (fil_id, fil_desc) VALUES (?, ?)", newFile, "")
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR inserting source file entry %s: %v\n", newFile, err)
	}
}

func htCreateSourcesIndex(db *sql.DB) {
	query := `CREATE INDEX IF NOT EXISTS idx_sources_src_citation ON sources (src_citation)`
	if _, err := db.Exec(query); err != nil {
		panic(fmt.Errorf("failed to create index: %w", err))
	}
}

func htInsertSourceElements(stmt *sql.Stmt, seen map[string]bool, elements []common.HTSourceElement) {
	for _, elem := range elements {
		if seen[elem.ID] {
			continue
		}
		seen[elem.ID] = true

		sfoID := elem.SfoID
		if sfoID == "" {
			sfoID = apaFormatUUID.String()
		}
		if _, err := stmt.Exec(elem.ID, sfoID, elem.Citation, elem.Date, elem.PublishDate, elem.URL); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR inserting source %s: %v\n", elem.ID, err)
		}
	}
}

func htUpdateFileDescriptions(dbPath string) {
	if dbPath == "" {
		dbPath = fmt.Sprintf("%slang/sources/history_tracers.db", CFG.SrcPath)
	}
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		return
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR opening database: %v\n", err)
		return
	}
	defer db.Close()

	rows, err := db.Query("SELECT fil_id, fil_desc FROM files")
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR querying files: %v\n", err)
		return
	}

	indexNames := make(map[string]bool)
	for _, name := range indexFiles {
		indexNames[name] = true
	}

	type pendingUpdate struct {
		filID   string
		filDesc string
		header  string
	}
	var pending []pendingUpdate

	for rows.Next() {
		var filID, filDesc string
		if err := rows.Scan(&filID, &filDesc); err != nil {
			continue
		}
		if !indexNames[filDesc] {
			continue
		}

		headerPath := fmt.Sprintf("%slang/en-US/%s.json", CFG.SrcPath, filID)
		bv, err := os.ReadFile(headerPath)
		if err != nil {
			continue
		}
		var headerStruct struct {
			Header string `json:"header"`
		}
		if err := json.Unmarshal(bv, &headerStruct); err != nil {
			continue
		}
		if headerStruct.Header == "" {
			continue
		}

		pending = append(pending, pendingUpdate{filID: filID, filDesc: filDesc, header: headerStruct.Header})
	}
	rows.Close()

	if len(pending) == 0 {
		return
	}

	stmt, err := db.Prepare("UPDATE files SET fil_desc = ? WHERE fil_id = ?")
	if err != nil {
		fmt.Fprintf(os.Stderr, "ERROR preparing update: %v\n", err)
		return
	}
	defer stmt.Close()

	for _, p := range pending {
		if _, err := stmt.Exec(p.header, p.filID); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR updating fil_desc for %s: %v\n", p.filID, err)
			continue
		}
		fmt.Printf("[UPDATED] fil_desc for %s: \"%s\" -> \"%s\"\n", p.filID, p.filDesc, p.header)
	}
	fmt.Printf("Updated fil_desc for %d file(s)\n", len(pending))
}
