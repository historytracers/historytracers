// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing multiplication by one-digit numbers" exercise (content
// b9e71da5-355b-4c0c-8d24-a746a27fcc3e). A number of one, two or three digits
// (in successive levels) is multiplied by a one-digit number, column by
// column, from the units upwards. The multiplication is laid out vertically,
// the way it is normally written. Below the board, every square of the column
// is shown from the start: the squares carried from the previous order are
// light blue and the repeated groups of the top digit are made of neutral
// squares that turn light yellow as the player clicks the buttons. Each click
// repeats the group once, the way multiplication is the repetition of a sum.
// When every group has been repeated, the complete groups of ten squares
// become the carry to the next order and the squares left outside the last
// group of ten are the digit that stays in the column. The localized texts
// live in the class JSON, so this file only wires the behavior and draws the
// board.

var localMult = {};

// Highest level of the game: 0 = units, 1 = tens, 2 = hundreds.
var HT_MULT_MAX_LEVEL = 2;

// Range of random values of the number being multiplied, per level.
var HT_MULT_RANGES = [[0, 10], [10, 100], [100, 1000]];

function htMultOrderName(order) {
    return $("#htMultOrder" + order).text();
}

// Returns the digits of value from the units order upwards (index 0 = units).
function htMultDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

function htMultReplace(template, values) {
    for (var key in values) {
        template = template.replace(new RegExp("\\{" + key + "\\}", "g"), values[key]);
    }
    return template;
}

// Draws the vertical multiplication: the carry row, the number being
// multiplied, the one-digit multiplier below the multiplication sign, the
// result line and the result row. The column being solved is highlighted and a
// column shows its result digit only once it has been solved.
function htMultBuildBoard() {
    var d = localMult.digits;
    var current = localMult.column;
    var mDigits = localMult.multiplicandDigits;
    var mult = localMult.multiplier;
    var total = mDigits[current] * mult + localMult.incoming;

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
        if (o >= 1) {
            if (o - 1 === current && !localMult.answered && localMult.started) {
                // Before the column is solved, preview the carry the groups
                // of ten will leave when the column is complete.
                carryVal = total >= 10 ? String(Math.floor(total / 10)) : "";
            } else if (localMult.carries[o - 1] !== undefined) {
                carryVal = String(localMult.carries[o - 1]);
            }
        }
        rows += cell(o, carryVal);
    }
    rows += "</tr>";
    // Number being multiplied, one digit per order.
    rows += "<tr>" + opCell("");
    for (o = d; o >= 0; o--) {
        rows += cell(o, o < d ? String(mDigits[o]) : "");
    }
    rows += "</tr>";
    // One-digit multiplier, with the multiplication sign in its own column.
    rows += "<tr>" + opCell("×");
    for (o = d; o >= 0; o--) {
        rows += cell(o, o === 0 ? String(mult) : "");
    }
    rows += "</tr>";
    // Line
    rows += "<tr class=\"htAddLine\"><td colspan=\"" + (d + 2) + "\"></td></tr>";
    // Result
    rows += "<tr class=\"htAddResultRow\">" + opCell("");
    for (o = d; o >= 0; o--) {
        var res;
        if (o === current && !localMult.answered && localMult.started) {
            // Show the digit the column currently keeps as the groups are
            // repeated.
            res = String(total % 10);
        } else {
            res = (localMult.results[o] !== undefined) ? String(localMult.results[o]) : "";
        }
        rows += cell(o, res);
    }
    rows += "</tr>";

    $("#htMultTable").html(rows);
}

// Draws the squares of the column. The whole column is shown from the start:
// the light blue squares at the left are the carry coming from the previous
// order and the remaining squares stand for the repeated groups of the top
// digit, one dashed box per repetition. Each click turns one of those groups
// light yellow, and the groups not repeated yet stay neutral. Once every
// group has been repeated, the squares are regrouped in complete groups of
// ten (the carry to the next order) and the squares left outside the last
// group of ten show the digit that stays in the column.
function htMultDrawSquares() {
    var incoming = localMult.incoming;
    var digit = localMult.digit;
    var mult = localMult.multiplier;
    var groups = localMult.groups;
    var html = "";
    var i;

    function square(cls) {
        return "<span class=\"htAddSquare " + cls + "\"></span>";
    }

    if (localMult.answered) {
        var total = digit * mult + incoming;
        var tens = Math.floor(total / 10);
        var order = 0;
        for (var g = 0; g < tens; g++) {
            html += "<span class=\"htAddTenGroup\">";
            for (i = 0; i < 10; i++) {
                html += square(order < incoming ? "htAddSquareBase" : "htAddSquareAdded");
                order++;
            }
            html += "</span>";
        }
        for (i = order; i < total; i++) {
            html += square(i < incoming ? "htAddSquareBase" : "htAddSquareAdded");
        }
    } else {
        for (i = 0; i < incoming; i++) {
            html += square("htAddSquareBase");
        }
        for (g = 0; g < mult; g++) {
            html += "<span class=\"htMultGroup\">";
            for (i = 0; i < digit; i++) {
                html += square(g < groups ? "htAddSquareAdded" : "htAddSquarePending");
            }
            html += "</span>";
        }
    }

    $("#htMultSquares").html(html);

    var caption;
    if (localMult.answered) {
        // The product of the column, before the incoming carry joins it.
        caption = digit + " × " + mult + " = " + (digit * mult);
    } else {
        // The repeated sum built so far.
        caption = digit + " × " + groups + " = " + (digit * groups);
    }
    $("#htMultSquaresCaption").text(caption);
    htMultUpdateSquaresNote();
}

// Spells out, for the column being solved, how many groups have been repeated
// so far. Once the column is solved, it names the complete groups of ten (the
// carry to the next order) and the squares that stay in the column.
function htMultUpdateSquaresNote() {
    var note;
    if (localMult.answered) {
        var total = localMult.digit * localMult.multiplier + localMult.incoming;
        note = htMultReplace($("#htMultTenTemplate").text(), {
            tens: Math.floor(total / 10),
            outside: total % 10,
            order: htMultOrderName(localMult.column)
        });
    } else {
        note = htMultReplace($("#htMultGroupsTemplate").text(), {
            groups: localMult.groups,
            mult: localMult.multiplier
        });
    }
    $("#htMultSquaresNote").text(note);
}

// Prepares the column that must be solved next.
function htMultSetupColumn() {
    var column = localMult.column;
    var digit = localMult.multiplicandDigits[column];
    var mult = localMult.multiplier;
    var order = htMultOrderName(column);

    localMult.answered = false;
    localMult.digit = digit;
    localMult.groups = 0;
    localMult.started = false;

    $("#htMultQuestion").text(htMultReplace($("#htMultQuestionTemplate").text(), {
        order: order,
        digit: digit,
        mult: mult
    }));

    // When a carry comes from the previous column, say it explicitly: it is
    // added after the multiplication, the way it is done in the calculation.
    if (localMult.incoming > 0) {
        $("#htMultIncomingNote").text(htMultReplace($("#htMultIncomingTemplate").text(), {
            carry: localMult.incoming,
            order: order
        })).removeClass("htAddHidden");
    } else {
        $("#htMultIncomingNote").text("").addClass("htAddHidden");
    }

    $("#htMultFeedback").html("");
    $("#htMultNextBtn").addClass("hidden");
    $("#htMultUpBtn").prop("disabled", false);
    $("#htMultDownBtn").prop("disabled", false);

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htMultBuildBoard();
    htMultDrawSquares();
}

// The buttons repeat or undo one group of squares at a time. The column is
// solved as soon as every group has been repeated.
function htMultChange(delta) {
    if (localMult.answered) {
        return;
    }

    // The first click only reveals the column being multiplied. The following
    // clicks add or remove groups.
    if (!localMult.started) {
        localMult.started = true;
        htMultDrawSquares();
        htMultBuildBoard();
        if (localMult.groups === localMult.multiplier) {
            htMultResolve();
        }
        return;
    }

    var next = localMult.groups + delta;
    if (next < 0) {
        next = 0;
    }
    if (next > localMult.multiplier) {
        next = localMult.multiplier;
    }
    localMult.groups = next;
    htMultDrawSquares();
    htMultBuildBoard();

    if (localMult.groups === localMult.multiplier) {
        htMultResolve();
    }
}

// Records the result digit of the column and the carry it sends, if any.
function htMultResolve() {
    if (localMult.answered) {
        return;
    }
    localMult.answered = true;

    var column = localMult.column;
    var product = localMult.digit * localMult.multiplier;
    var total = product + localMult.incoming;
    var carryOut = Math.floor(total / 10);
    var order = htMultOrderName(column);

    localMult.carries[column] = carryOut;
    localMult.results[column] = total % 10;
    localMult.lastCarry = carryOut;

    htMultBuildBoard();
    htMultDrawSquares();

    // The carry from the previous order is only mentioned when there is one,
    // and the message differs depending on whether this column carries on.
    var template;
    if (localMult.incoming > 0) {
        template = carryOut > 0 ? $("#htMultMsgCarryInTemplate").html() : $("#htMultMsgNoCarryInTemplate").html();
    } else {
        template = carryOut > 0 ? $("#htMultMsgCarryTemplate").html() : $("#htMultMsgNoCarryTemplate").html();
    }
    $("#htMultFeedback").html(htMultReplace(template, {
        digit: localMult.digit,
        mult: localMult.multiplier,
        product: product,
        carry: localMult.incoming,
        total: total,
        result: total % 10,
        out: carryOut,
        order: order
    }));

    $("#htMultUpBtn").prop("disabled", true);
    $("#htMultDownBtn").prop("disabled", true);

    if (column >= localMult.digits - 1) {
        // The whole multiplication is done. A carry out of the last column
        // created a new order on the left, which holds only the carried
        // digit.
        if (carryOut) {
            localMult.results[column + 1] = carryOut;
            htMultBuildBoard();
        }
        $("#htMultFeedback").append("<br /><i class=\"fa-solid fa-medal\" style=\"font-size: 4em; color: gold;\"></i>");
        $("#htMultNextBtn").text($("#htMultNextLevelLabel").text()).removeClass("hidden");
    } else {
        $("#htMultNextBtn").text($("#htMultNextColumnLabel").text()).removeClass("hidden");
    }
}

// Moves to the next column of the same multiplication, bringing the carry
// along, or starts a new multiplication of the next level once the last
// column is done.
function htMultNext() {
    if (!localMult.answered) {
        return;
    }

    if (localMult.column >= localMult.digits - 1) {
        htMultNewProblem();
        return;
    }

    localMult.column += 1;
    localMult.incoming = localMult.lastCarry;
    htMultSetupColumn();
}

function htMultBuildOrders() {
    var $orders = $("#htMultOrders");
    $orders.empty();
    for (var i = 0; i < localMult.digits; i++) {
        $("<span>")
            .addClass("htAddOrder")
            .attr("data-order", i)
            .text(htMultOrderName(i))
            .appendTo($orders);
    }
    $("#htMultLevel").text($("#htMultLevel" + localMult.level).text());
}

function htMultNewProblem() {
    // Levels advance one by one and cycle back to the first after the last.
    localMult.level = (localMult.level + 1) % (HT_MULT_MAX_LEVEL + 1);
    var range = HT_MULT_RANGES[localMult.level];
    localMult.multiplicand = htGetRandomArbitrary(range[0], range[1]);
    localMult.multiplier = htGetRandomArbitrary(0, 10);
    localMult.digits = localMult.level + 1;
    localMult.multiplicandDigits = htMultDigits(localMult.multiplicand, localMult.digits);
    localMult.column = 0;
    localMult.incoming = 0;
    localMult.carries = {};
    localMult.results = {};

    htMultBuildOrders();
    htMultSetupColumn();
}

function htLoadContent() {
    htWriteNavigation();

    localMult = {
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
        groups: 0,
        answered: false,
        started: false,
        lastCarry: 0
    };

    htMultNewProblem();

    $("#htMultUpBtn").off("click").on("click", function() {
        htMultChange(1);
    });

    $("#htMultDownBtn").off("click").on("click", function() {
        htMultChange(-1);
    });

    $("#htMultNextBtn").off("click").on("click", function() {
        htMultNext();
    });

    return false;
}
