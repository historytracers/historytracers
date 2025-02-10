// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector687a38b5 = undefined;

var strTopValue = "";
var topValue = 0;

var strBottomValue = "";
var bottomValue = 0;

var totalValue = 0;
var carriers = 0;
var workingValue = 0;
var stopValue = 0;

var currentTop = 0;
var currentBottom = 0;
var currentIdx = 4;
var vectorIdx = 2;
var stop = 0;

function htSetWorkingValue(topValue, bottomValue)
{
    var tv = parseInt(topValue);
    var bv = parseInt(bottomValue);

    var tot = tv + bv;
    if (tot < 10) {
        stopValue = tot;
        carriers = 0;
    } else {
        stopValue = tot - 10;
        carriers = 1;
    }
    workingValue = 0;
}

function htNewAddition() {
    currentTop = 0;
    currentBottom = 0;
    stop = 0;

    currentIdx = 4;
    vectorIdx = 2;

    for (let j = 1; j < 5; j++) {
        for (let i = 1; i < 4; i++) {
            $("#tc"+i+"f"+j).html("&nbsp;");
        }
    }
    $("#tc1f3").html("<span class=\"text_to_paint\">+</span>");

    topValue = getRandomArbitrary(100, 999);
    strTopValue = topValue.toString();
    htWriteValueOnLine("2", strTopValue);

    bottomValue =  getRandomArbitrary(100, 999);
    strBottomValue = bottomValue.toString();
    htWriteValueOnLine("3", bottomValue.toString());
    $("#tc1f5").html(mathKeywords[11]+" <b>"+topValue+" + "+bottomValue+"</b><br />"+mathKeywords[12]+"<b>("+strTopValue[vectorIdx]+" + "+strBottomValue[vectorIdx]+")</b>");

    totalValue = topValue + bottomValue;
    htSetWorkingValue(strTopValue[vectorIdx], strBottomValue[vectorIdx]);
    htWriteValueOnScreen("#tc"+currentIdx+"f4", 0);
}

function htAdditionDescRow(id)
{
    var imgID = 5;
    $("#yupana"+id+" tr:last").after("<tr id=\"tf"+imgID+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+imgID+"\" colspan=\"4\"></td><td id=\"tc5f"+imgID+"\" style=\"background-color: white;\" colspan=\"2\"><i class=\"fa-solid fa-chevron-right\" style=\"font-size:3.0em;\" onclick=\"htNewAddition();\"></i></td></tr>");
}

function htWriteValueOnScreen(cell, value)
{
    $(cell).html("<span class=\"text_to_paint\">"+value+"</span>");
}

function htWriteValueOnLine(line, value)
{
    for (let i = 0, j = 2; i < 3; i++, j++) {
        htWriteValueOnScreen("#tc"+j+"f"+line, value[i]);
    }
}

function htMoveAhead()
{
    if (stop == 1) {
        return false;
    }

    htWriteValueOnScreen("#tc"+currentIdx+"f4", workingValue);
    currentIdx -= 1;
    vectorIdx -= 1;
    if (currentIdx > 1) {
        htWriteValueOnScreen("#tc"+currentIdx+"f4", 0);
    } else {
        stop = 1;
    }

    var bottomV = parseInt(strBottomValue[vectorIdx])+ carriers;
    if (carriers == 1) {
        htWriteValueOnScreen("#tc"+currentIdx+"f1", carriers);
    }

    if (!stop) {
        var message = mathKeywords[12]+" <b>("+strTopValue[vectorIdx]+" + "+strBottomValue[vectorIdx];
        if (carriers) {
            message += ") + "+carriers+"</b><br />"+mathKeywords[13];
        } else {
            message += ")</b>";
        }
        $("#tc1f5").html(message);
        htSetWorkingValue(strTopValue[vectorIdx], bottomV.toString());
    } else {
        $("#tc1f5").html("<i class=\"fa-solid fa-medal\" style=\"font-size:240px;color:gold;\"></i>");
        if (stop && carriers) {
            htWriteValueOnScreen("#tc1f1", carriers);
        }
        if (carriers) {
            htWriteValueOnScreen("#tc1f4", 1);
        }
    }

    return false;
}

function htAdditionUpdateValue(n)
{
    if (currentIdx < 1) {
        return false;
    }

    if (workingValue == stopValue) {
        htMoveAhead();
        return;
    }

    workingValue += n;

    if (workingValue > 9) {
        workingValue = 9;
    }  else if (workingValue < 0) {
        workingValue = 0;
    }  
    htWriteValueOnScreen("#tc"+currentIdx+"f4", workingValue);

    if (workingValue == stopValue) {
        htAdditionUpdateValue(0);
    }

    return false;
}

function htAdditionAddCommonTable(id)
{
    var end = 4;
    for (let i =1; i <= end; i++) {
        var controls = "";
        if (i == 1) {
            controls = "<td id=\"tc5f"+i+"\" rowspan=\""+end+"\"><i class=\"fa-solid fa-caret-up upArrowWithFA\" id=\"traineeUp"+id+"\" onclick=\"htAdditionUpdateValue(+1);\"></i> </td><td id=\"tc6f"+i+"\" rowspan=\""+end+"\"><i class=\"fa-solid fa-caret-down downArrowWithFA\" id=\"traineeDown"+id+"\" onclick=\"htAdditionUpdateValue(-1);\"></i></td>";
        }
        var border = (i != 3) ? "style=\"border:none;\"" : "style=\"border:none;border-bottom: 1pt solid black;\"";
        $("#yupana"+id+" tr:last").after("<tr id=\"tf"+i+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+i+"\" "+border+">&nbsp;</td> <td id=\"tc2f"+i+"\" "+border+">&nbsp;</td> <td id=\"tc3f"+i+"\" "+border+">&nbsp;</td> <td id=\"tc4f"+i+"\" "+border+">&nbsp;</td>"+controls+"</tr>");
    }
}

function htLoadExercise() {
    if (localAnswerVector687a38b5 == undefined) {
        localAnswerVector687a38b5 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector687a38b5);
    }

    htWriteNavigation("first_steps");

    $(".sumexample1").hover(function(){
        var id = $(this).attr("id");
        if (id == undefined || id.length < 5) {
            return;
        }
        var idx = id[4];
        if (idx > 5) {
            $("#cmoc"+idx).css("color", "red");
        }
        $("#cmtc"+idx).css("color", "red");
        $("#cmbc"+idx).css("color", "red");
        $("#cmrc"+idx).css("color", "red");
    }, function(){
        var id = $(this).attr("id");
        if (id == undefined || id.length < 5) {
            return;
        }
        var idx = id[4];
        if (idx > 5) {
            $("#cmoc"+idx).css("color", "black");
        }
        $("#cmtc"+idx).css("color", "black");
        $("#cmbc"+idx).css("color", "black");
        $("#cmrc"+idx).css("color", "black");
    });

    htAdditionAddCommonTable("0");
    htAdditionDescRow("0")
    htNewAddition();

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector687a38b5 != undefined) {
        for (let i = 0; i < localAnswerVector687a38b5.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector687a38b5[i], "#answer"+i, "#explanation"+i);
        }
    }
}

