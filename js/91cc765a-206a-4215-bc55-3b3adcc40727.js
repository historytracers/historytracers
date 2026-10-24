// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing subtraction with chosen numbers" (content 91cc765a-206a-4215-bc55-3b3adcc40727).
// Same vertical subtraction as the "Practicing subtraction with typed values" game:
// the subtraction is laid out column by column, from the units upwards, with the
// squares showing the value available in the column. Everything written on top of
// the minuend is typed by the player, exactly as it is written by hand. When the
// previous column borrowed 1, the adjusted digit is written first on the top row;
// when the column borrows 1 from the next order, the player types 1 in the borrow
// box above the next order and writes on the top row the value that now stays in
// the column (the digit plus ten). The digit that the column keeps is typed in the
// box on the result row. The values are checked as they are typed: a wrong value
// shows a tip, the right values remove the squares of the bottom digit (they turn
// light yellow), and the button that moves to the next column appears.
//
// The difference with that game is that the numbers are not generated at random:
// the player first types the two operands, between 0 and 99999, in two text
// fields. The second number cannot be greater than the first one, since the
// subtraction is done with whole numbers that are not negative. The subtraction
// then uses exactly the numbers written and shows as many columns as they need.
// The localized texts live in the class JSON, so this file only wires the
// behavior and draws the board.

var localSubChosen = {};

var HT_SUBCHOSEN_MIN = 0;
var HT_SUBCHOSEN_MAX = 99999;

function htSubChosenOrderName(order) {
    return $("#htSubChosenOrder" + order).text();
}

// Returns the digits of value from the units order upwards (index 0 = units).
function htSubChosenDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

function htSubChosenReplace(template, values) {
    for (var key in values) {
        template = template.replace(new RegExp("\\{" + key + "\\}", "g"), values[key]);
    }
    return template;
}

var HT_SUBCHOSEN_INPUTS = "#htSubChosenTopInput, #htSubChosenBorrowInput, #htSubChosenDigitInput";

// The value fields are moved in and out of the board every time it is rebuilt, and
// moving the field that has the focus blurs it. The field being used is remembered
// before the rebuild and focused again afterwards, so a wrong value can be deleted
// and typed again without losing the caret. The focus only moves when the player
// clicks another box or button.
function htSubChosenRememberFocus() {
    var active = document.activeElement;
    if (!active || !active.id || !$(active).is(HT_SUBCHOSEN_INPUTS)) {
        return null;
    }
    return {
        id: active.id,
        start: active.selectionStart,
        end: active.selectionEnd
    };
}

function htSubChosenRestoreFocus(state) {
    var field;
    if (!state) {
        return;
    }
    field = document.getElementById(state.id);
    // When the field of the step that was just solved is no longer on the board,
    // continue in the first field that still waits for a value.
    if (!field || field.disabled || !$(field).is(":visible")) {
        field = null;
        $(HT_SUBCHOSEN_INPUTS).each(function() {
            if (!this.disabled && $(this).is(":visible")) {
                field = this;
                return false;
            }
        });
        if (!field) {
            return;
        }
        state = null;
    }
    try {
        field.focus({ preventScroll: true });
    } catch (e) {
        field.focus();
    }
    if (state && typeof state.start === "number" && field.setSelectionRange) {
        var length = String(field.value).length;
        field.setSelectionRange(Math.min(state.start, length), Math.min(state.end, length));
    }
}

// Draws the vertical subtraction: the top row, the two operands with the - sign,
// the result line and the result row. The column being solved is highlighted and a
// column shows its result digit only once it has been solved. The three value
// fields live inside the board: the top-row value is typed in the top row of the
// column being solved, the borrow is typed in the top row, above the next order,
// and the digit that the column keeps is typed in the result row.
function htSubChosenBuildBoard() {
    var d = localSubChosen.columns;
    var current = localSubChosen.column;
    var tDigits = localSubChosen.topDigits;
    var bDigits = localSubChosen.bottomDigits;
    var pending = !localSubChosen.answered;

    function opCell(content) {
        return "<td class=\"htAddOp\">" + content + "</td>";
    }
    function cell(order, content) {
        var cls = "htAddCell" + (order === current ? " htAddCellActive" : "");
        return "<td class=\"" + cls + "\" data-order=\"" + order + "\">" + content + "</td>";
    }

    // How the top row shows the values written for a column: the adjusted digit
    // written first, struck out when the column also borrows, and the final value
    // with the ten squares added. The digit written on top replaces the original
    // minuend digit, so no borrow mark is drawn beside it.
    function topValue(order) {
        var value = "";
        if (localSubChosen.regroup[order] !== undefined) {
            if (localSubChosen.reduceValues[order] !== undefined && localSubChosen.regroup[order] !== localSubChosen.reduceValues[order]) {
                value += "<span class=\"htAddStruck\">" + localSubChosen.reduceValues[order] + "</span>";
            }
            value += String(localSubChosen.regroup[order]);
        }
        return value;
    }

    // The value fields are part of the board, so take them out before the table
    // is rebuilt, otherwise the rebuild would destroy them.
    var focus = htSubChosenRememberFocus();
    $("#htSubChosenDigitInput, #htSubChosenBorrowInput, #htSubChosenTopInput").appendTo("#htSubChosenInputHome");

    var rows = "";
    // The top row: every value written above the minuend is typed by the player.
    // The adjusted digit of the column being solved, the 1 borrowed by the column
    // being solved, above the next order, and the final values of the solved
    // columns are shown here.
    rows += "<tr class=\"htAddCarryRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        var regroup = "";
        if (localSubChosen.regroup[o] !== undefined) {
            regroup = topValue(o);
        } else if (localSubChosen.borrows[o - 1] === 1) {
            // The 1 taken from this order by the previous column, already typed.
            regroup = "1";
        }
        // The field for the value the column being solved writes on top.
        if (pending && o === current && localSubChosen.topSlot === "reduce") {
            regroup = "<span id=\"htSubChosenTopSlot\"></span>";
        } else if (pending && o === current && localSubChosen.topSlot === "final") {
            regroup = "";
            if (localSubChosen.reduceValues[o] !== undefined) {
                regroup += "<span class=\"htAddStruck\">" + localSubChosen.reduceValues[o] + "</span>";
            }
            regroup += "<span id=\"htSubChosenTopSlot\"></span>";
        }
        // The borrow field sits above the next order, but only while the borrow
        // has not been typed yet.
        if (pending && o === current + 1 && localSubChosen.borrowNeeded && !localSubChosen.borrowTyped) {
            regroup = "<span id=\"htSubChosenBorrowSlot\"></span>";
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
            var struck = localSubChosen.regroup[o] !== undefined ||
                (pending && o === current && localSubChosen.topSlot !== "none");
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
        var res = (localSubChosen.results[o] !== undefined) ? String(localSubChosen.results[o]) : "";
        // The digit kept by the column being solved is typed here.
        if (pending && o === current) {
            res = "<span id=\"htSubChosenDigitSlot\"></span>";
        }
        rows += cell(o, res);
    }
    rows += "</tr>";

    $("#htSubChosenTable").html(rows);

    // Put the value fields in the position of the subtraction.
    if (pending) {
        if (localSubChosen.topSlot === "reduce" || localSubChosen.topSlot === "final") {
            $("#htSubChosenTopSlot").append($("#htSubChosenTopInput"));
        }
        if (localSubChosen.borrowNeeded && !localSubChosen.borrowTyped) {
            $("#htSubChosenBorrowSlot").append($("#htSubChosenBorrowInput"));
        }
        $("#htSubChosenDigitSlot").append($("#htSubChosenDigitInput"));
    }

    htSubChosenRestoreFocus(focus);
}

// Draws the squares of the column. The base squares are light blue from the start
// and the squares of the bottom digit are white, waiting to be removed. When the
// column borrows, ten squares arrive grouped: the bottom digit is removed from
// that group and the squares left in it, outlined, are the complement to ten; the
// squares already in the column stay outside the group and are added to the
// complement to form the result digit. Once the values are right, the white
// squares turn light yellow, as they are removed, and the light blue squares that
// remain are the digit that stays in the column.
function htSubChosenDrawSquares(revealed) {
    var base = localSubChosen.base;
    var bottom = localSubChosen.bottomDigit;
    var borrowed = localSubChosen.borrowed;
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

    $("#htSubChosenSquares").html(html);
    $("#htSubChosenSquaresCaption").text(base + " - " + bottom + " = " + (revealed ? (base - bottom) : "?"));
    htSubChosenUpdateSquaresNote(revealed);
}

// Spells out how the squares are used in the column. Before typing, it explains the
// white squares and, when the column borrows, the complement to ten and the squares
// already in the column, so the learner knows what to type. Once the values are
// right, it counts the squares removed and the squares that remain.
function htSubChosenUpdateSquaresNote(revealed) {
    var note;
    if (revealed) {
        if (localSubChosen.borrowed) {
            note = htSubChosenReplace($("#htSubChosenSquaresBorrowUsedTemplate").text(), {
                bottom: localSubChosen.bottomDigit,
                comp: 10 - localSubChosen.bottomDigit,
                outside: localSubChosen.base - 10,
                result: localSubChosen.base - localSubChosen.bottomDigit
            });
        } else {
            note = htSubChosenReplace($("#htSubChosenSquaresUsedTemplate").text(), {
                removed: localSubChosen.bottomDigit,
                remaining: localSubChosen.base - localSubChosen.bottomDigit
            });
        }
    } else {
        if (localSubChosen.borrowed) {
            note = htSubChosenReplace($("#htSubChosenSquaresBorrowPendingTemplate").text(), {
                bottom: localSubChosen.bottomDigit,
                comp: 10 - localSubChosen.bottomDigit,
                outside: localSubChosen.base - 10
            });
        } else {
            note = htSubChosenReplace($("#htSubChosenSquaresPendingTemplate").text(), {
                bottom: localSubChosen.bottomDigit
            });
        }
    }

    $("#htSubChosenSquaresNote").text(note);
}

// Prepares the column that must be solved next. A 1 borrowed by the previous
// column is taken from the top digit; if the top digit is then smaller than the
// bottom digit, the column borrows ten squares from the next order. The player
// writes all the values on top, although the adjusted digit of this column may
// already be there when it was written with the borrow of the previous column.
// When the previous column borrowed 1, the first step is to write the adjusted
// digit on the top row, and the borrow field is only added to the board when the
// column actually borrows.
function htSubChosenSetupColumn() {
    var column = localSubChosen.column;
    var topDigit = localSubChosen.topDigits[column];
    var bottomDigit = localSubChosen.bottomDigits[column];
    var afterIncoming = topDigit - localSubChosen.incoming;
    var available = afterIncoming;
    var borrowOut = 0;
    var borrowed = false;
    var chained = false;
    // The previous column may have written the adjusted digit of this column
    // already, when the player typed that value in the borrow box instead of
    // the 1. In that case the value on top is already there.
    var prewritten = localSubChosen.regroup[column] !== undefined;

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

    localSubChosen.afterIncoming = afterIncoming;
    localSubChosen.base = available;
    localSubChosen.borrowOut = borrowOut;
    localSubChosen.borrowed = borrowed;
    localSubChosen.chained = chained;
    localSubChosen.bottomDigit = bottomDigit;
    // The borrow field is only added to the board when the column borrows.
    localSubChosen.borrowNeeded = borrowOut === 1;
    localSubChosen.borrowTyped = false;
    localSubChosen.answered = false;

    // Staged entries, all typed by the player. When the previous column borrowed
    // 1 (and the digit still exists after the 1 is removed), the first step is to
    // write the adjusted digit on the top row. When the column borrows, the next
    // step asks for the value that now stays in the column: the digit plus ten.
    // A value written in advance with the borrow of the previous column skips
    // the adjusted digit: only the value with ten squares (when this column also
    // borrows) and the digit that stays are still missing.
    if (prewritten) {
        localSubChosen.reduceValues[column] = localSubChosen.regroup[column];
    }
    var reduceEntry = !prewritten && localSubChosen.incoming > 0 && afterIncoming >= 0;
    localSubChosen.stage = reduceEntry ? "reduce" : "solve";
    if (reduceEntry) {
        localSubChosen.topSlot = "reduce";
        localSubChosen.topExpected = afterIncoming;
    } else {
        var needTop = localSubChosen.borrowNeeded && (!prewritten || localSubChosen.regroup[column] !== available);
        localSubChosen.topSlot = needTop ? "final" : "none";
        localSubChosen.topExpected = needTop ? available : null;
    }

    var order = htSubChosenOrderName(column);

    $("#htSubChosenQuestion").text(htSubChosenReplace($("#htSubChosenQuestionTemplate").text(), {
        order: order,
        base: available,
        bottom: bottomDigit
    }));

    var note = "";
    if (localSubChosen.stage === "reduce") {
        // First the adjusted digit is written, then the column is checked.
        note = htSubChosenReplace($("#htSubChosenIncomingTemplate").text(), {
            top: topDigit,
            first: afterIncoming
        });
    } else if (chained) {
        note = $("#htSubChosenChainedTemplate").text();
    } else if (borrowed) {
        note = htSubChosenReplace($("#htSubChosenBorrowTemplate").text(), {
            first: afterIncoming,
            bottom: bottomDigit,
            base: available
        });
    } else if (localSubChosen.incoming > 0) {
        note = htSubChosenReplace($("#htSubChosenIncomingTemplate").text(), {
            top: topDigit,
            first: afterIncoming
        });
    }
    $("#htSubChosenNote").text(note);
    if (note.length > 0) {
        $("#htSubChosenNote").removeClass("htAddHidden");
    } else {
        $("#htSubChosenNote").addClass("htAddHidden");
    }

    // Clear the fields and enable the ones of the current step: during the first
    // step only the value written on top is asked, so the digit and the borrow
    // wait until the top value is right.
    $("#htSubChosenTopInput").val("").prop("disabled", localSubChosen.topSlot === "none");
    $("#htSubChosenBorrowInput").val("").prop("disabled", !(localSubChosen.stage === "solve" && localSubChosen.borrowNeeded));
    $("#htSubChosenDigitInput").val("").prop("disabled", localSubChosen.stage !== "solve");
    $("#htSubChosenFeedback").html("");
    $("#htSubChosenNextBtn").addClass("hidden");

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htSubChosenBuildBoard();
    htSubChosenDrawSquares(false);
}

// The player writes a top value while typing, so a two-digit value like 13 is
// still being written when only its first digit is there: only values that can
// no longer become the right one show the tip.
function htSubChosenTopPartial(raw) {
    var expected = String(localSubChosen.topExpected);
    return localSubChosen.topExpected >= 10 && raw.length < expected.length && expected.indexOf(raw) === 0;
}

// Records the adjusted digit written on top when the previous column borrowed 1.
// If the column also borrows from the next order, the value written on top must
// be updated afterwards: the digit written first stays crossed out and the value
// with the ten squares is written next. Otherwise the adjusted digit is the value
// that stays on top and only the digit of the result row is asked.
function htSubChosenAcceptReduce() {
    var column = localSubChosen.column;

    localSubChosen.reduceValues[column] = localSubChosen.topExpected;
    if (localSubChosen.borrowNeeded) {
        localSubChosen.stage = "solve";
        localSubChosen.topSlot = "final";
        localSubChosen.topExpected = localSubChosen.base;
        $("#htSubChosenTopInput").val("");
    } else {
        localSubChosen.regroup[column] = localSubChosen.reduceValues[column];
        localSubChosen.stage = "solve";
        localSubChosen.topSlot = "none";
        localSubChosen.topExpected = null;
    }

    $("#htSubChosenFeedback").html("");
    // The top value of the column is written; ask now for the borrow and the
    // digit that the column keeps.
    $("#htSubChosenBorrowInput").prop("disabled", !localSubChosen.borrowNeeded);
    $("#htSubChosenDigitInput").prop("disabled", false);

    htSubChosenBuildBoard();
}

// Checks the fields as they are typed, so the button that verifies the column is
// not needed. A wrong value shows a tip; the right values solve the column at
// once. The steps are ordered: first the adjusted digit written on top (when the
// previous column borrowed 1), then the value written on top together with the
// borrow when the column borrows, and finally the digit that the column keeps.
function htSubChosenEvaluate() {
    if (localSubChosen.answered) {
        return;
    }

    var base = localSubChosen.base;
    var bottom = localSubChosen.bottomDigit;
    var result = base - bottom;
    var order = htSubChosenOrderName(localSubChosen.column);
    var topRaw = $("#htSubChosenTopInput").val();
    var borrowRaw = $("#htSubChosenBorrowInput").val();
    var digitRaw = $("#htSubChosenDigitInput").val();

    // Step 1: the adjusted digit written on top, when the previous column
    // borrowed 1.
    if (localSubChosen.stage === "reduce") {
        if (topRaw === "") {
            $("#htSubChosenFeedback").html("");
            return;
        }
        if (parseInt(topRaw, 10) === localSubChosen.topExpected) {
            htSubChosenAcceptReduce();
        } else if (!htSubChosenTopPartial(topRaw)) {
            $("#htSubChosenFeedback").html(htSubChosenReplace($("#htSubChosenWrongTopTemplate").html(), {
                top: localSubChosen.topDigits[localSubChosen.column],
                first: localSubChosen.afterIncoming
            }));
        }
        return;
    }

    // Step 2: when the column borrows, the value written on top stays crossed
    // out and the value with ten more squares is written.
    var topWritten = localSubChosen.topSlot !== "final";
    if (localSubChosen.topSlot === "final") {
        if (topRaw !== "" && parseInt(topRaw, 10) === localSubChosen.topExpected) {
            localSubChosen.regroup[localSubChosen.column] = localSubChosen.topExpected;
            localSubChosen.topSlot = "none";
            $("#htSubChosenFeedback").html("");
            topWritten = true;
            htSubChosenBuildBoard();
        } else if (topRaw !== "" && !htSubChosenTopPartial(topRaw)) {
            $("#htSubChosenFeedback").html(htSubChosenReplace(
                localSubChosen.chained ? $("#htSubChosenWrongTopChainedTemplate").html() : $("#htSubChosenWrongTopBorrowTemplate").html(),
                {
                    first: localSubChosen.afterIncoming,
                    bottom: bottom,
                    base: base
                }
            ));
            return;
        } else {
            $("#htSubChosenFeedback").html("");
            return;
        }
    }

    // The borrow of the column, typed above the next order. The player may also
    // write there the value that stays in the next order after lending the 1
    // (for example 8 when 9 lends 1). That value is the adjusted digit of the
    // next column, so it is written on top of that order and the borrow is
    // taken at the same time.
    var next = localSubChosen.column + 1;
    var nextReduced = localSubChosen.topDigits[next] - 1;
    var nextTop = (nextReduced < 0) ? 9 : nextReduced;
    var borrowIsNextTop = localSubChosen.borrowNeeded && next < localSubChosen.columns &&
        borrowRaw !== "" && nextTop !== 1 && parseInt(borrowRaw, 10) === nextTop;
    var borrowOk = !localSubChosen.borrowNeeded ||
        (borrowRaw !== "" && (parseInt(borrowRaw, 10) === 1 || borrowIsNextTop));
    if (borrowOk && localSubChosen.borrowNeeded) {
        localSubChosen.borrows[localSubChosen.column] = 1;
        localSubChosen.borrowTyped = true;
        if (borrowIsNextTop) {
            localSubChosen.regroup[next] = nextTop;
        }
    }
    if (localSubChosen.borrowNeeded && borrowRaw !== "" && !borrowOk) {
        $("#htSubChosenFeedback").html(htSubChosenReplace($("#htSubChosenWrongBorrowTemplate").html(), {
            first: localSubChosen.afterIncoming,
            bottom: bottom,
            next: htSubChosenOrderName(next)
        }));
        return;
    }
    if (borrowOk && localSubChosen.borrowNeeded) {
        localSubChosen.borrows[localSubChosen.column] = 1;
        localSubChosen.borrowTyped = true;
    }

    // The digit that the column keeps, typed on the result row.
    var digitOk = digitRaw !== "" && parseInt(digitRaw, 10) === result;
    if (digitRaw !== "" && !digitOk) {
        $("#htSubChosenFeedback").html(htSubChosenReplace($("#htSubChosenWrongDigitTemplate").html(), {
            order: order,
            bottom: bottom,
            comp: 10 - bottom
        }));
        return;
    }

    if (topWritten && borrowOk && digitOk) {
        htSubChosenResolve();
    } else {
        $("#htSubChosenFeedback").html("");
        htSubChosenBuildBoard();
    }
}

// Records the result digit of the column. The squares of the bottom digit are
// removed (they turn light yellow) and a congratulation is shown, together with
// the button that moves to the next column (or back to the number fields). The
// reduced digits of the next columns are not written here: the player writes them
// on top when solving those columns.
function htSubChosenResolve() {
    if (localSubChosen.answered) {
        return;
    }
    localSubChosen.answered = true;

    var column = localSubChosen.column;
    var result = localSubChosen.base - localSubChosen.bottomDigit;
    var order = htSubChosenOrderName(column);

    localSubChosen.borrows[column] = localSubChosen.borrowOut ? 1 : 0;
    localSubChosen.results[column] = result;
    localSubChosen.lastBorrow = localSubChosen.borrowOut ? 1 : 0;

    htSubChosenBuildBoard();
    // The typed values remove the squares: the bottom digit turns light yellow
    // and the light blue squares that remain are the digit that stays.
    htSubChosenDrawSquares(true);

    var template = localSubChosen.borrowOut ? $("#htSubChosenMsgBorrowTemplate").html() : $("#htSubChosenMsgNoBorrowTemplate").html();
    var explanation = htSubChosenReplace(template, {
        base: localSubChosen.base,
        removed: localSubChosen.bottomDigit,
        result: result,
        order: order
    });

    $("#htSubChosenTopInput").prop("disabled", true);
    $("#htSubChosenDigitInput").prop("disabled", true);
    $("#htSubChosenBorrowInput").prop("disabled", true);

    var congrats;
    var suffix = "";
    if (column >= localSubChosen.columns - 1) {
        congrats = htSubChosenReplace($("#htSubChosenPerfectTemplate").html(), {
            top: localSubChosen.top,
            bottom: localSubChosen.bottom,
            result: localSubChosen.top - localSubChosen.bottom
        });
        suffix = " <i class=\"fa-solid fa-medal\" style=\"font-size: 4em; color: gold;\"></i>";
        $("#htSubChosenNextBtn").text($("#htSubChosenNewNumbersLabel").text()).removeClass("hidden");
    } else {
        congrats = $("#htSubChosenCongratsTemplate").html();
        $("#htSubChosenNextBtn").text($("#htSubChosenNextColumnLabel").text()).removeClass("hidden");
    }

    $("#htSubChosenFeedback").html(congrats + "<br />" + explanation + suffix);
}

// Moves to the next column of the same subtraction, bringing the borrow along, or
// goes back to the fields once the last column is done so the player can choose
// other numbers.
function htSubChosenNext() {
    if (!localSubChosen.answered) {
        return;
    }

    if (localSubChosen.column >= localSubChosen.columns - 1) {
        htSubChosenNewNumbers();
        return;
    }

    localSubChosen.column += 1;
    localSubChosen.incoming = localSubChosen.lastBorrow;
    htSubChosenSetupColumn();
}

function htSubChosenBuildOrders() {
    var $orders = $("#htSubChosenOrders");
    $orders.empty();
    for (var i = 0; i < localSubChosen.columns; i++) {
        $("<span>")
            .addClass("htAddOrder")
            .attr("data-order", i)
            .text(htSubChosenOrderName(i))
            .appendTo($orders);
    }
}

// Reads a field and returns the number written in it, or null when the field is
// empty or the number is outside the allowed range.
function htSubChosenReadNumber(selector) {
    var raw = String($(selector).val()).replace(/[^0-9]/g, "");
    if (raw === "") {
        return null;
    }
    var value = parseInt(raw, 10);
    if (isNaN(value) || value < HT_SUBCHOSEN_MIN || value > HT_SUBCHOSEN_MAX) {
        return null;
    }
    return value;
}

// Starts the subtraction with the numbers written in the two fields. The second
// number cannot be greater than the first one: the subtraction is done with whole
// numbers, so a larger subtrahend would give a negative result. The number of
// columns is the number of digits of the largest operand, so the board shows only
// the columns the subtraction needs.
function htSubChosenStart() {
    var first = htSubChosenReadNumber("#htSubChosenFirst");
    var second = htSubChosenReadNumber("#htSubChosenSecond");

    if (first === null || second === null) {
        $("#htSubChosenError").text(htSubChosenReplace($("#htSubChosenErrorTemplate").text(), {
            min: HT_SUBCHOSEN_MIN,
            max: HT_SUBCHOSEN_MAX
        }));
        return;
    }

    if (second > first) {
        $("#htSubChosenError").text($("#htSubChosenOrderErrorTemplate").text());
        return;
    }

    $("#htSubChosenError").text("");
    localSubChosen.top = first;
    localSubChosen.bottom = second;
    localSubChosen.columns = Math.max(String(first).length, String(second).length);
    localSubChosen.topDigits = htSubChosenDigits(first, localSubChosen.columns);
    localSubChosen.bottomDigits = htSubChosenDigits(second, localSubChosen.columns);
    localSubChosen.column = 0;
    localSubChosen.incoming = 0;
    localSubChosen.borrows = {};
    localSubChosen.results = {};
    localSubChosen.regroup = {};
    localSubChosen.reduceValues = {};
    localSubChosen.answered = false;
    localSubChosen.lastBorrow = 0;

    $("#htSubChosenSetup").addClass("htAddHidden");
    $("#htSubChosenGame").removeClass("htAddHidden");
    htSubChosenBuildOrders();
    htSubChosenSetupColumn();
}

// Goes back to the number fields, keeping the previous values so they can be
// changed, once the subtraction is finished.
function htSubChosenNewNumbers() {
    $("#htSubChosenGame").addClass("htAddHidden");
    $("#htSubChosenSetup").removeClass("htAddHidden");
    $("#htSubChosenError").text("");
    $("#htSubChosenFirst").focus();
}

function htLoadContent() {
    htWriteNavigation();

    localSubChosen = {
        top: 0,
        bottom: 0,
        columns: 1,
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

    // The two fields accept only digits, up to five of them (99999).
    $("#htSubChosenFirst, #htSubChosenSecond").off("input").on("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "").slice(0, 5);
        $("#htSubChosenError").text("");
    });

    $("#htSubChosenStartBtn").off("click").on("click", function() {
        htSubChosenStart();
    });

    $("#htSubChosenFirst, #htSubChosenSecond").off("keydown").on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            htSubChosenStart();
        }
    });

    $("#htSubChosenNextBtn").off("click").on("click", function() {
        htSubChosenNext();
    });

    // The values are checked as they are typed, so there is no verify button.
    $("#htSubChosenTopInput, #htSubChosenDigitInput, #htSubChosenBorrowInput").off("input").on("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "");
        htSubChosenEvaluate();
    });

    $("#htSubChosenGame").addClass("htAddHidden");
    $("#htSubChosenSetup").removeClass("htAddHidden");

    return false;
}
