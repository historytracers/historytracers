// SPDX-License-Identifier: GPL-3.0-or-later

// "Complete the Multiplication Table" (content 19b00e11-1e70-4e76-808c-673a0cc71af4).
// The left side shows the multiplication table of a number chosen randomly
// between 2 and 9, almost fully complete: three products are left blank and
// the reader types them in text inputs. Clicking a filled product draws that
// multiplication on the right side as groups of the same character, exactly
// like in "Multiplying the Findings with Groups" (21f8d529-1c27-4f02-b880-
// 81954daaf6ac): each rectangle holds as many characters as the table number
// (the first factor) and the number of rectangles is the row of the table
// (the second factor). A typed answer reveals the product and its groups when
// it is right; when it is wrong, a tip gives the range of the expected number
// (the previous and the next products of the table) and how far it is from
// each of them (the table number itself).
// Localized texts live in the class JSON, so this file only wires the behavior.

var localMultFill = {};

var HT_MULT_FILL_RANDOM = -1;
var HT_MULT_FILL_MIN_TABLE = 2;
var HT_MULT_FILL_MAX_TABLE = 9;
var HT_MULT_FILL_MAX_ROW = 10;
var HT_MULT_FILL_BLANKS = 3;

// "Randomly" picks a table between 2 and 9, so the game keeps its counting
// rhythm; the selector still offers every table from 0 to 9 explicitly.
function htMultFillPickTable(choice) {
    choice = parseInt(choice, 10);
    if (!isNaN(choice) && choice >= 0 && choice <= HT_MULT_FILL_MAX_TABLE) {
        return choice;
    }
    return htGetRandomArbitrary(HT_MULT_FILL_MIN_TABLE, HT_MULT_FILL_MAX_TABLE + 1);
}

function htMultFillIcons() {
    return [ "🐶", "🐱", "🍎", "⭐", "🔺" ];
}

// The groups of the multiplication table x row: `row` rectangles, each one
// holding `table` characters — the first factor inside the rectangles, the
// second factor counting how many rectangles are drawn, as in the other
// groups games.
function htMultFillDrawGroups(table, row, icon) {
    var boxes = "";
    for (let g = 0; g < row; g++) {
        var content = "";
        for (let i = 0; i < table; i++) {
            content += "<span class=\"htMultGroupIcon\">" + icon + "</span>";
        }
        boxes += "<span class=\"htMultGroupBox\" aria-hidden=\"true\">" + content + "</span>";
    }
    return boxes;
}

// Accessible name of a filled product: the multiplication with its result and
// the description of the groups ("7 × 3 = 21. Groups: 3. Characters per
// group: 7.").
function htMultFillAriaLabel(table, row) {
    var groupWord = $("#multFillWordGroups").text()
        .split("%COUNT%").join(row)
        .split("%SIZE%").join(table);
    return table + " × " + row + " = " + (table * row) + ". " + groupWord;
}

// The right side shows the clicked (or just answered) multiplication as
// groups of characters, with its expression and result above them.
function htMultFillShowGroups(table, row) {
    $("#multFillRightCol").html(
        "<span class=\"htMultFillExpr htMultFillBoardExpr\">" + table + " × " + row + " = " + (table * row) + "</span>" +
        "<span class=\"htMultGroupsWrap\">" + htMultFillDrawGroups(table, row, localMultFill.icon) + "</span>"
    );
}

// Clicking a filled product reveals the groups of that multiplication.
function htMultFillClick(row) {
    $("#multFillFeedback").hide().html("");
    htMultFillShowGroups(localMultFill.table, row);
}

// Checks a typed answer. A correct value is revealed with its groups; a wrong
// value receives the tip with the range of the expected number.
function htMultFillCheck(row) {
    var $input = $("#multFillInput" + row);
    if ($input.length === 0 || $input.prop("disabled")) {
        return;
    }
    var raw = $input.val().trim();
    if (raw === "") {
        return;
    }

    var expected = localMultFill.table * row;
    var value = parseInt(raw, 10);
    if (isNaN(value)) {
        $("#multFillFeedback").text($("#multFillWordNotNumber").text()).show();
        $input.addClass("htMultFillInputWrong");
        return;
    }

    if (value === expected) {
        // The typed product becomes a filled result, so the reader can click
        // it afterwards to see the groups again, exactly like the results
        // that were already filled.
        $("#multFillCell" + row).html("<button type=\"button\" class=\"htMultFillValue\" id=\"multFillValue" + row + "\" aria-label=\"" + htMultFillAriaLabel(localMultFill.table, row) + "\" onclick=\"htMultFillClick(" + row + ");\">" + expected + "</button>");
        delete localMultFill.blanks[row];
        $("#multFillFeedback").hide().html("");
        htMultFillShowGroups(localMultFill.table, row);
        if (Object.keys(localMultFill.blanks).length === 0) {
            $("#multFillDone").show();
        }
        return;
    }

    // Wrong value: the tip tells the range of the expected product — the
    // previous and the next products of the table — and that it lies exactly
    // `table` positions from each one of them.
    var tip = $("#multFillWordTip").text()
        .split("%X%").join(localMultFill.table * (row - 1))
        .split("%Y%").join(localMultFill.table * (row + 1))
        .split("%Z%").join(localMultFill.table);
    $("#multFillFeedback").text(tip).show();
    $input.addClass("htMultFillInputWrong");
}

// Builds a new table: the table chosen in the selector (or a random number
// between 2 and 9), three distinct rows left blank, and every other product
// already filled and clickable.
function htMultFillBuild(chosenTable) {
    $("#multFillDone").hide();
    $("#multFillFeedback").hide().html("");

    localMultFill.table = htMultFillPickTable(chosenTable);
    localMultFill.icon = htMultFillIcons()[htGetRandomArbitrary(0, htMultFillIcons().length)];

    localMultFill.blanks = {};
    while (Object.keys(localMultFill.blanks).length < HT_MULT_FILL_BLANKS) {
        localMultFill.blanks[htGetRandomArbitrary(1, HT_MULT_FILL_MAX_ROW + 1)] = true;
    }

    var tableWord = $("#multFillWordTable").text();
    var html = "<table class=\"htMultFillTable\"><tr><th colspan=\"2\">" + tableWord + " " + localMultFill.table + "</th></tr>";
    for (let k = 1; k <= HT_MULT_FILL_MAX_ROW; k++) {
        var cell = "";
        if (localMultFill.blanks[k]) {
            cell = "<input type=\"text\" class=\"htMultFillInput\" id=\"multFillInput" + k + "\" inputmode=\"numeric\" autocomplete=\"off\" maxlength=\"4\" aria-label=\"" + tableWord + " " + localMultFill.table + ": " + localMultFill.table + " × " + k + "\" />";
        } else {
            var product = localMultFill.table * k;
            cell = "<button type=\"button\" class=\"htMultFillValue\" id=\"multFillValue" + k + "\" aria-label=\"" + htMultFillAriaLabel(localMultFill.table, k) + "\" onclick=\"htMultFillClick(" + k + ");\">" + product + "</button>";
        }
        html += "<tr><td class=\"htMultFillExpr\">" + localMultFill.table + " × " + k + "</td><td id=\"multFillCell" + k + "\">" + cell + "</td></tr>";
    }
    html += "</table>";
    $("#multFillLeftCol").html(html);

    for (let k = 1; k <= HT_MULT_FILL_MAX_ROW; k++) {
        if (!localMultFill.blanks[k]) {
            continue;
        }
        (function(row) {
            $("#multFillInput" + row)
                .on("keydown", function(ev) {
                    if (ev.key === "Enter") {
                        ev.preventDefault();
                        htMultFillCheck(row);
                    }
                })
                .on("change", function() {
                    htMultFillCheck(row);
                });
        })(k);
    }

    $("#multFillRightCol").html("<span class=\"htMultFillHint\">" + $("#multFillWordClick").text() + "</span>");
}

function htLoadContent() {
    localMultFill = { "table": HT_MULT_FILL_MIN_TABLE, "tableChoice": HT_MULT_FILL_RANDOM, "icon": "", "blanks": {} };

    $("#multFillReset").off("click").on("click", function() {
        htMultFillBuild(localMultFill.tableChoice);
    });

    // The "Multiplication Table" selector offers the tables from 0 to 9, with
    // "Randomly" (a table between 2 and 9) as the default value.
    if ($("#multFillValues").length > 0) {
        var data = [];
        for (let t = 0; t <= HT_MULT_FILL_MAX_TABLE; t++) {
            data.push({ text: String(t), value: String(t) });
        }
        $.each(data, function(index, item) {
            $('#multFillValues').append($('<option>', {
                value: item.value,
                text: item.text
            }));
        });
        $("#multFillValues").on("change", function() {
            var opt = parseInt($(this).val(), 10);
            localMultFill.tableChoice = isNaN(opt) ? HT_MULT_FILL_RANDOM : opt;
            htMultFillBuild(localMultFill.tableChoice);
        });
    }

    htMultFillBuild(localMultFill.tableChoice);

    htWriteNavigation();

    return false;
}
