// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};
var htDivisionVisualization = "below";

function htAlignTextBeforeWrite(val) {
    var space = "&nbsp;";
    var loopEnd = local.dividend.toString().length - val.toString().length;
    for (let i = 0; i < loopEnd; i++) {
        space += "&nbsp;&nbsp;"
    }

    return space;
}

function htLongDivision(dividend, divisor) {
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
 * The exercise keeps the same state for both visualizations:
 * - local.steps holds the completed subtraction steps (product and remainder);
 * - local.preview holds the product shown while the reader tries a digit;
 * - local.quotientText holds the quotient typed so far;
 * - local.promptHtml holds the instruction shown below the division.
 * htDivisionRender() rebuilds the table from this state in the selected layout.
 */
function htDivisionStepValue(row) {
    if (row % 2 === 0) {
        var step = (row - 2) / 2;
        if (step < local.steps.length) {
            return "-" + htAlignTextBeforeWrite(local.steps[step].product) + local.steps[step].product;
        }
        if (step === local.steps.length && local.preview !== null) {
            return "&nbsp;" + htAlignTextBeforeWrite(local.preview) + local.preview;
        }
        return "&nbsp;";
    }

    var remainderStep = (row - 3) / 2;
    if (remainderStep < local.steps.length) {
        return htAlignTextBeforeWrite(local.steps[remainderStep].remainder) + " " + local.steps[remainderStep].remainder;
    }

    return "&nbsp;";
}

function htDivisionStatusHtml() {
    if (local.medal) {
        return "<i class=\"fa-solid fa-medal\" style=\"font-size:240px;color:gold;\"></i>";
    }

    return local.promptHtml;
}

function htDivisionRenderBelowHtml() {
    var html = '<table id="yupana0">';
    html += '<tr><th colspan="2">Division</th><th colspan="2">Controls</th></tr>';

    html += '<tr id="tf1" class="trCanBeRemoved"><td id="tc1f1" style="border:none;"><span id="tc1fd1">&nbsp; ' + local.dividend + '</span></td>';
    html += '<td id="tc2f1" style="border:none;border-bottom: 2pt solid black; border-left: 2px solid black;"><span id="tc2fds1">' + local.divisor + '</span></td>';
    html += '<td id="tc5f1" rowspan="7"><i class="fa-solid fa-caret-up upArrowWithFA" id="traineeUp0" onclick="htDivisionUpdateValue(+1);"></i> </td>';
    html += '<td id="tc6f1" rowspan="7"><i class="fa-solid fa-caret-down downArrowWithFA" id="traineeDown0" onclick="htDivisionUpdateValue(-1);"></i></td></tr>';

    for (var row = 2; row <= 7; row++) {
        var border = ((row % 2)) ? "border:none;" : "border:none;border-bottom: 2pt solid black;";
        var quotient = (row === 2) ? local.quotientText : "&nbsp;";

        html += '<tr id="tf' + row + '" class="trCanBeRemoved"><td id="tc1f' + row + '" style="' + border + '">' + htDivisionStepValue(row) + '</td>';
        html += '<td id="tc2f' + row + '" style="border:none;"><span id="tc2fds' + row + '">' + quotient + '</span></td></tr>';
    }

    html += '<tr id="tf8" class="trCanBeRemoved"><td id="tc1f8" colspan="2">' + htDivisionStatusHtml() + '</td>';
    html += '<td id="tc5f8" style="background-color: white;" colspan="2"><i class="fa-solid fa-chevron-right" style="font-size:3.0em;" onclick="htNewDivision();"></i></td></tr>';
    html += '</table>';

    return html;
}

function htDivisionRenderTopHtml() {
    var html = '<table id="yupana0" class="htDivisionTopTable">';
    html += '<tr><td class="htDivisionTopStage">';
    html += '<table class="htLongDivisionTop" role="presentation">';

    var quotientHtml = local.quotientText;
    var quotientPadding = local.dividend.toString().length - local.quotientStart - local.quotientText.length;
    for (var pad = 0; pad < quotientPadding; pad++) {
        quotientHtml += '<span class="htLongDivisionPad">0</span>';
    }

    html += '<tr><td></td><td class="htLongDivisionQuotient">' + quotientHtml + '</td></tr>';
    html += '<tr><td class="htLongDivisionDivisor">' + local.divisor + '</td><td class="htLongDivisionDividend">' + local.dividend + '</td></tr>';

    for (var i = 0; i < local.steps.length; i++) {
        html += '<tr><td></td><td class="htLongDivisionStep htLongDivisionLine">-' + local.steps[i].product + '</td></tr>';
        html += '<tr><td></td><td class="htLongDivisionStep">' + local.steps[i].remainder + '</td></tr>';
    }

    if (local.preview !== null) {
        html += '<tr><td></td><td class="htLongDivisionStep">' + local.preview + '</td></tr>';
    }

    html += '</table>';
    html += '<span class="htDivisionTopArrows">';
    html += '<i class="fa-solid fa-caret-up upArrowWithFA" id="traineeUp0" onclick="htDivisionUpdateValue(+1);"></i> ';
    html += '<i class="fa-solid fa-caret-down downArrowWithFA" id="traineeDown0" onclick="htDivisionUpdateValue(-1);"></i>';
    html += '</span>';
    html += '</td></tr>';
    html += '<tr><td class="htDivisionTopPrompt">' + htDivisionStatusHtml() + '</td></tr>';
    html += '<tr><td class="htDivisionTopNext"><i class="fa-solid fa-chevron-right" style="font-size:3.0em;" onclick="htNewDivision();"></i></td></tr>';
    html += '</table>';

    return html;
}

function htDivisionRender() {
    var html = (htDivisionVisualization === "top") ? htDivisionRenderTopHtml() : htDivisionRenderBelowHtml();
    $("#yupana0").replaceWith(html);
}

function htDivisionSetVisualization(format) {
    htDivisionVisualization = (format === "top") ? "top" : "below";

    $(".htLongDivisionFormatBtn").each(function () {
        $(this).toggleClass("active", $(this).attr("data-htldformat") === htDivisionVisualization);
    });

    htDivisionRender();
}

function htUpdateView(end) {
    var localUse = local.divisor * local.workingValue;

    if (end) {
        var loopEnd = (local.idx < 6) ? local.working.toString().length : 1;
        if ((local.working - localUse) > local.divisor) {
            for (let i = localUse.toString().length; i < loopEnd; i++) {
                localUse *= 10;
            }
        }
        if ((local.working - localUse) < 0) {
            localUse = parseInt(localUse / 10);
        }

        local.steps.push({ "product": localUse, "remainder": local.working - localUse });
        local.working = local.working - localUse;
        local.preview = null;
    } else {
        local.preview = localUse;
    }

    htDivisionRender();
}

function htMoveDivAhead() {
    local.divisionStepsIdx++;
    var additionalText = "";

    local.results = local.results + local.stopValue.toString();

    if (local.divisionStepsIdx < local.divisionSteps.steps.length) {
        local.usingValue = local.divisionSteps.steps[local.divisionStepsIdx].value;
        local.stopValue = local.divisionSteps.steps[local.divisionStepsIdx].quotient;
    } else {
        if (local.quotientText != local.divisionSteps.quotient) {
            local.quotientText = local.quotientText + local.workingValue;
        }
        local.stop = true;
    }

    if (local.stop) {
        local.medal = true;
    } else {
        if (local.divisionSteps.steps[local.divisionStepsIdx].quotient == 0 &&  local.divisionSteps.steps[local.divisionStepsIdx].remainder != 0 && local.idx == 2) {
            additionalText = mathKeywords[37];
        }
        local.promptHtml = mathKeywords[35]+" <b>"+local.usingValue+" ÷ "+local.divisor+"</b><br />"+additionalText;
    }

    local.workingValue = 0;
    local.idx += 2;

    htDivisionRender();
}

function htDivisionUpdateValue(n)
{
    if (local.stop) {
        return false;
    }

    if (local.workingValue == local.stopValue) {
        htUpdateView(true);
        htMoveDivAhead();
        return false;
    }

    local.workingValue += parseInt(n);
    if (local.workingValue > 9) {
        local.workingValue = 9;
    } else if (local.workingValue < 0) {
        local.workingValue = 0;
    }

    local.quotientText = local.results + local.workingValue;

    if (local.workingValue == local.stopValue) {
        htUpdateView(true);
        htMoveDivAhead();
        return false;
    }

    htUpdateView(false);

    return false;
}

function htNewDivision() {
    local.results = "";
    local.workingValue = 0;
    local.idx = 2;
    local.divisionStepsIdx = 0;
    local.steps = [];
    local.preview = null;
    local.medal = false;
    var selector = $("#mtValues").val();

    local.working = local.dividend = htGetRandomArbitrary(10, 999);

    local.divisor = (selector == "-1") ? htGetRandomArbitrary(1, 9): parseInt(selector);

    $("#mParentN").html("");
    htWriteMultiplicationTable("#mParentN", local.divisor);

    local.divisionSteps = htLongDivision(local.dividend, local.divisor);
    var additionalText = "";
    if (local.divisionSteps.steps[local.divisionStepsIdx].quotient == 0) {
        additionalText = mathKeywords[36];
        local.divisionStepsIdx++;
    }
    local.usingValue = local.divisionSteps.steps[local.divisionStepsIdx].value;
    local.stopValue = local.divisionSteps.steps[local.divisionStepsIdx].quotient;
    local.quotientStart = local.divisionSteps.steps[local.divisionStepsIdx].value.toString().length - 1;
    local.quotientText = local.workingValue.toString();
    local.promptHtml = mathKeywords[37]+" <b>"+local.usingValue+" ÷ "+local.divisor+"</b><br />"+additionalText;

    local.stop = false;

    htDivisionRender();

    return false;
}

function htLoadContent() {
    local = { "working": 0, "stopValue": 0, "workingValue": 0, "divisor": 1, "usingValue": "", "idx": 2, "results": "", "dividend": 0, "stop": true, "divisionSteps": [], "divisionStepsIdx": 0, "steps": [], "preview": null, "quotientText": "0", "promptHtml": "", "medal": false, "quotientStart": 0 };

    htWriteNavigation();

    if ($("#mtValues").length > 0) {
        var data = [
            { text: '1', value: '1' },
            { text: '2', value: '2' },
            { text: '3', value: '3' },
            { text: '4', value: '4' },
            { text: '5', value: '5' },
            { text: '6', value: '7' },
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
            htNewDivision();
        });
    }

    $(document).off("click.htDivisionFormat").on("click.htDivisionFormat", ".htLongDivisionFormatBtn", function (event) {
        event.preventDefault();
        htDivisionSetVisualization($(this).attr("data-htldformat"));
        return false;
    });

    htNewDivision();
    return false;
}
