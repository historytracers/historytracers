// SPDX-License-Identifier: GPL-3.0-or-later

// "Grouping in Threes (Game)" (content 931e0f32-bdc4-4f96-9039-e49cd9d06119).
// A number of elements (always a multiple of 3, from 3 to 30) is shown as
// fruits, stars, cats, triangles or dogs. The player must say into how many
// groups of three those elements can be organized. There are three levels:
// answers 1-3, 4-6 and 7-10. The multiplication table of 3 is shown side by
// side with the game. Localized texts live in the class JSON, so this file
// only wires the behavior.

var localGroupThrees = {};

function htGroupThreesIcons() {
    return [ "🍎", "⭐", "🐱", "🔺", "🐶" ];
}

function htGroupThreesRanges() {
    return [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9, 10 ] ];
}

function htGroupThreesFill(template, total, groups) {
    return String(template).replace(/\{total\}/g, total).replace(/\{groups\}/g, groups);
}

function htGroupThreesShowFeedback(correct, message) {
    var feedback = $("#htGroupThreesFeedback");
    feedback.removeClass("htGroupThreesCorrect htGroupThreesWrong");
    feedback.addClass(correct ? "htGroupThreesCorrect" : "htGroupThreesWrong");
    feedback.html(message);
}

function htGroupThreesShowGroups() {
    var icon = htGroupThreesIcons()[localGroupThrees.typeIndex];
    var elements = "";
    for (var g = 0; g < localGroupThrees.groups; g++) {
        var group = "<span class=\"htGroupThreesGroup\">";
        for (var i = 0; i < 3; i++) {
            group += "<span class=\"htGroupThreesElement\">" + icon + "</span>";
        }
        elements += group + "</span>";
    }
    $("#htGroupThreesElements").html(elements).addClass("htGroupThreesGrouped");
}

function htGroupThreesRender() {
    var icon = htGroupThreesIcons()[localGroupThrees.typeIndex];
    var total = localGroupThrees.total;

    $("#htGroupThreesLevel").text($("#htGroupThreesLevelTemplate").text().replace("{n}", localGroupThrees.level + 1));
    $("#htGroupThreesTotal").text($("#htGroupThreesTotalTemplate").text().replace("{total}", total));

    var elements = "";
    for (var i = 0; i < total; i++) {
        elements += "<span class=\"htGroupThreesElement\">" + icon + "</span>";
    }
    $("#htGroupThreesElements").html(elements).removeClass("htGroupThreesGrouped");

    var range = htGroupThreesRanges()[localGroupThrees.level];
    var buttons = "";
    for (var j = 0; j < range.length; j++) {
        buttons += "<button type=\"button\" class=\"htGroupThreesButton\" data-groups=\"" + range[j] + "\">" + range[j] + "</button>";
    }
    $("#htGroupThreesButtons").html(buttons);
}

function htGroupThreesSetup(newLevel) {
    if (newLevel !== undefined) {
        localGroupThrees.level = newLevel;
    }

    var range = htGroupThreesRanges()[localGroupThrees.level];
    localGroupThrees.groups = range[htGetRandomArbitrary(0, range.length)];
    localGroupThrees.total = localGroupThrees.groups * 3;
    localGroupThrees.typeIndex = htGetRandomArbitrary(0, htGroupThreesIcons().length);
    localGroupThrees.answered = false;

    htGroupThreesRender();
    $("#htGroupThreesFeedback").html("").removeClass("htGroupThreesCorrect htGroupThreesWrong");
    $("#htGroupThreesNextBtn").addClass("hidden").text($("#htGroupThreesNextLabel").text());
}

function htGroupThreesAnswer(groups) {
    if (localGroupThrees.answered) {
        return;
    }

    var total = localGroupThrees.total;

    if (groups === localGroupThrees.groups) {
        localGroupThrees.answered = true;

        var message = htGroupThreesFill($("#htGroupThreesMsgCorrect").html(), total, localGroupThrees.groups);
        if (localGroupThrees.level === 2) {
            message += " " + $("#htGroupThreesMsgFinal").html();
            $("#htGroupThreesNextBtn").text($("#htGroupThreesPlayAgain").text()).removeClass("hidden");
        } else {
            $("#htGroupThreesNextBtn").text($("#htGroupThreesNextLabel").text()).removeClass("hidden");
        }

        htGroupThreesShowFeedback(true, message);
        htGroupThreesShowGroups();
        $("#htGroupThreesButtons .htGroupThreesButton").prop("disabled", true);
    } else {
        htGroupThreesShowFeedback(false, htGroupThreesFill($("#htGroupThreesMsgWrong").html(), total, localGroupThrees.groups));
        $("#htGroupThreesButtons .htGroupThreesButton[data-groups='" + groups + "']").prop("disabled", true);
    }
}

function htGroupThreesNext() {
    if (!localGroupThrees.answered) {
        return;
    }

    if (localGroupThrees.level >= 2) {
        htGroupThreesSetup(0);
    } else {
        htGroupThreesSetup(localGroupThrees.level + 1);
    }
}

function htLoadContent() {
    htWriteNavigation();

    localGroupThrees = { "level": 0, "groups": 1, "total": 3, "typeIndex": 0, "answered": false };

    $("#mParent3").html("");
    htWriteMultiplicationTable("#mParent3", 3);

    $("#htGroupThreesButtons").off("click").on("click", ".htGroupThreesButton", function() {
        htGroupThreesAnswer(parseInt($(this).data("groups")));
    });

    $("#htGroupThreesNewBtn").off("click").on("click", function() {
        htGroupThreesSetup();
    });

    $("#htGroupThreesNextBtn").off("click").on("click", function() {
        htGroupThreesNext();
    });

    htGroupThreesSetup(0);

    return false;
}
