// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"strings"

	"github.com/historytracers/common"
)

type HTParagraph struct {
	SectionID string
	HTText    common.HTText
}

type HTContentDocument struct {
	Title      string
	Header     string
	Sources    []string
	Scripts    []string
	Audio      []common.HTAudio
	Index      []string
	License    []string
	LastUpdate []string
	Authors    []string
	Reviewers  []string
	Type       string
	Version    int
	Content    []HTParagraph
}

func htParseJSONContent(jsonContent string) (*HTContentDocument, error) {
	var doc HTContentDocument

	if err := json.Unmarshal([]byte(jsonContent), &doc); err != nil {
		return nil, err
	}

	return &doc, nil
}

func htIsProjectContentFile(jsonContent string) bool {
	var base struct {
		Type   string `json:"type"`
		Content json.RawMessage `json:"content"`
	}

	if err := json.Unmarshal([]byte(jsonContent), &base); err != nil {
		return false
	}

	if base.Type != "class" && base.Type != "family_tree" && base.Type != "atlas" && base.Type != "sources" {
		return false
	}

	return len(base.Content) > 0 && string(base.Content) != "null"
}

type LazyParsedDoc struct {
	Type    string
	Title   string
	Header  string
	Content []map[string]interface{}
}

func htParseJSONContentFast(jsonContent string) (*LazyParsedDoc, string) {
	var doc LazyParsedDoc

	decoder := json.NewDecoder(strings.NewReader(jsonContent))
	if err := decoder.Decode(&doc); err != nil {
		return nil, ""
	}

	return &doc, doc.Type
}

func htConvertContentToMarkdownFast(doc *LazyParsedDoc) string {
	if doc == nil || doc.Content == nil {
		return ""
	}

	var sb strings.Builder

	for i, section := range doc.Content {
		sectionID, hasID := section["id"].(string)
		if hasID && sectionID != "" {
			sb.WriteString("## ")
			sb.WriteString(sectionID)
			sb.WriteString("\n\n")
		}

		texts, _ := section["text"].([]interface{})
		if texts != nil {
			for _, t := range texts {
				textObj, ok := t.(map[string]interface{})
				if !ok {
					continue
				}

				textField, hasText := textObj["text"].(string)
				if hasText && textField != "" {
					sb.WriteString(htConvertHTMLToMarkdownFast(textField))
					sb.WriteString("\n\n")
				}

				sourceField, hasSource := textObj["source"].([]interface{})
				if hasSource && len(sourceField) > 0 {
					sb.WriteString("*Sources: ")
					for idx, src := range sourceField {
						srcMap, ok := src.(map[string]interface{})
						if !ok {
							continue
						}
						if idx > 0 {
							sb.WriteString(", ")
						}
						if srcText, ok := srcMap["text"].(string); ok {
							sb.WriteString(srcText)
						}
					}
					sb.WriteString("*\n\n")
				}
			}
		}

		if i < len(doc.Content)-1 {
			sb.WriteString("---\n\n")
		}
	}

	return sb.String()
}

func htConvertHTMLToMarkdownFast(html string) string {
	if html == "" {
		return ""
	}

	text := html

	replacements := []struct{ old, new string }{
		{"<p>", ""}, {"</p>", "\n"},
		{"<br>", "\n"}, {"<br/>", "\n"}, {"<br />", "\n"},
		{"<strong>", "**"}, {"</strong>", "**"},
		{"<em>", "*"}, {"</em>", "*"},
		{"<u>", "_"}, {"</u>", "_"},
		{"<h1>", "# "}, {"</h1>", "\n"},
		{"<h2>", "## "}, {"</h2>", "\n"},
		{"<h3>", "### "}, {"</h3>", "\n"},
		{"<code>", "`"}, {"</code>", "`"},
		{"<ul>", "\n"}, {"</ul>", ""},
		{"<li>", "- "}, {"</li>", "\n"},
		{"&nbsp;", " "}, {"&amp;", "&"}, {"&lt;", "<"}, {"&gt;", ">"},
		{"&quot;", `"`}, {"&#39;", "'"},
		{"<span id=\"ht", ""}, {"\"></span>", ""},
		{"<span", ""}, {"</span>", ""},
		{"<style", ""}, {"</style>", ""},
		{"<script", ""}, {"</script>", ""},
		{"<div", ""}, {"</div>", ""},
	}

	for _, r := range replacements {
		text = strings.ReplaceAll(text, r.old, r.new)
	}

	for strings.Contains(text, "  ") {
		text = strings.ReplaceAll(text, "  ", " ")
	}

	return strings.TrimSpace(text)
}

func htConvertContentToMarkdown(doc *HTContentDocument) string {
	var sb strings.Builder

	for i, section := range doc.Content {
		if section.SectionID != "" {
			sb.WriteString("## ")
			sb.WriteString(section.SectionID)
			sb.WriteString("\n\n")
		}

		for _, text := range extractTextsFromSection(section) {
			sb.WriteString(text)
			sb.WriteString("\n\n")
		}

		if i < len(doc.Content)-1 {
			sb.WriteString("---\n\n")
		}
	}

	return sb.String()
}

func extractTextsFromSection(section HTParagraph) []string {
	var texts []string

	if section.HTText.Text != "" {
		htmlText := section.HTText.Text
		markdownText := htConvertHTMLToMarkdown(htmlText)
		texts = append(texts, markdownText)
	}

	if section.HTText.Source != nil && len(section.HTText.Source) > 0 {
		var sourceStr strings.Builder
		sourceStr.WriteString("*Sources: ")
		for idx, source := range section.HTText.Source {
			if idx > 0 {
				sourceStr.WriteString(", ")
			}
			sourceStr.WriteString(source.Text)
		}
		sourceStr.WriteString("*")
		texts = append(texts, sourceStr.String())
	}

	return texts
}

func htConvertHTMLToMarkdown(html string) string {
	text := html

	text = strings.ReplaceAll(text, "<p>", "")
	text = strings.ReplaceAll(text, "</p>", "\n")

	text = strings.ReplaceAll(text, "<strong>", "**")
	text = strings.ReplaceAll(text, "</strong>", "**")

	text = strings.ReplaceAll(text, "<em>", "*")
	text = strings.ReplaceAll(text, "</em>", "*")

	text = strings.ReplaceAll(text, "<u>", "_")
	text = strings.ReplaceAll(text, "</u>", "_")

	text = strings.ReplaceAll(text, "<br>", "\n")
	text = strings.ReplaceAll(text, "<br/>", "\n")
	text = strings.ReplaceAll(text, "<br />", "\n")

	text = strings.ReplaceAll(text, "<ul>", "\n")
	text = strings.ReplaceAll(text, "</ul>", "")
	text = strings.ReplaceAll(text, "<li>", "- ")
	text = strings.ReplaceAll(text, "</li>", "\n")

	text = strings.ReplaceAll(text, "<ol>", "\n")
	text = strings.ReplaceAll(text, "</ol>", "")
	text = strings.ReplaceAll(text, "<h1>", "# ")
	text = strings.ReplaceAll(text, "</h1>", "\n")
	text = strings.ReplaceAll(text, "<h2>", "## ")
	text = strings.ReplaceAll(text, "</h2>", "\n")
	text = strings.ReplaceAll(text, "<h3>", "### ")
	text = strings.ReplaceAll(text, "</h3>", "\n")

	text = strings.ReplaceAll(text, "<code>", "`")
	text = strings.ReplaceAll(text, "</code>", "`")

	text = strings.ReplaceAll(text, "<pre>", "```\n")
	text = strings.ReplaceAll(text, "</pre>", "\n```\n")

	text = strings.ReplaceAll(text, "<a href=\"", "[")
	text = strings.ReplaceAll(text, "\">", "](")
	text = strings.ReplaceAll(text, "</a>", ")")

	text = strings.ReplaceAll(text, "<img src=\"", "![")
	text = strings.ReplaceAll(text, "\" alt=\"", "][")
	text = strings.ReplaceAll(text, "\"/>", ")")

	text = strings.ReplaceAll(text, "&nbsp;", " ")
	text = strings.ReplaceAll(text, "&amp;", "&")
	text = strings.ReplaceAll(text, "&lt;", "<")
	text = strings.ReplaceAll(text, "&gt;", ">")
	text = strings.ReplaceAll(text, "&quot;", "\"")
	text = strings.ReplaceAll(text, "&#39;", "'")

	text = strings.ReplaceAll(text, "<span id=\"ht", "")
	text = strings.ReplaceAll(text, "\"></span>", "")
	text = strings.ReplaceAll(text, "<span", "")
	text = strings.ReplaceAll(text, "</span>", "")

	text = strings.ReplaceAll(text, "<style", "")
	text = strings.ReplaceAll(text, "</style>", "")

	text = strings.ReplaceAll(text, "<script", "")
	text = strings.ReplaceAll(text, "</script>", "")

	text = strings.ReplaceAll(text, "<div", "")
	text = strings.ReplaceAll(text, "</div>", "")

	text = strings.ReplaceAll(text, "<table", "")
	text = strings.ReplaceAll(text, "</table>", "")
	text = strings.ReplaceAll(text, "<tr", "")
	text = strings.ReplaceAll(text, "</tr>", "")
	text = strings.ReplaceAll(text, "<td", "")
	text = strings.ReplaceAll(text, "</td>", "")
	text = strings.ReplaceAll(text, "<th", "")
	text = strings.ReplaceAll(text, "</th>", "")

	for strings.Contains(text, "  ") {
		text = strings.ReplaceAll(text, "  ", " ")
	}

	text = strings.TrimSpace(text)

	return text
}

func htConvertMarkdownToHTML(markdown string) string {
	text := markdown

	text = strings.ReplaceAll(text, "**", "<strong></strong>")
	text = strings.ReplaceAll(text, "*", "<em></em>")
	text = strings.ReplaceAll(text, "_", "<u></u>")

	lines := strings.Split(text, "\n")
	var result []string
	inList := false

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			if inList {
				result = append(result, "</ul>")
				inList = false
			}
			result = append(result, "<p></p>")
			continue
		}

		if strings.HasPrefix(line, "- ") || strings.HasPrefix(line, "* ") {
			if !inList {
				result = append(result, "<ul>")
				inList = true
			}
			result = append(result, "<li>"+strings.TrimPrefix(strings.TrimPrefix(line, "- "), "* ")+"</li>")
			continue
		}

		if inList {
			result = append(result, "</ul>")
			inList = false
		}

		if strings.HasPrefix(line, "# ") {
			result = append(result, "<h1>"+strings.TrimPrefix(line, "# ")+"</h1>")
		} else if strings.HasPrefix(line, "## ") {
			result = append(result, "<h2>"+strings.TrimPrefix(line, "## ")+"</h2>")
		} else if strings.HasPrefix(line, "### ") {
			result = append(result, "<h3>"+strings.TrimPrefix(line, "### ")+"</h3>")
		} else {
			result = append(result, "<p>"+line+"</p>")
		}
	}

	if inList {
		result = append(result, "</ul>")
	}

	return strings.Join(result, "\n")
}

func htExtractContentFromJSON(jsonStr string) string {
	contentIdx := strings.Index(jsonStr, `"content":`)
	if contentIdx == -1 {
		return "[]"
	}

	start := contentIdx + len(`"content":`)
	start = strings.TrimLeft(jsonStr[start:], " \t\n\r")

	if len(start) == 0 || (start[0] != '[' && start[0] != '{') {
		return "[]"
	}

	var end int
	depth := 0
	inString := false
	escaped := false

	for i := 0; i < len(start); i++ {
		if escaped {
			escaped = false
			continue
		}
		if start[i] == '\\' {
			escaped = true
			continue
		}
		if start[i] == '"' {
			inString = !inString
			continue
		}
		if inString {
			continue
		}

		if start[i] == '[' || start[i] == '{' {
			depth++
		} else if start[i] == ']' || start[i] == '}' {
			depth--
			if depth == 0 {
				end = i + 1
				break
			}
		}
	}

	if end == 0 {
		return "[]"
	}

	rawContent := start[:end]
	return htPrettyPrintRawJSON(rawContent)
}

func htPrettyPrintRawJSON(raw string) string {
	var buf strings.Builder
	decoder := json.NewDecoder(strings.NewReader(raw))
	decoder.UseNumber()

	var data interface{}
	if err := decoder.Decode(&data); err != nil {
		return raw
	}

	encoder := json.NewEncoder(&buf)
	encoder.SetEscapeHTML(false)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(data); err != nil {
		return raw
	}

	return strings.TrimSuffix(buf.String(), "\n")
}

func htMarshalContentField(content interface{}) string {
	if content == nil {
		return "[]"
	}

	var buf strings.Builder
	encoder := json.NewEncoder(&buf)
	encoder.SetEscapeHTML(false)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(content); err != nil {
		return "[]"
	}

	result := buf.String()
	return strings.TrimSuffix(result, "\n")
}