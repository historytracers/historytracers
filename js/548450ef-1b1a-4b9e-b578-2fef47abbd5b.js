// SPDX-License-Identifier: GPL-3.0-or-later

// "Greater or Smaller? (Game)" (content 548450ef-1b1a-4b9e-b578-2fef47abbd5b).
// Web port of the Android "Greater or Smaller (The Game)": two numbers appear
// as A (left) and B (right) and the player decides whether they are in order,
// that is, whether B is greater than A. Four levels mirror the Android ranges:
// 0-25, 100-1000, tiny vs huge (0-9 against 1000000-9999999) and small vs huge
// (10-99 against 1000000-9999999). In the last two levels the gap is huge, so
// feedback uses much greater (>>) and much less (<<). Localized texts live in
// the class JSON, so this file only wires the behavior.

var localGreaterSmaller = {};

function htGreaterSmallerFormat(value) {
    var s = String(value);
    var out = "";
    var count = 0;
    for (var i = s.length - 1; i >= 0; i--) {
        out = s[i] + out;
        count++;
        if (count % 3 === 0 && i > 0) {
            out = "," + out;
        }
    }
    return out;
}

function htGreaterSmallerPair(level) {
    var a = 0;
    var b = 1;
    if (level === 0) {
        a = htGetRandomArbitrary(0, 26);
        b = htGetRandomArbitrary(0, 26);
        while (a === b) {
            b = htGetRandomArbitrary(0, 26);
        }
    } else if (level === 1) {
        a = htGetRandomArbitrary(100, 1001);
        b = htGetRandomArbitrary(100, 1001);
        while (a === b) {
            b = htGetRandomArbitrary(100, 1001);
        }
    } else if (level === 2) {
        var small = htGetRandomArbitrary(0, 10);
        var big = htGetRandomArbitrary(1000000, 10000000);
        if (htGetRandomArbitrary(0, 2) === 0) {
            a = small;
            b = big;
        } else {
            a = big;
            b = small;
        }
    } else {
        var small2 = htGetRandomArbitrary(10, 100);
        var big2 = htGetRandomArbitrary(1000000, 10000000);
        if (htGetRandomArbitrary(0, 2) === 0) {
            a = small2;
            b = big2;
        } else {
            a = big2;
            b = small2;
        }
    }
    return [a, b];
}

function htGreaterSmallerFill(template, big, small) {
    return template.replace(/\{big\}/g, big).replace(/\{small\}/g, small);
}

function htGreaterSmallerShowFeedback(correct, message) {
    var feedback = $("#htGreaterSmallerFeedback");
    feedback.removeClass("htGreaterSmallerCorrect htGreaterSmallerWrong");
    feedback.addClass(correct ? "htGreaterSmallerCorrect" : "htGreaterSmallerWrong");
    feedback.html(message);
}

function htGreaterSmallerRender() {
    $("#htGreaterSmallerLeft").text(htGreaterSmallerFormat(localGreaterSmaller.left));
    $("#htGreaterSmallerRight").text(htGreaterSmallerFormat(localGreaterSmaller.right));
    $("#htGreaterSmallerOp").text(localGreaterSmaller.level >= 2 ? "≪" : "<");
    $("#htGreaterSmallerLevel").text($("#htGreaterSmallerLevelTemplate").text().replace("{n}", localGreaterSmaller.level + 1));
}

function htGreaterSmallerSetup(newLevel) {
    if (newLevel !== undefined) {
        localGreaterSmaller.level = newLevel;
    }
    var pair = htGreaterSmallerPair(localGreaterSmaller.level);
    localGreaterSmaller.left = pair[0];
    localGreaterSmaller.right = pair[1];
    localGreaterSmaller.answered = false;
    localGreaterSmaller.wasCorrect = false;

    htGreaterSmallerRender();
    $("#htGreaterSmallerFeedback").html("").removeClass("htGreaterSmallerCorrect htGreaterSmallerWrong");
    $("#htGreaterSmallerInBtn").prop("disabled", false);
    $("#htGreaterSmallerNotBtn").prop("disabled", false);
    $("#htGreaterSmallerNextBtn").addClass("hidden");
    $("#htGreaterSmallerNextBtn").text($("#htGreaterSmallerNextLabel").text());
}

function htGreaterSmallerAnswer(userSaysInOrder) {
    if (localGreaterSmaller.answered) {
        return;
    }
    var left = localGreaterSmaller.left;
    var right = localGreaterSmaller.right;
    var inOrder = right > left;
    var correct = (userSaysInOrder === inOrder);
    var much = localGreaterSmaller.level >= 2;
    var big = htGreaterSmallerFormat(Math.max(left, right));
    var small = htGreaterSmallerFormat(Math.min(left, right));
    var selector;
    var message;

    localGreaterSmaller.answered = true;
    localGreaterSmaller.wasCorrect = correct;

    if (correct && localGreaterSmaller.level === 3) {
        message = $("#htGreaterSmallerMsgFinal").html();
        htGreaterSmallerShowFeedback(true, message);
        $("#htGreaterSmallerNextBtn").text($("#htGreaterSmallerPlayAgain").text()).removeClass("hidden");
    } else {
        if (correct) {
            selector = much ? "#htGreaterSmallerMsgCorrectMuch" : "#htGreaterSmallerMsgCorrect";
        } else {
            selector = much ? "#htGreaterSmallerMsgWrongMuch" : "#htGreaterSmallerMsgWrong";
        }
        message = htGreaterSmallerFill($(selector).html(), big, small);
        htGreaterSmallerShowFeedback(correct, message);
        if (correct) {
            $("#htGreaterSmallerNextBtn").removeClass("hidden");
        }
    }

    $("#htGreaterSmallerInBtn").prop("disabled", true);
    $("#htGreaterSmallerNotBtn").prop("disabled", true);
}

function htGreaterSmallerNext() {
    if (!localGreaterSmaller.answered || !localGreaterSmaller.wasCorrect) {
        return;
    }
    if (localGreaterSmaller.level >= 3) {
        htGreaterSmallerSetup(0);
    } else {
        htGreaterSmallerSetup(localGreaterSmaller.level + 1);
    }
}

function htLoadContent() {
    htWriteNavigation();

    localGreaterSmaller = { "level": 0, "left": 0, "right": 1, "answered": false, "wasCorrect": false };

    $("#htGreaterSmallerInBtn").off("click").on("click", function() {
        htGreaterSmallerAnswer(true);
    });

    $("#htGreaterSmallerNotBtn").off("click").on("click", function() {
        htGreaterSmallerAnswer(false);
    });

    $("#htGreaterSmallerNewBtn").off("click").on("click", function() {
        htGreaterSmallerSetup();
    });

    $("#htGreaterSmallerNextBtn").off("click").on("click", function() {
        htGreaterSmallerNext();
    });

    htGreaterSmallerSetup(0);

    return false;
}
