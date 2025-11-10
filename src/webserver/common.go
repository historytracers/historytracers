// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"golang.org/x/net/html"
)

var htLangPaths []string = []string{"en-US", "es-ES", "pt-BR"}

var indexFiles []string = []string{"first_steps", "literature", "indigenous_who", "myths_believes", "math_games", "historical_events", "physics", "chemistry", "biology", "history"}

var commonKeywords []string

var htMonthCalendarPT []string = []string{"janeiro", "fevereiro", "março", "abril", "maio", "junho", "julio", "agosto", "setembro", "outubro", "novembro", "dezembro"}
var htMonthCalendarES []string = []string{"enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "deciembre"}
var htMonthCalendarEN []string = []string{"January", "Febraury", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"}
var htAbbrMonthCalendarEN []string = []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}

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
	Page string `json:"page"`
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
	License            []string          `json:"license"`
	LastUpdate         []string          `json:"last_update"`
	Version            int               `json:"version"`
	Type               string            `json:"type"`
	PrimarySources     []HTSourceElement `json:"primary_sources"`
	ReferencesSources  []HTSourceElement `json:"reference_sources"`
	ReligiousSources   []HTSourceElement `json:"religious_sources"`
	SocialMediaSources []HTSourceElement `json:"social_media_sources"`
}

var sourceMap map[string]HTSourceElement
var allSourceMap map[string]HTSourceElement

type HTText struct {
	Text        string     `json:"text"`
	Source      []HTSource `json:"source"`
	FillDates   []HTDate   `json:"date_time"`
	IsTable     bool       `json:"isTable"`
	ImgDesc     string     `json:"imgdesc"`
	Format      string     `json:"format"`
	PostMention string     `json:"PostMention"`
}

type HTMap struct {
	Text     string   `json:"text"`
	Img      string   `json:"img"`
	Order    int      `json:"order"`
	DateTime []HTDate `json:"date_time"`
}

type HTCommonContent struct {
	ID        string           `json:"id"`
	Desc      string           `json:"desc"`
	Target    string           `json:"target"`
	Page      string           `json:"page"`
	ValueType string           `json:"value_type"`
	HTMLValue string           `json:"html_value"`
	Value     []IdxFamilyValue `json:"value"`
	FillDates []HTDate         `json:"date_time"`
}

type HTOldFileFormat struct {
	Title      string            `json:"title"`
	Header     string            `json:"header"`
	License    []string          `json:"license"`
	Sources    []string          `json:"sources"`
	LastUpdate []string          `json:"last_update"`
	Audio      []HTAudio         `json:"audio"`
	Contents   []HTCommonContent `json:"content"`
	DateTime   []HTDate          `json:"date_time"`
}

type HTKeywordsFormat struct {
	License  []string `json:"license"`
	Keywords []string `json:"keywords"`
}

// Common functions
func htUpdateTimestamp() string {
	newStr := fmt.Sprintf("%d", time.Now().Unix())

	return newStr
}

func htCountLines(filePath string) (int, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}

	scanner := bufio.NewScanner(file)
	lineCount := 0
	for scanner.Scan() {
		lineCount++
	}

	if err := scanner.Err(); err != nil {
		file.Close()
		return 0, err
	}

	file.Close()
	return lineCount, nil
}

func htReportErrLineCounter(localPath string, fileName string, lang string) {
	// Files expected to have different content across languages
	exception := "052e06b9-f10c-4e76-896d-9f0e68f07506"
	if fileName == exception {
		return
	}

	lines, errL := htCountLines(localPath)
	if errL == nil {
		if cmp, ok := linesMap[fileName]; !ok {
			linesMap[fileName] = lines
		} else if cmp != lines {
			fmt.Fprintf(os.Stderr, "MISMATCHING LINES: %s (%s): %d: first stored: %d\n", fileName, lang, lines, cmp)
		}
	}
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
		fmt.Println("Copying file", srcFile, " to ", dstFile)
	}
	return nil
}

func htCommonJSONError(byteValue []byte, err error) {
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
		begin := t.Offset
		if begin > 256 {
			begin -= 256
		} else if begin > 30 {
			begin -= 30
		}
		jsn := string(byteValue[begin:t.Offset])
		jsn += "<--(Invalid Type)"
		fmt.Fprintf(os.Stderr, "Invalid type at offset %v\n %s", t.Offset, jsn)
	default:
		fmt.Printf("Invalid character at offset\n %s", err.Error())
	}
}

func htDateToString(dt *HTDate, lang string, dateAbbreviation bool) string {
	year, _ := strconv.Atoi(dt.Year)
	suffix := ""
	if year < 0 {
		year = -year
		if lang == "en-US" {
			suffix = " B.E.C."
		} else {
			suffix = " A.E.C."
		}
	} else if dt.Year == "now" {
		year, _, _ = time.Now().Date()
	}

	if dt == nil || dt.DateType != "gregory" {
		return ""
	}

	if dt.Month == "-1" || dt.Day == "-1" {
		ret := fmt.Sprintf("%d%s", year, suffix)
		return ret
	}

	var months []string
	if dateAbbreviation == true {
		months = htAbbrMonthCalendarEN
	} else if lang == "pt-BR" {
		months = htMonthCalendarPT
	} else if lang == "es-ES" {
		months = htMonthCalendarES
	} else {
		months = htMonthCalendarEN
	}

	var month string
	switch dt.Month {
	case "1":
		month = months[0]
		break
	case "2":
		month = months[1]
		break
	case "3":
		month = months[2]
		break
	case "4":
		month = months[3]
		break
	case "5":
		month = months[4]
		break
	case "6":
		month = months[5]
		break
	case "7":
		month = months[6]
		break
	case "8":
		month = months[7]
		break
	case "9":
		month = months[8]
		break
	case "10":
		month = months[9]
		break
	case "11":
		month = months[10]
		break
	case "12":
	default:
		month = months[11]
		break
	}
	ret := fmt.Sprintf("%s %s %d%s", dt.Day, month, year, suffix)

	return ret
}

// Sources
func htCompareSources(first *HTSourceElement, second *HTSourceElement) bool {
	if first.ID == second.ID &&
		first.Citation == second.Citation &&
		// Date can be changed to confirm data is still available
		// first.Date == second.Date &&
		first.PublishDate == second.PublishDate &&
		first.URL == second.URL {
		return true
	}

	return false
}

func htFillSourceMap(src []HTSourceElement) {
	for _, element := range src {
		if _, ok := sourceMap[element.ID]; !ok {
			sourceMap[element.ID] = element
		}

		if stored, ok := allSourceMap[element.ID]; !ok {
			allSourceMap[element.ID] = element
		} else if ok {
			if !htCompareSources(&stored, &element) {
				fmt.Fprintf(os.Stderr, "The UUID %s is not unique: STORED (%s, %s, %s, %s) && ELEMENT (%s, %s, %s, %s).\n", element.ID, stored.Citation, stored.PublishDate, stored.URL, element.Citation, element.PublishDate, element.URL)
			}
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

func htLoadSourceFromFile(srcs []string) {
	for _, ptr := range srcs {
		localPath := fmt.Sprintf("%slang/sources/%s.json", CFG.SrcPath, ptr)
		byteValue, err := htOpenFileReadClose(localPath)
		if err != nil {
			panic(err)
		}

		var sources HTSourceFile
		err = json.Unmarshal(byteValue, &sources)
		if err != nil {
			htCommonJSONError(byteValue, err)
			panic(err)
		}

		htUpdateSourceFile(&sources, localPath)

		htFillSourcesMap(&sources)
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

func htRewriteSource(fileName string) {
	srcPath := fmt.Sprintf("%slang/sources/%s", CFG.SrcPath, fileName)

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

func htRewriteSources() {
	srcDir := fmt.Sprintf("%slang/sources/", CFG.SrcPath)
	entries, err := os.ReadDir(srcDir)
	if err != nil {
		panic(err)
	}

	for _, fileName := range entries {
		if fileName.IsDir() {
			continue
		} else {
			htRewriteSource(fileName.Name())
		}
	}
}

func htRewriteSourceFileTemplate() {
	fileName := fmt.Sprintf("%ssrc/json/sources_template.json", CFG.SrcPath)
	if verboseFlag {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR Adjusting file", fileName)
		panic(err)
	}

	var src HTSourceFile
	err = json.Unmarshal(byteValue, &src)
	if err != nil {
		htCommonJSONError(byteValue, err)
		panic(err)
	}

	newFile, err := htWriteTmpFile(htLangPaths[0], &src)
	HTCopyFilesWithoutChanges(fileName, newFile)
	err = os.Remove(newFile)
	if err != nil {
		panic(err)
	}
}

func htConvertDateStringToHTDate(dtStr string) HTDate {
	var year string = ""
	var month string = ""
	var day string = ""

	length := len(dtStr)
	if length == 4 {
		year = dtStr
	} else {
		values := strings.Split(dtStr, "-")
		year = values[0]
		if len(values) > 1 {
			month = values[1]
			day = values[2]
		}
	}

	if len(year) == 0 {
		return HTDate{DateType: "", Year: year, Month: month, Day: day}
	}

	return HTDate{DateType: "gregory", Year: year, Month: month, Day: day}
}

func htUpdateSourceData(src *HTSource) {
	if element, ok := sourceMap[src.UUID]; ok {
		src.Date = htConvertDateStringToHTDate(element.PublishDate)
	}
}

func htUpdateSourcesData(src []HTSource) {
	if len(src) == 0 {
		return
	}

	for i := 0; i < len(src); i++ {
		s := &src[i]
		if s == nil {
			continue
		}
		htUpdateSourceData(s)
	}
}

// Family
func htWriteFamilyIndexFile(lang string, index *IdxFamily) (string, error) {
	id := uuid.New()
	strID := id.String()

	tmpFile := fmt.Sprintf("%slang/%s/%s.tmp", CFG.SrcPath, lang, strID)

	fp, err := os.Create(tmpFile)
	if err != nil {
		return "", err
	}

	e := json.NewEncoder(fp)
	e.SetEscapeHTML(false)
	e.SetIndent("", "   ")
	e.Encode(index)

	fp.Close()

	return tmpFile, nil
}

// Audio
func htGetLastChar(line string) (rune, bool) {
	trimmed := strings.TrimSpace(line)
	if len(trimmed) == 0 {
		return 0, false
	}
	return []rune(trimmed)[len([]rune(trimmed))-1], true
}

func htAdjustAudioStringBeforeWrite(str string) string {
	tableLineRegex := regexp.MustCompile(`(?m)^\+\-+(?:\+\-+)+\+$`)
	dashLineRegex := regexp.MustCompile(`^\s*-+\s*$`)
	patternLinksRegex := regexp.MustCompile(`\(\s*(?:;+\s*)+\)`)

	lines := strings.Split(str, "\n")
	final := ""
	for _, line := range lines {
		if tableLineRegex.MatchString(line) {
			continue
		}

		if dashLineRegex.MatchString(line) {
			continue
		}

		if patternLinksRegex.MatchString(line) {
			line = patternLinksRegex.ReplaceAllString(line, "")
		}

		if len(line) > 1 {
			if lastChar, ok := htGetLastChar(line); ok {
				if lastChar != '.' && lastChar != '?' && lastChar != ':' {
					line += "."
				} else if lastChar == ':' {
					line = line[0:len(line)-1] + "."
				}
			}
		}

		final += line + "\n"
	}

	ret := final

	// Headers
	ret = strings.ReplaceAll(ret, "(Part I)", "(Part 1)")
	ret = strings.ReplaceAll(ret, "(Parte I)", "(Parte 1)")
	ret = strings.ReplaceAll(ret, "(Part II)", "(Part 2)")
	ret = strings.ReplaceAll(ret, "(Parte II)", "(Parte 2)")
	ret = strings.ReplaceAll(ret, "(Part III)", "(Part 3)")
	ret = strings.ReplaceAll(ret, "(Parte III)", "(Parte 3)")
	ret = strings.ReplaceAll(ret, "|", ".")
	ret = strings.ReplaceAll(ret, "*", "")
	ret = strings.ReplaceAll(ret, "( )", "")

	return ret
}

func htWriteAudioFile(fileName string, lang string, content string) error {
	localPath := fmt.Sprintf("%saudios/%s_%s", CFG.SrcPath, fileName, lang)

	fp, err := os.Create(localPath)
	if err != nil {
		return err
	}

	text := []byte(content)

	fp.Write(text)

	fp.Close()

	return nil
}

func htWriteTmpFile(lang string, data interface{}) (string, error) {
	id := uuid.New()
	strID := id.String()

	tmpFile := fmt.Sprintf("%slang/%s/%s.tmp", CFG.SrcPath, lang, strID)

	fp, err := os.Create(tmpFile)
	if err != nil {
		return "", err
	}

	e := json.NewEncoder(fp)
	e.SetEscapeHTML(false)
	e.SetIndent("", "   ")
	e.Encode(data)

	fp.Close()

	return tmpFile, nil
}

func htLoadOldFileFormat(cf *HTOldFileFormat, name string, lang string) (string, error) {
	fileName := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, name)
	if verboseFlag {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR Adjusting file", fileName)
		return "", err
	}

	err = json.Unmarshal(byteValue, cf)
	if err != nil {
		htCommonJSONError(byteValue, err)
		return "", err
	}

	return fileName, nil
}

func htUpdateClassSources(localTemplateFile *classTemplateFile) {
	for _, classData := range localTemplateFile.Content {
		for _, textData := range classData.Text {
			if textData.Format != "markdown" && textData.Format != "html" {
				log.Fatalf("Invalid type : %s", textData.Format)
			}

			if textData.Source == nil {
				continue
			}

			for i := 0; i < len(textData.Source); i++ {
				src := &textData.Source[i]
				element, ok := sourceMap[src.UUID]
				if ok {
					dt := &src.Date
					if len(dt.DateType) > 0 {
						continue
					}

					length := len(element.PublishDate)
					if length == 0 {
						continue
					}

					dt.DateType = "gregory"
					if length == 4 {
						dt.Year = element.PublishDate
					} else {
						fields := strings.Split(element.PublishDate, "-")
						length = len(fields)
						if length == 0 {
							continue
						}

						dt.Year = fields[0]
						dt.Month = fields[1]

						if length == 3 {
							dt.Day = fields[2]
						}
					}
				}
			}
		}
	}
}

func htLoadClassFileFormat(cf *classTemplateFile, name string, lang string) (string, error) {
	fileName := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, name)
	if verboseFlag {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR Adjusting file", fileName)
		return "", err
	}

	err = json.Unmarshal(byteValue, cf)
	if err != nil {
		htCommonJSONError(byteValue, err)
		return "", err
	}

	htLoadSourceFromFile(cf.Sources)
	htUpdateClassSources(cf)

	_, fileWasModified := htGitModifiedMap[fileName]
	if fileWasModified {
		cf.LastUpdate[0] = htUpdateTimestamp()
	}

	return fileName, nil
}

func htLoadKeywordFile(name string, lang string) error {
	var localKeywords []string
	fileName := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, name)
	if verboseFlag {
		fmt.Println("Loading Keyword", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR Keyword file", fileName)
		return err
	}

	var kf HTKeywordsFormat
	err = json.Unmarshal(byteValue, &kf)
	if err != nil {
		htCommonJSONError(byteValue, err)
		return err
	}

	for _, element := range kf.Keywords {
		localKeywords = append(localKeywords, element)
	}

	commonKeywords = localKeywords
	return nil
}

func htPrepareQuestions(questions []HTExercise) string {
	strQuestions := commonKeywords[50] + ".\n\n"
	// Write Questions
	i := 1
	for _, quest := range questions {
		strQuestions += strconv.Itoa(i) + ". " + quest.Question + ".\n\n"
		i++
	}

	i = 1
	strQuestions += commonKeywords[134] + "s.\n\n"
	for _, ans := range questions {
		strQuestions += commonKeywords[134] + " " + strconv.Itoa(i) + ". "
		ansText, err := htHTML2Text(ans.AdditionalInfo)
		if err != nil {
			strQuestions += ansText + "\n\n"
		} else {
			strQuestions += ans.AdditionalInfo + "\n\n"
		}
		i++
	}

	return strQuestions
}

func htChangeTag2Keywords(text string) string {
	ret := strings.ReplaceAll(text, "<span id=\"htZoomImageMsg\"></span>", commonKeywords[84])
	ret = strings.ReplaceAll(ret, "<span id=\"htAmericaAbyaYalaMsg\"></span>", commonKeywords[85])
	ret = strings.ReplaceAll(ret, "<span id=\"family_common_sn\"></span>", commonKeywords[52])
	ret = strings.ReplaceAll(ret, "<span id=\"htChartMsg\"></span>", commonKeywords[112])
	ret = strings.ReplaceAll(ret, "<span id=\"htAgeMsg\"></span>", commonKeywords[131])
	ret = strings.ReplaceAll(ret, "<div class=\"first_steps_reflection\" id=\"htReligiousReflection\"></div>", "<div class=\"first_steps_reflection\" id=\"htReligiousReflection\">"+commonKeywords[69]+"</div>")

	return ret
}

func htReplaceAllExceptions(text string) string {
	ret := strings.ReplaceAll(text, "(#)", "")

	return ret
}

func htHTML2Text(htmlStr string) (string, error) {
	doc, err := html.Parse(strings.NewReader(htmlStr))
	if err != nil {
		return "", err
	}
	var b strings.Builder

	isHidden := func(n *html.Node) bool {
		if n.Type != html.ElementNode {
			return false
		}
		switch n.Data {
		case "script", "style", "noscript", "head", "meta", "link":
			return true
		}
		return false
	}

	blockTags := map[string]bool{
		"p": true, "div": true, "br": true,
		"h1": true, "h2": true, "h3": true, "h4": true, "h5": true, "h6": true,
		"li": true, "ul": true, "ol": true, "table": true, "tr": true,
	}

	// helper to collect text from a node (used for links)
	var collectAnchorText func(*html.Node, *strings.Builder)
	collectAnchorText = func(node *html.Node, ab *strings.Builder) {
		if node == nil {
			return
		}
		if node.Type == html.TextNode {
			ab.WriteString(strings.TrimSpace(node.Data))
			ab.WriteByte(' ')
		}
		for c := node.FirstChild; c != nil; c = c.NextSibling {
			collectAnchorText(c, ab)
		}
	}

	// main recursive traversal
	var walk func(*html.Node, bool)
	walk = func(n *html.Node, hidden bool) {
		if n == nil {
			return
		}
		if isHidden(n) {
			hidden = true
		}

		switch n.Type {
		case html.TextNode:
			if !hidden {
				text := strings.TrimSpace(n.Data)
				if text != "" {
					if b.Len() > 0 {
						last := b.String()[b.Len()-1]
						if last != ' ' && last != '\n' {
							b.WriteByte(' ')
						}
					}
					b.WriteString(text)
				}
			}

		case html.ElementNode:
			if blockTags[n.Data] {
				if b.Len() > 0 && !strings.HasSuffix(b.String(), "\n") {
					b.WriteByte('\n')
				}
			}

			if n.Data == "a" {
				var ab strings.Builder
				collectAnchorText(n, &ab)
				anchorText := strings.TrimSpace(ab.String())
				href := ""
				for _, a := range n.Attr {
					if a.Key == "href" {
						href = a.Val
						break
					}
				}
				if anchorText != "" {
					if b.Len() > 0 {
						last := b.String()[b.Len()-1]
						if last != ' ' && last != '\n' {
							b.WriteByte(' ')
						}
					}
					b.WriteString(anchorText)
				}
				if href != "" {
					b.WriteString(" (")
					b.WriteString(href)
					b.WriteString(")")
				}
			} else {
				for c := n.FirstChild; c != nil; c = c.NextSibling {
					walk(c, hidden)
				}
			}

			if blockTags[n.Data] {
				if b.Len() > 0 && !strings.HasSuffix(b.String(), "\n") {
					b.WriteByte('\n')
				}
			}

		default:
			for c := n.FirstChild; c != nil; c = c.NextSibling {
				walk(c, hidden)
			}
		}
	}

	walk(doc, false)

	// Normalize whitespace and remove empty lines
	result := strings.ReplaceAll(b.String(), "\r", "")
	lines := strings.Split(result, "\n")
	finalLines := make([]string, 0, len(lines))
	for _, ln := range lines {
		trim := strings.TrimSpace(ln)
		if trim != "" {
			finalLines = append(finalLines, trim)
		}
	}
	return strings.Join(finalLines, "\n\n"), nil
}

func htTextToHumanText(txt *HTText, dateAbbreviation bool) string {
	var finalText string = ""
	var htmlText string
	var err error

	if txt.Format == "html" {
		ret := htChangeTag2Keywords(txt.Text)

		htmlText = htOverwriteDates(ret, txt.FillDates, "", "", dateAbbreviation) + "<br />"
	} else if txt.Format == "markdown" {
		work := txt.Text
		if len(txt.PostMention) > 0 {
			work += txt.PostMention
		}

		work = htOverwriteDates(work, txt.FillDates, txt.PostMention, "", dateAbbreviation)
		htmlText = htMarkdownToHTML(work) + "<br />"
	} else {
		htFormatNotExpected(txt.Format)
	}

	if txt.PostMention == " " {
		txt.PostMention = ""
	}

	finalText, err = htHTML2Text(htmlText)
	if err != nil {
		panic(err)
	}

	if len(txt.ImgDesc) > 0 {
		finalText += "\n" + txt.ImgDesc
	}

	finalText = htReplaceAllExceptions(finalText)

	return finalText
}

func htOverwriteDates(text string, dates []HTDate, PostMention string, lang string, dateAbbreviation bool) string {
	size := len(dates)
	if size == 0 {
		return text
	}

	for i := 0; i < size; i++ {
		dt := htDateToString(&dates[i], lang, dateAbbreviation)
		overwrite := "<htdate" + strconv.Itoa(i) + ">"
		text = strings.Replace(text, overwrite, dt, 1)
	}
	return text + PostMention
}

func htTextCommonContent(idx *HTCommonContent, lang string) string {
	var finalText string = ""
	var htmlText string = ""
	var err error

	if len(idx.HTMLValue) > 0 {
		htmlText = idx.HTMLValue

		htmlText = htOverwriteDates(idx.HTMLValue, idx.FillDates, ".", lang, false)
	} else if len(idx.Value) > 0 {
		for i := 0; i < len(idx.Value); i++ {
			fv := &idx.Value[i]

			work := fmt.Sprintf("%s : %s\n", fv.Name, fv.Desc)

			htmlText += htOverwriteDates(work, idx.FillDates, ".", lang, false)
		}
		htmlText = htMarkdownToHTML(htmlText)
	} else {
		return finalText
	}

	finalText, err = htHTML2Text(htmlText)
	if err != nil {
		panic(err)
	}

	return finalText + "\n"
}

func htLoopThroughContentFiles(Title string, Content []classTemplateContent) string {
	var ret string = ""
	if len(Title) > 0 {
		ret = Title + ".\n\n"
	}
	for _, content := range Content {
		for j := 0; j < len(content.Text); j++ {
			text := &content.Text[j]
			ret += htTextToHumanText(text, false)
			ret += text.PostMention + "\n\n"
		}
		ret += ".\n\n"
	}

	return ret
}

func htWriteClassIndexFile(lang string, index *classIdx) (string, error) {
	id := uuid.New()
	strID := id.String()

	tmpFile := fmt.Sprintf("%slang/%s/%s.tmp", CFG.SrcPath, lang, strID)

	fp, err := os.Create(tmpFile)
	if err != nil {
		return "", err
	}

	e := json.NewEncoder(fp)
	e.SetEscapeHTML(false)
	e.SetIndent("", "   ")
	e.Encode(index)

	fp.Close()

	return tmpFile, nil
}

func htAddNewSourceToDirectory(newFile string) {
	srcPath := fmt.Sprintf("%ssrc/json/sources_template.json", CFG.SrcPath)
	dstPath := fmt.Sprintf("%slang/sources/%s.json", CFG.SrcPath, newFile)

	if verboseFlag {
		fmt.Println("Copying ", srcPath, " to ", dstPath)
	}

	byteValue, err := htOpenFileReadClose(srcPath)
	if err != nil {
		panic(err)
	}

	var source HTSourceFile
	err = json.Unmarshal(byteValue, &source)
	if err != nil {
		htCommonJSONError(byteValue, err)
		panic(err)
	}

	source.LastUpdate[0] = htUpdateTimestamp()

	htUpdateSourceFile(&source, dstPath)
}

func htAddNewJSToDirectory(newFile string) {
	srcPath := fmt.Sprintf("%ssrc/js/ht_classes.js", CFG.SrcPath)
	dstPath := fmt.Sprintf("%s/js/%s.js", CFG.SrcPath, newFile)

	if verboseFlag {
		fmt.Println("Copying ", srcPath, " to ", dstPath)
	}

	HTCopyFilesWithoutChanges(dstPath, srcPath)
}

func htFormatNotExpected(format string) {
	text := fmt.Sprintf("Format '%s' not expected", format)
	panic(text)
}

func htDirectoryExists(path string) bool {
	info, err := os.Stat(path)
	if os.IsNotExist(err) {
		return false
	}
	return info.IsDir()
}

func htRemoveFilesWithoutextension(path string, ext string) {
	if !htDirectoryExists(path) {
		return
	}

	files, err := os.ReadDir(path)
	if err != nil {
		panic(err)
	}

	// Process each file
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		ext := filepath.Ext(file.Name())
		if ext == ".md" {
			continue
		}

		filePath := filepath.Join(path, file.Name())
		err := os.Remove(filePath)
		if err != nil {
			panic(err)
		}
	}
}
