// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing addition with chosen numbers" (content 4d141853-389b-4ee9-87f2-03d8b2e4d5e4).
// Same vertical addition as the "Practicing addition with typed values" game:
// the addition is laid out column by column, from the units upwards, with the
// light blue squares showing the value already in the column. Instead of adding
// the bottom digit square by square with the buttons, the player types the digit
// that the column keeps and, when the column reaches ten, the 1 carried to the
// box above the next order. The values are checked as they are typed: a wrong
// value colours as many squares as the value written, the right values fill
// them and are congratulated, and the button that moves to the next column
// appears. When the column carries, writing a value colours the squares outside
// the group of ten, making the number expected explicit, and they take priority
// over the written value.
//
// The difference with that game is that the numbers are not generated at
// random: the player first types the two operands, between 0 and 99999, in two
// text fields. The addition then uses exactly the numbers written and shows as
// many columns as they need. The localized texts live in the class JSON, so this
// file only wires the behavior and draws the board.

var localAddTyped = {};

var HT_ADDTYPED_MIN = 0;
var HT_ADDTYPED_MAX = 99999;

function htAddTypedOrderName(order) {
    return $("#htAddTypedOrder" + order).text();
}

// Returns the digits of value from the units order upwards (index 0 = units).
function htAddTypedDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

function htAddTypedReplace(template, values) {
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
function htAddTypedBuildBoard() {
    var d = localAddTyped.columns;
    var current = localAddTyped.column;
    var fDigits = localAddTyped.firstDigits;
    var aDigits = localAddTyped.addendDigits;
    var pending = !localAddTyped.answered;

    function opCell(content) {
        return "<td class=\"htAddOp\">" + content + "</td>";
    }
    function cell(order, content) {
        var cls = "htAddCell" + (order === current ? " htAddCellActive" : "");
        return "<td class=\"" + cls + "\" data-order=\"" + order + "\">" + content + "</td>";
    }

    // The value fields are part of the board, so take them out before the table
    // is rebuilt, otherwise the rebuild would destroy them.
    $("#htAddTypedDigitInput, #htAddTypedCarryInput").appendTo("#htAddTypedInputHome");

    var rows = "";
    // The carry out of column c is written above column c + 1.
    rows += "<tr class=\"htAddCarryRow\">" + opCell("");
    for (var o = d; o >= 0; o--) {
        var carryVal = "";
        if (o >= 1 && localAddTyped.carries[o - 1] !== undefined) {
            carryVal = localAddTyped.carries[o - 1] ? "1" : "";
        }
        // The carry of the column being solved is typed above the next order,
        // but only when the column actually carries.
        if (pending && localAddTyped.carryNeeded && o === current + 1) {
            carryVal = "<span id=\"htAddTypedCarrySlot\"></span>";
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
        var res = (localAddTyped.results[o] !== undefined) ? String(localAddTyped.results[o]) : "";
        // The digit kept by the column being solved is typed here.
        if (pending && o === current) {
            res = "<span id=\"htAddTypedDigitSlot\"></span>";
        }
        rows += cell(o, res);
    }
    rows += "</tr>";

    $("#htAddTypedTable").html(rows);

    // Put the value fields in the position of the sum.
    if (pending) {
        $("#htAddTypedDigitSlot").append($("#htAddTypedDigitInput"));
        if (localAddTyped.carryNeeded) {
            $("#htAddTypedCarrySlot").append($("#htAddTypedCarryInput"));
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
function htAddTypedDrawSquares(revealed) {
    var base = localAddTyped.base;
    var addend = localAddTyped.addendDigit;
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

    $("#htAddTypedSquares").html(html);
    $("#htAddTypedSquaresCaption").text(base + " + " + addend + " = " + (revealed ? (base + addend) : "?"));
    htAddTypedUpdateSquaresNote(added, complement);
}

// Spells out, for the column being solved, the complement and how the squares
// were used: how many have been filled, how many complete the ten and how many
// stay outside the group. It is refreshed when the column is solved, so the
// highlight matches the typed values.
function htAddTypedUpdateSquaresNote(added, complement) {
    var note = htAddTypedReplace($("#htAddTypedSquaresUsedTemplate").text(), {
        used: added
    });

    if (complement > 0) {
        if (added < complement) {
            note += " " + htAddTypedReplace($("#htAddTypedComplementPendingTemplate").text(), {
                base: localAddTyped.base,
                comp: complement,
                missing: complement - added
            });
        } else {
            note += " " + htAddTypedReplace($("#htAddTypedComplementUsedTemplate").text(), {
                base: localAddTyped.base,
                comp: complement,
                outside: added - complement
            });
        }
    }

    $("#htAddTypedSquaresNote").text(note);
}

// Prepares the column that must be solved next.
function htAddTypedSetupColumn() {
    var column = localAddTyped.column;
    var firstDigit = localAddTyped.firstDigits[column];
    var addendDigit = localAddTyped.addendDigits[column];
    var base = firstDigit + localAddTyped.incoming;
    var order = htAddTypedOrderName(column);

    localAddTyped.answered = false;
    localAddTyped.firstDigit = firstDigit;
    localAddTyped.addendDigit = addendDigit;
    localAddTyped.base = base;
    // The carry field is only added to the board when the column reaches ten.
    localAddTyped.carryNeeded = (base + addendDigit) >= 10;

    $("#htAddTypedQuestion").text(htAddTypedReplace($("#htAddTypedQuestionTemplate").text(), {
        order: order,
        base: base,
        added: addendDigit
    }));

    // When a 1 comes from the previous column, say it explicitly: it is the
    // reason the value already in this column is not just the first digit.
    if (localAddTyped.incoming > 0) {
        $("#htAddTypedIncomingNote").text(htAddTypedReplace($("#htAddTypedIncomingTemplate").text(), {
            first: firstDigit,
            base: base
        })).removeClass("htAddHidden");
    } else {
        $("#htAddTypedIncomingNote").text("").addClass("htAddHidden");
    }

    // Clear the fields and controls for the new column.
    $("#htAddTypedDigitInput").val("").prop("disabled", false);
    $("#htAddTypedCarryInput").val("").prop("disabled", false);
    $("#htAddTypedFeedback").html("");
    $("#htAddTypedNextBtn").addClass("hidden");

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htAddTypedBuildBoard();
    htAddTypedDrawSquares(false);
    $("#htAddTypedDigitInput").focus();
}

// Colours the squares according to what the player writes in the digit field.
// A square that already has blue turns dark blue; a square with no colour turns
// light yellow. When the column carries, the digit that stays is the number of
// squares outside the group of ten, so the value written colours that many of
// those squares. Nothing is coloured while the field is empty.
function htAddTypedMarkWrittenSquares(writtenDigit) {
    var squares = $("#htAddTypedSquares .htAddSquare").removeClass("htAddSquareWritten").removeClass("htAddSquareBaseWritten");
    if (writtenDigit === "") {
        return;
    }
    var written = parseInt(writtenDigit, 10);
    var marked;
    if (localAddTyped.carryNeeded) {
        var outside = squares.slice(10);
        marked = outside.slice(0, Math.max(0, Math.min(written, outside.length)));
    } else {
        marked = squares.slice(0, Math.max(0, Math.min(written, squares.length)));
    }
    marked.each(function() {
        if ($(this).hasClass("htAddSquareBase")) {
            $(this).addClass("htAddSquareBaseWritten");
        } else {
            $(this).addClass("htAddSquareWritten");
        }
    });
}

// Checks the fields as they are typed, so the button that verified the column is
// not needed. A wrong digit or carry colours the squares; the right values solve
// the column at once. The carry field is only present when the column reaches
// ten, so when there is no carry the digit alone solves it.
function htAddTypedEvaluate() {
    if (localAddTyped.answered) {
        return;
    }

    var base = localAddTyped.base;
    var addend = localAddTyped.addendDigit;
    var sum = base + addend;
    var correctDigit = sum % 10;
    var correctCarry = sum >= 10 ? 1 : 0;
    var order = htAddTypedOrderName(localAddTyped.column);
    var complement = (base < 10) ? (10 - base) : 0;
    var digitRaw = $("#htAddTypedDigitInput").val();
    var carryRaw = $("#htAddTypedCarryInput").val();

    var digitOk = digitRaw !== "" && parseInt(digitRaw, 10) === correctDigit;
    var carryOk = !localAddTyped.carryNeeded || (carryRaw !== "" && parseInt(carryRaw, 10) === correctCarry);

    // Colour the squares according to the value written, before deciding whether
    // it is right or wrong.
    htAddTypedMarkWrittenSquares(digitRaw);

    if (digitRaw !== "" && !digitOk) {
        // The tip covers both numbers of the column: the complement of the
        // value already in the column and how the bottom digit compares to it.
        var wrongTemplate;
        if (base >= 10) {
            wrongTemplate = $("#htAddTypedWrongDigitOverTemplate").html();
        } else if (addend >= complement) {
            wrongTemplate = $("#htAddTypedWrongDigitTenTemplate").html();
        } else {
            wrongTemplate = $("#htAddTypedWrongDigitTemplate").html();
        }
        $("#htAddTypedFeedback").html(htAddTypedReplace(wrongTemplate, {
            order: order,
            base: base,
            added: addend,
            comp: complement
        }));
        return;
    }

    if (localAddTyped.carryNeeded && carryRaw !== "" && !carryOk) {
        $("#htAddTypedFeedback").html(htAddTypedReplace($("#htAddTypedWrongCarryTemplate").html(), {
            order: order,
            base: base,
            added: addend
        }));
        return;
    }

    if (digitOk && carryOk) {
        htAddTypedResolve();
    } else {
        $("#htAddTypedFeedback").html("");
    }
}

// Records the result digit of the column and the 1 it carries, if any. When the
// values are right the squares are filled and a congratulation is shown, together
// with the button that moves to the next column (or back to the number fields).
function htAddTypedResolve() {
    if (localAddTyped.answered) {
        return;
    }
    localAddTyped.answered = true;

    var column = localAddTyped.column;
    var sum = localAddTyped.base + localAddTyped.addendDigit;
    var carry = sum >= 10;
    var order = htAddTypedOrderName(column);

    localAddTyped.carries[column] = carry ? 1 : 0;
    localAddTyped.results[column] = sum % 10;
    localAddTyped.lastCarry = carry ? 1 : 0;

    htAddTypedBuildBoard();
    // The typed values fill the squares: the bottom digit turns light yellow
    // and the group of ten shows the carried 1.
    htAddTypedDrawSquares(true);

    var explanation = htAddTypedReplace(carry ? $("#htAddTypedMsgCarryTemplate").html() : $("#htAddTypedMsgNoCarryTemplate").html(), {
        base: localAddTyped.base,
        added: localAddTyped.addendDigit,
        sum: sum,
        result: sum % 10,
        order: order
    });

    $("#htAddTypedDigitInput").prop("disabled", true);
    $("#htAddTypedCarryInput").prop("disabled", true);

    var congrats;
    var suffix = "";
    if (column >= localAddTyped.columns - 1) {
        // The whole addition is done. A carry out of the last column created a
        // new order on the left, which holds only the carried 1.
        if (carry) {
            localAddTyped.results[localAddTyped.columns] = 1;
            htAddTypedBuildBoard();
        }
        congrats = htAddTypedReplace($("#htAddTypedPerfectTemplate").html(), {
            first: localAddTyped.first,
            addend: localAddTyped.addend,
            sum: localAddTyped.first + localAddTyped.addend
        });
        suffix = " <i class=\"fa-solid fa-medal\" style=\"font-size: 4em; color: gold;\"></i>";
        $("#htAddTypedNextBtn").text($("#htAddTypedNewNumbersLabel").text()).removeClass("hidden");
    } else {
        congrats = $("#htAddTypedCongratsTemplate").html();
        $("#htAddTypedNextBtn").text($("#htAddTypedNextColumnLabel").text()).removeClass("hidden");
    }

    $("#htAddTypedFeedback").html(congrats + "<br />" + explanation + suffix);
}

// Moves to the next column of the same addition, bringing the carry along, or
// goes back to the fields once the last column is done so the player can choose
// other numbers.
function htAddTypedNext() {
    if (!localAddTyped.answered) {
        return;
    }

    if (localAddTyped.column >= localAddTyped.columns - 1) {
        htAddTypedNewNumbers();
        return;
    }

    localAddTyped.column += 1;
    localAddTyped.incoming = localAddTyped.lastCarry;
    htAddTypedSetupColumn();
}

function htAddTypedBuildOrders() {
    var $orders = $("#htAddTypedOrders");
    $orders.empty();
    for (var i = 0; i < localAddTyped.columns; i++) {
        $("<span>")
            .addClass("htAddOrder")
            .attr("data-order", i)
            .text(htAddTypedOrderName(i))
            .appendTo($orders);
    }
}

// Reads a field and returns the number written in it, or null when the field is
// empty or the number is outside the allowed range.
function htAddTypedReadNumber(selector) {
    var raw = String($(selector).val()).replace(/[^0-9]/g, "");
    if (raw === "") {
        return null;
    }
    var value = parseInt(raw, 10);
    if (isNaN(value) || value < HT_ADDTYPED_MIN || value > HT_ADDTYPED_MAX) {
        return null;
    }
    return value;
}

// Starts the addition with the numbers written in the two fields. The number of
// columns is the number of digits of the largest operand, so the board shows
// only the columns the addition needs.
function htAddTypedStart() {
    var first = htAddTypedReadNumber("#htAddTypedFirst");
    var addend = htAddTypedReadNumber("#htAddTypedSecond");

    if (first === null || addend === null) {
        $("#htAddTypedError").text(htAddTypedReplace($("#htAddTypedErrorTemplate").text(), {
            min: HT_ADDTYPED_MIN,
            max: HT_ADDTYPED_MAX
        }));
        return;
    }

    $("#htAddTypedError").text("");
    localAddTyped.first = first;
    localAddTyped.addend = addend;
    localAddTyped.columns = Math.max(String(first).length, String(addend).length);
    localAddTyped.firstDigits = htAddTypedDigits(first, localAddTyped.columns);
    localAddTyped.addendDigits = htAddTypedDigits(addend, localAddTyped.columns);
    localAddTyped.column = 0;
    localAddTyped.incoming = 0;
    localAddTyped.carries = {};
    localAddTyped.results = {};
    localAddTyped.answered = false;
    localAddTyped.lastCarry = 0;

    $("#htAddTypedSetup").addClass("htAddHidden");
    $("#htAddTypedGame").removeClass("htAddHidden");
    htAddTypedBuildOrders();
    htAddTypedSetupColumn();
}

// Goes back to the number fields, keeping the previous values so they can be
// changed, once the addition is finished.
function htAddTypedNewNumbers() {
    $("#htAddTypedGame").addClass("htAddHidden");
    $("#htAddTypedSetup").removeClass("htAddHidden");
    $("#htAddTypedError").text("");
    $("#htAddTypedFirst").focus();
}

function htLoadContent() {
    htWriteNavigation();

    localAddTyped = {
        first: 0,
        addend: 0,
        columns: 1,
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

    // The two fields accept only digits, up to five of them (99999).
    $("#htAddTypedFirst, #htAddTypedSecond").off("input").on("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "").slice(0, 5);
        $("#htAddTypedError").text("");
    });

    $("#htAddTypedStartBtn").off("click").on("click", function() {
        htAddTypedStart();
    });

    $("#htAddTypedFirst, #htAddTypedSecond").off("keydown").on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            htAddTypedStart();
        }
    });

    $("#htAddTypedNextBtn").off("click").on("click", function() {
        htAddTypedNext();
    });

    // The values are checked as they are typed, so there is no verify button.
    $("#htAddTypedDigitInput, #htAddTypedCarryInput").off("input").on("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "");
        htAddTypedEvaluate();
    });

    $("#htAddTypedGame").addClass("htAddHidden");
    $("#htAddTypedSetup").removeClass("htAddHidden");

    return false;
}
