// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing subtraction with typed values" (content cc21bf40-cb71-4f3c-a82a-8785f5d97611).
// Same vertical subtraction as the "Practicing subtraction" game: the subtraction is
// laid out column by column, from the units upwards, with the squares showing the
// value available in the column. Everything written on top of the minuend is typed
// by the player, exactly as it is written by hand. When the previous column borrowed
// 1, the adjusted digit is written first on the top row; when the column borrows 1
// from the next order, the player types 1 in the borrow box above the next order and
// writes on the top row the value that now stays in the column (the digit plus ten).
// The digit that the column keeps is typed in the box on the result row. The values
// are checked as they are typed: a wrong value shows a tip, the right values remove
// the squares of the bottom digit (they turn light yellow), and the button that
// moves to the next column appears. The localized texts live in the class JSON, so
// this file only wires the behavior and draws the board.

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

// Draws the vertical subtraction: the top row, the two operands with the - sign,
// the result line and the result row. The column being solved is highlighted and a
// column shows its result digit only once it has been solved. The three value
// fields live inside the board: the top-row value is typed in the top row of the
// column being solved, the borrow is typed in the top row, above the next order,
// and the digit that the column keeps is typed in the result row.
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

    // How the top row shows the values written for a column: the borrow mark of
    // the previous column (a small struck 1, because the value written on top
    // replaces it), the adjusted digit written first, struck out when the column
    // also borrows, and the final value with the ten squares added.
    function borrowMark(order) {
        if (localSubIn.borrows[order - 1] !== 1) {
            return "";
        }
        return "<span class=\"htAddStruck htAddBorrowMark\">1</span>";
    }
    function topValue(order) {
        var value = borrowMark(order);
        if (localSubIn.regroup[order] !== undefined) {
            if (localSubIn.reduceValues[order] !== undefined && localSubIn.regroup[order] !== localSubIn.reduceValues[order]) {
                value += "<span class=\"htAddStruck\">" + localSubIn.reduceValues[order] + "</span>";
            }
            value += String(localSubIn.regroup[order]);
        }
        return value;
    }

    // The value fields are part of the board, so take them out before the table
    // is rebuilt, otherwise the rebuild would destroy them.
    $("#htSubInDigitInput, #htSubInBorrowInput, #htSubInTopInput").appendTo("#htSubInInputHome");

    var rows = "";
    // The top row: every value written above the minuend is typed by the player.
    // The adjusted digit of the column being solved, the 1 borrowed by the column
    // being solved, above the next order, and the final values of the solved
    // columns are shown here.
    rows += "<tr class=\"htAddCarryRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        var regroup = "";
        if (localSubIn.regroup[o] !== undefined) {
            regroup = topValue(o);
        } else if (localSubIn.borrows[o - 1] === 1) {
            // The 1 taken from this order by the previous column, already typed.
            regroup = "1";
        }
        // The field for the value the column being solved writes on top. The
        // borrow mark of the previous column stays beside it struck out: the
        // value the player writes replaces that 1.
        if (pending && o === current && localSubIn.topSlot === "reduce") {
            regroup = borrowMark(o) + "<span id=\"htSubInTopSlot\"></span>";
        } else if (pending && o === current && localSubIn.topSlot === "final") {
            regroup = borrowMark(o);
            if (localSubIn.reduceValues[o] !== undefined) {
                regroup += "<span class=\"htAddStruck\">" + localSubIn.reduceValues[o] + "</span>";
            }
            regroup += "<span id=\"htSubInTopSlot\"></span>";
        }
        // The borrow field sits above the next order, but only while the borrow
        // has not been typed yet.
        if (pending && o === current + 1 && localSubIn.borrowNeeded && !localSubIn.borrowTyped) {
            regroup = "<span id=\"htSubInBorrowSlot\"></span>";
        }
        rows += cell(o, regroup);
    }
    rows += "</tr>";
    // Minuend: the original digit is struck out once the player writes a value
    // above it, exactly as it is crossed out by hand.
    rows += "<tr>" + opCell("");
    for (var o = d; o >= 0; o--) {
        var minuendCell = "";
        if (o < d) {
            minuendCell = String(tDigits[o]);
            var struck = localSubIn.regroup[o] !== undefined ||
                (pending && o === current && localSubIn.topSlot !== "none");
            if (struck) {
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
        if (localSubIn.topSlot === "reduce" || localSubIn.topSlot === "final") {
            $("#htSubInTopSlot").append($("#htSubInTopInput"));
        }
        if (localSubIn.borrowNeeded && !localSubIn.borrowTyped) {
            $("#htSubInBorrowSlot").append($("#htSubInBorrowInput"));
        }
        $("#htSubInDigitSlot").append($("#htSubInDigitInput"));
    }
}

// Draws the squares of the column. The base squares are light blue from the start
// and the squares of the bottom digit are white, waiting to be removed. When the
// column borrows, ten squares arrive grouped: the bottom digit is removed from
// that group and the squares left in it, outlined, are the complement to ten; the
// squares already in the column stay outside the group and are added to the
// complement to form the result digit. Once the values are right, the white
// squares turn light yellow, as they are removed, and the light blue squares that
// remain are the digit that stays in the column.
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
// bottom digit, the column borrows ten squares from the next order. The player
// writes all the values on top, although the adjusted digit of this column may
// already be there when it was written with the borrow of the previous column.
// When the previous column borrowed 1, the first step is to write the adjusted
// digit on the top row, and the borrow field is only added to the board when the
// column actually borrows.
function htSubInSetupColumn() {
    var column = localSubIn.column;
    var topDigit = localSubIn.topDigits[column];
    var bottomDigit = localSubIn.bottomDigits[column];
    var afterIncoming = topDigit - localSubIn.incoming;
    var available = afterIncoming;
    var borrowOut = 0;
    var borrowed = false;
    var chained = false;
    // The previous column may have written the adjusted digit of this column
    // already, when the player typed that value in the borrow box instead of
    // the 1. In that case the value on top is already there.
    var prewritten = localSubIn.regroup[column] !== undefined;

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
    localSubIn.borrowTyped = false;
    localSubIn.answered = false;

    // Staged entries, all typed by the player. When the previous column borrowed
    // 1 (and the digit still exists after the 1 is removed), the first step is to
    // write the adjusted digit on the top row. When the column borrows, the next
    // step asks for the value that now stays in the column: the digit plus ten.
    // A value written in advance with the borrow of the previous column skips
    // the adjusted digit: only the value with ten squares (when this column also
    // borrows) and the digit that stays are still missing.
    if (prewritten) {
        localSubIn.reduceValues[column] = localSubIn.regroup[column];
    }
    var reduceEntry = !prewritten && localSubIn.incoming > 0 && afterIncoming >= 0;
    localSubIn.stage = reduceEntry ? "reduce" : "solve";
    if (reduceEntry) {
        localSubIn.topSlot = "reduce";
        localSubIn.topExpected = afterIncoming;
    } else {
        var needTop = localSubIn.borrowNeeded && (!prewritten || localSubIn.regroup[column] !== available);
        localSubIn.topSlot = needTop ? "final" : "none";
        localSubIn.topExpected = needTop ? available : null;
    }

    var order = htSubInOrderName(column);

    $("#htSubInQuestion").text(htSubInReplace($("#htSubInQuestionTemplate").text(), {
        order: order,
        base: available,
        bottom: bottomDigit
    }));

    var note = "";
    if (localSubIn.stage === "reduce") {
        // First the adjusted digit is written, then the column is checked.
        note = htSubInReplace($("#htSubInIncomingTemplate").text(), {
            top: topDigit,
            first: afterIncoming
        });
    } else if (chained) {
        note = $("#htSubInChainedTemplate").text();
    } else if (borrowed) {
        note = htSubInReplace($("#htSubInBorrowTemplate").text(), {
            first: afterIncoming,
            bottom: bottomDigit,
            base: available
        });
    } else if (localSubIn.incoming > 0) {
        note = htSubInReplace($("#htSubInIncomingTemplate").text(), {
            top: topDigit,
            first: afterIncoming
        });
    }
    $("#htSubInNote").text(note);
    if (note.length > 0) {
        $("#htSubInNote").removeClass("htAddHidden");
    } else {
        $("#htSubInNote").addClass("htAddHidden");
    }

    // Clear the fields and enable the ones of the current step: during the first
    // step only the value written on top is asked, so the digit and the borrow
    // wait until the top value is right.
    $("#htSubInTopInput").val("").prop("disabled", localSubIn.topSlot === "none");
    $("#htSubInBorrowInput").val("").prop("disabled", !(localSubIn.stage === "solve" && localSubIn.borrowNeeded));
    $("#htSubInDigitInput").val("").prop("disabled", localSubIn.stage !== "solve");
    $("#htSubInFeedback").html("");
    $("#htSubInNextBtn").addClass("hidden");

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htSubInBuildBoard();
    htSubInDrawSquares(false);
}

// The player writes a top value while typing, so a two-digit value like 13 is
// still being written when only its first digit is there: only values that can
// no longer become the right one show the tip.
function htSubInTopPartial(raw) {
    var expected = String(localSubIn.topExpected);
    return localSubIn.topExpected >= 10 && raw.length < expected.length && expected.indexOf(raw) === 0;
}

// Records the adjusted digit written on top when the previous column borrowed 1.
// If the column also borrows from the next order, the value written on top must
// be updated afterwards: the digit written first stays crossed out and the value
// with the ten squares is written next. Otherwise the adjusted digit is the value
// that stays on top and only the digit of the result row is asked.
function htSubInAcceptReduce() {
    var column = localSubIn.column;

    localSubIn.reduceValues[column] = localSubIn.topExpected;
    if (localSubIn.borrowNeeded) {
        localSubIn.stage = "solve";
        localSubIn.topSlot = "final";
        localSubIn.topExpected = localSubIn.base;
        $("#htSubInTopInput").val("");
    } else {
        localSubIn.regroup[column] = localSubIn.reduceValues[column];
        localSubIn.stage = "solve";
        localSubIn.topSlot = "none";
        localSubIn.topExpected = null;
    }

    $("#htSubInFeedback").html("");
    // The top value of the column is written; ask now for the borrow and the
    // digit that the column keeps.
    $("#htSubInBorrowInput").prop("disabled", !localSubIn.borrowNeeded);
    $("#htSubInDigitInput").prop("disabled", false);

    htSubInBuildBoard();
}

// Checks the fields as they are typed, so the button that verifies the column is
// not needed. A wrong value shows a tip; the right values solve the column at
// once. The steps are ordered: first the adjusted digit written on top (when the
// previous column borrowed 1), then the value written on top together with the
// borrow when the column borrows, and finally the digit that the column keeps.
function htSubInEvaluate() {
    if (localSubIn.answered) {
        return;
    }

    var base = localSubIn.base;
    var bottom = localSubIn.bottomDigit;
    var result = base - bottom;
    var order = htSubInOrderName(localSubIn.column);
    var topRaw = $("#htSubInTopInput").val();
    var borrowRaw = $("#htSubInBorrowInput").val();
    var digitRaw = $("#htSubInDigitInput").val();

    // Step 1: the adjusted digit written on top, when the previous column
    // borrowed 1.
    if (localSubIn.stage === "reduce") {
        if (topRaw === "") {
            $("#htSubInFeedback").html("");
            return;
        }
        if (parseInt(topRaw, 10) === localSubIn.topExpected) {
            htSubInAcceptReduce();
        } else if (!htSubInTopPartial(topRaw)) {
            $("#htSubInFeedback").html(htSubInReplace($("#htSubInWrongTopTemplate").html(), {
                top: localSubIn.topDigits[localSubIn.column],
                first: localSubIn.afterIncoming
            }));
        }
        return;
    }

    // Step 2: when the column borrows, the value written on top stays crossed
    // out and the value with ten more squares is written.
    var topWritten = localSubIn.topSlot !== "final";
    if (localSubIn.topSlot === "final") {
        if (topRaw !== "" && parseInt(topRaw, 10) === localSubIn.topExpected) {
            localSubIn.regroup[localSubIn.column] = localSubIn.topExpected;
            localSubIn.topSlot = "none";
            $("#htSubInFeedback").html("");
            topWritten = true;
            htSubInBuildBoard();
        } else if (topRaw !== "" && !htSubInTopPartial(topRaw)) {
            $("#htSubInFeedback").html(htSubInReplace(
                localSubIn.chained ? $("#htSubInWrongTopChainedTemplate").html() : $("#htSubInWrongTopBorrowTemplate").html(),
                {
                    first: localSubIn.afterIncoming,
                    bottom: bottom,
                    base: base
                }
            ));
            return;
        } else {
            $("#htSubInFeedback").html("");
            return;
        }
    }

    // The borrow of the column, typed above the next order. The player may also
    // write there the value that stays in the next order after lending the 1
    // (for example 8 when 9 lends 1). That value is the adjusted digit of the
    // next column, so it is written on top of that order and the borrow is
    // taken at the same time.
    var next = localSubIn.column + 1;
    var nextReduced = localSubIn.topDigits[next] - 1;
    var nextTop = (nextReduced < 0) ? 9 : nextReduced;
    var borrowIsNextTop = localSubIn.borrowNeeded && next < HT_SUBIN_DIGITS &&
        borrowRaw !== "" && nextTop !== 1 && parseInt(borrowRaw, 10) === nextTop;
    var borrowOk = !localSubIn.borrowNeeded ||
        (borrowRaw !== "" && (parseInt(borrowRaw, 10) === 1 || borrowIsNextTop));
    if (borrowOk && localSubIn.borrowNeeded) {
        localSubIn.borrows[localSubIn.column] = 1;
        localSubIn.borrowTyped = true;
        if (borrowIsNextTop) {
            localSubIn.regroup[next] = nextTop;
        }
    }
    if (localSubIn.borrowNeeded && borrowRaw !== "" && !borrowOk) {
        $("#htSubInFeedback").html(htSubInReplace($("#htSubInWrongBorrowTemplate").html(), {
            first: localSubIn.afterIncoming,
            bottom: bottom,
            next: htSubInOrderName(next)
        }));
        return;
    }
    if (borrowOk && localSubIn.borrowNeeded) {
        localSubIn.borrows[localSubIn.column] = 1;
        localSubIn.borrowTyped = true;
    }

    // The digit that the column keeps, typed on the result row.
    var digitOk = digitRaw !== "" && parseInt(digitRaw, 10) === result;
    if (digitRaw !== "" && !digitOk) {
        $("#htSubInFeedback").html(htSubInReplace($("#htSubInWrongDigitTemplate").html(), {
            order: order,
            bottom: bottom,
            comp: 10 - bottom
        }));
        return;
    }

    if (topWritten && borrowOk && digitOk) {
        htSubInResolve();
    } else {
        $("#htSubInFeedback").html("");
        htSubInBuildBoard();
    }
}

// Records the result digit of the column. The squares of the bottom digit are
// removed (they turn light yellow) and a congratulation is shown, together with
// the button that moves to the next column (or to a new problem). The reduced
// digits of the next columns are not written here: the player writes them on top
// when solving those columns.
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

    $("#htSubInTopInput").prop("disabled", true);
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
    localSubIn.reduceValues = {};

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
        reduceValues: {},
        base: 0,
        bottomDigit: 0,
        afterIncoming: 0,
        borrowOut: 0,
        borrowed: false,
        chained: false,
        borrowNeeded: false,
        borrowTyped: false,
        stage: "solve",
        topSlot: "none",
        topExpected: null,
        answered: false,
        lastBorrow: 0
    };

    htSubInBuildOrders();

    $("#htSubInNextBtn").off("click").on("click", function() {
        htSubInNext();
    });

    // The values are checked as they are typed, so there is no verify button.
    $("#htSubInTopInput, #htSubInDigitInput, #htSubInBorrowInput").off("input").on("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "");
        htSubInEvaluate();
    });

    htSubInNewProblem();

    return false;
}
