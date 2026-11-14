// SPDX-License-Identifier: GPL-3.0-or-later

// "Multiplying with Groups (0 to 3)" (content f641941e-55f0-40dd-a05f-81392b23cacd).
// Two-column matching game: the left column shows a multiplication and the right
// column shows its result together with groups of characters. The first factor is
// the number of characters inside each rectangle and the second factor is the
// number of rectangles, so 2 x 4 is drawn as four rectangles with two characters.
// Localized texts live in the class JSON, so this file only wires the behavior.
// The groups are drawn with the same objects used by the multiplication tables
// (htMultiplicationTableObjects in ht_math.js): a selector above the game lets
// the user pick one of them or keep the default random choice.

var localMultGroup = {};

var HT_MULT_GROUP_MAX_LEVEL = 3;
var HT_MULT_GROUP_MAX_MULTIPLIER = 10;
// Selector value for the default behavior: a random object from
// htMultiplicationTableObjects in every new exercise.
var HT_MULT_GROUP_RANDOM_OBJECT = -1;

// Returns the draw HTML of the drawing object for the groups: the one chosen
// in the selector, or a random one from the same set used by the
// multiplication tables when the user keeps the random option.
function htMultGroupObjectDraw() {
    if (localMultGroup.objectIndex >= 0 && localMultGroup.objectIndex < htMultiplicationTableObjects.length) {
        return htMultiplicationTableObjects[localMultGroup.objectIndex].draw;
    }
    return htMultiplicationTableObjects[htGetRandomArbitrary(0, htMultiplicationTableObjects.length)].draw;
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

    localMultGroup.icon = htMultGroupObjectDraw();

    var levelWord = $("#multGroupWordLevel").text();
    $("#multGroupLevel").text(levelWord + " " + localMultGroup.level + "/" + HT_MULT_GROUP_MAX_LEVEL);

    htMultGroupRender();
}

// Draws the two columns for the current pairs. Called by htMultGroupBuild and
// again when the user picks another drawing object, so switching the image
// keeps the pairs and the already matched buttons of the level.
function htMultGroupRender() {
    $("#multGroupFeedback").hide().html("");
    localMultGroup.selectedLeft = null;
    localMultGroup.selectedRight = null;

    var icon = localMultGroup.icon;

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
        var matchedClass = localMultGroup.matched[leftItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroup.matched[leftItems[i].id] ? " disabled" : "";
        leftHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupExprBtn" + matchedClass + "\" id=\"multGroupLeft" + leftItems[i].id + "\" data-id=\"" + leftItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroupSelect('Left', " + leftItems[i].id + ");\">" + leftItems[i].html + "</button>";
    }
    var rightHtml = "";
    for (let i = 0; i < rightItems.length; i++) {
        var pair = localMultGroup.pairs[rightItems[i].id];
        var matchedClass = localMultGroup.matched[rightItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroup.matched[rightItems[i].id] ? " disabled" : "";
        var groups = rightItems[i].html === "" ? "" : "<span class=\"htMultGroupsWrap\">" + rightItems[i].html + "</span>";
        rightHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupResultBtn" + matchedClass + "\" id=\"multGroupRight" + rightItems[i].id + "\" data-id=\"" + rightItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroupSelect('Right', " + rightItems[i].id + ");\"><span class=\"htMultGroupValue\">" + pair.result + "</span>" + groups + "</button>";
    }
    $("#multGroupLeftCol").html(leftHtml);
    $("#multGroupRightCol").html(rightHtml);

    // The groups are decorative for sighted users, so the accessible name must
    // also describe them: "10. Groups: 2. Characters per group: 5."
    var groupWord = $("#multGroupWordGroups").text();
    var noGroupsWord = $("#multGroupWordNoGroups").text();
    for (let i = 0; i < rightItems.length; i++) {
        var labelPair = localMultGroup.pairs[rightItems[i].id];
        var groupDescription = noGroupsWord;
        if (labelPair.first > 0) {
            groupDescription = groupWord
                .split("%COUNT%").join(labelPair.second)
                .split("%SIZE%").join(labelPair.first);
        }
        $("#multGroupRight" + rightItems[i].id).attr("aria-label", labelPair.result + ". " + groupDescription);
    }
}

// Fills the drawing-object selector with the random option followed by every
// object used by the multiplication tables (htMultiplicationTableObjects in
// ht_math.js), preselecting the current choice.
function htMultGroupFillObjectSelector() {
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 78) ? mathKeywords[78] : "";
    var select = $("#multGroupSelect");
    select.empty();
    select.append($("<option>").val(HT_MULT_GROUP_RANDOM_OBJECT).prop("selected", localMultGroup.objectIndex === HT_MULT_GROUP_RANDOM_OBJECT).text($("#multGroupWordRandom").text()));
    for (let i = 0; i < htMultiplicationTableObjects.length; i++) {
        select.append($("<option>").val(i).prop("selected", localMultGroup.objectIndex === i).text(htMultiplicationTableObjects[i].option));
    }
    select.attr("aria-label", label).attr("title", label);
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
        $("#multGroupFeedback").text(message).show();
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
    localMultGroup = { "level": 1, "pairs": [], "matched": {}, "selectedLeft": null, "selectedRight": null, "objectIndex": HT_MULT_GROUP_RANDOM_OBJECT, "icon": "" };

    htMultGroupFillObjectSelector();
    $("#multGroupSelect").off("change").on("change", function() {
        var idx = parseInt($(this).val(), 10);
        if (isNaN(idx) || idx < 0 || idx >= htMultiplicationTableObjects.length) {
            idx = HT_MULT_GROUP_RANDOM_OBJECT;
        }
        localMultGroup.objectIndex = idx;
        // A specific object redraws the groups right away, keeping the pairs
        // and the matched buttons; the random option keeps the current drawing
        // until the next exercise is built.
        if (idx !== HT_MULT_GROUP_RANDOM_OBJECT) {
            localMultGroup.icon = htMultGroupObjectDraw();
            htMultGroupRender();
        }
        return false;
    });

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
