// SPDX-License-Identifier: GPL-3.0-or-later

// "Matching the Tables of 6 and 7" (content eaa3c957-8eb2-4d09-83be-5c1291d140f2).
// Two-column matching game that makes the relationship between the
// multiplication tables of 6 and 7 visible: the left column shows an equality
// like 6 x 3 + 3 = 7 x 3 (multiplying by 7 is the same as multiplying by 6 and
// then adding one more copy of the multiplier, 7 x N = 6 x N + N), and the
// right column shows its result together with groups of characters drawn as
// rectangles with seven characters each, so the picture matches the 7 x N side
// of the equality. Localized texts live in the class JSON, so this file only
// wires the behavior. The groups are drawn with the same objects used by the
// multiplication tables (htMultiplicationTableObjects in ht_math.js): a
// selector above the game lets the user pick one of them or keep the default
// random choice.

var localMultGroup67 = {};

var HT_MULT_GROUP_67_MAX_LEVEL = 3;
// Selector value for the default behavior: a random object from
// htMultiplicationTableObjects in every new exercise.
var HT_MULT_GROUP_67_RANDOM_OBJECT = -1;

// Returns the draw HTML of the drawing object for the groups: the one chosen
// in the selector, or a random one from the same set used by the
// multiplication tables when the user keeps the random option.
function htMultGroup67ObjectDraw() {
    if (localMultGroup67.objectIndex >= 0 && localMultGroup67.objectIndex < htMultiplicationTableObjects.length) {
        return htMultiplicationTableObjects[localMultGroup67.objectIndex].draw;
    }
    return htMultiplicationTableObjects[htGetRandomArbitrary(0, htMultiplicationTableObjects.length)].draw;
}

// Level 1 covers the first half of the table of 7 (results 7 to 28), level 2
// the second half (results 35 to 49) and level 3 mixes both halves by taking
// one multiplier from each half. Each entry is the multiplier N shared by the
// two sides of the equality 6 x N + N = 7 x N.
function htMultGroup67NPool(level) {
    if (level === 1) {
        return [ 1, 2, 3, 4 ];
    }
    if (level === 2) {
        return [ 5, 6, 7 ];
    }
    return [
        htGetRandomArbitrary(1, 5),
        htGetRandomArbitrary(5, 8)
    ];
}

function htMultGroup67Shuffle(items) {
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
function htMultGroup67Pairs(level) {
    var pool = htMultGroup67Shuffle(htMultGroup67NPool(level));
    var pairs = [];
    for (let i = 0; i < 2; i++) {
        pairs.push({
            "n": pool[i],
            "result": 7 * pool[i]
        });
    }
    return pairs;
}

function htMultGroup67Expression(pair) {
    return "6 × " + pair.n + " + " + pair.n + " = 7 × " + pair.n;
}

// The groups follow the same rule as the other group games: one rectangle
// holds as many characters as the first factor of the drawn side and there are
// as many rectangles as the second factor. Here the drawn side is 7 x N, so
// every rectangle holds seven characters and there are N rectangles.
function htMultGroup67Boxes(pair, icon) {
    var boxes = "";
    for (let g = 0; g < pair.n; g++) {
        var content = "";
        for (let i = 0; i < 7; i++) {
            content += "<span class=\"htMultGroupIcon\">" + icon + "</span>";
        }
        boxes += "<span class=\"htMultGroupBox\" aria-hidden=\"true\">" + content + "</span>";
    }
    return boxes;
}

function htMultGroup67Build() {
    $("#multGroup67LevelDone").hide();
    $("#multGroup67AllDone").hide();
    $("#multGroup67NextLevel").hide();
    $("#multGroup67Feedback").hide().html("");

    localMultGroup67.matched = {};
    localMultGroup67.selectedLeft = null;
    localMultGroup67.selectedRight = null;

    localMultGroup67.pairs = htMultGroup67Pairs(localMultGroup67.level);

    localMultGroup67.icon = htMultGroup67ObjectDraw();

    var levelWord = $("#multGroup67WordLevel").text();
    $("#multGroup67Level").text(levelWord + " " + localMultGroup67.level + "/" + HT_MULT_GROUP_67_MAX_LEVEL);

    htMultGroup67Render();
}

// Draws the two columns for the current pairs. Called by htMultGroup67Build and
// again when the user picks another drawing object, so switching the image
// keeps the pairs and the already matched buttons of the level.
function htMultGroup67Render() {
    $("#multGroup67Feedback").hide().html("");
    localMultGroup67.selectedLeft = null;
    localMultGroup67.selectedRight = null;

    var icon = localMultGroup67.icon;

    var leftItems = [];
    var rightItems = [];
    for (let i = 0; i < localMultGroup67.pairs.length; i++) {
        leftItems.push({ "id": i, "html": htMultGroup67Expression(localMultGroup67.pairs[i]) });
        rightItems.push({ "id": i, "html": htMultGroup67Boxes(localMultGroup67.pairs[i], icon) });
    }
    htMultGroup67Shuffle(leftItems);
    htMultGroup67Shuffle(rightItems);

    var leftHtml = "";
    for (let i = 0; i < leftItems.length; i++) {
        var matchedClass = localMultGroup67.matched[leftItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroup67.matched[leftItems[i].id] ? " disabled" : "";
        leftHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupExprBtn" + matchedClass + "\" id=\"multGroup67Left" + leftItems[i].id + "\" data-id=\"" + leftItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroup67Select('Left', " + leftItems[i].id + ");\">" + leftItems[i].html + "</button>";
    }
    var rightHtml = "";
    for (let i = 0; i < rightItems.length; i++) {
        var pair = localMultGroup67.pairs[rightItems[i].id];
        var matchedClass = localMultGroup67.matched[rightItems[i].id] ? " orderGameBtnMatched" : "";
        var matchedAttr = localMultGroup67.matched[rightItems[i].id] ? " disabled" : "";
        var groups = rightItems[i].html === "" ? "" : "<span class=\"htMultGroupsWrap\">" + rightItems[i].html + "</span>";
        rightHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupResultBtn" + matchedClass + "\" id=\"multGroup67Right" + rightItems[i].id + "\" data-id=\"" + rightItems[i].id + "\"" + matchedAttr + " onclick=\"htMultGroup67Select('Right', " + rightItems[i].id + ");\"><span class=\"htMultGroupValue\">" + pair.result + "</span>" + groups + "</button>";
    }
    $("#multGroup67LeftCol").html(leftHtml);
    $("#multGroup67RightCol").html(rightHtml);

    // The groups are decorative for sighted users, so the accessible name must
    // also describe them: "21. Groups: 3. Characters per group: 7."
    var groupWord = $("#multGroup67WordGroups").text();
    for (let i = 0; i < rightItems.length; i++) {
        var labelPair = localMultGroup67.pairs[rightItems[i].id];
        var groupDescription = groupWord
            .split("%COUNT%").join(labelPair.n)
            .split("%SIZE%").join(7);
        $("#multGroup67Right" + rightItems[i].id).attr("aria-label", labelPair.result + ". " + groupDescription);
    }
}

// Fills the drawing-object selector with the random option followed by every
// object used by the multiplication tables (htMultiplicationTableObjects in
// ht_math.js), preselecting the current choice.
function htMultGroup67FillObjectSelector() {
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 78) ? mathKeywords[78] : "";
    var select = $("#multGroup67Select");
    select.empty();
    select.append($("<option>").val(HT_MULT_GROUP_67_RANDOM_OBJECT).prop("selected", localMultGroup67.objectIndex === HT_MULT_GROUP_67_RANDOM_OBJECT).text($("#multGroup67WordRandom").text()));
    for (let i = 0; i < htMultiplicationTableObjects.length; i++) {
        select.append($("<option>").val(i).prop("selected", localMultGroup67.objectIndex === i).text(htMultiplicationTableObjects[i].option));
    }
    select.attr("aria-label", label).attr("title", label);
}

function htMultGroup67Select(side, id) {
    if (localMultGroup67.matched[id]) {
        return false;
    }

    $("#multGroup67Feedback").hide().html("");

    if (side == "Left") {
        if (localMultGroup67.selectedLeft != null) {
            $("#multGroup67Left" + localMultGroup67.selectedLeft).removeClass("orderGameBtnSelected");
        }
        localMultGroup67.selectedLeft = id;
    } else {
        if (localMultGroup67.selectedRight != null) {
            $("#multGroup67Right" + localMultGroup67.selectedRight).removeClass("orderGameBtnSelected");
        }
        localMultGroup67.selectedRight = id;
    }

    $("#multGroup67" + side + id).addClass("orderGameBtnSelected");

    htMultGroup67EvaluatePair();
    return false;
}

function htMultGroup67EvaluatePair() {
    var leftId = localMultGroup67.selectedLeft;
    var rightId = localMultGroup67.selectedRight;
    if (leftId == null || rightId == null) {
        return;
    }

    if (leftId === rightId) {
        localMultGroup67.matched[leftId] = true;
        $("#multGroup67Left" + leftId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        $("#multGroup67Right" + rightId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        localMultGroup67.selectedLeft = null;
        localMultGroup67.selectedRight = null;
        htMultGroup67CheckComplete();
    } else {
        var message = $("#multGroup67WordWrongPair").text()
            .split("%RESULT%").join(localMultGroup67.pairs[rightId].result)
            .split("%EXPRESSION%").join(htMultGroup67Expression(localMultGroup67.pairs[leftId]));
        $("#multGroup67Feedback").text(message).show();
        $("#multGroup67Left" + leftId).removeClass("orderGameBtnSelected");
        $("#multGroup67Right" + rightId).removeClass("orderGameBtnSelected");
        localMultGroup67.selectedLeft = null;
        localMultGroup67.selectedRight = null;
    }
}

function htMultGroup67CheckComplete() {
    if (Object.keys(localMultGroup67.matched).length != localMultGroup67.pairs.length) {
        return;
    }

    var nextBtn = $("#multGroup67NextLevel");
    if (localMultGroup67.level >= HT_MULT_GROUP_67_MAX_LEVEL) {
        $("#multGroup67AllDone").show();
        nextBtn.text($("#multGroup67WordPlayAgain").text());
    } else {
        $("#multGroup67LevelDone").show();
        nextBtn.text($("#multGroup67WordNextLevel").text());
    }
    nextBtn.show();
}

function htLoadContent() {
    localMultGroup67 = { "level": 1, "pairs": [], "matched": {}, "selectedLeft": null, "selectedRight": null, "objectIndex": HT_MULT_GROUP_67_RANDOM_OBJECT, "icon": "" };

    htMultGroup67FillObjectSelector();
    $("#multGroup67Select").off("change").on("change", function() {
        var idx = parseInt($(this).val(), 10);
        if (isNaN(idx) || idx < 0 || idx >= htMultiplicationTableObjects.length) {
            idx = HT_MULT_GROUP_67_RANDOM_OBJECT;
        }
        localMultGroup67.objectIndex = idx;
        // A specific object redraws the groups right away, keeping the pairs
        // and the matched buttons; the random option keeps the current drawing
        // until the next exercise is built.
        if (idx !== HT_MULT_GROUP_67_RANDOM_OBJECT) {
            localMultGroup67.icon = htMultGroup67ObjectDraw();
            htMultGroup67Render();
        }
        return false;
    });

    $("#multGroup67Reset").off("click").on("click", function() {
        htMultGroup67Build();
    });

    $("#multGroup67NextLevel").off("click").on("click", function() {
        if (localMultGroup67.level >= HT_MULT_GROUP_67_MAX_LEVEL) {
            localMultGroup67.level = 1;
        } else {
            localMultGroup67.level++;
        }
        htMultGroup67Build();
    });

    htMultGroup67Build();

    htWriteNavigation();

    return false;
}
