// SPDX-License-Identifier: GPL-3.0-or-later

// "Matching the Tables of 2, 3 and 6" (content 3eb7337a-bbb3-4115-8467-e8b8023a9811).
// Two-column matching game that makes the relationships between the
// multiplication tables of 2, 3 and 6 visible: the left column shows an
// equality like 2 x 6 = 6 x 2 (multiplying by 6 is adding three copies of the
// product obtained by multiplying by 2) or 3 x 4 = 6 x 2 (it is also adding
// two copies of the product obtained by multiplying by 3),
// and the right column shows its result together with groups of characters
// drawn as rectangles with six characters each, so the picture matches the
// 6 x Z side of the equality. Levels 1 and 2 practice the table of 2 against
// the table of 6 and levels 3 and 4 the table of 3 against the table of 6.
// Localized texts live in the class JSON, so this file only wires the behavior.
// The groups are drawn with the same objects used by the multiplication tables
// (htMultiplicationTableObjects in ht_math.js): a selector above the game lets
// the user pick one of them or keep the default random choice.

var localMultGroupEq6 = {};

var HT_MULT_GROUP_EQ6_MAX_LEVEL = 4;
// Selector value for the default behavior: a random object from
// htMultiplicationTableObjects in every new exercise.
var HT_MULT_GROUP_EQ6_RANDOM_OBJECT = -1;

// Returns the draw HTML of the drawing object for the groups: the one chosen
// in the selector, or a random one from the same set used by the
// multiplication tables when the user keeps the random option.
function htMultGroupEq6ObjectDraw() {
    if (localMultGroupEq6.objectIndex >= 0 && localMultGroupEq6.objectIndex < htMultiplicationTableObjects.length) {
        return htMultiplicationTableObjects[localMultGroupEq6.objectIndex].draw;
    }
    return htMultiplicationTableObjects[htGetRandomArbitrary(0, htMultiplicationTableObjects.length)].draw;
}

// Levels 1 and 2 relate the table of 2 with the table of 6 and levels 3 and 4
// relate the table of 3 with the table of 6. Each entry is the multiplier Z of
// the 6 x Z side of the equality; the other side uses the triple of Z
// (2 x 3Z = 6Z) or the double of Z (3 x 2Z = 6Z). Levels 1 and 3 cover the
// first half of the table of 6 (results 6 to 18) and levels 2 and 4 the second
// half (results 24 to 36).
function htMultGroupEq6LevelKind(level) {
    return (level === 1 || level === 2) ? 2 : 3;
}

function htMultGroupEq6ZPool(level) {
    if (level === 1 || level === 3) {
        return [ 1, 2, 3 ];
    }
    return [ 4, 5, 6 ];
}

function htMultGroupEq6Shuffle(items) {
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
function htMultGroupEq6Pairs(level) {
    var kind = htMultGroupEq6LevelKind(level);
    var pool = htMultGroupEq6Shuffle(htMultGroupEq6ZPool(level));
    var pairs = [];
    for (let i = 0; i < 2; i++) {
        pairs.push({
            "factor": kind,
            "other": (6 / kind) * pool[i],
            "six": pool[i],
            "result": 6 * pool[i]
        });
    }
    return pairs;
}

function htMultGroupEq6Expression(pair) {
    return pair.factor + " × " + pair.other + " = 6 × " + pair.six;
}

// The groups follow the same rule as the other group games: one rectangle
// holds as many characters as the first factor of the drawn side and there are
// as many rectangles as the second factor. Here the drawn side is 6 x Z, so
// every rectangle holds six characters and there are Z rectangles.
function htMultGroupEq6Boxes(pair, icon) {
    var boxes = "";
    for (let g = 0; g < pair.six; g++) {
        var content = "";
        for (let i = 0; i < 6; i++) {
            content += "<span class=\"htMultGroupIcon\">" + icon + "</span>";
        }
        boxes += "<span class=\"htMultGroupBox\" aria-hidden=\"true\">" + content + "</span>";
    }
    return boxes;
}

function htMultGroupEq6Build() {
    $("#multGroupEq6LevelDone").hide();
    $("#multGroupEq6AllDone").hide();
    $("#multGroupEq6NextLevel").hide();
    $("#multGroupEq6Feedback").hide().html("");

    localMultGroupEq6.matched = {};
    localMultGroupEq6.selectedLeft = null;
    localMultGroupEq6.selectedRight = null;

    localMultGroupEq6.pairs = htMultGroupEq6Pairs(localMultGroupEq6.level);

    localMultGroupEq6.icon = htMultGroupEq6ObjectDraw();

    var levelWord = $("#multGroupEq6WordLevel").text();
    $("#multGroupEq6Level").text(levelWord + " " + localMultGroupEq6.level + "/" + HT_MULT_GROUP_EQ6_MAX_LEVEL);

    htMultGroupEq6Render();
}

// Draws the two columns for the current pairs. Called by htMultGroupEq6Build and
// again when the user picks another drawing object, so switching the image
// keeps the pairs and the already matched buttons of the level.
function htMultGroupEq6Render() {
    $("#multGroupEq6Feedback").hide().html("");
    localMultGroupEq6.selectedLeft = null;
    localMultGroupEq6.selectedRight = null;

    var icon = localMultGroupEq6.icon;

    var leftItems = [];
    var rightItems = [];
    for (let i = 0; i < localMultGroupEq6.pairs.length; i++) {
        leftItems.push({ "id": i, "html": htMultGroupEq6Expression(localMultGroupEq6.pairs[i]) });
        rightItems.push({ "id": i, "html": htMultGroupEq6Boxes(localMultGroupEq6.pairs[i], icon) });
    }
    htMultGroupEq6Shuffle(leftItems);
    htMultGroupEq6Shuffle(rightItems);

    var leftHtml = "";
    for (let i = 0; i < leftItems.length; i++) {
        var matchedClass = localMultGroupEq6.matched[leftItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroupEq6.matched[leftItems[i].id] ? " disabled" : "";
        leftHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupExprBtn" + matchedClass + "\" id=\"multGroupEq6Left" + leftItems[i].id + "\" data-id=\"" + leftItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroupEq6Select('Left', " + leftItems[i].id + ");\">" + leftItems[i].html + "</button>";
    }
    var rightHtml = "";
    for (let i = 0; i < rightItems.length; i++) {
        var pair = localMultGroupEq6.pairs[rightItems[i].id];
        var matchedClass = localMultGroupEq6.matched[rightItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroupEq6.matched[rightItems[i].id] ? " disabled" : "";
        var groups = rightItems[i].html === "" ? "" : "<span class=\"htMultGroupsWrap\">" + rightItems[i].html + "</span>";
        rightHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupResultBtn" + matchedClass + "\" id=\"multGroupEq6Right" + rightItems[i].id + "\" data-id=\"" + rightItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroupEq6Select('Right', " + rightItems[i].id + ");\"><span class=\"htMultGroupValue\">" + pair.result + "</span>" + groups + "</button>";
    }
    $("#multGroupEq6LeftCol").html(leftHtml);
    $("#multGroupEq6RightCol").html(rightHtml);

    // The groups are decorative for sighted users, so the accessible name must
    // also describe them: "12. Groups: 2. Characters per group: 6."
    var groupWord = $("#multGroupEq6WordGroups").text();
    for (let i = 0; i < rightItems.length; i++) {
        var labelPair = localMultGroupEq6.pairs[rightItems[i].id];
        var groupDescription = groupWord
            .split("%COUNT%").join(labelPair.six)
            .split("%SIZE%").join(6);
        $("#multGroupEq6Right" + rightItems[i].id).attr("aria-label", labelPair.result + ". " + groupDescription);
    }
}

// Fills the drawing-object selector with the random option followed by every
// object used by the multiplication tables (htMultiplicationTableObjects in
// ht_math.js), preselecting the current choice.
function htMultGroupEq6FillObjectSelector() {
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 78) ? mathKeywords[78] : "";
    var select = $("#multGroupEq6Select");
    select.empty();
    select.append($("<option>").val(HT_MULT_GROUP_EQ6_RANDOM_OBJECT).prop("selected", localMultGroupEq6.objectIndex === HT_MULT_GROUP_EQ6_RANDOM_OBJECT).text($("#multGroupEq6WordRandom").text()));
    for (let i = 0; i < htMultiplicationTableObjects.length; i++) {
        select.append($("<option>").val(i).prop("selected", localMultGroupEq6.objectIndex === i).text(htMultiplicationTableObjects[i].option));
    }
    select.attr("aria-label", label).attr("title", label);
}

function htMultGroupEq6Select(side, id) {
    if (localMultGroupEq6.matched[id]) {
        return false;
    }

    $("#multGroupEq6Feedback").hide().html("");

    if (side == "Left") {
        if (localMultGroupEq6.selectedLeft != null) {
            $("#multGroupEq6Left" + localMultGroupEq6.selectedLeft).removeClass("orderGameBtnSelected");
        }
        localMultGroupEq6.selectedLeft = id;
    } else {
        if (localMultGroupEq6.selectedRight != null) {
            $("#multGroupEq6Right" + localMultGroupEq6.selectedRight).removeClass("orderGameBtnSelected");
        }
        localMultGroupEq6.selectedRight = id;
    }

    $("#multGroupEq6" + side + id).addClass("orderGameBtnSelected");

    htMultGroupEq6EvaluatePair();
    return false;
}

function htMultGroupEq6EvaluatePair() {
    var leftId = localMultGroupEq6.selectedLeft;
    var rightId = localMultGroupEq6.selectedRight;
    if (leftId == null || rightId == null) {
        return;
    }

    if (leftId === rightId) {
        localMultGroupEq6.matched[leftId] = true;
        $("#multGroupEq6Left" + leftId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        $("#multGroupEq6Right" + rightId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        localMultGroupEq6.selectedLeft = null;
        localMultGroupEq6.selectedRight = null;
        htMultGroupEq6CheckComplete();
    } else {
        var message = $("#multGroupEq6WordWrongPair").text()
            .split("%RESULT%").join(localMultGroupEq6.pairs[rightId].result)
            .split("%EXPRESSION%").join(htMultGroupEq6Expression(localMultGroupEq6.pairs[leftId]));
        $("#multGroupEq6Feedback").text(message).show();
        $("#multGroupEq6Left" + leftId).removeClass("orderGameBtnSelected");
        $("#multGroupEq6Right" + rightId).removeClass("orderGameBtnSelected");
        localMultGroupEq6.selectedLeft = null;
        localMultGroupEq6.selectedRight = null;
    }
}

function htMultGroupEq6CheckComplete() {
    if (Object.keys(localMultGroupEq6.matched).length != localMultGroupEq6.pairs.length) {
        return;
    }

    var nextBtn = $("#multGroupEq6NextLevel");
    if (localMultGroupEq6.level >= HT_MULT_GROUP_EQ6_MAX_LEVEL) {
        $("#multGroupEq6AllDone").show();
        nextBtn.text($("#multGroupEq6WordPlayAgain").text());
    } else {
        $("#multGroupEq6LevelDone").show();
        nextBtn.text($("#multGroupEq6WordNextLevel").text());
    }
    nextBtn.show();
}

function htLoadContent() {
    localMultGroupEq6 = { "level": 1, "pairs": [], "matched": {}, "selectedLeft": null, "selectedRight": null, "objectIndex": HT_MULT_GROUP_EQ6_RANDOM_OBJECT, "icon": "" };

    htMultGroupEq6FillObjectSelector();
    $("#multGroupEq6Select").off("change").on("change", function() {
        var idx = parseInt($(this).val(), 10);
        if (isNaN(idx) || idx < 0 || idx >= htMultiplicationTableObjects.length) {
            idx = HT_MULT_GROUP_EQ6_RANDOM_OBJECT;
        }
        localMultGroupEq6.objectIndex = idx;
        // A specific object redraws the groups right away, keeping the pairs
        // and the matched buttons; the random option keeps the current drawing
        // until the next exercise is built.
        if (idx !== HT_MULT_GROUP_EQ6_RANDOM_OBJECT) {
            localMultGroupEq6.icon = htMultGroupEq6ObjectDraw();
            htMultGroupEq6Render();
        }
        return false;
    });

    $("#multGroupEq6Reset").off("click").on("click", function() {
        htMultGroupEq6Build();
    });

    $("#multGroupEq6NextLevel").off("click").on("click", function() {
        if (localMultGroupEq6.level >= HT_MULT_GROUP_EQ6_MAX_LEVEL) {
            localMultGroupEq6.level = 1;
        } else {
            localMultGroupEq6.level++;
        }
        htMultGroupEq6Build();
    });

    htMultGroupEq6Build();

    htWriteNavigation();

    return false;
}
