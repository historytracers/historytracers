// SPDX-License-Identifier: GPL-3.0-or-later

// "Multiplying with Groups (0 to 3)" (content f641941e-55f0-40dd-a05f-81392b23cacd).
// Two-column matching game: the left column shows a multiplication and the right
// column shows its result together with groups of characters. The first factor is
// the number of characters inside each rectangle and the second factor is the
// number of rectangles, so 2 x 4 is drawn as four rectangles with two characters.
// Localized texts live in the class JSON, so this file only wires the behavior.

var localMultGroup = {};

var HT_MULT_GROUP_MAX_LEVEL = 3;
var HT_MULT_GROUP_MAX_MULTIPLIER = 10;

function htMultGroupIcons() {
    return [ "🐶", "🐱", "🍎", "⭐", "🔺" ];
}

// Level 1 has one multiplication by 0 and two by 1; levels 2 and 3 have two
// multiplications by 2 and by 3, respectively.
function htMultGroupFactors(level) {
    if (level === 1) {
        return [ 0, 1, 1 ];
    }
    if (level === 2) {
        return [ 2, 2 ];
    }
    return [ 3, 3 ];
}

function htMultGroupShuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        let j = htGetRandomArbitrary(0, i + 1);
        let tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
    }
    return items;
}

// Multipliers are distinct so that every result in a level is different.
function htMultGroupMultipliers(count) {
    var pool = [];
    for (let i = 1; i <= HT_MULT_GROUP_MAX_MULTIPLIER; i++) {
        pool.push(i);
    }
    htMultGroupShuffle(pool);
    return pool.slice(0, count);
}

function htMultGroupExpression(pair) {
    return pair.first + " × " + pair.second;
}

// One rectangle holds as many characters as the first factor and there are as
// many rectangles as the second factor. A multiplication by 0 draws no group at
// all: only the result 0 is shown, because there is nothing to count.
function htMultGroupBoxes(pair, icon) {
    if (pair.first === 0) {
        return "";
    }

    var boxes = "";
    for (let g = 0; g < pair.second; g++) {
        var content = "";
        for (let i = 0; i < pair.first; i++) {
            content += "<span class=\"htMultGroupIcon\">" + icon + "</span>";
        }
        boxes += "<span class=\"htMultGroupBox\" aria-hidden=\"true\">" + content + "</span>";
    }
    return boxes;
}

function htMultGroupBuild() {
    $("#multGroupLevelDone").hide();
    $("#multGroupAllDone").hide();
    $("#multGroupNextLevel").hide();
    $("#multGroupFeedback").hide().html("");

    localMultGroup.matched = {};
    localMultGroup.selectedLeft = null;
    localMultGroup.selectedRight = null;

    var factors = htMultGroupFactors(localMultGroup.level);
    var multipliers = htMultGroupMultipliers(factors.length);
    localMultGroup.pairs = [];
    for (let i = 0; i < factors.length; i++) {
        localMultGroup.pairs.push({
            "first": factors[i],
            "second": multipliers[i],
            "result": factors[i] * multipliers[i]
        });
    }

    var icon = htMultGroupIcons()[htGetRandomArbitrary(0, htMultGroupIcons().length)];

    var leftItems = [];
    var rightItems = [];
    for (let i = 0; i < localMultGroup.pairs.length; i++) {
        leftItems.push({ "id": i, "html": htMultGroupExpression(localMultGroup.pairs[i]) });
        rightItems.push({ "id": i, "html": htMultGroupBoxes(localMultGroup.pairs[i], icon) });
    }
    htMultGroupShuffle(leftItems);
    htMultGroupShuffle(rightItems);

    var leftHtml = "";
    for (let i = 0; i < leftItems.length; i++) {
        leftHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupExprBtn\" id=\"multGroupLeft" + leftItems[i].id + "\" data-id=\"" + leftItems[i].id + "\" onclick=\"htMultGroupSelect('Left', " + leftItems[i].id + ");\">" + leftItems[i].html + "</button>";
    }
    var rightHtml = "";
    for (let i = 0; i < rightItems.length; i++) {
        var pair = localMultGroup.pairs[rightItems[i].id];
        var groups = rightItems[i].html === "" ? "" : "<span class=\"htMultGroupsWrap\">" + rightItems[i].html + "</span>";
        rightHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupResultBtn\" id=\"multGroupRight" + rightItems[i].id + "\" data-id=\"" + rightItems[i].id + "\" aria-label=\"" + pair.result + "\" onclick=\"htMultGroupSelect('Right', " + rightItems[i].id + ");\"><span class=\"htMultGroupValue\">" + pair.result + "</span>" + groups + "</button>";
    }
    $("#multGroupLeftCol").html(leftHtml);
    $("#multGroupRightCol").html(rightHtml);

    var levelWord = $("#multGroupWordLevel").text();
    $("#multGroupLevel").text(levelWord + " " + localMultGroup.level + "/" + HT_MULT_GROUP_MAX_LEVEL);
}

function htMultGroupSelect(side, id) {
    if (localMultGroup.matched[id]) {
        return false;
    }

    $("#multGroupFeedback").hide().html("");

    if (side == "Left") {
        if (localMultGroup.selectedLeft != null) {
            $("#multGroupLeft" + localMultGroup.selectedLeft).removeClass("orderGameBtnSelected");
        }
        localMultGroup.selectedLeft = id;
    } else {
        if (localMultGroup.selectedRight != null) {
            $("#multGroupRight" + localMultGroup.selectedRight).removeClass("orderGameBtnSelected");
        }
        localMultGroup.selectedRight = id;
    }

    $("#multGroup" + side + id).addClass("orderGameBtnSelected");

    htMultGroupEvaluatePair();
    return false;
}

function htMultGroupEvaluatePair() {
    var leftId = localMultGroup.selectedLeft;
    var rightId = localMultGroup.selectedRight;
    if (leftId == null || rightId == null) {
        return;
    }

    if (leftId === rightId) {
        localMultGroup.matched[leftId] = true;
        $("#multGroupLeft" + leftId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        $("#multGroupRight" + rightId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        localMultGroup.selectedLeft = null;
        localMultGroup.selectedRight = null;
        htMultGroupCheckComplete();
    } else {
        var message = $("#multGroupWordWrongPair").text()
            .split("%RESULT%").join(localMultGroup.pairs[rightId].result)
            .split("%EXPRESSION%").join(htMultGroupExpression(localMultGroup.pairs[leftId]));
        $("#multGroupFeedback").html(message).show();
        $("#multGroupLeft" + leftId).removeClass("orderGameBtnSelected");
        $("#multGroupRight" + rightId).removeClass("orderGameBtnSelected");
        localMultGroup.selectedLeft = null;
        localMultGroup.selectedRight = null;
    }
}

function htMultGroupCheckComplete() {
    if (Object.keys(localMultGroup.matched).length != localMultGroup.pairs.length) {
        return;
    }

    var nextBtn = $("#multGroupNextLevel");
    if (localMultGroup.level >= HT_MULT_GROUP_MAX_LEVEL) {
        $("#multGroupAllDone").show();
        nextBtn.text($("#multGroupWordPlayAgain").text());
    } else {
        $("#multGroupLevelDone").show();
        nextBtn.text($("#multGroupWordNextLevel").text());
    }
    nextBtn.show();
}

function htLoadContent() {
    localMultGroup = { "level": 1, "pairs": [], "matched": {}, "selectedLeft": null, "selectedRight": null };

    $("#multGroupReset").off("click").on("click", function() {
        htMultGroupBuild();
    });

    $("#multGroupNextLevel").off("click").on("click", function() {
        if (localMultGroup.level >= HT_MULT_GROUP_MAX_LEVEL) {
            localMultGroup.level = 1;
        } else {
            localMultGroup.level++;
        }
        htMultGroupBuild();
    });

    htMultGroupBuild();

    htWriteNavigation();

    return false;
}
