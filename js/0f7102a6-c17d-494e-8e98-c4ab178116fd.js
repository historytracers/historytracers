// SPDX-License-Identifier: GPL-3.0-or-later

// "Multiplying with Groups (4 to 7)" (content 0f7102a6-c17d-494e-8e98-c4ab178116fd).
// Two-column matching game: the left column shows a multiplication and the right
// column shows its result together with groups of characters. The first factor is
// the number of characters inside each rectangle and the second factor is the
// number of rectangles, so 4 x 6 is drawn as six rectangles with four characters.
// Localized texts live in the class JSON, so this file only wires the behavior.
// The groups are drawn with the same objects used by the multiplication tables
// (htMultiplicationTableObjects in ht_math.js): a selector above the game lets
// the user pick one of them or keep the default random choice.

var localMultGroup47 = {};

var HT_MULT_GROUP47_MAX_LEVEL = 4;
var HT_MULT_GROUP47_MAX_MULTIPLIER = 10;
// Selector value for the default behavior: a random object from
// htMultiplicationTableObjects in every new exercise.
var HT_MULT_GROUP47_RANDOM_OBJECT = -1;

// Returns the draw HTML of the drawing object for the groups: the one chosen
// in the selector, or a random one from the same set used by the
// multiplication tables when the user keeps the random option.
function htMultGroup47ObjectDraw() {
    if (localMultGroup47.objectIndex >= 0 && localMultGroup47.objectIndex < htMultiplicationTableObjects.length) {
        return htMultiplicationTableObjects[localMultGroup47.objectIndex].draw;
    }
    return htMultiplicationTableObjects[htGetRandomArbitrary(0, htMultiplicationTableObjects.length)].draw;
}

// Each level practices one times table: level 1 has two multiplications by 4,
// level 2 by 5, level 3 by 6 and level 4 by 7.
function htMultGroup47Factors(level) {
    if (level === 1) {
        return [ 4, 4 ];
    }
    if (level === 2) {
        return [ 5, 5 ];
    }
    if (level === 3) {
        return [ 6, 6 ];
    }
    return [ 7, 7 ];
}

function htMultGroup47Shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        let j = htGetRandomArbitrary(0, i + 1);
        let tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
    }
    return items;
}

// Multipliers are distinct so that every result in a level is different.
function htMultGroup47Multipliers(count) {
    var pool = [];
    for (let i = 1; i <= HT_MULT_GROUP47_MAX_MULTIPLIER; i++) {
        pool.push(i);
    }
    htMultGroup47Shuffle(pool);
    return pool.slice(0, count);
}

function htMultGroup47Expression(pair) {
    return pair.first + " × " + pair.second;
}

// One rectangle holds as many characters as the first factor and there are as
// many rectangles as the second factor.
function htMultGroup47Boxes(pair, icon) {
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

function htMultGroup47Build() {
    $("#multGroup47LevelDone").hide();
    $("#multGroup47AllDone").hide();
    $("#multGroup47NextLevel").hide();
    $("#multGroup47Feedback").hide().html("");

    localMultGroup47.matched = {};
    localMultGroup47.selectedLeft = null;
    localMultGroup47.selectedRight = null;

    var factors = htMultGroup47Factors(localMultGroup47.level);
    var multipliers = htMultGroup47Multipliers(factors.length);
    localMultGroup47.pairs = [];
    for (let i = 0; i < factors.length; i++) {
        localMultGroup47.pairs.push({
            "first": factors[i],
            "second": multipliers[i],
            "result": factors[i] * multipliers[i]
        });
    }

    localMultGroup47.icon = htMultGroup47ObjectDraw();

    var levelWord = $("#multGroup47WordLevel").text();
    $("#multGroup47Level").text(levelWord + " " + localMultGroup47.level + "/" + HT_MULT_GROUP47_MAX_LEVEL);

    htMultGroup47Render();
}

// Draws the two columns for the current pairs. Called by htMultGroup47Build and
// again when the user picks another drawing object, so switching the image
// keeps the pairs and the already matched buttons of the level.
function htMultGroup47Render() {
    $("#multGroup47Feedback").hide().html("");
    localMultGroup47.selectedLeft = null;
    localMultGroup47.selectedRight = null;

    var icon = localMultGroup47.icon;

    var leftItems = [];
    var rightItems = [];
    for (let i = 0; i < localMultGroup47.pairs.length; i++) {
        leftItems.push({ "id": i, "html": htMultGroup47Expression(localMultGroup47.pairs[i]) });
        rightItems.push({ "id": i, "html": htMultGroup47Boxes(localMultGroup47.pairs[i], icon) });
    }
    htMultGroup47Shuffle(leftItems);
    htMultGroup47Shuffle(rightItems);

    var leftHtml = "";
    for (let i = 0; i < leftItems.length; i++) {
        var matchedClass = localMultGroup47.matched[leftItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroup47.matched[leftItems[i].id] ? " disabled" : "";
        leftHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupExprBtn" + matchedClass + "\" id=\"multGroup47Left" + leftItems[i].id + "\" data-id=\"" + leftItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroup47Select('Left', " + leftItems[i].id + ");\">" + leftItems[i].html + "</button>";
    }
    var rightHtml = "";
    for (let i = 0; i < rightItems.length; i++) {
        var pair = localMultGroup47.pairs[rightItems[i].id];
        var matchedClass = localMultGroup47.matched[rightItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroup47.matched[rightItems[i].id] ? " disabled" : "";
        var groups = rightItems[i].html === "" ? "" : "<span class=\"htMultGroupsWrap\">" + rightItems[i].html + "</span>";
        rightHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupResultBtn" + matchedClass + "\" id=\"multGroup47Right" + rightItems[i].id + "\" data-id=\"" + rightItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroup47Select('Right', " + rightItems[i].id + ");\"><span class=\"htMultGroupValue\">" + pair.result + "</span>" + groups + "</button>";
    }
    $("#multGroup47LeftCol").html(leftHtml);
    $("#multGroup47RightCol").html(rightHtml);

    // The groups are decorative for sighted users, so the accessible name must
    // also describe them: "24. Groups: 6. Characters per group: 4."
    var groupWord = $("#multGroup47WordGroups").text();
    for (let i = 0; i < rightItems.length; i++) {
        var labelPair = localMultGroup47.pairs[rightItems[i].id];
        var groupDescription = groupWord
            .split("%COUNT%").join(labelPair.second)
            .split("%SIZE%").join(labelPair.first);
        $("#multGroup47Right" + rightItems[i].id).attr("aria-label", labelPair.result + ". " + groupDescription);
    }
}

// Fills the drawing-object selector with the random option followed by every
// object used by the multiplication tables (htMultiplicationTableObjects in
// ht_math.js), preselecting the current choice.
function htMultGroup47FillObjectSelector() {
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 78) ? mathKeywords[78] : "";
    var text = "<option value=\"" + HT_MULT_GROUP47_RANDOM_OBJECT + "\"" + (localMultGroup47.objectIndex === HT_MULT_GROUP47_RANDOM_OBJECT ? " selected" : "") + ">" + $("#multGroup47WordRandom").text() + "</option>";
    for (let i = 0; i < htMultiplicationTableObjects.length; i++) {
        text += "<option value=\"" + i + "\"" + (localMultGroup47.objectIndex === i ? " selected" : "") + ">" + htMultiplicationTableObjects[i].option + "</option>";
    }
    $("#multGroup47Select").html(text).attr("aria-label", label).attr("title", label);
}

function htMultGroup47Select(side, id) {
    if (localMultGroup47.matched[id]) {
        return false;
    }

    $("#multGroup47Feedback").hide().html("");

    if (side == "Left") {
        if (localMultGroup47.selectedLeft != null) {
            $("#multGroup47Left" + localMultGroup47.selectedLeft).removeClass("orderGameBtnSelected");
        }
        localMultGroup47.selectedLeft = id;
    } else {
        if (localMultGroup47.selectedRight != null) {
            $("#multGroup47Right" + localMultGroup47.selectedRight).removeClass("orderGameBtnSelected");
        }
        localMultGroup47.selectedRight = id;
    }

    $("#multGroup47" + side + id).addClass("orderGameBtnSelected");

    htMultGroup47EvaluatePair();
    return false;
}

function htMultGroup47EvaluatePair() {
    var leftId = localMultGroup47.selectedLeft;
    var rightId = localMultGroup47.selectedRight;
    if (leftId == null || rightId == null) {
        return;
    }

    if (leftId === rightId) {
        localMultGroup47.matched[leftId] = true;
        $("#multGroup47Left" + leftId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        $("#multGroup47Right" + rightId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        localMultGroup47.selectedLeft = null;
        localMultGroup47.selectedRight = null;
        htMultGroup47CheckComplete();
    } else {
        var message = $("#multGroup47WordWrongPair").text()
            .split("%RESULT%").join(localMultGroup47.pairs[rightId].result)
            .split("%EXPRESSION%").join(htMultGroup47Expression(localMultGroup47.pairs[leftId]));
        $("#multGroup47Feedback").text(message).show();
        $("#multGroup47Left" + leftId).removeClass("orderGameBtnSelected");
        $("#multGroup47Right" + rightId).removeClass("orderGameBtnSelected");
        localMultGroup47.selectedLeft = null;
        localMultGroup47.selectedRight = null;
    }
}

function htMultGroup47CheckComplete() {
    if (Object.keys(localMultGroup47.matched).length != localMultGroup47.pairs.length) {
        return;
    }

    var nextBtn = $("#multGroup47NextLevel");
    if (localMultGroup47.level >= HT_MULT_GROUP47_MAX_LEVEL) {
        $("#multGroup47AllDone").show();
        nextBtn.text($("#multGroup47WordPlayAgain").text());
    } else {
        $("#multGroup47LevelDone").show();
        nextBtn.text($("#multGroup47WordNextLevel").text());
    }
    nextBtn.show();
}

function htLoadContent() {
    localMultGroup47 = { "level": 1, "pairs": [], "matched": {}, "selectedLeft": null, "selectedRight": null, "objectIndex": HT_MULT_GROUP47_RANDOM_OBJECT, "icon": "" };

    htMultGroup47FillObjectSelector();
    $("#multGroup47Select").off("change").on("change", function() {
        var idx = parseInt($(this).val(), 10);
        if (isNaN(idx) || idx < 0 || idx >= htMultiplicationTableObjects.length) {
            idx = HT_MULT_GROUP47_RANDOM_OBJECT;
        }
        localMultGroup47.objectIndex = idx;
        // A specific object redraws the groups right away, keeping the pairs
        // and the matched buttons; the random option keeps the current drawing
        // until the next exercise is built.
        if (idx !== HT_MULT_GROUP47_RANDOM_OBJECT) {
            localMultGroup47.icon = htMultGroup47ObjectDraw();
            htMultGroup47Render();
        }
        return false;
    });

    $("#multGroup47Reset").off("click").on("click", function() {
        htMultGroup47Build();
    });

    $("#multGroup47NextLevel").off("click").on("click", function() {
        if (localMultGroup47.level >= HT_MULT_GROUP47_MAX_LEVEL) {
            localMultGroup47.level = 1;
        } else {
            localMultGroup47.level++;
        }
        htMultGroup47Build();
    });

    htMultGroup47Build();

    htWriteNavigation();

    return false;
}
