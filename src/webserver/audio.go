// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"

	"jaytaylor.com/html2text"
)

var familyMarriagesMap map[string]string
var defaultFamilyTop string = ""

// COMMON
func htMarkdownToHTML(str string) string {
	extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
	p := parser.NewWithExtensions(extensions)
	md := []byte(str)
	doc := p.Parse(md)

	htmlFlags := html.CommonFlags | html.HrefTargetBlank
	opts := html.RendererOptions{Flags: htmlFlags}
	renderer := html.NewRenderer(opts)

	out := markdown.Render(doc, renderer)
	ret := string(out)
	return ret
}

// Families
func htTextFamilyIndex(idx *IdxFamilyContent, lang string) string {
	var finalText string = ""
	var htmlText string = ""
	var err error

	if len(idx.HTMLValue) > 0 {
		htmlText = idx.HTMLValue

		htmlText = htOverwriteDates(idx.HTMLValue, idx.FillDates, "", lang, false)
	} else if len(idx.Value) > 0 {
		for i := 0; i < len(idx.Value); i++ {
			fv := &idx.Value[i]

			work := fmt.Sprintf("%s : %s\n", fv.Name, fv.Desc)

			htmlText += htOverwriteDates(work, idx.FillDates, "", lang, false)
		}
		htmlText = htMarkdownToHTML(htmlText)
	} else {
		return finalText
	}

	finalText, err = html2text.FromString(htmlText, html2text.Options{PrettyTables: true, OmitLinks: true})
	if err != nil {
		panic(err)
	}

	return finalText + "\n"
}

// LOAD TREE AS DEFAULT VALUE
func htTextHTMLMarriageIntroduction(name string, marrType string) string {
	var idx int = 17
	if marrType != "theory" {
		idx = 18
	}
	return "<h4>" + commonKeywords[idx] + " " + name + ".</h4>"
}

func htTextChildIntroduction(lang string, parent1 string, parent2 string, child string, childType string) string {
	var ret string = "<p>"

	if lang == "pt-BR" {
		if childType == "hypothesis" {
			ret += "Hipoteticamente "
		}

		ret += parent1 + " e " + parent2 + " são os pais de " + child + " "
	} else if lang == "es-ES" {
		if childType == "hypothesis" {
			ret += "Hipotéticamente "
		}
		ret += parent1 + " y " + parent2 + " son los padres de " + child + " "
	} else {
		if childType == "hypothesis" {
			ret += "Hypothetically "
		}
		ret += parent1 + " are " + parent2 + " are the parents of " + child + " "
	}

	return ret
}

func htTextFamilyIntroduction(name string) string {
	return "\n" + commonKeywords[8] + ": " + name + ".\n\n"
}

func htTextPersonIntroduction(name string) string {
	return commonKeywords[9] + ": " + name + ".\n"
}

func htTextParentsIntroduction(lang string, sex string, parent1 string, parent2 string) string {
	var intro string = ""
	if lang == "pt-BR" {
		if sex == "masculine" || sex == "masculino" {
			intro = "Filho de "
		} else {
			intro = "Filha de "
		}
		return intro + parent1 + " e " + parent2 + ".\n"
	} else if lang == "es-ES" {
		if sex == "masculine" || sex == "masculino" {
			intro = "Hijo de "
		} else {
			intro = "Hija de "
		}
		return intro + parent1 + " y " + parent2 + ".\n"
	}

	if sex == "masculine" || sex == "masculino" {
		intro = "Son of "
	} else {
		intro = "Daughter of "
	}
	return intro + parent1 + " and " + parent2 + ".\n"
}

func htHTML2Text(htmlText string) string {
	var finalText string = ""
	if len(htmlText) > 0 {
		ret := strings.ReplaceAll(htmlText, "<div class=\"first_steps_reflection\" id=\"myFirstReflection\">", commonKeywords[55])

		partial, err := html2text.FromString(ret, html2text.Options{PrettyTables: true, OmitLinks: true})
		if err != nil {
			panic(err)
		}
		finalText += partial + ".\n\n"
	}
	return finalText
}

func htTextFamily(families *Family, lang string) string {
	var finalText string = families.Title + ".\n\n" + defaultFamilyTop
	var htmlText string = ""

	if families.Maps != nil {
		finalText += commonKeywords[79] + ".\n\n" + commonKeywords[80] + "\n"
		for i := 0; i < len(families.Maps); i++ {
			maps := &families.Maps[i]

			finalText += fmt.Sprintf("%s %d: ", commonKeywords[81], maps.Order)
			htmlText = htOverwriteDates(maps.Text, maps.DateTime, ".", lang, false)
			finalText += htHTML2Text(htmlText)
		}
	}

	if families.Common != nil {
		for i := 0; i < len(families.Common); i++ {
			comm := &families.Common[i]

			if comm.Format == "html" {
				htmlText += htOverwriteDates(comm.Text, comm.FillDates, "", lang, false)
			} else if comm.Format == "markdown" {
				tmp := htOverwriteDates(comm.Text, comm.FillDates, comm.PostMention, lang, false)
				htmlText += htMarkdownToHTML(tmp)
			} else {
				htFormatNotExpected(comm.Format)
			}
		}

		finalText += htHTML2Text(htmlText)
	}

	for i := 0; i < len(families.Families); i++ {
		family := &families.Families[i]
		finalText += htTextFamilyIntroduction(family.Name)

		if family.History != nil {
			htmlText = ""
			for j := 0; j < len(family.History); j++ {
				hist := &family.History[j]

				if hist.Format == "html" {
					htmlText += htOverwriteDates(hist.Text, hist.FillDates, "", lang, false)
				} else if hist.Format == "markdown" {
					tmp := htOverwriteDates(hist.Text, hist.FillDates, hist.PostMention, lang, false)
					htmlText += htMarkdownToHTML(tmp)
				} else {
					htFormatNotExpected(hist.Format)
				}

				if len(hist.ImgDesc) > 0 {
					htmlText += "<p>" + hist.ImgDesc + "</p>"
				}
			}

			finalText += htHTML2Text(htmlText)
		}

		if family.People == nil {
			continue
		}

		for j := 0; j < len(family.People); j++ {
			person := &family.People[j]
			finalText += "\n\n" + htTextPersonIntroduction(person.Name)

			if person.History != nil {
				htmlText = ""
				for k := 0; k < len(person.History); k++ {
					hist := &person.History[k]

					if hist.Format == "html" {
						htmlText += htOverwriteDates(hist.Text, hist.FillDates, "", lang, false)
					} else if hist.Format == "markdown" {
						tmp := htOverwriteDates(hist.Text, hist.FillDates, hist.PostMention, lang, false)
						htmlText += htMarkdownToHTML(tmp)
					} else {
						htFormatNotExpected(hist.Format)
					}

					if len(hist.ImgDesc) > 0 {
						htmlText += "<p>" + hist.ImgDesc + "</p>"
					}
				}

				finalText += htHTML2Text(htmlText)
			}

			if person.Parents != nil {
				for k := 0; k < len(person.Parents); k++ {
					parents := &person.Parents[k]
					finalText += htTextParentsIntroduction(lang, person.Sex, parents.FatherName, parents.MotherName)
				}
			}

			if person.Marriages != nil {
				for k := 0; k < len(person.Marriages); k++ {
					marr := &person.Marriages[k]
					if _, ok := familyMarriagesMap[marr.ID]; !ok {
						familyMarriagesMap[marr.ID] = marr.Name
					}

					htmlText = ""
					htmlText += htTextHTMLMarriageIntroduction(marr.Name, marr.Type)
					for m := 0; m < len(marr.History); m++ {
						hist := &marr.History[m]

						if hist.Format == "html" {
							htmlText += htOverwriteDates(hist.Text, hist.FillDates, "", lang, false)
						} else if hist.Format == "markdown" {
							tmp := htOverwriteDates(hist.Text, hist.FillDates, hist.PostMention, lang, false)
							htmlText += htMarkdownToHTML(tmp)
						} else {
							htFormatNotExpected(hist.Format)
						}

						if len(hist.ImgDesc) > 0 {
							htmlText += "<p>" + hist.ImgDesc + "</p>"
						}
					}

					finalText += htHTML2Text(htmlText)
				}
			}

			if person.Children != nil {
				for k := 0; k < len(person.Children); k++ {
					var parent2 string = ""
					child := &person.Children[k]
					if data, ok := familyMarriagesMap[child.MarriageID]; ok {
						parent2 = data
					}
					htmlText = ""
					htmlText += htTextChildIntroduction(lang, person.FullName, parent2, child.Name, child.Type)
					for m := 0; m < len(child.History); m++ {
						hist := &child.History[m]
						if hist.Format == "html" {
							htmlText += htOverwriteDates(hist.Text, hist.FillDates, "", lang, false)
						} else if hist.Format == "markdown" {
							tmp := htOverwriteDates(hist.Text, hist.FillDates, hist.PostMention, lang, false)
							htmlText += htMarkdownToHTML(tmp)
						} else {
							htFormatNotExpected(hist.Format)
						}

						if len(hist.ImgDesc) > 0 {
							htmlText += "<p>" + hist.ImgDesc + "</p>"
						}
					}

					finalText += htHTML2Text(htmlText)
				}
			}
		}
	}

	return finalText + "\n"
}
func htFamilyAudio(fileName string, lang string) error {
	familyMarriagesMap = make(map[string]string)
	localPath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, lang, fileName)
	if verboseFlag {
		fmt.Println("Parsing Family File", localPath)
	}

	byteValue, err := htOpenFileReadClose(localPath)
	if err != nil {
		return err
	}

	var family Family
	err = json.Unmarshal(byteValue, &family)
	if err != nil {
		htCommonJSONError(byteValue, err)
		return err
	}

	htLoadSourceFromFile(family.Sources)

	audioTxt := htTextFamily(&family, lang)
	audioTxt = htAdjustAudioStringBeforeWrite(audioTxt)
	err = htWriteAudioFile(fileName, lang, audioTxt)
	if err != nil {
		return err
	}

	newFile, err := htWriteTmpFile(lang, &family)
	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	return nil
}

func htLoadTreeData(lang string) {
	var ctf classTemplateFile
	localPath, err := htLoadClassFileFormat(&ctf, "tree", lang)
	if err != nil {
		panic(err)
	}

	defaultFamilyTop = htLoopThroughContentFiles(ctf.Title, ctf.Content)
	defaultFamilyTop = htAdjustAudioStringBeforeWrite(defaultFamilyTop)

	newFile, err := htWriteTmpFile(lang, &ctf)
	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		panic(err)
	}
}

func htLoadFamilyIndex(fileName string, lang string) error {
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

	var indexTxt string = ""
	for i := 0; i < len(index.Contents); i++ {
		content := &index.Contents[i]

		if verboseFlag {
			fmt.Println("Making audio for", content.ID)
		}
		indexTxt += htTextFamilyIndex(content, lang)

		value := content.Value
		for j := 0; j < len(value); j++ {
			err := htFamilyAudio(value[j].ID, lang)
			if err != nil {
				return err
			}
		}
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

	indexTxt = htAdjustAudioStringBeforeWrite(indexTxt)
	err = htWriteAudioFile("families", lang, indexTxt)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	return nil
}

func htFamiliesToAudio() {
	for i := 0; i < len(htLangPaths); i++ {
		htLoadTreeData(htLangPaths[i])
		htLoadKeywordFile("common_keywords", htLangPaths[i])

		localPath := fmt.Sprintf("%slang/%s/families.json", CFG.SrcPath, htLangPaths[i])
		err := htLoadFamilyIndex(localPath, htLangPaths[i])
		if err != nil {
			return
		}
	}
}

// Index Files
func htParseIndexText(index *classIdx) string {
	var ret string = index.Title + ".\n\n"
	for i := 0; i < len(index.Content); i++ {
		content := &index.Content[i]
		var htmlText = ""

		if len(content.HTMLValue) > 0 && len(content.Value) > 0 {
			panic("You cannot have both HTMLValue and Value filled.")
		}

		if len(content.HTMLValue) > 0 {
			htmlText = content.HTMLValue
		} else {
			if len(content.Value) > 0 {
				for j := 0; j < len(content.Value); j++ {
					value := &content.Value[j]
					htmlText += "<p>" + value.Name + ": " + value.Desc + "</p>"
				}
			}
		}

		finalText, err := html2text.FromString(htmlText, html2text.Options{PrettyTables: true, OmitLinks: true})
		if err != nil {
			panic(err)
		}

		ret += finalText + ".\n"
	}

	return ret
}

func htClassIdxAudio(localPath string, indexName string, lang string) error {
	byteValue, err := htOpenFileReadClose(localPath)
	if err != nil {
		return err
	}

	var index classIdx
	err = json.Unmarshal(byteValue, &index)
	if err != nil {
		htCommonJSONError(byteValue, err)
		return err
	}

	audioTxt := htParseIndexText(&index)
	audioTxt = htAdjustAudioStringBeforeWrite(audioTxt)
	err = htWriteAudioFile(indexName, lang, audioTxt)
	if err != nil {
		panic(err)
	}

	newFile, err := htWriteTmpFile(lang, &index)
	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		panic(err)
	}

	return nil
}

func htConvertIndexToAudio() {
	for i := 0; i < len(indexFiles); i++ {
		idxFile := indexFiles[i]
		for j := 0; j < len(htLangPaths); j++ {
			idxPath := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, htLangPaths[j], idxFile)
			if verboseFlag {
				fmt.Println("Creating audio file for ", idxPath)
			}
			err := htClassIdxAudio(idxPath, idxFile, htLangPaths[j])
			if err != nil {
				panic(err)
			}
		}
	}
}

// Overall Files
func htConvertClassesToAudio(pages []string) {
	for i := 0; i < len(htLangPaths); i++ {
		lang := htLangPaths[i]
		htLoadKeywordFile("common_keywords", lang)

		for _, page := range pages {
			var ctf classTemplateFile
			localPath, err := htLoadClassFileFormat(&ctf, page, lang)
			if err != nil {
				panic(err)
			}

			audioTxt := htLoopThroughContentFiles(ctf.Title, ctf.Content)
			audioTxt = htAdjustAudioStringBeforeWrite(audioTxt)
			err = htWriteAudioFile(page, lang, audioTxt)
			if err != nil {
				panic(err)
			}

			newFile, err := htWriteTmpFile(lang, &ctf)
			equal, err := HTAreFilesEqual(newFile, localPath)
			if !equal && err == nil || updateDateFlag == true {
				ctf.LastUpdate[0] = htUpdateTimestamp()
				err = os.Remove(newFile)
				if err != nil {
					panic(err)
				}
				newFile, err = htWriteTmpFile(lang, &ctf)
			}

			HTCopyFilesWithoutChanges(localPath, newFile)
			err = os.Remove(newFile)
			if err != nil {
				panic(err)
			}
		}
	}
}

func htConvertAtlasToAudio() {
	htValidateAtlasFormats()
	for i := 0; i < len(htLangPaths); i++ {
		lang := htLangPaths[i]
		fileName := fmt.Sprintf("%slang/%s/atlas.json", CFG.SrcPath, lang)

		byteValue, err := htOpenFileReadClose(fileName)
		if err != nil {
			panic(err)
		}

		var localTemplateFile atlasTemplateFile
		err = json.Unmarshal(byteValue, &localTemplateFile)
		if err != nil {
			htCommonJSONError(byteValue, err)
			panic(err)
		}

		contentTxt := htLoopThroughContentFiles("Atlas", localTemplateFile.Content)
		atlasTxt := htLoopThroughAtlasFiles(localTemplateFile.Atlas)
		audioTxt := contentTxt + "\n\n" + atlasTxt
		audioTxt = htAdjustAudioStringBeforeWrite(audioTxt)

		err = htWriteAudioFile("atlas", lang, audioTxt)
		if err != nil {
			panic(err)
		}
	}
}

func htConvertOverallTextToAudio() {
	pages := []string{"main", "contact", "acknowledgement", "release", "2a2cbd69-7f09-4a58-aff1-6fbff8c5bda5", "a86f373e-c908-4796-8a96-427ba5d4c889", "sources"}
	htConvertClassesToAudio(pages)
}

func htConvertFistStepTextToAudio() {
	var pages []string
	byteValue, err := htOpenFileReadClose("lang/en-US/first_steps.json")
	if err != nil {
		panic(err)
	}

	var index classIdx
	err = json.Unmarshal(byteValue, &index)
	if err != nil {
		htCommonJSONError(byteValue, err)
		panic(err)
	}

	for _, ptr := range index.Content {
		if ptr.Value == nil {
			continue
		}

		for _, values := range ptr.Value {
			pages = append(pages, values.ID)
		}
	}

	htConvertClassesToAudio(pages)
}

func htConvertHistoricalTextToAudio() {
	pages := []string{"ee28aa06-65bc-4f13-88dc-c6ad46f11adb"}
	htConvertClassesToAudio(pages)
}

func htConvertLiteratureTextToAudio() {
	pages := []string{"1009578c-3097-4183-9f10-c6dd0a833d5b", "004fb419-c3cc-41c2-8e28-d746e714191d", "052e06b9-f10c-4e76-896d-9f0e68f07506", "da242227-867d-47d4-8637-90000e2ed7b4", "2ecd8b93-e611-4977-aa7e-109bc27d4a51"}
	htConvertClassesToAudio(pages)
}

func htConvertTextsToAudio() {
	htConvertOverallTextToAudio()
	htFamiliesToAudio()
	htConvertIndexToAudio()
	htConvertAtlasToAudio()

	// TODO: When all texts were coverted, we must remove the static vectors and load the indexes
	htConvertFistStepTextToAudio()
	htConvertHistoricalTextToAudio()
	htConvertLiteratureTextToAudio()
}
