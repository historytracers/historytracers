// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"fmt"
	"io"
	"os"
	"time"
)

// Common date type
type HTDate struct {
	DateType string `json:"type"`
	Year     string `json:"year"`
	Month    string `json:"month"`
	Day      string `json:"day"`
}

type HTExercise struct {
	Question       string `json:"question"`
	YesNoAnswer    string `json:"yesNoAnswer"`
	AdditionalInfo string `json:"additionalInfo"`
}

type HTSource struct {
	Type int    `json:"type"`
	UUID string `json:"uuid"`
	Text string `json:"text"`
	date HTDate `json:"date"`
}

type HTText struct {
	Text        string     `json:"text"`
	Source      []HTSource `json:"source"`
	FillDates   []HTDate   `json:"fill_dates"`
	IsTable     bool       `json:"isTable"`
	Format      string     `json:"format"`
	PostMention string     `json:"PostMention"`
}

type HTMap struct {
	Text  string `json:"text"`
	Img   string `json:"img"`
	Order int    `json:"order"`
}

// Common functions
func htUpdateTimestamp() string {
	newStr := fmt.Sprintf("%d", time.Now().Unix())

	return newStr
}

func HTCopyFilesWithoutChanges(dstFile string, srcFile string) error {
	srcStat, err := os.Stat(srcFile)
	if err != nil {
		return err
	}

	if !srcStat.Mode().IsRegular() {
		return nil
	}

	sfp, err := os.Open(srcFile)
	if err != nil {
		return err
	}
	defer sfp.Close()

	dfp, err := os.Create(dstFile)
	if err != nil {
		return err
	}
	defer dfp.Close()
	bytes, err := io.Copy(dfp, sfp)
	if bytes == 0 || err != nil {
		return err
	}

	if verboseFlag {
		fmt.Println("Copying file", dstFile)
	}
	return nil
}
