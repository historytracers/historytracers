// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"time"

	"github.com/google/uuid"
)

// Common date type
type HTDate struct {
	DateType string `json:"type"`
	Year     string `json:"year"`
	Month    string `json:"month"`
	Day      string `json:"day"`
}

type HTAudio struct {
	URL      string `json:"url"`
	External bool   `json:"external"`
	Spotify  bool   `json:"spotify"`
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
	Date HTDate `json:"date_time"`
}

type HTSourceElement struct {
	ID          string `json:"id"`
	Citation    string `json:"citation"`
	Date        string `json:"date_time"`
	PublishDate string `json:"published"`
	URL         string `json:"url"`
}

type HTSourceFile struct {
	Info               string            `json:"info"`
	License            []string          `json:"license"`
	LastUpdate         []string          `json:"last_update"`
	Authors            string            `json:"authors"`
	Reviewers          string            `json:"reviewers"`
	Version            int               `json:"version"`
	Type               string            `json:"type"`
	PrimarySources     []HTSourceElement `json:"primary_sources"`
	ReferencesSources  []HTSourceElement `json:"reference_sources"`
	ReligiousSources   []HTSourceElement `json:"religious_sources"`
	SocialMediaSources []HTSourceElement `json:"social_media_sources"`
}

var sourceMap map[string]HTSourceElement

type HTText struct {
	Text        string     `json:"text"`
	Source      []HTSource `json:"source"`
	FillDates   []HTDate   `json:"date_time"`
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

func htOpenFileReadClose(fileName string) ([]byte, error) {
	contentFile, err := os.Open(fileName)
	if err != nil {
		return nil, err
	}

	byteValue, err := io.ReadAll(contentFile)
	if err != nil {
		return nil, err
	}
	contentFile.Close()

	return byteValue, nil
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

func htCommonJsonError(byteValue []byte, err error) {
	switch t := err.(type) {
	case *json.SyntaxError:
		begin := t.Offset
		if begin > 256 {
			begin -= 256
		} else if begin > 30 {
			begin -= 30
		}
		jsn := string(byteValue[begin:t.Offset])
		jsn += "<--(Invalid Character)"
		fmt.Fprintf(os.Stderr, "Invalid character at offset %v\n %s", t.Offset, jsn)
	case *json.UnmarshalTypeError:
		jsn := string(byteValue[t.Offset-30 : t.Offset])
		jsn += "<--(Invalid Type)"
		fmt.Fprintf(os.Stderr, "Invalid type at offset %v\n %s", t.Offset, jsn)
	default:
		fmt.Printf("Invalid character at offset\n %s", err.Error())
	}
}

// Sources
func htFillSourceMap(src []HTSourceElement) {
	for _, element := range src {
		if _, ok := sourceMap[element.ID]; !ok {
			sourceMap[element.ID] = element
		}
	}
}

func htFillSourcesMap(src *HTSourceFile) {
	if src.PrimarySources != nil {
		htFillSourceMap(src.PrimarySources)
	}

	if src.ReferencesSources != nil {
		htFillSourceMap(src.ReferencesSources)
	}

	if src.ReligiousSources != nil {
		htFillSourceMap(src.ReligiousSources)
	}

	if src.SocialMediaSources != nil {
		htFillSourceMap(src.SocialMediaSources)
	}
}

func htUpdateSourceFile(src *HTSourceFile, filename string) {
	id := uuid.New()
	strID := id.String()

	tmpFile := fmt.Sprintf("%slang/sources/%s.tmp", CFG.SrcPath, strID)

	fp, err := os.Create(tmpFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return
	}

	e := json.NewEncoder(fp)
	e.SetEscapeHTML(false)
	e.SetIndent("", "   ")
	e.Encode(src)

	fp.Close()

	HTCopyFilesWithoutChanges(filename, tmpFile)
	err = os.Remove(tmpFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
	}

}

func htLoadSources(fileName string) {
	srcPath := fmt.Sprintf("%slang/sources/%s.json", CFG.SrcPath, fileName)

	jsonFile, err := os.Open(srcPath)
	if err != nil {
		return
	}

	byteValue, err := io.ReadAll(jsonFile)
	if err != nil {
		jsonFile.Close()
		return
	}

	var src HTSourceFile
	err = json.Unmarshal(byteValue, &src)
	if err != nil {
		jsonFile.Close()
		return
	}

	htFillSourcesMap(&src)
	jsonFile.Close()

	htUpdateSourceFile(&src, srcPath)
}
