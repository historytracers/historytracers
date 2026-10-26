// SPDX-License-Identifier: GPL-3.0-or-later

var localTypedSub = {};
var htDivisionTypedSubVisualization = "below";

function htDivisionTypedSubAlign(val) {
    var space = "&nbsp;";
    var loopEnd = localTypedSub.dividend.toString().length - val.toString().length;
    for (let i = 0; i < loopEnd; i++) {
        space += "&nbsp;&nbsp;";
    }

    return space;
}

function htLongDivisionTypedSub(dividend, divisor) {
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
 * This exercise is the typed variant of the division application where the
 * reader writes both the quotient digit and the result of each subtraction:
 * - localTypedSub.steps holds the completed subtraction steps (product and remainder);
 * - localTypedSub.pending holds the step whose quotient digit was just written
 *   and whose subtraction result is still being typed;
 * - localTypedSub.preview holds the product shown while the reader types a digit;
 * - localTypedSub.typedDigit holds the quotient digit currently written;
 * - localTypedSub.remainderTyped holds the subtraction result currently written;
 * - localTypedSub.promptHtml holds the instruction shown below the division.
 * The reader writes a quotient digit, the application shows the product, and
 * the reader then writes the result of the subtraction of that step.
 */
function htDivisionTypedSubStepValue(row) {
    if (row % 2 === 0) {
        var step = (row - 2) / 2;
        if (step < localTypedSub.steps.length) {
            return "-" + htDivisionTypedSubAlign(localTypedSub.steps[step].product) + localTypedSub.steps[step].product;
        }
        if (step === localTypedSub.steps.length && localTypedSub.pending !== null) {
            return "-" + htDivisionTypedSubAlign(localTypedSub.pending.product) + localTypedSub.pending.product;
        }
        if (step === localTypedSub.steps.length && localTypedSub.preview !== null) {
            return "&nbsp;" + htDivisionTypedSubAlign(localTypedSub.preview) + localTypedSub.preview;
        }
        return "&nbsp;";
    }

    var remainderStep = (row - 3) / 2;
    if (remainderStep < localTypedSub.steps.length) {
        return htDivisionTypedSubAlign(localTypedSub.steps[remainderStep].remainder) + " " + localTypedSub.steps[remainderStep].remainder;
    }
    if (remainderStep === localTypedSub.steps.length && localTypedSub.pending !== null) {
        return htDivisionTypedSubAlign(localTypedSub.pending.remainder) + " " + htDivisionTypedSubRemainderInputHtml();
    }

    return "&nbsp;";
}

function htDivisionTypedSubStatusHtml() {
    if (localTypedSub.medal) {
        return "<i class=\"fa-solid fa-medal htDivisionTypedMedal\"></i>";
    }

    return localTypedSub.promptHtml;
}

function htDivisionTypedSubRemainderInputHtml() {
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 72) ? mathKeywords[72] : "Remainder";

    return '<input type="text" class="htDivisionTypedRemainderBox" id="htDivisionTypedSubRemainderInput" maxlength="3" size="3" pattern="[0-9]*" inputmode="numeric" autocomplete="off" aria-label="' + label + '" value="' + localTypedSub.remainderTyped + '" />';
}

function htDivisionTypedSubBoxHtml(stepIdx) {
    var cls = "htDivisionTypedBox";
    var label = (typeof mathKeywords !== "undefined" && mathKeywords.length > 27) ? mathKeywords[27] : "";

    if (stepIdx < localTypedSub.divisionStepsIdx) {
        return '<input type="text" class="' + cls + ' htDivisionTypedDone" size="1" value="' +
            localTypedSub.divisionSteps.steps[stepIdx].quotient + '" readonly tabindex="-1" aria-label="' + label + '" />';
    }

    if (stepIdx === localTypedSub.divisionStepsIdx && localTypedSub.pending !== null) {
        return '<input type="text" class="' + cls + ' htDivisionTypedDone" size="1" value="' +
            localTypedSub.pending.quotient + '" readonly tabindex="-1" aria-label="' + label + '" />';
    }

    if (stepIdx === localTypedSub.divisionStepsIdx && !localTypedSub.stop) {
        return '<input type="text" class="' + cls + ' htDivisionTypedActive" id="htDivisionTypedSubInput" maxlength="1" size="1" pattern="[0-9]*" inputmode="numeric" autocomplete="off" aria-label="' + label + '" value="' + localTypedSub.typedDigit + '" />';
    }

    return '<input type="text" class="' + cls + ' htDivisionTypedPending" size="1" value="" readonly tabindex="-1" aria-label="' + label + '" />';
}

function htDivisionTypedSubQuotientHtml() {
    var html = "";

    for (var i = localTypedSub.firstStepIdx; i < localTypedSub.divisionSteps.steps.length; i++) {
        html += htDivisionTypedSubBoxHtml(i);
    }

    return html;
}

function htDivisionTypedSubRenderBelowHtml() {
    var divisionLabel = (typeof mathKeywords !== "undefined" && mathKeywords.length > 70) ? mathKeywords[70] : "Division";
    var html = '<table id="yupana0" class="htDivisionTypedTable">';
    html += '<tr><th colspan="2">' + divisionLabel + '</th></tr>';

    html += '<tr id="tf1" class="trCanBeRemoved"><td id="tc1f1" style="border:none;"><span id="tc1fd1">&nbsp; ' + localTypedSub.dividend + '</span></td>';
    html += '<td id="tc2f1" style="border:none;border-bottom: 2pt solid black; border-left: 2px solid black;"><span id="tc2fds1">' + localTypedSub.divisor + '</span></td></tr>';

    for (var row = 2; row <= 7; row++) {
        var border = ((row % 2)) ? "border:none;" : "border:none;border-bottom: 2pt solid black;";
        var quotient = (row === 2) ? htDivisionTypedSubQuotientHtml() : "&nbsp;";

        html += '<tr id="tf' + row + '" class="trCanBeRemoved"><td id="tc1f' + row + '" style="' + border + '">' + htDivisionTypedSubStepValue(row) + '</td>';
        html += '<td id="tc2f' + row + '" style="border:none;"><span id="tc2fds' + row + '" class="htDivisionTypedQuotientRow">' + quotient + '</span></td></tr>';
    }

    html += '</table>';

    return html;
}

function htDivisionTypedSubRenderTopHtml() {
    var html = '<table id="yupana0" class="htLongDivisionTop htDivisionTypedTable" role="presentation">';

    html += '<tr><td></td><td class="htLongDivisionQuotient">' + htDivisionTypedSubQuotientHtml() + '</td></tr>';
    html += '<tr><td class="htLongDivisionDivisor">' + localTypedSub.divisor + '</td><td class="htLongDivisionDividend">' + localTypedSub.dividend + '</td></tr>';

    for (var i = 0; i < localTypedSub.steps.length; i++) {
        html += '<tr><td></td><td class="htLongDivisionStep htLongDivisionLine">-' + localTypedSub.steps[i].product + '</td></tr>';
        html += '<tr><td></td><td class="htLongDivisionStep">' + localTypedSub.steps[i].remainder + '</td></tr>';
    }

    if (localTypedSub.pending !== null) {
        html += '<tr><td></td><td class="htLongDivisionStep htLongDivisionLine">-' + localTypedSub.pending.product + '</td></tr>';
        html += '<tr><td></td><td class="htLongDivisionStep">' + htDivisionTypedSubRemainderInputHtml() + '</td></tr>';
    } else if (localTypedSub.preview !== null) {
        html += '<tr><td></td><td class="htLongDivisionStep">' + localTypedSub.preview + '</td></tr>';
    }

    html += '</table>';

    return html;
}

function htDivisionTypedSubRender(shouldFocus) {
    var grid = (htDivisionTypedSubVisualization === "top") ? htDivisionTypedSubRenderTopHtml() : htDivisionTypedSubRenderBelowHtml();
    var html = '<div id="htDivisionTypedSubWrap" class="htDivisionTypedWrap">';
    html += grid;
    if (localTypedSub.feedbackHtml !== "") {
        html += '<div class="htDivisionTypedFeedback">' + localTypedSub.feedbackHtml + '</div>';
    }
    html += '<div class="htDivisionTypedFooter"><div class="htDivisionTypedStatus">' + htDivisionTypedSubStatusHtml() + '</div>';
    html += '<i class="fa-solid fa-chevron-right htDivisionTypedNext" onclick="htNewDivisionTypedSub();"></i></div>';
    html += '</div>';

    if ($("#htDivisionTypedSubWrap").length > 0) {
        $("#htDivisionTypedSubWrap").replaceWith(html);
    } else {
        $("#yupana0").replaceWith(html);
    }

    if (shouldFocus) {
        htDivisionTypedSubFocus();
    }
}

function htDivisionTypedSubFocus() {
    var input = document.getElementById("htDivisionTypedSubRemainderInput");

    if (input === null) {
        input = document.getElementById("htDivisionTypedSubInput");
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

function htDivisionTypedSubSetVisualization(format) {
    htDivisionTypedSubVisualization = (format === "top") ? "top" : "below";

    $(".htLongDivisionFormatBtn").each(function() {
        $(this).toggleClass("active", $(this).attr("data-htldformat") === htDivisionTypedSubVisualization);
    });

    htDivisionTypedSubRender(false);
}

function htDivisionTypedSubComputeStep(value) {
    var localUse = localTypedSub.divisor * value;

    var loopEnd = (localTypedSub.idx < 6) ? localTypedSub.working.toString().length : 1;
    if ((localTypedSub.working - localUse) > localTypedSub.divisor) {
        for (let i = localUse.toString().length; i < loopEnd; i++) {
            localUse *= 10;
        }
    }
    if ((localTypedSub.working - localUse) < 0) {
        localUse = parseInt(localUse / 10);
    }

    return {
        "quotient": value,
        "product": localUse,
        "remainder": localTypedSub.working - localUse
    };
}

function htMoveDivAheadTypedSub() {
    localTypedSub.divisionStepsIdx++;

    if (localTypedSub.divisionStepsIdx < localTypedSub.divisionSteps.steps.length) {
        localTypedSub.usingValue = localTypedSub.divisionSteps.steps[localTypedSub.divisionStepsIdx].value;
        localTypedSub.stopValue = localTypedSub.divisionSteps.steps[localTypedSub.divisionStepsIdx].quotient;
        localTypedSub.promptHtml = mathKeywords[37] + " <b>" + localTypedSub.usingValue + " ÷ " + localTypedSub.divisor + "</b>";
    } else {
        localTypedSub.stop = true;
        localTypedSub.medal = true;
    }

    localTypedSub.idx += 2;

    htDivisionTypedSubRender(true);
}

function htDivisionTypedSubUpdateQuotient(digit) {
    if (localTypedSub.stop || localTypedSub.pending !== null) {
        return false;
    }

    localTypedSub.typedDigit = digit;

    if (digit === "") {
        localTypedSub.preview = null;
        localTypedSub.feedbackHtml = "";
        htDivisionTypedSubRender(true);
        return false;
    }

    if (!/^[0-9]$/.test(digit)) {
        localTypedSub.typedDigit = "";
        localTypedSub.preview = null;
        localTypedSub.feedbackHtml = "";
        htDivisionTypedSubRender(true);
        return false;
    }

    var numeric = parseInt(digit, 10);

    if (numeric === localTypedSub.stopValue) {
        localTypedSub.pending = htDivisionTypedSubComputeStep(numeric);
        localTypedSub.preview = null;
        localTypedSub.feedbackHtml = "";
        localTypedSub.typedDigit = "";
        localTypedSub.remainderTyped = "";
        localTypedSub.promptHtml = mathKeywords[71] + " <b>" + localTypedSub.working + " &minus; " + localTypedSub.pending.product + "</b>";
        htDivisionTypedSubRender(true);
        return false;
    }

    localTypedSub.preview = localTypedSub.divisor * numeric;
    localTypedSub.feedbackHtml = mathKeywords[68];
    htDivisionTypedSubRender(true);

    return false;
}

function htDivisionTypedSubUpdateRemainder(value, showFeedback) {
    if (localTypedSub.pending === null) {
        return false;
    }

    localTypedSub.remainderTyped = value;

    if (value === "") {
        localTypedSub.feedbackHtml = "";
        htDivisionTypedSubRender(true);
        return false;
    }

    if (!/^[0-9]+$/.test(value)) {
        localTypedSub.remainderTyped = "";
        localTypedSub.feedbackHtml = "";
        htDivisionTypedSubRender(true);
        return false;
    }

    var numeric = parseInt(value, 10);

    if (numeric === localTypedSub.pending.remainder) {
        localTypedSub.steps.push(localTypedSub.pending);
        localTypedSub.working = localTypedSub.pending.remainder;
        localTypedSub.pending = null;
        localTypedSub.remainderTyped = "";
        localTypedSub.feedbackHtml = "";
        htMoveDivAheadTypedSub();
        return false;
    }

    if (showFeedback) {
        localTypedSub.feedbackHtml = mathKeywords[73];
        htDivisionTypedSubRender(true);
    }

    return false;
}

function htNewDivisionTypedSub() {
    localTypedSub.idx = 2;
    localTypedSub.divisionStepsIdx = 0;
    localTypedSub.steps = [];
    localTypedSub.pending = null;
    localTypedSub.preview = null;
    localTypedSub.medal = false;
    localTypedSub.typedDigit = "";
    localTypedSub.remainderTyped = "";
    localTypedSub.feedbackHtml = "";
    var selector = $("#mtValues").val();

    localTypedSub.working = localTypedSub.dividend = htGetRandomArbitrary(10, 1000);

    localTypedSub.divisor = (selector == "-1") ? htGetRandomArbitrary(1, 10): parseInt(selector);

    $("#mParentN").html("");
    htWriteMultiplicationTable("#mParentN", localTypedSub.divisor);

    localTypedSub.divisionSteps = htLongDivisionTypedSub(localTypedSub.dividend, localTypedSub.divisor);
    var additionalText = "";
    if (localTypedSub.divisionSteps.steps[localTypedSub.divisionStepsIdx].quotient == 0) {
        additionalText = (localTypedSub.dividend >= 100) ? mathKeywords[69] : mathKeywords[39];
        localTypedSub.divisionStepsIdx++;
    }
    localTypedSub.firstStepIdx = localTypedSub.divisionStepsIdx;
    localTypedSub.usingValue = localTypedSub.divisionSteps.steps[localTypedSub.divisionStepsIdx].value;
    localTypedSub.stopValue = localTypedSub.divisionSteps.steps[localTypedSub.divisionStepsIdx].quotient;
    localTypedSub.promptHtml = mathKeywords[37]+" <b>"+localTypedSub.usingValue+" ÷ "+localTypedSub.divisor+"</b><br />"+additionalText;

    localTypedSub.stop = false;

    htDivisionTypedSubRender(false);

    return false;
}

function htLoadContent() {
    localTypedSub = { "working": 0, "stopValue": 0, "divisor": 1, "usingValue": "", "idx": 2, "dividend": 0, "stop": true, "divisionSteps": [], "divisionStepsIdx": 0, "steps": [], "pending": null, "preview": null, "typedDigit": "", "remainderTyped": "", "feedbackHtml": "", "firstStepIdx": 0, "promptHtml": "", "medal": false };

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
            htNewDivisionTypedSub();
        });
    }

    $(document).off("click.htDivisionTypedSubFormat").on("click.htDivisionTypedSubFormat", ".htLongDivisionFormatBtn", function (event) {
        event.preventDefault();
        if ($("#yupana0").length === 0) {
            return false;
        }
        htDivisionTypedSubSetVisualization($(this).attr("data-htldformat"));
        return false;
    });

    $(document).off("input.htDivisionTypedSub").on("input.htDivisionTypedSub", "#htDivisionTypedSubInput", function () {
        var value = $(this).val().replace(/[^0-9]/g, "");
        if (value.length > 1) {
            value = value.charAt(value.length - 1);
        }
        $(this).val(value);
        htDivisionTypedSubUpdateQuotient(value);
    });

    $(document).off("keydown.htDivisionTypedSub").on("keydown.htDivisionTypedSub", "#htDivisionTypedSubInput", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            htDivisionTypedSubUpdateQuotient($(this).val());
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

    $(document).off("input.htDivisionTypedSubRemainder").on("input.htDivisionTypedSubRemainder", "#htDivisionTypedSubRemainderInput", function () {
        var value = $(this).val().replace(/[^0-9]/g, "");
        if (value.length > 3) {
            value = value.slice(0, 3);
        }
        $(this).val(value);
        htDivisionTypedSubUpdateRemainder(value, false);
    });

    $(document).off("keydown.htDivisionTypedSubRemainder").on("keydown.htDivisionTypedSubRemainder", "#htDivisionTypedSubRemainderInput", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            htDivisionTypedSubUpdateRemainder($(this).val(), true);
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

    htNewDivisionTypedSub();
    return false;
}
