// SPDX-License-Identifier: GPL-3.0-or-later

// "Multiplying with Groups (4 to 7)" (content 0f7102a6-c17d-494e-8e98-c4ab178116fd).
// Two-column matching game: the left column shows a multiplication and the right
// column shows its result together with groups of characters. The first factor is
// the number of characters inside each rectangle and the second factor is the
// number of rectangles, so 4 x 6 is drawn as six rectangles with four characters.
// Localized texts live in the class JSON, so this file only wires the behavior.

var localMultGroup47 = {};

var HT_MULT_GROUP47_MAX_LEVEL = 4;
var HT_MULT_GROUP47_MAX_MULTIPLIER = 10;

function htMultGroup47Icons() {
    return [ "🐶", "🐱", "🍎", "⭐", "🔺" ];
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

    var icon = htMultGroup47Icons()[htGetRandomArbitrary(0, htMultGroup47Icons().length)];

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
        leftHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupExprBtn\" id=\"multGroup47Left" + leftItems[i].id + "\" data-id=\"" + leftItems[i].id + "\" onclick=\"htMultGroup47Select('Left', " + leftItems[i].id + ");\">" + leftItems[i].html + "</button>";
    }
    var rightHtml = "";
    for (let i = 0; i < rightItems.length; i++) {
        var pair = localMultGroup47.pairs[rightItems[i].id];
        var groups = rightItems[i].html === "" ? "" : "<span class=\"htMultGroupsWrap\">" + rightItems[i].html + "</span>";
        rightHtml += "<button type=\"button\" class=\"orderGameBtn htMultGroupResultBtn\" id=\"multGroup47Right" + rightItems[i].id + "\" data-id=\"" + rightItems[i].id + "\" onclick=\"htMultGroup47Select('Right', " + rightItems[i].id + ");\"><span class=\"htMultGroupValue\">" + pair.result + "</span>" + groups + "</button>";
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

    var levelWord = $("#multGroup47WordLevel").text();
    $("#multGroup47Level").text(levelWord + " " + localMultGroup47.level + "/" + HT_MULT_GROUP47_MAX_LEVEL);
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
    localMultGroup47 = { "level": 1, "pairs": [], "matched": {}, "selectedLeft": null, "selectedRight": null };

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
