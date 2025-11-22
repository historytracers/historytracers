// SPDX-License-Identifier: GPL-3.0-or-later

var localGameVector71a07afa = [];
var currentLevel = 0;
//

var results = [ 0, 0, 0, 0, 0, 0, 0, 0, 0];
var currentRow = 0;
var currentValue = 0;
var stop = 0;
var stopValue = 0;
var carriers = 0;
var multiple = 0;

var partial = 0;
var suffix = "";
var controlSize = "5";

var strTopValue = "";
var strBottomValue = "";

function htProcessNextValue()
{
    return (currentValue == stopValue) ? false : true;
}

function htSetWorkingValue(topValue, bottomValue)
{
    if (!currentRow) {
        currentValue = 0;
        stopValue = results[2];
        return;
    }
    stopValue = results[2+currentRow*3];
}

function htFillResultsVector() {
    multiple = htGetRandomArbitrary(1, 10);
    let prev = 0;
    for (let i =0, j =1, k = 2; i < 9; i += 3, j += 3, k += 3) {
        if (!i) {
            results[i] = multiple;
            results[j] = htGetRandomArbitrary(1, 3);
        } else {
            results[i] = prev;
            results[j] = multiple;
        }
        prev = results[k] = (i != 3) ? results[i] * results[j]: results[i] + results[j];
        console.log(results[i]+" "+results[j]+" "+results[k]);
    }

    htSetWorkingValue(results[0], results[1]);
}

function htMakeTable() {
    var value = "";
    var textClass = "text_to_paint";
    var textClassFinal = "text_to_paint_small";
    controlSize = "5";
    if (window.innerWidth < 975) {
        textClass = "text_to_paint_really_small";
        textClassFinal = "text_to_paint_really_small";
        controlSize = "3";
    }

    for (let i = 0, column = 0, row = 0, res = 0; i <= 15; i++, column += 12) {
        if ( (i > 0) && ((i % 5) == 0)) {
            var localSymbol = "";
            if (i == 5) {
                localSymbol = "<i class=\"fa-solid fa-caret-up upArrowWithFA\" style=\"font-size: "+controlSize+"em; visibility: visible; display: block;\" name=\"traineeUp\" id=\"traineeUp\"></i><br /><i class=\"fa-solid fa-medal\" style=\"font-size: "+controlSize+"em; color:gold; visibility: hidden; display: none;\"></i>";
            } else if (i == 10) {
                localSymbol = "<i class=\"fa-solid fa-caret-down downArrowWithFA\" style=\"font-size: "+controlSize+"em; visibility: visible; display: block;\" name=\"traineeDown\" id=\"traineeDown\"></i><i class=\"fa-solid fa-medal\" style=\"font-size: "+controlSize+"em; color:gold; visibility: hidden; display: none;\"></i>";
            } else {
                localSymbol = "<i class=\"fa-solid fa-chevron-right\" id=\"NextLevel\" style=\"font-size: "+controlSize+"em; visibility: hidden; display: none;\"></i>";
            }

            $("#parentGame").append("<div id=\"control"+i+"\" style=\"border: 3px solid black; position: absolute; z-index: 100; left: "+column+"%; top: "+row+"%; width: 12%; height: 33%; background-color: white; text-align: center; vertical-align: middle;\">"+localSymbol+"</div>");
            column = 0;
            row += 33; 
            if (i == 15) {
                break;
            }
        }

        switch (i) {
            case 0:
            case 2:
                value = results[res++];
                break;
            case 1:
            case 6:
            case 11:
                value = (i == 6) ? "+" : "×";
                break;
            case 7:
                value = results[4];
                break;
            case 12:
                value = results[7];
                break;
            case 3:
            case 8:
            case 13:
                value = "=";
                break;
            default:
                value = "";
                break
        }

        $("#parentGame").append("<div class=\"updSuccess\" id=\"num"+i+"\" style=\"border: 3px solid black; position: absolute; z-index: 100; left: "+column+"%; top: "+row+"%; width: 12%; height: 33%; background-color: lightyellow; text-align: center; vertical-align: middle;\"><span id=\"txt"+i+"\" class=\""+textClass+"\">"+value+"</span></div>");
    }

    for (let i = 0, row = 0; i < 3; i++, row += 33) {
        $("#parentGame").append("<div id=\"ans"+i+"\" style=\"border: 3px solid black; position: absolute; z-index: 100; left: 72%; top: "+row+"%; width: 12%; height: 33%; background-color: lightblue; text-align: center; vertical-align: middle;\"><span id=\"anstxt"+i+"\" class=\""+textClassFinal+"\"></span></div>");
    }
}

function htRewriteTable() {
    var value = "";
    for (let i = 0, res = 0; i < 15; i++) {
        switch (i) {
            case 0:
            case 2:
                value = results[res++];
                break;
            case 1:
            case 6:
            case 11:
                value = (i == 6) ? "+" : "×";
                break;
            case 7:
                value = results[4];
                break;
            case 12:
                value = results[7];
                break;
            case 3:
            case 8:
            case 13:
                value = "=";
                break;
            default:
                value = "";
                break
        }
        $("#txt"+i).html(value);
    }
}

function htFillImage() {
    var obj = localGameVector71a07afa[currentLevel];
    $("#imgGame").attr("src", obj.imagePath);
    $("#imgText").html(obj.imageDesc);
    currentLevel++;
    partial = 0;
    if (currentLevel == localGameVector71a07afa.length) {
        currentLevel = 0;
    }

    htFillResultsVector();
}

function htHideDivs() {
    let end = (currentRow + 1)*5;
    let ansIdx = currentRow*3;;
    let signal = (currentRow == 1) ? "+" : "×";
    $("#anstxt"+currentRow).html(results[ansIdx]+" "+signal+" "+results[ansIdx + 1]+" = "+results[ansIdx + 2]);
    for (let i = 5*currentRow; i < end; i++) {
        $("#num"+i).css("display","none").css("visibility","hidden");
    }

    carriers = 0;
    if (currentRow == 2) {
        $("#NextLevel").css("display","block").css("visibility","visible");
        $(".fa-medal").css("display","block").css("visibility","visible");
        $("#traineeUp").css("display","none").css("visibility","hidden");
        $("#traineeDown").css("display","none").css("visibility","hidden");
        stop = 1;
    }
}

function htWriteResult() {
    var selector = 0;
    switch (currentRow) {
        case 0:
            selector = 0;
            break;
        case 1:
            selector = 3;
            break;
        case 2:
        default:
            selector = 6;
            break;
    }
    let idx = (currentRow + 1)*5;
    $("#txt"+idx).html(results[selector + 3]);
}

function htResetGoNext(topIdx, bottomIdx) {
    htHideDivs();
    htWriteResult();
    currentRow++;
    partial = 0;
    suffix = "";

    htSetWorkingValue(results[topIdx], results[bottomIdx]);
}

function htCheckResults(resIdx) {
    if (!currentRow && results[resIdx] == currentValue) {
        htResetGoNext(3, 4);
        return true;
    } else if (!htProcessNextValue()) {
        htResetGoNext(6, 7);
        return true;
    }

    return false;
}

function htSetValues(dir) {
    var resIdx = 2;
    var resResult = 4;
    if (currentRow == 1) {
        resIdx = 5;
        resResult = 9;
    } else if (currentRow == 2) {
        resIdx = 8;
        resResult = 14;
    }

    if (htCheckResults(resIdx)) {
        return;
    }

    if ($("#txt"+resResult).html().length > 0) {
        if (dir > 0) {
            currentValue += multiple;
        } else if (dir < 0) {
            currentValue -= multiple;
        }
    }

    if (currentValue < 0) {
        currentValue = 0;
    }

    $("#txt"+resResult).html(currentValue+suffix);

    htCheckResults(resIdx);
}

function htLoadContent() {
    htWriteNavigation();

    localGameVector71a07afa = htLoadGameData();
    htFillImage();
    htMakeTable();

    $(".upArrowWithFA").on("click", function() {
        if (stop) {
            return;
        }
        htSetValues(1);
    });

    $(".downArrowWithFA").on("click", function() {
        if (stop) {
            return;
        }
        htSetValues(-1);
    });

    $("#NextLevel").on("click", function() {
        $("#NextLevel").css("display","none").css("visibility","hidden");
        $(".fa-medal").css("display","none").css("visibility","hidden");
        $("#traineeUp").css("display","block").css("visibility","visible");
        $("#traineeDown").css("display","block").css("visibility","visible");
        $(".text_to_paint").html("");
        $(".text_to_paint_really_small").html("");
        $(".text_to_paint_small").html("");
        $(".updSuccess").css("display","block").css("visibility","visible");
        currentRow = 0;
        stop = 0;
        currentValue = 0;
        stopValue = 0;
        partial = 0;
        suffix = "";
        htFillImage();
        htRewriteTable();
    });


    return false;
}
