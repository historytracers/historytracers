// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"regexp"
	"strings"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	. "github.com/historytracers/common"
)

var familyMarriagesMap map[string]string
var linesMap map[string]int
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

	finalText, err = htHTML2Text(htmlText)
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
		ret += parent1 + " and " + parent2 + " are the parents of " + child + " "
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
	if sex != "male" && sex != "masculino" && sex != "feminino" && sex != "femenino" && sex != "female" {
		text := fmt.Sprintf("%s is an Invalid value: 'male', 'masculino', 'feminino' and 'female'.", sex)
		panic(text)
	}

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

func htLocalHTML2Text(htmlText string, lang string) string {
	var finalText string = ""
	if len(htmlText) > 0 {
		ret := strings.ReplaceAll(htmlText, "<div class=\"first_steps_reflection\" id=\"myFirstReflection\">", commonKeywords[55])

		partial, err := htHTML2Text(ret)
		if err != nil {
			panic(err)
		}
		finalText += partial + ".\n\n"
	}
	finalText = htReplaceAllExceptions(finalText, lang)
	return finalText
}

func htTextFamily(families *Family, lang string) string {
	var finalText string = families.Title + ".\n\n" + defaultFamilyTop
	var htmlText string = ""

	if families.Prerequisites != nil {
		for _, pre := range families.Prerequisites {
			finalText += htLocalHTML2Text(pre, lang)
		}
	}

	if families.Maps != nil {
		finalText += commonKeywords[79] + ".\n\n" + commonKeywords[80] + "\n"
		for _, maps := range families.Maps {
			finalText += fmt.Sprintf("%s %d: ", commonKeywords[81], maps.Order)
			htmlText = htOverwriteDates(maps.Text, maps.DateTime, ".", lang, false)
			finalText += htLocalHTML2Text(htmlText, lang)
		}
	}

	if families.Common != nil {
		for _, comm := range families.Common {
			if comm.Format == "html" {
				comm_text := htChangeTag2Keywords(comm.Text)
				htmlText += htOverwriteDates(comm_text, comm.FillDates, "", lang, false)
			} else if comm.Format == "markdown" {
				tmp := htOverwriteDates(comm.Text, comm.FillDates, comm.PostMention, lang, false)
				htmlText += htMarkdownToHTML(tmp)
			} else {
				htFormatNotExpected(comm.Format)
			}
		}

		finalText += htLocalHTML2Text(htmlText, lang)
	}

	for _, family := range families.Families {
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

			finalText += htLocalHTML2Text(htmlText, lang)
		}

		if family.People == nil {
			continue
		}

		for j := 0; j < len(family.People); j++ {
			person := &family.People[j]
			finalText += "\n\n" + htTextPersonIntroduction(person.Name)

			if person.Sex == "feminine" {
				person.Sex = "female"
			} else if person.Sex == "masculine" {
				person.Sex = "male"
			}

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

				finalText += htLocalHTML2Text(htmlText, lang)
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

					finalText += htLocalHTML2Text(htmlText, lang)
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

					finalText += htLocalHTML2Text(htmlText, lang)
				}
			}
		}
	}

	if families.Exercises != nil {
		finalText += htPrepareQuestions(families.Exercises)
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
	audioTxt = htAdjustAudioStringBeforeWrite(audioTxt, lang)
	audioTxt = htRemoveChineseCharacters(audioTxt)
	err = htWriteAudioFile(fileName, lang, audioTxt)
	if err != nil {
		return err
	}

	newFile, err := htWriteTmpFile(lang, &family)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}
	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	if verboseFlag {
		htReportErrLineCounter(localPath, fileName, lang)
	}

	return nil
}

func htLoadTreeData(lang string) {
	var ctf ClassTemplateFile
	localPath, err := htLoadClassFileFormat(&ctf, "tree", lang)
	if err != nil {
		panic(err)
	}

	defaultFamilyTop = htLoopThroughContentFiles(ctf.Title, ctf.Content, lang)
	defaultFamilyTop = htAdjustAudioStringBeforeWrite(defaultFamilyTop, lang)
	defaultFamilyTop = htRemoveChineseCharacters(defaultFamilyTop)

	newFile, err := htWriteTmpFile(lang, &ctf)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		panic(err)
	}
	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		panic(err)
	}

	if verboseFlag {
		htReportErrLineCounter(localPath, "tree", lang)
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
	for _, content := range index.Contents {
		if verboseFlag {
			fmt.Println("Making audio for", content.ID)
		}
		indexTxt += htTextFamilyIndex(&content, lang)

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

	indexTxt = htAdjustAudioStringBeforeWrite(indexTxt, lang)
	indexTxt = htRemoveChineseCharacters(indexTxt)
	err = htWriteAudioFile("families", lang, indexTxt)
	if err != nil {
		fmt.Fprintln(os.Stderr, "ERROR", err)
		return err
	}

	return nil
}

func htFamiliesToAudio() {
	for _, dir := range htLangPaths {
		htLoadKeywordFile("common_keywords", dir)
		htLoadKeywordFile("math_keywords", dir)
		htLoadTreeData(dir)

		localPath := fmt.Sprintf("%slang/%s/families.json", CFG.SrcPath, dir)
		err := htLoadFamilyIndex(localPath, dir)
		if err != nil {
			panic(err)
			return
		}
	}
}

// Index Files
func htParseIndexText(index *ClassIdx, lang string) string {
	var ret string = index.Title + ".\n\n"
	txt := HTText{Source: nil, IsTable: false, ImgDesc: "", PostMention: "", Format: "markdown"}
	for _, content := range index.Content {
		var htmlText = ""

		if len(content.HTMLValue) > 0 && len(content.Value) > 0 {
			panic("You cannot have both HTMLValue and Value filled.")
		}

		if len(content.HTMLValue) > 0 {
			htmlText = htChangeTag2Keywords(content.HTMLValue)
		} else {
			if len(content.Value) > 0 {
				for j := 0; j < len(content.Value); j++ {
					value := &content.Value[j]
					txt.Text = value.Desc
					txt.FillDates = content.DateTime
					htmlText += "<p>" + value.Name + ": " + htTextToHumanText(&txt, lang, false) + "</p>"
				}
			}
		}

		finalText, err := htHTML2Text(htmlText)
		if err != nil {
			panic(err)
		}

		ret += finalText + "\n"
	}

	return ret
}

func htClassIdxAudio(localPath string, indexName string, lang string) error {
	byteValue, err := htOpenFileReadClose(localPath)
	if err != nil {
		return err
	}

	var index ClassIdx
	err = json.Unmarshal(byteValue, &index)
	if err != nil {
		htCommonJSONError(byteValue, err)
		return err
	}

	newFile, err := htWriteTmpFile(lang, &index)
	if err != nil {
		panic(err)
	}
	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		panic(err)
	}

	if verboseFlag {
		htReportErrLineCounter(localPath, localPath, lang)
	}
	return nil
}

// Overall Files
func htConvertClassesToAudio(pages []string, lang string) {
	for _, page := range pages {
		var ctf ClassTemplateFile
		if len(page) == 0 {
			continue
		}

		localPath, err := htLoadClassFileFormat(&ctf, page, lang)
		if err != nil {
			panic(err)
		}

		audioTxt := htLoopThroughContentFiles(ctf.Title, ctf.Content, lang)
		if ctf.Exercises != nil {
			audioTxt += htPrepareQuestions(ctf.Exercises)
		}
		audioTxt = htAdjustAudioStringBeforeWrite(audioTxt, lang)
		audioTxt = htRemoveChineseCharacters(audioTxt)

		err = htWriteAudioFile(page, lang, audioTxt)
		if err != nil {
			panic(err)
		}

		newFile, err := htWriteTmpFile(lang, &ctf)
		if err != nil {
			panic(err)
		}
		equal, err := HTAreFilesEqual(newFile, localPath)
		if !equal && err == nil || updateDateFlag == true {
			ctf.LastUpdate[0] = HTUpdateTimestamp()
			err = os.Remove(newFile)
			if err != nil {
				panic(err)
			}
			newFile, err = htWriteTmpFile(lang, &ctf)
			if err != nil {
				panic(err)
			}
		}

		HTCopyFilesWithoutChanges(localPath, newFile)
		err = os.Remove(newFile)
		if err != nil {
			panic(err)
		}
		if verboseFlag {
			htReportErrLineCounter(localPath, page, lang)
		}
	}
}

func htConvertAtlasToAudio() {
	htValidateAtlasFormats()
	var atlasSources []string = []string{"atlas"}
	htLoadSourceFromFile(atlasSources)
	for _, dir := range htLangPaths {
		htLoadKeywordFile("common_keywords", dir)
		htLoadKeywordFile("math_keywords", dir)
		fileName := fmt.Sprintf("%slang/%s/atlas.json", CFG.SrcPath, dir)

		byteValue, err := htOpenFileReadClose(fileName)
		if err != nil {
			panic(err)
		}

		var localTemplateFile AtlasTemplateFile
		err = json.Unmarshal(byteValue, &localTemplateFile)
		if err != nil {
			htCommonJSONError(byteValue, err)
			panic(err)
		}

		contentTxt := htLoopThroughContentFiles("Atlas", localTemplateFile.Content, dir)
		atlasTxt := htLoopThroughAtlasFiles(localTemplateFile.Atlas, dir)
		audioTxt := contentTxt + "\n\n" + atlasTxt
		audioTxt = htAdjustAudioStringBeforeWrite(audioTxt, dir)
		audioTxt = htRemoveChineseCharacters(audioTxt)

		err = htWriteAudioFile("atlas", dir, audioTxt)
		if err != nil {
			panic(err)
		}

		for _, atlasContent := range localTemplateFile.Atlas {
			contentAudioTxt := ""
			for j := 0; j < len(atlasContent.Text); j++ {
				text := &atlasContent.Text[j]
				contentAudioTxt += htTextToHumanText(text, dir, false)
				if len(text.PostMention) > 0 {
					contentAudioTxt += text.PostMention
				}
				contentAudioTxt += ".\n\n"
			}
			contentAudioTxt = htAdjustAudioStringBeforeWrite(contentAudioTxt, dir)
			contentAudioTxt = htRemoveChineseCharacters(contentAudioTxt)
			err = htWriteAudioFile(atlasContent.ID, dir, contentAudioTxt)
			if err != nil {
				panic(err)
			}
		}

		if verboseFlag {
			htReportErrLineCounter(fileName, "atlas", dir)
		}

		_, fileWasModified := htGitModifiedMap[fileName]
		if fileWasModified {
			localTemplateFile.LastUpdate[0] = HTUpdateTimestamp()
		}

		newFile, err := htWriteTmpFile(dir, &localTemplateFile)
		if err != nil {
			panic(err)
		}
		HTCopyFilesWithoutChanges(fileName, newFile)
		err = os.Remove(newFile)
		if err != nil {
			panic(err)
		}
	}
}

func htConvertOverallTextToAudio() {
	pages := []string{"main", "contact", "acknowledgement", "release", "2a2cbd69-7f09-4a58-aff1-6fbff8c5bda5", "a86f373e-c908-4796-8a96-427ba5d4c889", "sources", "genealogical_first_steps", "genealogical_faq", "0ac0098b-cae0-4df2-a3aa-f0aaf2cde5e0", "partnership", "tree"}
	for _, dir := range htLangPaths {
		htLoadKeywordFile("common_keywords", dir)
		htLoadKeywordFile("math_keywords", dir)

		htConvertClassesToAudio(pages, dir)
	}
}

func htConvertIndexTextToAudio(idxName string, localPath string, lang string) {
	var pages []string
	byteValue, err := htOpenFileReadClose(localPath)
	if err != nil {
		panic(err)
	}

	var index ClassIdx
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

	htConvertClassesToAudio(pages, lang)

	audioTxt := htParseIndexText(&index, lang)
	audioTxt = htAdjustAudioStringBeforeWrite(audioTxt, lang)
	audioTxt = htRemoveChineseCharacters(audioTxt)
	err = htWriteAudioFile(idxName, lang, audioTxt)
	if err != nil {
		panic(err)
	}

	_, fileWasModified := htGitModifiedMap[localPath]
	if fileWasModified {
		index.LastUpdate[0] = HTUpdateTimestamp()
	}

	newFile, err := htWriteTmpFile(lang, &index)
	if err != nil {
		panic(err)
	}
	equal, err := HTAreFilesEqual(newFile, localPath)
	if !equal && err == nil || updateDateFlag == true {
		index.LastUpdate[0] = HTUpdateTimestamp()
		err = os.Remove(newFile)
		if err != nil {
			panic(err)
		}
		newFile, err = htWriteTmpFile(lang, &index)
		if err != nil {
			panic(err)
		}
	}

	HTCopyFilesWithoutChanges(localPath, newFile)
	err = os.Remove(newFile)
	if err != nil {
		panic(err)
	}

	if verboseFlag {
		htReportErrLineCounter(localPath, idxName, lang)
	}
}

func htIndexesToAudio() {
	for _, dir := range htLangPaths {
		htLoadKeywordFile("common_keywords", dir)
		htLoadKeywordFile("math_keywords", dir)

		for _, idx := range indexFiles {
			fileName := fmt.Sprintf("%slang/%s/%s.json", CFG.SrcPath, dir, idx)
			htConvertIndexTextToAudio(idx, fileName, dir)
		}
	}
}

func htConvertFunctionAbbreviation(text string, lang string) string {
	preposition := "de"
	if lang == "en-US" {
		preposition = "of"
	}

	funcMap := map[string]map[string]string{
		"cos":    {"en-US": "cosine", "es-ES": "coseno", "pt-BR": "cosseno"},
		"sin":    {"en-US": "sine", "es-ES": "seno", "pt-BR": "seno"},
		"tan":    {"en-US": "tangent", "es-ES": "tangente", "pt-BR": "tangente"},
		"sec":    {"en-US": "secant", "es-ES": "secante", "pt-BR": "secante"},
		"csc":    {"en-US": "cosecant", "es-ES": "cosecante", "pt-BR": "cossecante"},
		"cot":    {"en-US": "cotangent", "es-ES": "cotangente", "pt-BR": "cotangente"},
		"arccos": {"en-US": "arc cosine", "es-ES": "arcocoseno", "pt-BR": "arcocosseno"},
		"arcsin": {"en-US": "arc sine", "es-ES": "arcoseno", "pt-BR": "arcosseno"},
		"arctan": {"en-US": "arc tangent", "es-ES": "arcotangente", "pt-BR": "arcotangente"},
		"log":    {"en-US": "logarithm", "es-ES": "logaritmo", "pt-BR": "logaritmo"},
		"ln":     {"en-US": "natural logarithm", "es-ES": "logaritmo natural", "pt-BR": "logaritmo natural"},
		"exp":    {"en-US": "exponential", "es-ES": "exponencial", "pt-BR": "exponencial"},
		"sqrt":   {"en-US": "square root", "es-ES": "raíz cuadrada", "pt-BR": "raiz quadrada"},
		"abs":    {"en-US": "absolute value", "es-ES": "valor absoluto", "pt-BR": "valor absoluto"},
		"max":    {"en-US": "maximum", "es-ES": "máximo", "pt-BR": "máximo"},
		"min":    {"en-US": "minimum", "es-ES": "mínimo", "pt-BR": "mínimo"},
		"mod":    {"en-US": "modulo", "es-ES": "módulo", "pt-BR": "módulo"},
	}

	for abbr, langMap := range funcMap {
		if full, ok := langMap[lang]; ok {
			pattern := regexp.MustCompile(`\b` + abbr + `\s*\(\s*([^)]+)\s*\)`)
			text = pattern.ReplaceAllString(text, full+" "+preposition+" $1")
		}
	}

	return text
}

func htConvertGreekLetter(letter string, lang string) string {
	var greekLetterMap map[string]map[string]string

	greekLetterMap = map[string]map[string]string{
		"α": {"en-US": "alpha", "es-ES": "alfa", "pt-BR": "alfa"},
		"β": {"en-US": "beta", "es-ES": "beta", "pt-BR": "beta"},
		"γ": {"en-US": "gamma", "es-ES": "gama", "pt-BR": "gama"},
		"δ": {"en-US": "delta", "es-ES": "delta", "pt-BR": "delta"},
		"ε": {"en-US": "epsilon", "es-ES": "épsilon", "pt-BR": "epsilon"},
		"ζ": {"en-US": "zeta", "es-ES": "zeta", "pt-BR": "zeta"},
		"η": {"en-US": "eta", "es-ES": "eta", "pt-BR": "eta"},
		"θ": {"en-US": "theta", "es-ES": "theta", "pt-BR": "teta"},
		"ι": {"en-US": "iota", "es-ES": "iota", "pt-BR": "iota"},
		"κ": {"en-US": "kappa", "es-ES": "kappa", "pt-BR": "kappa"},
		"λ": {"en-US": "lambda", "es-ES": "lambda", "pt-BR": "lambda"},
		"μ": {"en-US": "mu", "es-ES": "mu", "pt-BR": "mi"},
		"ν": {"en-US": "nu", "es-ES": "nu", "pt-BR": "ni"},
		"ξ": {"en-US": "xi", "es-ES": "xi", "pt-BR": "xi"},
		"π": {"en-US": "pi", "es-ES": "pi", "pt-BR": "pi"},
		"ρ": {"en-US": "rho", "es-ES": "rho", "pt-BR": "ro"},
		"σ": {"en-US": "sigma", "es-ES": "sigma", "pt-BR": "sigma"},
		"τ": {"en-US": "tau", "es-ES": "tau", "pt-BR": "tau"},
		"υ": {"en-US": "upsilon", "es-ES": "ípsilon", "pt-BR": "ípsilon"},
		"φ": {"en-US": "phi", "es-ES": "fi", "pt-BR": "fi"},
		"ϕ": {"en-US": "phi", "es-ES": "fi", "pt-BR": "fi"},
		"χ": {"en-US": "chi", "es-ES": "ji", "pt-BR": "qui"},
		"ψ": {"en-US": "psi", "es-ES": "psi", "pt-BR": "psi"},
		"ω": {"en-US": "omega", "es-ES": "omega", "pt-BR": "omega"},
	}

	if langMap, ok := greekLetterMap[letter]; ok {
		if name, ok := langMap[lang]; ok {
			return name
		}
	}
	return letter
}

func htRemoveChineseCharacters(text string) string {
	chineseRegex := regexp.MustCompile(`[\p{Han}]+`)
	cleaned := chineseRegex.ReplaceAllString(text, "")

	emptyParenRegex := regexp.MustCompile(`\(\s*\)`)
	cleaned = emptyParenRegex.ReplaceAllString(cleaned, "")

	return cleaned
}

func htAdjustTrailingDots(text string) string {
	lines := strings.Split(text, "\n")
	var result []string
	var prevWasEmpty bool

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "." {
			continue
		}

		dotRegex := regexp.MustCompile(`\.{2,}$`)
		if dotRegex.MatchString(line) {
			line = dotRegex.ReplaceAllString(line, ".")
		}

		if trimmed == "" {
			if !prevWasEmpty {
				result = append(result, line)
			}
			prevWasEmpty = true
		} else {
			result = append(result, line)
			prevWasEmpty = false
		}
	}

	return strings.Join(result, "\n")
}

func htConvertTextsToAudio() {
	linesMap = make(map[string]int)
	htConvertOverallTextToAudio()
	htFamiliesToAudio()
	htConvertAtlasToAudio()
	htIndexesToAudio()
}
