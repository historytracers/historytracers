// SPDX-License-Identifier: GPL-3.0-or-later

var localRepresent = {};

var HT_REPRESENT_MAX_LEVEL = 4;
var HT_REPRESENT_PAIR_COUNT = 5;

var htRepresentSymbols = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
];

function htRepresentToRoman(value) {
    var remaining = value;
    var result = "";
    for (let i = 0; i < htRepresentSymbols.length; i++) {
        while (remaining >= htRepresentSymbols[i][0]) {
            result += htRepresentSymbols[i][1];
            remaining -= htRepresentSymbols[i][0];
        }
    }
    return result;
}

// Thousands are written as overlined I..IX (I = 1000, II = 2000, ... IX = 9000),
// never as a long run of M.
function htRepresentRomanHtml(value) {
    var thousands = htRepresentToRoman(Math.floor(value / 1000));
    var remainder = htRepresentToRoman(value % 1000);
    var html = "";
    if (thousands.length > 0) {
        html += "<span class=\"representOverline\">" + thousands + "</span>";
    }
    html += remainder;
    return html;
}

function htRepresentShuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        let j = htGetRandomArbitrary(0, i + 1);
        let tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
    }
    return items;
}

function htRepresentWindowsForLevel(level) {
    if (level === 2) {
        return [[10, 30], [20, 40], [40, 60], [60, 80], [80, 99]];
    }
    if (level === 3) {
        return [[100, 300], [200, 400], [400, 600], [600, 800], [800, 999]];
    }
    if (level === 4) {
        return [[1000, 3000], [2000, 4000], [4000, 6000], [6000, 8000], [8000, 9999]];
    }
    return [];
}

function htRepresentRandomIn(min, max) {
    return min + htGetRandomArbitrary(0, max - min + 1);
}

function htRepresentGenerateValues(level) {
    if (level <= 1) {
        var pool = [];
        for (let i = 1; i <= 10; i++) {
            pool.push(i);
        }
        htRepresentShuffle(pool);
        return pool.slice(0, HT_REPRESENT_PAIR_COUNT);
    }

    var windows = htRepresentWindowsForLevel(level);
    var chosen = [];
    var used = {};
    for (let w = 0; w < windows.length; w++) {
        var min = windows[w][0];
        var max = windows[w][1];
        var candidate = htRepresentRandomIn(min, max);
        var attempts = 0;
        while (used[candidate] && attempts < 50) {
            candidate = htRepresentRandomIn(min, max);
            attempts++;
        }
        if (used[candidate]) {
            for (let v = min; v <= max; v++) {
                if (!used[v]) {
                    candidate = v;
                    break;
                }
            }
        }
        used[candidate] = true;
        chosen.push(candidate);
    }
    return chosen;
}

function htRepresentBuild() {
    $("#representCompleteMsg").hide();
    $("#representCongratsMsg").hide();
    $("#representNextLevel").hide();

    localRepresent.matched = {};
    localRepresent.selectedLeft = null;
    localRepresent.selectedRight = null;

    var values = htRepresentGenerateValues(localRepresent.level);
    localRepresent.values = values;

    var leftItems = [];
    var rightItems = [];
    for (let i = 0; i < values.length; i++) {
        leftItems.push({ "id": values[i], "html": htRepresentRomanHtml(values[i]) });
        rightItems.push({ "id": values[i], "text": "" + values[i] });
    }
    htRepresentShuffle(leftItems);
    htRepresentShuffle(rightItems);

    var leftHtml = "";
    for (let i = 0; i < leftItems.length; i++) {
        leftHtml += "<button type=\"button\" class=\"orderGameBtn representRomanBtn\" id=\"representLeft" + leftItems[i].id + "\" data-id=\"" + leftItems[i].id + "\" onclick=\"htRepresentSelect('Left', " + leftItems[i].id + ");\">" + leftItems[i].html + "</button>";
    }
    var rightHtml = "";
    for (let i = 0; i < rightItems.length; i++) {
        rightHtml += "<button type=\"button\" class=\"orderGameBtn\" id=\"representRight" + rightItems[i].id + "\" data-id=\"" + rightItems[i].id + "\" onclick=\"htRepresentSelect('Right', " + rightItems[i].id + ");\">" + rightItems[i].text + "</button>";
    }
    $("#representLeftCol").html(leftHtml);
    $("#representRightCol").html(rightHtml);

    var levelWord = $("#representWordLevel").text();
    $("#representLevel").text(levelWord + " " + localRepresent.level + "/" + HT_REPRESENT_MAX_LEVEL);
}

function htRepresentSelect(side, id) {
    if (localRepresent.matched[id]) {
        return false;
    }

    if (side == "Left") {
        if (localRepresent.selectedLeft != null) {
            $("#representLeft" + localRepresent.selectedLeft).removeClass("orderGameBtnSelected");
        }
        localRepresent.selectedLeft = id;
    } else {
        if (localRepresent.selectedRight != null) {
            $("#representRight" + localRepresent.selectedRight).removeClass("orderGameBtnSelected");
        }
        localRepresent.selectedRight = id;
    }

    $("#represent" + side + id).addClass("orderGameBtnSelected");

    htRepresentEvaluatePair();
    return false;
}

function htRepresentEvaluatePair() {
    var leftId = localRepresent.selectedLeft;
    var rightId = localRepresent.selectedRight;
    if (leftId == null || rightId == null) {
        return;
    }

    if (leftId == rightId) {
        localRepresent.matched[leftId] = true;
        $("#representLeft" + leftId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        $("#representRight" + rightId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        localRepresent.selectedLeft = null;
        localRepresent.selectedRight = null;
        htRepresentCheckComplete();
    } else {
        $("#representLeft" + leftId).removeClass("orderGameBtnSelected");
        $("#representRight" + rightId).removeClass("orderGameBtnSelected");
        localRepresent.selectedLeft = null;
        localRepresent.selectedRight = null;
    }
}

function htRepresentCheckComplete() {
    if (Object.keys(localRepresent.matched).length != localRepresent.values.length) {
        return;
    }

    var nextBtn = $("#representNextLevel");
    if (localRepresent.level >= HT_REPRESENT_MAX_LEVEL) {
        $("#representCongratsMsg").show();
        nextBtn.text($("#representWordPlayAgain").text());
    } else {
        $("#representCompleteMsg").show();
        nextBtn.text($("#representWordNextLevel").text());
    }
    nextBtn.show();
}

function htLoadContent() {
    localRepresent = { "level": 1, "matched": {}, "selectedLeft": null, "selectedRight": null, "values": [] };

    $("#representReset").off("click").on("click", function() {
        htRepresentBuild();
    });

    $("#representNextLevel").off("click").on("click", function() {
        if (localRepresent.level >= HT_REPRESENT_MAX_LEVEL) {
            localRepresent.level = 1;
        } else {
            localRepresent.level++;
        }
        htRepresentBuild();
    });

    htRepresentBuild();

    htWriteNavigation();

    return false;
}
