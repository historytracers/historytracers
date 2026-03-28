// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htSetWorkingValue(topValue, bottomValue)
{
    var tv = parseInt(topValue);
    var bv = parseInt(bottomValue);

    local.stopValue = tv - bv;
    local.workingValue = 0;
}

function htWriteValueOnScreen(cell, value, possibleOverline)
{
    var localClass = (local.carriers && possibleOverline) ? "text_to_paint_overline" : "text_to_paint";
    $(cell).html("<span class=\""+localClass+"\">"+value+"</span>");
}

function htWriteValueOnLine(line, value, possibleOverline)
{
    for (let i = 0, j = 2; i < 3; i++, j++) {
        htWriteValueOnScreen("#tc"+j+"f"+line, value[i], possibleOverline);
    }
}

function htNewSubtraction() {
    if (!local.stop) {
        return false;
    }

    local.currentTop = 0;
    local.currentBottom = 0;
    local.stop = 0;
    local.reorganizedValue = [];
    local.cmpTopValue = [ ];

    local.currentIdx = 4;
    local.vectorIdx = 2;
    local.carriers = 0;

    for (let j = 1; j < 5; j++) {
        for (let i = 1; i < 5; i++) {
            $("#tc"+i+"f"+j).html("&nbsp;");
        }
    }
    $("#tc1f3").html("<span class=\"text_to_paint\">-</span>");

    local.topValue = htGetRandomArbitrary(100, 999);
    local.bottomValue =  htGetRandomArbitrary(100, 999);

    if (local.topValue < local.bottomValue) {
        let change = local.bottomValue;
        local.bottomValue = local.topValue;
        local.topValue = change;
    }

    local.strTopValue = local.topValue.toString();

    local.strBottomValue = local.bottomValue.toString();

    local.totalValue = local.topValue - local.bottomValue;
    htWriteValueOnScreen("#tc"+local.currentIdx+"f4", 0, false);

    var c = 10;
    var c1 = 1;
    var carr = 0;
    var workTopValue = local.topValue;
    var workBottomValue = local.bottomValue;
    for (let i = 2; i >= 0; i--) {
        var tv = workTopValue % c;
        var bv = workBottomValue % c;

        tv = parseInt(tv / c1);
        local.cmpTopValue.push(tv);
        bv = parseInt(bv / c1);
        if (carr == 1) {
            if (i != 0) {
                if (tv == 0) {
                    tv = c1;
                } else {
                    tv -= 1;
                    carr = 0;
                }
            } else {
                tv -= 1;
            }
        }
        let end = tv;
        if (carr && tv == 10) {
            end = 9;
            carr = 1;
            local.carriers = 1;
        } else if (bv > tv) {
            end += 10;
            carr = 1;
            local.carriers = 1;
        }

        if (end == 10 && i == 0) {
            end = 1;
        }
        local.reorganizedValue.push(end);

        c *= 10;
        c1 *= 10;
        workTopValue -= tv;
        workBottomValue -= bv;
    }
    local.reorganizedValue.reverse();
    local.cmpTopValue.reverse();
    var finalText = mathKeywords[30]+" <b>"+local.topValue+" - "+local.bottomValue+"</b><br />"+mathKeywords[31]+"<b>("+local.reorganizedValue[local.vectorIdx]+" - "+local.strBottomValue[local.vectorIdx]+")</b>";
    if (local.carriers) {
        for (let i = local.vectorIdx, j = local.currentIdx; i >= 0; i--, j--) {
            htWriteValueOnScreen("#tc"+j+"f1", local.reorganizedValue[i], false);
        }
        if (local.reorganizedValue[local.vectorIdx] > local.cmpTopValue[local.vectorIdx]) {
            finalText += "<br />"+mathKeywords[32];
        }
    }
    htSetWorkingValue(local.reorganizedValue[local.vectorIdx], local.strBottomValue[local.vectorIdx]);

    htWriteValueOnLine("2", local.strTopValue, true);
    htWriteValueOnLine("3", local.strBottomValue, false);
    $("#tc1f5").html(finalText);
}

function htMoveAhead()
{
    if (local.stop == 1) {
        return false;
    }

    htWriteValueOnScreen("#tc"+local.currentIdx+"f4", local.workingValue, false);
    local.currentIdx -= 1;
    local.vectorIdx -= 1;
    if (local.currentIdx > 1) {
        htWriteValueOnScreen("#tc"+local.currentIdx+"f4", 0, false);
    } else {
        local.stop = 1;
    }

    var bottomV = parseInt(local.strBottomValue[local.vectorIdx]);
    if (local.cmpTopValue[local.vectorIdx] != local.reorganizedValue[local.vectorIdx]) {
        htWriteValueOnScreen("#tc"+local.currentIdx+"f1", local.reorganizedValue[local.vectorIdx], false);
    }

    if (!local.stop) {
        var message = mathKeywords[31]+" <b>("+local.reorganizedValue[local.vectorIdx]+" - "+local.strBottomValue[local.vectorIdx]+")</b>";
        if (local.carriers) {
            if (local.reorganizedValue[local.vectorIdx] > local.cmpTopValue[local.vectorIdx]) {
                message += "<br />"+mathKeywords[32];
            }
        }
        $("#tc1f5").html(message);
        htSetWorkingValue(local.reorganizedValue[local.vectorIdx], bottomV.toString());
    } else {
        $("#tc1f5").html("<i class=\"fa-solid fa-medal\" style=\"font-size:240px;color:gold;\"></i>");
    }

    return false;
}

function htSubtractionUpdateValue(n)
{
    if (local.currentIdx < 1) {
        return false;
    }

    if (local.workingValue == local.stopValue) {
        htMoveAhead();
        return;
    }

    local.workingValue += n;

    if (local.workingValue > 9) {
        local.workingValue = 9;
    }  else if (local.workingValue < 0) {
        local.workingValue = 0;
    }  
    htWriteValueOnScreen("#tc"+local.currentIdx+"f4", local.workingValue, false);

    if (local.workingValue == local.stopValue) {
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
    local = { "strTopValue": "", "topValue": 0, "strBottomValue": "", "bottomValue": 0, "totalValue": 0, "carriers": 0, "workingValue": 0, "stopValue": 0, "currentTop": 0, "currentBottom": 0, "currentIdx": 4, "vectorIdx": 2, "stop": 1, "reorganizedValue": [], "cmpTopValue": [], "answerVector": undefined }; 

    htWriteNavigation();

    htAdditionAddCommonTable("0");
    htAdditionDescRow("0")

    htNewSubtraction();

    return false;
}
