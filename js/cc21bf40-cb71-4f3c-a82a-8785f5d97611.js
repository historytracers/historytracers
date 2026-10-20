// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing subtraction with typed values" (content cc21bf40-cb71-4f3c-a82a-8785f5d97611).
// Same vertical subtraction as the "Practicing subtraction" game: the subtraction is
// laid out column by column, from the units upwards, with the squares showing the
// value available in the column. Instead of removing the squares one by one with the
// up and down buttons, the player types the digit that the column keeps and, when the
// column borrows 1 from the next order, types 1 in the borrow box above the next
// order. The values are checked as they are typed: a wrong value shows a tip about
// the complement to ten or the borrow, the right values remove the squares of the
// bottom digit (they turn light yellow), reduce the next order's digit in the
// regrouped row and are congratulated, and the button that moves to the next column
// appears. The localized texts live in the class JSON, so this file only wires the
// behavior and draws the board.

var localSubIn = {};

var HT_SUBIN_DIGITS = 3;

function htSubInOrderName(order) {
    return $("#htSubInOrder" + order).text();
}

// Returns the digits of value from the units order upwards (index 0 = units).
function htSubInDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

function htSubInReplace(template, values) {
    for (var key in values) {
        template = template.replace(new RegExp("\\{" + key + "\\}", "g"), values[key]);
    }
    return template;
}

// Draws the vertical subtraction: the regrouped row, the two operands with the - sign,
// the result line and the result row. The column being solved is highlighted and a
// column shows its result digit only once it has been solved. The two value fields
// live inside the board: the digit is typed in the result row of the column being
// solved and the borrow is typed in the regrouped row, above the next order, exactly
// where the 1 taken from the next order is written by hand.
function htSubInBuildBoard() {
    var d = HT_SUBIN_DIGITS;
    var current = localSubIn.column;
    var tDigits = localSubIn.topDigits;
    var bDigits = localSubIn.bottomDigits;
    var pending = !localSubIn.answered;

    function opCell(content) {
        return "<td class=\"htAddOp\">" + content + "</td>";
    }
    function cell(order, content) {
        var cls = "htAddCell" + (order === current ? " htAddCellActive" : "");
        return "<td class=\"" + cls + "\" data-order=\"" + order + "\">" + content + "</td>";
    }

    // The value fields are part of the board, so take them out before the table
    // is rebuilt, otherwise the rebuild would destroy them.
    $("#htSubInDigitInput, #htSubInBorrowInput").appendTo("#htSubInInputHome");

    var rows = "";
    // The regrouped minuend is written above the original digits. When the column
    // being solved borrows, the 1 taken from the next order is typed above it.
    rows += "<tr class=\"htAddCarryRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        var regroup = "";
        if (localSubIn.regroup[o] !== undefined) {
            regroup = String(localSubIn.regroup[o]);
        }
        // The borrow field sits above the next order, but only when the column
        // actually borrows.
        if (pending && localSubIn.borrowNeeded && o === current + 1) {
            regroup = "<span id=\"htSubInBorrowSlot\"></span>";
        }
        rows += cell(o, regroup);
    }
    rows += "</tr>";
    // Minuend
    rows += "<tr>" + opCell("");
    for (var o = d; o >= 0; o--) {
        var minuendCell = "";
        if (o < d) {
            minuendCell = String(tDigits[o]);
            if (localSubIn.regroup[o] !== undefined) {
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
        var res = (localSubIn.results[o] !== undefined) ? String(localSubIn.results[o]) : "";
        // The digit kept by the column being solved is typed here.
        if (pending && o === current) {
            res = "<span id=\"htSubInDigitSlot\"></span>";
        }
        rows += cell(o, res);
    }
    rows += "</tr>";

    $("#htSubInTable").html(rows);

    // Put the value fields in the position of the subtraction.
    if (pending) {
        $("#htSubInDigitSlot").append($("#htSubInDigitInput"));
        if (localSubIn.borrowNeeded) {
            $("#htSubInBorrowSlot").append($("#htSubInBorrowInput"));
        }
    }
}

// Draws the squares of the column. The value available in the column is shown from
// the start: the first squares are light blue and the squares of the bottom digit
// are white, waiting to be removed. When the column borrows, ten squares arrive
// grouped: the bottom digit is removed from that group and the squares left in it,
// outlined, are the complement to ten; the squares already in the column stay
// outside the group and are added to the complement to form the result digit. Once
// the values are right, the white squares turn light yellow, as they are removed,
// and the light blue squares that remain are the digit that stays in the column.
function htSubInDrawSquares(revealed) {
    var base = localSubIn.base;
    var bottom = localSubIn.bottomDigit;
    var borrowed = localSubIn.borrowed;
    var outside = borrowed ? base - 10 : 0;
    var html = "";
    var i;

    function square(index, inTen) {
        var cls = "htAddSquare";
        if (index < bottom) {
            cls += revealed ? " htAddSquareRemoved" : " htAddSquarePending";
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

    $("#htSubInSquares").html(html);
    $("#htSubInSquaresCaption").text(base + " - " + bottom + " = " + (revealed ? (base - bottom) : "?"));
    htSubInUpdateSquaresNote(revealed);
}

// Spells out how the squares are used in the column. Before typing, it explains the
// white squares and, when the column borrows, the complement to ten and the squares
// already in the column, so the learner knows what to type. Once the values are
// right, it counts the squares removed and the squares that remain.
function htSubInUpdateSquaresNote(revealed) {
    var note;
    if (revealed) {
        if (localSubIn.borrowed) {
            note = htSubInReplace($("#htSubInSquaresBorrowUsedTemplate").text(), {
                bottom: localSubIn.bottomDigit,
                comp: 10 - localSubIn.bottomDigit,
                outside: localSubIn.base - 10,
                result: localSubIn.base - localSubIn.bottomDigit
            });
        } else {
            note = htSubInReplace($("#htSubInSquaresUsedTemplate").text(), {
                removed: localSubIn.bottomDigit,
                remaining: localSubIn.base - localSubIn.bottomDigit
            });
        }
    } else {
        if (localSubIn.borrowed) {
            note = htSubInReplace($("#htSubInSquaresBorrowPendingTemplate").text(), {
                bottom: localSubIn.bottomDigit,
                comp: 10 - localSubIn.bottomDigit,
                outside: localSubIn.base - 10
            });
        } else {
            note = htSubInReplace($("#htSubInSquaresPendingTemplate").text(), {
                bottom: localSubIn.bottomDigit
            });
        }
    }

    $("#htSubInSquaresNote").text(note);
}

// Prepares the column that must be solved next. A 1 borrowed by the previous
// column is taken from the top digit; if the top digit is then smaller than the
// bottom digit, the column borrows ten squares from the next order. The regrouped
// minuend of the column is written above the original digit right away, and the
// borrow field is only added to the board when the column actually borrows.
function htSubInSetupColumn() {
    var column = localSubIn.column;
    var topDigit = localSubIn.topDigits[column];
    var bottomDigit = localSubIn.bottomDigits[column];
    var afterIncoming = topDigit - localSubIn.incoming;
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

    localSubIn.afterIncoming = afterIncoming;
    localSubIn.base = available;
    localSubIn.borrowOut = borrowOut;
    localSubIn.borrowed = borrowed;
    localSubIn.chained = chained;
    localSubIn.bottomDigit = bottomDigit;
    // The borrow field is only added to the board when the column borrows.
    localSubIn.borrowNeeded = borrowOut === 1;
    localSubIn.answered = false;

    // The regrouped minuend of this column: the digit reduced by the borrow of the
    // previous column, or the digit that takes ten squares from the next order.
    if (localSubIn.incoming > 0 || localSubIn.borrowNeeded) {
        localSubIn.regroup[column] = available;
    }

    var order = htSubInOrderName(column);

    $("#htSubInQuestion").text(htSubInReplace($("#htSubInQuestionTemplate").text(), {
        order: order,
        base: available,
        bottom: bottomDigit
    }));

    var note = "";
    if (chained) {
        note = $("#htSubInChainedTemplate").text();
    } else {
        if (localSubIn.incoming > 0) {
            note = htSubInReplace($("#htSubInIncomingTemplate").text(), {
                top: topDigit,
                first: afterIncoming
            });
        }
        if (borrowed) {
            var borrowNote = htSubInReplace($("#htSubInBorrowTemplate").text(), {
                first: afterIncoming,
                bottom: bottomDigit,
                base: available
            });
            note += (note.length > 0 ? " " : "") + borrowNote;
        }
    }
    $("#htSubInNote").text(note);
    if (note.length > 0) {
        $("#htSubInNote").removeClass("htAddHidden");
    } else {
        $("#htSubInNote").addClass("htAddHidden");
    }

    // Clear the fields and controls for the new column.
    $("#htSubInDigitInput").val("").prop("disabled", false);
    $("#htSubInBorrowInput").val("").prop("disabled", false);
    $("#htSubInFeedback").html("");
    $("#htSubInNextBtn").addClass("hidden");

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htSubInBuildBoard();
    htSubInDrawSquares(false);
}

// Checks the fields as they are typed, so the button that verifies the column is
// not needed. A wrong digit or a wrong borrow shows a tip; the right values solve
// the column at once. The borrow field is only present when the column borrows,
// so when there is no borrow the digit alone solves it.
function htSubInEvaluate() {
    if (localSubIn.answered) {
        return;
    }

    var base = localSubIn.base;
    var bottom = localSubIn.bottomDigit;
    var result = base - bottom;
    var order = htSubInOrderName(localSubIn.column);
    var digitRaw = $("#htSubInDigitInput").val();
    var borrowRaw = $("#htSubInBorrowInput").val();

    var digitOk = digitRaw !== "" && parseInt(digitRaw, 10) === result;
    var borrowOk = !localSubIn.borrowNeeded || (borrowRaw !== "" && parseInt(borrowRaw, 10) === 1);

    if (digitRaw !== "" && !digitOk) {
        $("#htSubInFeedback").html(htSubInReplace($("#htSubInWrongDigitTemplate").html(), {
            order: order,
            bottom: bottom,
            comp: 10 - bottom
        }));
        return;
    }

    if (localSubIn.borrowNeeded && borrowRaw !== "" && !borrowOk) {
        $("#htSubInFeedback").html(htSubInReplace($("#htSubInWrongBorrowTemplate").html(), {
            first: localSubIn.afterIncoming,
            bottom: bottom
        }));
        return;
    }

    if (digitOk && borrowOk) {
        htSubInResolve();
    } else {
        $("#htSubInFeedback").html("");
    }
}

// Records the result digit of the column and the 1 it borrows, if any. The squares
// of the bottom digit are removed (they turn light yellow), the digit of the next
// order is reduced and written above the original one, and a congratulation is
// shown, together with the button that moves to the next column (or to a new
// problem).
function htSubInResolve() {
    if (localSubIn.answered) {
        return;
    }
    localSubIn.answered = true;

    var column = localSubIn.column;
    var result = localSubIn.base - localSubIn.bottomDigit;
    var order = htSubInOrderName(column);

    localSubIn.borrows[column] = localSubIn.borrowOut ? 1 : 0;
    localSubIn.results[column] = result;
    localSubIn.lastBorrow = localSubIn.borrowOut ? 1 : 0;

    // The columns ahead are regrouped by the borrow taken: the digit of the next
    // order is reduced by 1 (or a borrowed zero becomes nine and the borrow
    // continues to the next order).
    if (localSubIn.borrowOut) {
        var next = column + 1;
        var carry = 1;
        while (next < HT_SUBIN_DIGITS && carry) {
            var value = localSubIn.topDigits[next] - 1;
            if (value < 0) {
                localSubIn.regroup[next] = 9;
                carry = 1;
            } else {
                localSubIn.regroup[next] = value;
                carry = 0;
            }
            next++;
        }
    }

    htSubInBuildBoard();
    // The typed values remove the squares: the bottom digit turns light yellow
    // and the light blue squares that remain are the digit that stays.
    htSubInDrawSquares(true);

    var template = localSubIn.borrowOut ? $("#htSubInMsgBorrowTemplate").html() : $("#htSubInMsgNoBorrowTemplate").html();
    var explanation = htSubInReplace(template, {
        base: localSubIn.base,
        removed: localSubIn.bottomDigit,
        result: result,
        order: order
    });

    $("#htSubInDigitInput").prop("disabled", true);
    $("#htSubInBorrowInput").prop("disabled", true);

    var congrats;
    var suffix = "";
    if (column >= HT_SUBIN_DIGITS - 1) {
        congrats = htSubInReplace($("#htSubInPerfectTemplate").html(), {
            top: localSubIn.top,
            bottom: localSubIn.bottom,
            result: localSubIn.top - localSubIn.bottom
        });
        suffix = " <i class=\"fa-solid fa-medal\" style=\"font-size: 4em; color: gold;\"></i>";
        $("#htSubInNextBtn").text($("#htSubInPlayAgainLabel").text()).removeClass("hidden");
    } else {
        congrats = $("#htSubInCongratsTemplate").html();
        $("#htSubInNextBtn").text($("#htSubInNextColumnLabel").text()).removeClass("hidden");
    }

    $("#htSubInFeedback").html(congrats + "<br />" + explanation + suffix);
}

// Moves to the next column of the same subtraction, bringing the borrow along, or
// starts a new subtraction once the last column is done.
function htSubInNext() {
    if (!localSubIn.answered) {
        return;
    }

    if (localSubIn.column >= HT_SUBIN_DIGITS - 1) {
        htSubInNewProblem();
        return;
    }

    localSubIn.column += 1;
    localSubIn.incoming = localSubIn.lastBorrow;
    htSubInSetupColumn();
}

function htSubInBuildOrders() {
    var $orders = $("#htSubInOrders");
    $orders.empty();
    for (var i = 0; i < HT_SUBIN_DIGITS; i++) {
        $("<span>")
            .addClass("htAddOrder")
            .attr("data-order", i)
            .text(htSubInOrderName(i))
            .appendTo($orders);
    }
}

function htSubInNewProblem() {
    localSubIn.top = htGetRandomArbitrary(100, 1000);
    localSubIn.bottom = htGetRandomArbitrary(100, 1000);
    if (localSubIn.top < localSubIn.bottom) {
        var change = localSubIn.bottom;
        localSubIn.bottom = localSubIn.top;
        localSubIn.top = change;
    }
    localSubIn.topDigits = htSubInDigits(localSubIn.top, HT_SUBIN_DIGITS);
    localSubIn.bottomDigits = htSubInDigits(localSubIn.bottom, HT_SUBIN_DIGITS);
    localSubIn.column = 0;
    localSubIn.incoming = 0;
    localSubIn.borrows = {};
    localSubIn.results = {};
    localSubIn.regroup = {};

    htSubInSetupColumn();
}

function htLoadContent() {
    htWriteNavigation();

    localSubIn = {
        top: 0,
        bottom: 0,
        topDigits: [],
        bottomDigits: [],
        column: 0,
        incoming: 0,
        borrows: {},
        results: {},
        regroup: {},
        base: 0,
        bottomDigit: 0,
        afterIncoming: 0,
        borrowOut: 0,
        borrowed: false,
        chained: false,
        borrowNeeded: false,
        answered: false,
        lastBorrow: 0
    };

    htSubInBuildOrders();

    $("#htSubInNextBtn").off("click").on("click", function() {
        htSubInNext();
    });

    // The values are checked as they are typed, so there is no verify button.
    $("#htSubInDigitInput, #htSubInBorrowInput").off("input").on("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "");
        htSubInEvaluate();
    });

    htSubInNewProblem();

    return false;
}
