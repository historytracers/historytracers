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

	srcDir := fmt.Sprintf("%slang/sources/", CFG.SrcPath)
	entries, err := os.ReadDir(srcDir)
	if err != nil {
		panic(fmt.Errorf("failed to read source directory %s: %w", srcDir, err))
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
		fileDesc := sf.Type
		if fileDesc == "" {
			fileDesc = fileID
		}
		if _, err := fileStmt.Exec(fileID, fileDesc); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR inserting file %s: %v\n", fileID, err)
		}

		htInsertSourceElements(stmt, seen, sf.PrimarySources)
		htInsertSourceElements(stmt, seen, sf.ReferencesSources)
		htInsertSourceElements(stmt, seen, sf.ReligiousSources)
		htInsertSourceElements(stmt, seen, sf.SocialMediaSources)
	}

	if err := tx.Commit(); err != nil {
		panic(fmt.Errorf("failed to commit transaction: %w", err))
	}

	htCreateSourcesIndex(db)

	fmt.Printf("Database created successfully at %s\n", dbPath)
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
