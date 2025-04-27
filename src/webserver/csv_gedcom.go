// SPDX-License-Identifier: GPL-3.0-or-later

// The tested GEDCOM libraries did not meet our requirements. As an alternative,
// we are exporting the data as CSV and using Gramps to convert it to GEDCOM.
//
// https://www.gramps-project.org/wiki/index.php/Gramps_6.0_Wiki_Manual_-_Manage_Family_Trees:_CSV_Import_and_Export

package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
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
	CSV    string `json:"csv"`
}

type IdxFamilyContent struct {
	ID        string           `json:"id"`
	Desc      string           `json:"desc"`
	Target    string           `json:"target"`
	Page      string           `json:"page"`
	ValueType string           `json:"value_type"`
	HTMLValue string           `json:"html_value"`
	Value     []IdxFamilyValue `json:"value"`
	FillDates []HTDate         `json:"date_time"`
}

type IdxFamily struct {
	Title      string             `json:"title"`
	Header     string             `json:"header"`
	License    []string           `json:"license"`
	Sources    []string           `json:"sources"`
	LastUpdate []string           `json:"last_update"`
	Audio      []HTAudio          `json:"audio"`
	GEDCOM     string             `json:"gedcom"`
	CSV        string             `json:"csv"`
	Contents   []IdxFamilyContent `json:"content"`
	DateTime   []HTDate           `json:"date_time"`
}

// Family
type FamilyPersonEvent struct {
	Date      []HTDate   `json:"date"`
	Address   string     `json:"address"`
	CityID    string     `json:"city_id"`
	City      string     `json:"city"`
	StateID   string     `json:"state_id"`
	State     string     `json:"state"`
	PC        string     `json:"pc"`
	CountryID string     `json:"country_id"`
	Country   string     `json:"country"`
	Sources   []HTSource `json:"sources"`
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
	Surname    string                   `json:"surname"`
	Patronymic string                   `json:"patronymic"`
	FullName   string                   `json:"fullname"`
	Sex        string                   `json:"sex"`
	Gender     string                   `json:"gender"`
	IsReal     bool                     `json:"is_real"`
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
	Audio         []HTAudio    `json:"audio"`
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
	CSV           string       `json:"csv"`
	Version       int          `json:"version"`
	Type          string       `json:"type"`
	Families      []FamilyBody `json:"families"`
	Exercises     []HTExercise `json:"exercise_v2"`
	DateTime      []HTDate     `json:"date_time"`
}

var familyUpdated bool
var indexUpdated bool

// CSV Types
var htFamilyPlaceCSV [][]string
var htFamilyPeopleCSV [][]string
var htFamilyMarriageCSV [][]string
var htFamilyFamilyCSV [][]string

var htFamiliesPlaceCSV [][]string
var htFamiliesPeopleCSV [][]string
var htFamiliesMarriageCSV [][]string
var htFamiliesFamilyCSV [][]string

type FamilyKey struct {
	firstPerson  string
	secondPerson string
	file         string
}

type AddrKey struct {
	Place string
	Type  string
}

var addrMap map[AddrKey][]string
var addrMapLang map[AddrKey][]string
var marriagesMap map[FamilyKey][]string
var peopleMap map[string][]string

// Common CSV and GEDCOM
func htXrefGEDCOM(prefix string, id string) string {
	if len(id) < 19 {
		panic("AN EMPTY ID WAS GIVEN TO A PERSON")
	}
	localXRef := fmt.Sprintf("%s%s", prefix, id[0:18])
	return localXRef
}

// CSV
func htInitializeCSVPlace() [][]string {
	return [][]string{{"", "", "", "", "", "", "", "", ""}, {"", "", "", "", "", "", "", "", ""}, {"place", "title", "name", "type", "latitude", "longitude", "code", "enclosed_by", "date"}}
}

func htInitializeCSVPeople() [][]string {
	return [][]string{{"", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""}, {"", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""}, {"person", "firstname", "surname", "callname", "prefix", "suffix", "title", "gender", "source", "note", "birthdate", "birthplace", "birthplaceid", "birthsource", "baptismdate", "baptismplace", "baptismplaceid", "baptismsouce", "deathdate", "deathplace", "deathplaceid", "deathsource"}}
}

func htSelectFirstSource(sources []HTSource) (string, int) {
	for i := 0; i < len(sources); i++ {
		src := &sources[i]

		element, ok := sourceMap[src.UUID]
		if ok {
			var url string = ""
			if element.URL != "" {
				url = ", (" + element.URL + ")"
			}
			return element.Citation + url, src.Type
		}
		return src.Text, src.Type
	}

	return "", -1
}

func htSelectSource(sources []HTSource) (string, int) {
	var uuid string = ""
	var idx int = 0
	for i := 0; i < len(sources); i++ {
		src := &sources[i]

		if src.Type == 0 {
			idx = i
			uuid = src.UUID
			break
		} else if len(uuid) == 0 {
			idx = i
			uuid = src.UUID
		}
	}

	if len(uuid) > 0 {
		src := &sources[idx]
		element, ok := sourceMap[uuid]
		if ok {
			var url string = ""
			if element.URL != "" {
				url = ", (" + element.URL + ")"
			}
			return element.Citation + url, src.Type
		}
		return src.Text, src.Type
	}

	return "", -1
}

func htSelectSourceFromText(texts []HTText) (string, int) {
	for i := 0; i < len(texts); i++ {
		text := &texts[i]

		if text.Source == nil {
			continue
		}
		ret, sourceType := htSelectSource(text.Source)

		if sourceType >= 0 {
			return ret, sourceType
		}
	}

	return "", -1
}

func htSelectSourceNote(lang string, src int) string {
	if src == 0 {
		if lang == "pt-BR" {
			return "Confirmado por fontes primárias."
		} else if lang == "es-ES" {
			return "De acuerdo con fuentes primarias."
		}
		return "According to Primary Sources."
	} else {
		if lang == "pt-BR" {
			return "Não foram encontradas fontes primárias."
		} else if lang == "es-ES" {
			return "No se encontraron fuentes primarias."
		}
		return "No primary source was found to confirm this."
	}
}

func htSetCSVBasicPerson(name string, id string, lang string, child *FamilyPersonChild) []string {
	pID := htXrefGEDCOM("P", id)

	var historySource string = ""
	var historyNote string = ""
	var historyPrimary int

	if child != nil {
		historySource, historyPrimary = htSelectSourceFromText(child.History)
		historyNote = htSelectSourceNote(lang, historyPrimary)
	}

	return []string{"[" + pID + "]", name, "", "", "", "", "", "", historySource, historyNote, "", "", "", "", "", "", "", "", "", "", "", ""}
}

func htFillAddrKey(key string, place string, placeType string, date string, enclosed string, PC string) ([]string, string) {
	var ret []string = nil
	var retID string = ""
	if len(place) > 0 {
		key := AddrKey{Place: place, Type: placeType}
		if data, ok := addrMap[key]; !ok {
			id := uuid.New()
			strID := id.String()
			pID := htXrefGEDCOM("L", strID)

			ret = []string{"[" + pID + "]", place, place, placeType, "", PC, enclosed, date}
			retID = pID
			addrMap[key] = ret
			addrMapLang[key] = ret
			htFamiliesPlaceCSV = append(htFamiliesPlaceCSV, ret)
			htFamilyPlaceCSV = append(htFamilyPlaceCSV, ret)
		} else {
			if _, ok := addrMapLang[key]; !ok {
				addrMapLang[key] = data
				htFamilyPlaceCSV = append(htFamilyPlaceCSV, data)
			}
			oldID := data[0]
			retID = oldID[1 : len(oldID)-1]
			ret = data
		}
	}

	return ret, retID
}

func htFillAddrKeys(pe *FamilyPersonEvent, date string) []string {
	if pe == nil {
		return nil
	}

	var nextBoundary string = ""
	retC, retcID := htFillAddrKey(pe.CountryID, pe.Country, "Country", "", date, "")
	if retC != nil {
		if len(pe.CountryID) == 0 {
			pe.CountryID = retcID
			familyUpdated = true
		}
		nextBoundary = retC[0]
	}

	retS, retsID := htFillAddrKey(pe.StateID, pe.State, "State", nextBoundary, date, "")
	if retS != nil {
		if len(pe.StateID) == 0 {
			pe.StateID = retsID
			familyUpdated = true
		}
		nextBoundary = retS[0]
	}

	retCi, retCiID := htFillAddrKey(pe.CityID, pe.City, "City", nextBoundary, date, pe.PC)
	if retS != nil {
		if len(pe.CityID) == 0 {
			pe.CityID = retCiID
			familyUpdated = true
		}
	}

	if retCi != nil {
		return retCi
	} else if retS != nil {
		return retS
	}

	return retC
}

func htSetCSVPeople(person *FamilyPerson, lang string) []string {
	// When exporting to Gramps, ID and Place cannot be used together. To resolve this, we selected ID
	// as the unique identifier.
	var birthDate string = ""
	// var birthPlace string = ""
	var birthPlaceID string = ""
	var birthSource string = ""

	var baptismDate string = ""
	// var baptismPlace string = ""
	var baptismPlaceID string = ""
	var baptismSource string = ""

	var deathDate string = ""
	// var deathPlace string = ""
	var deathPlaceID string = ""
	var deathSource string = ""

	pID := htXrefGEDCOM("P", person.ID)
	historySource, historyPrimary := htSelectSourceFromText(person.History)
	// If we lack proper citations or direct evidence to verify a fact, we should classify it as a Reference
	// but only if there is reasonable confidence that the person actually existed.
	if person.IsReal {
		historyPrimary = 0
	}
	historyNote := htSelectSourceNote(lang, historyPrimary)
	if person.Birth != nil && len(person.Birth) > 0 {
		for i := 0; i < len(person.Birth); i++ {
			b := &person.Birth[i]

			if i == 0 {
				if b.Date != nil && len(b.Date) > 0 {
					birthDate = htDateToString(&b.Date[0])
					birthSource, _ = htSelectFirstSource(b.Sources)
				}
			}

			birthPlaceData := htFillAddrKeys(b, birthDate)
			if birthPlaceData != nil {
				// birthPlace = birthPlaceData[1]
				birthPlaceID = birthPlaceData[0]
			}
		}
	}

	if person.Baptism != nil && len(person.Baptism) > 0 {
		for i := 0; i < len(person.Baptism); i++ {
			b := &person.Baptism[i]

			if i == 0 {
				if b.Date != nil && len(b.Date) > 0 {
					baptismDate = htDateToString(&b.Date[0])
					baptismSource, _ = htSelectFirstSource(b.Sources)
				}
			}
			baptismPlaceData := htFillAddrKeys(b, baptismDate)
			if baptismPlaceData != nil {
				// baptismPlace = baptismPlaceData[1]
				baptismPlaceID = baptismPlaceData[0]
			}
		}
	}

	if person.Death != nil && len(person.Death) > 0 {
		for i := 0; i < len(person.Death); i++ {
			d := &person.Death[i]

			if i == 0 {
				if d.Date != nil && len(d.Date) > 0 {
					deathDate = htDateToString(&d.Date[0])
					deathSource, _ = htSelectFirstSource(d.Sources)
				}
			}
			deathPlaceData := htFillAddrKeys(d, deathDate)
			if deathPlaceData != nil {
				// deathPlace = deathPlaceData[1]
				deathPlaceID = deathPlaceData[0]
			}
		}
	}

	return []string{"[" + pID + "]", person.Name, person.Surname, "", "", "", "", person.Gender, historySource, historyNote, birthDate, "", birthPlaceID, birthSource, baptismDate, "", baptismPlaceID, baptismSource, deathDate, "", deathPlaceID, deathSource}
}

func htInitializeCSVMarriage() [][]string {
	return [][]string{{"", "", "", "", "", "", "", ""}, {"", "", "", "", "", "", "", ""}, {"marriage", " parent1", " parent2", " date", " place", " placeID", " source", " note"}}
}

func htSetCSVMarriage(id string, parent1 string, parent2 string, marr *FamilyPersonMarriage, lang string) []string {
	var marrDate string = ""

	if marr.DateTime.Date != nil && len(marr.DateTime.Date) > 0 {
		marrDate = htDateToString(&marr.DateTime.Date[0])
	}

	marrSource, marrType := htSelectSourceFromText(marr.History)
	marrNote := htSelectSourceNote(lang, marrType)

	pID1 := htXrefGEDCOM("P", parent1)
	pID2 := htXrefGEDCOM("P", parent2)
	return []string{"[" + id + "]", " [" + pID1 + "]", " [" + pID2 + "]", marrDate, "", "", marrSource, marrNote}
}

func htUpdateCSVMarriage(out []string, marr *FamilyPersonMarriage, lang string) {
	marrSource, marrType := htSelectSourceFromText(marr.History)
	marrNote := htSelectSourceNote(lang, marrType)

	out[6] = marrSource
	out[7] = marrNote
}

func htInitializeCSVFamily() [][]string {
	return [][]string{{"", "", "", "", ""}, {"", "", "", "", ""}, {"family", " child", " source", " note", " gender"}}
}

func htSetCSVFamily(data []string, child *FamilyPersonChild, lang string) []string {
	pID := htXrefGEDCOM("P", child.ID)
	historySource, historyType := htSelectSourceFromText(child.History)
	childNote := htSelectSourceNote(lang, historyType)

	// Gender is specified in Person
	return []string{data[0], " [" + pID + "]", historySource, childNote, ""}
}

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

func htParseFamilySetCSV(families *Family, fileName string, lang string) {
	if len(families.CSV) > 0 {
		return
	}

	families.CSV = fmt.Sprintf("csv/%s_%s.csv", fileName, lang)
	if verboseFlag {
		fmt.Println("Setting CSV file to: ", families.CSV)
	}
	familyUpdated = true
}

func htParseFamilySetLicenses(families *Family, lang string) {
	if len(families.License) == 2 {
		if families.License[0] == "SPDX-License-Identifier: GPL-3.0-or-later" && families.License[1] == "CC BY-NC 4.0 DEED" {
			return
		}
	}

	families.License[0] = "SPDX-License-Identifier: GPL-3.0-or-later"
	families.License = append(families.License, "CC BY-NC 4.0 DEED")

	familyUpdated = true
}

func htFamilyFillGEDCOM(person *FamilyPerson, fileName string, lang string) {
	var gedcomID string
	// To maintain consistency with GEDCOM files, we always list males first. However, this rule is not
	// mandatory in History Tracers files.
	var first string
	var second string

	for i := 0; i < len(person.Marriages); i++ {
		marr := &person.Marriages[i]

		if person.Sex == "masculine" || person.Sex == "masculino" {
			first = person.ID
			second = marr.ID
		} else {
			first = marr.ID
			second = person.ID
		}

		if len(marr.History) > 0 {
			for k := 0; k < len(marr.History); k++ {
				m := &marr.History[k]
				htUpdateSourcesData(m.Source)
			}
		}

		if len(marr.GEDCOMId) == 0 {
			id := uuid.New()
			strID := id.String()
			gedcomID = fmt.Sprintf("F%s", strID[0:18])

			marr.GEDCOMId = gedcomID
			familyUpdated = true
		}

		key := FamilyKey{firstPerson: first, secondPerson: second, file: fileName}
		if cmp, ok := marriagesMap[key]; !ok {
			localMarr := htSetCSVMarriage(marr.GEDCOMId, first, second, marr, lang)
			marriagesMap[key] = localMarr
			htFamilyMarriageCSV = append(htFamilyMarriageCSV, localMarr)
			htFamiliesMarriageCSV = append(htFamiliesMarriageCSV, localMarr)
		} else {
			htUpdateCSVMarriage(cmp, marr, lang)
			htFamilyMarriageCSV = append(htFamilyMarriageCSV, cmp)
			htFamiliesMarriageCSV = append(htFamiliesMarriageCSV, cmp)

			cmpID := cmp[0]
			partialCmpID := cmpID[1 : len(cmpID)-1]
			// Families with different IDs across languages must be corrected.
			if partialCmpID != marr.GEDCOMId {
				marr.GEDCOMId = partialCmpID
				familyUpdated = true
			}
			/* RELATIONSHIP BETWEEN BROTHERS CAN HAPPEN IN THE SAME FILE
			verr := fmt.Sprintf("The same couple %s and %s, appears more than once in %s", person.ID, marr.ID, fileName)
			panic(verr)
			*/
		}

		newPerson := htSetCSVBasicPerson(marr.Name, marr.ID, lang, nil)
		if oldPerson, ok := peopleMap[marr.ID]; !ok {
			peopleMap[marr.ID] = newPerson
			// TODO: NEXT TWO SHOULD BE REMOVED FROM HERE WHEN WE HAVE THE SAME PEOPLE IN DIFFERENT FILES
			htFamilyPeopleCSV = append(htFamilyPeopleCSV, newPerson)
			htFamiliesPeopleCSV = append(htFamiliesPeopleCSV, newPerson)
		} else {
			if oldPerson[1] == newPerson[1] {
				if verboseFlag {
					fmt.Fprintln(os.Stderr, "The person", marr.Name, "(", marr.ID, ")", "appears more than one time in", fileName)
				}
			}
		}

	}
}

func htParseFamilySetDefaultValues(families *Family, lang string, fileName string) {
	people := make(map[string]bool)
	var first string
	var second string

	for i := 0; i < len(families.Families); i++ {
		family := &families.Families[i]

		if len(family.History) > 0 {
			for j := 0; j < len(family.History); j++ {
				history := &family.History[j]

				if len(history.PostMention) == 0 {
					history.PostMention = "."
					familyUpdated = true
				}
				if len(history.Format) == 0 {
					if len(history.Source) == 0 {
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

			if len(person.History) > 0 {
				for k := 0; k < len(person.History); k++ {
					h := &person.History[k]
					htUpdateSourcesData(h.Source)
				}
			}

			newPerson := htSetCSVPeople(person, lang)
			if _, ok := peopleMap[person.ID]; !ok {
				peopleMap[person.ID] = newPerson
				htFamilyPeopleCSV = append(htFamilyPeopleCSV, newPerson)
				htFamiliesPeopleCSV = append(htFamiliesPeopleCSV, newPerson)
			} else {
				peopleMap[person.ID] = newPerson
			}

			htFamilyFillGEDCOM(person, fileName, lang)
		}
	}

	for i := 0; i < len(families.Families); i++ {
		family := &families.Families[i]

		if family.People == nil {
			continue
		}

		for j := 0; j < len(family.People); j++ {
			person := &family.People[j]
			if person.Children == nil {
				continue
			}

			for k := 0; k < len(person.Children); k++ {
				child := &person.Children[k]
				if val, ok := people[child.ID]; ok {
					child.AddLink = val
					familyUpdated = true
				}

				if len(child.History) > 0 {
					for k := 0; k < len(child.History); k++ {
						c := &child.History[k]
						htUpdateSourcesData(c.Source)
					}
				}

				newPerson := htSetCSVBasicPerson(child.Name, child.ID, lang, child)
				if _, ok := peopleMap[child.ID]; !ok {
					peopleMap[child.ID] = newPerson
					htFamilyPeopleCSV = append(htFamilyPeopleCSV, newPerson)
					htFamiliesPeopleCSV = append(htFamiliesPeopleCSV, newPerson)
				}

				if person.Sex == "masculine" || person.Sex == "masculino" {
					first = person.ID
					second = child.MarriageID
				} else {
					first = child.MarriageID
					second = person.ID
				}

				key := FamilyKey{firstPerson: first, secondPerson: second, file: fileName}
				if mm, ok := marriagesMap[key]; ok {
					childFam := htSetCSVFamily(mm, child, lang)
					htFamilyFamilyCSV = append(htFamilyFamilyCSV, childFam)
					htFamiliesFamilyCSV = append(htFamiliesFamilyCSV, childFam)
				}
			}
		}
	}
}

func htWriteCSVtoFile(fileName string, in [][]string) error {
	tmpFile := fmt.Sprintf("%s%s", CFG.SrcPath, fileName)

	if verboseFlag {
		fmt.Println("CREATING CSS FILE ", tmpFile)
	}

	fp, err := os.Create(tmpFile)
	if err != nil {
		return err
	}

	w := csv.NewWriter(fp)
	w.WriteAll(in)

	fp.Close()

	return nil
}

func htLoadSourceFromFile(family *Family) error {
	for _, ptr := range family.Sources {
		localPath := fmt.Sprintf("%slang/sources/%s.json", CFG.SrcPath, ptr)
		byteValue, err := htOpenFileReadClose(localPath)
		if err != nil {
			log.Fatalln(err)
		}

		var sources HTSourceFile
		err = json.Unmarshal(byteValue, &sources)
		if err != nil {
			htCommonJsonError(byteValue, err)
			return err
		}

		htUpdateSourceFile(&sources, localPath)

		htFillSourcesMap(&sources)
	}

	return nil
}

func htParseFamily(fileName string, lang string, rewrite bool) (error, string, string) {
	htFamilyPlaceCSV = htInitializeCSVPlace()
	htFamilyPeopleCSV = htInitializeCSVPeople()
	htFamilyMarriageCSV = htInitializeCSVMarriage()
	htFamilyFamilyCSV = htInitializeCSVFamily()

	familyUpdated = false
	localPath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, fileName)
	if verboseFlag {
		fmt.Println("Parsing Family File", localPath)
	}

	byteValue, err := htOpenFileReadClose(localPath)
	if err != nil {
		return err, "", ""
	}

	var family Family
	err = json.Unmarshal(byteValue, &family)
	if err != nil {
		htCommonJsonError(byteValue, err)
		return err, "", ""
	}

	err = htLoadSourceFromFile(&family)
	if err != nil {
		return err, "", ""
	}

	if rewrite == false {
		return nil, "", ""
	}

	htParseFamilySetGEDCOM(&family, fileName, lang)
	htParseFamilySetCSV(&family, fileName, lang)
	htParseFamilySetLicenses(&family, lang)
	if familyUpdated == true {
		family.LastUpdate[0] = htUpdateTimestamp()
	}
	htParseFamilySetDefaultValues(&family, lang, localPath)

	newFile, err := htWriteFamilyFile(lang, &family)

	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err, "", ""
	}

	htFamilyMarriageCSV = append(htFamilyMarriageCSV, htFamilyFamilyCSV...)
	htFamilyPeopleCSV = append(htFamilyPeopleCSV, htFamilyMarriageCSV...)
	htFamilyPlaceCSV = append(htFamilyPlaceCSV, htFamilyPeopleCSV...)

	err = htWriteCSVtoFile(family.CSV, htFamilyPlaceCSV)
	if err != nil {
		return err, "", ""
	}

	return nil, family.GEDCOM, family.CSV
}

// Index
func htParseIndexSetGEDCOM(families *IdxFamily, lang string) {
	families.GEDCOM = fmt.Sprintf("gedcom/families-%s.ged", lang)
	if verboseFlag {
		fmt.Println("Setting INDEX GEDCOM file to: ", families.GEDCOM)
	}
	indexUpdated = true
}

func htParseIndexSetCSV(families *IdxFamily, lang string) {
	families.CSV = fmt.Sprintf("csv/families-%s.csv", lang)
	if verboseFlag {
		fmt.Println("Setting INDEX CSV file to: ", families.CSV)
	}
	indexUpdated = true
}

func htParseIndexSetLicenses(families *IdxFamily, lang string) {
	if len(families.License) == 2 {
		if families.License[0] == "SPDX-License-Identifier: GPL-3.0-or-later" && families.License[1] == "CC BY-NC 4.0 DEED" {
			return
		}
	}

	families.License[0] = "SPDX-License-Identifier: GPL-3.0-or-later"
	families.License = append(families.License, "CC BY-NC 4.0 DEED")

	indexUpdated = true
}

func htParseFamilyIndex(fileName string, lang string, rewrite bool) error {
	if verboseFlag {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR Adjusting file", fileName)
		return err
	}

	var index IdxFamily
	err = json.Unmarshal(byteValue, &index)
	if err != nil {
		htCommonJsonError(byteValue, err)
		return err
	}

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

			err, gedcom, csv := htParseFamily(value[j].ID, lang, rewrite)
			if err != nil {
				return err
			}
			value[j].GEDCOM = gedcom
			value[j].CSV = csv
		}
	}

	if rewrite == false {
		return nil
	}

	htParseIndexSetGEDCOM(&index, lang)
	htParseIndexSetCSV(&index, lang)
	htParseIndexSetLicenses(&index, lang)
	if indexUpdated == true {
		index.LastUpdate[0] = htUpdateTimestamp()
	}

	newFile, err := htWriteFamilyIndexFile(lang, &index)
	if err != nil {
		return err
	}

	HTCopyFilesWithoutChanges(fileName, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	htFamiliesMarriageCSV = append(htFamiliesMarriageCSV, htFamiliesFamilyCSV...)
	htFamiliesPeopleCSV = append(htFamiliesPeopleCSV, htFamiliesMarriageCSV...)
	htFamiliesPlaceCSV = append(htFamiliesPlaceCSV, htFamiliesPeopleCSV...)

	err = htWriteCSVtoFile(index.CSV, htFamiliesPlaceCSV)
	if err != nil {
		return err
	}

	return nil
}

func htUpdateAllFamilies(rewrite bool) error {
	marriagesMap = make(map[FamilyKey][]string)
	addrMap = make(map[AddrKey][]string)
	for i := 0; i < len(htLangPaths); i++ {
		indexUpdated = false
		peopleMap = make(map[string][]string)
		addrMapLang = make(map[AddrKey][]string)
		htFamiliesPlaceCSV = htInitializeCSVPlace()
		htFamiliesPeopleCSV = htInitializeCSVPeople()
		htFamiliesMarriageCSV = htInitializeCSVMarriage()
		htFamiliesFamilyCSV = htInitializeCSVFamily()

		localPath := fmt.Sprintf("%slang/%s/families.json", CFG.SrcPath, htLangPaths[i])
		err := htParseFamilyIndex(localPath, htLangPaths[i], rewrite)
		if err != nil {
			return err
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
	if verboseFlag {
		fmt.Println("Creating GEDCOM directory", localPath)
	}
	htCreateDirectory(localPath)
}

func htCreateCSVDirectory() {
	localPath := fmt.Sprintf("%scsv/", CFG.SrcPath)
	htRemoveCurrentGEDCOMDirectory(localPath)

	if verboseFlag {
		fmt.Println("Creating csv directory", localPath)
	}
	htCreateDirectory(localPath)
}

// Entries
func htCreateGEDCOM() {
	htCreateGEDCOMDirectory()
	htCreateCSVDirectory()
	sourceMap = make(map[string]HTSourceElement)

	htUpdateAllFamilies(true)
}

// Validate
func htValidateGEDCOM() {
	sourceMap = make(map[string]HTSourceElement)

	htUpdateAllFamilies(false)
}
