// SPDX-License-Identifier: GPL-3.0-or-later

var yupanaSelectors = [ -1,  4,  3,  2,  4,  1,  1,  1, 1,  1,
                        -1, -1, -1, -1,  2, -1,  4,  3, 2,  2,
                        -1, -1, -1, -1, -1, -1,  4, -1, -1, 4];

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
                text = "<i>"+mathKeywords[3]+"</i><br />";
                text += "<i>"+mathKeywords[1]+"</i><br />";
                text += "<i>"+mathKeywords[2]+"</i><br />";
                break;
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
        if (result > 10 && lValue >= 5 && rValue >= 5) {
            var leftRem = lValue - 5;
            var rightRem = rValue - 5;
            if (leftRem + rightRem < 5) {
                if (leftRem > 0 && rightRem > 0 && leftRem + rightRem !== 4) {
                    text = "<i>"+mathKeywords[4]+"</i><br /><i>"+mathKeywords[2]+"</i><br />";
                } else {
                    text = "<i>"+mathKeywords[2]+"</i><br />";
                }
                return text;
            }
        }
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
                    var leftRem = lValue >= 5 ? lValue - 5 : lValue;
                    var rightRem = rValue >= 5 ? rValue - 5 : rValue;
                    if (leftRem == 1 || leftRem == 4 || rightRem == 1 || rightRem == 4) {
                        text = "<i>"+mathKeywords[3]+"</i><br />"+"<i>"+mathKeywords[1]+"</i><br />"+"<i>"+mathKeywords[2]+"</i><br />";
                    } else {
                        text = "<i>"+mathKeywords[1]+"</i><br />"+"<i>"+mathKeywords[3]+"</i><br />"+"<i>"+mathKeywords[2]+"</i><br />";
                    }
                }
                else if (bigger == false && result == 3) {
                    text = "<i>"+mathKeywords[4]+"</i><br />";
                }
                break;
            case 7:
                if (bigger) {
                    var leftRem7 = lValue >= 5 ? lValue - 5 : lValue;
                    var rightRem7 = rValue >= 5 ? rValue - 5 : rValue;
                    if (leftRem7 == 1 || leftRem7 == 4 || rightRem7 == 1 || rightRem7 == 4) {
                        text = "<i>"+mathKeywords[3]+"</i><br />"+"<i>"+mathKeywords[1]+"</i><br />"+"<i>"+mathKeywords[2]+"</i><br />";
                    } else {
                        text = "<i>"+mathKeywords[1]+"</i><br />"+"<i>"+mathKeywords[3]+"</i><br />"+"<i>"+mathKeywords[2]+"</i><br />";
                    }
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
                    var leftRem5 = lValue >= 5 ? lValue - 5 : lValue;
                    var rightRem5 = rValue >= 5 ? rValue - 5 : rValue;
                    if (leftRem5 == 1 || leftRem5 == 4 || rightRem5 == 1 || rightRem5 == 4) {
                        text = "<i>"+mathKeywords[3]+"</i><br />"+"<i>"+mathKeywords[1]+"</i><br />"+"<i>"+mathKeywords[2]+"</i><br />";
                    } else {
                        text = "<i>"+mathKeywords[1]+"</i><br />"+"<i>"+mathKeywords[3]+"</i><br />"+"<i>"+mathKeywords[2]+"</i><br />";
                    }
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
                        text = "<i>"+mathKeywords[4]+"</i><br />"+"<i>"+mathKeywords[2]+"</i><br />";
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
                    text += "<i>"+mathKeywords[1]+"</i><br />";
                }
                else if (lValue == 7 || rValue == 7) {
                    text += "<i>"+mathKeywords[1]+"</i><br />";
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

        if (result === 0 && larr[i] === 0 && rarr[i] === 0) {
            continue;
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
            window.htYupanaCalculationInProgress = false;
            return;
        }
        if (window.htYupanaAnimationCancelled) {
            return;
        }

        var bottom2top = rows - step;
        var valCell = tableID + " #tc5f" + bottom2top;
        if (rarr[step] != rarr_work[step]) {
            $(valCell).html("<span id=\"vl" + bottom2top + "\">" + larr[step] + "</span> + <span id=\"vr" + bottom2top + "\">" + rarr[step] + "</span> + 1 (" + mathKeywords[67] + ")");
        } else {
            $(tableID + " #vl" + bottom2top).html(larr[step]);
            $(tableID + " #vr" + bottom2top).html(rarr_work[step]);
        }
        var rawSum = parseInt(larr[step]) + parseInt(rarr_work[step]);
        var resultDigit = rawSum;
        if (rawSum >= 10) {
            if (step + 1 < larr.length) {
                rarr_work[step+1] += 1;
            }
            resultDigit -= 10;
        }

        if (rawSum === 0 && larr[step] === 0 && rarr[step] === 0) {
            htCleanYupanaDecimalRow(tableID, bottom2top);
            displayArr[step] = 0;
            htWriteYupanaValuesOnHTMLTable('#tc6f', tableID, displayArr);
            step++;
            setTimeout(processStep, 1);
            return;
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

        var isCombineCase = false;
        if (filteredMovements.length >= 3 && filteredMovements[0].indexOf(mathKeywords[3]) >= 0) {
            var _preL = larr[step] >= 5 ? larr[step] - 5 : larr[step];
            var _preR = rarr_work[step] >= 5 ? rarr_work[step] - 5 : rarr_work[step];
            if (_preL == _preR && (_preL == 1 || _preL == 4) && (larr[step] >= 5) != (rarr_work[step] >= 5)) {
                isCombineCase = true;
            }
        }

        var mj = 0;
        var useBase5Many = filteredMovements.length >= 3 && larr[step] >= 5 && rarr_work[step] >= 5 && rawSum > 10;

        function htDrawDecomposed(row, leftVal, rightVal, applyTransfer) {
            htCleanYupanaDecimalRow(tableID, row);
            var leftPart = leftVal, rightPart = rightVal;
            if (leftVal >= 5) {
                htFillYupanaDecimalRow(tableID, row, 5, 'red_dot_right_up');
                leftPart = leftVal - 5;
            }
            if (rightVal >= 5) {
                htFillYupanaDecimalRow(tableID, row, 5, 'blue_dot_right_bottom');
                rightPart = rightVal - 5;
            }
            if (applyTransfer && leftVal >= 5 && rightVal >= 5 && leftPart + rightPart === 5) {
                htFillYupanaDecimalRow(tableID, row, 2, 'red_dot_right_up');
                htFillYupanaDecimalRow(tableID, row, 3, 'red_dot_right_up');
                return;
            }
            if (applyTransfer) {
                if ((rightPart == 1 || rightPart == 4) && !(leftPart == 1 || leftPart == 4)) {
                    leftPart += 1;
                    rightPart -= 1;
                } else if ((leftPart == 1 || leftPart == 4) && !(rightPart == 1 || rightPart == 4)) {
                    leftPart -= 1;
                    rightPart += 1;
                } else if ((leftPart == 1 || leftPart == 4) && (rightPart == 1 || rightPart == 4)) {
                    if (leftPart > rightPart) {
                        leftPart -= 1;
                        rightPart += 1;
                    } else if (rightPart > leftPart) {
                        leftPart += 1;
                        rightPart -= 1;
                    }
                }
            }
            if (leftPart > 0) {
                htFillYupanaDecimalRow(tableID, row, leftPart, 'red_dot_right_up');
            }
            if (rightPart > 0) {
                htFillYupanaDecimalRow(tableID, row, rightPart, 'blue_dot_right_bottom');
            }
        }

        function showMovement() {
            if (window.htYupanaAnimationCancelled) {
                return;
            }
            if (mj >= filteredMovements.length) {
                htDrawDecomposed(bottom2top, resultDigit, 0, false);
                if (rawSum >= 10 && step + 1 < larr.length) {
                    htFillYupanaDecimalRow(tableID, bottom2top - 1, 1, 'blue_dot_right_bottom');
                }
                displayArr[step] = resultDigit;
                htWriteYupanaValuesOnHTMLTable('#tc6f', tableID, displayArr);
                step++;
                setTimeout(processStep, 1500);
                return;
            }

            $(tableID + " " + resultID).append(filteredMovements[mj] + "<br />");

            if (useBase5Many && mj == filteredMovements.length - 1) {
                htDrawDecomposed(bottom2top, resultDigit, 0, false);
                if (rawSum >= 10 && step + 1 < larr.length) {
                    htFillYupanaDecimalRow(tableID, bottom2top - 1, 1, 'blue_dot_right_bottom');
                }
                displayArr[step] = resultDigit;
                htWriteYupanaValuesOnHTMLTable('#tc6f', tableID, displayArr);
                step++;
                setTimeout(processStep, 1500);
                return;
            }

            if (mj === 0 && larr[step] < 10 && rarr_work[step] < 10) {
                if (isCombineCase) {
                    htCleanYupanaDecimalRow(tableID, bottom2top);
                    if (larr[step] >= 5) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                    }
                    if (rarr_work[step] >= 5) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                    }
                    if (preLeftRem == 4) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 3, 'red_dot_right_up');
                    }
                    if (preRightRem == 4) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 3, 'blue_dot_right_bottom');
                    }
                    htFillYupanaDecimalRow(tableID, bottom2top, 2, 'red_dot_right_up_1');
                } else {
                    var needTc4Combine = preLeftRem == preRightRem && (preLeftRem == 1 || preLeftRem == 4) && (larr[step] >= 5) != (rarr_work[step] >= 5) && filteredMovements[0].indexOf(mathKeywords[3]) >= 0;
                    if (needTc4Combine) {
                        htCleanYupanaDecimalRow(tableID, bottom2top);
                        if (larr[step] >= 5) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                        }
                        if (rarr_work[step] >= 5) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                        }
                        var lNonTc4 = preLeftRem == 4 ? 3 : 0;
                        var rNonTc4 = preRightRem == 4 ? 3 : 0;
                        if (lNonTc4 > 0) {
                            htFillYupanaDecimalRow(tableID, bottom2top, lNonTc4, 'red_dot_right_up');
                        }
                        if (rNonTc4 > 0) {
                            htFillYupanaDecimalRow(tableID, bottom2top, rNonTc4, 'blue_dot_right_bottom');
                        }
                        htFillYupanaDecimalRow(tableID, bottom2top, 2, 'red_dot_right_up_1');
                    } else if (filteredMovements[0].indexOf(mathKeywords[1]) >= 0 && preLeftRem >= 3 && preRightRem >= 3) {
                        htCleanYupanaDecimalRow(tableID, bottom2top);
                        if (larr[step] >= 5) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                        }
                        if (rarr_work[step] >= 5) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                        }
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up');
                        if (preLeftRem - 3 > 0) {
                            htFillYupanaDecimalRow(tableID, bottom2top, preLeftRem - 3, 'red_dot_right_up');
                        }
                        if (preRightRem - 3 > 0) {
                            htFillYupanaDecimalRow(tableID, bottom2top, preRightRem - 3, 'blue_dot_right_bottom');
                        }
                    } else if (filteredMovements[0].indexOf(mathKeywords[3]) >= 0 && preLeftRem >= 1 && preRightRem >= 1) {
                        htCleanYupanaDecimalRow(tableID, bottom2top);
                        if (larr[step] >= 5) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                        }
                        if (rarr_work[step] >= 5) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                        }
                        var _lk = larr[step] >= 5 ? larr[step] - 5 : larr[step];
                        var _rk = rarr_work[step] >= 5 ? rarr_work[step] - 5 : rarr_work[step];
                        if (_lk == 4 || _lk == 3) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 3, 'red_dot_right_up');
                        } else if (_lk == 2) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 2, 'red_dot_right_up');
                        }
                        if (_rk == 4 || _rk == 3) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 3, 'blue_dot_right_bottom');
                        } else if (_rk == 2) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 2, 'blue_dot_right_bottom');
                        }
                        var _lt = (_lk == 1 || _lk == 4) ? 1 : 0;
                        var _rt = (_rk == 1 || _rk == 4) ? 1 : 0;
                        var _tc = _lt + _rt;
                        if (_tc == 1) {
                            if (_lt == 1) {
                                htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up_1');
                            } else {
                                htFillYupanaDecimalRow(tableID, bottom2top, 1, 'blue_dot_right_bottom_1');
                            }
                        } else if (_tc == 2) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 2, 'red_dot_right_up_1');
                        }
                    } else if (filteredMovements.length > 1 && larr[step] + rarr_work[step] === 10 && larr[step] !== rarr_work[step] && !preHasTc4) {
                        htDrawDecomposed(bottom2top, 5, 5, false);
                    } else {
                        htDrawDecomposed(bottom2top, larr[step], rarr_work[step], true);
                    }
                }
            } else if (mj === 0) {
                htCleanYupanaDecimalRow(tableID, bottom2top);
                if (resultDigit > 0) {
                    htFillYupanaDecimalRow(tableID, bottom2top, resultDigit, 'blue_dot_right_bottom');
                }
            } else {
                var useBase5 = larr[step] >= 5 && rarr_work[step] >= 5 && rawSum > 10 && resultDigit < 5;
                var currMov = filteredMovements[mj];
                var isKikin = currMov.indexOf(mathKeywords[3]) >= 0;
                var isKimsa = currMov.indexOf(mathKeywords[1]) >= 0;
                var isPisqa = currMov.indexOf(mathKeywords[2]) >= 0;
                if (isKikin) {
                    if (preLeftRem == 4 && preRightRem == 4) {
                        htCleanYupanaDecimalRow(tableID, bottom2top);
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                        htFillYupanaDecimalRow(tableID, bottom2top, 2, 'red_dot_right_up_1');
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up_1');
                    } else {
                        htCleanYupanaDecimalRow(tableID, bottom2top);
                        if (larr[step] >= 5) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                        }
                        if (rarr_work[step] >= 5) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                        }
                        var _lk = larr[step] >= 5 ? larr[step] - 5 : larr[step];
                        var _rk = rarr_work[step] >= 5 ? rarr_work[step] - 5 : rarr_work[step];
                        var _leftNon = (_lk == 4 || _lk == 3) ? 3 : (_lk == 2 ? 2 : 0);
                        var _rightNon = (_rk == 4 || _rk == 3) ? 3 : (_rk == 2 ? 2 : 0);
                        var _leftTc4 = (_lk == 1 || _lk == 4) ? 1 : 0;
                        var _rightTc4 = (_rk == 1 || _rk == 4) ? 1 : 0;
                        var _total = _leftNon + _rightNon + _leftTc4 + _rightTc4;
                        var _extraFives = Math.floor(_total / 5);
                        var _remainder = _total % 5;
                        var _5idx = larr[step] >= 5 ? 1 : 0;
                        for (var _f = 0; _f < _extraFives && _5idx <= 4; _f++) {
                            var _5cls = _5idx == 0 ? 'red_dot_right_up' : _5idx == 1 ? 'red_dot_right_up_1' : _5idx == 2 ? 'red_dot_right_up_2' : _5idx == 3 ? 'red_dot_right_up_3' : 'red_dot_right_up_4';
                            htFillYupanaDecimalRow(tableID, bottom2top, 5, _5cls);
                            _5idx++;
                        }
                        if (_remainder == 4) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 3, 'red_dot_right_up');
                            htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up_1');
                        } else if (_remainder == 3) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 3, 'red_dot_right_up');
                        } else if (_remainder == 2) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 2, 'red_dot_right_up');
                        } else if (_remainder == 1) {
                            htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up_1');
                        }
                    }
                } else if (isKimsa) {
                    htCleanYupanaDecimalRow(tableID, bottom2top);
                    if (larr[step] >= 5) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                    }
                    if (rarr_work[step] >= 5) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                    }
                    var _lk = larr[step] >= 5 ? larr[step] - 5 : larr[step];
                    var _rk = rarr_work[step] >= 5 ? rarr_work[step] - 5 : rarr_work[step];
                    var _tot = (_lk == 4 || _lk == 3 ? 3 : _lk == 2 ? 2 : 0)
                             + (_rk == 4 || _rk == 3 ? 3 : _rk == 2 ? 2 : 0)
                             + (_lk == 1 || _lk == 4 ? 1 : 0)
                             + (_rk == 1 || _rk == 4 ? 1 : 0);
                    var _5idx = larr[step] >= 5 ? 1 : 0;
                    for (var _f = 0; _f < Math.floor(_tot / 5) && _5idx <= 4; _f++) {
                        var _5cls = _5idx == 0 ? 'red_dot_right_up' : _5idx == 1 ? 'red_dot_right_up_1' : _5idx == 2 ? 'red_dot_right_up_2' : _5idx == 3 ? 'red_dot_right_up_3' : 'red_dot_right_up_4';
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, _5cls);
                        _5idx++;
                    }
                    var _rm = _tot % 5;
                    if (_rm == 4) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 3, 'red_dot_right_up');
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up_1');
                    } else if (_rm == 3) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 3, 'red_dot_right_up');
                    } else if (_rm == 2) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 2, 'red_dot_right_up');
                    } else if (_rm == 1) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up_1');
                    }
                } else if (isPisqa) {
                    htDrawDecomposed(bottom2top, resultDigit, 0, false);
                    if (rawSum >= 10 && step + 1 < larr.length) {
                        htFillYupanaDecimalRow(tableID, bottom2top - 1, 1, 'blue_dot_right_bottom');
                    }
                } else {
                    htCleanYupanaDecimalRow(tableID, bottom2top);
                    var showBoth5s = false;
                    if (useBase5) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                    } else if (rawSum == 10 && (larr[step] >= 5) != (rarr_work[step] >= 5) && mj == filteredMovements.length - 1) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                        showBoth5s = true;
                    }
                    var displayVal;
                    if (useBase5 && filteredMovements.length >= 3) {
                        displayVal = resultDigit;
                    } else {
                        displayVal = filteredMovements.length < 3
                            ? resultDigit
                            : Math.round(Math.min(rawSum, 9) - (Math.min(rawSum, 9) - resultDigit) * (mj - 1) / (filteredMovements.length - 2));
                    }
                    if (displayVal > 0 && !showBoth5s) {
                        htFillYupanaDecimalRow(tableID, bottom2top, displayVal, useBase5 ? 'red_dot_right_up_1' : 'red_dot_right_up');
                    }
                }
            }
            mj++;
            setTimeout(showMovement, 1500);
        }

        var preLeftRem = larr[step] >= 5 ? larr[step] - 5 : larr[step];
        var preRightRem = rarr_work[step] >= 5 ? rarr_work[step] - 5 : rarr_work[step];
        var preHasTc4 = (preLeftRem == 1 || preLeftRem == 4 || preRightRem == 1 || preRightRem == 4);
        var preCombine = (larr[step] + rarr_work[step] === 10 && larr[step] !== rarr_work[step]);
        var isBothTc4Equal = (larr[step] === rarr_work[step] && larr[step] < 5 && (larr[step] === 1 || larr[step] === 4));
        var hasPreMovement = !isBothTc4Equal && (preHasTc4 || (larr[step] < 5 && rarr_work[step] < 5) || preCombine);

        if (hasPreMovement) {
            setTimeout(function() {
                if (isCombineCase) {
                    htCleanYupanaDecimalRow(tableID, bottom2top);
                    if (larr[step] >= 5) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                    }
                    if (rarr_work[step] >= 5) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                    }
                    if (preLeftRem == 4) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 3, 'red_dot_right_up');
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up_1');
                    } else if (preLeftRem == 1) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up_1');
                    } else if (preLeftRem > 0) {
                        htFillYupanaDecimalRow(tableID, bottom2top, preLeftRem, 'red_dot_right_up');
                    }
                    if (preRightRem == 4) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 3, 'blue_dot_right_bottom');
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'blue_dot_right_bottom_1');
                    } else if (preRightRem == 1) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'blue_dot_right_bottom_1');
                    } else if (preRightRem > 0) {
                        htFillYupanaDecimalRow(tableID, bottom2top, preRightRem, 'blue_dot_right_bottom');
                    }
                } else {
                    htCleanYupanaDecimalRow(tableID, bottom2top);
                    if (larr[step] >= 5) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'red_dot_right_up');
                    }
                    if (rarr_work[step] >= 5) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 5, 'blue_dot_right_bottom');
                    }
                    var _lp = larr[step] >= 5 ? larr[step] - 5 : larr[step];
                    var _rp = rarr_work[step] >= 5 ? rarr_work[step] - 5 : rarr_work[step];
                    if (_lp == 4) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 3, 'red_dot_right_up');
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up_1');
                    } else if (_lp == 3) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 3, 'red_dot_right_up');
                    } else if (_lp == 2) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 2, 'red_dot_right_up');
                    } else if (_lp == 1) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'red_dot_right_up_1');
                    }
                    if (_rp == 4) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 3, 'blue_dot_right_bottom');
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'blue_dot_right_bottom_1');
                    } else if (_rp == 3) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 3, 'blue_dot_right_bottom');
                    } else if (_rp == 2) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 2, 'blue_dot_right_bottom');
                    } else if (_rp == 1) {
                        htFillYupanaDecimalRow(tableID, bottom2top, 1, 'blue_dot_right_bottom_1');
                    }
                }
                $(tableID + " " + resultID).append(larr[step] + " + " + rarr_work[step] + "<br />");
                setTimeout(showMovement, 1500);
            }, 1500);
        } else {
            setTimeout(showMovement, 1500);
        }
    }

    setTimeout(processStep, 1000);
}
