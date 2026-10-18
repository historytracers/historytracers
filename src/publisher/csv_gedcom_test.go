// SPDX-License-Identifier: GPL-3.0-or-later

package main

import (
	"strings"
	"testing"

	. "github.com/historytracers/common"
)

func TestHTInitializeCSVHeaders(t *testing.T) {
	if got := htInitializeCSVPlace(); len(got) != 3 || len(got[2]) != 9 || got[2][0] != "place" {
		t.Errorf("place headers = %v", got)
	}
	if got := htInitializeCSVPeople(); len(got) != 3 || len(got[2]) != 22 || got[2][0] != "person" {
		t.Errorf("people headers = %v", got)
	}
	if got := htInitializeCSVMarriage(); len(got) != 3 || len(got[2]) != 8 || got[2][0] != "marriage" {
		t.Errorf("marriage headers = %v", got)
	}
	if got := htInitializeCSVFamily(); len(got) != 3 || len(got[2]) != 5 || got[2][0] != "family" {
		t.Errorf("family headers = %v", got)
	}
}

func TestHTSetCSVBasicPerson(t *testing.T) {
	got := htSetCSVBasicPerson("John Smith", testUUID1, "en-US", nil)
	if len(got) != 22 {
		t.Fatalf("basic person has %d columns, want 22", len(got))
	}
	if got[0] != "[P11111111-1111-4111]" || got[1] != "John Smith" {
		t.Errorf("basic person = %v", got)
	}
}

func TestHTFillAddrKey(t *testing.T) {
	oldAddrMap := addrMap
	oldAddrMapLang := addrMapLang
	oldFamiliesPlaceCSV := htFamiliesPlaceCSV
	oldFamilyPlaceCSV := htFamilyPlaceCSV
	oldFamilyUpdated := familyUpdated
	t.Cleanup(func() {
		addrMap = oldAddrMap
		addrMapLang = oldAddrMapLang
		htFamiliesPlaceCSV = oldFamiliesPlaceCSV
		htFamilyPlaceCSV = oldFamilyPlaceCSV
		familyUpdated = oldFamilyUpdated
	})

	addrMap = make(map[AddrKey][]string)
	addrMapLang = make(map[AddrKey][]string)
	htFamiliesPlaceCSV = nil
	htFamilyPlaceCSV = nil
	familyUpdated = false

	extKey := ""
	got := htFillAddrKey(&extKey, "Lisbon", "City", "2024", "[LCountry]", "1000")
	if len(got) != 9 {
		t.Fatalf("address row = %v", got)
	}
	if !strings.HasPrefix(got[0], "[L") || got[1] != "Lisbon" || got[3] != "City" || got[6] != "1000" || got[7] != "[LCountry]" || got[8] != "2024" {
		t.Errorf("address row = %v", got)
	}
	if got[0] != "["+extKey+"]" {
		t.Errorf("external key = %q, row id = %q", extKey, got[0])
	}
	if !familyUpdated {
		t.Error("familyUpdated should be true after adding a new place")
	}
	if len(htFamiliesPlaceCSV) != 1 || len(htFamilyPlaceCSV) != 1 {
		t.Errorf("place CSV lists = %d/%d, want 1/1", len(htFamiliesPlaceCSV), len(htFamilyPlaceCSV))
	}

	secondKey := ""
	second := htFillAddrKey(&secondKey, "Lisbon", "City", "2025", "[LCountry]", "1000")
	if "["+secondKey+"]" != got[0] || len(second) != len(got) {
		t.Errorf("reused address = %v (key %q), want row id %q", second, secondKey, got[0])
	}
	if len(htFamiliesPlaceCSV) != 1 || len(htFamilyPlaceCSV) != 1 {
		t.Errorf("duplicate place was appended to CSV lists")
	}

	emptyKey := ""
	if empty := htFillAddrKey(&emptyKey, "", "City", "2024", "", ""); empty != nil {
		t.Errorf("empty place = %v, want nil", empty)
	}
}

func TestHTSetCSVMarriage(t *testing.T) {
	old := sourceMap
	sourceMap = map[string]HTSourceElement{}
	t.Cleanup(func() { sourceMap = old })

	marr := &FamilyPersonMarriage{
		DateTime: FamilyPersonEvent{Date: []HTDate{{DateType: "gregory", Year: "2024", Month: "2", Day: "29"}}},
		History:  []HTText{{Source: []HTSource{{Type: 1, UUID: testUUID3, Text: "Source text"}}}},
	}
	out := htSetCSVMarriage("F123", testUUID1, testUUID2, marr, "en-US")
	if len(out) != 8 {
		t.Fatalf("marriage row = %v", out)
	}
	if out[0] != "[F123]" || !strings.HasPrefix(out[1], " [P") || !strings.HasPrefix(out[2], " [P") {
		t.Errorf("marriage ids = %v", out)
	}
	if out[3] != "Feb 29, 2024" || out[6] != "Source text" || out[7] != "No primary source was found to confirm this." {
		t.Errorf("marriage details = %v", out)
	}

	htUpdateCSVMarriage(out, marr, "en-US")
	if out[6] != "Source text" || out[7] != "No primary source was found to confirm this." {
		t.Errorf("updated marriage row = %v", out)
	}
}

func TestHTSetCSVFamily(t *testing.T) {
	child := &FamilyPersonChild{ID: testUUID1}
	out := htSetCSVFamily([]string{"[F123]", "", "", "", ""}, child, "en-US")
	if len(out) != 5 {
		t.Fatalf("family row = %v", out)
	}
	if out[0] != "[F123]" || !strings.HasPrefix(out[1], " [P") {
		t.Errorf("family ids = %v", out)
	}
	if out[2] != "" || out[3] != "No primary source was found to confirm this." || out[4] != "" {
		t.Errorf("family details = %v", out)
	}
}
