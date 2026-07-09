// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"

	"github.com/historytracers/common"
)

func htCreateDatabase(dbPath string) {
	if dbPath == "" {
		dbPath = "history_tracers.db"
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		panic(fmt.Errorf("failed to open database: %w", err))
	}
	defer db.Close()

	htCreateSourcesTable(db)

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

	stmt, err := tx.Prepare(`INSERT OR IGNORE INTO sources (src_id, src_citation, src_date, src_publish_date, src_url) VALUES (?, ?, ?, ?, ?)`)
	if err != nil {
		panic(fmt.Errorf("failed to prepare statement: %w", err))
	}
	defer stmt.Close()

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

func htCreateSourcesTable(db *sql.DB) {
	query := `CREATE TABLE IF NOT EXISTS sources (
		src_id          TEXT    NOT NULL PRIMARY KEY,
		src_citation    TEXT    NOT NULL,
		src_date        TEXT    NOT NULL,
		src_publish_date TEXT   NOT NULL,
		src_url         TEXT    NOT NULL
	)`
	if _, err := db.Exec(query); err != nil {
		panic(fmt.Errorf("failed to create sources table: %w", err))
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

		if _, err := stmt.Exec(elem.ID, elem.Citation, elem.Date, elem.PublishDate, elem.URL); err != nil {
			fmt.Fprintf(os.Stderr, "ERROR inserting source %s: %v\n", elem.ID, err)
		}
	}
}
