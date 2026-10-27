// SPDX-License-Identifier: GPL-3.0-or-later

var localTypedUser = {};
var htDivisionTypedUserVisualization = "below";

function htDivisionTypedUserKeyword(index, fallback) {
    return (typeof mathKeywords !== "undefined" && mathKeywords.length > index) ? mathKeywords[index] : fallback;
}

function htDivisionTypedUserAlign(val) {
    var space = "&nbsp;";
    var loopEnd = localTypedUser.dividend.toString().length - val.toString().length;
    for (let i = 0; i < loopEnd; i++) {
        space += "&nbsp;&nbsp;";
    }

    return space;
}

function htLongDivisionTypedUser(dividend, divisor) {
    if (divisor === 0) {
        throw new Error("Division by zero");
    }

    const dividendStr = dividend.toString();
    let currentValue = 0;

    const steps = [];
    const quotient = [];

    for (let i = 0; i < dividendStr.length; i++) {
        currentValue = currentValue * 10 + Number(dividendStr[i]);

        const quotientDigit = Math.floor(currentValue / divisor);
        const remainder = currentValue % divisor;

        quotient.push(quotientDigit);

        steps.push({
            value: currentValue,
            quotient: quotientDigit,
            remainder: remainder
        });

        currentValue = remainder;
    }

    return {
        quotient: Number(quotient.join("")),
        remainder: currentValue,
        steps: steps
    };
}

/*
 * This exercise is the reader-chosen variant of the typed division
 * application. The reader writes a dividend from 0 to 9999, selects a divisor
 * from 1 to 9 and starts the calculation:
 * - localTypedUser.steps holds the completed subtraction steps (product and remainder);
 * - localTypedUser.pending holds the step whose quotient digit was just written
 *   and whose subtraction result is still being typed;
 * - localTypedUser.preview holds the product shown while the reader types a digit;
 * - localTypedUser.typedDigit holds the quotient digit currently written;
 * - localTypedUser.remainderTyped holds the subtraction result currently written;
 * - localTypedUser.promptHtml holds the instruction shown below the division;
 * - localTypedUser.startedDividend/startedDivisor hold the last started
 *   calculation so that the redo button can repeat it.
 */
function htDivisionTypedUserStepValue(row) {
    if (row % 2 === 0) {
        var step = (row - 2) / 2;
        if (step < localTypedUser.steps.length) {
            return "-" + htDivisionTypedUserAlign(localTypedUser.steps[step].product) + localTypedUser.steps[step].product;
        }
        if (step === localTypedUser.steps.length && localTypedUser.pending !== null) {
            return "-" + htDivisionTypedUserAlign(localTypedUser.pending.product) + localTypedUser.pending.product;
        }
        if (step === localTypedUser.steps.length && localTypedUser.preview !== null) {
            return "&nbsp;" + htDivisionTypedUserAlign(localTypedUser.preview) + localTypedUser.preview;
        }
        return "&nbsp;";
    }

    var remainderStep = (row - 3) / 2;
    if (remainderStep < localTypedUser.steps.length) {
        return htDivisionTypedUserAlign(localTypedUser.steps[remainderStep].remainder) + " " + localTypedUser.steps[remainderStep].remainder;
    }
    if (remainderStep === localTypedUser.steps.length && localTypedUser.pending !== null) {
        return htDivisionTypedUserAlign(localTypedUser.pending.remainder) + " " + htDivisionTypedUserRemainderInputHtml();
    }

    return "&nbsp;";
}

function htDivisionTypedUserStatusHtml() {
    if (localTypedUser.medal) {
        return "<i class=\"fa-solid fa-medal htDivisionTypedMedal\"></i>";
    }

    return localTypedUser.promptHtml;
}

function htDivisionTypedUserRemainderInputHtml() {
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 72) ? mathKeywords[72] : "Remainder";

    return '<input type="text" class="htDivisionTypedRemainderBox" id="htDivisionTypedUserRemainderInput" maxlength="4" size="4" pattern="[0-9]*" inputmode="numeric" autocomplete="off" aria-label="' + label + '" value="' + localTypedUser.remainderTyped + '" />';
}

function htDivisionTypedUserBoxHtml(stepIdx) {
    var cls = "htDivisionTypedBox";
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 27) ? mathKeywords[27] : "";

    if (stepIdx < localTypedUser.divisionStepsIdx) {
        return '<input type="text" class="' + cls + ' htDivisionTypedDone" size="1" value="' +
            localTypedUser.divisionSteps.steps[stepIdx].quotient + '" readonly tabindex="-1" aria-label="' + label + '" />';
    }

    if (stepIdx === localTypedUser.divisionStepsIdx && localTypedUser.pending !== null) {
        return '<input type="text" class="' + cls + ' htDivisionTypedDone" size="1" value="' +
            localTypedUser.pending.quotient + '" readonly tabindex="-1" aria-label="' + label + '" />';
    }

    if (stepIdx === localTypedUser.divisionStepsIdx && !localTypedUser.stop) {
        return '<input type="text" class="' + cls + ' htDivisionTypedActive" id="htDivisionTypedUserInput" maxlength="1" size="1" pattern="[0-9]*" inputmode="numeric" autocomplete="off" aria-label="' + label + '" value="' + localTypedUser.typedDigit + '" />';
    }

    return '<input type="text" class="' + cls + ' htDivisionTypedPending" size="1" value="" readonly tabindex="-1" aria-label="' + label + '" />';
}

function htDivisionTypedUserQuotientHtml() {
    var html = "";

    for (var i = localTypedUser.firstStepIdx; i < localTypedUser.divisionSteps.steps.length; i++) {
        html += htDivisionTypedUserBoxHtml(i);
    }

    return html;
}

function htDivisionTypedUserRenderBelowHtml() {
    var divisionLabel = (typeof mathKeywords !== "undefined" && mathKeywords.length > 70) ? mathKeywords[70] : "Division";
    var visibleSteps = localTypedUser.divisionSteps.steps.length - localTypedUser.firstStepIdx;
    var lastRow = 1 + 2 * visibleSteps;
    var html = '<table id="yupana0" class="htDivisionTypedTable">';
    html += '<tr><th colspan="2">' + divisionLabel + '</th></tr>';

    html += '<tr id="tf1" class="trCanBeRemoved"><td id="tc1f1" style="border:none;"><span id="tc1fd1">&nbsp; ' + localTypedUser.dividend + '</span></td>';
    html += '<td id="tc2f1" style="border:none;border-bottom: 2pt solid black; border-left: 2px solid black;"><span id="tc2fds1">' + localTypedUser.divisor + '</span></td></tr>';

    for (var row = 2; row <= lastRow; row++) {
        var border = ((row % 2)) ? "border:none;" : "border:none;border-bottom: 2pt solid black;";
        var quotient = (row === 2) ? htDivisionTypedUserQuotientHtml() : "&nbsp;";

        html += '<tr id="tf' + row + '" class="trCanBeRemoved"><td id="tc1f' + row + '" style="' + border + '">' + htDivisionTypedUserStepValue(row) + '</td>';
        html += '<td id="tc2f' + row + '" style="border:none;"><span id="tc2fds' + row + '" class="htDivisionTypedQuotientRow">' + quotient + '</span></td></tr>';
    }

    html += '</table>';

    return html;
}

function htDivisionTypedUserRenderTopHtml() {
    var html = '<table id="yupana0" class="htLongDivisionTop htDivisionTypedTable" role="presentation">';

    html += '<tr><td></td><td class="htLongDivisionQuotient">' + htDivisionTypedUserQuotientHtml() + '</td></tr>';
    html += '<tr><td class="htLongDivisionDivisor">' + localTypedUser.divisor + '</td><td class="htLongDivisionDividend">' + localTypedUser.dividend + '</td></tr>';

    for (var i = 0; i < localTypedUser.steps.length; i++) {
        html += '<tr><td></td><td class="htLongDivisionStep htLongDivisionLine">-' + localTypedUser.steps[i].product + '</td></tr>';
        html += '<tr><td></td><td class="htLongDivisionStep">' + localTypedUser.steps[i].remainder + '</td></tr>';
    }

    if (localTypedUser.pending !== null) {
        html += '<tr><td></td><td class="htLongDivisionStep htLongDivisionLine">-' + localTypedUser.pending.product + '</td></tr>';
        html += '<tr><td></td><td class="htLongDivisionStep">' + htDivisionTypedUserRemainderInputHtml() + '</td></tr>';
    } else if (localTypedUser.preview !== null) {
        html += '<tr><td></td><td class="htLongDivisionStep">' + localTypedUser.preview + '</td></tr>';
    }

    html += '</table>';

    return html;
}

function htDivisionTypedUserRender(shouldFocus) {
    var grid = (htDivisionTypedUserVisualization === "top") ? htDivisionTypedUserRenderTopHtml() : htDivisionTypedUserRenderBelowHtml();
    var redoLabel = (typeof mathKeywords !== "undefined" && mathKeywords.length > 74) ? mathKeywords[74] : "Redo this calculation";
    var html = '<div id="htDivisionTypedUserWrap" class="htDivisionTypedWrap">';
    html += grid;
    if (localTypedUser.feedbackHtml !== "") {
        html += '<div class="htDivisionTypedFeedback">' + localTypedUser.feedbackHtml + '</div>';
    }
    html += '<div class="htDivisionTypedFooter"><div class="htDivisionTypedStatus">' + htDivisionTypedUserStatusHtml() + '</div>';
    html += '<button type="button" class="htDivisionTypedRedo" onclick="htRedoDivisionTypedUser();" title="' + redoLabel + '" aria-label="' + redoLabel + '"><i class="fa-solid fa-rotate-left"></i></button>';
    html += '<i class="fa-solid fa-chevron-right htDivisionTypedNext" onclick="htNewDivisionTypedUser();"></i></div>';
    html += '</div>';

    if ($("#htDivisionTypedUserWrap").length > 0) {
        $("#htDivisionTypedUserWrap").replaceWith(html);
    } else {
        $("#yupana0").replaceWith(html);
    }

    if (shouldFocus) {
        htDivisionTypedUserFocus();
    }
}

function htDivisionTypedUserFocus() {
    var input = document.getElementById("htDivisionTypedUserRemainderInput");

    if (input === null) {
        input = document.getElementById("htDivisionTypedUserInput");
    }

    if (input === null) {
        return;
    }

    if (typeof input.focus === "function") {
        try {
            input.focus({"preventScroll": true});
        } catch (error) {
            input.focus();
        }
    }

    if (typeof input.select === "function") {
        input.select();
    }
}

function htDivisionTypedUserSetVisualization(format) {
    htDivisionTypedUserVisualization = (format === "top") ? "top" : "below";

    $(".htLongDivisionFormatBtn").each(function() {
        $(this).toggleClass("active", $(this).attr("data-htldformat") === htDivisionTypedUserVisualization);
    });

    htDivisionTypedUserRender(false);
}

function htDivisionTypedUserComputeStep(value) {
    var localUse = localTypedUser.divisor * value;

    var loopEnd = localTypedUser.working.toString().length;
    if ((localTypedUser.working - localUse) > localTypedUser.divisor) {
        for (let i = localUse.toString().length; i < loopEnd; i++) {
            localUse *= 10;
        }
    }
    if ((localTypedUser.working - localUse) < 0) {
        localUse = parseInt(localUse / 10);
    }

    return {
        "quotient": value,
        "product": localUse,
        "remainder": localTypedUser.working - localUse
    };
}

function htMoveDivAheadTypedUser() {
    localTypedUser.divisionStepsIdx++;

    if (localTypedUser.divisionStepsIdx < localTypedUser.divisionSteps.steps.length) {
        localTypedUser.usingValue = localTypedUser.divisionSteps.steps[localTypedUser.divisionStepsIdx].value;
        localTypedUser.stopValue = localTypedUser.divisionSteps.steps[localTypedUser.divisionStepsIdx].quotient;
        localTypedUser.promptHtml = mathKeywords[37] + " <b>" + localTypedUser.usingValue + " ÷ " + localTypedUser.divisor + "</b>";
    } else {
        localTypedUser.stop = true;
        localTypedUser.medal = true;
    }

    htDivisionTypedUserRender(true);
}

function htDivisionTypedUserUpdateQuotient(digit) {
    if (localTypedUser.stop || localTypedUser.pending !== null) {
        return false;
    }

    localTypedUser.typedDigit = digit;

    if (digit === "") {
        localTypedUser.preview = null;
        localTypedUser.feedbackHtml = "";
        htDivisionTypedUserRender(true);
        return false;
    }

    if (!/^[0-9]$/.test(digit)) {
        localTypedUser.typedDigit = "";
        localTypedUser.preview = null;
        localTypedUser.feedbackHtml = "";
        htDivisionTypedUserRender(true);
        return false;
    }

    var numeric = parseInt(digit, 10);

    if (numeric === localTypedUser.stopValue) {
        localTypedUser.pending = htDivisionTypedUserComputeStep(numeric);
        localTypedUser.preview = null;
        localTypedUser.feedbackHtml = "";
        localTypedUser.typedDigit = "";
        localTypedUser.remainderTyped = "";
        localTypedUser.promptHtml = mathKeywords[71] + " <b>" + localTypedUser.working + " &minus; " + localTypedUser.pending.product + "</b>";
        htDivisionTypedUserRender(true);
        return false;
    }

    localTypedUser.preview = localTypedUser.divisor * numeric;
    localTypedUser.feedbackHtml = mathKeywords[68];
    htDivisionTypedUserRender(true);

    return false;
}

function htDivisionTypedUserUpdateRemainder(value, showFeedback) {
    if (localTypedUser.pending === null) {
        return false;
    }

    localTypedUser.remainderTyped = value;

    if (value === "") {
        localTypedUser.feedbackHtml = "";
        htDivisionTypedUserRender(true);
        return false;
    }

    if (!/^[0-9]+$/.test(value)) {
        localTypedUser.remainderTyped = "";
        localTypedUser.feedbackHtml = "";
        htDivisionTypedUserRender(true);
        return false;
    }

    var numeric = parseInt(value, 10);

    if (numeric === localTypedUser.pending.remainder) {
        localTypedUser.steps.push(localTypedUser.pending);
        localTypedUser.working = localTypedUser.pending.remainder;
        localTypedUser.pending = null;
        localTypedUser.remainderTyped = "";
        localTypedUser.feedbackHtml = "";
        htMoveDivAheadTypedUser();
        return false;
    }

    if (showFeedback) {
        localTypedUser.feedbackHtml = mathKeywords[73];
        htDivisionTypedUserRender(true);
    }

    return false;
}

function htDivisionTypedUserShowError(show) {
    var element = document.getElementById("htDivisionTypedUserError");

    if (element === null) {
        return;
    }

    element.textContent = show ? htDivisionTypedUserKeyword(76, "Please enter a whole number between 0 and 9999.") : "";
}

function htStartDivisionTypedUser(dividend, divisor, shouldFocus) {
    localTypedUser.divisionStepsIdx = 0;
    localTypedUser.steps = [];
    localTypedUser.pending = null;
    localTypedUser.preview = null;
    localTypedUser.medal = false;
    localTypedUser.typedDigit = "";
    localTypedUser.remainderTyped = "";
    localTypedUser.feedbackHtml = "";
    localTypedUser.stop = false;

    localTypedUser.working = localTypedUser.dividend = dividend;
    localTypedUser.divisor = divisor;
    localTypedUser.startedDividend = dividend;
    localTypedUser.startedDivisor = divisor;

    htDivisionTypedUserShowError(false);

    $("#mParentN").html("");
    htWriteMultiplicationTable("#mParentN", localTypedUser.divisor);

    localTypedUser.divisionSteps = htLongDivisionTypedUser(localTypedUser.dividend, localTypedUser.divisor);

    var firstStepIdx = 0;
    var additionalText = "";
    var divisionSteps = localTypedUser.divisionSteps.steps;

    if (divisionSteps.length > 1 && divisionSteps[0].quotient === 0) {
        firstStepIdx = 1;
        if (localTypedUser.dividend >= 1000) {
            additionalText = htDivisionTypedUserKeyword(75, "The thousands digit is smaller than the divisor, so the first division uses the thousands and hundreds together.");
        } else if (localTypedUser.dividend >= 100) {
            additionalText = mathKeywords[69];
        } else {
            additionalText = mathKeywords[39];
        }
    } else if (divisionSteps.length === 1 && divisionSteps[0].quotient === 0) {
        additionalText = htDivisionTypedUserKeyword(77, "The dividend is smaller than the divisor, so the quotient is 0 and the dividend itself is the remainder.");
    }

    localTypedUser.divisionStepsIdx = firstStepIdx;
    localTypedUser.firstStepIdx = firstStepIdx;
    localTypedUser.usingValue = divisionSteps[firstStepIdx].value;
    localTypedUser.stopValue = divisionSteps[firstStepIdx].quotient;
    localTypedUser.promptHtml = mathKeywords[37] + " <b>" + localTypedUser.usingValue + " ÷ " + localTypedUser.divisor + "</b>" + ((additionalText !== "") ? "<br />" + additionalText : "");

    htDivisionTypedUserRender(shouldFocus);
}

function htDivisionTypedUserReadInputs() {
    var raw = $("#htDivisionTypedUserDividend").val();
    var text = (raw === null || typeof raw === "undefined") ? "" : String(raw).replace(/[^0-9]/g, "");
    var divisor = parseInt($("#mtValues").val(), 10);

    if (text === "" || text.length > 4) {
        return null;
    }

    var dividend = parseInt(text, 10);

    if (isNaN(dividend) || dividend < 0 || dividend > 9999) {
        return null;
    }

    if (isNaN(divisor) || divisor < 1 || divisor > 9) {
        return null;
    }

    return { "dividend": dividend, "divisor": divisor };
}

function htStartDivisionTypedUserFromInputs(shouldFocus) {
    var values = htDivisionTypedUserReadInputs();

    if (values === null) {
        htDivisionTypedUserShowError(true);
        return false;
    }

    htStartDivisionTypedUser(values.dividend, values.divisor, shouldFocus);

    return false;
}

function htNewDivisionTypedUser() {
    htStartDivisionTypedUserFromInputs(false);

    return false;
}

function htRedoDivisionTypedUser() {
    if (localTypedUser.startedDividend === null || localTypedUser.startedDivisor === null) {
        return false;
    }

    htStartDivisionTypedUser(localTypedUser.startedDividend, localTypedUser.startedDivisor, true);

    return false;
}

function htLoadContent() {
    localTypedUser = { "working": 0, "stopValue": 0, "divisor": 1, "usingValue": "", "dividend": 0, "stop": true, "divisionSteps": { "steps": [] }, "divisionStepsIdx": 0, "steps": [], "pending": null, "preview": null, "typedDigit": "", "remainderTyped": "", "feedbackHtml": "", "firstStepIdx": 0, "promptHtml": "", "medal": false, "startedDividend": null, "startedDivisor": null };

    htWriteNavigation();

    if ($("#mtValues").length > 0) {
        $("#mtValues").empty();

        for (var i = 1; i <= 9; i++) {
            $('#mtValues').append($('<option>', {
                value: String(i),
                text: String(i)
            }));
        }

        $("#mtValues").val("2");
    }

    $("#htDivisionTypedUserStart").off("click.htDivisionTypedUser").on("click.htDivisionTypedUser", function(event) {
        event.preventDefault();
        htStartDivisionTypedUserFromInputs(true);
        return false;
    });

    $("#htDivisionTypedUserDividend").off("input.htDivisionTypedUser").on("input.htDivisionTypedUser", function() {
        var value = $(this).val().replace(/[^0-9]/g, "");
        if (value.length > 4) {
            value = value.slice(0, 4);
        }
        $(this).val(value);
    });

    $("#htDivisionTypedUserDividend").off("keydown.htDivisionTypedUser").on("keydown.htDivisionTypedUser", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            htStartDivisionTypedUserFromInputs(true);
            return false;
        }
    });

    $(document).off("click.htDivisionTypedUserFormat").on("click.htDivisionTypedUserFormat", ".htLongDivisionFormatBtn", function(event) {
        event.preventDefault();
        if ($("#yupana0").length === 0) {
            return false;
        }
        htDivisionTypedUserSetVisualization($(this).attr("data-htldformat"));
        return false;
    });

    $(document).off("input.htDivisionTypedUserQuotient").on("input.htDivisionTypedUserQuotient", "#htDivisionTypedUserInput", function() {
        var value = $(this).val().replace(/[^0-9]/g, "");
        if (value.length > 1) {
            value = value.charAt(value.length - 1);
        }
        $(this).val(value);
        htDivisionTypedUserUpdateQuotient(value);
    });

    $(document).off("keydown.htDivisionTypedUserQuotient").on("keydown.htDivisionTypedUserQuotient", "#htDivisionTypedUserInput", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            htDivisionTypedUserUpdateQuotient($(this).val());
            return false;
        }

        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        if (event.key.length === 1 && !/[0-9]/.test(event.key)) {
            event.preventDefault();
            return false;
        }
    });

    $(document).off("input.htDivisionTypedUserRemainder").on("input.htDivisionTypedUserRemainder", "#htDivisionTypedUserRemainderInput", function() {
        var value = $(this).val().replace(/[^0-9]/g, "");
        if (value.length > 4) {
            value = value.slice(0, 4);
        }
        $(this).val(value);
        htDivisionTypedUserUpdateRemainder(value, false);
    });

    $(document).off("keydown.htDivisionTypedUserRemainder").on("keydown.htDivisionTypedUserRemainder", "#htDivisionTypedUserRemainderInput", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            htDivisionTypedUserUpdateRemainder($(this).val(), true);
            return false;
        }

        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        if (event.key.length === 1 && !/[0-9]/.test(event.key)) {
            event.preventDefault();
            return false;
        }
    });

    htStartDivisionTypedUserFromInputs(false);
    return false;
}
