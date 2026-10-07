// SPDX-License-Identifier: GPL-3.0-or-later

// "Carry or Not Carry?" game (content 5539096c-dd7d-4f9c-a137-f0465725b9f4).
// Reinforces "Advancing an Order and the Complement"
// (cabc9843-35ef-4e4f-92fd-17eda864b55e): at each order (units, tens, hundreds
// and thousands) the player decides whether a column carries 1, comparing the
// digit being added with the complement to 10 of the digit already in the
// column. The localized texts live in the class JSON, so this file only wires
// the behavior and draws the board.

var localCarryGame = {};

function htCarryOrderName(level) {
    return $("#htCarryOrder" + level).text();
}

function htCarryFill(template, first, addend, comp, sum, order) {
    return template
        .replace(/\{first\}/g, first)
        .replace(/\{addend\}/g, addend)
        .replace(/\{comp\}/g, comp)
        .replace(/\{sum\}/g, sum)
        .replace(/\{order\}/g, order);
}

function htCarryBuildOrders() {
    var html = "";
    for (var i = 0; i < 4; i++) {
        html += "<span class=\"htCarryOrder\" data-level=\"" + i + "\">" + htCarryOrderName(i) + "</span>";
    }
    $("#htCarryOrders").html(html);
}

// Draws the ten squares of the complement: "first" light blue squares are the
// digit already in the column and "comp" light yellow squares complete the 10.
function htCarryDrawSquares(first, comp) {
    var html = "";
    for (var i = 0; i < first; i++) {
        html += "<span class=\"htCarrySquare htCarrySquareFirst\"></span>";
    }
    for (var j = 0; j < comp; j++) {
        html += "<span class=\"htCarrySquare htCarrySquareComplement\"></span>";
    }
    $("#htCarrySquares").html(html);
    $("#htCarrySquaresCaption").text(first + " + " + comp + " = 10");
}

function htCarryShowFeedback(correct, message) {
    var feedback = $("#htCarryFeedback");
    feedback.removeClass("htCarryCorrect htCarryWrong");
    feedback.addClass(correct ? "htCarryCorrect" : "htCarryWrong");
    feedback.html(message);
}

function htCarryNewQuestion() {
    var level = localCarryGame.level;
    localCarryGame.answered = false;

    // Decide the expected answer first, then pick digits that produce it, so
    // every level can be either a carry or a non-carry.
    var carry = Math.random() < 0.5;
    var first = htGetRandomArbitrary(1, 10); // 1..9
    var comp = 10 - first;                   // 1..9
    var addend;
    if (carry) {
        addend = htGetRandomArbitrary(comp, 10); // comp..9, the complement or more
    } else {
        addend = htGetRandomArbitrary(0, comp);  // 0..comp-1, less than the complement
    }

    localCarryGame.carry = carry;
    localCarryGame.first = first;
    localCarryGame.addend = addend;

    var order = htCarryOrderName(level);
    $("#htCarryLevel").text($("#htCarryLevelTemplate").text().replace("{n}", level + 1));
    $("#htCarryQuestion").text($("#htCarryQuestionTemplate").text().replace("{order}", order));

    $("#htCarryFirst").text(first);
    $("#htCarryAddend").text(addend);
    $("#htCarryCarryValue").text("");
    $("#htCarryTensResult").text("").removeClass("htCarryCarry");
    $("#htCarryUnitsResult").text("");

    $("#htCarryFeedback").html("").removeClass("htCarryCorrect htCarryWrong");
    $("#htCarrySquares").html("");
    $("#htCarrySquaresCaption").text("");
    $("#htCarrySquaresWrap").addClass("htCarryHidden");
    $("#htCarryNextBtn").addClass("hidden");

    $("#htCarryBtn").prop("disabled", false);
    $("#htCarryNotBtn").prop("disabled", false);

    $(".htCarryOrder").removeClass("htCarryOrderActive");
    $(".htCarryOrder[data-level='" + level + "']").addClass("htCarryOrderActive");
}

function htCarryAnswer(choseCarry) {
    if (localCarryGame.answered) {
        return;
    }

    var first = localCarryGame.first;
    var addend = localCarryGame.addend;
    var comp = 10 - first;
    var sum = first + addend;
    var carry = sum >= 10;
    var order = htCarryOrderName(localCarryGame.level);
    var correct = (choseCarry === carry);
    var selector;

    if (correct) {
        selector = carry ? "#htCarryMsgCarryCorrect" : "#htCarryMsgNotCorrect";
    } else {
        selector = carry ? "#htCarryMsgNotWrong" : "#htCarryMsgCarryWrong";
    }

    var template = $(selector).html();
    htCarryShowFeedback(correct, htCarryFill(template, first, addend, comp, sum, order));

    // Reveal the exact moment described by the text: the carried 1 appears
    // above the operands and the units digit stays between 0 and 9.
    $("#htCarryCarryValue").text(carry ? 1 : "");
    $("#htCarryTensResult").text(carry ? 1 : "").toggleClass("htCarryCarry", carry);
    $("#htCarryUnitsResult").text(sum % 10);

    htCarryDrawSquares(first, comp);
    $("#htCarrySquaresWrap").removeClass("htCarryHidden");

    $("#htCarryBtn").prop("disabled", true);
    $("#htCarryNotBtn").prop("disabled", true);

    localCarryGame.answered = true;

    var lastLevel = localCarryGame.level >= 3;
    $("#htCarryNextBtn")
        .text(lastLevel ? $("#htCarryPlayAgainLabel").text() : $("#htCarryNextLabel").text())
        .removeClass("hidden");
}

function htCarryNextLevel() {
    if (!localCarryGame.answered) {
        return;
    }
    localCarryGame.level = (localCarryGame.level + 1) % 4;
    htCarryNewQuestion();
}

function htLoadContent() {
    htWriteNavigation();

    localCarryGame = { "level": 0, "answered": false, "first": 0, "addend": 0, "carry": false };

    htCarryBuildOrders();

    $("#htCarryBtn").off("click").on("click", function() {
        htCarryAnswer(true);
    });

    $("#htCarryNotBtn").off("click").on("click", function() {
        htCarryAnswer(false);
    });

    $("#htCarryNextBtn").off("click").on("click", function() {
        htCarryNextLevel();
    });

    htCarryNewQuestion();

    return false;
}
