// SPDX-License-Identifier: GPL-3.0-or-later

var yupanaSelectors = [ -1,  4,  3,  2,  4,  1,  1,  1, 1,  1,
                        -1, -1, -1, -1,  2, -1,  4,  3, 2,  2,
                        -1, -1, -1, -1, -1, -1, -1, -1, -1, 4];

var yupanaClasses = [ "red_dot_right_up", "red_dot_right_up_1", "red_dot_right_up_2", "red_dot_right_up_3", "red_dot_right_up_4", "red_dot_right_bottom", "red_dot_right_bottom_1", "red_dot_right_bottom_2", "red_dot_right_bottom_3", "red_dot_right_bottom_4"];

// https://stackoverflow.com/questions/11182924/how-to-check-if-javascript-object-is-json
var mathVectorConstructor = [].constructor;

function htSplitDecimalDigit(output, maxIdx, value, base)
{
    while (value != 0) {
        var rest = value % base;
        value = Math.trunc(value / base);
        $(output+""+maxIdx).html(rest);
        maxIdx--;
    }
}

function htWriteYupanaValuesOnHTMLTable(outputColumnID, tableID, values)
{
    if (values == undefined) {
        return;
    }
    for (let i = 0, bottom2top = values.length; i < values.length; i++, bottom2top--) {
        $(tableID+" "+outputColumnID+bottom2top).html(values[i]);
    }
}

function htFillYupanaDecimalOperator(tableID, columnID, rows, op)
{
    for (let i = 1; i <= rows; i++) {
        $(tableID+" "+columnID+i).html(op);
    }
}

function htFillYupanaDecimalValues(tableID, dividend, rows, dotClass)
{
    var ret = []
    if (dividend == undefined) {
        return undefined;
    }

    if (dividend.constructor === chartVectorConstructor) {
        var multiplier = 1;
        var total = 0;
        for (let i = 0; i < dividend.length ; i++) {
            total += dividend[i] * multiplier;
            multiplier *= 10;
        }
        dividend = total;
    } else {
        var localMax = 10**rows;
        if (dividend > localMax || dividend < 0) {
            dividend = 0;
        }

        if (dividend > 0 ) {
            var start = 10 ** (rows - 1);
            var fillzero = 0;
            while (start > dividend) {
                start /= 10;
                fillzero++;
            }
        } else {
            fillzero = rows;
        }
    }

    var bottom2top = rows;
    var dots = 0;
    while (dividend != 0) {
        var rest = dividend % 10;
        dividend = Math.trunc(dividend / 10);
        ret.push(rest);
        

        for (let sel = rest ; sel < 30; sel += 10) {
            if (yupanaSelectors[sel] < 0 ) {
                continue;
            }

            var idx = yupanaSelectors[sel];
            $(tableID+" #tc"+idx+"f"+bottom2top).append("<span id=\"marktc"+dots+"\" class=\"dot circValues "+dotClass+"\"></span>");
        }
        bottom2top--;
    }

    for (let i = 0; i < fillzero; i++) {
        ret.push(0);
    }

    return ret;
}

function htFillYupanaValues(tableID, dividend, rows, outputColumnID, dotClass)
{
    var values = htFillYupanaDecimalValues(tableID, dividend, rows, dotClass);
    htWriteYupanaValuesOnHTMLTable(outputColumnID, tableID, values);
}

function htCleanYupanaAdditionalColumn(tableID, rows, outputColumnID)
{
    for (let i = 1; i <= rows; i++) {
        $(tableID+" "+outputColumnID+i).html(" ");
    }
}

function htCleanYupanaDecimalValues(tableID, rows)
{
    $(tableID).find(".circValues").remove();
}

function htSumYupanaVectors(larr, rarr)
{
    if (larr.length != rarr.length) {
        return;
    }

    var totals = [];

    var rarr_work = rarr.slice();
    for (let i = 0, bottom2top = larr.length; i < larr.length ; i++, bottom2top--) {
        var result = larr[i] + rarr_work[i];
        if (result >= 10) {
            if (i + 1 < larr.length) {
                rarr_work[i+1] += 1;
            }
            result -= 10;
        }
        totals.push(result);
    }

    return totals;
}

function htWriteYupanaEquals(txtIdx)
{
    var text = "<i>"+mathKeywords[txtIdx]+"</i><br /><i>"+mathKeywords[2]+"</i><br />";
    return text;
}

function htWriteSumOnYupana(lValue, rValue, result)
{
    var text = "";
    if (lValue == rValue) {
        switch (lValue) {
            case 1:
                text = "<i>"+mathKeywords[3]+"</i><br />";
                break;
            case 4:
                text = "<i>"+mathKeywords[1]+"</i><br />";
                text += "<i>"+mathKeywords[3]+"</i><br />";
            case 2:
                text = "<i>"+mathKeywords[0]+"</i><br />";
                break;
            case 3:
                text = "<i>"+mathKeywords[1]+"</i><br />";
                break;
            case 5:
                text = "<i>"+mathKeywords[2]+"</i><br />";
                break;
            case 6:
                text = htWriteYupanaEquals(3);
                break;
            case 7:
                text = htWriteYupanaEquals(0);
                break;
            case 8:
                text = htWriteYupanaEquals(1);
                break;
            case 9:
                text += "<i>"+mathKeywords[1]+"</i><br />"
                text += "<i>"+mathKeywords[3]+"</i><br />"
                text += "<i>"+mathKeywords[2]+"</i><br />"
            default:
                break;
        }
    } else if (lValue != 0 && rValue != 0) {
        var bigger = false;
        if (result > 10) {
            text = "<i>"+mathKeywords[2]+"</i><br />";
            result = result % 10; 
            bigger = true;
        }

        switch (result) {
            case 2:
            case 3:
                if (bigger == true) {
                    text = "<i>"+mathKeywords[1]+"</i><br />"+"<i>"+mathKeywords[3]+"</i><br />"+text;
                }
                else if (bigger == false && result == 3) {
                    text = "<i>"+mathKeywords[4]+"</i><br />";
                }
                break;
            case 7:
                if (bigger) {
                    text = "<i>"+mathKeywords[1]+"</i><br />"+"<i>"+mathKeywords[3]+"</i><br />"+text;
                } else {
                    if (lValue == 4 || rValue == 4) {
                        text += "<i>"+mathKeywords[1]+"</i><br />"
                    }
                    else if (lValue == 5 || rValue == 5) { 
                        text = mathKeywords[5]+"<br />";
                        break;
                    }
                    text += "<i>"+mathKeywords[3]+"</i><br />"
                }
                break;
            case 4:
                text = mathKeywords[5]+"<br />";
                break;
            case 5:
                if (bigger) {
                    text = "<i>"+mathKeywords[3]+"</i><br />"+"<i>"+mathKeywords[4]+"</i><br />"+text;
                } else {
                    if (lValue == 4 || rValue == 4) {
                        text = "<i>"+mathKeywords[3]+"</i><br />";
                    }
                    text += "<i>"+mathKeywords[4]+"</i><br />";
                }
                break;
            case 1:
            case 6:
                if (bigger) {
                    text = "<i>"+mathKeywords[4]+"</i><br />"+"<i>"+mathKeywords[1]+"</i><br />"+text;
                } else {
                    if (lValue == 4 || rValue == 4) {
                        text = "<i>"+mathKeywords[4]+"</i><br />"+"<i>"+mathKeywords[1]+"</i><br />";
                    }
                }
                break;
            case 9:
                if (lValue == 7 || rValue == 7) {
                    text += "<i>"+mathKeywords[0]+"</i><br />"
                }
                break;
            case 10:
                if (lValue == 9 || rValue == 9) {
                    text += "<i>"+mathKeywords[3]+"</i><br /><i>"+mathKeywords[4]+"</i><br />";
                }
                else if (lValue == 8 || rValue == 8) {
                    text += "<i>"+mathKeywords[4]+"</i><br />";
                }
                else if (lValue == 7 || rValue == 7) {
                    text += "<i>"+mathKeywords[4]+"</i><br />";
                }
                else if (lValue == 6 || rValue == 6) {
                    text += "<i>"+mathKeywords[3]+"</i><br /><i>"+mathKeywords[4]+"</i><br />";
                }
                text += mathKeywords[2]+"</i><br />"
                break;
            case 8:
                if (bigger == false) {
                    if (lValue == 7 || rValue == 7) {
                        text += "<i>"+mathKeywords[4]+"</i><br />";
                    }
                    else if (lValue == 6 || rValue == 6) {
                        text += "<i>"+mathKeywords[4]+"</i><br />";
                    } else {
                        text = mathKeywords[5]+"<br />";
                    }
                }
            default:
                break;
        }
    }

    if (text.length == 0) {
        text = mathKeywords[5]+"<br />";
    }

    return text;
}

function htWriteYupanaSumMovement(larr, rarr, tableID, rows, resultID)
{
    if (larr.length != rarr.length) {
        return;
    }

    var rarr_work = rarr.slice();
    var text = "";
    for (let i = 0, j = larr.length; i < larr.length; i++, j--) {
        var result = parseInt(larr[i]) + parseInt(rarr_work[i]);
        if (result >= 10) {
            if (i + 1 < larr.length) {
                rarr_work[i+1] += 1;
            }
        }

        text += i+") "+larr[i] +" + "+rarr_work[i]+" = "+result+":<br />";
        text += htWriteSumOnYupana(larr[i], rarr_work[i], result);
    }
    $(tableID+" "+resultID).html(text);
}

function htFillYupanaDecimalValuesWithRepetition(tableID, value, times, rows, dotClasses)
{
    var ret = [];
    for (let i = 0; i < times; i++) {
        ret = htFillYupanaDecimalValues(tableID, value, rows, dotClasses[i]);
    }

    if (!times || !value) {
        ret = htFillYupanaDecimalValues(tableID, value, rows, dotClasses[0]);
    }

    return ret;
}

function htMultMakeMultiplicationTableText(lValue, times, tableID, cellID)
{
    var text = "";
    if (lValue == 0 || times == 0) {
        text = lValue + " x "+times+": <br />"+mathKeywords[5]+"<br />";
    } else {
        var ret = [];
        var cValue = parseInt(0);
        for (let i = 1; i <= times; i++) {
            var result = lValue * i;
            text += i+") "+cValue +" + "+lValue+" = "+result+":<br />";
            text += htWriteSumOnYupana(cValue, lValue, result);
            cValue += parseInt(lValue);
        }
    }

    $(tableID+" "+cellID).html(text);
}

function htYupanaDrawFirstSquare()
{
    return "<span class=\"dot five_dot_c1_up\"></span><span class=\"dot five_dot_c1_center\"></span><span class=\"dot five_dot_c1_bottom\"></span><span class=\"dot five_dot_c2_up\"></span><span class=\"dot five_dot_c2_bottom\"></span>";
}

function htYupanaDrawSecondSquare()
{
    return "<span class=\"dot three_dot_bottom\"></span><span class=\"dot three_dot_up\"></span><span class=\"dot three_dot_center\"></span>";
}

function htYupanaDrawThirdSquare()
{
    return "<span class=\"dot two_dot_bottom\"></span> <span class=\"dot two_dot_up\"></span>";
}

function htYupanaDrawFourthSquare()
{
    return "<span class=\"dot dot_center\"></span>";
}

function htYupanaAddRow(row)
{
    return "<tr id=\"tf"+row+"\"><td id=\"tc1f"+row+"\">"+htYupanaDrawFirstSquare()+"</td> <td id=\"tc2f"+row+"\">"+htYupanaDrawSecondSquare()+"</td> <td id=\"tc3f"+row+"\">"+htYupanaDrawThirdSquare()+"</td> <td id=\"tc4f"+row+"\">"+htYupanaDrawFourthSquare()+"</td></tr>";
}

function htCompleteMesoamericanCalendar(vector)
{
    var len = 8 - vector.length;
    if (len < 0) {
        return vector;
    }

    for (let i = 0 ; i < len; i++) {
        vector.unshift(0);
    }

    return vector;
}

function htFillMesoamericanCalendar(periods, outputColumn)
{
    for (let i = 0, top2bottom = 1; i < periods.length; i++, top2bottom++) {
        $("#tmc"+outputColumn+"l"+top2bottom).html(periods[i]);
        $("#tmc1l"+top2bottom).attr('src', 'images/HistoryTracers/Maya_'+periods[i]+'.png');
    }
}

function htFillMesoamericanVigesimalValues(dividend, rows, outputColumn, decimalColumn)
{
    var localMax = 20**rows;
    if (dividend > localMax || dividend < 0) {
        dividend = 0;
    }

    var start = 20 ** (rows - 1);
    var top2bottom = 1;
    while (start > dividend) {
        if (decimalColumn != undefined) {
            $("#tmc"+decimalColumn+"l"+top2bottom).html(0);
        }
        $("#tmc"+outputColumn+"l"+top2bottom).attr('src', 'images/HistoryTracers/Maya_0.png');
        start /= 20;
        top2bottom++;
    }

    var bottom2top = rows;
    while (dividend != 0) {
        var rest = dividend % 20;
        dividend = Math.trunc(dividend / 20);
        if (decimalColumn != undefined) {
            $("#tmc"+decimalColumn+"l"+bottom2top).html(rest);
        }
        $("#tmc"+outputColumn+"l"+bottom2top).attr('src', 'images/HistoryTracers/Maya_'+rest+'.png');
        
        bottom2top--;
    }
}

function htCleanMesoamericanVigesimalValues(rows, outputColumn)
{
    for (let i = 1; i <= rows; i++) {
        if (outputColumn != null) {
            $("#tmc"+outputColumn+"l"+i).html(" ");
        }
        $("#tmc1l"+i).attr('src', '');
    }
}

function htModifyArrow(classObj, value)
{
    if (value < 0 || value > 9) {
        $(classObj).css('display','none');
        $(classObj).css('visibility','hidden');
    } else {
        $(classObj).css('display','block');
        $(classObj).css('visibility','visible');
    }

    if (value < 0)
        value = 0;
    else if (value > 9)
        value = 9;

    return value;
}

function htSetImageForMembers(leftMember, leftImgSuffix, rightMember, rightImgSuffix, value)
{
    if (value > 10) {
        return;
    }

    var leftValue;
    var rightValue;
    if (value > 5) {
        rightValue = 5;
        leftValue = value - rightValue;
    } else {
        rightValue = value;
        leftValue = 0;
    }

    $(leftMember).attr('src', 'images/'+leftValue+leftImgSuffix);
    $(rightMember).attr('src', 'images/'+rightValue+rightImgSuffix);
}

function htFillTableHandsFeet(id, min, max) {
    if ($(id).length == 0) {
        return;
    }
    var leftHand = 0;
    var rightHand = 0;
    var leftFoot = 0;
    var rightFoot = 0;
    for (let i = min; i < max; i++ ) {
        if (i < 6) {
            rightHand = i;
        } else if (i < 11) {
            leftHand = i - 5;
        } else if (i < 16) {
            rightFoot = i - 10;
        } else {
            leftFoot = i - 15;
        }
        $(id+" tr:last").after("<tr><td><img id=\"imgFTHFC0"+i+"\" onclick=\"htImageZoom('imgFTHFC0"+i+"', '0%')\" src=\"images/"+leftHand+"Left_Hand_Small.png\" /></td><td><img id=\"imgFTHFC1"+i+"\" onclick=\"htImageZoom('imgFTHFC1"+i+"', '0%')\" src=\"images/"+rightHand+"Right_Hand_Small.png\"/></td><td><img id=\"imgFTHFC2"+i+"\" onclick=\"htImageZoom('imgFTHFC2"+i+"', '0%')\" src=\"images/"+leftFoot+"LeftFoot.png\" class=\"smallFeet\" /></td><td><img id=\"imgFTHFC3"+i+"\" onclick=\"htImageZoom('imgFTHFC3"+i+"', '0%')\" src=\"images/"+rightFoot+"RightFoot.png\" class=\"smallFeet\" /></td><td><img id=\"imgFTHFC4"+i+"\" onclick=\"htImageZoom('imgFTHFC4"+i+"', '0%')\" src=\"images/HistoryTracers/Maya_"+i+".png\"/></td><td><span class=\"text_to_paint\">"+i+"</span></td></tr>");
    }
}

function htFillSequenceTable(id, min, max) {
    let i = min;
    while (i <= max) {
        var value = "<tr>";
        for (let j =0 ; j < 10; j++, i++) {
            value += "<td><span class=\"num_to_paint\">"+i+"</span></td>";
        }
        $(id+" tr:last").after(value+"</tr>");
    }
}

//https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric/174921#174921
function htIsNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function htFillMultiplicationTable(target, tmin, tmax, fillArea, continuous) {
    if (tmin > tmax)
        return;

    var isNotContinuous = (continuous == undefined || continuous == false);
    var xVector = (isNotContinuous) ? [ 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10] : [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] ;
    var datasets = [ ];

    var yMax = 0;
    for (let i = tmin; i <= tmax; i++) {
        var yVector = [ ];
        for (let j = 0, k = 0; j < xVector.length ; j++, k += 0.5) {
            if (isNotContinuous) {
                yMax = ( (j % 2) == 0)? i * k: null;
            } else {
                yMax = i * j;
            }
            yVector.push(yMax);
        }

        var obj = {
                    data : yVector,
                    label : mathKeywords[16]+i,
                    fill : fillArea
                  };
        datasets.push(obj);
    }

    if (yMax == 0) { yMax = 10; }

    var chartOptions = {
        "datasets": datasets,
        "chartId" : target,
        "yType" : "linear",
        "xVector" : xVector,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "datasetFill" : false,
        "ymin": 0,
        "ymax": yMax,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chartOptions);
}

function htDrawMultiplicationTable(target, angularC, repeat) {
    var angulartext = "";
    for (let i = 0; i < angularC; i++) {
        angulartext += "<i class=\"fa-solid fa-star\" style=\"font-size:0.8em;\"></i>";
    }

    var additionalSpace = (12 - repeat)/2;
    var text = "";
    for (let i = 0; i < additionalSpace; i++) {
        text += "<br />";
    }

    
    for (let i = 0; i < repeat; i++) {
        text += angulartext+"<br />";
    }

    if (repeat % 2 == 1) {
        additionalSpace--;
    }
    for (let i = 0; i < additionalSpace; i++) {
        text += "<br />";
    }
    $(target).html(text);
}

function htResetMultiplicationTable(target) {
        $(target).html(mathKeywords[17]+"<br /><br /><br /><br /><br /><br /><br /><br /><br /><br />");
}


function htWriteMultiplicationTable(target, tValue) {
    var localTarget0 = "#mt"+tValue;
    var localTarget1 = "#mtTable"+tValue;
    $(target).append("<div style=\"border-radius: 30px; margin: auto; border-style= solid; background-color: lightblue; width: 30%; text-align: center; display: inline-block; padding: 5px;\" id=\"mt"+tValue+"\"></div><div style=\"border-radius: 30px; margin: auto; border-style= solid; background-color: lightblue; width: 40%; text-align: center; display: inline-block; vertical-align: top; padding: 5px;\" id=\"mtTable"+tValue+"\"></div>");
    $(localTarget0).append("<b style=\"font-size: 0.9em;\">"+mathKeywords[16]+tValue+"</b><br />");
    htResetMultiplicationTable(localTarget1);

    var angularCoef = parseInt(tValue);
    for (let i = 0; i < 11; i++) {
        var product =  angularCoef * i;
        $(localTarget0).append("<math onmouseover=\"this.style.fontWeight='bold'; htDrawMultiplicationTable('"+localTarget1+"', "+angularCoef+", "+i+");\" onmouseleave=\"this.style.fontWeight='normal'; htResetMultiplicationTable('"+localTarget1+"');\" style=\"font-size: 0.9em;\"><mi>"+product+"</mi> <mo>=</mo> <mi>"+tValue+"</mi> <mo>×</mo> <mi>"+i+"</mi> </math><br />");
    }
}

function htChangeMultUniqueDigitStyle(id, color) {
    if (id == undefined || id.length < 5) {
        return;
    }
    var idx = id[4];
    var nextIdx = parseInt(idx) + 1;
    if ((idx % 2) == 0) {
        var prevIdx = idx - 1;
        $("#mmbc"+prevIdx).css("color", color);
    } else {
        $("#mmbc"+idx).css("color", color);
    }
    $("#mmtc"+idx).css("color", color);
    $("#mmrc"+idx).css("color", color);

    if ($("#mmoc"+idx).length > 0) {
        $("#mmoc"+idx).css("color", color);
    }

    if ($("#mmoc"+nextIdx).length > 0) {
        $("#mmoc"+nextIdx).css("color", color);
    }
}

function htChangeSumUniqueDigitStyle(id, color) {
    if (id == undefined || id.length < 5) {
        return;
    }
    var idx = id[4];
    if (idx > 5) {
        $("#cmoc"+idx).css("color", color);
    }
    $("#cmtc"+idx).css("color", color);
    $("#cmbc"+idx).css("color", color);
    $("#cmrc"+idx).css("color", color);    
}

function htSetMultColors(localClass, color, id)
{
    // Top line
    $("#mmtc2."+localClass).css("color", color);
    $("#mmtc1."+localClass).css("color", color);

    // Multiplicator
    $("#mmbc"+id+"."+localClass).css("color", color);

    var prefix = (id == 1) ? "mmptrc" : "mmpbrc";

    $("#"+prefix+"1."+localClass).css("color", color);
    $("#"+prefix+"2."+localClass).css("color", color);
    if (id == 1)
        return;
    $("#"+prefix+"3."+localClass).css("color", color);

}

