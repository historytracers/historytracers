// SPDX-License-Identifier: GPL-3.0-or-later

var localBuildingMeso = {};

var HT_BUILDING_MESO_MAX_LEVEL = 2;
var HT_BUILDING_MESO_ROWS = 5;
var HT_BUILDING_MESO_COLUMNS = 4;

function htBuildingMesoGlyphCellHtml(value) {
    var prefix = htGetImgSrcPrefix();
    return "<img class=\"buildingGlyph\" id=\"bmg" + value + "\" onclick=\"htImageZoom('bmg" + value + "', '0%')\" src=\"" + prefix + "images/HistoryTracers/Maya_" + value + ".png\" alt=\"Maya numeral " + value + "\" />";
}

function htBuildingMesoFillTable() {
    $("#buildingMeso tr:not(:first)").remove();
    localBuildingMeso.hidden = [];
    localBuildingMeso.revealed = 0;
    localBuildingMeso.completed = false;

    var idx = 0;
    for (let r = 0; r < HT_BUILDING_MESO_ROWS; r++) {
        var row = "<tr>";
        for (let c = 0; c < HT_BUILDING_MESO_COLUMNS; c++, idx++) {
            row += "<td id=\"bm" + idx + "\" data-num=\"" + idx + "\" class=\"mngCell\"><button type=\"button\" class=\"mngCellBtn\" aria-label=\"Reveal Mesoamerican numeral " + idx + "\" onclick=\"htBuildingMesoReveal(" + idx + ");\" style=\"all:inherit;display:block;width:100%;height:100%;border:none;background:transparent;cursor:pointer;padding:0;\">" + htBuildingMesoGlyphCellHtml(idx) + "</button></td>";
        }
        row += "</tr>";
        $("#buildingMeso tr:last").after(row);
    }

    var perRow = localBuildingMeso.level;
    for (let r = 0; r < HT_BUILDING_MESO_ROWS; r++) {
        var columns = [];
        while (columns.length < perRow) {
            var col = htGetRandomArbitrary(0, HT_BUILDING_MESO_COLUMNS);
            if (columns.indexOf(col) === -1) {
                columns.push(col);
            }
        }
        for (let k = 0; k < columns.length; k++) {
            var num = r * HT_BUILDING_MESO_COLUMNS + columns[k];
            localBuildingMeso.hidden.push(num);
            $("#bm" + num).addClass("mngEmpty").html("<button type=\"button\" class=\"mngCellBtn\" aria-label=\"Reveal Mesoamerican numeral " + num + "\" onclick=\"htBuildingMesoReveal(" + num + ");\" style=\"all:inherit;display:block;width:100%;height:100%;border:none;background:transparent;cursor:pointer;padding:0;\"><span class=\"mngQuestion\">?</span></button>");
        }
    }

    $("#buildingMesoCompleteMsg").hide();
    $("#buildingMesoCongratsMsg").hide();
    $("#buildingMesoNextLevel").hide();
}

function htBuildingMesoReveal(num) {
    if (localBuildingMeso.completed) {
        return false;
    }
    if (localBuildingMeso.hidden.indexOf(num) === -1) {
        return false;
    }
    if ($("#bm" + num).hasClass("mngRevealed")) {
        return false;
    }
    $("#bm" + num).removeClass("mngEmpty").addClass("mngRevealed").html(htBuildingMesoGlyphCellHtml(num));
    localBuildingMeso.revealed++;
    if (localBuildingMeso.revealed === localBuildingMeso.hidden.length) {
        htBuildingMesoCompleteLevel();
    }
    return false;
}

function htBuildingMesoCompleteLevel() {
    localBuildingMeso.completed = true;
    var nextBtn = $("#buildingMesoNextLevel");
    if (localBuildingMeso.level >= HT_BUILDING_MESO_MAX_LEVEL) {
        $("#buildingMesoCongratsMsg").show();
        nextBtn.text($("#buildingMesoWordPlayAgain").text());
    } else {
        $("#buildingMesoCompleteMsg").show();
        nextBtn.text($("#buildingMesoWordNextLevel").text());
    }
    nextBtn.show();
}

function htBuildingMesoLoadLevel() {
    $("#buildingMesoLevel").text($("#buildingMesoWordLevel").text() + " " + localBuildingMeso.level);
    htBuildingMesoFillTable();
}

function htLoadContent() {
    localBuildingMeso = { "level": 1, "hidden": [], "revealed": 0, "completed": false };

    $("#buildingMesoReset").on("click", function() {
        htBuildingMesoFillTable();
    });

    $("#buildingMesoNextLevel").on("click", function() {
        if (localBuildingMeso.level >= HT_BUILDING_MESO_MAX_LEVEL) {
            localBuildingMeso.level = 1;
        } else {
            localBuildingMeso.level++;
        }
        htBuildingMesoLoadLevel();
    });

    htBuildingMesoLoadLevel();

    htWriteNavigation();

    return false;
}
