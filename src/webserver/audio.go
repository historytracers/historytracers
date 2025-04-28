// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"

	"jaytaylor.com/html2text"
)

var familyMarriagesMap map[string]string
var defaultFamilyTop string = ""

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

func htTextToHumanText(txt *HTText) string {
	var finalText string = ""
	var htmlText string
	var err error

	if txt.Format == "html" {
		htmlText = txt.Text

		htmlText = htOverwriteDates(htmlText, txt.FillDates, "")
	} else if txt.Format == "markdown" {
		work := txt.Text
		if len(txt.PostMention) > 0 {
			work += txt.PostMention
		}

		work = htOverwriteDates(work, txt.FillDates, txt.PostMention)
		htmlText = htMarkdownToHTML(work)
	} else {
		return finalText
	}

	finalText, err = html2text.FromString(htmlText, html2text.Options{PrettyTables: true})
	if err != nil {
		panic(err)
	}

	return finalText
}

func htTextFamilyIndex(idx *IdxFamilyContent) string {
	var finalText string = ""
	var htmlText string = ""
	var err error

	if len(idx.HTMLValue) > 0 {
		htmlText = idx.HTMLValue

		htmlText = htOverwriteDates(idx.HTMLValue, idx.FillDates, "")
	} else if len(idx.Value) > 0 {
		for i := 0; i < len(idx.Value); i++ {
			fv := &idx.Value[i]

			work := fmt.Sprintf("%s : %s\n", fv.Name, fv.Desc)

			htmlText += htOverwriteDates(work, idx.FillDates, "")
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

// LOAD TREE AS DEFAULT VALUE
func htTextGeneralMarriage(lang string) string {
	if lang == "pt-BR" {
		return "Teve \n"
	} else if lang == "es-ES" {
		return "Tuvo \n"
	}

	return "He had \n"
}

func htTextHTMLMarriageIntroduction(lang string, name string, marrType string) string {
	if lang == "pt-BR" {
		if marrType == "theory" {
			return "<h4>matrimônio com " + name + ".</h4>"
		} else {
			return "<h4>hipotético matrimônio com " + name + ".</h4>"
		}
	} else if lang == "es-ES" {
		if marrType == "theory" {
			return "<h4>casamiento con " + name + "</h4>"
		} else {
			return "<h4>hipotético casamiento con " + name + ".</h4>"
		}
	}

	if marrType == "theory" {
		return "<h4>marriage with " + name + ".</h4>"
	} else {
		return "<h4>hypothetical marriage with " + name + ".</h4>"
	}
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

func htTextFamilyIntroduction(lang string, name string) string {
	if lang == "pt-BR" {
		return "\nFamília: " + name + ".\n\n"
	} else if lang == "es-ES" {
		return "\nFamilia: " + name + ".\n\n"
	}
	return "\nFamily: " + name + ".\n\n"
}

func htTextPersonIntroduction(lang string, name string) string {
	if lang == "pt-BR" {
		return "\n\nPessoa: " + name + ".\n\n"
	} else if lang == "es-ES" {
		return "\n\nPersona: " + name + ".\n\n"
	}
	return "\n\nPerson: " + name + ".\n\n"
}

func htTextFamily(families *Family, lang string) string {
	var finalText string = defaultFamilyTop
	var htmlText string = ""

	if families.Common != nil {
		for i := 0; i < len(families.Common); i++ {
			comm := &families.Common[i]

			if comm.Format == "html" {
				htmlText += htOverwriteDates(comm.Text, comm.FillDates, "")
			} else {
				tmp := htOverwriteDates(comm.Text, comm.FillDates, comm.PostMention)
				htmlText += htMarkdownToHTML(tmp)
			}
		}

		if len(htmlText) > 0 {
			partial, err := html2text.FromString(htmlText, html2text.Options{PrettyTables: true})
			if err != nil {
				panic(err)
			}
			finalText += partial + "\n"
		}
	}

	for i := 0; i < len(families.Families); i++ {
		family := &families.Families[i]
		finalText += htTextFamilyIntroduction(lang, family.Name)

		if family.History != nil {
			htmlText = ""
			for j := 0; j < len(family.History); j++ {
				hist := &family.History[j]

				if hist.Format == "html" {
					htmlText += htOverwriteDates(hist.Text, hist.FillDates, "")
				} else {
					tmp := htOverwriteDates(hist.Text, hist.FillDates, hist.PostMention)
					htmlText += htMarkdownToHTML(tmp)
				}
			}

			if len(htmlText) > 0 {
				partial, err := html2text.FromString(htmlText, html2text.Options{PrettyTables: true})
				if err != nil {
					panic(err)
				}
				finalText += partial + "\n"
			}
		}

		if family.People == nil {
			continue
		}

		for j := 0; j < len(family.People); j++ {
			person := &family.People[j]
			finalText += htTextPersonIntroduction(lang, person.Name)

			if person.History != nil {
				htmlText = ""
				for k := 0; k < len(person.History); k++ {
					hist := &person.History[k]

					if hist.Format == "html" {
						htmlText += htOverwriteDates(hist.Text, hist.FillDates, "")
					} else {
						tmp := htOverwriteDates(hist.Text, hist.FillDates, hist.PostMention)
						htmlText += htMarkdownToHTML(tmp)
					}
				}

				if len(htmlText) > 0 {
					partial, err := html2text.FromString(htmlText, html2text.Options{PrettyTables: true})
					if err != nil {
						panic(err)
					}
					finalText += partial + "\n\n"
				}
			}

			if person.Marriages != nil {
				for k := 0; k < len(person.Marriages); k++ {
					marr := &person.Marriages[k]
					if _, ok := familyMarriagesMap[marr.ID]; !ok {
						familyMarriagesMap[marr.ID] = marr.Name
					}

					htmlText = ""
					htmlText += htTextHTMLMarriageIntroduction(lang, marr.Name, marr.Type)
					for m := 0; m < len(marr.History); m++ {
						hist := &marr.History[m]
						if m == 0 {
							finalText += htTextGeneralMarriage(lang)
						}

						if hist.Format == "html" {
							htmlText += htOverwriteDates(hist.Text, hist.FillDates, "")
						} else {
							tmp := htOverwriteDates(hist.Text, hist.FillDates, hist.PostMention)
							htmlText += htMarkdownToHTML(tmp)
						}
					}

					if len(htmlText) > 0 {
						partial, err := html2text.FromString(htmlText, html2text.Options{PrettyTables: true})
						if err != nil {
							panic(err)
						}
						finalText += partial + "\n\n"
					}
				}
			}

			if person.Children != nil {
				for k := 0; k < len(person.Children); k++ {
					var parent2 string = ""
					child := &person.Children[k]
					if data, ok := familyMarriagesMap[child.MarriageID]; ok {
						parent2 = data
					}
					htmlText = "<br /><br />"
					htmlText += htTextChildIntroduction(lang, person.FullName, parent2, child.Name, child.Type)
					for m := 0; m < len(child.History); m++ {
						hist := &child.History[m]
						if hist.Format == "html" {
							htmlText += htOverwriteDates(hist.Text, hist.FillDates, "")
						} else {
							tmp := htOverwriteDates(hist.Text, hist.FillDates, hist.PostMention)
							htmlText += htMarkdownToHTML(tmp)
						}
					}

					if len(htmlText) > 0 {
						partial, err := html2text.FromString(htmlText, html2text.Options{PrettyTables: true})
						if err != nil {
							panic(err)
						}
						finalText += partial + "\n"
					}
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
		htCommonJsonError(byteValue, err)
		return err
	}

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
	var cf HTCommonFile
	localPath, err := htLoadCommonFile(&cf, "tree", lang)
	if err != nil {
		panic(err)
	}

	defaultFamilyTop = ""
	for i := 0; i < len(cf.Contents); i++ {
		content := &cf.Contents[i]

		defaultFamilyTop += htTextCommonContent(content)
	}
	defaultFamilyTop = ".\n\n"

	newFile, err := htWriteTmpFile(lang, &cf)
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
		htCommonJsonError(byteValue, err)
		return err
	}

	var indexTxt string = ""
	for i := 0; i < len(index.Contents); i++ {
		content := &index.Contents[i]

		if verboseFlag {
			fmt.Println("Making audio for", content.ID)
		}
		indexTxt += htTextFamilyIndex(content)

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
		localPath := fmt.Sprintf("%slang/%s/families.json", CFG.SrcPath, htLangPaths[i])
		htLoadTreeData(htLangPaths[i])
		err := htLoadFamilyIndex(localPath, htLangPaths[i])
		if err != nil {
			return
		}
	}
}
