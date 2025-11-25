// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

var reorganizedValue = [ ];
var cmpTopValue = [ ];

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

    var tot = tv - bv;
    if (tot < 0) {
        stopValue = (tv + 10) - bv;
        carriers = 1;
    } else {
        stopValue = tot;
    }
    workingValue = 0;
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

function htNewSubtraction() {
    currentTop = 0;
    currentBottom = 0;
    stop = 0;
    reorganizedValue = [];
    cmpTopValue = [ ];

    currentIdx = 4;
    vectorIdx = 2;

    for (let j = 1; j < 5; j++) {
        for (let i = 1; i < 4; i++) {
            $("#tc"+i+"f"+j).html("&nbsp;");
        }
    }
    $("#tc1f3").html("<span class=\"text_to_paint\">-</span>");

    topValue = htGetRandomArbitrary(100, 999);
    bottomValue =  htGetRandomArbitrary(100, 999);
    if (topValue < bottomValue) {
        var change = bottomValue;
        bottomValue = topValue;
        topValue = change;
    }

    strTopValue = topValue.toString();
    htWriteValueOnLine("2", strTopValue);

    strBottomValue = bottomValue.toString();
    htWriteValueOnLine("3", bottomValue.toString());

    totalValue = topValue - bottomValue;
    htWriteValueOnScreen("#tc"+currentIdx+"f4", 0);

    var finalText = mathKeywords[30]+" <b>"+topValue+" - "+bottomValue+"</b><br />"+mathKeywords[31]+"<b>("+strTopValue[vectorIdx]+" + "+strBottomValue[vectorIdx]+")</b>";

    var c = 10;
    var c1 = 1;
    var carr = 0;
    for (let i = 2; i >= 0; i--) {
        var tv = topValue % c;
        var bv = bottomValue % c;

        tv = parseInt(tv / c1);
        cmpTopValue.push(tv);
        bv = parseInt(bv / c1);
        if (carr == 1) {
            if (tv == 0) {
                tv = c1;
            } else {
                tv -= 1;
                carr = 0;
            }
        }
        let end = tv;
        if (carr && tv == 0) {
            end = 9;
            carr = 1;
        } else if (bv > tv) {
            end += 10;
            carr = 1;
        }
        reorganizedValue.push(end);

        c *= 10;
        c1 *= 10;
        topValue -= tv;
        bottomValue -= bv;
    }
    if (cmpTopValue[0] != reorganizedValue[0]) {
        finalText += "<br />"+mathKeywords[32];
    }
    htSetWorkingValue(reorganizedValue[0], strBottomValue[vectorIdx]);
    console.log(reorganizedValue);

    $("#tc1f5").html(finalText);
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
        var message = mathKeywords[31]+" <b>("+strTopValue[vectorIdx]+" - "+strBottomValue[vectorIdx]+")</b>";
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

function htSubtractionUpdateValue(n)
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
        htSubtractionUpdateValue(0);
    }

    return false;
}

function htAdditionAddCommonTable(id)
{
    var end = 4;
    for (let i =1; i <= end; i++) {
        var controls = "";
        if (i == 1) {
            controls = "<td id=\"tc5f"+i+"\" rowspan=\""+end+"\"><i class=\"fa-solid fa-caret-up upArrowWithFA\" id=\"traineeUp"+id+"\" onclick=\"htSubtractionUpdateValue(+1);\"></i> </td><td id=\"tc6f"+i+"\" rowspan=\""+end+"\"><i class=\"fa-solid fa-caret-down downArrowWithFA\" id=\"traineeDown"+id+"\" onclick=\"htSubtractionUpdateValue(-1);\"></i></td>";
        }
        var border = (i != 3) ? "style=\"border:none;\"" : "style=\"border:none;border-bottom: 1pt solid black;\"";
        $("#yupana"+id+" tr:last").after("<tr id=\"tf"+i+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+i+"\" "+border+">&nbsp;</td> <td id=\"tc2f"+i+"\" "+border+">&nbsp;</td> <td id=\"tc3f"+i+"\" "+border+">&nbsp;</td> <td id=\"tc4f"+i+"\" "+border+">&nbsp;</td>"+controls+"</tr>");
    }
}

function htAdditionDescRow(id)
{
    var imgID = 5;
    $("#yupana"+id+" tr:last").after("<tr id=\"tf"+imgID+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+imgID+"\" colspan=\"4\"></td><td id=\"tc5f"+imgID+"\" style=\"background-color: white;\" colspan=\"2\"><i class=\"fa-solid fa-chevron-right\" style=\"font-size:3.0em;\" onclick=\"htNewSubtraction();\"></i></td></tr>");
}

function htLoadContent() {
    htWriteNavigation();

    htAdditionAddCommonTable("0");
    htAdditionDescRow("0")

    htNewSubtraction();

    return false;
}
