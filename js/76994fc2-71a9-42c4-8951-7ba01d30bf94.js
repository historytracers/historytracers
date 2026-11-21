// SPDX-License-Identifier: GPL-3.0-or-later

// "Matching the Tables of 3 and 9" (content 76994fc2-71a9-42c4-8951-7ba01d30bf94).
// Two-column matching game that makes the relationship between the
// multiplication tables of 3 and 9 visible: the left column shows an equality
// like 3 x 3 x 4 = 9 x 4 (multiplying by 9 is multiplying by 3 twice), and the
// right column shows its result together with groups of characters drawn as
// rectangles with nine characters each, so the picture matches the 9 x N side
// of the equality. The three levels walk the table of 9 in order, so the player
// sees every result as a result of the table of 3 as well.
// Localized texts live in the class JSON, so this file only wires the behavior.
// The groups are drawn with the same objects used by the multiplication tables
// (htMultiplicationTableObjects in ht_math.js): a selector above the game lets
// the user pick one of them or keep the default random choice.

var localMultGroupEq9 = {};

var HT_MULT_GROUP_EQ9_MAX_LEVEL = 3;
// Selector value for the default behavior: a random object from
// htMultiplicationTableObjects in every new exercise.
var HT_MULT_GROUP_EQ9_RANDOM_OBJECT = -1;

// Returns the draw HTML of the drawing object for the groups: the one chosen
// in the selector, or a random one from the same set used by the
// multiplication tables when the user keeps the random option.
function htMultGroupEq9ObjectDraw() {
    if (localMultGroupEq9.objectIndex >= 0 && localMultGroupEq9.objectIndex < htMultiplicationTableObjects.length) {
        return htMultiplicationTableObjects[localMultGroupEq9.objectIndex].draw;
    }
    return htMultiplicationTableObjects[htGetRandomArbitrary(0, htMultiplicationTableObjects.length)].draw;
}

// Every level covers one third of the table of 9: level 1 walks results 9 to
// 27, level 2 results 36 to 54 and level 3 results 63 to 81.
function htMultGroupEq9NPool(level) {
    if (level === 1) {
        return [ 1, 2, 3 ];
    }
    if (level === 2) {
        return [ 4, 5, 6 ];
    }
    return [ 7, 8, 9 ];
}

function htMultGroupEq9Shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        let j = htGetRandomArbitrary(0, i + 1);
        let tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
    }
    return items;
}

// The three equalities of a level use distinct Ns so that every result on the
// right column is different.
function htMultGroupEq9Pairs(level) {
    var pool = htMultGroupEq9Shuffle(htMultGroupEq9NPool(level));
    var pairs = [];
    for (let i = 0; i < pool.length; i++) {
        pairs.push({
            "n": pool[i],
            "result": 9 * pool[i]
        });
    }
    return pairs;
}

// Plain-text equality, used in the feedback message of a wrong pair.
function htMultGroupEq9Expression(pair) {
    return "3 × 3 × " + pair.n + " = 9 × " + pair.n;
}

// The left button keeps each side of the equality together, so on narrow
// screens the line breaks between "3 × 3 × N" and "= 9 × N" instead of
// overflowing the column.
function htMultGroupEq9ExpressionHtml(pair) {
    return "<span class=\"htMultGroupEq9Side\">3 × 3 × " + pair.n + "</span> = 9 × " + pair.n;
}

// The groups follow the same rule as the other group games: one rectangle
// holds as many characters as the first factor of the drawn side and there are
// as many rectangles as the second factor. Here the drawn side is 9 x N, so
// every rectangle holds nine characters and there are N rectangles.
function htMultGroupEq9Boxes(pair, icon) {
    var boxes = "";
    for (let g = 0; g < pair.n; g++) {
        var content = "";
        for (let i = 0; i < 9; i++) {
            content += "<span class=\"htMultGroupIcon\">" + icon + "</span>";
        }
        boxes += "<span class=\"htMultGroupBox\" aria-hidden=\"true\">" + content + "</span>";
    }
    return boxes;
}

function htMultGroupEq9Build() {
    $("#multGroupEq9LevelDone").hide();
    $("#multGroupEq9AllDone").hide();
    $("#multGroupEq9NextLevel").hide();
    $("#multGroupEq9Feedback").hide().html("");

    localMultGroupEq9.matched = {};
    localMultGroupEq9.selectedLeft = null;
    localMultGroupEq9.selectedRight = null;

    localMultGroupEq9.pairs = htMultGroupEq9Pairs(localMultGroupEq9.level);

    localMultGroupEq9.icon = htMultGroupEq9ObjectDraw();

    var levelWord = $("#multGroupEq9WordLevel").text();
    $("#multGroupEq9Level").text(levelWord + " " + localMultGroupEq9.level + "/" + HT_MULT_GROUP_EQ9_MAX_LEVEL);

    htMultGroupEq9Render();
}

// Draws the two columns for the current pairs. Called by htMultGroupEq9Build
// and again when the user picks another drawing object, so switching the image
// keeps the pairs and the already matched buttons of the level.
function htMultGroupEq9Render() {
    $("#multGroupEq9Feedback").hide().html("");
    localMultGroupEq9.selectedLeft = null;
    localMultGroupEq9.selectedRight = null;

    var icon = localMultGroupEq9.icon;

    var leftItems = [];
    var rightItems = [];
    for (let i = 0; i < localMultGroupEq9.pairs.length; i++) {
        leftItems.push({ "id": i, "html": htMultGroupEq9ExpressionHtml(localMultGroupEq9.pairs[i]) });
        rightItems.push({ "id": i, "html": htMultGroupEq9Boxes(localMultGroupEq9.pairs[i], icon) });
    }
    htMultGroupEq9Shuffle(leftItems);
    htMultGroupEq9Shuffle(rightItems);

    var leftHtml = "";
    for (let i = 0; i < leftItems.length; i++) {
        var matchedClass = localMultGroupEq9.matched[leftItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroupEq9.matched[leftItems[i].id] ? " disabled" : "";
        leftHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupExprBtn htMultGroupEq9ExprBtn" + matchedClass + "\" id=\"multGroupEq9Left" + leftItems[i].id + "\" data-id=\"" + leftItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroupEq9Select('Left', " + leftItems[i].id + ");\">" + leftItems[i].html + "</button>";
    }
    var rightHtml = "";
    for (let i = 0; i < rightItems.length; i++) {
        var pair = localMultGroupEq9.pairs[rightItems[i].id];
        var matchedClass = localMultGroupEq9.matched[rightItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroupEq9.matched[rightItems[i].id] ? " disabled" : "";
        var groups = rightItems[i].html === "" ? "" : "<span class=\"htMultGroupsWrap\">" + rightItems[i].html + "</span>";
        rightHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupResultBtn" + matchedClass + "\" id=\"multGroupEq9Right" + rightItems[i].id + "\" data-id=\"" + rightItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroupEq9Select('Right', " + rightItems[i].id + ");\"><span class=\"htMultGroupValue\">" + pair.result + "</span>" + groups + "</button>";
    }
    $("#multGroupEq9LeftCol").html(leftHtml);
    $("#multGroupEq9RightCol").html(rightHtml);

    // The groups are decorative for sighted users, so the accessible name must
    // also describe them: "36. Groups: 4. Characters per group: 9."
    var groupWord = $("#multGroupEq9WordGroups").text();
    for (let i = 0; i < rightItems.length; i++) {
        var labelPair = localMultGroupEq9.pairs[rightItems[i].id];
        var groupDescription = groupWord
            .split("%COUNT%").join(labelPair.n)
            .split("%SIZE%").join(9);
        $("#multGroupEq9Right" + rightItems[i].id).attr("aria-label", labelPair.result + ". " + groupDescription);
    }
}

// Fills the drawing-object selector with the random option followed by every
// object used by the multiplication tables (htMultiplicationTableObjects in
// ht_math.js), preselecting the current choice.
function htMultGroupEq9FillObjectSelector() {
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 78) ? mathKeywords[78] : "";
    var select = $("#multGroupEq9Select");
    select.empty();
    select.append($("<option>").val(HT_MULT_GROUP_EQ9_RANDOM_OBJECT).prop("selected", localMultGroupEq9.objectIndex === HT_MULT_GROUP_EQ9_RANDOM_OBJECT).text($("#multGroupEq9WordRandom").text()));
    for (let i = 0; i < htMultiplicationTableObjects.length; i++) {
        select.append($("<option>").val(i).prop("selected", localMultGroupEq9.objectIndex === i).text(htMultiplicationTableObjects[i].option));
    }
    select.attr("aria-label", label).attr("title", label);
}

function htMultGroupEq9Select(side, id) {
    if (localMultGroupEq9.matched[id]) {
        return false;
    }

    $("#multGroupEq9Feedback").hide().html("");

    if (side == "Left") {
        if (localMultGroupEq9.selectedLeft != null) {
            $("#multGroupEq9Left" + localMultGroupEq9.selectedLeft).removeClass("orderGameBtnSelected");
        }
        localMultGroupEq9.selectedLeft = id;
    } else {
        if (localMultGroupEq9.selectedRight != null) {
            $("#multGroupEq9Right" + localMultGroupEq9.selectedRight).removeClass("orderGameBtnSelected");
        }
        localMultGroupEq9.selectedRight = id;
    }

    $("#multGroupEq9" + side + id).addClass("orderGameBtnSelected");

    htMultGroupEq9EvaluatePair();
    return false;
}

function htMultGroupEq9EvaluatePair() {
    var leftId = localMultGroupEq9.selectedLeft;
    var rightId = localMultGroupEq9.selectedRight;
    if (leftId == null || rightId == null) {
        return;
    }

    if (leftId === rightId) {
        localMultGroupEq9.matched[leftId] = true;
        $("#multGroupEq9Left" + leftId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        $("#multGroupEq9Right" + rightId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        localMultGroupEq9.selectedLeft = null;
        localMultGroupEq9.selectedRight = null;
        htMultGroupEq9CheckComplete();
    } else {
        var message = $("#multGroupEq9WordWrongPair").text()
            .split("%RESULT%").join(localMultGroupEq9.pairs[rightId].result)
            .split("%EXPRESSION%").join(htMultGroupEq9Expression(localMultGroupEq9.pairs[leftId]));
        $("#multGroupEq9Feedback").text(message).show();
        $("#multGroupEq9Left" + leftId).removeClass("orderGameBtnSelected");
        $("#multGroupEq9Right" + rightId).removeClass("orderGameBtnSelected");
        localMultGroupEq9.selectedLeft = null;
        localMultGroupEq9.selectedRight = null;
    }
}

function htMultGroupEq9CheckComplete() {
    if (Object.keys(localMultGroupEq9.matched).length != localMultGroupEq9.pairs.length) {
        return;
    }

    var nextBtn = $("#multGroupEq9NextLevel");
    if (localMultGroupEq9.level >= HT_MULT_GROUP_EQ9_MAX_LEVEL) {
        $("#multGroupEq9AllDone").show();
        nextBtn.text($("#multGroupEq9WordPlayAgain").text());
    } else {
        $("#multGroupEq9LevelDone").show();
        nextBtn.text($("#multGroupEq9WordNextLevel").text());
    }
    nextBtn.show();
}

function htLoadContent() {
    localMultGroupEq9 = { "level": 1, "pairs": [], "matched": {}, "selectedLeft": null, "selectedRight": null, "objectIndex": HT_MULT_GROUP_EQ9_RANDOM_OBJECT, "icon": "" };

    htMultGroupEq9FillObjectSelector();
    $("#multGroupEq9Select").off("change").on("change", function() {
        var idx = parseInt($(this).val(), 10);
        if (isNaN(idx) || idx < 0 || idx >= htMultiplicationTableObjects.length) {
            idx = HT_MULT_GROUP_EQ9_RANDOM_OBJECT;
        }
        localMultGroupEq9.objectIndex = idx;
        // A specific object redraws the groups right away, keeping the pairs
        // and the matched buttons; the random option keeps the current drawing
        // until the next exercise is built.
        if (idx !== HT_MULT_GROUP_EQ9_RANDOM_OBJECT) {
            localMultGroupEq9.icon = htMultGroupEq9ObjectDraw();
            htMultGroupEq9Render();
        }
        return false;
    });

    $("#multGroupEq9Reset").off("click").on("click", function() {
        htMultGroupEq9Build();
    });

    $("#multGroupEq9NextLevel").off("click").on("click", function() {
        if (localMultGroupEq9.level >= HT_MULT_GROUP_EQ9_MAX_LEVEL) {
            localMultGroupEq9.level = 1;
        } else {
            localMultGroupEq9.level++;
        }
        htMultGroupEq9Build();
    });

    htMultGroupEq9Build();

    htWriteNavigation();

    return false;
}
