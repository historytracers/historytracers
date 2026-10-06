// SPDX-License-Identifier: GPL-3.0-or-later

// Game that trains odd and even numbers by sharing circles into pairs.
// The localized texts (button labels and explanations) live in the class
// JSON, so this file only wires the behavior and draws the circles.

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
    $("#oddEvenNext").css("display", "inline-block").css("visibility", "visible");
}

function htOddEvenNewNumber() {
    localOddEven.number = htGetRandomArbitrary(0, 21);
    localOddEven.answered = false;

    $("#oddEvenNumber").text(localOddEven.number);
    htOddEvenDraw(localOddEven.number);

    $("#oddEvenFeedback").html("").removeClass("htOddEvenCorrect htOddEvenWrong");
    $("#oddEvenNext").css("display", "none").css("visibility", "hidden");
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

    $("#oddEvenNext").on("click", function() {
        htOddEvenNewNumber();
    });

    htOddEvenNewNumber();

    return false;
}
