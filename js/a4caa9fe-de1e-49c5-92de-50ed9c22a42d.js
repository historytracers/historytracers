// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing addition" exercise (content a4caa9fe-de1e-49c5-92de-50ed9c22a42d).
// Two three-digit numbers are added column by column, from the units upwards.
// The addition is laid out vertically, the way it is normally written. Below the
// board, every square of the column is shown from the start: the value already
// in the column is light blue and the bottom digit to be added is made of
// neutral squares that turn light yellow as the player clicks the buttons. When
// the count of a column reaches ten, those ten squares are grouped and become
// the 1 carried to the next order. The localized texts live in the class JSON,
// so this file only wires the behavior and draws the board.

var localAdd = {};

var HT_ADD_DIGITS = 3;

function htAddOrderName(order) {
    return $("#htAddOrder" + order).text();
}

// Returns the digits of value from the units order upwards (index 0 = units).
function htAddDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

function htAddReplace(template, values) {
    for (var key in values) {
        template = template.replace(new RegExp("\\{" + key + "\\}", "g"), values[key]);
    }
    return template;
}

// Draws the vertical addition: the carry row, the two operands with the + sign,
// the result line and the result row. The column being solved is highlighted and
// a column shows its result digit only once it has been solved.
function htAddBuildBoard() {
    var d = HT_ADD_DIGITS;
    var current = localAdd.column;
    var fDigits = localAdd.firstDigits;
    var aDigits = localAdd.addendDigits;

    function opCell(content) {
        return "<td class=\"htAddOp\">" + content + "</td>";
    }
    function cell(order, content) {
        var cls = "htAddCell" + (order === current ? " htAddCellActive" : "");
        return "<td class=\"" + cls + "\" data-order=\"" + order + "\">" + content + "</td>";
    }

    var rows = "";
    // The carry out of column c is written above column c + 1.
    rows += "<tr class=\"htAddCarryRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        var carryVal = "";
        if (o >= 1 && localAdd.carries[o - 1] !== undefined) {
            carryVal = localAdd.carries[o - 1] ? "1" : "";
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
    // Added operand, with the + sign in its own narrow column.
    rows += "<tr>" + opCell("+");
    for (var o = d; o >= 0; o--) {
        rows += cell(o, o < d ? String(aDigits[o]) : "");
    }
    rows += "</tr>";
    // Line
    rows += "<tr class=\"htAddLine\"><td colspan=\"" + (d + 2) + "\"></td></tr>";
    // Result
    rows += "<tr class=\"htAddResultRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        var res = (localAdd.results[o] !== undefined) ? String(localAdd.results[o]) : "";
        rows += cell(o, res);
    }
    rows += "</tr>";

    $("#htAddTable").html(rows);
}

// Draws the squares of the column. The whole column is shown from the start:
// the "base" light blue squares are the value already in the column and the
// remaining squares stand for the bottom digit to be added. Each click turns
// one of those squares light yellow, and the ones not filled yet stay neutral.
// Once the count reaches ten, those ten squares are grouped, showing the 1 that
// goes to the next order, and the squares left outside the group show the digit
// that stays in the column.
function htAddDrawSquares() {
    var base = localAdd.base;
    var addend = localAdd.addendDigit;
    var added = localAdd.added;
    var total = base + addend;
    var html = "";
    var i;

    function square(index) {
        var cls;
        if (index < base) {
            cls = "htAddSquareBase";
        } else if (index - base < added) {
            cls = "htAddSquareAdded";
        } else {
            cls = "htAddSquarePending";
        }
        return "<span class=\"htAddSquare " + cls + "\"></span>";
    }

    if (total >= 10) {
        html += "<span class=\"htAddTenGroup\">";
        for (i = 0; i < 10; i++) {
            html += square(i);
        }
        html += "</span>";
        for (i = 10; i < total; i++) {
            html += square(i);
        }
    } else {
        for (i = 0; i < total; i++) {
            html += square(i);
        }
    }

    $("#htAddSquares").html(html);
    $("#htAddSquaresCaption").text(base + " + " + added + " = " + (base + added));
}

// Prepares the column that must be solved next.
function htAddSetupColumn() {
    var column = localAdd.column;
    var firstDigit = localAdd.firstDigits[column];
    var addendDigit = localAdd.addendDigits[column];
    var base = firstDigit + localAdd.incoming;
    var order = htAddOrderName(column);

    localAdd.answered = false;
    localAdd.firstDigit = firstDigit;
    localAdd.addendDigit = addendDigit;
    localAdd.base = base;
    localAdd.added = 0;

    $("#htAddQuestion").text(htAddReplace($("#htAddQuestionTemplate").text(), {
        order: order,
        base: base
    }));

    // When a 1 comes from the previous column, say it explicitly: it is the
    // reason the value already in this column is not just the first digit.
    if (localAdd.incoming > 0) {
        $("#htAddIncomingNote").text(htAddReplace($("#htAddIncomingTemplate").text(), {
            first: firstDigit,
            base: base
        })).removeClass("htAddHidden");
    } else {
        $("#htAddIncomingNote").text("").addClass("htAddHidden");
    }

    $("#htAddFeedback").html("");
    $("#htAddNextBtn").addClass("hidden");
    $("#htAddUpBtn").prop("disabled", false);
    $("#htAddDownBtn").prop("disabled", false);

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htAddBuildBoard();
    htAddDrawSquares();

    // A bottom digit of 0 needs nothing added, so the column is already solved.
    if (addendDigit === 0) {
        htAddResolve();
    }
}

// The buttons add or remove one yellow square at a time. The column is solved
// as soon as the squares added match the bottom digit of the second number.
function htAddChange(delta) {
    if (localAdd.answered) {
        return;
    }

    var next = localAdd.added + delta;
    if (next < 0) {
        next = 0;
    }
    if (next > localAdd.addendDigit) {
        next = localAdd.addendDigit;
    }
    localAdd.added = next;
    htAddDrawSquares();

    if (localAdd.added === localAdd.addendDigit) {
        htAddResolve();
    }
}

// Records the result digit of the column and the 1 it carries, if any.
function htAddResolve() {
    if (localAdd.answered) {
        return;
    }
    localAdd.answered = true;

    var column = localAdd.column;
    var sum = localAdd.base + localAdd.added;
    var carry = sum >= 10;
    var order = htAddOrderName(column);

    localAdd.carries[column] = carry ? 1 : 0;
    localAdd.results[column] = sum % 10;
    localAdd.lastCarry = carry ? 1 : 0;

    htAddBuildBoard();

    var template = carry ? $("#htAddMsgCarryTemplate").html() : $("#htAddMsgNoCarryTemplate").html();
    $("#htAddFeedback").html(htAddReplace(template, {
        base: localAdd.base,
        added: localAdd.added,
        sum: sum,
        result: sum % 10,
        order: order
    }));

    $("#htAddUpBtn").prop("disabled", true);
    $("#htAddDownBtn").prop("disabled", true);

    if (column >= HT_ADD_DIGITS - 1) {
        // The whole addition is done. A carry out of the last column created a
        // new order on the left, which holds only the carried 1.
        if (carry) {
            localAdd.results[HT_ADD_DIGITS] = 1;
            htAddBuildBoard();
        }
        $("#htAddFeedback").append("<br /><i class=\"fa-solid fa-medal\" style=\"font-size: 4em; color: gold;\"></i>");
        $("#htAddNextBtn").text($("#htAddPlayAgainLabel").text()).removeClass("hidden");
    } else {
        $("#htAddNextBtn").text($("#htAddNextColumnLabel").text()).removeClass("hidden");
    }
}

// Moves to the next column of the same addition, bringing the carry along, or
// starts a new addition once the last column is done.
function htAddNext() {
    if (!localAdd.answered) {
        return;
    }

    if (localAdd.column >= HT_ADD_DIGITS - 1) {
        htAddNewProblem();
        return;
    }

    localAdd.column += 1;
    localAdd.incoming = localAdd.lastCarry;
    htAddSetupColumn();
}

function htAddBuildOrders() {
    var html = "";
    for (var i = 0; i < HT_ADD_DIGITS; i++) {
        html += "<span class=\"htAddOrder\" data-order=\"" + i + "\">" + htAddOrderName(i) + "</span>";
    }
    $("#htAddOrders").html(html);
}

function htAddNewProblem() {
    localAdd.first = htGetRandomArbitrary(100, 1000);
    localAdd.addend = htGetRandomArbitrary(100, 1000);
    localAdd.firstDigits = htAddDigits(localAdd.first, HT_ADD_DIGITS);
    localAdd.addendDigits = htAddDigits(localAdd.addend, HT_ADD_DIGITS);
    localAdd.column = 0;
    localAdd.incoming = 0;
    localAdd.carries = {};
    localAdd.results = {};

    htAddSetupColumn();
}

function htLoadContent() {
    htWriteNavigation();

    localAdd = {
        first: 0,
        addend: 0,
        firstDigits: [],
        addendDigits: [],
        column: 0,
        incoming: 0,
        carries: {},
        results: {},
        base: 0,
        added: 0,
        addendDigit: 0,
        answered: false,
        lastCarry: 0
    };

    htAddBuildOrders();

    $("#htAddUpBtn").off("click").on("click", function() {
        htAddChange(1);
    });

    $("#htAddDownBtn").off("click").on("click", function() {
        htAddChange(-1);
    });

    $("#htAddNextBtn").off("click").on("click", function() {
        htAddNext();
    });

    htAddNewProblem();

    return false;
}
