// SPDX-License-Identifier: GPL-3.0-or-later

// "Matching the Tables of 2 and 4" (content f2f9f038-8cb2-442e-a764-6923d90e7f95).
// Two-column matching game that makes the relationship between the
// multiplication tables of 2 and 4 visible: the left column shows an equality
// like 2 x 6 = 4 x 3 and the right column shows its result together with
// groups of characters drawn as rectangles with four characters each, so the
// picture matches the 4 x Z side of the equality. Multiplying by 4 is the same
// as multiplying by 2 twice, so every result of the table of 4 is also a
// result of the table of 2 with the double of the multiplier.
// Localized texts live in the class JSON, so this file only wires the behavior.
// The groups are drawn with the same objects used by the multiplication tables
// (htMultiplicationTableObjects in ht_math.js): a selector above the game lets
// the user pick one of them or keep the default random choice.

var localMultGroupEq = {};

var HT_MULT_GROUP_EQ_MAX_LEVEL = 3;
// Selector value for the default behavior: a random object from
// htMultiplicationTableObjects in every new exercise.
var HT_MULT_GROUP_EQ_RANDOM_OBJECT = -1;

// Returns the draw HTML of the drawing object for the groups: the one chosen
// in the selector, or a random one from the same set used by the
// multiplication tables when the user keeps the random option.
function htMultGroupEqObjectDraw() {
    if (localMultGroupEq.objectIndex >= 0 && localMultGroupEq.objectIndex < htMultiplicationTableObjects.length) {
        return htMultiplicationTableObjects[localMultGroupEq.objectIndex].draw;
    }
    return htMultiplicationTableObjects[htGetRandomArbitrary(0, htMultiplicationTableObjects.length)].draw;
}

// Level 1 covers the first half of the table of 4 (results 4 to 12), level 2
// the second half (results 16 to 24) and level 3 mixes both halves. Each entry
// is the multiplier Z of the 4 x Z side of the equality; the 2 x N side uses
// N = 2 x Z, so the two products are always equal.
function htMultGroupEqZPool(level) {
    if (level === 1) {
        return [ 1, 2, 3 ];
    }
    if (level === 2) {
        return [ 4, 5, 6 ];
    }
    return [ 2, 3, 4, 5, 6 ];
}

function htMultGroupEqShuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        let j = htGetRandomArbitrary(0, i + 1);
        let tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
    }
    return items;
}

// The two equalities of a level use distinct Zs so that every result on the
// right column is different.
function htMultGroupEqPairs(level) {
    var pool = htMultGroupEqShuffle(htMultGroupEqZPool(level));
    var pairs = [];
    for (let i = 0; i < 2; i++) {
        pairs.push({
            "twice": 2 * pool[i],
            "quad": pool[i],
            "result": 4 * pool[i]
        });
    }
    return pairs;
}

function htMultGroupEqExpression(pair) {
    return "2 × " + pair.twice + " = 4 × " + pair.quad;
}

// The groups follow the same rule as the other group games: one rectangle
// holds as many characters as the first factor of the drawn side and there are
// as many rectangles as the second factor. Here the drawn side is 4 x Z, so
// every rectangle holds four characters and there are Z rectangles.
function htMultGroupEqBoxes(pair, icon) {
    var boxes = "";
    for (let g = 0; g < pair.quad; g++) {
        var content = "";
        for (let i = 0; i < 4; i++) {
            content += "<span class=\"htMultGroupIcon\">" + icon + "</span>";
        }
        boxes += "<span class=\"htMultGroupBox\" aria-hidden=\"true\">" + content + "</span>";
    }
    return boxes;
}

function htMultGroupEqBuild() {
    $("#multGroupEqLevelDone").hide();
    $("#multGroupEqAllDone").hide();
    $("#multGroupEqNextLevel").hide();
    $("#multGroupEqFeedback").hide().html("");

    localMultGroupEq.matched = {};
    localMultGroupEq.selectedLeft = null;
    localMultGroupEq.selectedRight = null;

    localMultGroupEq.pairs = htMultGroupEqPairs(localMultGroupEq.level);

    localMultGroupEq.icon = htMultGroupEqObjectDraw();

    var levelWord = $("#multGroupEqWordLevel").text();
    $("#multGroupEqLevel").text(levelWord + " " + localMultGroupEq.level + "/" + HT_MULT_GROUP_EQ_MAX_LEVEL);

    htMultGroupEqRender();
}

// Draws the two columns for the current pairs. Called by htMultGroupEqBuild and
// again when the user picks another drawing object, so switching the image
// keeps the pairs and the already matched buttons of the level.
function htMultGroupEqRender() {
    $("#multGroupEqFeedback").hide().html("");
    localMultGroupEq.selectedLeft = null;
    localMultGroupEq.selectedRight = null;

    var icon = localMultGroupEq.icon;

    var leftItems = [];
    var rightItems = [];
    for (let i = 0; i < localMultGroupEq.pairs.length; i++) {
        leftItems.push({ "id": i, "html": htMultGroupEqExpression(localMultGroupEq.pairs[i]) });
        rightItems.push({ "id": i, "html": htMultGroupEqBoxes(localMultGroupEq.pairs[i], icon) });
    }
    htMultGroupEqShuffle(leftItems);
    htMultGroupEqShuffle(rightItems);

    var leftHtml = "";
    for (let i = 0; i < leftItems.length; i++) {
        var matchedClass = localMultGroupEq.matched[leftItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroupEq.matched[leftItems[i].id] ? " disabled" : "";
        leftHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupExprBtn" + matchedClass + "\" id=\"multGroupEqLeft" + leftItems[i].id + "\" data-id=\"" + leftItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroupEqSelect('Left', " + leftItems[i].id + ");\">" + leftItems[i].html + "</button>";
    }
    var rightHtml = "";
    for (let i = 0; i < rightItems.length; i++) {
        var pair = localMultGroupEq.pairs[rightItems[i].id];
        var matchedClass = localMultGroupEq.matched[rightItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroupEq.matched[rightItems[i].id] ? " disabled" : "";
        var groups = rightItems[i].html === "" ? "" : "<span class=\"htMultGroupsWrap\">" + rightItems[i].html + "</span>";
        rightHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupResultBtn" + matchedClass + "\" id=\"multGroupEqRight" + rightItems[i].id + "\" data-id=\"" + rightItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroupEqSelect('Right', " + rightItems[i].id + ");\"><span class=\"htMultGroupValue\">" + pair.result + "</span>" + groups + "</button>";
    }
    $("#multGroupEqLeftCol").html(leftHtml);
    $("#multGroupEqRightCol").html(rightHtml);

    // The groups are decorative for sighted users, so the accessible name must
    // also describe them: "12. Groups: 3. Characters per group: 4."
    var groupWord = $("#multGroupEqWordGroups").text();
    for (let i = 0; i < rightItems.length; i++) {
        var labelPair = localMultGroupEq.pairs[rightItems[i].id];
        var groupDescription = groupWord
            .split("%COUNT%").join(labelPair.quad)
            .split("%SIZE%").join(4);
        $("#multGroupEqRight" + rightItems[i].id).attr("aria-label", labelPair.result + ". " + groupDescription);
    }
}

// Fills the drawing-object selector with the random option followed by every
// object used by the multiplication tables (htMultiplicationTableObjects in
// ht_math.js), preselecting the current choice.
function htMultGroupEqFillObjectSelector() {
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 78) ? mathKeywords[78] : "";
    var text = "<option value=\"" + HT_MULT_GROUP_EQ_RANDOM_OBJECT + "\"" + (localMultGroupEq.objectIndex === HT_MULT_GROUP_EQ_RANDOM_OBJECT ? " selected" : "") + ">" + $("#multGroupEqWordRandom").text() + "</option>";
    for (let i = 0; i < htMultiplicationTableObjects.length; i++) {
        text += "<option value=\"" + i + "\"" + (localMultGroupEq.objectIndex === i ? " selected" : "") + ">" + htMultiplicationTableObjects[i].option + "</option>";
    }
    $("#multGroupEqSelect").html(text).attr("aria-label", label).attr("title", label);
}

function htMultGroupEqSelect(side, id) {
    if (localMultGroupEq.matched[id]) {
        return false;
    }

    $("#multGroupEqFeedback").hide().html("");

    if (side == "Left") {
        if (localMultGroupEq.selectedLeft != null) {
            $("#multGroupEqLeft" + localMultGroupEq.selectedLeft).removeClass("orderGameBtnSelected");
        }
        localMultGroupEq.selectedLeft = id;
    } else {
        if (localMultGroupEq.selectedRight != null) {
            $("#multGroupEqRight" + localMultGroupEq.selectedRight).removeClass("orderGameBtnSelected");
        }
        localMultGroupEq.selectedRight = id;
    }

    $("#multGroupEq" + side + id).addClass("orderGameBtnSelected");

    htMultGroupEqEvaluatePair();
    return false;
}

function htMultGroupEqEvaluatePair() {
    var leftId = localMultGroupEq.selectedLeft;
    var rightId = localMultGroupEq.selectedRight;
    if (leftId == null || rightId == null) {
        return;
    }

    if (leftId === rightId) {
        localMultGroupEq.matched[leftId] = true;
        $("#multGroupEqLeft" + leftId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        $("#multGroupEqRight" + rightId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        localMultGroupEq.selectedLeft = null;
        localMultGroupEq.selectedRight = null;
        htMultGroupEqCheckComplete();
    } else {
        var message = $("#multGroupEqWordWrongPair").text()
            .split("%RESULT%").join(localMultGroupEq.pairs[rightId].result)
            .split("%EXPRESSION%").join(htMultGroupEqExpression(localMultGroupEq.pairs[leftId]));
        $("#multGroupEqFeedback").text(message).show();
        $("#multGroupEqLeft" + leftId).removeClass("orderGameBtnSelected");
        $("#multGroupEqRight" + rightId).removeClass("orderGameBtnSelected");
        localMultGroupEq.selectedLeft = null;
        localMultGroupEq.selectedRight = null;
    }
}

function htMultGroupEqCheckComplete() {
    if (Object.keys(localMultGroupEq.matched).length != localMultGroupEq.pairs.length) {
        return;
    }

    var nextBtn = $("#multGroupEqNextLevel");
    if (localMultGroupEq.level >= HT_MULT_GROUP_EQ_MAX_LEVEL) {
        $("#multGroupEqAllDone").show();
        nextBtn.text($("#multGroupEqWordPlayAgain").text());
    } else {
        $("#multGroupEqLevelDone").show();
        nextBtn.text($("#multGroupEqWordNextLevel").text());
    }
    nextBtn.show();
}

function htLoadContent() {
    localMultGroupEq = { "level": 1, "pairs": [], "matched": {}, "selectedLeft": null, "selectedRight": null, "objectIndex": HT_MULT_GROUP_EQ_RANDOM_OBJECT, "icon": "" };

    htMultGroupEqFillObjectSelector();
    $("#multGroupEqSelect").off("change").on("change", function() {
        var idx = parseInt($(this).val(), 10);
        if (isNaN(idx) || idx < 0 || idx >= htMultiplicationTableObjects.length) {
            idx = HT_MULT_GROUP_EQ_RANDOM_OBJECT;
        }
        localMultGroupEq.objectIndex = idx;
        // A specific object redraws the groups right away, keeping the pairs
        // and the matched buttons; the random option keeps the current drawing
        // until the next exercise is built.
        if (idx !== HT_MULT_GROUP_EQ_RANDOM_OBJECT) {
            localMultGroupEq.icon = htMultGroupEqObjectDraw();
            htMultGroupEqRender();
        }
        return false;
    });

    $("#multGroupEqReset").off("click").on("click", function() {
        htMultGroupEqBuild();
    });

    $("#multGroupEqNextLevel").off("click").on("click", function() {
        if (localMultGroupEq.level >= HT_MULT_GROUP_EQ_MAX_LEVEL) {
            localMultGroupEq.level = 1;
        } else {
            localMultGroupEq.level++;
        }
        htMultGroupEqBuild();
    });

    htMultGroupEqBuild();

    htWriteNavigation();

    return false;
}
