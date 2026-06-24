// SPDX-License-Identifier: GPL-3.0-or-later

var yupanaSelectors = [ -1,  4,  3,  2,  4,  1,  1,  1, 1,  1,
                        -1, -1, -1, -1,  2, -1,  4,  3, 2,  2,
                        -1, -1, -1, -1, -1, -1, -1, -1, -1, 4];

var yupanaClasses = [ "red_dot_right_up", "red_dot_right_up_1", "red_dot_right_up_2", "red_dot_right_up_3", "red_dot_right_up_4", "red_dot_right_bottom", "red_dot_right_bottom_1", "red_dot_right_bottom_2", "red_dot_right_bottom_3", "red_dot_right_bottom_4"];

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
        carry = false;
        if (result >= 10) {
            if (i + 1 < larr.length) {
                rarr_work[i+1] += 1;
            }
        }

        text += larr[i] +" + ";
        text +=  (rarr[i] == rarr_work[i]) ? rarr[i] : rarr[i] + " + 1 (" + mathKeywords[67] + ")" ;
        text += " = "+result+":<br />";
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

function htCleanYupanaDecimalRow(tableID, row)
{
    for (let col = 1; col <= 4; col++) {
        $(tableID + " #tc" + col + "f" + row).find(".circValues").remove();
    }
}

function htFillYupanaDecimalRow(tableID, row, digit, dotClass)
{
    for (let sel = digit; sel < 30; sel += 10) {
        if (yupanaSelectors[sel] < 0) {
            continue;
        }
        var idx = yupanaSelectors[sel];
        $(tableID + " #tc" + idx + "f" + row).append("<span class=\"dot circValues " + dotClass + "\"></span>");
    }
}

function htYupanaStepByStep(larr, rarr, tableID, rows, resultID)
{
    if (larr.length != rarr.length) {
        return;
    }

    var step = 0;
    var rarr_work = rarr.slice();
    var displayArr = [];
    for (let i = 0; i < rows; i++) {
        displayArr.push('');
    }

    function processStep() {
        if (step >= larr.length) {
            return;
        }

        var bottom2top = rows - step;
        var rawSum = parseInt(larr[step]) + parseInt(rarr_work[step]);
        var resultDigit = rawSum;
        if (rawSum >= 10) {
            if (step + 1 < larr.length) {
                rarr_work[step+1] += 1;
            }
            resultDigit -= 10;
        }

        htCleanYupanaDecimalRow(tableID, bottom2top);

        var stepText = "";
        if (rarr[step] != rarr_work[step]) {
            stepText = larr[step] + " + " + rarr[step] + " + 1 (" + mathKeywords[67] + ") = ";
        } else {
            stepText = larr[step] + " + " + rarr[step] + " = ";
        }
        stepText += rawSum + ":<br />";
        $(tableID + " " + resultID).append(stepText);

        var movementsStr = htWriteSumOnYupana(larr[step], rarr_work[step], rawSum);
        var movements = movementsStr.split("<br />");
        var filteredMovements = [];
        for (var mi = 0; mi < movements.length; mi++) {
            if (movements[mi].length > 0) {
                filteredMovements.push(movements[mi]);
            }
        }

        var mj = 0;
        function showMovement() {
            if (mj >= filteredMovements.length) {
                htCleanYupanaDecimalRow(tableID, bottom2top);
                htFillYupanaDecimalRow(tableID, bottom2top, resultDigit, 'red_dot_right_up');
                displayArr[step] = resultDigit;
                htWriteYupanaValuesOnHTMLTable('#tc6f', tableID, displayArr);
                step++;
                setTimeout(processStep, 1500);
                return;
            }
            $(tableID + " " + resultID).append(filteredMovements[mj] + "<br />");
            htCleanYupanaDecimalRow(tableID, bottom2top);
            if (mj === 0 && larr[step] < 10 && rarr_work[step] < 10) {
                htFillYupanaDecimalRow(tableID, bottom2top, larr[step], 'red_dot_right_up');
                htFillYupanaDecimalRow(tableID, bottom2top, rarr_work[step], 'blue_dot_right_bottom');
            } else if (mj === 0) {
                if (resultDigit > 0) {
                    htFillYupanaDecimalRow(tableID, bottom2top, resultDigit, 'blue_dot_right_bottom');
                }
            } else {
                var displayVal = Math.round(resultDigit * mj / (filteredMovements.length - 1));
                if (displayVal > 0) {
                    htFillYupanaDecimalRow(tableID, bottom2top, displayVal, 'red_dot_right_up');
                }
            }
            if (rawSum >= 10 && step + 1 < larr.length) {
                if (filteredMovements.length > 1 && mj === filteredMovements.length - 1) {
                    htFillYupanaDecimalRow(tableID, bottom2top - 1, 1, 'blue_dot_right_bottom');
                } else if (filteredMovements.length === 1) {
                    htFillYupanaDecimalRow(tableID, bottom2top - 1, 1, 'blue_dot_right_bottom');
                }
            }
            mj++;
            setTimeout(showMovement, 1500);
        }
        setTimeout(showMovement, 1500);
    }

    setTimeout(processStep, 1000);
}
