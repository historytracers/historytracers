// SPDX-License-Identifier: GPL-3.0-or-later

// "Carry or Not Carry?" game (content 5539096c-dd7d-4f9c-a137-f0465725b9f4).
// Reinforces "Advancing an Order and the Complement"
// (cabc9843-35ef-4e4f-92fd-17eda864b55e). Each level uses two whole numbers of
// the order being studied (units: 0-9, tens: 10-99, hundreds: 100-999,
// thousands: 1000-9999) and walks through its columns from the units upwards,
// asking at each one whether it carries 1. The digit already in the column is
// the digit of the first number plus the 1 carried from the previous column,
// and the player compares the digit being added with its complement to 10.
// The localized texts live in the class JSON, so this file only wires the
// behavior and draws the board.

var localCarryGame = {};

function htCarryOrderName(level) {
    return $("#htCarryOrder" + level).text();
}

// Returns the digits of value from the units order upwards (index 0 = units).
function htCarryDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

function htCarryNumberFromDigits(digits) {
    var n = 0;
    for (var i = digits.length - 1; i >= 0; i--) {
        n = n * 10 + digits[i];
    }
    return n;
}

function htCarryDigitAt(value, order) {
    return Math.floor(value / Math.pow(10, order)) % 10;
}

function htCarryFill(template, base, addend, comp, sum, order) {
    return template
        .replace(/\{base\}/g, base)
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

// Draws the ten squares of the complement: "base" light blue squares are the
// value already in the column and "comp" light yellow squares complete the 10.
function htCarryDrawSquares(base, comp) {
    var html = "";
    for (var i = 0; i < base; i++) {
        html += "<span class=\"htCarrySquare htCarrySquareFirst\"></span>";
    }
    for (var j = 0; j < comp; j++) {
        html += "<span class=\"htCarrySquare htCarrySquareComplement\"></span>";
    }
    $("#htCarrySquares").html(html);
    $("#htCarrySquaresCaption").text(base + " + " + comp + " = 10");
}

function htCarryShowFeedback(correct, message) {
    var feedback = $("#htCarryFeedback");
    feedback.removeClass("htCarryCorrect htCarryWrong");
    feedback.addClass(correct ? "htCarryCorrect" : "htCarryWrong");
    feedback.html(message);
}

// Draws the vertical addition of the two whole numbers. The column being
// studied is highlighted; the columns already solved show their result digit
// and, above the next column, the 1 they carried. The + sign is written in the
// leftmost column, right next to the number, so the digits stay close.
function htCarryBuildBoard() {
    var level = localCarryGame.level;
    var d = level + 1;
    var first = localCarryGame.first;
    var addend = localCarryGame.addend;
    var current = localCarryGame.column;
    var carries = localCarryGame.carries;
    var results = localCarryGame.results;
    var fDigits = htCarryDigits(first, d);
    var aDigits = htCarryDigits(addend, d);

    function opCell(content) {
        return "<td class=\"htCarryOp\">" + content + "</td>";
    }
    function cell(order, content, idAttr) {
        var cls = "htCarryCell" + (order === current ? " htCarryCellActive" : "");
        return "<td class=\"" + cls + "\" data-order=\"" + order + "\"" + (idAttr || "") + ">" + content + "</td>";
    }

    var rows = "";
    // Carry row: the carry out of column c is written above column c + 1.
    rows += "<tr class=\"htCarryCarryRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        var carryVal = "";
        if (o >= 1 && carries[o - 1] !== undefined) {
            carryVal = carries[o - 1] ? "1" : "";
        }
        rows += cell(o, carryVal);
    }
    rows += "</tr>";
    // First operand
    rows += "<tr>" + opCell("");
    for (var o = d; o >= 0; o--) {
        rows += cell(o, o < d ? String(fDigits[o]) : "");
    }
    rows += "</tr>";
    // Added operand: the + has its own narrow column, so the carry of the last
    // order is never written on top of the plus sign.
    rows += "<tr>" + opCell("+");
    for (var o = d; o >= 0; o--) {
        rows += cell(o, o < d ? String(aDigits[o]) : "");
    }
    rows += "</tr>";
    // Line
    rows += "<tr class=\"htCarryLine\"><td colspan=\"" + (d + 2) + "\"></td></tr>";
    // Result: a column shows its digit only once it has been solved, so the
    // leading 1 of an addition waits for the player to verify the new order
    // created by the final carry instead of appearing on its own.
    rows += "<tr class=\"htCarryResultRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        var res = (results[o] !== undefined) ? String(results[o]) : "";
        rows += cell(o, res, " id=\"htCarryResult" + o + "\"");
    }
    rows += "</tr>";

    $("#htCarryTable").html(rows);
}

// Prepares the column of the current level that must be answered next.
function htCarrySetupColumn() {
    var level = localCarryGame.level;
    var column = localCarryGame.column;
    localCarryGame.answered = false;

    var firstDigit = htCarryDigitAt(localCarryGame.first, column);
    var addendDigit = htCarryDigitAt(localCarryGame.addend, column);
    var base = localCarryGame.incoming + firstDigit;
    var comp = 10 - base;

    localCarryGame.firstDigit = firstDigit;
    localCarryGame.addendDigit = addendDigit;
    localCarryGame.base = base;
    localCarryGame.comp = comp;

    var order = htCarryOrderName(column);
    $("#htCarryLevel").text($("#htCarryLevelTemplate").text().replace("{n}", level + 1));
    $("#htCarryQuestion").text($("#htCarryQuestionTemplate").text().replace("{order}", order));

    // When a 1 comes from the previous column, say it explicitly: it is the
    // reason the digit already in this column is not just the first digit.
    if (localCarryGame.incoming > 0) {
        var note = $("#htCarryIncomingTemplate").text()
            .replace("{first}", firstDigit)
            .replace("{base}", base);
        $("#htCarryIncomingNote").text(note).removeClass("htCarryHidden");
    } else {
        $("#htCarryIncomingNote").text("").addClass("htCarryHidden");
    }

    htCarryBuildBoard();

    $("#htCarryFeedback").html("").removeClass("htCarryCorrect htCarryWrong");
    $("#htCarrySquares").html("");
    $("#htCarrySquaresCaption").text("");
    $("#htCarrySquaresWrap").addClass("htCarryHidden");
    $("#htCarryNextBtn").addClass("hidden");

    $("#htCarryBtn").prop("disabled", false);
    $("#htCarryNotBtn").prop("disabled", false);

    $(".htCarryOrder").removeClass("htCarryOrderActive");
    $(".htCarryOrder[data-level='" + column + "']").addClass("htCarryOrderActive");
}

// Starts a level: builds two whole numbers in the range of its order and
// begins with the units column.
function htCarryStartLevel(level) {
    localCarryGame.level = level;
    localCarryGame.column = 0;
    localCarryGame.incoming = 0;
    localCarryGame.carries = {};
    localCarryGame.results = {};
    localCarryGame.answered = false;

    var d = level + 1;
    var fDigits = [];
    var aDigits = [];
    for (var i = 0; i < d; i++) {
        if (i === d - 1) {
            // The order studied at this level is the leading order. For the
            // units level a whole number may be 0; above it the leading digit
            // is never 0, so the operands stay in the announced range.
            fDigits[i] = (d === 1) ? htGetRandomArbitrary(0, 10) : htGetRandomArbitrary(1, 10);
            aDigits[i] = (d === 1) ? htGetRandomArbitrary(0, 10) : htGetRandomArbitrary(1, 10);
        } else {
            fDigits[i] = htGetRandomArbitrary(0, 10);
            aDigits[i] = htGetRandomArbitrary(0, 10);
        }
    }

    localCarryGame.first = htCarryNumberFromDigits(fDigits);
    localCarryGame.addend = htCarryNumberFromDigits(aDigits);

    htCarrySetupColumn();
}

function htCarryAnswer(choseCarry) {
    if (localCarryGame.answered) {
        return;
    }

    var column = localCarryGame.column;
    var base = localCarryGame.base;
    var addendDigit = localCarryGame.addendDigit;
    var comp = localCarryGame.comp;
    var columnSum = base + addendDigit;
    var carry = columnSum >= 10;
    var order = htCarryOrderName(column);
    var correct = (choseCarry === carry);
    var selector;

    if (correct) {
        selector = carry ? "#htCarryMsgCarryCorrect" : "#htCarryMsgNotCorrect";
    } else {
        selector = carry ? "#htCarryMsgNotWrong" : "#htCarryMsgCarryWrong";
    }

    var template = $(selector).html();
    htCarryShowFeedback(correct, htCarryFill(template, base, addendDigit, comp, columnSum, order));

    // Record this column so the board shows its result and the carry it sends
    // to the next column.
    localCarryGame.carries[column] = carry ? 1 : 0;
    localCarryGame.results[column] = columnSum % 10;
    localCarryGame.lastCarry = carry ? 1 : 0;
    localCarryGame.answered = true;

    htCarryBuildBoard();

    htCarryDrawSquares(base, comp);
    $("#htCarrySquaresWrap").removeClass("htCarryHidden");

    $("#htCarryBtn").prop("disabled", true);
    $("#htCarryNotBtn").prop("disabled", true);

    // The next step is another column when a lower column remains, or when the
    // last column carried and the new order still has to be verified.
    var nextIsColumn = (column < localCarryGame.level) ||
        (column === localCarryGame.level && carry);
    var label;
    if (nextIsColumn) {
        label = $("#htCarryNextColumnLabel").text();
    } else if (localCarryGame.level >= 3) {
        label = $("#htCarryPlayAgainLabel").text();
    } else {
        label = $("#htCarryNextLabel").text();
    }
    $("#htCarryNextBtn").text(label).removeClass("hidden");
}

function htCarryNext() {
    if (!localCarryGame.answered) {
        return;
    }

    var column = localCarryGame.column;
    var level = localCarryGame.level;

    if (column < level) {
        // Move to the next column of the same level, bringing the carry along.
        localCarryGame.column = column + 1;
        localCarryGame.incoming = localCarryGame.lastCarry;
        htCarrySetupColumn();
    } else if (column === level && localCarryGame.lastCarry) {
        // The last column carried, so a new order appeared on the left. Before
        // its 1 is taken for granted, let the player verify that this new order
        // does not carry again (it holds only the carried 1).
        localCarryGame.column = level + 1;
        localCarryGame.incoming = 1;
        htCarrySetupColumn();
    } else {
        // The whole level (all its columns) is done.
        htCarryStartLevel((level + 1) % 4);
    }
}

function htLoadContent() {
    htWriteNavigation();

    htCarryBuildOrders();

    $("#htCarryBtn").off("click").on("click", function() {
        htCarryAnswer(true);
    });

    $("#htCarryNotBtn").off("click").on("click", function() {
        htCarryAnswer(false);
    });

    $("#htCarryNextBtn").off("click").on("click", function() {
        htCarryNext();
    });

    htCarryStartLevel(0);

    return false;
}
