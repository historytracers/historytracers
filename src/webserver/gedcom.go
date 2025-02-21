// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"

	"github.com/google/uuid"
)

// Adjust Family files
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
	Type            string   `json:"type"`
	ID              string   `json:"id"`
	Official        string   `json:"official"`
	FamilyID        string   `json:"family_id"`
	ExternalFile    bool     `json:"external_family_file"`
	Name            string   `json:"name"`
	History         []HTText `json:"history"`
	MarriageDate    []HTDate `json:"marriage_date"`
	MarriageAddress string   `json:"marriage_address"`
	MarriageCity    string   `json:"marriage_city"`
	MarriageState   string   `json:"marriage_state"`
	MarriagePC      string   `json:"marriage_pc"`
	MarriageCountry string   `json:"marriage_country"`
}

type FamilyPersonChild struct {
	Type         string   `json:"type"`
	ID           string   `json:"id"`
	MarriageID   string   `json:"marriage_id"`
	Name         string   `json:"name"`
	FamilyID     string   `json:"family_id"`
	ExternalFile bool     `json:"external_family_file"`
	History      []HTText `json:"history"`
	BirthDate    []HTDate `json:"birth_date"`
	BirthAddress string   `json:"birth_address"`
	BirthCity    string   `json:"birth_city"`
	BirthState   string   `json:"birth_state"`
	BirthPC      string   `json:"birth_pc"`
	BirthCountry string   `json:"birth_country"`
	AdoptedChild bool     `json:"adopted_child"`
}

type FamilyPersonHaplogroup struct {
	Type    string     `json:"type"`
	Sources []HTSource `json:"sources"`
}

type FamilyPerson struct {
	ID         string                   `json:"id"`
	Name       string                   `json:"name"`
	Sex        string                   `json:"sex"`
	Gender     string                   `json:"gender"`
	Haplogroup []FamilyPersonHaplogroup `json:"haplogroup"`
	History    []HTText                 `json:"history"`
	Parents    []FamilyPersonParents    `json:"parents"`
	Marriages  []FamilyPersonMarriage   `json:"marriages"`
	Children   []FamilyPersonChild      `json:"children"`
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

func htParseFamilySetGEDCOM(families *Family, fileName string, lang string) {
	if len(families.GEDCOM) > 0 {
		return
	}

	families.GEDCOM = fmt.Sprintf("gedcom/%s_%s.ged", fileName, lang)
	if verboseFlag {
		fmt.Println("Setting GEDCOM file to: ", families.GEDCOM)
	}
}

func htParseFamily(fileName string, lang string) error {
	localPath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, fileName)
	if verboseFlag {
		fmt.Println("Parsing Family File", localPath)
	}

	jsonFile, err := os.Open(localPath)
	if err != nil {
		return err
	}

	byteValue, err := io.ReadAll(jsonFile)
	if err != nil {
		return err
	}
	jsonFile.Close()

	var family Family
	err = json.Unmarshal(byteValue, &family)
	if err != nil {
		return err
	}

	htParseFamilySetGEDCOM(&family, fileName, lang)
	family.LastUpdate[0] = htUpdateTimestamp()

	newFile, err := htWriteFamilyFile(lang, &family)

	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Println("ERROR", err)
		return err
	}

	return nil
}

// Adjust Family Index Files before GEDCOM creation
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

func htParseIndexSetGEDCOM(families *IdxFamily, lang string) {
	if len(families.GEDCOM) > 0 {
		return
	}

	families.GEDCOM = fmt.Sprintf("gedcom/families-%s.ged", lang)
	if verboseFlag {
		fmt.Println("Setting GEDCOM file to: ", families.GEDCOM)
	}
}

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

func htParseFamilyIndex(fileName string, lang string) error {
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
		return err
	}

	htParseIndexSetGEDCOM(&index, lang)

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
			err := htParseFamily(value[j].ID, lang)
			if err != nil {
				return err
			}
		}
		// TODO: Remove break after padronize all families
		break
	}

	index.LastUpdate[0] = htUpdateTimestamp()

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

	return nil
}

func htUpdateAllFamilies() error {
	htLangPaths := [3]string{"en-US", "es-ES", "pt-BR"}
	for i := 0; i < len(htLangPaths); i++ {
		localPath := fmt.Sprintf("%slang/%s/families.json", CFG.SrcPath, htLangPaths[i])
		err := htParseFamilyIndex(localPath, htLangPaths[i])
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
func htCreateGEDCOM() int {
	htCreateGEDCOMDirectory()

	htUpdateAllFamilies()
	return 0
}
