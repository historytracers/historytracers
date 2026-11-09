// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing addition (negative numbers)" exercise (content
// d1d3730c-3d29-425b-b4bb-26697cc1fede).
// Two three-digit negative numbers are added. The board is the same one used by
// the "Practicing addition" game: the addition is laid out vertically, column
// by column, from the units upwards, and the light blue squares show the digit
// of the magnitude already in the column. The bottom digit of the second number
// is added square by square with the buttons. Because both numbers are negative,
// the magnitudes are added and the minus sign is kept in the result. When the
// count of a column reaches ten, those ten squares are grouped and become the 1
// carried to the next order. The localized texts live in the class JSON, so this
// file only wires the behavior and draws the board.

var localNeg = {};

var HT_NEG_DIGITS = 3;

/**
 * Returns the localized name of an order (units, tens, hundreds).
 * @param {number} order - The order index, starting at 0 for units.
 * @returns {string} The localized order name.
 */
function htNegOrderName(order) {
    return $("#htNegOrder" + order).text();
}

/**
 * Returns the digits of value from the units order upwards (index 0 = units).
 * @param {number} value - The value whose digits are extracted.
 * @param {number} length - The number of digits to return.
 * @returns {number[]} The digits, from units to the highest order.
 */
function htNegDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

/**
 * Replaces {placeholders} in a localized template with the given values.
 * @param {string} template - The localized template text.
 * @param {Object<string, string|number>} values - The values for each placeholder.
 * @returns {string} The template with all placeholders replaced.
 */
function htNegReplace(template, values) {
    for (var key in values) {
        template = template.replace(new RegExp("\\{" + key + "\\}", "g"), values[key]);
    }
    return template;
}

/**
 * Draws the vertical addition of the magnitudes. The minus sign of the two
 * operands and of the result sits in its own column on the left, where the ten
 * thousands place would be, so it never shares a column with a digit. That way
 * a carry out of the last order is written in the thousands column and does not
 * land on top of the minus signs. The carry row, the two operands with the +
 * sign, the result line and the result row keep the same layout as the
 * "Practicing addition" game. The column being solved is highlighted and a
 * column shows its result digit only once it has been solved.
 */
function htNegBuildBoard() {
    var d = HT_NEG_DIGITS;
    var current = localNeg.column;
    var fDigits = localNeg.firstDigits;
    var aDigits = localNeg.addendDigits;
    var total = localNeg.base + localNeg.added;

    /**
     * Builds a cell for the operator/sign column.
     * @param {string} content - The HTML content of the cell.
     * @returns {string} The cell markup.
     */
    function opCell(content) {
        return "<td class=\"htAddOp\">" + content + "</td>";
    }
    /**
     * Builds the sign cell where the minus sign is kept.
     * @param {string} content - The HTML content of the cell.
     * @returns {string} The cell markup.
     */
    function signCell(content) {
        return "<td class=\"htAddOp\">" + content + "</td>";
    }
    /**
     * Builds a digit cell, highlighting the column being solved.
     * @param {number} order - The order index of the cell.
     * @param {string} content - The HTML content of the cell.
     * @returns {string} The cell markup.
     */
    function cell(order, content) {
        var cls = "htAddCell" + (order === current ? " htAddCellActive" : "");
        return "<td class=\"" + cls + "\" data-order=\"" + order + "\">" + content + "</td>";
    }

    var rows = "";
    // The carry out of column c is written above column c + 1.
    rows += "<tr class=\"htAddCarryRow\">" + opCell("") + signCell("");
    for (var o = d; o >= 0; o--) {
        var carryVal = "";
        if (o >= 1) {
            if (o - 1 === current && !localNeg.answered && localNeg.started) {
                // Before the column is solved, preview the carry from the
                // squares added so far.
                carryVal = total >= 10 ? "1" : "";
            } else if (localNeg.carries[o - 1] !== undefined) {
                carryVal = localNeg.carries[o - 1] ? "1" : "";
            }
        }
        rows += cell(o, carryVal);
    }
    rows += "</tr>";
    // First operand: a negative number.
    rows += "<tr>" + opCell("") + signCell("&minus;");
    for (var o = d; o >= 0; o--) {
        rows += cell(o, o < d ? String(fDigits[o]) : "");
    }
    rows += "</tr>";
    // Added operand, with the + sign in its own narrow column.
    rows += "<tr>" + opCell("+") + signCell("&minus;");
    for (var o = d; o >= 0; o--) {
        rows += cell(o, o < d ? String(aDigits[o]) : "");
    }
    rows += "</tr>";
    // Line
    rows += "<tr class=\"htAddLine\"><td colspan=\"" + (d + 3) + "\"></td></tr>";
    // Result: the sum of two negative numbers is always negative. The sign
    // stays in the ten thousands column even when the last order carries and a
    // new digit appears in the thousands column.
    rows += "<tr class=\"htAddResultRow\">" + opCell("") + signCell("&minus;");
    for (var o = d; o >= 0; o--) {
        var res;
        if (o === current && !localNeg.answered && localNeg.started) {
            // Show the digit the column currently keeps as squares are added.
            res = String(total % 10);
        } else {
            res = (localNeg.results[o] !== undefined) ? String(localNeg.results[o]) : "";
        }
        rows += cell(o, res);
    }
    rows += "</tr>";

    $("#htNegTable").html(rows);
}

/**
 * Draws the squares of the column. The whole column is shown from the start:
 * the "base" light blue squares are the digit of the magnitude already in the
 * column and the remaining squares stand for the bottom digit to be added. Each
 * click turns one of those squares light yellow, and the ones not filled yet
 * stay neutral. Once the count reaches ten, those ten squares are grouped,
 * showing the 1 that goes to the next order, and the squares left outside the
 * group show the digit that stays in the column.
 * The squares sitting between the value already in the column and the ten are
 * its complement: they are the ones that close the group of ten. They are
 * marked so the learner can see the complement and how those squares were used
 * during the addition.
 */
function htNegDrawSquares() {
    var base = localNeg.base;
    var addend = localNeg.addendDigit;
    var added = localNeg.added;
    var total = base + addend;
    var complement = (base < 10) ? (10 - base) : 0;
    var html = "";
    var i;

    /**
     * Builds one square of the column, marking base, added and complement
     * squares.
     * @param {number} index - The position of the square in the column.
     * @returns {string} The square markup.
     */
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

    $("#htNegSquares").html(html);
    $("#htNegSquaresCaption").text(base + " + " + added + " = " + (base + added));
    htNegUpdateSquaresNote(added, complement);
}

/**
 * Spells out, for the column being solved, the complement and how the squares
 * were used: how many have been added, how many completed the ten and how many
 * stayed outside the group. It is refreshed on every click, so the highlight
 * follows the addition step by step.
 * @param {number} added - The number of squares added so far.
 * @param {number} complement - The number of squares needed to complete ten.
 */
function htNegUpdateSquaresNote(added, complement) {
    var note = htNegReplace($("#htNegSquaresUsedTemplate").text(), {
        used: added
    });

    if (complement > 0) {
        if (added < complement) {
            note += " " + htNegReplace($("#htNegComplementPendingTemplate").text(), {
                base: localNeg.base,
                comp: complement,
                missing: complement - added
            });
        } else {
            note += " " + htNegReplace($("#htNegComplementUsedTemplate").text(), {
                base: localNeg.base,
                comp: complement,
                outside: added - complement
            });
        }
    }

    $("#htNegSquaresNote").text(note);
}

/**
 * Prepares the column that must be solved next.
 */
function htNegSetupColumn() {
    var column = localNeg.column;
    var firstDigit = localNeg.firstDigits[column];
    var addendDigit = localNeg.addendDigits[column];
    var base = firstDigit + localNeg.incoming;
    var order = htNegOrderName(column);

    localNeg.answered = false;
    localNeg.firstDigit = firstDigit;
    localNeg.addendDigit = addendDigit;
    localNeg.base = base;
    localNeg.added = 0;
    localNeg.started = false;

    $("#htNegQuestion").text(htNegReplace($("#htNegQuestionTemplate").text(), {
        order: order,
        base: base
    }));

    // When a 1 comes from the previous column, say it explicitly: it is the
    // reason the value already in this column is not just the first digit.
    if (localNeg.incoming > 0) {
        $("#htNegIncomingNote").text(htNegReplace($("#htNegIncomingTemplate").text(), {
            first: firstDigit,
            base: base
        })).removeClass("htAddHidden");
    } else {
        $("#htNegIncomingNote").text("").addClass("htAddHidden");
    }

    $("#htNegFeedback").html("");
    $("#htNegNextBtn").addClass("hidden");
    $("#htNegUpBtn").prop("disabled", false);
    $("#htNegDownBtn").prop("disabled", false);

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htNegBuildBoard();
    htNegDrawSquares();
}

/**
 * The buttons add or remove one yellow square at a time. The column is solved
 * as soon as the squares added match the bottom digit of the second number.
 * @param {number} delta - 1 to add a square, -1 to remove one.
 */
function htNegChange(delta) {
    if (localNeg.answered) {
        return;
    }

    var next = localNeg.added + delta;
    if (next < 0) {
        next = 0;
    }
    if (next > localNeg.addendDigit) {
        next = localNeg.addendDigit;
    }
    localNeg.added = next;
    localNeg.started = true;
    htNegDrawSquares();
    htNegBuildBoard();

    if (localNeg.added === localNeg.addendDigit) {
        htNegResolve();
    }
}

/**
 * Records the result digit of the column and the 1 it carries, if any.
 */
function htNegResolve() {
    if (localNeg.answered) {
        return;
    }
    localNeg.answered = true;

    var column = localNeg.column;
    var sum = localNeg.base + localNeg.added;
    var carry = sum >= 10;
    var order = htNegOrderName(column);

    localNeg.carries[column] = carry ? 1 : 0;
    localNeg.results[column] = sum % 10;
    localNeg.lastCarry = carry ? 1 : 0;

    htNegBuildBoard();

    var template = carry ? $("#htNegMsgCarryTemplate").html() : $("#htNegMsgNoCarryTemplate").html();
    $("#htNegFeedback").html(htNegReplace(template, {
        base: localNeg.base,
        added: localNeg.added,
        sum: sum,
        result: sum % 10,
        order: order
    }));

    $("#htNegUpBtn").prop("disabled", true);
    $("#htNegDownBtn").prop("disabled", true);

    if (column >= HT_NEG_DIGITS - 1) {
        // The whole addition is done. A carry out of the last column created a
        // new order on the left, which holds only the carried 1.
        if (carry) {
            localNeg.results[HT_NEG_DIGITS] = 1;
            htNegBuildBoard();
        }
        $("#htNegFeedback").append("<br /><i class=\"fa-solid fa-medal\" style=\"font-size: 4em; color: gold;\"></i>");
        $("#htNegNextBtn").text($("#htNegPlayAgainLabel").text()).removeClass("hidden");
    } else {
        $("#htNegNextBtn").text($("#htNegNextColumnLabel").text()).removeClass("hidden");
    }
}

/**
 * Moves to the next column of the same addition, bringing the carry along, or
 * starts a new addition once the last column is done.
 */
function htNegNext() {
    if (!localNeg.answered) {
        return;
    }

    if (localNeg.column >= HT_NEG_DIGITS - 1) {
        htNegNewProblem();
        return;
    }

    localNeg.column += 1;
    localNeg.incoming = localNeg.lastCarry;
    htNegSetupColumn();
}

/**
 * Builds the order tabs (units, tens, hundreds) shown above the board.
 */
function htNegBuildOrders() {
    var $orders = $("#htNegOrders");
    $orders.empty();
    for (var i = 0; i < HT_NEG_DIGITS; i++) {
        $("<span>")
            .addClass("htAddOrder")
            .attr("data-order", i)
            .text(htNegOrderName(i))
            .appendTo($orders);
    }
}

/**
 * Draws a new addition problem with two random three-digit magnitudes.
 */
function htNegNewProblem() {
    localNeg.first = htGetRandomArbitrary(100, 1000);
    localNeg.addend = htGetRandomArbitrary(100, 1000);
    localNeg.firstDigits = htNegDigits(localNeg.first, HT_NEG_DIGITS);
    localNeg.addendDigits = htNegDigits(localNeg.addend, HT_NEG_DIGITS);
    localNeg.column = 0;
    localNeg.incoming = 0;
    localNeg.carries = {};
    localNeg.results = {};

    htNegSetupColumn();
}

/**
 * Initializes the exercise when the page content is loaded.
 * @returns {boolean} Always false to stop the default content handler.
 */
function htLoadContent() {
    htWriteNavigation();

    localNeg = {
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

    htNegBuildOrders();

    $("#htNegUpBtn").off("click").on("click", function() {
        htNegChange(1);
    });

    $("#htNegDownBtn").off("click").on("click", function() {
        htNegChange(-1);
    });

    $("#htNegNextBtn").off("click").on("click", function() {
        htNegNext();
    });

    htNegNewProblem();

    return false;
}
