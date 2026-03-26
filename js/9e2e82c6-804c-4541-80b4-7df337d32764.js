// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htAlignTextBeforeWrite(val) {
    var space = "&nbsp;";
    var loopEnd = local.dividend.toString().length - val.toString().length;
    for (let i = 0; i  < loopEnd; i++) {
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

function htUpdateView(end) {
    var localUse = local.divisor * local.workingValue;

    var sign = "&nbsp;";
    if (end) {
        var loopEnd = 1;

        sign = "-";
        var loopEnd = (local.idx < 6) ? local.working.toString().length : 1;
        if ((local.working - localUse) > local.divisor) {
            for (let i = localUse.toString().length; i < loopEnd; i++) {
                localUse *= 10;
            }
        }
        if ((local.working - localUse) < 0) {
            localUse = parseInt(localUse / 10);
        }
    }

    var space = htAlignTextBeforeWrite(localUse);
    $("#tc1f"+local.idx).html(sign+""+space+""+localUse);
    if (end) {
        var res = local.idx + 1;

        local.working = local.working - localUse;
        space = htAlignTextBeforeWrite(local.working);

        $("#tc1f"+res).html(space+" "+local.working);
    }
}

function htMoveDivAhead() {
    local.divisionStepsIdx++;
    var additionalText = "";

    local.results = local.results + local.stopValue.toString();

    if (local.divisionStepsIdx < local.divisionSteps.steps.length) {
        local.usingValue = local.divisionSteps.steps[local.divisionStepsIdx].value;
        local.stopValue = local.divisionSteps.steps[local.divisionStepsIdx].quotient;
    } else {
        let curr = parseInt($("#tc2fds2").html());
        if (curr != local.divisionSteps.quotient) {
            $("#tc2fds2").html(curr+""+local.workingValue);
        }
        local.stop = true;
    }

    if (local.stop) {
        $("#tc1f8").html("<i class=\"fa-solid fa-medal\" style=\"font-size:240px;color:gold;\"></i>");
        return;
    } else {
        if (local.divisionSteps.steps[local.divisionStepsIdx].quotient == 0 &&  local.divisionSteps.steps[local.divisionStepsIdx].remainder != 0 && local.idx == 2) {
            additionalText = mathKeywords[37];
        }
        $("#tc1f8").html(mathKeywords[35]+" <b>"+local.usingValue+" ÷ "+local.divisor+"</b><br />"+additionalText);
    }

    local.workingValue = 0;
    local.idx += 2;
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

    $("#tc2fds2").html(local.results+local.workingValue);

    if (local.workingValue == local.stopValue) {
        htUpdateView(true);
        htMoveDivAhead();
        return false;
    }

    htUpdateView(false);

    return false;
}

function htNewDivision() {
    if (!local.stop || (local.idx > 7 && local.working > local.divisor)) {
        return false;
    }
    local.results = "";
    local.workingValue = 0;
    local.idx = 2;
    local.divisionStepsIdx = 0;
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

    for (let j = 2; j < 8; j++) {
        for (let i = 1; i < 2; i++) {
            $("#tc"+i+"f"+j).html("&nbsp;");
        }
    }

    $("#tc1fd1").html("&nbsp; "+local.working);
    $("#tc2fds1").html(local.divisor);

    $("#tc2fds2").html(local.workingValue);

    $("#tc1f8").html(mathKeywords[35]+" <b>"+local.usingValue+" ÷ "+local.divisor+"</b><br />"+additionalText);

    local.stop = false;

    return false;
}

function htDivisionAddCommonTable(id) {
    var end = 7;
    for (let i =1; i <= end; i++) {
        var controls = "";
        if (i == 1) {
            controls = "<td id=\"tc5f"+i+"\" rowspan=\""+end+"\"><i class=\"fa-solid fa-caret-up upArrowWithFA\" id=\"traineeUp"+id+"\" onclick=\"htDivisionUpdateValue(+1);\"></i> </td><td id=\"tc6f"+i+"\" rowspan=\""+end+"\"><i class=\"fa-solid fa-caret-down downArrowWithFA\" id=\"traineeDown"+id+"\" onclick=\"htDivisionUpdateValue(-1);\"></i></td>";
        }
        var border = ((i % 2)) ? "style=\"border:none;\"" : "style=\"border:none;border-bottom: 2pt solid black;\"";
        var border2 = (i != 1) ? "style=\"border:none;\"" : "style=\"border:none;border-bottom: 2pt solid black; border-left: 2px solid black;\"";
        $("#yupana"+id+" tr:last").after("<tr id=\"tf"+i+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+i+"\" "+border+"><span id=\"tc1fd"+i+"\">&nbsp;</span></td> <td id=\"tc2f"+i+"\" "+border2+" ><span id=\"tc2fds"+i+"\">&nbsp;</span></td>"+controls+"</tr>");
    }
}

function htDivisionDescRow(id) {
    var imgID = 8;
    $("#yupana"+id+" tr:last").after("<tr id=\"tf"+imgID+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+imgID+"\" colspan=\"2\"></td><td id=\"tc5f"+imgID+"\" style=\"background-color: white;\" colspan=\"2\"><i class=\"fa-solid fa-chevron-right\" style=\"font-size:3.0em;\" onclick=\"htNewDivision();\"></i></td></tr>");
}

function htLoadContent() {
    local = { "working": 0, "stopValue": 0, "workingValue": 0, "divisor": 1, "usingValue": "", "idx": 2, "results": "", "dividend": 0, "stop": true, "divisionSteps": [], "divisionStepsIdx": 0 }; 

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

    htDivisionAddCommonTable("0");
    htDivisionDescRow("0");

    htNewDivision();
    return false;
}
