// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"

	"jaytaylor.com/html2text"
)

var htLangPaths []string = []string{"en-US", "es-ES", "pt-BR"}
var indexFiles []string = []string{"science", "history", "indigenous_who", "first_steps", "literature"}

var commonKeywords []string

var htMonthCalendarPT []string = []string{"janeiro", "fevereiro", "março", "abril", "maio", "junho", "july", "agosto", "setembro", "outubro", "novembro", "dezembro"}
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
	ImgDesc     string     `json:"imgdesc"`
	Latex       string     `json:"latex"`
	Format      string     `json:"format"`
	PostMention string     `json:"PostMention"`
}

type HTMap struct {
	Text  string `json:"text"`
	Img   string `json:"img"`
	Order int    `json:"order"`
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
	if dt == nil || dt.DateType != "gregory" {
		return ""
	}

	if dt.Month == "-1" || dt.Day == "-1" {
		ret := fmt.Sprintf("%s", dt.Year)
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
	ret := fmt.Sprintf("%s %s %s", dt.Day, month, dt.Year)

	return ret
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
func htAdjustAudioStringBeforeWrite(str string) string {
	// Headers
	ret := strings.ReplaceAll(str, "-------------\n", "\n")
	ret = strings.ReplaceAll(ret, "---------\n", "\n")
	ret = strings.ReplaceAll(ret, "--------\n", "\n")
	ret = strings.ReplaceAll(ret, "*", "")
	ret = strings.ReplaceAll(ret, "(Part I)", "(Part 1)")
	ret = strings.ReplaceAll(ret, "(Parte I)", "(Parte 1)")
	ret = strings.ReplaceAll(ret, "(Part II)", "(Part 2)")
	ret = strings.ReplaceAll(ret, "(Parte II)", "(Parte 2)")
	ret = strings.ReplaceAll(ret, "(Part III)", "(Part 3)")
	ret = strings.ReplaceAll(ret, "(Parte III)", "(Parte 3)")

	// URL
	ret = strings.ReplaceAll(ret, "( # )", "")

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

func htTextToHumanText(txt *HTText, dateAbbreviation bool) string {
	var finalText string = ""
	var htmlText string
	var err error

	if txt.Format == "html" {
		work := txt.Text

		htmlText = htOverwriteDates(work, txt.FillDates, "", "", dateAbbreviation)
	} else if txt.Format == "markdown" {
		work := txt.Text
		if len(txt.PostMention) > 0 {
			work += txt.PostMention
		}

		work = htOverwriteDates(work, txt.FillDates, txt.PostMention, "", dateAbbreviation)
		htmlText = htMarkdownToHTML(work)
	} else {
		return finalText
	}

	finalText, err = html2text.FromString(htmlText, html2text.Options{PrettyTables: true, OmitLinks: true})
	if err != nil {
		panic(err)
	}

	if len(txt.ImgDesc) > 0 {
		finalText += "\n" + txt.ImgDesc
	}

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

	finalText, err = html2text.FromString(htmlText, html2text.Options{PrettyTables: true})
	if err != nil {
		panic(err)
	}

	return finalText + "\n"
}

func htLoopThroughContentFiles(ctf *classTemplateFile) string {
	var ret string = ""
	if len(ctf.Title) > 0 {
		ret = ctf.Title + ".\n\n"
	}
	for i := 0; i < len(ctf.Content); i++ {
		content := &ctf.Content[i]

		for j := 0; j < len(content.Text); j++ {
			text := &content.Text[j]
			ret += htTextToHumanText(text, false)
			if len(text.PostMention) > 0 {
				ret += text.PostMention + "\n\n"
			}
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
