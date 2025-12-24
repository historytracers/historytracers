// SPDX-License-Identifier: GPL-3.0-or-later

var working = 0;
var stopValue = 0;
var workingValue = 0;

var divisor = 1;
var usingValue = "";
var idx = 2;
var results = "&nbsp;";

var dividend = 0;
var strDividendValue = "";
var stop = true;

function htUpdateView(end) {
    var localUse = divisor * workingValue;

    var sign = "&nbsp; ";
    if (end) {
        var nextValue = dividend - localUse;
        //var loopEnd = (nextValue < divisor) ? nextValue.toString().length : working.toString().length;
        var loopEnd = working.toString().length;

        for (let i = localUse.toString().length; i < loopEnd; i++) {
            localUse *= 10;
        }
        sign = "- ";
    }

    $("#tc1f"+idx).html(sign+""+localUse);
    if (end) {
        var res = idx + 1;

        working = (idx == 2) ? dividend - localUse : working - localUse;
        if (working < divisor) {
            stop = true;
        }
        $("#tc1f"+res).html("&nbsp; "+working);
    }
}

function htMoveDivAhead() {
    results = results + stopValue.toString();
    strDividendValue = working.toString();

    // Check length also
    usingValue = (strDividendValue.length >= 2 && parseInt(strDividendValue[0]) < divisor) ? strDividendValue[0]+""+strDividendValue[1] : strDividendValue[0];
    stopValue = parseInt(parseInt(usingValue) / divisor);

    $("#tc1f8").html(mathKeywords[35]+" <b>"+usingValue+" ÷ "+divisor+"</b><br />"+mathKeywords[36]);
    workingValue = 0;

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

    $("#tc2f2").html(results+workingValue);

    if (workingValue == stopValue) {
        htUpdateView(true);
        htMoveDivAhead();
        return false;
    }

    htUpdateView(false);

    return false;
}

function htNewDivision() {
    if (!stop || idx > 7) {
        return false;
    }
    results = "&nbsp;";
    workingValue = 0;
    idx = 2;
    working = dividend = 63;
    //working = dividend = htGetRandomArbitrary(10, 999);
    strDividendValue = dividend.toString();

    //divisor = htGetRandomArbitrary(1, 9);
    divisor = 5;

    usingValue = (strDividendValue.length >= 2 && parseInt(strDividendValue[0]) < divisor) ? strDividendValue[0]+""+strDividendValue[1] : strDividendValue[0];
    stopValue = parseInt(parseInt(usingValue) / divisor);

    for (let j = 2; j < 7; j++) {
        for (let i = 1; i < 2; i++) {
            $("#tc"+i+"f"+j).html("&nbsp;");
        }
    }

    $("#tc1fd1").html("&nbsp; "+working);
    $("#tc2fds1").html(divisor);

    $("#tc2f2").html(workingValue);

    $("#tc1f8").html(mathKeywords[35]+" <b>"+usingValue+" ÷ "+divisor+"</b><br />"+mathKeywords[36]);

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

    htDivisionAddCommonTable("0");
    htDivisionDescRow("0");

    htNewDivision();
    return false;
}
