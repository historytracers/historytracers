// SPDX-License-Identifier: GPL-3.0-or-later

var working = 0;
var stopValue = 0;
var workingValue = 0;

var divisor = 1;
var usingValue = "";
var idx = 2;
var results = "";

var dividend = 0;
var stop = true;

var divisionSteps = [];
var divisionStepsIdx = 0;

function htAlignTextBeforeWrite(val) {
    var space = "&nbsp;";
    var loopEnd = dividend.toString().length - val.toString().length;
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
    var localUse = divisor * workingValue;

    var sign = "&nbsp;";
    if (end) {
        var loopEnd = 1;

        sign = "-";
        var loopEnd = (idx < 6) ? working.toString().length : 1;
        if ((working - localUse) > divisor) {
            for (let i = localUse.toString().length; i < loopEnd; i++) {
                localUse *= 10;
            }
        }
        if ((working - localUse) < 0) {
            localUse = parseInt(localUse / 10);
        }
    }

    var space = htAlignTextBeforeWrite(localUse);
    $("#tc1f"+idx).html(sign+""+space+""+localUse);
    if (end) {
        var res = idx + 1;

        working = working - localUse;
        space = htAlignTextBeforeWrite(working);

        $("#tc1f"+res).html(space+" "+working);
    }
}

function htMoveDivAhead() {
    divisionStepsIdx++;
    var additionalText = "";
    if (divisionStepsIdx < divisionSteps.steps.length) {
        results = results + stopValue.toString();

        if (divisionSteps.steps[divisionStepsIdx].quotient == 0) {
            if (divisionSteps.steps.length < (divisionStepsIdx + 1)) {
                divisionStepsIdx++;
            } else if (divisionStepsIdx == 1) {
                additionalText = mathKeywords[37];
            } else {
                additionalText = mathKeywords[36];
            }
            $("#tc2fds2").html(results+""+0);
        }

        usingValue = divisionSteps.steps[divisionStepsIdx].value;
        stopValue = divisionSteps.steps[divisionStepsIdx].quotient;
    } else {
        stop = true;
    }

    workingValue = 0;

    if (stop) {
        $("#tc1f8").html("<i class=\"fa-solid fa-medal\" style=\"font-size:240px;color:gold;\"></i>");
    } else {
        $("#tc1f8").html(mathKeywords[35]+" <b>"+usingValue+" ÷ "+divisor+"</b><br />"+additionalText);
    }

    if (idx == 2 && working < divisor && dividend > (divisor * 10)) {
        let curr = $("#tc2fds2").html();
        $("#tc2fds2").html(curr+"0");
    }

    idx += 2;
}

function htDivisionUpdateValue(n)
{
    if (stop) {
        return false;
    }

    if (workingValue == stopValue) {
        htUpdateView(true);
        htMoveDivAhead();
        return false;
    }

    workingValue += parseInt(n);
    if (workingValue > 9) {
        workingValue = 9;
    } else if (workingValue < 0) {
        workingValue = 0;
    }

    $("#tc2fds2").html(results+workingValue);

    if (workingValue == stopValue) {
        htUpdateView(true);
        htMoveDivAhead();
        return false;
    }

    htUpdateView(false);

    return false;
}

function htNewDivision() {
    if (!stop || (idx > 7 && working > divisor)) {
        return false;
    }
    results = "";
    workingValue = 0;
    idx = 2;
    working = dividend = htGetRandomArbitrary(10, 999);

    var selector = $("#mtValues").val();
    divisor = (selector == "-1") ? htGetRandomArbitrary(1, 9): parseInt(selector);

    $("#mParentN").html("");
    htWriteMultiplicationTable("#mParentN", divisor);

    divisionSteps = htLongDivision(dividend, divisor);
    var additionalText = "";
    if (divisionSteps.steps[divisionStepsIdx].quotient == 0) {
        additionalText = mathKeywords[36];
        divisionStepsIdx++;
    }
    usingValue = divisionSteps.steps[divisionStepsIdx].value;
    stopValue = divisionSteps.steps[divisionStepsIdx].quotient;

    for (let j = 2; j < 8; j++) {
        for (let i = 1; i < 2; i++) {
            $("#tc"+i+"f"+j).html("&nbsp;");
        }
    }

    $("#tc1fd1").html("&nbsp; "+working);
    $("#tc2fds1").html(divisor);

    $("#tc2fds2").html(workingValue);

    $("#tc1f8").html(mathKeywords[35]+" <b>"+usingValue+" ÷ "+divisor+"</b><br />"+additionalText);

    stop = false;

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
