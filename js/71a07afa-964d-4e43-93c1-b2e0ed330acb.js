// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htProcessNextValue()
{
    return (local.currentValue == local.stopValue) ? false : true;
}

function htSetWorkingValue()
{
    if (!local.currentRow) {
        local.currentValue = 0;
        local.stopValue = local.results[2];
        return;
    }
    local.stopValue = local.results[2+local.currentRow*3];
}

function htFillResultsVector() {
    local.multiple = htGetRandomArbitrary(1, 10);
    let prev = 0;
    for (let i =0, j =1, k = 2; i < 9; i += 3, j += 3, k += 3) {
        if (!i) {
            local.results[i] = local.multiple;
            local.results[j] = htGetRandomArbitrary(1, 8);
        } else {
            local.results[i] = prev;
            local.results[j] = local.multiple;
        }
        prev = local.results[k] = (i < 3) ? local.results[i] * local.results[j]: local.results[i] + local.results[j];
    }

    htSetWorkingValue();
}

function htMakeTable() {
    var value = "";
    var textClass = "text_to_paint";
    var textClassFinal = "text_to_paint_small";
    local.controlSize = "5";
    if (window.innerWidth < 975) {
        textClass = "text_to_paint_really_small";
        textClassFinal = "text_to_paint_really_small";
        local.controlSize = "3";
    }

    for (let i = 0, column = 0, row = 0, res = 0; i <= 15; i++, column += 12) {
        if ( (i > 0) && ((i % 5) == 0)) {
            var localSymbol = "";
            if (i == 5) {
                localSymbol = "<i class=\"fa-solid fa-caret-up upArrowWithFA\" style=\"font-size: "+local.controlSize+"em; visibility: visible; display: block;\" name=\"traineeUp\" id=\"traineeUp\"></i><br /><i class=\"fa-solid fa-medal\" style=\"font-size: "+local.controlSize+"em; color:gold; visibility: hidden; display: none;\"></i>";
            } else if (i == 10) {
                localSymbol = "<i class=\"fa-solid fa-caret-down downArrowWithFA\" style=\"font-size: "+local.controlSize+"em; visibility: visible; display: block;\" name=\"traineeDown\" id=\"traineeDown\"></i><i class=\"fa-solid fa-medal\" style=\"font-size: "+local.controlSize+"em; color:gold; visibility: hidden; display: none;\"></i>";
            } else {
                localSymbol = "<i class=\"fa-solid fa-chevron-right\" id=\"NextLevel\" style=\"font-size: "+local.controlSize+"em; visibility: hidden; display: none;\"></i>";
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
                value = local.results[res++];
                break;
            case 1:
            case 6:
            case 11:
                value = (i > 1) ? "+" : "×";
                break;
            case 7:
                value = local.results[4];
                break;
            case 12:
                value = local.results[7];
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
                value = local.results[res++];
                break;
            case 1:
            case 6:
            case 11:
                value = (i > 1) ? "+" : "×";
                break;
            case 7:
                value = local.results[4];
                break;
            case 12:
                value = local.results[7];
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
    var obj = local.gameVector[local.currentLevel];
    $("#imgGame").attr("src", obj.imagePath);
    $("#imgText").html(obj.imageDesc);
    local.currentLevel++;
    local.partial = 0;
    if (local.currentLevel == local.gameVector.length) {
        local.currentLevel = 0;
    }

    htFillResultsVector();
}

function htHideDivs() {
    let end = (local.currentRow + 1)*5;
    let ansIdx = local.currentRow*3;;
    let signal = (local.currentRow > 0) ? "+" : "×";
    $("#anstxt"+local.currentRow).html(local.results[ansIdx]+" "+signal+" "+local.results[ansIdx + 1]+" = "+local.results[ansIdx + 2]);
    for (let i = 5*local.currentRow; i < end; i++) {
        $("#num"+i).css("display","none").css("visibility","hidden");
    }

    if (local.currentRow == 2) {
        $("#NextLevel").css("display","block").css("visibility","visible");
        $(".fa-medal").css("display","block").css("visibility","visible");
        $("#traineeUp").css("display","none").css("visibility","hidden");
        $("#traineeDown").css("display","none").css("visibility","hidden");
        local.stop = 1;
    }
}

function htWriteResult() {
    var selector = 0;
    switch (local.currentRow) {
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
    let idx = (local.currentRow + 1)*5;
    $("#txt"+idx).html(local.results[selector + 3]);
}

function htResetGoNext(topIdx, bottomIdx) {
    htHideDivs();
    htWriteResult();
    local.currentRow++;
    local.partial = 0;
    local.suffix = "";

    htSetWorkingValue();
}

function htCheckResults(resIdx) {
    if (!local.currentRow && local.results[resIdx] == local.currentValue) {
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
    if (local.currentRow == 1) {
        resIdx = 5;
        resResult = 9;
    } else if (local.currentRow == 2) {
        resIdx = 8;
        resResult = 14;
    }

    if (htCheckResults(resIdx)) {
        return;
    }

    if ($("#txt"+resResult).html().length > 0) {
        if (dir > 0) {
            local.currentValue += local.multiple;
        } else if (dir < 0) {
            local.currentValue -= local.multiple;
        }
    }

    if (local.currentValue < 0) {
        local.currentValue = 0;
    }

    $("#txt"+resResult).html(local.currentValue+local.suffix);

    htCheckResults(resIdx);
}

function htLoadContent() {
    local = { "gameVector": [], "currentLevel": 0, "results": [ 0, 0, 0, 0, 0, 0, 0, 0, 0], "currentRow": 0, "currentValue": 0, "stop": 0, "stopValue": 0, "multiple": 0, "partial": 0, "suffix": "", "controlSize": "5" }; 

    htWriteNavigation();

    local.gameVector = htLoadGameData();
    htFillImage();
    htMakeTable();

    $(".upArrowWithFA").on("click", function() {
        if (local.stop) {
            return;
        }
        htSetValues(1);
    });

    $(".downArrowWithFA").on("click", function() {
        if (local.stop) {
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
        local.currentRow = 0;
        local.stop = 0;
        local.currentValue = 0;
        local.stopValue = 0;
        local.partial = 0;
        local.suffix = "";
        htFillImage();
        htRewriteTable();
    });


    return false;
}
