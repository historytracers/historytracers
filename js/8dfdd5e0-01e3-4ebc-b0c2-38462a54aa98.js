// SPDX-License-Identifier: GPL-3.0-or-later

// Game that trains odd and even numbers by sharing circles into pairs, plus a
// practice that compares three strings by length and color.
// The localized texts (button labels and explanations) live in the class
// JSON, so this file only wires the behavior and draws the markup.

var localOddEven = {};

function htOddEvenFillText(template, number, quotient) {
    return template.replace(/\{n\}/g, number).replace(/\{q\}/g, quotient);
}

function htOddEvenDraw(number) {
    var leftSide = Math.ceil(number / 2);
    var rightSide = Math.floor(number / 2);
    var rows = leftSide;
    var circle = "<span class=\"htOddEvenCircle\"></span>";
    var body = "";

    for (var i = 0; i < rows; i++) {
        body += "<tr>";
        body += "<td>" + circle + "</td>";
        body += (i < rightSide) ? "<td>" + circle + "</td>" : "<td></td>";
        body += "</tr>";
    }

    $("#oddEvenPairsBody").html(body);
}

function htOddEvenShowFeedback(correct, message) {
    var feedback = $("#oddEvenFeedback");
    feedback.removeClass("htOddEvenCorrect htOddEvenWrong");
    feedback.addClass(correct ? "htOddEvenCorrect" : "htOddEvenWrong");
    feedback.html(message);
}

function htOddEvenAnswer(choiceIsOdd) {
    if (localOddEven.answered) {
        return;
    }

    var number = localOddEven.number;
    var isOdd = (number % 2) === 1;
    var quotient = Math.floor(number / 2);
    var correct = (choiceIsOdd === isOdd);
    var selector = "#htOddEvenMsg";

    if (correct) {
        selector += isOdd ? "OddCorrect" : "EvenCorrect";
    } else {
        selector += isOdd ? "OddWrong" : "EvenWrong";
    }

    var template = $(selector).html();
    htOddEvenShowFeedback(correct, htOddEvenFillText(template, number, quotient));

    localOddEven.answered = true;
    $("#oddEvenNewBtn").removeClass("hidden");
}

function htOddEvenNewNumber() {
    localOddEven.number = htGetRandomArbitrary(0, 21);
    localOddEven.answered = false;

    $("#oddEvenNumber").text(localOddEven.number);
    htOddEvenDraw(localOddEven.number);

    $("#oddEvenFeedback").html("").removeClass("htOddEvenCorrect htOddEvenWrong");
    $("#oddEvenNewBtn").addClass("hidden");
}

//
// Practice: compare three strings by length and color.
//

var localStrings = {};

function htStringsMaxLength() {
    return 10;
}

function htStringsBuildTrack(trackId, length, colorClass) {
    var max = htStringsMaxLength();
    var cells = "";

    for (var i = 1; i <= max; i++) {
        cells += "<span class=\"htStringsUnit" + (i <= length ? " " + colorClass : "") + "\"></span>";
    }

    $("#" + trackId).html(cells);
}

function htStringsBuildRuler() {
    var max = htStringsMaxLength();
    var cells = "";

    for (var i = 1; i <= max; i++) {
        cells += "<span class=\"htStringsTick\">" + i + "</span>";
    }

    $("#htStringsRuler").html(cells);
}

function htStringsFillTemplate(template, a, b, la, lb) {
    return template
        .replace(/\{a\}/g, a)
        .replace(/\{b\}/g, b)
        .replace(/\{la\}/g, la)
        .replace(/\{lb\}/g, lb);
}

function htStringsComparison(a, b) {
    var la = localStrings.lengths[a];
    var lb = localStrings.lengths[b];
    var sameColor = (localStrings.colors[a] === localStrings.colors[b]);
    var sameLength = (la === lb);
    var selector;

    if (sameLength && sameColor) {
        selector = "#htStringsMsgEqual";
    } else if (sameColor) {
        selector = "#htStringsMsgSameColorDiffLength";
    } else if (sameLength) {
        selector = "#htStringsMsgDiffColorSameLength";
    } else {
        selector = "#htStringsMsgDiffColorDiffLength";
    }

    return htStringsFillTemplate($(selector).html(), a, b, la, lb);
}

function htStringsRender() {
    for (var i = 1; i <= 3; i++) {
        htStringsBuildTrack("htStringsTrack" + i, localStrings.lengths[i], localStrings.colors[i]);
    }

    var pairs = [[1, 2], [1, 3], [2, 3]];
    var html = "";

    for (var p = 0; p < pairs.length; p++) {
        html += "<p class=\"htStringsComparison\">" + htStringsComparison(pairs[p][0], pairs[p][1]) + "</p>";
    }

    $("#htStringsComparisons").html(html);
}

function htStringsChange(index, delta) {
    var value = localStrings.lengths[index] + delta;

    if (value < 1) {
        value = 1;
    } else if (value > htStringsMaxLength()) {
        value = htStringsMaxLength();
    }

    localStrings.lengths[index] = value;
    htStringsRender();
}

function htStringsInit() {
    localStrings = {
        "lengths": { "1": 4, "2": 4, "3": 5 },
        "colors": { "1": "htStringsColorBlue", "2": "htStringsColorOrange", "3": "htStringsColorOrange" }
    };

    htStringsBuildRuler();
    htStringsRender();

    $(".htStringsPlus").on("click", function() {
        htStringsChange(parseInt($(this).data("htstring")), 1);
    });

    $(".htStringsMinus").on("click", function() {
        htStringsChange(parseInt($(this).data("htstring")), -1);
    });
}

function htLoadContent() {
    htWriteNavigation();

    localOddEven = { "number": 0, "answered": false };

    $("#oddEvenOddBtn").on("click", function() {
        htOddEvenAnswer(true);
    });

    $("#oddEvenEvenBtn").on("click", function() {
        htOddEvenAnswer(false);
    });

    $("#oddEvenNewBtn").on("click", function() {
        htOddEvenNewNumber();
    });

    htOddEvenNewNumber();
    htStringsInit();

    return false;
}
