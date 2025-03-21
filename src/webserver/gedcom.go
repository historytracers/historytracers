// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"

	"github.com/google/uuid"
	"github.com/iand/gedcom"
)

// Enum
const (
	HTEventBirth = iota
	HTEventBaptism
	HTEventMarriage
	HTEventDeath
)

// Index
type IdxFamilyValue struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Desc   string `json:"desc"`
	GEDCOM string `json:"gedcom"`
}

type IdxFamilyContent struct {
	ID        string           `json:"id"`
	Desc      string           `json:"desc"`
	Target    string           `json:"target"`
	Page      string           `json:"page"`
	ValueType string           `json:"value_type"`
	HTMLValue string           `json:"html_value"`
	Value     []IdxFamilyValue `json:"value"`
}

type IdxFamily struct {
	Title      string             `json:"title"`
	Header     string             `json:"header"`
	License    []string           `json:"license"`
	Sources    []string           `json:"sources"`
	LastUpdate []string           `json:"last_update"`
	GEDCOM     string             `json:"gedcom"`
	Contents   []IdxFamilyContent `json:"content"`
	DateTime   []HTDate           `json:"date_time"`
}

// Family
type FamilyPersonEvent struct {
	Date    []HTDate   `json:"date"`
	Address string     `json:"address"`
	City    string     `json:"city"`
	State   string     `json:"state"`
	PC      string     `json:"pc"`
	Country string     `json:"country"`
	Sources []HTSource `json:"sources"`
}

type FamilyPersonParents struct {
	Type               string `json:"type"`
	FatherExternalFile bool   `json:"father_external_family_file"`
	FatherFamily       string `json:"father_family"`
	FatherID           string `json:"father_id"`
	FatherName         string `json:"father_name"`
	MotherExternalFile bool   `json:"mother_external_family_file"`
	MotherFamily       string `json:"mother_family"`
	MotherID           string `json:"mother_id"`
	MotherName         string `json:"mother_name"`
}

type FamilyPersonMarriage struct {
	Type         string            `json:"type"`
	ID           string            `json:"id"`
	GEDCOMId     string            `json:"gedcom_id"`
	Official     bool              `json:"official"`
	FamilyID     string            `json:"family_id"`
	ExternalFile bool              `json:"external_family_file"`
	Name         string            `json:"name"`
	History      []HTText          `json:"history"`
	DateTime     FamilyPersonEvent `json:"date_time"`
}

type FamilyPersonChild struct {
	Type         string   `json:"type"`
	ID           string   `json:"id"`
	MarriageID   string   `json:"marriage_id"`
	Name         string   `json:"name"`
	FamilyID     string   `json:"family_id"`
	ExternalFile bool     `json:"external_family_file"`
	AddLink      bool     `json:"add_link"`
	History      []HTText `json:"history"`
	AdoptedChild bool     `json:"adopted_child"`
}

type FamilyPersonHaplogroup struct {
	Type       string     `json:"type"`
	Haplogroup string     `json:"haplogroup"`
	Sources    []HTSource `json:"sources"`
}

type FamilyPerson struct {
	ID         string                   `json:"id"`
	Name       string                   `json:"name"`
	Sex        string                   `json:"sex"`
	Gender     string                   `json:"gender"`
	Real       bool                     `json:"is_real"`
	Haplogroup []FamilyPersonHaplogroup `json:"haplogroup"`
	History    []HTText                 `json:"history"`
	Parents    []FamilyPersonParents    `json:"parents"`
	Birth      []FamilyPersonEvent      `json:"birth"`
	Baptism    []FamilyPersonEvent      `json:"baptism"`
	Marriages  []FamilyPersonMarriage   `json:"marriages"`
	Divorced   []FamilyPersonMarriage   `json:"divorced"`
	Children   []FamilyPersonChild      `json:"children"`
	Death      []FamilyPersonEvent      `json:"death"`
}

type FamilyBody struct {
	ID      string         `json:"id"`
	Name    string         `json:"name"`
	History []HTText       `json:"history"`
	People  []FamilyPerson `json:"people"`
}

type Family struct {
	Title         string       `json:"title"`
	Header        string       `json:"header"`
	Sources       []string     `json:"sources"`
	Scripts       []string     `json:"scripts"`
	Index         []string     `json:"index"`
	Common        []HTText     `json:"common"`
	License       []string     `json:"license"`
	LastUpdate    []string     `json:"last_update"`
	Authors       string       `json:"authors"`
	Reviewers     string       `json:"reviewers"`
	DocumentsInfo []string     `json:"documentsInfo"`
	PeriodOfTime  []string     `json:"periodOfTime"`
	Maps          []HTMap      `json:"maps"`
	Prerequisites []string     `json:"prerequisites"`
	GEDCOM        string       `json:"gedcom"`
	Version       int          `json:"version"`
	Type          string       `json:"type"`
	Families      []FamilyBody `json:"families"`
	Exercises     []HTExercise `json:"exercise_v2"`
	DateTime      []HTDate     `json:"date_time"`
}

type FamilyKey struct {
	firstPerson  string
	secondPerson string
	file         string
}

var familyUpdated bool
var indexUpdated bool
var marriagesMap map[FamilyKey]bool
var sourceMap map[string]HTSourceElement
var peopleMap map[FamilyKey]*gedcom.FamilyRecord

// GEDCOM
func htXrefGEDCOM(prefix string, id string) string {
	localXRef := fmt.Sprintf("%s%s", prefix, id[0:18])
	return localXRef
}

/*
func htSelLanguageName(lang string) string {
	switch lang {
	case "pt-BR":
		return "pt"
	case "es-ES":
		return "es"
	case "en-US":
	default:
		break
	}
	return "en"
}
*/

func htParseIndexSetGEDCOM(families *IdxFamily, lang string) {
	if len(families.GEDCOM) > 0 {
		return
	}

	families.GEDCOM = fmt.Sprintf("gedcom/families-%s.ged", lang)
	if verboseFlag {
		fmt.Println("Setting GEDCOM file to: ", families.GEDCOM)
	}
	indexUpdated = true
}

func htSetGEDCOMHeader(g *gedcom.Gedcom, lang string) {
	htSub := &gedcom.SubmitterRecord{
		Xref: "SUBM",
		Name: "History Tracers",
	}
	//localLang := htSelLanguageName(lang)

	g.Submitter = append(g.Submitter, htSub)

	g.Header = &gedcom.Header{
		SourceSystem: gedcom.SystemRecord{
			Xref:            "HistoryTracers",
			SourceName:      "https://historytracers.org/",
			SourceCopyright: "GPL3 and CC BY-NC 4.0 DEED",
		},
		Submitter:    htSub,
		CharacterSet: "UTF-8",
		//Language:     localLang,
		Version:   "5.5.1",
		Copyright: "CC BY-NC 4.0 DEED",
		Form:      "LINEAGE-LINKED",
	}
}

func htWriteGEDCOM(g *gedcom.Gedcom, fileName string) error {
	if len(fileName) == 0 {
		return nil
	}

	fp, err := os.Create(fileName)
	if err != nil {
		return err
	}

	g.Trailer = &gedcom.Trailer{}
	enc := gedcom.NewEncoder(fp)
	if err := enc.Encode(g); err != nil {
		return err
	}

	fp.Close()

	return nil
}

func htParseFamilySetGEDCOM(families *Family, fileName string, lang string) {
	if len(families.GEDCOM) > 0 {
		return
	}

	families.GEDCOM = fmt.Sprintf("gedcom/%s_%s.ged", fileName, lang)
	if verboseFlag {
		fmt.Println("Setting GEDCOM file to: ", families.GEDCOM)
	}
	familyUpdated = true
}

// Family
func htWriteFamilyFile(lang string, family *Family) (string, error) {
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
	e.Encode(family)

	fp.Close()

	return tmpFile, nil
}

func htFamilyEventName(selector int) string {
	switch selector {
	case HTEventBirth:
		return "BIRT"
	case HTEventBaptism:
		return "BAPM"
	case HTEventMarriage:
		return "MARR"
	case HTEventDeath:
	default:
		break
	}
	return "DEAT"
}

func htFamilyEventDate(dt *HTDate) string {
	if dt == nil || dt.DateType != "gregorian" {
		return ""
	}

	if dt.Month == "-1" || dt.Day == "-1" {
		ret := fmt.Sprintf("%s", dt.Year)
		return ret
	}

	var month string
	switch dt.Month {
	case "1":
		month = "JAN"
		break
	case "2":
		month = "FEB"
		break
	case "3":
		month = "MAR"
		break
	case "4":
		month = "APR"
		break
	case "5":
		month = "MAY"
		break
	case "6":
		month = "JUN"
		break
	case "7":
		month = "JUL"
		break
	case "8":
		month = "AUG"
		break
	case "9":
		month = "SEPT"
		break
	case "10":
		month = "OCT"
		break
	case "11":
		month = "NOV"
		break
	case "12":
	default:
		month = "DEC"
		break
	}
	ret := fmt.Sprintf("%s %s %s", dt.Day, month, dt.Year)

	return ret
}

func htGEDCOMCitationTitle(lang string, selector int) string {
	if selector == 0 {
		switch lang {
		case "Português":
			return "Fonte primária que comprova o evento."
		case "Español":
			return "Fuente primaria que comprueba el evento."
		case "English":
		default:
			break
		}
		return "A primary source confirming the event."
	}

	switch lang {
	case "Português":
		return "Não se trata de uma fonte primária, portanto, não comprova as informações apresentadas."
	case "Español":
		return "No es una fuente primaria, por lo tanto, no comprueba la información presentada."
	case "English":
	default:
		break
	}
	return "This is not a primary source; therefore, it does not confirm the event."
}

func htGEDCOMCitation(citation *HTSource, lang string) *gedcom.CitationRecord {
	element, ok := sourceMap[citation.UUID]
	if !ok {
		return nil
	}

	localXref := htXrefGEDCOM("S", citation.UUID)
	note := htGEDCOMCitationTitle(lang, citation.Type)
	ret := &gedcom.CitationRecord{
		Source: &gedcom.SourceRecord{
			Xref: localXref,
		},
		Note: []*gedcom.NoteRecord{
			{
				Note: note,
			},
			{
				Note: element.Citation,
			},
			{
				Note: citation.Text,
			},
		},
	}

	if len(element.URL) > 0 {
		ret.Source.Originator = element.URL
	}

	return ret
}

func htGEDCOMCitations(citation []HTSource, lang string) []*gedcom.CitationRecord {
	var ret []*gedcom.CitationRecord
	for _, element := range citation {
		gedCit := htGEDCOMCitation(&element, lang)
		if gedCit != nil {
			ret = append(ret, gedCit)
		}
	}
	return ret
}

/*
func htFamilyAddNewMarriageEvent(event *FamilyPersonMarriage, eventType int) *gedcom.EventRecord {
	tag := htFamilyEventName(eventType)

	ev := &gedcom.EventRecord{
		Tag:  tag,
	}

	return ev
}
*/

func htFamilyAddNewPersonalEvent(event *FamilyPersonEvent, eventType int, lang string) *gedcom.EventRecord {
	tag := htFamilyEventName(eventType)
	dt := htFamilyEventDate(&event.Date[0])

	ev := &gedcom.EventRecord{
		Tag:  tag,
		Date: dt,
	}

	var fullAddr string = ""
	if len(event.Address) > 0 {
		fullAddr += event.Address
	}

	if len(event.City) > 0 {
		if len(fullAddr) > 0 {
			fullAddr += ", "
		}
		fullAddr += event.City
	}

	if len(event.State) > 0 {
		if len(fullAddr) > 0 {
			fullAddr += ", "
		}
		fullAddr += event.State
	}

	if len(event.Country) > 0 {
		if len(fullAddr) > 0 {
			fullAddr += ", "
		}
		fullAddr += event.Country
	}

	if len(event.PC) > 0 {
		if len(fullAddr) > 0 {
			fullAddr += " - "
		}
		fullAddr += event.PC
	}

	ev.Place = gedcom.PlaceRecord{Name: fullAddr}

	citations := htGEDCOMCitations(event.Sources, lang)
	ev.Citation = citations

	return ev
}

func htFamilyPersonFillEvents(individual *gedcom.IndividualRecord, events []FamilyPersonEvent, lang string) {
	if events != nil {
		for _, element := range events {
			famEvent := htFamilyAddNewPersonalEvent(&element, HTEventBirth, lang)
			individual.Event = append(individual.Event, famEvent)
		}
	}

}

/*
func htFamilyMarriageFillEvents(individual *gedcom.IndividualRecord, events []FamilyPersonMarriage, lang string) {
	if events != nil {
		for _, element := range events {
			famEvent := htFamilyAddNewMarriageEvent(&element, HTEventBirth)
			individual.Event = append(individual.Event, famEvent)
		}
	}
}
*/

// TODO: CURRENT JSON FAMILIES DO NOT HAVE CONNECTION BETWEEN THEM
// AS SOON WE HAVE THESE CONNECTIONS, IT WILL BE NECESSARY TO LOAD ALL
// JSON FILES, AND AFTER THIS TO WRITE
func htFamilyAddIndividual(person *FamilyPerson, lang string) *gedcom.IndividualRecord {
	localXRef := htXrefGEDCOM("I", person.ID)
	localSex := "M"
	if person.Sex == "female" {
		localSex = "F"
	}

	individual := &gedcom.IndividualRecord{
		Xref: localXRef,
		Name: []*gedcom.NameRecord{
			{
				Name: person.Name,
			},
		},
		Sex: localSex,
	}

	htFamilyPersonFillEvents(individual, person.Birth, lang)
	htFamilyPersonFillEvents(individual, person.Baptism, lang)
	htFamilyPersonFillEvents(individual, person.Death, lang)
	//htFamilyMarriageFillEvents(individual, person.Marriages, lang)

	return individual
}

func htFamilyAddIndividualPartner(marr *FamilyPersonMarriage, partnerSex string, lang string) *gedcom.IndividualRecord {
	localXRef := htXrefGEDCOM("I", marr.ID)

	individual := &gedcom.IndividualRecord{
		Xref: localXRef,
		Name: []*gedcom.NameRecord{
			{
				Name: marr.Name,
			},
		},
		Sex: partnerSex,
	}

	return individual
}

func htFamilyAddFamilyRecord(familyGC *gedcom.FamilyRecord, typeFam string) []*gedcom.FamilyLinkRecord {
	ret := []*gedcom.FamilyLinkRecord{
		{
			Family: familyGC,
		},
	}

	if len(typeFam) > 0 {
		ret[0].Type = typeFam
	}

	return ret
}

func htFamilySetMarriageGEDCOMId(person *FamilyPerson, marr *FamilyPersonMarriage, global *gedcom.Gedcom, local *gedcom.Gedcom, xref string) {
	familyGC := &gedcom.FamilyRecord{
		Xref: xref,
	}

	global.Family = append(global.Family, familyGC)
	local.Family = append(local.Family, familyGC)

	individual := htFamilyAddIndividual(person, global.Header.Language)

	partnerSex := "F"
	if individual.Sex == "M" {
		familyGC.Husband = individual
		individual.Family = htFamilyAddFamilyRecord(familyGC, "")
	} else {
		partnerSex = "M"
		familyGC.Wife = individual
		individual.Family = htFamilyAddFamilyRecord(familyGC, "")
	}

	global.Individual = append(global.Individual, individual)
	local.Individual = append(local.Individual, individual)

	partnerIndividual := htFamilyAddIndividualPartner(marr, partnerSex, global.Header.Language)

	global.Individual = append(global.Individual, partnerIndividual)
	local.Individual = append(local.Individual, partnerIndividual)

	if partnerIndividual.Sex == "M" {
		familyGC.Husband = partnerIndividual
		partnerIndividual.Family = htFamilyAddFamilyRecord(familyGC, "")
	} else {
		familyGC.Wife = partnerIndividual
		partnerIndividual.Family = htFamilyAddFamilyRecord(familyGC, "")
	}

	key := FamilyKey{firstPerson: person.ID, secondPerson: marr.ID, file: ""}
	peopleMap[key] = familyGC

	for _, element := range person.Parents {
		key.firstPerson = element.FatherID
		key.secondPerson = element.MotherID
		if _, ok := peopleMap[key]; ok {
			individual.Parents = htFamilyAddFamilyRecord(familyGC, "")
			familyGC.Child = append(familyGC.Child, individual)
			continue
		}

		key.firstPerson = element.MotherID
		key.secondPerson = element.FatherID
		if _, ok := peopleMap[key]; ok {
			individual.Parents = htFamilyAddFamilyRecord(familyGC, "")
			familyGC.Child = append(familyGC.Child, individual)
		}
	}
}

func htFamilyFillGEDCOM(person *FamilyPerson, global *gedcom.Gedcom, local *gedcom.Gedcom, fileName string) {
	var gedcomID string

	for i := 0; i < len(person.Marriages); i++ {
		marr := &person.Marriages[i]

		key := FamilyKey{firstPerson: person.ID, secondPerson: marr.ID, file: fileName}
		if _, ok := marriagesMap[key]; !ok {
			marriagesMap[key] = true
		} else {
			verr := fmt.Sprintf("The same couple %s and %s, appears more than once in %s", person.ID, marr.ID, fileName)
			panic(verr)
		}

		if len(marr.GEDCOMId) > 0 {
			htFamilySetMarriageGEDCOMId(person, marr, global, local, marr.GEDCOMId)
			continue
		}

		familyUpdated = true

		id := uuid.New()
		strID := id.String()
		gedcomID = fmt.Sprintf("F%s", strID[0:18])

		marr.GEDCOMId = gedcomID

		htFamilySetMarriageGEDCOMId(person, marr, global, local, marr.GEDCOMId)
	}
}

func htParseFamilySetDefaultValues(families *Family, global *gedcom.Gedcom, local *gedcom.Gedcom, fileName string) {
	people := make(map[string]bool)

	for i := 0; i < len(families.Families); i++ {
		family := &families.Families[i]

		if family.History != nil {
			for j := 0; j < len(family.History); j++ {
				history := &family.History[j]

				if len(history.PostMention) == 0 {
					history.PostMention = "."
					familyUpdated = true
				}
				if len(history.Format) == 0 {
					if history.Source == nil {
						history.Format = "html"
					} else {
						history.Format = "markdown"
					}
					familyUpdated = true
				}
			}
		}

		if family.People == nil {
			continue
		}
		for j := 0; j < len(family.People); j++ {
			person := &family.People[j]
			people[person.ID] = true
		}
	}

	for i := 0; i < len(families.Families); i++ {
		family := &families.Families[i]

		if family.People == nil {
			continue
		}

		for j := 0; j < len(family.People); j++ {
			person := &family.People[j]

			htFamilyFillGEDCOM(person, global, local, fileName)

			if person.Children == nil {
				continue
			}

			for k := 0; k < len(person.Children); k++ {
				child := &person.Children[k]
				if val, ok := people[child.ID]; ok {
					child.AddLink = val
					familyUpdated = true
				}
			}
		}
	}
}

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

func htParseFamily(global *gedcom.Gedcom, fileName string, lang string, rewrite bool) (error, string) {
	familyUpdated = false
	localPath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, fileName)
	srcPath := fmt.Sprintf("%slang/sources/%s.json", CFG.SrcPath, fileName)
	if verboseFlag {
		fmt.Println("Parsing Family File", localPath)
	}

	jsonFile, err := os.Open(localPath)
	if err != nil {
		return err, ""
	}

	byteValue, err := io.ReadAll(jsonFile)
	if err != nil {
		return err, ""
	}
	jsonFile.Close()

	var family Family
	err = json.Unmarshal(byteValue, &family)
	if err != nil {
		htCommonJsonError(byteValue, err)
		return err, ""
	}

	if rewrite == false {
		return nil, ""
	}

	jsonFile, err = os.Open(srcPath)
	if err == nil {
		byteValue, err = io.ReadAll(jsonFile)
		if err == nil {
			var src HTSourceFile
			err = json.Unmarshal(byteValue, &src)
			if err == nil {
				htFillSourcesMap(&src)
			}
		}
		jsonFile.Close()
	}

	fgc := new(gedcom.Gedcom)
	htSetGEDCOMHeader(fgc, lang)

	htParseFamilySetGEDCOM(&family, fileName, lang)
	htParseFamilySetDefaultValues(&family, global, fgc, localPath)

	if familyUpdated == true {
		family.LastUpdate[0] = htUpdateTimestamp()
	}

	newFile, err := htWriteFamilyFile(lang, &family)

	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Println("ERROR", err)
		return err, ""
	}

	err = htWriteGEDCOM(fgc, family.GEDCOM)
	if err != nil {
		fmt.Println("ERROR", err)
		return err, ""
	}

	return nil, family.GEDCOM
}

// Adjust Family Index Files before GEDCOM creation
func htWriteIndexFile(lang string, index *IdxFamily) (string, error) {
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

func htParseFamilyIndex(fileName string, lang string, rewrite bool) error {
	if verboseFlag {
		fmt.Println("Adjusting file", fileName)
	}

	jsonFile, err := os.Open(fileName)
	if err != nil {
		return err
	}

	byteValue, err := io.ReadAll(jsonFile)
	if err != nil {
		return err
	}
	jsonFile.Close()

	var index IdxFamily
	err = json.Unmarshal(byteValue, &index)
	if err != nil {
		htCommonJsonError(byteValue, err)
		return err
	}

	htParseIndexSetGEDCOM(&index, lang)

	igc := new(gedcom.Gedcom)
	htSetGEDCOMHeader(igc, lang)

	for i := 0; i < len(index.Contents); i++ {
		content := index.Contents[i]
		if content.Value == nil {
			continue
		}

		if verboseFlag {
			fmt.Println("Parsing group", content.ID)
		}

		value := content.Value
		for j := 0; j < len(value); j++ {
			err, gedcom := htParseFamily(igc, value[j].ID, lang, rewrite)
			if err != nil {
				return err
			}
			if rewrite == true {
				value[j].GEDCOM = gedcom
			}
		}
	}

	if rewrite == false {
		return nil
	}

	if indexUpdated == true {
		index.LastUpdate[0] = htUpdateTimestamp()
	}

	newFile, err := htWriteIndexFile(lang, &index)
	if err != nil {
		return err
	}

	HTCopyFilesWithoutChanges(fileName, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Println("ERROR", err)
		return err
	}

	err = htWriteGEDCOM(igc, index.GEDCOM)
	if err != nil {
		fmt.Println("ERROR", err)
		return err
	}

	return nil
}

func htUpdateAllFamilies(rewrite bool) error {
	htLangPaths := [3]string{"en-US", "es-ES", "pt-BR"}
	for i := 0; i < len(htLangPaths); i++ {
		indexUpdated = false
		localPath := fmt.Sprintf("%slang/%s/families.json", CFG.SrcPath, htLangPaths[i])
		err := htParseFamilyIndex(localPath, htLangPaths[i], rewrite)
		if err != nil {
			panic(err)
		}
	}

	return nil
}

// Create Directories
func htRemoveCurrentGEDCOMDirectory(path string) {
	err := os.RemoveAll(path)
	if err != nil {
		panic(err)
	}
}

func htCreateGEDCOMDirectory() {
	localPath := fmt.Sprintf("%sgedcom/", CFG.SrcPath)
	htRemoveCurrentGEDCOMDirectory(localPath)

	if verboseFlag {
		fmt.Println("Creating GEDCOM directory", localPath)
	}
	htCreateDirectory(localPath)
}

// Entries
func htCreateGEDCOM() {
	marriagesMap = make(map[FamilyKey]bool)
	sourceMap = make(map[string]HTSourceElement)
	peopleMap = make(map[FamilyKey]*gedcom.FamilyRecord)
	htCreateGEDCOMDirectory()

	htUpdateAllFamilies(true)
}

// Validate
func htValidateGEDCOM() {
	marriagesMap = make(map[FamilyKey]bool)
	sourceMap = make(map[string]HTSourceElement)
	peopleMap = make(map[FamilyKey]*gedcom.FamilyRecord)
	htUpdateAllFamilies(false)
}
