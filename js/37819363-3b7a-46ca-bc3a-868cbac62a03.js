// SPDX-License-Identifier: GPL-3.0-or-later

var localTyped = {};
var htDivisionTypedVisualization = "below";

function htDivisionTypedAlign(val) {
    var space = "&nbsp;";
    var loopEnd = localTyped.dividend.toString().length - val.toString().length;
    for (let i = 0; i < loopEnd; i++) {
        space += "&nbsp;&nbsp;";
    }

    return space;
}

function htLongDivisionTyped(dividend, divisor) {
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
 * This exercise is the typed variant of the division application:
 * - localTyped.steps holds the completed subtraction steps (product and remainder);
 * - localTyped.preview holds the product shown while the reader types a digit;
 * - localTyped.typedDigit holds the digit currently written in the active box;
 * - localTyped.promptHtml holds the instruction shown below the division.
 * The reader writes the quotient digit by digit; the application performs the
 * multiplication and subtraction of every step.
 */
function htDivisionTypedStepValue(row) {
    if (row % 2 === 0) {
        var step = (row - 2) / 2;
        if (step < localTyped.steps.length) {
            return "-" + htDivisionTypedAlign(localTyped.steps[step].product) + localTyped.steps[step].product;
        }
        if (step === localTyped.steps.length && localTyped.preview !== null) {
            return "&nbsp;" + htDivisionTypedAlign(localTyped.preview) + localTyped.preview;
        }
        return "&nbsp;";
    }

    var remainderStep = (row - 3) / 2;
    if (remainderStep < localTyped.steps.length) {
        return htDivisionTypedAlign(localTyped.steps[remainderStep].remainder) + " " + localTyped.steps[remainderStep].remainder;
    }

    return "&nbsp;";
}

function htDivisionTypedStatusHtml() {
    if (localTyped.medal) {
        return "<i class=\"fa-solid fa-medal htDivisionTypedMedal\"></i>";
    }

    return localTyped.promptHtml;
}

function htDivisionTypedBoxHtml(stepIdx) {
    var cls = "htDivisionTypedBox";
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 27) ? mathKeywords[27] : "";

    if (stepIdx < localTyped.divisionStepsIdx) {
        return '<input type="text" class="' + cls + ' htDivisionTypedDone" value="' +
            localTyped.divisionSteps.steps[stepIdx].quotient + '" readonly tabindex="-1" aria-label="' + label + '" />';
    }

    if (stepIdx === localTyped.divisionStepsIdx && !localTyped.stop) {
        return '<input type="text" class="' + cls + ' htDivisionTypedActive" id="htDivisionTypedInput" maxlength="1" inputmode="numeric" autocomplete="off" aria-label="' + label + '" value="' + localTyped.typedDigit + '" />';
    }

    return '<input type="text" class="' + cls + ' htDivisionTypedPending" value="" readonly tabindex="-1" aria-label="' + label + '" />';
}

function htDivisionTypedQuotientHtml() {
    var html = "";

    for (var i = localTyped.firstStepIdx; i < localTyped.divisionSteps.steps.length; i++) {
        html += htDivisionTypedBoxHtml(i);
    }

    return html;
}

function htDivisionTypedRenderBelowHtml() {
    var divisionLabel = (typeof mathKeywords !== "undefined" && mathKeywords.length > 70) ? mathKeywords[70] : "Division";
    var html = '<table id="yupana0" class="htDivisionTypedTable">';
    html += '<tr><th colspan="2">' + divisionLabel + '</th></tr>';

    html += '<tr id="tf1" class="trCanBeRemoved"><td id="tc1f1" style="border:none;"><span id="tc1fd1">&nbsp; ' + localTyped.dividend + '</span></td>';
    html += '<td id="tc2f1" style="border:none;border-bottom: 2pt solid black; border-left: 2px solid black;"><span id="tc2fds1">' + localTyped.divisor + '</span></td></tr>';

    for (var row = 2; row <= 7; row++) {
        var border = ((row % 2)) ? "border:none;" : "border:none;border-bottom: 2pt solid black;";
        var quotient = (row === 2) ? htDivisionTypedQuotientHtml() : "&nbsp;";

        html += '<tr id="tf' + row + '" class="trCanBeRemoved"><td id="tc1f' + row + '" style="' + border + '">' + htDivisionTypedStepValue(row) + '</td>';
        html += '<td id="tc2f' + row + '" style="border:none;"><span id="tc2fds' + row + '">' + quotient + '</span></td></tr>';
    }

    html += '</table>';

    return html;
}

function htDivisionTypedRenderTopHtml() {
    var html = '<table id="yupana0" class="htLongDivisionTop htDivisionTypedTable" role="presentation">';

    html += '<tr><td></td><td class="htLongDivisionQuotient">' + htDivisionTypedQuotientHtml() + '</td></tr>';
    html += '<tr><td class="htLongDivisionDivisor">' + localTyped.divisor + '</td><td class="htLongDivisionDividend">' + localTyped.dividend + '</td></tr>';

    for (var i = 0; i < localTyped.steps.length; i++) {
        html += '<tr><td></td><td class="htLongDivisionStep htLongDivisionLine">-' + localTyped.steps[i].product + '</td></tr>';
        html += '<tr><td></td><td class="htLongDivisionStep">' + localTyped.steps[i].remainder + '</td></tr>';
    }

    if (localTyped.preview !== null) {
        html += '<tr><td></td><td class="htLongDivisionStep">' + localTyped.preview + '</td></tr>';
    }

    html += '</table>';

    return html;
}

function htDivisionTypedRender(shouldFocus) {
    var grid = (htDivisionTypedVisualization === "top") ? htDivisionTypedRenderTopHtml() : htDivisionTypedRenderBelowHtml();
    var html = '<div id="htDivisionTypedWrap" class="htDivisionTypedWrap">';
    html += grid;
    if (localTyped.feedbackHtml !== "") {
        html += '<div class="htDivisionTypedFeedback">' + localTyped.feedbackHtml + '</div>';
    }
    html += '<div class="htDivisionTypedFooter"><div class="htDivisionTypedStatus">' + htDivisionTypedStatusHtml() + '</div>';
    html += '<i class="fa-solid fa-chevron-right htDivisionTypedNext" onclick="htNewDivisionTyped();"></i></div>';
    html += '</div>';

    if ($("#htDivisionTypedWrap").length > 0) {
        $("#htDivisionTypedWrap").replaceWith(html);
    } else {
        $("#yupana0").replaceWith(html);
    }

    if (shouldFocus) {
        htDivisionTypedFocus();
    }
}

function htDivisionTypedFocus() {
    var input = document.getElementById("htDivisionTypedInput");

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

function htDivisionTypedSetVisualization(format) {
    htDivisionTypedVisualization = (format === "top") ? "top" : "below";

    $(".htLongDivisionFormatBtn").each(function() {
        $(this).toggleClass("active", $(this).attr("data-htldformat") === htDivisionTypedVisualization);
    });

    htDivisionTypedRender(false);
}

function htDivisionTypedAddStep(value) {
    var localUse = localTyped.divisor * value;

    var loopEnd = (localTyped.idx < 6) ? localTyped.working.toString().length : 1;
    if ((localTyped.working - localUse) > localTyped.divisor) {
        for (let i = localUse.toString().length; i < loopEnd; i++) {
            localUse *= 10;
        }
    }
    if ((localTyped.working - localUse) < 0) {
        localUse = parseInt(localUse / 10);
    }

    localTyped.steps.push({ "product": localUse, "remainder": localTyped.working - localUse });
    localTyped.working = localTyped.working - localUse;
    localTyped.preview = null;
    localTyped.typedDigit = "";
    localTyped.feedbackHtml = "";
}

function htMoveDivAheadTyped() {
    localTyped.divisionStepsIdx++;

    if (localTyped.divisionStepsIdx < localTyped.divisionSteps.steps.length) {
        localTyped.usingValue = localTyped.divisionSteps.steps[localTyped.divisionStepsIdx].value;
        localTyped.stopValue = localTyped.divisionSteps.steps[localTyped.divisionStepsIdx].quotient;
    } else {
        localTyped.stop = true;
        localTyped.medal = true;
    }

    if (!localTyped.stop) {
        localTyped.promptHtml = mathKeywords[37]+" <b>"+localTyped.usingValue+" ÷ "+localTyped.divisor+"</b>";
    }

    localTyped.idx += 2;

    htDivisionTypedRender(true);
}

function htDivisionTypedUpdateValue(digit) {
    if (localTyped.stop) {
        return false;
    }

    localTyped.typedDigit = digit;

    if (digit === "") {
        localTyped.preview = null;
        localTyped.feedbackHtml = "";
        htDivisionTypedRender(true);
        return false;
    }

    var numeric = parseInt(digit, 10);

    if (isNaN(numeric)) {
        localTyped.typedDigit = "";
        localTyped.preview = null;
        localTyped.feedbackHtml = "";
        htDivisionTypedRender(true);
        return false;
    }

    if (numeric === localTyped.stopValue) {
        htDivisionTypedAddStep(numeric);
        htMoveDivAheadTyped();
        return false;
    }

    localTyped.preview = localTyped.divisor * numeric;
    localTyped.feedbackHtml = mathKeywords[68];
    htDivisionTypedRender(true);

    return false;
}

function htNewDivisionTyped() {
    localTyped.idx = 2;
    localTyped.divisionStepsIdx = 0;
    localTyped.steps = [];
    localTyped.preview = null;
    localTyped.medal = false;
    localTyped.typedDigit = "";
    localTyped.feedbackHtml = "";
    var selector = $("#mtValues").val();

    localTyped.working = localTyped.dividend = htGetRandomArbitrary(10, 1000);

    localTyped.divisor = (selector == "-1") ? htGetRandomArbitrary(1, 10): parseInt(selector);

    $("#mParentN").html("");
    htWriteMultiplicationTable("#mParentN", localTyped.divisor);

    localTyped.divisionSteps = htLongDivisionTyped(localTyped.dividend, localTyped.divisor);
    var additionalText = "";
    if (localTyped.divisionSteps.steps[localTyped.divisionStepsIdx].quotient == 0) {
        additionalText = (localTyped.dividend >= 100) ? mathKeywords[69] : mathKeywords[39];
        localTyped.divisionStepsIdx++;
    }
    localTyped.firstStepIdx = localTyped.divisionStepsIdx;
    localTyped.usingValue = localTyped.divisionSteps.steps[localTyped.divisionStepsIdx].value;
    localTyped.stopValue = localTyped.divisionSteps.steps[localTyped.divisionStepsIdx].quotient;
    localTyped.promptHtml = mathKeywords[37]+" <b>"+localTyped.usingValue+" ÷ "+localTyped.divisor+"</b><br />"+additionalText;

    localTyped.stop = false;

    htDivisionTypedRender(false);

    return false;
}

function htLoadContent() {
    localTyped = { "working": 0, "stopValue": 0, "divisor": 1, "usingValue": "", "idx": 2, "dividend": 0, "stop": true, "divisionSteps": [], "divisionStepsIdx": 0, "steps": [], "preview": null, "typedDigit": "", "feedbackHtml": "", "firstStepIdx": 0, "promptHtml": "", "medal": false };

    htWriteNavigation();

    if ($("#mtValues").length > 0) {
        var data = [
            { text: '1', value: '1' },
            { text: '2', value: '2' },
            { text: '3', value: '3' },
            { text: '4', value: '4' },
            { text: '5', value: '5' },
            { text: '6', value: '6' },
            { text: '7', value: '7' },
            { text: '8', value: '8' },
            { text: '9', value: '9' }
        ];

        $.each(data, function(index, item) {
            $('#mtValues').append($('<option>', {
                value: item.value,
                text: item.text
            }));
        });

        $("#mtValues").on( "change", function() {
            htNewDivisionTyped();
        });
    }

    $(document).off("click.htDivisionTypedFormat").on("click.htDivisionTypedFormat", ".htLongDivisionFormatBtn", function (event) {
        event.preventDefault();
        if ($("#yupana0").length === 0) {
            return false;
        }
        htDivisionTypedSetVisualization($(this).attr("data-htldformat"));
        return false;
    });

    $(document).off("input.htDivisionTyped").on("input.htDivisionTyped", "#htDivisionTypedInput", function () {
        var value = $(this).val().replace(/[^0-9]/g, "");
        if (value.length > 1) {
            value = value.charAt(value.length - 1);
        }
        $(this).val(value);
        htDivisionTypedUpdateValue(value);
    });

    $(document).off("keydown.htDivisionTyped").on("keydown.htDivisionTyped", "#htDivisionTypedInput", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            htDivisionTypedUpdateValue($(this).val());
            return false;
        }
    });

    htNewDivisionTyped();
    return false;
}
