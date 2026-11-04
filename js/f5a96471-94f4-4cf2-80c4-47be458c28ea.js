// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing multiplication with typed values" (content
// f5a96471-94f4-4cf2-80c4-47be458c28ea). Same vertical multiplication as the
// "Practicing multiplication by one-digit numbers" game: a number of one, two
// or three digits (in successive levels) is multiplied by a one-digit number,
// column by column, from the units upwards. Instead of repeating the groups of
// squares with the buttons, the player types the digit that the column keeps
// and, when the column reaches ten or more, the number of complete groups of
// ten carried to the box above the next order. The values are checked as they
// are typed: a wrong value colours as many squares as the number written, the
// right values fill them and are congratulated, and the button that moves to
// the next column appears. The localized texts live in the class JSON, so this
// file only wires the behavior and draws the board.

var localMultIn = {};

// Highest level of the game: 0 = units, 1 = tens, 2 = hundreds.
var HT_MULTIN_MAX_LEVEL = 2;

// Range of random values of the number being multiplied, per level.
var HT_MULTIN_RANGES = [[0, 10], [10, 100], [100, 1000]];

function htMultInOrderName(order) {
    return $("#htMultInOrder" + order).text();
}

// Returns the digits of value from the units order upwards (index 0 = units).
function htMultInDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

function htMultInReplace(template, values) {
    for (var key in values) {
        template = template.replace(new RegExp("\\{" + key + "\\}", "g"), values[key]);
    }
    return template;
}

// Draws the vertical multiplication: the carry row, the number being
// multiplied, the one-digit multiplier below the multiplication sign, the
// result line and the result row. The column being solved is highlighted and
// a column shows its result digit only once it has been solved. The two value
// fields live inside the board: the digit is typed in the result row of the
// column being solved and the carry is typed in the carry row, above the next
// order, exactly where it is written by hand. In multiplication the carry can
// be more than 1, so the carry row shows the number of complete groups of ten.
function htMultInBuildBoard() {
    var digits = localMultIn.digits;
    var current = localMultIn.column;
    var mDigits = localMultIn.multiplicandDigits;
    var mult = localMultIn.multiplier;
    var pending = !localMultIn.answered;

    // Highest order shown on the board. The extra order on the left only
    // appears when the column being solved needs a carry box above it or when
    // the last column really carried out, so a result that fits in the
    // current orders does not show an empty leading column.
    var d = digits - 1;
    var top = d;
    if (current === d && ((pending && localMultIn.carryNeeded) || (!pending && (localMultIn.carries[d] || 0) > 0))) {
        top = d + 1;
    }

    function opCell(content) {
        return "<td class=\"htAddOp\">" + content + "</td>";
    }
    function cell(order, content) {
        var cls = "htAddCell" + (order === current ? " htAddCellActive" : "");
        return "<td class=\"" + cls + "\" data-order=\"" + order + "\">" + content + "</td>";
    }

    // The value fields are part of the board, so take them out before the table
    // is rebuilt, otherwise the rebuild would destroy them.
    $("#htMultInDigitInput, #htMultInCarryInput").appendTo("#htMultInInputHome");

    var rows = "";
    // The carry out of column c is written above column c + 1.
    rows += "<tr class=\"htAddCarryRow\">" + opCell("");
    for (var o = top; o >= 0; o--) {
        var carryVal = "";
        if (o >= 1 && localMultIn.carries[o - 1] !== undefined) {
            carryVal = String(localMultIn.carries[o - 1]);
        }
        // The carry of the column being solved is typed above the next order,
        // but only when the column reaches ten or more.
        if (pending && localMultIn.carryNeeded && o === current + 1) {
            carryVal = "<span id=\"htMultInCarrySlot\"></span>";
        }
        rows += cell(o, carryVal);
    }
    rows += "</tr>";
    // Number being multiplied, one digit per order.
    rows += "<tr>" + opCell("");
    for (o = top; o >= 0; o--) {
        rows += cell(o, o <= d ? String(mDigits[o]) : "");
    }
    rows += "</tr>";
    // One-digit multiplier, with the multiplication sign in its own column.
    rows += "<tr>" + opCell("×");
    for (o = top; o >= 0; o--) {
        rows += cell(o, o === 0 ? String(mult) : "");
    }
    rows += "</tr>";
    // Line
    rows += "<tr class=\"htAddLine\"><td colspan=\"" + (top + 2) + "\"></td></tr>";
    // Result
    rows += "<tr class=\"htAddResultRow\">" + opCell("");
    for (o = top; o >= 0; o--) {
        var res = (localMultIn.results[o] !== undefined) ? String(localMultIn.results[o]) : "";
        // The digit kept by the column being solved is typed here.
        if (pending && o === current) {
            res = "<span id=\"htMultInDigitSlot\"></span>";
        }
        rows += cell(o, res);
    }
    rows += "</tr>";

    $("#htMultInTable").html(rows);

    // Put the value fields in the position of the product.
    if (pending) {
        $("#htMultInDigitSlot").append($("#htMultInDigitInput"));
        if (localMultIn.carryNeeded) {
            $("#htMultInCarrySlot").append($("#htMultInCarryInput"));
        }
    }
}

// Draws the squares of the column. The whole column is shown from the start:
// the light blue squares are the carry coming from the previous order, added
// at the end, and the remaining squares are the product of the column, staying
// neutral until the column is solved, when they turn light yellow. The squares
// are drawn flat, in the order they are counted: they are laid out inside
// complete groups of ten first, and the squares outside the last group of ten
// are the digit that stays in the column. When the player types a value, that
// many squares are marked: the first ones of the column when it stays below
// ten, or the ones outside the complete groups of ten when it carries.
function htMultInDrawSquares(written) {
    var incoming = localMultIn.incoming;
    var digit = localMultIn.digit;
    var mult = localMultIn.multiplier;
    var product = digit * mult;
    var total = product + incoming;
    var html = "";
    var i;

    function square(index) {
        var cls = "htAddSquare";
        if (index < incoming) {
            cls += " htAddSquareBase";
        } else if (localMultIn.answered) {
            cls += " htAddSquareAdded";
        } else {
            cls += " htAddSquarePending";
        }
        // Squares marked with the number written by the player, before the
        // column is solved.
        if (!localMultIn.answered && written > 0) {
            var start = localMultIn.carryNeeded ? Math.floor(total / 10) * 10 : 0;
            if (index >= start && index < start + written) {
                if (index < incoming) {
                    cls += " htAddSquareBaseWritten";
                } else {
                    cls += " htAddSquareWritten";
                }
            }
        }
        return "<span class=\"" + cls + "\"></span>";
    }

    if (total >= 10) {
        var groups = Math.floor(total / 10);
        for (var g = 0; g < groups; g++) {
            html += "<span class=\"htAddTenGroup\">";
            for (i = 0; i < 10; i++) {
                html += square(g * 10 + i);
            }
            html += "</span>";
        }
        for (i = groups * 10; i < total; i++) {
            html += square(i);
        }
    } else {
        for (i = 0; i < total; i++) {
            html += square(i);
        }
    }

    $("#htMultInSquares").html(html);

    var caption;
    if (localMultIn.answered) {
        caption = digit + " × " + mult + " = " + product;
    } else {
        caption = digit + " × " + mult + " = ?";
    }
    $("#htMultInSquaresCaption").text(caption);

    var note;
    if (localMultIn.answered) {
        note = htMultInReplace($("#htMultInTenNoteTemplate").text(), {
            tens: Math.floor(total / 10),
            outside: total % 10,
            order: htMultInOrderName(localMultIn.column)
        });
    } else if (incoming > 0) {
        note = htMultInReplace($("#htMultInNoteIncomingTemplate").text(), {
            digit: digit,
            mult: mult,
            product: product,
            incoming: incoming
        });
    } else {
        note = htMultInReplace($("#htMultInNoteTemplate").text(), {
            digit: digit,
            mult: mult,
            product: product
        });
    }
    $("#htMultInSquaresNote").text(note);
}

// Prepares the column that must be solved next.
function htMultInSetupColumn() {
    var column = localMultIn.column;
    var digit = localMultIn.multiplicandDigits[column];
    var mult = localMultIn.multiplier;
    var product = digit * mult;
    var total = product + localMultIn.incoming;
    var order = htMultInOrderName(column);

    localMultIn.answered = false;
    localMultIn.digit = digit;
    // The carry field is only added to the board when the column reaches ten.
    localMultIn.carryNeeded = total >= 10;

    $("#htMultInQuestion").text(htMultInReplace($("#htMultInQuestionTemplate").text(), {
        order: order,
        digit: digit,
        mult: mult
    }));

    // When a carry comes from the previous column, say it explicitly: it is
    // added at the end, the way it is done in the calculation.
    if (localMultIn.incoming > 0) {
        $("#htMultInIncomingNote").text(htMultInReplace($("#htMultInIncomingTemplate").text(), {
            carry: localMultIn.incoming,
            digit: digit,
            mult: mult
        })).removeClass("htAddHidden");
    } else {
        $("#htMultInIncomingNote").text("").addClass("htAddHidden");
    }

    // Clear the fields and controls for the new column.
    $("#htMultInDigitInput").val("").prop("disabled", false);
    $("#htMultInCarryInput").val("").prop("disabled", false);
    $("#htMultInFeedback").html("");
    $("#htMultInNextBtn").addClass("hidden");

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htMultInBuildBoard();
    htMultInDrawSquares(0);
}

// Checks the fields as they are typed, so the button that verified the column is
// not needed. A wrong digit or carry colours the squares; the right values solve
// the column at once. The carry field is only present when the column reaches
// ten, so when there is no carry the digit alone solves it.
function htMultInEvaluate() {
    if (localMultIn.answered) {
        return;
    }

    var digit = localMultIn.digit;
    var mult = localMultIn.multiplier;
    var product = digit * mult;
    var total = product + localMultIn.incoming;
    var correctDigit = total % 10;
    var correctCarry = Math.floor(total / 10);
    var order = htMultInOrderName(localMultIn.column);
    var digitRaw = $("#htMultInDigitInput").val();
    var carryRaw = $("#htMultInCarryInput").val();

    var digitOk = digitRaw !== "" && parseInt(digitRaw, 10) === correctDigit;
    var carryOk = !localMultIn.carryNeeded || (carryRaw !== "" && parseInt(carryRaw, 10) === correctCarry);

    // Colour the squares according to the number written, before deciding
    // whether it is right or wrong.
    htMultInDrawSquares(digitRaw === "" ? 0 : parseInt(digitRaw, 10));

    if (digitRaw !== "" && !digitOk) {
        // The tip depends on whether the column carries, and mentions the
        // carry coming from the previous order only when there is one.
        var wrongTemplate;
        if (localMultIn.carryNeeded) {
            wrongTemplate = localMultIn.incoming > 0 ? $("#htMultInWrongAboveInTemplate").html() : $("#htMultInWrongAboveTemplate").html();
        } else {
            wrongTemplate = localMultIn.incoming > 0 ? $("#htMultInWrongBelowInTemplate").html() : $("#htMultInWrongBelowTemplate").html();
        }
        $("#htMultInFeedback").html(htMultInReplace(wrongTemplate, {
            order: order,
            digit: digit,
            mult: mult,
            product: product,
            carry: localMultIn.incoming,
            total: total
        }));
        return;
    }

    if (localMultIn.carryNeeded && carryRaw !== "" && !carryOk) {
        $("#htMultInFeedback").html(htMultInReplace($("#htMultInWrongCarryTemplate").html(), {
            order: order,
            digit: digit,
            mult: mult,
            product: product,
            carry: localMultIn.incoming,
            total: total
        }));
        return;
    }

    if (digitOk && carryOk) {
        htMultInResolve();
    } else {
        $("#htMultInFeedback").html("");
    }
}

// Records the result digit of the column and the carry it sends, if any. When
// the values are right the squares are filled and a congratulation is shown,
// together with the button that moves to the next column (or to a new problem).
function htMultInResolve() {
    if (localMultIn.answered) {
        return;
    }
    localMultIn.answered = true;

    var column = localMultIn.column;
    var product = localMultIn.digit * localMultIn.multiplier;
    var total = product + localMultIn.incoming;
    var carryOut = Math.floor(total / 10);
    var order = htMultInOrderName(column);

    localMultIn.carries[column] = carryOut;
    localMultIn.results[column] = total % 10;
    localMultIn.lastCarry = carryOut;

    htMultInBuildBoard();
    // The typed values fill the squares: the product of the column turns
    // light yellow and the complete groups of ten show the carry.
    htMultInDrawSquares(0);

    // The carry from the previous order is only mentioned when there is one,
    // and the message differs depending on whether this column carries on.
    var template;
    if (localMultIn.incoming > 0) {
        template = carryOut > 0 ? $("#htMultInMsgCarryInTemplate").html() : $("#htMultInMsgNoCarryInTemplate").html();
    } else {
        template = carryOut > 0 ? $("#htMultInMsgCarryTemplate").html() : $("#htMultInMsgNoCarryTemplate").html();
    }
    var explanation = htMultInReplace(template, {
        digit: localMultIn.digit,
        mult: localMultIn.multiplier,
        product: product,
        carry: localMultIn.incoming,
        total: total,
        result: total % 10,
        out: carryOut,
        order: order
    });

    $("#htMultInDigitInput").prop("disabled", true);
    $("#htMultInCarryInput").prop("disabled", true);

    var congrats;
    var suffix = "";
    if (column >= localMultIn.digits - 1) {
        // The whole multiplication is done. A carry out of the last column
        // created a new order on the left, which holds only the carried
        // number.
        if (carryOut > 0) {
            localMultIn.results[column + 1] = carryOut;
            htMultInBuildBoard();
        }
        congrats = htMultInReplace($("#htMultInPerfectTemplate").html(), {
            multiplicand: localMultIn.multiplicand,
            multiplier: localMultIn.multiplier,
            product: localMultIn.multiplicand * localMultIn.multiplier
        });
        suffix = " <i class=\"fa-solid fa-medal\" style=\"font-size: 4em; color: gold;\"></i>";
        $("#htMultInNextBtn").text($("#htMultInNewProblemLabel").text()).removeClass("hidden");
    } else {
        congrats = $("#htMultInCongratsTemplate").html();
        $("#htMultInNextBtn").text($("#htMultInNextColumnLabel").text()).removeClass("hidden");
    }

    $("#htMultInFeedback").html(congrats + "<br />" + explanation + suffix);
}

// Moves to the next column of the same multiplication, bringing the carry
// along, or starts a new multiplication of the next level once the last
// column is done.
function htMultInNext() {
    if (!localMultIn.answered) {
        return;
    }

    if (localMultIn.column >= localMultIn.digits - 1) {
        htMultInNewProblem();
        return;
    }

    localMultIn.column += 1;
    localMultIn.incoming = localMultIn.lastCarry;
    htMultInSetupColumn();
}

function htMultInBuildOrders() {
    var $orders = $("#htMultInOrders");
    $orders.empty();
    for (var i = 0; i < localMultIn.digits; i++) {
        $("<span>")
            .addClass("htAddOrder")
            .attr("data-order", i)
            .text(htMultInOrderName(i))
            .appendTo($orders);
    }
    $("#htMultInLevel").text($("#htMultInLevel" + localMultIn.level).text());
}

function htMultInNewProblem() {
    // Levels advance one by one and cycle back to the first after the last.
    localMultIn.level = (localMultIn.level + 1) % (HT_MULTIN_MAX_LEVEL + 1);
    var range = HT_MULTIN_RANGES[localMultIn.level];
    localMultIn.multiplicand = htGetRandomArbitrary(range[0], range[1]);
    localMultIn.multiplier = htGetRandomArbitrary(0, 10);
    localMultIn.digits = localMultIn.level + 1;
    localMultIn.multiplicandDigits = htMultInDigits(localMultIn.multiplicand, localMultIn.digits);
    localMultIn.column = 0;
    localMultIn.incoming = 0;
    localMultIn.carries = {};
    localMultIn.results = {};

    htMultInBuildOrders();
    htMultInSetupColumn();
}

function htLoadContent() {
    htWriteNavigation();

    localMultIn = {
        level: -1,
        multiplicand: 0,
        multiplier: 0,
        multiplicandDigits: [],
        digits: 0,
        column: 0,
        incoming: 0,
        carries: {},
        results: {},
        digit: 0,
        carryNeeded: false,
        answered: false,
        lastCarry: 0
    };

    htMultInNewProblem();

    $("#htMultInNextBtn").off("click").on("click", function() {
        htMultInNext();
    });

    // The values are checked as they are typed, so there is no verify button.
    $("#htMultInDigitInput, #htMultInCarryInput").off("input").on("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "");
        htMultInEvaluate();
    });

    return false;
}
