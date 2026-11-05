// SPDX-License-Identifier: GPL-3.0-or-later

// "Practicing multiplication with chosen numbers" (content
// a4124f1d-95f7-44cb-af82-da4ab9c9ff28). Same vertical multiplication as the
// "Practicing multiplication with typed values" game: a number is multiplied
// by a one-digit number, column by column, from the units upwards. The player
// types the digit that the column keeps and, when the column reaches ten or
// more, the number of complete groups of ten carried to the box above the
// next order. The values are checked as they are typed: a wrong value colours
// as many squares as the number written, the right values fill them and are
// congratulated, and the button that moves to the next column appears.
//
// The difference with that game is that the numbers are not suggested at
// random: the reader types a number between 0 and 99999 in a text field and
// selects a one-digit multiplier between 0 and 9. The multiplication uses
// exactly the numbers chosen and shows as many columns as the number needs.
// The localized texts live in the class JSON, so this file only wires the
// behavior and draws the board.

var localMultChosen = {};

var HT_MULTCHOSEN_MIN = 0;
var HT_MULTCHOSEN_MAX = 99999;

function htMultChosenOrderName(order) {
    return $("#htMultChosenOrder" + order).text();
}

// Returns the digits of value from the units order upwards (index 0 = units).
function htMultChosenDigits(value, length) {
    var digits = [];
    var v = value;
    for (var i = 0; i < length; i++) {
        digits.push(v % 10);
        v = Math.floor(v / 10);
    }
    return digits;
}

// Replaces every {key} placeholder in a localized template.
function htMultChosenReplace(template, values) {
    for (var key in values) {
        template = template.replace(new RegExp("\\{" + key + "\\}", "g"), values[key]);
    }
    return template;
}

var HT_MULTCHOSEN_INPUTS = "#htMultChosenDigitInput, #htMultChosenCarryInput";

// The value fields are moved in and out of the board every time it is rebuilt, and
// moving the field that has the focus blurs it. The field being used is remembered
// before the rebuild and focused again afterwards, so a wrong value can be deleted
// and typed again without losing the caret. The focus only moves when the player
// clicks another box or button.
function htMultChosenRememberFocus() {
    var active = document.activeElement;
    if (!active || !active.id || !$(active).is(HT_MULTCHOSEN_INPUTS)) {
        return null;
    }
    return {
        id: active.id,
        start: active.selectionStart,
        end: active.selectionEnd
    };
}

function htMultChosenRestoreFocus(state) {
    var field;
    if (!state) {
        return;
    }
    field = document.getElementById(state.id);
    // When the field of the column that was just solved is no longer on the
    // board, continue in the first field that still waits for a value.
    if (!field || field.disabled || !$(field).is(":visible")) {
        field = null;
        $(HT_MULTCHOSEN_INPUTS).each(function() {
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

// Draws the vertical multiplication: the carry row, the number being
// multiplied, the one-digit multiplier below the multiplication sign, the
// result line and the result row. The column being solved is highlighted and
// a column shows its result digit only once it has been solved. The two value
// fields live inside the board: the digit is typed in the result row of the
// column being solved and the carry is typed in the carry row, above the next
// order, exactly where it is written by hand. In multiplication the carry can
// be more than 1, so the carry row shows the number of complete groups of ten.
function htMultChosenBuildBoard() {
    var digits = localMultChosen.digits;
    var current = localMultChosen.column;
    var mDigits = localMultChosen.multiplicandDigits;
    var mult = localMultChosen.multiplier;
    var pending = !localMultChosen.answered;

    // Highest order shown on the board. The extra order on the left only
    // appears when the column being solved needs a carry box above it or when
    // the last column really carried out, so a result that fits in the
    // current orders does not show an empty leading column.
    var d = digits - 1;
    var top = d;
    if (current === d && ((pending && localMultChosen.carryNeeded) || (!pending && (localMultChosen.carries[d] || 0) > 0))) {
        top = d + 1;
    }

    // Builds an operator column cell.
    function opCell(content) {
        return "<td class=\"htAddOp\">" + content + "</td>";
    }
    // Builds a value cell for the given order.
    function cell(order, content) {
        var cls = "htAddCell" + (order === current ? " htAddCellActive" : "");
        return "<td class=\"" + cls + "\" data-order=\"" + order + "\">" + content + "</td>";
    }

    // The value fields are part of the board, so take them out before the table
    // is rebuilt, otherwise the rebuild would destroy them.
    var focus = htMultChosenRememberFocus();
    $("#htMultChosenDigitInput, #htMultChosenCarryInput").appendTo("#htMultChosenInputHome");

    var rows = "";
    // The carry out of column c is written above column c + 1.
    rows += "<tr class=\"htAddCarryRow\">" + opCell("");
    for (var o = top; o >= 0; o--) {
        var carryVal = "";
        if (o >= 1 && localMultChosen.carries[o - 1] !== undefined && localMultChosen.carries[o - 1] > 0) {
            carryVal = String(localMultChosen.carries[o - 1]);
        }
        // The carry of the column being solved is typed above the next order,
        // but only when the column reaches ten or more.
        if (pending && localMultChosen.carryNeeded && o === current + 1) {
            carryVal = "<span id=\"htMultChosenCarrySlot\"></span>";
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
        var res = (localMultChosen.results[o] !== undefined) ? String(localMultChosen.results[o]) : "";
        // The digit kept by the column being solved is typed here.
        if (pending && o === current) {
            res = "<span id=\"htMultChosenDigitSlot\"></span>";
        }
        rows += cell(o, res);
    }
    rows += "</tr>";

    $("#htMultChosenTable").html(rows);

    // Put the value fields in the position of the product.
    if (pending) {
        $("#htMultChosenDigitSlot").append($("#htMultChosenDigitInput"));
        if (localMultChosen.carryNeeded) {
            $("#htMultChosenCarrySlot").append($("#htMultChosenCarryInput"));
        }
    }

    htMultChosenRestoreFocus(focus);
}

// Draws the squares of the column. The whole column is shown from the start:
// the product of the column stays neutral until the column is solved, when it
// turns light yellow, and the light blue squares at the end of the column are
// the squares carried from the previous order: the carry is added to the
// result of the multiplication, so its squares are the last ones of the
// column, not the first ones. The squares are drawn flat, in the order they
// are counted: they are laid out inside complete groups of ten first, and the
// squares outside the last group of ten are the digit that stays in the
// column. When the player types a value, that many squares are marked: the
// first ones of the column when it stays below ten, or the ones outside the
// complete groups of ten when it carries.
function htMultChosenDrawSquares(written) {
    var incoming = localMultChosen.incoming;
    var digit = localMultChosen.digit;
    var mult = localMultChosen.multiplier;
    var product = digit * mult;
    var total = product + incoming;
    var html = "";
    var i;

    // Builds one square of the column, with its current state classes.
    function square(index) {
        var cls = "htAddSquare";
        // The squares carried from the previous order are the last ones of
        // the column, since the incoming carry is added at the end, after
        // the product.
        if (index >= product) {
            cls += " htAddSquareBase";
        } else if (localMultChosen.answered) {
            cls += " htAddSquareAdded";
        } else {
            cls += " htAddSquarePending";
        }
        // Squares marked with the number written by the player, before the
        // column is solved.
        if (!localMultChosen.answered && written > 0) {
            var start = localMultChosen.carryNeeded ? Math.floor(total / 10) * 10 : 0;
            if (index >= start && index < start + written) {
                if (index >= product) {
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

    $("#htMultChosenSquares").html(html);

    var caption;
    if (localMultChosen.answered) {
        caption = digit + " × " + mult + " = " + product;
    } else {
        caption = digit + " × " + mult + " = ?";
    }
    $("#htMultChosenSquaresCaption").text(caption);

    var note;
    if (localMultChosen.answered) {
        note = htMultChosenReplace($("#htMultChosenTenNoteTemplate").text(), {
            tens: Math.floor(total / 10),
            outside: total % 10,
            order: htMultChosenOrderName(localMultChosen.column)
        });
    } else if (incoming > 0) {
        note = htMultChosenReplace($("#htMultChosenNoteIncomingTemplate").text(), {
            digit: digit,
            mult: mult,
            product: product,
            incoming: incoming
        });
    } else {
        note = htMultChosenReplace($("#htMultChosenNoteTemplate").text(), {
            digit: digit,
            mult: mult,
            product: product
        });
    }
    $("#htMultChosenSquaresNote").text(note);
}

// Prepares the column that must be solved next.
function htMultChosenSetupColumn() {
    var column = localMultChosen.column;
    var digit = localMultChosen.multiplicandDigits[column];
    var mult = localMultChosen.multiplier;
    var product = digit * mult;
    var total = product + localMultChosen.incoming;
    var order = htMultChosenOrderName(column);

    localMultChosen.answered = false;
    localMultChosen.digit = digit;
    // The carry field is only added to the board when the column reaches ten.
    localMultChosen.carryNeeded = total >= 10;

    $("#htMultChosenQuestion").text(htMultChosenReplace($("#htMultChosenQuestionTemplate").text(), {
        order: order,
        digit: digit,
        mult: mult
    }));

    // When a carry comes from the previous column, say it explicitly: it is
    // added at the end, the way it is done in the calculation.
    if (localMultChosen.incoming > 0) {
        $("#htMultChosenIncomingNote").text(htMultChosenReplace($("#htMultChosenIncomingTemplate").text(), {
            carry: localMultChosen.incoming,
            digit: digit,
            mult: mult
        })).removeClass("htAddHidden");
    } else {
        $("#htMultChosenIncomingNote").text("").addClass("htAddHidden");
    }

    // Clear the fields and controls for the new column.
    $("#htMultChosenDigitInput").val("").prop("disabled", false);
    $("#htMultChosenCarryInput").val("").prop("disabled", false);
    $("#htMultChosenFeedback").html("");
    $("#htMultChosenNextBtn").addClass("hidden");

    $(".htAddOrder").removeClass("htAddOrderActive");
    $(".htAddOrder[data-order='" + column + "']").addClass("htAddOrderActive");

    htMultChosenBuildBoard();
    htMultChosenDrawSquares(0);
}

// Checks the fields as they are typed, so the button that verified the column is
// not needed. A wrong digit or carry colours the squares; the right values solve
// the column at once. The carry field is only present when the column reaches
// ten, so when there is no carry the digit alone solves it.
function htMultChosenEvaluate() {
    if (localMultChosen.answered) {
        return;
    }

    var digit = localMultChosen.digit;
    var mult = localMultChosen.multiplier;
    var product = digit * mult;
    var total = product + localMultChosen.incoming;
    var correctDigit = total % 10;
    var correctCarry = Math.floor(total / 10);
    var order = htMultChosenOrderName(localMultChosen.column);
    var digitRaw = $("#htMultChosenDigitInput").val();
    var carryRaw = $("#htMultChosenCarryInput").val();

    var digitOk = digitRaw !== "" && parseInt(digitRaw, 10) === correctDigit;
    var carryOk = !localMultChosen.carryNeeded || (carryRaw !== "" && parseInt(carryRaw, 10) === correctCarry);

    // Colour the squares according to the number written, before deciding
    // whether it is right or wrong.
    htMultChosenDrawSquares(digitRaw === "" ? 0 : parseInt(digitRaw, 10));

    if (digitRaw !== "" && !digitOk) {
        // The tip depends on whether the column carries, and mentions the
        // carry coming from the previous order only when there is one.
        var wrongTemplate;
        if (localMultChosen.carryNeeded) {
            wrongTemplate = localMultChosen.incoming > 0 ? $("#htMultChosenWrongAboveInTemplate").html() : $("#htMultChosenWrongAboveTemplate").html();
        } else {
            wrongTemplate = localMultChosen.incoming > 0 ? $("#htMultChosenWrongBelowInTemplate").html() : $("#htMultChosenWrongBelowTemplate").html();
        }
        $("#htMultChosenFeedback").html(htMultChosenReplace(wrongTemplate, {
            order: order,
            digit: digit,
            mult: mult,
            product: product,
            carry: localMultChosen.incoming,
            total: total
        }));
        return;
    }

    if (localMultChosen.carryNeeded && carryRaw !== "" && !carryOk) {
        $("#htMultChosenFeedback").html(htMultChosenReplace($("#htMultChosenWrongCarryTemplate").html(), {
            order: order,
            digit: digit,
            mult: mult,
            product: product,
            carry: localMultChosen.incoming,
            total: total
        }));
        return;
    }

    if (digitOk && carryOk) {
        htMultChosenResolve();
    } else {
        $("#htMultChosenFeedback").html("");
    }
}

// Records the result digit of the column and the carry it sends, if any. When
// the values are right the squares are filled and a congratulation is shown,
// together with the button that moves to the next column (or back to the
// number fields).
function htMultChosenResolve() {
    if (localMultChosen.answered) {
        return;
    }
    localMultChosen.answered = true;

    var column = localMultChosen.column;
    var product = localMultChosen.digit * localMultChosen.multiplier;
    var total = product + localMultChosen.incoming;
    var carryOut = Math.floor(total / 10);
    var order = htMultChosenOrderName(column);

    localMultChosen.carries[column] = carryOut;
    localMultChosen.results[column] = total % 10;
    localMultChosen.lastCarry = carryOut;

    htMultChosenBuildBoard();
    // The typed values fill the squares: the product of the column turns
    // light yellow and the complete groups of ten show the carry.
    htMultChosenDrawSquares(0);

    // The carry from the previous order is only mentioned when there is one,
    // and the message differs depending on whether this column carries on.
    var template;
    if (localMultChosen.incoming > 0) {
        template = carryOut > 0 ? $("#htMultChosenMsgCarryInTemplate").html() : $("#htMultChosenMsgNoCarryInTemplate").html();
    } else {
        template = carryOut > 0 ? $("#htMultChosenMsgCarryTemplate").html() : $("#htMultChosenMsgNoCarryTemplate").html();
    }
    var explanation = htMultChosenReplace(template, {
        digit: localMultChosen.digit,
        mult: localMultChosen.multiplier,
        product: product,
        carry: localMultChosen.incoming,
        total: total,
        result: total % 10,
        out: carryOut,
        order: order
    });

    $("#htMultChosenDigitInput").prop("disabled", true);
    $("#htMultChosenCarryInput").prop("disabled", true);

    var congrats;
    var suffix = "";
    if (column >= localMultChosen.digits - 1) {
        // The whole multiplication is done. A carry out of the last column
        // created a new order on the left, which holds only the carried
        // number.
        if (carryOut > 0) {
            localMultChosen.results[column + 1] = carryOut;
            htMultChosenBuildBoard();
        }
        congrats = htMultChosenReplace($("#htMultChosenPerfectTemplate").html(), {
            multiplicand: localMultChosen.multiplicand,
            multiplier: localMultChosen.multiplier,
            product: localMultChosen.multiplicand * localMultChosen.multiplier
        });
        suffix = " <i class=\"fa-solid fa-medal\" style=\"font-size: 4em; color: gold;\"></i>";
        $("#htMultChosenNextBtn").text($("#htMultChosenNewNumbersLabel").text()).removeClass("hidden");
    } else {
        congrats = $("#htMultChosenCongratsTemplate").html();
        $("#htMultChosenNextBtn").text($("#htMultChosenNextColumnLabel").text()).removeClass("hidden");
    }

    $("#htMultChosenFeedback").html(congrats + "<br />" + explanation + suffix);
}

// Moves to the next column of the same multiplication, bringing the carry
// along, or goes back to the number fields once the last column is done so
// the player can choose other numbers.
function htMultChosenNext() {
    if (!localMultChosen.answered) {
        return;
    }

    if (localMultChosen.column >= localMultChosen.digits - 1) {
        htMultChosenNewNumbers();
        return;
    }

    localMultChosen.column += 1;
    localMultChosen.incoming = localMultChosen.lastCarry;
    htMultChosenSetupColumn();
}

// Fill the order labels (units, tens, hundreds, thousands, ten thousands)
// shown above the board, one for every order of the chosen number.
function htMultChosenBuildOrders() {
    var $orders = $("#htMultChosenOrders");
    $orders.empty();
    for (var i = 0; i < localMultChosen.digits; i++) {
        $("<span>")
            .addClass("htAddOrder")
            .attr("data-order", i)
            .text(htMultChosenOrderName(i))
            .appendTo($orders);
    }
}

// Reads a field and returns the number written in it, or null when the field
// is empty or the number is outside the allowed range.
function htMultChosenReadNumber(selector) {
    var raw = String($(selector).val()).replace(/[^0-9]/g, "");
    if (raw === "") {
        return null;
    }
    var value = parseInt(raw, 10);
    if (isNaN(value) || value < HT_MULTCHOSEN_MIN || value > HT_MULTCHOSEN_MAX) {
        return null;
    }
    return value;
}

// Starts the multiplication with the number written in the field and the
// one-digit multiplier chosen in the select. The board shows as many columns
// as the number needs, from the units upwards.
function htMultChosenStart() {
    var number = htMultChosenReadNumber("#htMultChosenNumber");
    var multRaw = String($("#htMultChosenMultiplier").val()).replace(/[^0-9]/g, "");
    var multiplier = (multRaw === "") ? null : parseInt(multRaw, 10);

    if (number === null) {
        $("#htMultChosenError").text(htMultChosenReplace($("#htMultChosenErrorTemplate").text(), {
            min: HT_MULTCHOSEN_MIN,
            max: HT_MULTCHOSEN_MAX
        }));
        return;
    }

    if (multiplier === null || isNaN(multiplier) || multiplier < 0 || multiplier > 9) {
        $("#htMultChosenError").text(htMultChosenReplace($("#htMultChosenErrorTemplate").text(), {
            min: HT_MULTCHOSEN_MIN,
            max: HT_MULTCHOSEN_MAX
        }));
        return;
    }

    $("#htMultChosenError").text("");
    localMultChosen.multiplicand = number;
    localMultChosen.multiplier = multiplier;
    localMultChosen.digits = Math.max(1, String(number).length);
    localMultChosen.multiplicandDigits = htMultChosenDigits(number, localMultChosen.digits);
    localMultChosen.column = 0;
    localMultChosen.incoming = 0;
    localMultChosen.carries = {};
    localMultChosen.results = {};
    localMultChosen.digit = 0;
    localMultChosen.carryNeeded = false;
    localMultChosen.answered = false;
    localMultChosen.lastCarry = 0;

    $("#htMultChosenSetup").addClass("htAddHidden");
    $("#htMultChosenGame").removeClass("htAddHidden");
    htMultChosenBuildOrders();
    htMultChosenSetupColumn();
}

// Goes back to the number fields, keeping the previous values so they can be
// changed, once the multiplication is finished.
function htMultChosenNewNumbers() {
    $("#htMultChosenGame").addClass("htAddHidden");
    $("#htMultChosenSetup").removeClass("htAddHidden");
    $("#htMultChosenError").text("");
    $("#htMultChosenNumber").focus();
}

// Initializes the game when the class page loads.
function htLoadContent() {
    htWriteNavigation();

    localMultChosen = {
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

    // The setup panel is shown first and the board stays hidden until the
    // numbers are chosen.
    $("#htMultChosenGame").addClass("htAddHidden");
    $("#htMultChosenSetup").removeClass("htAddHidden");

    // The select offers the ten one-digit multipliers, from 0 to 9.
    var $multiplier = $("#htMultChosenMultiplier");
    $multiplier.empty();
    for (var i = 0; i <= 9; i++) {
        $("<option>")
            .attr("value", String(i))
            .text(String(i))
            .appendTo($multiplier);
    }
    $multiplier.val("2");

    $("#htMultChosenStartBtn").off("click").on("click", function() {
        htMultChosenStart();
    });

    // The fields accept only digits, up to five of them (99999), and any
    // change clears the error message.
    $("#htMultChosenNumber").off("input").on("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "").slice(0, 5);
        $("#htMultChosenError").text("");
    });

    $("#htMultChosenMultiplier").off("change").on("change", function() {
        $("#htMultChosenError").text("");
    });

    $("#htMultChosenNumber").off("keydown").on("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            htMultChosenStart();
        }
    });

    $("#htMultChosenNextBtn").off("click").on("click", function() {
        htMultChosenNext();
    });

    // The values are checked as they are typed, so there is no verify button.
    $("#htMultChosenDigitInput, #htMultChosenCarryInput").off("input").on("input", function() {
        this.value = this.value.replace(/[^0-9]/g, "");
        htMultChosenEvaluate();
    });

    return false;
}
