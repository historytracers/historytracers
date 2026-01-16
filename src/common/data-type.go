// SPDX-License-Identifier: GPL-3.0-or-later

package common

type HTDate struct {
	DateType string `json:"type"`
	Year     string `json:"year"`
	Month    string `json:"month"`
	Day      string `json:"day"`
}

type HTAudio struct {
	URL      string `json:"url"`
	External bool   `json:"external"`
	Spotify  bool   `json:"spotify"`
}

type HTExercise struct {
	Question       string `json:"question"`
	YesNoAnswer    string `json:"yesNoAnswer"`
	AdditionalInfo string `json:"additionalInfo"`
}

type HTSource struct {
	Type int    `json:"type"`
	UUID string `json:"uuid"`
	Text string `json:"text"`
	Page string `json:"page"`
	Date HTDate `json:"date_time"`
}

type HTSourceElement struct {
	ID          string `json:"id"`
	Citation    string `json:"citation"`
	Date        string `json:"date_time"`
	PublishDate string `json:"published"`
	URL         string `json:"url"`
}

type HTSourceFile struct {
	License            []string          `json:"license"`
	LastUpdate         []string          `json:"last_update"`
	Version            int               `json:"version"`
	Type               string            `json:"type"`
	PrimarySources     []HTSourceElement `json:"primary_sources"`
	ReferencesSources  []HTSourceElement `json:"reference_sources"`
	ReligiousSources   []HTSourceElement `json:"religious_sources"`
	SocialMediaSources []HTSourceElement `json:"social_media_sources"`
}

type HTText struct {
	Text        string     `json:"text"`
	Source      []HTSource `json:"source"`
	FillDates   []HTDate   `json:"date_time"`
	IsTable     bool       `json:"isTable"`
	ImgDesc     string     `json:"imgdesc"`
	Format      string     `json:"format"`
	PostMention string     `json:"PostMention"`
}

type HTMap struct {
	Text     string   `json:"text"`
	Img      string   `json:"img"`
	Order    int      `json:"order"`
	DateTime []HTDate `json:"date_time"`
}

type HTCommonContent struct {
	ID        string           `json:"id"`
	Desc      string           `json:"desc"`
	Target    string           `json:"target"`
	Page      string           `json:"page"`
	ValueType string           `json:"value_type"`
	HTMLValue string           `json:"html_value"`
	Value     []IdxFamilyValue `json:"value"`
	FillDates []HTDate         `json:"date_time"`
}

type HTOldFileFormat struct {
	Title      string            `json:"title"`
	Header     string            `json:"header"`
	License    []string          `json:"license"`
	Sources    []string          `json:"sources"`
	LastUpdate []string          `json:"last_update"`
	Audio      []HTAudio         `json:"audio"`
	Contents   []HTCommonContent `json:"content"`
	DateTime   []HTDate          `json:"date_time"`
}

type HTKeywordsFormat struct {
	License  []string `json:"license"`
	Keywords []string `json:"keywords"`
}

// Class

type ClassTemplateContent struct {
	ID   string   `json:"id"`
	Text []HTText `json:"text"`
}

type HTGameDesc struct {
	ImagePath string   `json:"imagePath"`
	ImageDesc string   `json:"imageDesc"`
	DateTime  []HTDate `json:"date_time"`
}

type ClassTemplateFile struct {
	Title      string                 `json:"title"`
	Header     string                 `json:"header"`
	Sources    []string               `json:"sources"`
	Scripts    []string               `json:"scripts"`
	Audio      []HTAudio              `json:"audio"`
	Index      []string               `json:"index"`
	License    []string               `json:"license"`
	LastUpdate []string               `json:"last_update"`
	Authors    []string               `json:"authors"`
	Reviewers  []string               `json:"reviewers"`
	Type       string                 `json:"type"`
	Version    int                    `json:"version"`
	Editing    bool                   `json:"editing"`
	Content    []ClassTemplateContent `json:"content"`
	Exercises  []HTExercise           `json:"exercise_v2"`
	GameV2     []HTGameDesc           `json:"game_v2"`
	DateTime   []HTDate               `json:"date_time"`
}

type ClassContentValue struct {
	FamilyId string   `json:"family_id"`
	PersonId string   `json:"person_id"`
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	Desc     string   `json:"desc"`
	DateTime []HTDate `json:"date_time"`
}

type ClassContent struct {
	ID        string              `json:"id"`
	Target    string              `json:"target"`
	Page      string              `json:"page"`
	ValueType string              `json:"value_type"`
	HTMLValue string              `json:"html_value"`
	Value     []ClassContentValue `json:"value"`
	DateTime  []HTDate            `json:"date_time"`
}

type ClassIdx struct {
	Title      string         `json:"title"`
	Header     string         `json:"header"`
	Audio      []HTAudio      `json:"audio"`
	LastUpdate []string       `json:"last_update"`
	Sources    []string       `json:"sources"`
	License    []string       `json:"license"`
	Version    int            `json:"version"`
	Type       string         `json:"type"`
	Content    []ClassContent `json:"content"`
	DateTime   []HTDate       `json:"date_time"`
}

// Families

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
	License       []string     `json:"license"`
	LastUpdate    []string     `json:"last_update"`
	Authors       string       `json:"authors"`
	Reviewers     string       `json:"reviewers"`
	DocumentsInfo []string     `json:"documentsInfo"`
	PeriodOfTime  []string     `json:"periodOfTime"`
	Maps          []HTMap      `json:"maps"`
	Common        []HTText     `json:"common"`
	Prerequisites []string     `json:"prerequisites"`
	GEDCOM        string       `json:"gedcom"`
	CSV           string       `json:"csv"`
	Version       int          `json:"version"`
	Editing       bool         `json:"editing"`
	Type          string       `json:"type"`
	Families      []FamilyBody `json:"families"`
	Exercises     []HTExercise `json:"exercise_v2"`
	DateTime      []HTDate     `json:"date_time"`
}

// Atlas
type AtlasTemplateContent struct {
	ID     string   `json:"uuid"`
	Image  string   `json:"image"`
	Author string   `json:"author"`
	Index  string   `json:"index"`
	Audio  string   `json:"audio"`
	Text   []HTText `json:"text"`
}

type AtlasTemplateFile struct {
	Title      string                 `json:"title"`
	Header     string                 `json:"header"`
	Sources    []string               `json:"sources"`
	Scripts    []string               `json:"scripts"`
	Audio      []HTAudio              `json:"audio"`
	License    []string               `json:"license"`
	LastUpdate []string               `json:"last_update"`
	Authors    []string               `json:"authors"`
	Reviewers  []string               `json:"reviewers"`
	Type       string                 `json:"type"`
	Version    int                    `json:"version"`
	Editing    bool                   `json:"editing"`
	Content    []ClassTemplateContent `json:"content"`
	Atlas      []AtlasTemplateContent `json:"atlas"`
}
