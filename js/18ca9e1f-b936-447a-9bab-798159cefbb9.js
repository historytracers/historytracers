// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing addition with typed values" (content 18ca9e1f-b936-447a-9bab-798159cefbb9).
// Same vertical addition as the "Practicing addition" game: the addition is
// laid out column by column, from the units upwards, with the light blue
// squares showing the value already in the column. Instead of adding the
// bottom digit square by square with the buttons, the player types the digit
// that the column keeps and, when the column reaches ten, the 1 carried to the
// box above the next order. The values are checked as they are typed: a wrong
// value colours as many squares as the value written, the right values fill
// them and are congratulated, and the button that moves to the next column
// appears. The localized texts live in the class JSON, so this file only wires
// the behavior and draws the board.

var localAddIn = {};

var HT_ADDIN_DIGITS = 3;

function htAddInOrderName(order) {
    return $("#htAddInOrder" + order).text();
}

// Returns the digits of value from the units order upwards (index 0 = units).
function htAddInDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

function htAddInReplace(template, values) {
    for (var key in values) {
        template = template.replace(new RegExp("\\{" + key + "\\}", "g"), values[key]);
    }
    return template;
}

// Draws the vertical addition: the carry row, the two operands with the + sign,
// the result line and the result row. The column being solved is highlighted and
// a column shows its result digit only once it has been solved. The two value
// fields live inside the board: the digit is typed in the result row of the
// column being solved and the carry is typed in the carry row, above the next
// order, exactly where they are written by hand.
function htAddInBuildBoard() {
    var d = HT_ADDIN_DIGITS;
    var current = localAddIn.column;
    var fDigits = localAddIn.firstDigits;
    var aDigits = localAddIn.addendDigits;
    var pending = !localAddIn.answered;

    function opCell(content) {
        return "<td class=\"htAddOp\">" + content + "</td>";
    }
    function cell(order, content) {
        var cls = "htAddCell" + (order === current ? " htAddCellActive" : "");
        return "<td class=\"" + cls + "\" data-order=\"" + order + "\">" + content + "</td>";
    }

    // The value fields are part of the board, so take them out before the table
    // is rebuilt, otherwise the rebuild would destroy them.
    $("#htAddInDigitInput, #htAddInCarryInput").appendTo("#htAddInInputHome");

    var rows = "";
    // The carry out of column c is written above column c + 1.
    rows += "<tr class=\"htAddCarryRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        var carryVal = "";
        if (o >= 1 && localAddIn.carries[o - 1] !== undefined) {
            carryVal = localAddIn.carries[o - 1] ? "1" : "";
        }
        // The carry of the column being solved is typed above the next order,
        // but only when the column actually carries.
        if (pending && localAddIn.carryNeeded && o === current + 1) {
            carryVal = "<span id=\"htAddInCarrySlot\"></span>";
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
        var res = (localAddIn.results[o] !== undefined) ? String(localAddIn.results[o]) : "";
        // The digit kept by the column being solved is typed here.
        if (pending && o === current) {
            res = "<span id=\"htAddInDigitSlot\"></span>";
        }
        rows += cell(o, res);
    }
    rows += "</tr>";

    $("#htAddInTable").html(rows);

    // Put the value fields in the position of the sum.
    if (pending) {
        $("#htAddInDigitSlot").append($("#htAddInDigitInput"));
        if (localAddIn.carryNeeded) {
            $("#htAddInCarrySlot").append($("#htAddInCarryInput"));
        }
    }
}

// Draws the squares of the column. The whole column is shown from the start:
// the "base" light blue squares are the value already in the column and the
// remaining squares stand for the bottom digit to be added. Before the answer
// those squares stay neutral; once the column is solved the bottom digit turns
// light yellow and the first ten squares are grouped, showing the 1 that goes
// to the next order. The squares left outside the group show the digit that
// stays in the column.
// The squares sitting between the value already in the column and the ten are
// its complement: they are the ones that close the group of ten. They are
// marked so the learner can see the complement before typing the values.
function htAddInDrawSquares(revealed) {
    var base = localAddIn.base;
    var addend = localAddIn.addendDigit;
    var added = revealed ? addend : 0;
    var total = base + addend;
    var complement = (base < 10) ? (10 - base) : 0;
    var html = "";
    var i;

    function square(index) {
        var cls = "htAddSquare";
        if (index < base) {
            cls += " htAddSquareBase";
        } else if (index - base < added) {
            cls += " htAddSquareAdded";
        } else {
            cls += " htAddSquarePending";
        }
        // Complement squares: from the value already in the column up to the ten.
        if (index >= base && index < 10) {
            cls += " htAddSquareComplement";
            if (index - base < added) {
                cls += " htAddSquareComplementUsed";
            }
        }
        return "<span class=\"" + cls + "\"></span>";
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

    $("#htAddInSquares").html(html);
    $("#htAddInSquaresCaption").text(base + " + " + addend + " = " + (revealed ? (base + addend) : "?"));
    htAddInUpdateSquaresNote(added, complement);
}

// Spells out, for the column being solved, the complement and how the squares
// were used: how many have been filled, how many complete the ten and how many
// stay outside the group. It is refreshed when the column is solved, so the
// highlight matches the typed values.
function htAddInUpdateSquaresNote(added, complement) {
    var note = htAddInReplace($("#htAddInSquaresUsedTemplate").text(), {
        used: added
    });

    if (complement > 0) {
        if (added < complement) {
            note += " " + htAddInReplace($("#htAddInComplementPendingTemplate").text(), {
                base: localAddIn.base,
                comp: complement,
                missing: complement - added
            });
        } else {
            note += " " + htAddInReplace($("#htAddInComplementUsedTemplate").text(), {
                base: localAddIn.base,
                comp: complement,
                outside: added - complement
            });
        }
    }

    $("#htAddInSquaresNote").text(note);
}

// Prepares the column that must be solved next.
function htAddInSetupColumn() {
    var column = localAddIn.column;
    var firstDigit = localAddIn.firstDigits[column];
    var addendDigit = localAddIn.addendDigits[column];
    var base = firstDigit + localAddIn.incoming;
    var order = htAddInOrderName(column);

    localAddIn.answered = false;
    localAddIn.firstDigit = firstDigit;
    localAddIn.addendDigit = addendDigit;
    localAddIn.base = base;
    // The carry field is only added to the board when the column reaches ten.
    localAddIn.carryNeeded = (base + addendDigit) >= 10;

    $("#htAddInQuestion").text(htAddInReplace($("#htAddInQuestionTemplate").text(), {
        order: order,
        base: base,
        added: addendDigit
    }));

    // When a 1 comes from the previous column, say it explicitly: it is the
    // reason the value already in this column is not just the first digit.
    if (localAddIn.incoming > 0) {
        $("#htAddInIncomingNote").text(htAddInReplace($("#htAddInIncomingTemplate").text(), {
            first: firstDigit,
            base: base
        })).removeClass("htAddHidden");
    } else {
        $("#htAddInIncomingNote").text("").addClass("htAddHidden");
    }

    // Clear the fields and controls for the new column.
    $("#htAddInDigitInput").val("").prop("disabled", false);
    $("#htAddInCarryInput").val("").prop("disabled", false);
    $("#htAddInFeedback").html("");
    $("#htAddInNextBtn").addClass("hidden");

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htAddInBuildBoard();
    htAddInDrawSquares(false);
}

// Colours the squares counted by a value that does not match the column: a
// written digit colours that many squares, the rest keep their normal colours.
function htAddInMarkWrittenSquares(count) {
    var squares = $("#htAddInSquares .htAddSquare").removeClass("htAddSquareWritten");
    var written = Math.max(0, Math.min(count, squares.length));
    squares.slice(0, written).addClass("htAddSquareWritten");
}

// Checks the fields as they are typed, so the button that verified the column is
// not needed. A wrong digit or carry colours the squares; the right values solve
// the column at once. The carry field is only present when the column reaches
// ten, so when there is no carry the digit alone solves it.
function htAddInEvaluate() {
    if (localAddIn.answered) {
        return;
    }

    var base = localAddIn.base;
    var addend = localAddIn.addendDigit;
    var sum = base + addend;
    var correctDigit = sum % 10;
    var correctCarry = sum >= 10 ? 1 : 0;
    var order = htAddInOrderName(localAddIn.column);
    var complement = (base < 10) ? (10 - base) : 0;
    var digitRaw = $("#htAddInDigitInput").val();
    var carryRaw = $("#htAddInCarryInput").val();

    var digitOk = digitRaw !== "" && parseInt(digitRaw, 10) === correctDigit;
    var carryOk = !localAddIn.carryNeeded || (carryRaw !== "" && parseInt(carryRaw, 10) === correctCarry);

    if (digitRaw !== "" && !digitOk) {
        htAddInMarkWrittenSquares(parseInt(digitRaw, 10));
        $("#htAddInFeedback").html(htAddInReplace($("#htAddInWrongDigitTemplate").html(), {
            order: order,
            base: base,
            comp: complement
        }));
        return;
    }

    if (localAddIn.carryNeeded && carryRaw !== "" && !carryOk) {
        htAddInMarkWrittenSquares(parseInt(carryRaw, 10));
        $("#htAddInFeedback").html(htAddInReplace($("#htAddInWrongCarryTemplate").html(), {
            order: order,
            base: base,
            added: addend
        }));
        return;
    }

    htAddInMarkWrittenSquares(0);

    if (digitOk && carryOk) {
        htAddInResolve();
    } else {
        $("#htAddInFeedback").html("");
    }
}

// Records the result digit of the column and the 1 it carries, if any. When the
// values are right the squares are filled and a congratulation is shown, together
// with the button that moves to the next column (or to a new problem).
function htAddInResolve() {
    if (localAddIn.answered) {
        return;
    }
    localAddIn.answered = true;

    var column = localAddIn.column;
    var sum = localAddIn.base + localAddIn.addendDigit;
    var carry = sum >= 10;
    var order = htAddInOrderName(column);

    localAddIn.carries[column] = carry ? 1 : 0;
    localAddIn.results[column] = sum % 10;
    localAddIn.lastCarry = carry ? 1 : 0;

    htAddInBuildBoard();
    // The typed values fill the squares: the bottom digit turns light yellow
    // and the group of ten shows the carried 1.
    htAddInDrawSquares(true);

    var explanation = htAddInReplace(carry ? $("#htAddInMsgCarryTemplate").html() : $("#htAddInMsgNoCarryTemplate").html(), {
        base: localAddIn.base,
        added: localAddIn.addendDigit,
        sum: sum,
        result: sum % 10,
        order: order
    });

    $("#htAddInDigitInput").prop("disabled", true);
    $("#htAddInCarryInput").prop("disabled", true);

    var congrats;
    var suffix = "";
    if (column >= HT_ADDIN_DIGITS - 1) {
        // The whole addition is done. A carry out of the last column created a
        // new order on the left, which holds only the carried 1.
        if (carry) {
            localAddIn.results[HT_ADDIN_DIGITS] = 1;
            htAddInBuildBoard();
        }
        congrats = htAddInReplace($("#htAddInPerfectTemplate").html(), {
            first: localAddIn.first,
            addend: localAddIn.addend,
            sum: localAddIn.first + localAddIn.addend
        });
        suffix = " <i class=\"fa-solid fa-medal\" style=\"font-size: 4em; color: gold;\"></i>";
        $("#htAddInNextBtn").text($("#htAddInPlayAgainLabel").text()).removeClass("hidden");
    } else {
        congrats = $("#htAddInCongratsTemplate").html();
        $("#htAddInNextBtn").text($("#htAddInNextColumnLabel").text()).removeClass("hidden");
    }

    $("#htAddInFeedback").html(congrats + "<br />" + explanation + suffix);
}

// Moves to the next column of the same addition, bringing the carry along, or
// starts a new addition once the last column is done.
function htAddInNext() {
    if (!localAddIn.answered) {
        return;
    }

    if (localAddIn.column >= HT_ADDIN_DIGITS - 1) {
        htAddInNewProblem();
        return;
    }

    localAddIn.column += 1;
    localAddIn.incoming = localAddIn.lastCarry;
    htAddInSetupColumn();
}

function htAddInBuildOrders() {
    var html = "";
    for (var i = 0; i < HT_ADDIN_DIGITS; i++) {
        html += "<span class=\"htAddOrder\" data-order=\"" + i + "\">" + htAddInOrderName(i) + "</span>";
    }
    $("#htAddInOrders").html(html);
}

function htAddInNewProblem() {
    localAddIn.first = htGetRandomArbitrary(100, 1000);
    localAddIn.addend = htGetRandomArbitrary(100, 1000);
    localAddIn.firstDigits = htAddInDigits(localAddIn.first, HT_ADDIN_DIGITS);
    localAddIn.addendDigits = htAddInDigits(localAddIn.addend, HT_ADDIN_DIGITS);
    localAddIn.column = 0;
    localAddIn.incoming = 0;
    localAddIn.carries = {};
    localAddIn.results = {};

    htAddInSetupColumn();
}

function htLoadContent() {
    htWriteNavigation();

    localAddIn = {
        first: 0,
        addend: 0,
        firstDigits: [],
        addendDigits: [],
        column: 0,
        incoming: 0,
        carries: {},
        results: {},
        base: 0,
        addendDigit: 0,
        carryNeeded: false,
        answered: false,
        lastCarry: 0
    };

    htAddInBuildOrders();

    $("#htAddInNextBtn").off("click").on("click", function() {
        htAddInNext();
    });

    // The values are checked as they are typed, so there is no verify button.
    $("#htAddInDigitInput, #htAddInCarryInput").off("input").on("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "");
        htAddInEvaluate();
    });

    htAddInNewProblem();

    return false;
}
