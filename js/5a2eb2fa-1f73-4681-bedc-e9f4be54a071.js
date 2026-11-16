// SPDX-License-Identifier: GPL-3.0-or-later

// "Matching the Tables of 2, 4 and 8" (content 5a2eb2fa-1f73-4681-bedc-e9f4be54a071).
// Two-column matching game that makes the relationships between the
// multiplication tables of 2, 4 and 8 visible: the left column shows an
// equality like 2 x 2 x 2 x 6 = 8 x 6 (multiplying by 8 is multiplying by 2
// three times) or 4 x 2 x 6 = 8 x 6 (it is also doubling a result of the table
// of 4), and the right column shows its result together with groups of
// characters drawn as rectangles with eight characters each, so the picture
// matches the 8 x N side of the equality. Levels 1 and 2 walk the road of the
// table of 2 and levels 3 and 4 the road of the table of 4, so the player sees
// both roads reach the same product.
// Localized texts live in the class JSON, so this file only wires the behavior.
// The groups are drawn with the same objects used by the multiplication tables
// (htMultiplicationTableObjects in ht_math.js): a selector above the game lets
// the user pick one of them or keep the default random choice.

var localMultGroupEq8 = {};

var HT_MULT_GROUP_EQ8_MAX_LEVEL = 4;
// Selector value for the default behavior: a random object from
// htMultiplicationTableObjects in every new exercise.
var HT_MULT_GROUP_EQ8_RANDOM_OBJECT = -1;

// Returns the draw HTML of the drawing object for the groups: the one chosen
// in the selector, or a random one from the same set used by the
// multiplication tables when the user keeps the random option.
function htMultGroupEq8ObjectDraw() {
    if (localMultGroupEq8.objectIndex >= 0 && localMultGroupEq8.objectIndex < htMultiplicationTableObjects.length) {
        return htMultiplicationTableObjects[localMultGroupEq8.objectIndex].draw;
    }
    return htMultiplicationTableObjects[htGetRandomArbitrary(0, htMultiplicationTableObjects.length)].draw;
}

// Levels 1 and 2 write the road of the table of 2 (8 = 2 x 2 x 2) and levels 3
// and 4 the road of the table of 4 (8 = 4 x 2). Both roads start from the
// multiplier N of the 8 x N side of the equality, so both end at the same
// product: 2 x 2 x 2 x N = 4 x 2 x N = 8 x N.
function htMultGroupEq8Form(level) {
    return (level === 1 || level === 2) ? "chain" : "table4";
}

// Levels 1 and 3 cover the first half of the table of 8 (results 8 to 24) and
// levels 2 and 4 the second half (results 32 to 48).
function htMultGroupEq8NPool(level) {
    if (level === 1 || level === 3) {
        return [ 1, 2, 3 ];
    }
    return [ 4, 5, 6 ];
}

function htMultGroupEq8Shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        let j = htGetRandomArbitrary(0, i + 1);
        let tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
    }
    return items;
}

// The two equalities of a level use distinct Ns so that every result on the
// right column is different.
function htMultGroupEq8Pairs(level) {
    var form = htMultGroupEq8Form(level);
    var pool = htMultGroupEq8Shuffle(htMultGroupEq8NPool(level));
    var pairs = [];
    for (let i = 0; i < 2; i++) {
        pairs.push({
            "form": form,
            "n": pool[i],
            "result": 8 * pool[i]
        });
    }
    return pairs;
}

// Plain-text equality, used in the feedback message of a wrong pair.
function htMultGroupEq8Expression(pair) {
    return htMultGroupEq8LeftSide(pair) + " = 8 × " + pair.n;
}

// The road of the table of 2 is written with three factors (2 × 2 × 2 × N) and
// the road of the table of 4 with two (4 × 2 × N).
function htMultGroupEq8LeftSide(pair) {
    if (pair.form === "chain") {
        return "2 × 2 × 2 × " + pair.n;
    }
    return "4 × 2 × " + pair.n;
}

// The left button keeps each side of the equality together, so on narrow
// screens the line breaks between "2 × 2 × 2 × N" and "= 8 × N" instead of
// overflowing the column.
function htMultGroupEq8ExpressionHtml(pair) {
    return "<span class=\"htMultGroupEq8Side\">" + htMultGroupEq8LeftSide(pair) + "</span> = 8 × " + pair.n;
}

// The groups follow the same rule as the other group games: one rectangle
// holds as many characters as the first factor of the drawn side and there are
// as many rectangles as the second factor. Here the drawn side is 8 x N, so
// every rectangle holds eight characters and there are N rectangles.
function htMultGroupEq8Boxes(pair, icon) {
    var boxes = "";
    for (let g = 0; g < pair.n; g++) {
        var content = "";
        for (let i = 0; i < 8; i++) {
            content += "<span class=\"htMultGroupIcon\">" + icon + "</span>";
        }
        boxes += "<span class=\"htMultGroupBox\" aria-hidden=\"true\">" + content + "</span>";
    }
    return boxes;
}

function htMultGroupEq8Build() {
    $("#multGroupEq8LevelDone").hide();
    $("#multGroupEq8AllDone").hide();
    $("#multGroupEq8NextLevel").hide();
    $("#multGroupEq8Feedback").hide().html("");

    localMultGroupEq8.matched = {};
    localMultGroupEq8.selectedLeft = null;
    localMultGroupEq8.selectedRight = null;

    localMultGroupEq8.pairs = htMultGroupEq8Pairs(localMultGroupEq8.level);

    localMultGroupEq8.icon = htMultGroupEq8ObjectDraw();

    var levelWord = $("#multGroupEq8WordLevel").text();
    $("#multGroupEq8Level").text(levelWord + " " + localMultGroupEq8.level + "/" + HT_MULT_GROUP_EQ8_MAX_LEVEL);

    htMultGroupEq8Render();
}

// Draws the two columns for the current pairs. Called by htMultGroupEq8Build
// and again when the user picks another drawing object, so switching the image
// keeps the pairs and the already matched buttons of the level.
function htMultGroupEq8Render() {
    $("#multGroupEq8Feedback").hide().html("");
    localMultGroupEq8.selectedLeft = null;
    localMultGroupEq8.selectedRight = null;

    var icon = localMultGroupEq8.icon;

    var leftItems = [];
    var rightItems = [];
    for (let i = 0; i < localMultGroupEq8.pairs.length; i++) {
        leftItems.push({ "id": i, "html": htMultGroupEq8ExpressionHtml(localMultGroupEq8.pairs[i]) });
        rightItems.push({ "id": i, "html": htMultGroupEq8Boxes(localMultGroupEq8.pairs[i], icon) });
    }
    htMultGroupEq8Shuffle(leftItems);
    htMultGroupEq8Shuffle(rightItems);

    var leftHtml = "";
    for (let i = 0; i < leftItems.length; i++) {
        var matchedClass = localMultGroupEq8.matched[leftItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroupEq8.matched[leftItems[i].id] ? " disabled" : "";
        leftHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupExprBtn htMultGroupEq8ExprBtn" + matchedClass + "\" id=\"multGroupEq8Left" + leftItems[i].id + "\" data-id=\"" + leftItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroupEq8Select('Left', " + leftItems[i].id + ");\">" + leftItems[i].html + "</button>";
    }
    var rightHtml = "";
    for (let i = 0; i < rightItems.length; i++) {
        var pair = localMultGroupEq8.pairs[rightItems[i].id];
        var matchedClass = localMultGroupEq8.matched[rightItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroupEq8.matched[rightItems[i].id] ? " disabled" : "";
        var groups = rightItems[i].html === "" ? "" : "<span class=\"htMultGroupsWrap\">" + rightItems[i].html + "</span>";
        rightHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupResultBtn" + matchedClass + "\" id=\"multGroupEq8Right" + rightItems[i].id + "\" data-id=\"" + rightItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroupEq8Select('Right', " + rightItems[i].id + ");\"><span class=\"htMultGroupValue\">" + pair.result + "</span>" + groups + "</button>";
    }
    $("#multGroupEq8LeftCol").html(leftHtml);
    $("#multGroupEq8RightCol").html(rightHtml);

    // The groups are decorative for sighted users, so the accessible name must
    // also describe them: "16. Groups: 2. Characters per group: 8."
    var groupWord = $("#multGroupEq8WordGroups").text();
    for (let i = 0; i < rightItems.length; i++) {
        var labelPair = localMultGroupEq8.pairs[rightItems[i].id];
        var groupDescription = groupWord
            .split("%COUNT%").join(labelPair.n)
            .split("%SIZE%").join(8);
        $("#multGroupEq8Right" + rightItems[i].id).attr("aria-label", labelPair.result + ". " + groupDescription);
    }
}

// Fills the drawing-object selector with the random option followed by every
// object used by the multiplication tables (htMultiplicationTableObjects in
// ht_math.js), preselecting the current choice.
function htMultGroupEq8FillObjectSelector() {
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 78) ? mathKeywords[78] : "";
    var select = $("#multGroupEq8Select");
    select.empty();
    select.append($("<option>").val(HT_MULT_GROUP_EQ8_RANDOM_OBJECT).prop("selected", localMultGroupEq8.objectIndex === HT_MULT_GROUP_EQ8_RANDOM_OBJECT).text($("#multGroupEq8WordRandom").text()));
    for (let i = 0; i < htMultiplicationTableObjects.length; i++) {
        select.append($("<option>").val(i).prop("selected", localMultGroupEq8.objectIndex === i).text(htMultiplicationTableObjects[i].option));
    }
    select.attr("aria-label", label).attr("title", label);
}

function htMultGroupEq8Select(side, id) {
    if (localMultGroupEq8.matched[id]) {
        return false;
    }

    $("#multGroupEq8Feedback").hide().html("");

    if (side == "Left") {
        if (localMultGroupEq8.selectedLeft != null) {
            $("#multGroupEq8Left" + localMultGroupEq8.selectedLeft).removeClass("orderGameBtnSelected");
        }
        localMultGroupEq8.selectedLeft = id;
    } else {
        if (localMultGroupEq8.selectedRight != null) {
            $("#multGroupEq8Right" + localMultGroupEq8.selectedRight).removeClass("orderGameBtnSelected");
        }
        localMultGroupEq8.selectedRight = id;
    }

    $("#multGroupEq8" + side + id).addClass("orderGameBtnSelected");

    htMultGroupEq8EvaluatePair();
    return false;
}

function htMultGroupEq8EvaluatePair() {
    var leftId = localMultGroupEq8.selectedLeft;
    var rightId = localMultGroupEq8.selectedRight;
    if (leftId == null || rightId == null) {
        return;
    }

    if (leftId === rightId) {
        localMultGroupEq8.matched[leftId] = true;
        $("#multGroupEq8Left" + leftId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        $("#multGroupEq8Right" + rightId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        localMultGroupEq8.selectedLeft = null;
        localMultGroupEq8.selectedRight = null;
        htMultGroupEq8CheckComplete();
    } else {
        var message = $("#multGroupEq8WordWrongPair").text()
            .split("%RESULT%").join(localMultGroupEq8.pairs[rightId].result)
            .split("%EXPRESSION%").join(htMultGroupEq8Expression(localMultGroupEq8.pairs[leftId]));
        $("#multGroupEq8Feedback").text(message).show();
        $("#multGroupEq8Left" + leftId).removeClass("orderGameBtnSelected");
        $("#multGroupEq8Right" + rightId).removeClass("orderGameBtnSelected");
        localMultGroupEq8.selectedLeft = null;
        localMultGroupEq8.selectedRight = null;
    }
}

function htMultGroupEq8CheckComplete() {
    if (Object.keys(localMultGroupEq8.matched).length != localMultGroupEq8.pairs.length) {
        return;
    }

    var nextBtn = $("#multGroupEq8NextLevel");
    if (localMultGroupEq8.level >= HT_MULT_GROUP_EQ8_MAX_LEVEL) {
        $("#multGroupEq8AllDone").show();
        nextBtn.text($("#multGroupEq8WordPlayAgain").text());
    } else {
        $("#multGroupEq8LevelDone").show();
        nextBtn.text($("#multGroupEq8WordNextLevel").text());
    }
    nextBtn.show();
}

function htLoadContent() {
    localMultGroupEq8 = { "level": 1, "pairs": [], "matched": {}, "selectedLeft": null, "selectedRight": null, "objectIndex": HT_MULT_GROUP_EQ8_RANDOM_OBJECT, "icon": "" };

    htMultGroupEq8FillObjectSelector();
    $("#multGroupEq8Select").off("change").on("change", function() {
        var idx = parseInt($(this).val(), 10);
        if (isNaN(idx) || idx < 0 || idx >= htMultiplicationTableObjects.length) {
            idx = HT_MULT_GROUP_EQ8_RANDOM_OBJECT;
        }
        localMultGroupEq8.objectIndex = idx;
        // A specific object redraws the groups right away, keeping the pairs
        // and the matched buttons; the random option keeps the current drawing
        // until the next exercise is built.
        if (idx !== HT_MULT_GROUP_EQ8_RANDOM_OBJECT) {
            localMultGroupEq8.icon = htMultGroupEq8ObjectDraw();
            htMultGroupEq8Render();
        }
        return false;
    });

    $("#multGroupEq8Reset").off("click").on("click", function() {
        htMultGroupEq8Build();
    });

    $("#multGroupEq8NextLevel").off("click").on("click", function() {
        if (localMultGroupEq8.level >= HT_MULT_GROUP_EQ8_MAX_LEVEL) {
            localMultGroupEq8.level = 1;
        } else {
            localMultGroupEq8.level++;
        }
        htMultGroupEq8Build();
    });

    htMultGroupEq8Build();

    htWriteNavigation();

    return false;
}
