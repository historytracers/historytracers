// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
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
	SurName    string                   `json:"surname"`
	Patronymic string                   `json:"patronymic"`
	FullName   string                   `json:"fullname"`
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

var familyUpdated bool
var indexUpdated bool

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

func htParseFamilySetDefaultValues(families *Family) {
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

func htParseFamily(fileName string, lang string, rewrite bool) (error, string) {
	familyUpdated = false
	localPath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, fileName)
	if verboseFlag {
		fmt.Println("Parsing Family File", localPath)
	}

	byteValue, err := htOpenFileReadClose(localPath)
	if err != nil {
		return err, ""
	}

	var family Family
	err = json.Unmarshal(byteValue, &family)
	if err != nil {
		htCommonJsonError(byteValue, err)
		return err, ""
	}

	if rewrite == false {
		return nil, ""
	}

	htParseFamilySetGEDCOM(&family, fileName, lang)
	if familyUpdated == true {
		family.LastUpdate[0] = htUpdateTimestamp()
	}
	htParseFamilySetDefaultValues(&family)

	newFile, err := htWriteFamilyFile(lang, &family)

	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Println("ERROR", err)
		return err, ""
	}

	return nil, family.GEDCOM
}

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

func htParseFamilyIndex(fileName string, lang string, rewrite bool) error {
	if verboseFlag {
		fmt.Println("Adjusting file", fileName)
	}

	byteValue, err := htOpenFileReadClose(fileName)
	if err != nil {
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
			err, gedcom := htParseFamily(value[j].ID, lang, rewrite)
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

	htParseIndexSetGEDCOM(&index, lang)
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
	htCreateGEDCOMDirectory()

	htUpdateAllFamilies(true)
}

// Validate
func htValidateGEDCOM() {
	htUpdateAllFamilies(false)
}
