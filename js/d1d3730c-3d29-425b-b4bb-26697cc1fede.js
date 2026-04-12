// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htSetWorkingValue(topValue, bottomValue)
{
    var tv = parseInt(topValue);
    var bv = parseInt(bottomValue);

    var tot = tv + bv;
    if (tot < 10) {
        local.stopValue = tot;
        local.carriers = 0;
    } else {
        local.stopValue = tot - 10;
        local.carriers = 1;
    }
    local.workingValue = 0;
}

function htWriteValueOnScreen(cell, value)
{
    $(cell).html("<span class=\"text_to_paint\">"+value+"</span>");
}

function htWriteValueOnLine(line, value)
{
    for (let i = 0, j = 2; i < 3; i++, j++) {
        let val = (j == 2) ? "- ": "";
        val += value[i];
        htWriteValueOnScreen("#tc"+j+"f"+line, val);
    }
}

function htNewAddition() {
    if (!local.stop) {
        return false;
    }
    local.currentTop = 0;
    local.currentBottom = 0;
    local.stop = 0;

    local.currentIdx = 4;
    local.vectorIdx = 2;

    for (let j = 1; j < 5; j++) {
        for (let i = 1; i < 4; i++) {
            $("#tc"+i+"f"+j).html("&nbsp;");
        }
    }
    $("#tc1f3").html("<span class=\"text_to_paint\">+</span>");

    local.topValue = htGetRandomArbitrary(100, 999);
    local.strTopValue = local.topValue.toString();
    htWriteValueOnLine("2", local.strTopValue);

    local.bottomValue =  htGetRandomArbitrary(100, 999);
    local.strBottomValue = local.bottomValue.toString();
    htWriteValueOnLine("3", local.bottomValue.toString());
    $("#tc1f5").html(mathKeywords[11]+" <b>-"+local.topValue+" + -"+local.bottomValue+".</b><br />"+mathKeywords[12]+"<b>("+local.strTopValue[local.vectorIdx]+" + "+local.strBottomValue[local.vectorIdx]+").</b>");

    local.totalValue = local.topValue + local.bottomValue;
    htSetWorkingValue(local.strTopValue[local.vectorIdx], local.strBottomValue[local.vectorIdx]);
    htWriteValueOnScreen("#tc"+local.currentIdx+"f4", 0);
}

function htMoveAhead()
{
    if (local.stop == 1) {
        return false;
    }

    htWriteValueOnScreen("#tc"+local.currentIdx+"f4", local.workingValue);
    local.currentIdx -= 1;
    local.vectorIdx -= 1;
    if (local.currentIdx > 1) {
        htWriteValueOnScreen("#tc"+local.currentIdx+"f4", 0);
    } else {
        local.stop = 1;
    }

    var bottomV = parseInt(local.strBottomValue[local.vectorIdx])+ local.carriers;
    if (local.carriers == 1) {
        htWriteValueOnScreen("#tc"+local.currentIdx+"f1", local.carriers);
    }

    if (!local.stop) {
        var message = mathKeywords[12]+" <b>("+local.strTopValue[local.vectorIdx]+" + "+local.strBottomValue[local.vectorIdx];
        if (local.carriers) {
            message += ") + "+local.carriers+".</b><br />"+mathKeywords[13];
        } else {
            message += ").</b>";
        }
        $("#tc1f5").html(message);
        htSetWorkingValue(local.strTopValue[local.vectorIdx], bottomV.toString());
    } else {
        $("#tc1f5").html("<i class=\"fa-solid fa-medal\" style=\"font-size:240px;color:gold;\"></i>");
        if (local.stop && local.carriers) {
            htWriteValueOnScreen("#tc1f1", local.carriers);
        }
        if (local.carriers) {
            htWriteValueOnScreen("#tc1f4", -1);
        } else {
            htWriteValueOnScreen("#tc2f4", "- "+local.workingValue);
        }
    }

    return false;
}

function htAdditionUpdateValue(n)
{
    if (local.currentIdx < 1) {
        return false;
    }

    if (local.workingValue == local.stopValue) {
        htMoveAhead();
        return false;
    }

    local.workingValue += n;

    if (local.workingValue > 9) {
        local.workingValue = 9;
    }  else if (local.workingValue < 0) {
        local.workingValue = 0;
    }  
    htWriteValueOnScreen("#tc"+local.currentIdx+"f4", local.workingValue);

    if (local.workingValue == local.stopValue) {
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

function htAdditionDescRow(id)
{
    var imgID = 5;
    $("#yupana"+id+" tr:last").after("<tr id=\"tf"+imgID+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+imgID+"\" colspan=\"4\"></td><td id=\"tc5f"+imgID+"\" style=\"background-color: white;\" colspan=\"2\"><i class=\"fa-solid fa-chevron-right\" style=\"font-size:3.0em;\" onclick=\"htNewAddition();\"></i></td></tr>");
}

function htLoadContent() {
    local = { "strTopValue": "", "topValue": 0, "strBottomValue": "", "bottomValue": 0, "totalValue": 0, "carriers": 0, "workingValue": 0, "stopValue": 0, "currentTop": 0, "currentBottom": 0, "currentIdx": 4, "vectorIdx": 2, "stop": 1 }; 

    htWriteNavigation();

    htAdditionAddCommonTable("0");
    htAdditionDescRow("0")

    htNewAddition();

    return false;
}
