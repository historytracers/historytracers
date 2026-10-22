// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	. "github.com/historytracers/common"
)

func TestHTReplaceMultiplication(t *testing.T) {
	cases := []struct {
		name string
		in   string
		want string
	}{
		{name: "portuguese word xadrez", in: "o xadrez e a matemática", want: "o xadrez e a matemática"},
		{name: "portuguese word aux", in: "L’Anse aux Meadows", want: "L’Anse aux Meadows"},
		{name: "axis label", in: "eixo x", want: "eixo x"},
		{name: "name with x", in: "Yax Pasaj Chan Yopaat", want: "Yax Pasaj Chan Yopaat"},
		{name: "letter list", in: "w, x, y, z", want: "w, x, y, z"},
		{name: "numbers", in: "25 x 25", want: "25 vezes 25"},
		{name: "variables", in: "a x N", want: "a vezes N"},
		{name: "fraction", in: "3×1/2", want: "3 vezes 1/2"},
		{name: "parentheses", in: "(a x b)", want: "(a vezes b)"},
		{name: "mixed operands", in: "2 x (3 + 4)", want: "2 vezes (3 + 4)"},
		{name: "function", in: "c × cos (θ)", want: "c vezes cos (θ)"},
		{name: "chained x", in: "2 x 3 x 4", want: "2 vezes 3 vezes 4"},
		{name: "chained sign", in: "2 × 3 × 4", want: "2 vezes 3 vezes 4"},
		{name: "word operands", in: "Total Fruits × Fingers", want: "Total Fruits vezes Fingers"},
		{name: "prose sign with comma", in: "o sinal de multiplicação ×, que lemos", want: "o sinal de multiplicação ×, que lemos"},
		{name: "heading sign", in: "Um novo sinal: × (vezes)", want: "Um novo sinal: × (vezes)"},
		{name: "word containing x before sign", in: "box x 3", want: "box x 3"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := htReplaceMultiplication(tc.in, " vezes "); got != tc.want {
				t.Errorf("htReplaceMultiplication(%q) = %q, want %q", tc.in, got, tc.want)
			}
		})
	}
}

func TestHTReplaceSubtraction(t *testing.T) {
	cases := []struct {
		name string
		lang string
		in   string
		want string
	}{
		{name: "ascii hyphen in equation", lang: "en-US", in: "9 - 1 = 8", want: "9 minus 1 = 8"},
		{name: "unicode minus in equation", lang: "en-US", in: "9 − 1 = 8", want: "9 minus 1 = 8"},
		{name: "unicode minus in prose expression", lang: "en-US", in: "the subtraction of 1000 − 175?", want: "the subtraction of 1000 minus 175?"},
		{name: "word operands in equation", lang: "en-US", in: "Protons in Tritium − Protons in Hydrogen = 1 − 1 = 0", want: "Protons in Tritium minus Protons in Hydrogen = 1 minus 1 = 0"},
		{name: "standalone equation before another equation line", lang: "en-US", in: "1000 - 175.\n\n900 + 100 - 175.", want: "1000 minus 175.\n\n900 + 100 minus 175."},
		{name: "hyphenated range", lang: "en-US", in: "581 - 618.", want: "581 - 618."},
		{name: "numeric range with words", lang: "en-US", in: "91 - 100 Metate simétrico.", want: "91 - 100 Metate simétrico."},
		{name: "minus sign in prose", lang: "en-US", in: "The minus sign (−) tells us the direction.", want: "The minus sign (−) tells us the direction."},
		{name: "button label", lang: "en-US", in: "Use plus and − to change the value.", want: "Use plus and − to change the value."},
		{name: "negative number", lang: "en-US", in: "-1 = -1", want: "-1 = -1"},
		{name: "portuguese", lang: "pt-BR", in: "9 - 1 = 8", want: "9 menos 1 = 8"},
		{name: "spanish", lang: "es-ES", in: "9 - 1 = 8", want: "9 menos 1 = 8"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := htReplaceSubtraction(tc.in, tc.lang); got != tc.want {
				t.Errorf("htReplaceSubtraction(%q, %q) = %q, want %q", tc.in, tc.lang, got, tc.want)
			}
		})
	}
}

func TestHTReplaceMathSubtraction(t *testing.T) {
	useRepoSource(t)

	cases := []struct {
		lang string
		in   string
		want string
	}{
		{lang: "en-US", in: "9 - 1 = 8", want: "9 minus 1 equals 8"},
		{lang: "es-ES", in: "9 - 1 = 8", want: "9 menos 1 igual 8"},
		{lang: "pt-BR", in: "9 - 1 = 8", want: "9 menos 1 igual 8"},
		{lang: "en-US", in: "581 - 618.", want: "581 - 618."},
	}

	for _, tc := range cases {
		t.Run(tc.lang+"/"+tc.in, func(t *testing.T) {
			if got := htReplaceMath(tc.in, tc.lang); got != tc.want {
				t.Errorf("htReplaceMath(%q, %q) = %q, want %q", tc.in, tc.lang, got, tc.want)
			}
		})
	}
}

func TestHTReplaceMathUsesLocalizedKeywords(t *testing.T) {
	useRepoSource(t)

	cases := []struct {
		lang string
		in   string
		want string
	}{
		{lang: "en-US", in: "2 x 3 + 1 = 7", want: "2 times 3 plus 1 equals 7"},
		{lang: "es-ES", in: "2 x 3 + 1 = 7", want: "2 veces 3 más 1 igual 7"},
		{lang: "pt-BR", in: "2 x 3 + 1 = 7", want: "2 vezes 3 mais 1 igual 7"},
		{lang: "en-US", in: "20 ÷ 4 = 5", want: "20 divided by 4 equals 5"},
		{lang: "es-ES", in: "20 ÷ 4 = 5", want: "20 dividido por 4 igual 5"},
		{lang: "pt-BR", in: "20 ÷ 4 = 5", want: "20 dividido por 4 igual 5"},
		{lang: "pt-BR", in: "Sun Tzu, o xadrez e a matemática", want: "Sun Tzu, o xadrez e a matemática"},
	}

	for _, tc := range cases {
		t.Run(tc.lang+"/"+tc.in, func(t *testing.T) {
			if got := htReplaceMath(tc.in, tc.lang); got != tc.want {
				t.Errorf("htReplaceMath(%q, %q) = %q, want %q", tc.in, tc.lang, got, tc.want)
			}
		})
	}
}

func TestHTReplaceMathFallsBackToEnglish(t *testing.T) {
	useTempSource(t)

	got := htReplaceMath("2 x 3 + 1 = 7", "en-US")
	want := "2 times 3 plus 1 equals 7"
	if got != want {
		t.Errorf("htReplaceMath fallback = %q, want %q", got, want)
	}

	got = htReplaceMath("20 ÷ 4 = 5", "en-US")
	want = "20 divided by 4 equals 5"
	if got != want {
		t.Errorf("htReplaceMath division fallback = %q, want %q", got, want)
	}
}

func TestHTAdjustAudioStringBeforeWriteDivision(t *testing.T) {
	useRepoSource(t)

	cases := []struct {
		lang string
		in   string
		want string
	}{
		{lang: "en-US", in: "20 ÷ 4 = 5", want: "20 divided by 4 equals 5."},
		{lang: "es-ES", in: "20 ÷ 4 = 5", want: "20 dividido por 4 igual 5."},
		{lang: "pt-BR", in: "20 ÷ 4 = 5", want: "20 dividido por 4 igual 5."},
	}

	for _, tc := range cases {
		t.Run(tc.lang, func(t *testing.T) {
			got := strings.TrimSpace(htAdjustAudioStringBeforeWrite(tc.in, tc.lang))
			if got != tc.want {
				t.Errorf("htAdjustAudioStringBeforeWrite(%q, %q) = %q, want %q", tc.in, tc.lang, got, tc.want)
			}
		})
	}
}

func TestHTAudioTextConvertsDivisionSymbol(t *testing.T) {
	useRepoSource(t)

	cases := []struct {
		name   string
		lang   string
		format string
		in     string
		want   string
	}{
		{name: "markdown/en-US", lang: "en-US", format: "markdown", in: "20 ÷ 4 = 5", want: "20 divided by 4 equals 5."},
		{name: "markdown/es-ES", lang: "es-ES", format: "markdown", in: "20 ÷ 4 = 5", want: "20 dividido por 4 igual 5."},
		{name: "markdown/pt-BR", lang: "pt-BR", format: "markdown", in: "20 ÷ 4 = 5", want: "20 dividido por 4 igual 5."},
		{name: "mathml/en-US", lang: "en-US", format: "html", in: "<math><mn>20</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>5</mn></math>", want: "20 divided by 4 equals 5."},
		{name: "mathml/es-ES", lang: "es-ES", format: "html", in: "<math><mn>20</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>5</mn></math>", want: "20 dividido por 4 igual 5."},
		{name: "mathml/pt-BR", lang: "pt-BR", format: "html", in: "<math><mn>20</mn><mo>÷</mo><mn>4</mn><mo>=</mo><mn>5</mn></math>", want: "20 dividido por 4 igual 5."},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			txt := HTText{Text: tc.in, Format: tc.format}
			audioText := htTextToHumanText(&txt, tc.lang, false)
			audioText = htAdjustAudioStringBeforeWrite(audioText, tc.lang)
			if got := strings.TrimSpace(audioText); got != tc.want {
				t.Errorf("audio text for %q in %q = %q, want %q", tc.in, tc.lang, got, tc.want)
			}
		})
	}
}

func TestHTAdjustAudioStringBeforeWrite(t *testing.T) {
	useRepoSource(t)

	got := htAdjustAudioStringBeforeWrite("O xadrez e 2 x 3", "pt-BR")
	if strings.Contains(got, "times adrez") || strings.Contains(got, "vezes adrez") {
		t.Errorf("word was corrupted: %q", got)
	}
	if !strings.Contains(got, "O xadrez e 2 vezes 3.") {
		t.Errorf("unexpected audio text: %q", got)
	}
}

func TestHTMarkdownToHTML(t *testing.T) {
	got := htMarkdownToHTML("# Title\n\nSome **bold** text.")
	if !strings.Contains(got, "<h1") || !strings.Contains(got, "Title") {
		t.Errorf("heading not rendered: %q", got)
	}
	if !strings.Contains(got, "<strong>bold</strong>") {
		t.Errorf("bold text not rendered: %q", got)
	}
}

func TestHTRemoveAsiaticCharacters(t *testing.T) {
	cases := []struct {
		name string
		in   string
		want string
	}{
		{name: "russian schyoty", in: "Schyoty (счёты)", want: "Schyoty"},
		{name: "russian matryoshka", in: "a (матрёшка) b", want: "a  b"},
		{name: "chinese", in: "China 中國 today", want: "China  today"},
		{name: "emoji", in: "hello 😀", want: "hello "},
		{name: "empty parentheses", in: "a ( ) b", want: "a  b"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := htRemoveAsiaticCharacters(tc.in); got != tc.want {
				t.Errorf("htRemoveAsiaticCharacters(%q) = %q, want %q", tc.in, got, tc.want)
			}
		})
	}
}

func TestHTRemoveHTMLTags(t *testing.T) {
	cases := []struct {
		name string
		in   string
		want string
	}{
		{name: "tags", in: "<p>Hello <b>world</b></p>", want: "Hello world"},
		{name: "comparison symbols", in: "0 < 1 and 2 > 1", want: "0 < 1 and 2 > 1"},
		{name: "svg", in: "a<svg><text>x</text></svg>b", want: "ab"},
		{name: "style", in: "a<style>.x{color:red}</style>b", want: "ab"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := htRemoveHTMLTags(tc.in); got != tc.want {
				t.Errorf("htRemoveHTMLTags(%q) = %q, want %q", tc.in, got, tc.want)
			}
		})
	}
}

func TestHTRemoveSVGAndStyleBlocks(t *testing.T) {
	if got := htRemoveSVGBlocks("a<svg><text>x</text></svg>b"); got != "ab" {
		t.Errorf("htRemoveSVGBlocks = %q, want %q", got, "ab")
	}
	if got := htRemoveStyleBlocks("a<style>.x{}</style>b"); got != "ab" {
		t.Errorf("htRemoveStyleBlocks = %q, want %q", got, "ab")
	}
}

func TestHTAdjustTrailingDots(t *testing.T) {
	in := "Hello..\n.\n\n\nWorld...\n"
	want := "Hello.\n\nWorld.\n"
	if got := htAdjustTrailingDots(in); got != want {
		t.Errorf("htAdjustTrailingDots(%q) = %q, want %q", in, got, want)
	}
}

func TestHTGetLastChar(t *testing.T) {
	cases := []struct {
		in   string
		want rune
		ok   bool
	}{
		{in: "", want: 0, ok: false},
		{in: "   ", want: 0, ok: false},
		{in: "abc.", want: '.', ok: true},
		{in: "abc? ", want: '?', ok: true},
		{in: "ação", want: 'o', ok: true},
	}
	for _, tc := range cases {
		got, ok := htGetLastChar(tc.in)
		if got != tc.want || ok != tc.ok {
			t.Errorf("htGetLastChar(%q) = (%q, %v), want (%q, %v)", tc.in, got, ok, tc.want, tc.ok)
		}
	}
}

func TestHTRomanToInt(t *testing.T) {
	cases := map[string]int{
		"I": 1, "IV": 4, "IX": 9, "XL": 40, "XC": 90,
		"CD": 400, "CM": 900, "MCMXCIV": 1994,
	}
	for roman, want := range cases {
		if got := htRomanToInt(roman); got != want {
			t.Errorf("htRomanToInt(%q) = %d, want %d", roman, got, want)
		}
	}
}

func TestHTReplaceRoman(t *testing.T) {
	got := htReplaceRoman("(Part IV) and (Parte IX)")
	want := "(Part 4) and (Parte 9)"
	if got != want {
		t.Errorf("htReplaceRoman = %q, want %q", got, want)
	}
}

func TestHTConvertFunctionAbbreviation(t *testing.T) {
	cases := []struct {
		lang string
		in   string
		want string
	}{
		{lang: "en-US", in: "cos(x)", want: "cosine of x"},
		{lang: "es-ES", in: "tan(x)", want: "tangente de x"},
		{lang: "pt-BR", in: "sen(x)", want: "seno de x"},
		{lang: "en-US", in: "sqrt(16)", want: "square root of 16"},
		{lang: "pt-BR", in: "x ao quadrado (y)", want: "x ao quadrado de y"},
	}
	for _, tc := range cases {
		if got := htConvertFunctionAbbreviation(tc.in, tc.lang); got != tc.want {
			t.Errorf("htConvertFunctionAbbreviation(%q, %q) = %q, want %q", tc.in, tc.lang, got, tc.want)
		}
	}
}

func TestHTConvertSuperscript(t *testing.T) {
	cases := []struct {
		lang string
		in   string
		want string
	}{
		{lang: "en-US", in: "x²", want: "x squared"},
		{lang: "pt-BR", in: "x³", want: "x ao cubo"},
		{lang: "es-ES", in: "x⁴", want: "x a la cuarta potencia"},
		{lang: "en-US", in: "a&sup2;", want: "a squared"},
	}
	for _, tc := range cases {
		if got := htConvertSuperscript(tc.in, tc.lang); got != tc.want {
			t.Errorf("htConvertSuperscript(%q, %q) = %q, want %q", tc.in, tc.lang, got, tc.want)
		}
	}
}

func TestHTConvertGreekLetter(t *testing.T) {
	if got := htConvertGreekLetter("α", "en-US"); got != "alpha" {
		t.Errorf("alpha en = %q", got)
	}
	if got := htConvertGreekLetter("α", "pt-BR"); got != "alfa" {
		t.Errorf("alpha pt = %q", got)
	}
	if got := htConvertGreekLetter("θ", "pt-BR"); got != "teta" {
		t.Errorf("theta pt = %q", got)
	}
	if got := htConvertGreekLetter("Z", "en-US"); got != "Z" {
		t.Errorf("unknown letter = %q", got)
	}
}

func TestHTConvertTemperatures(t *testing.T) {
	en := htConvertTemperatures("25 C (77 F)", "en-US")
	for _, part := range []string{"25 degrees celsius", "77 degrees fahrenheit", "which correspond to"} {
		if !strings.Contains(en, part) {
			t.Errorf("en temperature %q missing %q", en, part)
		}
	}

	pt := htConvertTemperatures("-5 C (23 F)", "pt-BR")
	for _, part := range []string{"5 graus celsius", "negativos", "que correspondem a", "23 graus fahrenheit"} {
		if !strings.Contains(pt, part) {
			t.Errorf("pt temperature %q missing %q", pt, part)
		}
	}
}

func TestHTSuperscriptToWord(t *testing.T) {
	cases := []struct {
		exp  string
		lang string
		want string
	}{
		{exp: "2", lang: "en-US", want: " squared"},
		{exp: "3", lang: "pt-BR", want: " ao cubo"},
		{exp: "4", lang: "es-ES", want: " a la cuarta potencia"},
		{exp: "12", lang: "en-US", want: " to the 12 power"},
	}
	for _, tc := range cases {
		if got := htSuperscriptToWord(tc.exp, tc.lang); got != tc.want {
			t.Errorf("htSuperscriptToWord(%q, %q) = %q, want %q", tc.exp, tc.lang, got, tc.want)
		}
	}
}

func TestHTRemoveDuplicateParentheses(t *testing.T) {
	cases := map[string]string{
		"x (x)":           "x",
		"x ( x )":         "x",
		"x (y)":           "x (y)",
		"a (a) and b (b)": "a and b",
	}
	for in, want := range cases {
		if got := htRemoveDuplicateParentheses(in); got != want {
			t.Errorf("htRemoveDuplicateParentheses(%q) = %q, want %q", in, got, want)
		}
	}
}

func TestHTReplaceAllExceptions(t *testing.T) {
	got := htReplaceAllExceptions("(#) α ℕ x (x)", "en-US")
	for _, unwanted := range []string{"(#)", "ℕ", "(x)"} {
		if strings.Contains(got, unwanted) {
			t.Errorf("htReplaceAllExceptions output %q still contains %q", got, unwanted)
		}
	}
	if !strings.Contains(got, "alpha") {
		t.Errorf("htReplaceAllExceptions output %q missing alpha", got)
	}
}

func TestHTTextIntroductions(t *testing.T) {
	if got := htTextHTMLMarriageIntroduction("Ana", "theory"); !strings.Contains(got, "Ana") {
		t.Errorf("marriage theory intro = %q", got)
	}
	if got := htTextHTMLMarriageIntroduction("Ana", "official"); !strings.Contains(got, "Ana") {
		t.Errorf("marriage official intro = %q", got)
	}
	if got := htTextFamilyIntroduction("Family"); !strings.Contains(got, "Family") {
		t.Errorf("family intro = %q", got)
	}
	if got := htTextPersonIntroduction("Person"); !strings.Contains(got, "Person") {
		t.Errorf("person intro = %q", got)
	}
}

func TestHTTextChildIntroduction(t *testing.T) {
	cases := []struct {
		lang, childType, parent1, parent2, child, want string
	}{
		{"en-US", "", "John", "Mary", "Child", "<p>John and Mary are the parents of Child "},
		{"en-US", "hypothesis", "John", "Mary", "Child", "<p>Hypothetically John and Mary are the parents of Child "},
		{"pt-BR", "", "João", "Maria", "Filho", "<p>João e Maria são os pais de Filho "},
		{"es-ES", "hypothesis", "Juan", "María", "Hijo", "<p>Hipotéticamente Juan y María son los padres de Hijo "},
	}
	for _, tc := range cases {
		if got := htTextChildIntroduction(tc.lang, tc.parent1, tc.parent2, tc.child, tc.childType); got != tc.want {
			t.Errorf("htTextChildIntroduction(%q) = %q, want %q", tc.lang, got, tc.want)
		}
	}
}

func TestHTTextParentsIntroduction(t *testing.T) {
	cases := []struct {
		lang, sex, parent1, parent2, want string
	}{
		{"en-US", "male", "John", "Mary", "Son of John and Mary."},
		{"en-US", "female", "John", "Mary", "Daughter of John and Mary."},
		{"pt-BR", "masculino", "João", "Maria", "Filho de João e Maria."},
		{"pt-BR", "feminino", "João", "Maria", "Filha de João e Maria."},
		{"es-ES", "masculino", "Juan", "María", "Hijo de Juan y María."},
		{"es-ES", "feminino", "Juan", "María", "Hija de Juan y María."},
	}
	for _, tc := range cases {
		if got := htTextParentsIntroduction(tc.lang, tc.sex, tc.parent1, tc.parent2); !strings.Contains(got, tc.want) {
			t.Errorf("htTextParentsIntroduction(%q, %q) = %q, want it to contain %q", tc.lang, tc.sex, got, tc.want)
		}
	}
}

func TestHTTextParentsIntroductionPanicsOnInvalidSex(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Error("expected panic for invalid sex")
		}
	}()
	htTextParentsIntroduction("en-US", "invalid", "John", "Mary")
}

func TestHTLocalHTML2Text(t *testing.T) {
	old := commonKeywords[55]
	commonKeywords[55] = "Reflection"
	t.Cleanup(func() { commonKeywords[55] = old })

	got := htLocalHTML2Text("<p>Text</p><div class=\"first_steps_reflection\" id=\"myFirstReflection\">Question</div>", "en-US")
	if !strings.Contains(got, "Text") || !strings.Contains(got, "Reflection") {
		t.Errorf("htLocalHTML2Text = %q", got)
	}
}

func TestHTHTML2Text(t *testing.T) {
	t.Run("simple html", func(t *testing.T) {
		got, err := htHTML2Text("<p>Hello <b>world</b></p>", "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if strings.TrimSpace(got) != "Hello world" {
			t.Errorf("got %q", got)
		}
	})

	t.Run("external link", func(t *testing.T) {
		got, err := htHTML2Text(`<a href="https://example.com">Example</a>`, "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(got, "Example (https://example.com)") {
			t.Errorf("got %q", got)
		}
	})

	t.Run("internal navigation link", func(t *testing.T) {
		got, err := htHTML2Text(`<a href="index.html?page=class_content&arg=first_steps_menu">First Steps</a>`, "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if strings.Contains(got, "index.html") || strings.Contains(got, "class_content") {
			t.Errorf("internal link leaked: %q", got)
		}
		if strings.TrimSpace(got) != "First Steps" {
			t.Errorf("anchor text not preserved: %q", got)
		}
	})

	t.Run("absolute internal navigation link", func(t *testing.T) {
		got, err := htHTML2Text(`<a href="https://historytracers.org/index.html?page=physics">Physics</a>`, "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if strings.Contains(got, "index.html") || strings.Contains(got, "historytracers.org") {
			t.Errorf("internal link leaked: %q", got)
		}
		if strings.TrimSpace(got) != "Physics" {
			t.Errorf("anchor text not preserved: %q", got)
		}
	})

	t.Run("hidden content", func(t *testing.T) {
		got, err := htHTML2Text("<p>Visible</p><script>hidden()</script><style>.x{}</style>", "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if strings.Contains(got, "hidden") || strings.Contains(got, ".x{}") {
			t.Errorf("hidden content leaked: %q", got)
		}
	})

	t.Run("math fraction", func(t *testing.T) {
		mathKeywords = nil
		got, err := htHTML2Text("<math><mfrac><mn>1</mn><mn>2</mn></mfrac></math>", "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(got, "1 dividido por 2") {
			t.Errorf("got %q", got)
		}
	})

	t.Run("math fraction with composite numerator", func(t *testing.T) {
		got, err := htHTML2Text("<math><mfrac><mrow><mn>1</mn><mo>+</mo><mn>1</mn></mrow><mn>2</mn></mfrac></math>", "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(got, "(1 + 1) dividido por 2") {
			t.Errorf("got %q", got)
		}
	})

	t.Run("math fraction with composite denominator", func(t *testing.T) {
		got, err := htHTML2Text("<math><mfrac><mn>1</mn><mrow><mn>2</mn><mo>×</mo><mn>3</mn></mrow></mfrac></math>", "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(got, "1 dividido por (2 × 3)") {
			t.Errorf("got %q", got)
		}
	})

	t.Run("nested math fractions", func(t *testing.T) {
		got, err := htHTML2Text("<math><mfrac><mfrac><mn>b</mn><mn>c</mn></mfrac><mfrac><mn>a</mn><mn>c</mn></mfrac></mfrac></math>", "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(got, "(b dividido por c) dividido por (a dividido por c)") {
			t.Errorf("got %q", got)
		}
	})

	t.Run("markdown fraction", func(t *testing.T) {
		html := htMarkdownToHTML("half (1/2) and 3/3")
		got, err := htHTML2Text(html, "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(got, "half ( 1 dividido por 2 )") || !strings.Contains(got, "3 dividido por 3") {
			t.Errorf("got %q", got)
		}
		if strings.Contains(got, "⁄") || strings.Contains(got, "( 2 )") {
			t.Errorf("fraction slash was not converted: %q", got)
		}
	})

	t.Run("adjacent math fractions are multiplied", func(t *testing.T) {
		got, err := htHTML2Text("<math><mfrac><mn>b</mn><mn>c</mn></mfrac><mfrac><mn>c</mn><mn>a</mn></mfrac></math>", "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(got, "(b dividido por c) × (c dividido por a)") {
			t.Errorf("got %q", got)
		}
	})

	t.Run("math fraction with localized division", func(t *testing.T) {
		old := mathKeywords
		mathKeywords = make([]string, 37)
		mathKeywords[36] = "divided by"
		t.Cleanup(func() { mathKeywords = old })

		got, err := htHTML2Text("<math><mfrac><mrow><mn>3</mn><mo>×</mo><mn>1</mn></mrow><mrow><mn>3</mn><mo>×</mo><mn>2</mn></mrow></mfrac></math>", "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(got, "(3 × 1) divided by (3 × 2)") {
			t.Errorf("got %q", got)
		}
	})

	t.Run("math superscript", func(t *testing.T) {
		got, err := htHTML2Text("<math><msup><mi>c</mi><mn>2</mn></msup></math>", "en-US")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(got, "c squared") {
			t.Errorf("got %q", got)
		}
	})
}

func TestHTIsInternalContentLink(t *testing.T) {
	cases := []struct {
		href string
		want bool
	}{
		{href: "index.html?page=class_content&arg=first_steps_menu", want: true},
		{href: "./index.html?page=physics", want: true},
		{href: "../index.html", want: true},
		{href: "/index.html?page=first_steps", want: true},
		{href: "https://historytracers.org/index.html?page=physics", want: true},
		{href: "https://www.historytracers.org/index.html?page=families", want: true},
		{href: "https://example.com/index.html", want: false},
		{href: "https://historytracers.org/images/logo.png", want: false},
		{href: "mailto:contact@historytracers.org", want: false},
		{href: "", want: false},
	}
	for _, tc := range cases {
		if got := htIsInternalContentLink(tc.href); got != tc.want {
			t.Errorf("htIsInternalContentLink(%q) = %v, want %v", tc.href, got, tc.want)
		}
	}
}

func TestHTIsInteractiveApp(t *testing.T) {
	if !htIsInteractiveApp(`<canvas id="sorobanCanvas"></canvas>`) {
		t.Error("soroban should be interactive")
	}
	if !htIsInteractiveApp(`<div class="yupana-panel"></div>`) {
		t.Error("yupana should be interactive")
	}
	if htIsInteractiveApp("<p>plain text</p>") {
		t.Error("plain text should not be interactive")
	}
}

func TestHTTextToHumanText(t *testing.T) {
	txt := &HTText{Text: "<p>Hello <b>world</b> (<htcite0>)</p>", Format: "html", ImgDesc: "Figure 1"}
	got := htTextToHumanText(txt, "en-US", false)
	if !strings.Contains(got, "Hello world") {
		t.Errorf("missing text: %q", got)
	}
	if strings.Contains(got, "htcite") {
		t.Errorf("citation marker leaked: %q", got)
	}
	if !strings.Contains(got, "Figure 1") {
		t.Errorf("missing image description: %q", got)
	}

	md := &HTText{Text: "**Bold** text", Format: "markdown"}
	if got := htTextToHumanText(md, "en-US", false); !strings.Contains(got, "Bold") {
		t.Errorf("markdown text missing: %q", got)
	}

	internalLink := &HTText{Text: "[Physics](https://historytracers.org/index.html?page=physics)", Format: "markdown"}
	got = htTextToHumanText(internalLink, "en-US", false)
	if strings.Contains(got, "index.html") || strings.Contains(got, "historytracers.org") {
		t.Errorf("internal markdown link leaked: %q", got)
	}
	if !strings.Contains(got, "Physics") {
		t.Errorf("markdown link text missing: %q", got)
	}
}

func TestHTOverwriteDates(t *testing.T) {
	dates := []HTDate{
		{DateType: "gregory", Year: "2024", Month: "2", Day: "29"},
		{DateType: "gregory", Year: "-500", Month: "-1", Day: "-1"},
	}
	got := htOverwriteDates("<htdate0> and <htdate1>", dates, " End.", "en-US", false)
	if !strings.Contains(got, "February 29, 2024") || !strings.Contains(got, "500 B.E.C.") {
		t.Errorf("htOverwriteDates = %q", got)
	}
	if !strings.HasSuffix(got, " End.") {
		t.Errorf("post mention missing: %q", got)
	}
	if got := htOverwriteDates("unchanged", nil, "", "en-US", false); got != "unchanged" {
		t.Errorf("empty dates changed text: %q", got)
	}
}

func TestHTBuildSMGameAudioText(t *testing.T) {
	blocks := []HTText{
		{Text: ""},
		{Text: "<p>Hello <b>world</b></p>"},
		{Text: "中文 text"},
	}
	got := htBuildSMGameAudioText(blocks)
	if !strings.Contains(got, "Hello world") {
		t.Errorf("missing text: %q", got)
	}
	if strings.Contains(got, "中文") || strings.Contains(got, "<") {
		t.Errorf("unexpected content: %q", got)
	}
}

func TestHTParseIndexText(t *testing.T) {
	idx := &ClassIdx{
		Title: "Index",
		Content: []ClassContent{
			{HTMLValue: []HTText{{Text: "<p>Intro text</p>", Format: "html"}}},
			{Value: []ClassContentValue{{Name: "Group", Desc: "Description"}}},
		},
	}
	got := htParseIndexText(idx, "en-US")
	if !strings.Contains(got, "Index") || !strings.Contains(got, "Intro text") || !strings.Contains(got, "Group") || !strings.Contains(got, "Description") {
		t.Errorf("htParseIndexText = %q", got)
	}
}

func TestHTTextFamily(t *testing.T) {
	oldMarriages := familyMarriagesMap
	oldFamilyTop := defaultFamilyTop
	familyMarriagesMap = make(map[string]string)
	defaultFamilyTop = ""
	t.Cleanup(func() {
		familyMarriagesMap = oldMarriages
		defaultFamilyTop = oldFamilyTop
	})

	family := &Family{
		Title:  "Family Title",
		Common: []HTText{{Text: "<p>Common text</p>", Format: "html"}},
	}
	got := htTextFamily(family, "en-US")
	if !strings.Contains(got, "Family Title.") || !strings.Contains(got, "Common text") {
		t.Errorf("htTextFamily = %q", got)
	}
}

func TestHTTextFamilyIndex(t *testing.T) {
	htmlIndex := &IdxFamilyContent{
		HTMLValue: []HTText{{Text: "<p>HTML entry</p>", Format: "html"}},
	}
	if got := htTextFamilyIndex(htmlIndex, "en-US"); !strings.Contains(got, "HTML entry") {
		t.Errorf("HTML family index = %q", got)
	}

	valueIndex := &IdxFamilyContent{
		Value: []IdxFamilyValue{{Name: "Person", Desc: "Description"}},
	}
	got := htTextFamilyIndex(valueIndex, "en-US")
	if !strings.Contains(got, "Person") || !strings.Contains(got, "Description") {
		t.Errorf("value family index = %q", got)
	}

	if got := htTextFamilyIndex(&IdxFamilyContent{}, "en-US"); got != "" {
		t.Errorf("empty family index = %q, want empty", got)
	}
}

func TestHTConvertIndexTextToAudio(t *testing.T) {
	dir := useTempSource(t)
	langDir := filepath.Join(dir, "lang", "en-US")
	if err := os.MkdirAll(langDir, 0755); err != nil {
		t.Fatal(err)
	}

	index := ClassIdx{
		Title:      "Audio Index",
		Type:       "index",
		LastUpdate: []string{""},
		Content: []ClassContent{
			{ID: "introduction", HTMLValue: []HTText{{Text: "<p>Hello listeners</p>", Format: "html"}}},
		},
	}
	payload, err := json.Marshal(index)
	if err != nil {
		t.Fatal(err)
	}
	indexPath := filepath.Join(langDir, "audio_index.json")
	if err := os.WriteFile(indexPath, payload, 0644); err != nil {
		t.Fatal(err)
	}

	htConvertIndexTextToAudio("audio_index", indexPath, "en-US")

	audioPath := filepath.Join(dir, "audios", "audio_index_en-US.txt")
	audio, err := os.ReadFile(audioPath)
	if err != nil {
		t.Fatalf("audio file was not created: %v", err)
	}
	if !strings.Contains(string(audio), "Hello listeners") {
		t.Errorf("audio content = %q", string(audio))
	}
}

func TestHTConvertSMGameToAudio(t *testing.T) {
	dir := useTempSource(t)

	for _, lang := range htLangPaths {
		langDir := filepath.Join(dir, "common", "src", "smartphone", lang)
		if err := os.MkdirAll(langDir, 0755); err != nil {
			t.Fatal(err)
		}
		game := SMGameFile{
			Title: "Smartphone",
			Type:  "sm_game",
			Content: []SMGameContent{
				{ID: testUUID1, Text: []HTText{{Text: "<p>Screen text</p>"}}},
				{ID: testUUID2, Text: []HTText{{Text: ""}}},
			},
		}
		payload, err := json.Marshal(game)
		if err != nil {
			t.Fatal(err)
		}
		path := filepath.Join(langDir, testUUID3+".json")
		if err := os.WriteFile(path, payload, 0644); err != nil {
			t.Fatal(err)
		}
	}

	htConvertSMGameToAudio()

	for _, lang := range htLangPaths {
		audioPath := filepath.Join(dir, "audios", testUUID3+"_"+testUUID1+"_"+lang+".txt")
		audio, err := os.ReadFile(audioPath)
		if err != nil {
			t.Fatalf("audio for %s was not created: %v", lang, err)
		}
		if !strings.Contains(string(audio), "Screen text") {
			t.Errorf("audio content for %s = %q", lang, string(audio))
		}

		emptyPath := filepath.Join(dir, "audios", testUUID3+"_"+testUUID2+"_"+lang+".txt")
		if _, err := os.Stat(emptyPath); !os.IsNotExist(err) {
			t.Errorf("empty screen should not produce audio for %s", lang)
		}
	}
}
