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
	"os"

	"github.com/google/uuid"
	. "github.com/historytracers/common"
)

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

func htCSVSelectFirstSource(sources []HTSource) (string, int) {
	for _, src := range sources {
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

func htSelectCSVSource(sources []HTSource) (string, int) {
	var uuid string = ""
	var idx int = 0
	var i int = 0
	for _, src := range sources {
		if src.Type == 0 {
			idx = i
			uuid = src.UUID
			break
		} else if len(uuid) == 0 {
			idx = i
			uuid = src.UUID
		}
		i++
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
		ret, sourceType := htSelectCSVSource(text.Source)

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

func htFillAddrKey(extKey *string, place string, placeType string, date string, enclosed string, PC string) []string {
	var ret []string = nil
	if len(place) > 0 {
		key := AddrKey{Place: place, Type: placeType}
		if data, ok := addrMap[key]; !ok {
			if len(*extKey) == 0 {
				id := uuid.New()
				strID := id.String()
				pID := htXrefGEDCOM("L", strID)
				*extKey = string(pID)
				familyUpdated = true
			}

			ret = []string{"[" + *extKey + "]", place, place, placeType, "", PC, enclosed, date}
			addrMap[key] = ret
			addrMapLang[key] = ret
			htFamiliesPlaceCSV = append(htFamiliesPlaceCSV, ret)
			htFamilyPlaceCSV = append(htFamilyPlaceCSV, ret)
		} else {
			if _, ok := addrMapLang[key]; !ok {
				addrMapLang[key] = data
				htFamilyPlaceCSV = append(htFamilyPlaceCSV, data)
			}
			if len(*extKey) == 0 {
				val := data[0]
				copyID := val[1 : len(val)-1]
				*extKey = string(copyID)
			}
			ret = data
		}
	}

	return ret
}

func htFillAddrKeys(pe *FamilyPersonEvent, date string) []string {
	if pe == nil {
		return nil
	}

	var nextBoundary string = ""
	retC := htFillAddrKey(&pe.CountryID, pe.Country, "Country", "", date, "")
	if retC != nil {
		nextBoundary = retC[0]
	}

	retS := htFillAddrKey(&pe.StateID, pe.State, "State", nextBoundary, date, "")
	if retS != nil {
		nextBoundary = retS[0]
	}

	retCi := htFillAddrKey(&pe.CityID, pe.City, "City", nextBoundary, date, pe.PC)

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
					birthDate = htDateToString(&b.Date[0], lang, true)
					birthSource, _ = htCSVSelectFirstSource(b.Sources)
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
					baptismDate = htDateToString(&b.Date[0], lang, true)
					baptismSource, _ = htCSVSelectFirstSource(b.Sources)
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
					deathDate = htDateToString(&d.Date[0], lang, true)
					deathSource, _ = htCSVSelectFirstSource(d.Sources)
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
		marrDate = htDateToString(&marr.DateTime.Date[0], lang, true)
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

		if person.Sex == "masculine" || person.Sex == "masculino" || person.Sex == "male" {
			if person.Sex == "masculine" {
				person.Sex = "male"
			}

			if person.Gender == "masculine" {
				person.Gender = "male"
			}
			first = person.ID
			second = marr.ID
		} else {
			if person.Sex == "feminine" {
				person.Sex = "female"
			}

			if person.Gender == "feminine" {
				person.Gender = "female"
			}
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
		//if oldPerson, ok := peopleMap[marr.ID]; !ok {
		if _, ok := peopleMap[marr.ID]; !ok {
			peopleMap[marr.ID] = newPerson
			// TODO: NEXT TWO SHOULD BE REMOVED FROM HERE WHEN WE HAVE THE SAME PEOPLE IN DIFFERENT FILES
			htFamilyPeopleCSV = append(htFamilyPeopleCSV, newPerson)
			htFamiliesPeopleCSV = append(htFamiliesPeopleCSV, newPerson)
		} /* else { BROTHERS MARRIAGE
			if oldPerson[1] == newPerson[1] {
				if verboseFlag {
					fmt.Fprintln(os.Stderr, "The person", marr.Name, "(", marr.ID, ")", "appears more than one time in", fileName)
				}
			}
		}*/

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

				if person.Sex == "masculine" || person.Sex == "masculino" || person.Sex == "male" {
					if person.Sex == "masculine" {
						person.Sex = "male"
					}

					if person.Gender == "masculine" {
						person.Gender = "male"
					}
					first = person.ID
					second = child.MarriageID
				} else {
					if person.Sex == "feminine" {
						person.Sex = "female"
					}

					if person.Gender == "feminine" {
						person.Gender = "female"
					}
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
		fmt.Println("CREATING CSV FILE ", tmpFile)
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
		htCommonJSONError(byteValue, err)
		return err, "", ""
	}

	htLoadSourceFromFile(family.Sources)

	if rewrite == false {
		return nil, "", ""
	}

	htParseFamilySetGEDCOM(&family, fileName, lang)
	htParseFamilySetCSV(&family, fileName, lang)
	htParseFamilySetLicenses(&family, lang)
	_, fileWasModified := htGitModifiedMap[localPath]
	if familyUpdated == true || updateDateFlag == true || fileWasModified {
		family.LastUpdate[0] = HTUpdateTimestamp()
	}
	htParseFamilySetDefaultValues(&family, lang, localPath)

	newFile, err := htWriteTmpFile(lang, &family)

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

func htRewriteFamilyFileTemplate() Family {
	fileName := fmt.Sprintf("%ssrc/json/family_template.json", CFG.SrcPath)
	if verboseFlag {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR Adjusting file", fileName)
		panic(err)
	}

	var family Family
	err = json.Unmarshal(byteValue, &family)
	if err != nil {
		htCommonJSONError(byteValue, err)
		panic(err)
	}

	_, fileWasModified := htGitModifiedMap[fileName]
	if fileWasModified {
		family.LastUpdate[0] = HTUpdateTimestamp()
	}

	newFile, err := htWriteTmpFile(htLangPaths[0], &family)
	HTCopyFilesWithoutChanges(fileName, newFile)
	err = os.Remove(newFile)
	if err != nil {
		panic(err)
	}

	return family
}

// Index
func htParseIndexSetGEDCOM(families *IdxFamily, lang string) {
	families.GEDCOM = fmt.Sprintf("gedcom/families_%s.ged", lang)
	if verboseFlag {
		fmt.Println("Setting INDEX GEDCOM file to: ", families.GEDCOM)
	}
	indexUpdated = true
}

func htParseIndexSetCSV(families *IdxFamily, lang string) {
	families.CSV = fmt.Sprintf("csv/families_%s.csv", lang)
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
		htCommonJSONError(byteValue, err)
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

	newFile, err := htWriteFamilyIndexFile(lang, &index)
	if err != nil {
		return err
	}

	equal, err := HTAreFilesEqual(fileName, newFile)
	_, fileWasModified := htGitModifiedMap[fileName]
	if !equal && err == nil || updateDateFlag == true || fileWasModified {
		index.LastUpdate[0] = HTUpdateTimestamp()
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
func htCleanCSVGEDWorkDirectory(subdir string) {
	localPath := fmt.Sprintf("%s%s/", CFG.SrcPath, subdir)
	if !htDirectoryExists(localPath) {
		htCreateDirectory(localPath)
		if verboseFlag {
			fmt.Println("Creating directory", localPath)
		}
	} else {
		if subdir != "gedcom" {
			htRemoveFilesWithoutextension(localPath, ".md")
		}
	}
}

// Entries
func htCreateGEDCOM() {
	htRewriteFamilyFileTemplate()
	htRewriteSourceFileTemplate()

	htCleanCSVGEDWorkDirectory("csv")
	htCleanCSVGEDWorkDirectory("gedcom")

	htUpdateAllFamilies(true)
}

// Validate
func htValidateGEDCOM() {
	htUpdateAllFamilies(false)
}

// Create new family
func htNewFamilySetDefaultValues(family *Family, lang string, fileName string) {
	family.Title = ""
	family.Header = ""
	family.Sources[0] = fileName
	family.Scripts[0] = fileName
	family.LastUpdate[0] = HTUpdateTimestamp()
	family.GEDCOM = "gedcom/" + fileName + "_" + lang + ".ged"
	family.CSV = "csv/" + fileName + "_" + lang + ".csv"
}

func htCreateNewFamily(id string, family *Family) {
	htAddNewSourceToDirectory(id)
	htAddNewJSToDirectory(id)
	for _, dir := range htLangPaths {
		htNewFamilySetDefaultValues(family, dir, id)
		pathFile := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, dir, id)

		fp, err := os.Create(pathFile)
		if err != nil {
			panic(err)
		}

		e := json.NewEncoder(fp)
		e.SetEscapeHTML(false)
		e.SetIndent("", "   ")
		e.Encode(family)

		fp.Close()
	}
}

func htAddNewFamilyToIdx(index *IdxFamily, newFile string, lang string) {
	lastContent := len(index.Contents) - 1
	if lastContent < 0 {
		return
	}

	content := &index.Contents[lastContent]

	newValue := IdxFamilyValue{ID: newFile, GEDCOM: "gedcom/" + newFile + "_" + lang + ".ged", CSV: "csv/" + newFile + "_" + lang + ".csv"}

	content.Value = append(content.Value, newValue)

	index.LastUpdate[0] = HTUpdateTimestamp()
}

func htOpenFamilyIdx(fileName string, newFile string, lang string) error {
	localClassIDXUpdate = len(newFile) > 0
	if verboseFlag && localClassIDXUpdate {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
		return err
	}

	var index IdxFamily
	err = json.Unmarshal(byteValue, &index)
	if err != nil {
		htCommonJSONError(byteValue, err)
		return err
	}

	htAddNewFamilyToIdx(&index, newFile, lang)
	tmpName, err := htWriteFamilyIndexFile(lang, &index)
	if err != nil {
		return err
	}

	HTCopyFilesWithoutChanges(fileName, tmpName)
	err = os.Remove(tmpName)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	return nil
}

func htUpdateIndexes(newFile string) {
	for _, dir := range htLangPaths {
		idxPath := fmt.Sprintf("%slang/%s/families.json", CFG.SrcPath, dir)
		err := htOpenFamilyIdx(idxPath, newFile, dir)
		if err != nil {
			panic(err)
		}
	}
}

func htNewFamily() {
	id := uuid.New()
	strID := id.String()

	family := htRewriteFamilyFileTemplate()
	htRewriteSourceFileTemplate()

	htCreateNewFamily(strID, &family)
	htUpdateIndexes(strID)
	fmt.Printf("Family %s created\n", strID)
}
