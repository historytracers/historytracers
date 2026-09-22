// SPDX-License-Identifier: GPL-3.0-or-later

var localBuildingEtr = {};

var HT_BUILDING_ETR_MAX_LEVEL = 5;
var HT_BUILDING_ETR_VALUES_PER_LEVEL = 20;
var HT_BUILDING_ETR_ROWS = 5;
var HT_BUILDING_ETR_COLUMNS = 4;

var htBuildingEtrSymbols = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
];

function htBuildingEtrToRoman(value) {
    var remaining = value;
    var result = "";
    for (let i = 0; i < htBuildingEtrSymbols.length; i++) {
        while (remaining >= htBuildingEtrSymbols[i][0]) {
            result += htBuildingEtrSymbols[i][1];
            remaining -= htBuildingEtrSymbols[i][0];
        }
    }
    return result;
}

function htBuildingEtrStartValue(level) {
    return (level - 1) * HT_BUILDING_ETR_VALUES_PER_LEVEL + 1;
}

function htBuildingEtrValueCount(level) {
    if (level >= HT_BUILDING_ETR_MAX_LEVEL) {
        return 99 - htBuildingEtrStartValue(level) + 1;
    }
    return HT_BUILDING_ETR_VALUES_PER_LEVEL;
}

function htBuildingEtrRomanCellHtml(value) {
    return "<span class=\"buildingRoman\">" + htBuildingEtrToRoman(value) + "</span>";
}

function htBuildingEtrFillTable() {
    $("#buildingEtr tr:not(:first)").remove();
    localBuildingEtr.hidden = [];
    localBuildingEtr.revealed = 0;
    localBuildingEtr.completed = false;

    var startValue = htBuildingEtrStartValue(localBuildingEtr.level);
    var valueCount = htBuildingEtrValueCount(localBuildingEtr.level);

    var idx = 0;
    for (let r = 0; r < HT_BUILDING_ETR_ROWS; r++) {
        var row = "<tr>";
        for (let c = 0; c < HT_BUILDING_ETR_COLUMNS; c++, idx++) {
            if (idx >= valueCount) {
                row += "<td class=\"buildingEmpty\"></td>";
            } else {
                var value = startValue + idx;
                row += "<td id=\"be" + idx + "\" data-num=\"" + idx + "\" data-value=\"" + value + "\" class=\"mngCell romanCell\"><button type=\"button\" class=\"mngCellBtn\" aria-label=\"Reveal Etruscan-Roman numeral " + value + "\" onclick=\"htBuildingEtrReveal(" + idx + ");\" style=\"all:inherit;display:block;width:100%;height:100%;border:none;background:transparent;cursor:pointer;padding:0;\">" + htBuildingEtrRomanCellHtml(value) + "</button></td>";
            }
        }
        row += "</tr>";
        $("#buildingEtr tr:last").after(row);
    }

    for (let r = 0; r < HT_BUILDING_ETR_ROWS; r++) {
        var choices = [];
        for (let c = 0; c < HT_BUILDING_ETR_COLUMNS; c++) {
            var pos = r * HT_BUILDING_ETR_COLUMNS + c;
            if (pos < valueCount) {
                choices.push(pos);
            }
        }
        if (choices.length === 0) {
            continue;
        }
        var chosen = choices[htGetRandomArbitrary(0, choices.length)];
        localBuildingEtr.hidden.push(chosen);
        $("#be" + chosen).addClass("mngEmpty").html("<button type=\"button\" class=\"mngCellBtn\" aria-label=\"Reveal Etruscan-Roman numeral " + $("#be" + chosen).attr("data-value") + "\" onclick=\"htBuildingEtrReveal(" + chosen + ");\" style=\"all:inherit;display:block;width:100%;height:100%;border:none;background:transparent;cursor:pointer;padding:0;\"><span class=\"mngQuestion\">?</span></button>");
    }

    $("#buildingEtrCompleteMsg").hide();
    $("#buildingEtrCongratsMsg").hide();
    $("#buildingEtrNextLevel").hide();
}

function htBuildingEtrReveal(num) {
    if (localBuildingEtr.completed) {
        return false;
    }
    if (localBuildingEtr.hidden.indexOf(num) === -1) {
        return false;
    }
    if ($("#be" + num).hasClass("mngRevealed")) {
        return false;
    }
    var value = parseInt($("#be" + num).attr("data-value"));
    $("#be" + num).removeClass("mngEmpty").addClass("mngRevealed").html(htBuildingEtrRomanCellHtml(value));
    localBuildingEtr.revealed++;
    if (localBuildingEtr.revealed === localBuildingEtr.hidden.length) {
        htBuildingEtrCompleteLevel();
    }
    return false;
}

function htBuildingEtrCompleteLevel() {
    localBuildingEtr.completed = true;
    var nextBtn = $("#buildingEtrNextLevel");
    if (localBuildingEtr.level >= HT_BUILDING_ETR_MAX_LEVEL) {
        $("#buildingEtrCongratsMsg").show();
        nextBtn.text($("#buildingEtrWordPlayAgain").text());
    } else {
        $("#buildingEtrCompleteMsg").show();
        nextBtn.text($("#buildingEtrWordNextLevel").text());
    }
    nextBtn.show();
}

function htBuildingEtrLoadLevel() {
    var startValue = htBuildingEtrStartValue(localBuildingEtr.level);
    var endValue = startValue + htBuildingEtrValueCount(localBuildingEtr.level) - 1;
    $("#buildingEtrLevel").text($("#buildingEtrWordLevel").text() + " " + localBuildingEtr.level + " (" + startValue + " \u2013 " + endValue + ")");
    htBuildingEtrFillTable();
}

function htLoadContent() {
    localBuildingEtr = { "level": 1, "hidden": [], "revealed": 0, "completed": false };

    $("#buildingEtrReset").on("click", function() {
        htBuildingEtrFillTable();
    });

    $("#buildingEtrNextLevel").on("click", function() {
        if (localBuildingEtr.level >= HT_BUILDING_ETR_MAX_LEVEL) {
            localBuildingEtr.level = 1;
        } else {
            localBuildingEtr.level++;
        }
        htBuildingEtrLoadLevel();
    });

    htBuildingEtrLoadLevel();

    htWriteNavigation();

    return false;
}
