// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing subtraction" exercise (content 4736db57-6444-4631-b3c8-08e4d1e35688).
// Two three-digit numbers are subtracted column by column, from the units upwards.
// The subtraction is laid out vertically, the way it is normally written. Below the
// board, every square available in the column is shown from the start: the value
// already in the column is light blue and the squares removed with the buttons turn
// light yellow. When the top digit is smaller than the bottom digit, ten squares are
// borrowed from the next order; those ten squares are grouped, the bottom digit is
// removed from the group, and the squares left in it are the complement to ten. The
// localized texts live in the class JSON, so this file only wires the behavior and
// draws the board.

var localSub = {};

var HT_SUB_DIGITS = 3;

function htSubOrderName(order) {
    return $("#htSubOrder" + order).text();
}

// Returns the digits of value from the units order upwards (index 0 = units).
function htSubDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

function htSubReplace(template, values) {
    for (var key in values) {
        template = template.replace(new RegExp("\\{" + key + "\\}", "g"), values[key]);
    }
    return template;
}

// Draws the vertical subtraction: the borrow row, the two operands with the - sign,
// the result line and the result row. The column being solved is highlighted and a
// column shows its result digit only once it has been solved.
function htSubBuildBoard() {
    var d = HT_SUB_DIGITS;
    var current = localSub.column;
    var tDigits = localSub.topDigits;
    var bDigits = localSub.bottomDigits;

    function opCell(content) {
        return "<td class=\"htAddOp\">" + content + "</td>";
    }
    function cell(order, content) {
        var cls = "htAddCell" + (order === current ? " htAddCellActive" : "");
        return "<td class=\"" + cls + "\" data-order=\"" + order + "\">" + content + "</td>";
    }

    var rows = "";
    // The regrouped minuend is written above the original digits.
    rows += "<tr class=\"htAddCarryRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        rows += cell(o, localSub.regroup[o] !== undefined ? String(localSub.regroup[o]) : "");
    }
    rows += "</tr>";
    // Minuend
    rows += "<tr>" + opCell("");
    for (var o = d; o >= 0; o--) {
        var minuendCell = "";
        if (o < d) {
            minuendCell = String(tDigits[o]);
            if (localSub.regroup[o] !== undefined) {
                minuendCell = "<span class=\"htAddStruck\">" + minuendCell + "</span>";
            }
        }
        rows += cell(o, minuendCell);
    }
    rows += "</tr>";
    // Subtrahend, with the - sign in its own narrow column.
    rows += "<tr>" + opCell("-");
    for (var o = d; o >= 0; o--) {
        rows += cell(o, o < d ? String(bDigits[o]) : "");
    }
    rows += "</tr>";
    // Line
    rows += "<tr class=\"htAddLine\"><td colspan=\"" + (d + 2) + "\"></td></tr>";
    // Result
    rows += "<tr class=\"htAddResultRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        var res = "";
        if (localSub.results[o] !== undefined) {
            res = String(localSub.results[o]);
        } else if (o === current && localSub.started) {
            // Live result while the squares are being removed.
            res = String(localSub.base - localSub.removed);
        }
        rows += cell(o, res);
    }
    rows += "</tr>";

    $("#htSubTable").html(rows);
}

// Draws the squares of the column. The light blue squares are the value available
// in the column and each click turns one of them light yellow, as it is removed.
// When the column needs to borrow, a group of ten squares is shown first: the
// bottom digit is removed from that group and the squares left in it, outlined,
// are the complement to ten. The squares already in the column stay outside the
// group and are added to the complement to form the result digit.
function htSubDrawSquares() {
    var base = localSub.base;
    var removed = localSub.removed;
    var bottom = localSub.bottomDigit;
    var borrowed = localSub.borrowed;
    var outside = borrowed ? base - 10 : base;
    var html = "";
    var i;

    function square(index, inTen) {
        var cls = "htAddSquare";
        if (index < removed) {
            cls += " htAddSquareRemoved";
        } else {
            cls += " htAddSquareBase";
        }
        // Complement squares: the part of the borrowed ten that stays after the
        // bottom digit has been removed.
        if (inTen && index >= bottom) {
            cls += " htAddSquareComplement";
        }
        return "<span class=\"" + cls + "\"></span>";
    }

    if (borrowed) {
        html += "<span class=\"htAddTenGroup\">";
        for (i = 0; i < 10; i++) {
            html += square(i, true);
        }
        html += "</span>";
        for (i = 0; i < outside; i++) {
            html += "<span class=\"htAddSquare htAddSquareBase\"></span>";
        }
    } else {
        for (i = 0; i < base; i++) {
            html += square(i, false);
        }
    }

    $("#htSubSquares").html(html);
    $("#htSubSquaresCaption").text(base + " - " + removed + " = " + (base - removed));
    htSubUpdateSquaresNote();
}

// Spells out how many squares have been removed and how many remain. In a column
// that borrows, it also shows the complement to ten and the squares already in
// the column, so the learner can follow the regrouping step by step.
function htSubUpdateSquaresNote() {
    var note;
    if (localSub.borrowed) {
        note = htSubReplace($("#htSubBorrowSquaresTemplate").text(), {
            removed: localSub.removed,
            bottom: localSub.bottomDigit,
            comp: 10 - localSub.bottomDigit,
            remaining: 10 - localSub.removed,
            outside: localSub.base - 10
        });
    } else {
        note = htSubReplace($("#htSubSquaresUsedTemplate").text(), {
            removed: localSub.removed,
            remaining: localSub.base - localSub.removed
        });
    }

    $("#htSubSquaresNote").text(note);
}

// Prepares the column that must be solved next. A 1 borrowed by the previous
// column is taken from the top digit; if the top digit is then smaller than the
// bottom digit, the column borrows ten squares from the next order.
function htSubSetupColumn() {
    var column = localSub.column;
    var topDigit = localSub.topDigits[column];
    var bottomDigit = localSub.bottomDigits[column];
    var afterIncoming = topDigit - localSub.incoming;
    var available = afterIncoming;
    var borrowOut = 0;
    var borrowed = false;
    var chained = false;

    if (available < 0) {
        // The previous column borrowed from a zero. This column borrows from the
        // next order and turns the zero into nine.
        available += 10;
        borrowOut = 1;
        chained = true;
    }
    if (available < bottomDigit) {
        available += 10;
        borrowOut = 1;
        borrowed = true;
    }

    localSub.afterIncoming = afterIncoming;
    localSub.base = available;
    localSub.borrowOut = borrowOut;
    localSub.borrowed = borrowed;
    localSub.chained = chained;
    localSub.bottomDigit = bottomDigit;
    localSub.removed = 0;
    localSub.started = false;
    localSub.answered = false;

    var order = htSubOrderName(column);

    $("#htSubQuestion").text(htSubReplace($("#htSubQuestionTemplate").text(), {
        order: order,
        base: available,
        bottom: bottomDigit
    }));

    var note = "";
    if (chained) {
        note = $("#htSubChainedTemplate").text();
    } else {
        if (localSub.incoming > 0) {
            note = htSubReplace($("#htSubIncomingTemplate").text(), {
                top: topDigit,
                first: afterIncoming
            });
        }
        if (borrowed) {
            var borrowNote = htSubReplace($("#htSubBorrowTemplate").text(), {
                first: afterIncoming,
                bottom: bottomDigit,
                base: available
            });
            note += (note.length > 0 ? " " : "") + borrowNote;
        }
    }
    $("#htSubNote").text(note);
    if (note.length > 0) {
        $("#htSubNote").removeClass("htAddHidden");
    } else {
        $("#htSubNote").addClass("htAddHidden");
    }

    $("#htSubFeedback").html("");
    $("#htSubNextBtn").addClass("hidden");
    $("#htSubUpBtn").prop("disabled", false);
    $("#htSubDownBtn").prop("disabled", false);

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htSubBuildBoard();
    htSubDrawSquares();
}

// On the first click, show the regrouping: the next column's minuend is reduced
// by 1 and the current column's minuend becomes 1X (or the incoming borrow is
// applied). The original digits are struck through and the new values are
// written above them, so the learner sees the regrouped minuend before
// subtracting.
function htSubApplyRegroup() {
    var column = localSub.column;

    if (localSub.incoming > 0 || localSub.borrowOut) {
        localSub.regroup[column] = localSub.base;
    }

    if (localSub.borrowOut) {
        var next = column + 1;
        var carry = 1;
        while (next < HT_SUB_DIGITS && carry) {
            var value = localSub.topDigits[next] - 1;
            if (value < 0) {
                localSub.regroup[next] = 9;
                carry = 1;
            } else {
                localSub.regroup[next] = value;
                carry = 0;
            }
            next++;
        }
    }
}

// The buttons remove or put back one square at a time. The column is solved as
// soon as the squares removed match the bottom digit of the second number.
function htSubChange(delta) {
    if (localSub.answered) {
        return;
    }

    if (!localSub.started) {
        localSub.started = true;
        htSubApplyRegroup();
        if (localSub.borrowOut) {
            // The first click only shows the regrouped minuend.
            htSubDrawSquares();
            htSubBuildBoard();
            return;
        }
    }

    var next = localSub.removed + delta;
    if (next < 0) {
        next = 0;
    }
    if (next > localSub.bottomDigit) {
        next = localSub.bottomDigit;
    }
    localSub.removed = next;

    htSubDrawSquares();
    htSubBuildBoard();

    if (localSub.removed === localSub.bottomDigit) {
        htSubResolve();
    }
}

// Records the result digit of the column and the 1 it borrows, if any.
function htSubResolve() {
    if (localSub.answered) {
        return;
    }
    localSub.answered = true;

    var column = localSub.column;
    var result = localSub.base - localSub.removed;
    var order = htSubOrderName(column);

    localSub.borrows[column] = localSub.borrowOut ? 1 : 0;
    localSub.results[column] = result;
    localSub.lastBorrow = localSub.borrowOut ? 1 : 0;

    htSubBuildBoard();

    var template = localSub.borrowOut ? $("#htSubMsgBorrowTemplate").html() : $("#htSubMsgNoBorrowTemplate").html();
    $("#htSubFeedback").html(htSubReplace(template, {
        base: localSub.base,
        removed: localSub.removed,
        result: result,
        order: order
    }));

    $("#htSubUpBtn").prop("disabled", true);
    $("#htSubDownBtn").prop("disabled", true);

    if (column >= HT_SUB_DIGITS - 1) {
        $("#htSubFeedback").append("<br /><i class=\"fa-solid fa-medal\" style=\"font-size: 4em; color: gold;\"></i>");
        $("#htSubNextBtn").text($("#htSubPlayAgainLabel").text()).removeClass("hidden");
    } else {
        $("#htSubNextBtn").text($("#htSubNextColumnLabel").text()).removeClass("hidden");
    }
}

// Moves to the next column of the same subtraction, bringing the borrow along, or
// starts a new subtraction once the last column is done.
function htSubNext() {
    if (!localSub.answered) {
        return;
    }

    if (localSub.column >= HT_SUB_DIGITS - 1) {
        htSubNewProblem();
        return;
    }

    localSub.column += 1;
    localSub.incoming = localSub.lastBorrow;
    htSubSetupColumn();
}

function htSubBuildOrders() {
    var $orders = $("#htSubOrders");
    $orders.empty();
    for (var i = 0; i < HT_SUB_DIGITS; i++) {
        $("<span>")
            .addClass("htAddOrder")
            .attr("data-order", i)
            .text(htSubOrderName(i))
            .appendTo($orders);
    }
}

function htSubNewProblem() {
    localSub.top = htGetRandomArbitrary(100, 1000);
    localSub.bottom = htGetRandomArbitrary(100, 1000);
    if (localSub.top < localSub.bottom) {
        var change = localSub.bottom;
        localSub.bottom = localSub.top;
        localSub.top = change;
    }
    localSub.topDigits = htSubDigits(localSub.top, HT_SUB_DIGITS);
    localSub.bottomDigits = htSubDigits(localSub.bottom, HT_SUB_DIGITS);
    localSub.column = 0;
    localSub.incoming = 0;
    localSub.borrows = {};
    localSub.results = {};
    localSub.regroup = {};

    htSubSetupColumn();
}

function htLoadContent() {
    htWriteNavigation();

    localSub = {
        top: 0,
        bottom: 0,
        topDigits: [],
        bottomDigits: [],
        column: 0,
        incoming: 0,
        borrows: {},
        results: {},
        base: 0,
        removed: 0,
        bottomDigit: 0,
        afterIncoming: 0,
        borrowOut: 0,
        borrowed: false,
        chained: false,
        answered: false,
        started: false,
        lastBorrow: 0,
        regroup: {}
    };

    htSubBuildOrders();

    $("#htSubUpBtn").off("click").on("click", function() {
        htSubChange(-1);
    });

    $("#htSubDownBtn").off("click").on("click", function() {
        htSubChange(1);
    });

    $("#htSubNextBtn").off("click").on("click", function() {
        htSubNext();
    });

    htSubNewProblem();

    return false;
}
