// SPDX-License-Identifier: GPL-3.0-or-later

// "Greater or Smaller? (Real Numbers)" (content c13b96c3-525c-42ac-8958-4c1bca1d40c1).
// Web companion of "Greater or Smaller? (Game)" (548450ef) for numbers with one
// decimal position. Four levels: level 1 compares only integers from 0 to 9;
// level 2 compares numbers with the same integer part but different decimals;
// level 3 compares any numbers between 0 and 100 with one decimal position;
// level 4 compares a small number between 0.0 and 9.9 with one between one
// million and ten million with a decimal, so the gap is huge and the feedback
// uses much greater (>>) and much less (<<). Each value is stored as a number
// of tenths, so the comparisons always run on integers and floating point
// rounding cannot change an answer. Localized texts live in the class JSON,
// so this file only wires the behavior.

var localRealCompare = {};

/**
 * Returns the active site language code, defaulting to "en-US".
 * @returns {string} Language code used for number formatting.
 */
function htRealCompareLocale() {
    var lang = "en-US";
    try {
        lang = $("#site_language").val() || "en-US";
    } catch (e) {
        lang = "en-US";
    }
    return lang;
}

/**
 * Formats an integer with the locale grouping separator.
 * @param {number} intPart Integer part of the number.
 * @returns {string} Localized integer, or the plain string on failure.
 */
function htRealCompareGrouped(intPart) {
    var out = String(intPart);
    try {
        var fmt = new Intl.NumberFormat(htRealCompareLocale(), { maximumFractionDigits: 0 });
        out = fmt.format(intPart);
    } catch (e) {
        out = String(intPart);
    }
    return out;
}

/**
 * Returns the decimal separator used by the active locale.
 * @returns {string} Decimal separator character.
 */
function htRealCompareDecSep() {
    var sample = "1.1";
    try {
        sample = new Intl.NumberFormat(htRealCompareLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(1.1);
    } catch (e) {
        sample = "1.1";
    }
    return sample.charAt(1);
}

/**
 * Converts a value stored in tenths to its display string.
 * @param {number} tenths Number of tenths to format.
 * @param {boolean} withDecimal Whether to append the decimal part.
 * @returns {string} Localized number, with or without one decimal place.
 */
function htRealCompareFormat(tenths, withDecimal) {
    var intPart = Math.floor(tenths / 10);
    var grouped = htRealCompareGrouped(intPart);
    if (!withDecimal) {
        return grouped;
    }
    return grouped + htRealCompareDecSep() + (tenths % 10);
}

/**
 * Builds an ordered pair of distinct values for the given level.
 * @param {number} level Zero-based level index (0 to 3).
 * @returns {number[]} Two distinct values stored in tenths.
 */
function htRealComparePair(level) {
    var a = 0;
    var b = 1;
    if (level === 0) {
        a = htGetRandomArbitrary(0, 10) * 10;
        b = htGetRandomArbitrary(0, 10) * 10;
        while (a === b) {
            b = htGetRandomArbitrary(0, 10) * 10;
        }
    } else if (level === 1) {
        var shared = htGetRandomArbitrary(0, 10) * 10;
        var decA = htGetRandomArbitrary(0, 10);
        var decB = htGetRandomArbitrary(0, 10);
        while (decA === decB) {
            decB = htGetRandomArbitrary(0, 10);
        }
        a = shared + decA;
        b = shared + decB;
    } else if (level === 2) {
        a = htGetRandomArbitrary(0, 100) * 10 + htGetRandomArbitrary(0, 10);
        b = htGetRandomArbitrary(0, 100) * 10 + htGetRandomArbitrary(0, 10);
        while (a === b) {
            b = htGetRandomArbitrary(0, 100) * 10 + htGetRandomArbitrary(0, 10);
        }
    } else {
        var small = htGetRandomArbitrary(0, 10) * 10 + htGetRandomArbitrary(0, 10);
        var big = htGetRandomArbitrary(1000000, 10000000) * 10 + htGetRandomArbitrary(0, 10);
        if (htGetRandomArbitrary(0, 2) === 0) {
            a = small;
            b = big;
        } else {
            a = big;
            b = small;
        }
    }
    return [a, b];
}

/**
 * Replaces the {big} and {small} placeholders in a template.
 * @param {string} template Message template.
 * @param {string} big Formatted larger value.
 * @param {string} small Formatted smaller value.
 * @returns {string} Template with all placeholders replaced.
 */
function htRealCompareFill(template, big, small) {
    return template.replace(/\{big\}/g, big).replace(/\{small\}/g, small);
}

/**
 * Shows a feedback message with the matching correct/wrong style.
 * @param {boolean} correct Whether the answer was correct.
 * @param {string} message Feedback markup to display.
 * @returns {void}
 */
function htRealCompareShowFeedback(correct, message) {
    var feedback = $("#htRealCompareFeedback");
    feedback.removeClass("htGreaterSmallerCorrect htGreaterSmallerWrong");
    feedback.addClass(correct ? "htGreaterSmallerCorrect" : "htGreaterSmallerWrong");
    feedback.html(message);
}

/**
 * Renders the current pair, operator and level indicator.
 * @returns {void}
 */
function htRealCompareRender() {
    $("#htRealCompareLeft").text(htRealCompareFormat(localRealCompare.left, localRealCompare.level !== 0));
    $("#htRealCompareRight").text(htRealCompareFormat(localRealCompare.right, localRealCompare.level !== 0));
    $("#htRealCompareOp").text(localRealCompare.level === 3 ? "≪" : "<");
    $("#htRealCompareLevel").text($("#htRealCompareLevelTemplate").text().replace("{n}", localRealCompare.level + 1));
}

/**
 * Starts a new round, optionally changing the level.
 * @param {number} [newLevel] Level to switch to; keeps the current one when omitted.
 * @returns {void}
 */
function htRealCompareSetup(newLevel) {
    if (newLevel !== undefined) {
        localRealCompare.level = newLevel;
    }
    var pair = htRealComparePair(localRealCompare.level);
    localRealCompare.left = pair[0];
    localRealCompare.right = pair[1];
    localRealCompare.answered = false;
    localRealCompare.wasCorrect = false;

    htRealCompareRender();
    $("#htRealCompareFeedback").html("").removeClass("htGreaterSmallerCorrect htGreaterSmallerWrong");
    $("#htRealCompareInBtn").prop("disabled", false);
    $("#htRealCompareNotBtn").prop("disabled", false);
    $("#htRealCompareNextBtn").addClass("hidden");
    $("#htRealCompareNextBtn").text($("#htRealCompareNextLabel").text());
}

/**
 * Checks the answer for the current pair and shows the feedback.
 * @param {boolean} userSaysInOrder Whether the player said the numbers are in order.
 * @returns {void}
 */
function htRealCompareAnswer(userSaysInOrder) {
    if (localRealCompare.answered) {
        return;
    }
    var left = localRealCompare.left;
    var right = localRealCompare.right;
    var inOrder = right > left;
    var correct = (userSaysInOrder === inOrder);
    var much = localRealCompare.level === 3;
    var big = htRealCompareFormat(Math.max(left, right), localRealCompare.level !== 0);
    var small = htRealCompareFormat(Math.min(left, right), localRealCompare.level !== 0);
    var selector;
    var message;

    localRealCompare.answered = true;
    localRealCompare.wasCorrect = correct;

    if (correct && localRealCompare.level === 3) {
        message = htRealCompareFill($("#htRealCompareMsgCorrectMuch").html(), big, small) +
            " " + $("#htRealCompareMsgFinal").html();
        htRealCompareShowFeedback(true, message);
        $("#htRealCompareNextBtn").text($("#htRealComparePlayAgain").text()).removeClass("hidden");
    } else {
        if (correct) {
            selector = much ? "#htRealCompareMsgCorrectMuch" : "#htRealCompareMsgCorrect";
        } else {
            selector = much ? "#htRealCompareMsgWrongMuch" : "#htRealCompareMsgWrong";
        }
        message = htRealCompareFill($(selector).html(), big, small);
        htRealCompareShowFeedback(correct, message);
        if (correct) {
            $("#htRealCompareNextBtn").removeClass("hidden");
        }
    }

    $("#htRealCompareInBtn").prop("disabled", true);
    $("#htRealCompareNotBtn").prop("disabled", true);
}

/**
 * Advances to the next level, or restarts after the last one.
 * @returns {void}
 */
function htRealCompareNext() {
    if (!localRealCompare.answered || !localRealCompare.wasCorrect) {
        return;
    }
    if (localRealCompare.level >= 3) {
        htRealCompareSetup(0);
    } else {
        htRealCompareSetup(localRealCompare.level + 1);
    }
}

/**
 * Initializes the game after the content page loads.
 * @returns {boolean} Always false to signal handled content loading.
 */
function htLoadContent() {
    htWriteNavigation();

    localRealCompare = { "level": 0, "left": 0, "right": 1, "answered": false, "wasCorrect": false };

    $("#htRealCompareInBtn").off("click").on("click", function() {
        htRealCompareAnswer(true);
    });

    $("#htRealCompareNotBtn").off("click").on("click", function() {
        htRealCompareAnswer(false);
    });

    $("#htRealCompareNewBtn").off("click").on("click", function() {
        htRealCompareSetup();
    });

    $("#htRealCompareNextBtn").off("click").on("click", function() {
        htRealCompareNext();
    });

    htRealCompareSetup(0);

    return false;
}
