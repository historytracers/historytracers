// SPDX-License-Identifier: GPL-3.0-or-later

var rValues = [];
var lValues = [];

var rValues2 = [];
var lValues2 = [];

var leftbe2d7ec9 = 0;
var rightbe2d7ec9 = 0;

var mayaProductVector = [];
var firstVector = [];
var secondVector = [];

var localAnswerVectorbe2d7ec9 = undefined;
var currentExampleIdx = 0;
var initialColorChange = 0;


function htUpdateYupanabe2d7ec9(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana0', 2);
    rvalues2 = htFillYupanaDecimalValues('#yupana0', lv, 2, 'red_dot_right_up');
    lvalues2 = htFillYupanaDecimalValues('#yupana0', rv, 2, 'blue_dot_right_bottom');

    $("#rightHandImg3").attr("src", "images/HistoryTracers/"+lv+"Right_Hand_Small.png");
    $("#leftHandImg3").attr("src", "images/HistoryTracers/"+rv+"Left_Hand_Small.png");
}

function htUpdateValuesbe2d7ec9(left, right) {
    leftbe2d7ec9 = left;
    rightbe2d7ec9 = right;

    if (left == 10 && right == 0) {
        left = 5;
        right = 5;
    }
    $("#rightHandImg3").attr("src", "images/HistoryTracers/"+right+"Right_Hand_Small.png");
    $("#leftHandImg3").attr("src", "images/HistoryTracers/"+left+"Left_Hand_Small.png");
}

function htResetValuesbe2d7ec9() {
    if (yupanaSelected == "-1") {
        return;
    }

    if (yupanaSelected == "0") {
        htUpdateValuesbe2d7ec9(2, 2);
    } else if (yupanaSelected == "1") {
        htUpdateValuesbe2d7ec9(3, 3);
    } else if (yupanaSelected == "2") {
        htUpdateValuesbe2d7ec9(5, 5);
    } else if (yupanaSelected == "3") {
        htUpdateValuesbe2d7ec9(1, 2);
    } else if (yupanaSelected == "4") {
        htUpdateValuesbe2d7ec9(1, 1);
    }
}

function htSetValuesbe2d7ec9() {
    if (yupanaSelected == "-1") {
        return;
    }

    if (yupanaSelected == "0") {
        htUpdateValuesbe2d7ec9(3, 1);
    } else if (yupanaSelected == "1") {
        htUpdateValuesbe2d7ec9(5, 1);
    } else if (yupanaSelected == "2") {
        htUpdateValuesbe2d7ec9(10, 0);
    } else if (yupanaSelected == "3") {
        htUpdateValuesbe2d7ec9(3, 0);
    } else if (yupanaSelected == "4") {
        htUpdateValuesbe2d7ec9(2, 0);
    }
}

function htFillYupanaMultYupana0(value, times)
{
    lValues = htFillYupanaDecimalValuesWithRepetition("#yupana1", value, times, 5, yupanaClasses);
    rValues = lValues.slice();
    htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', lValues);
    rValues[0] = times;
    htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', rValues);
}

function htFillWriteTableBody(tableId, horizontalVector, verticalVector, productVector) {
    const $tableElement = $(tableId);

    var totalRows = productVector.length;
    var rowspan = totalRows + 1;
    var horizontalLength = horizontalVector.length;
    var verticalLength = verticalVector.length;
    var productRC = horizontalLength * verticalLength ;
    var horizontalIdx = 0; 
    var productIdx = 0; 
    var colors = [ "lightyellow", "lightgreen", "lightgray", "#FFA8B5", "E48E65" ];
    var initialColorIdx = 0;
    for (let i = 0; productIdx < totalRows; i++) {
        var row = "<tr>";
        if (i == 0) {
            for (let j = 0 ; j < verticalLength; j++) {
                row += "<td style=\"background-color: lightblue\"><img id=\"imgres0"+j+"\" onclick=\"htImageZoom('imgres0"+j+"', '0%')\" src=\"images/HistoryTracers/Maya_"+verticalVector[j]+".png\" /></td>";
            }
            row += "<td style=\"background-color: lightblue\" rowspan=\""+rowspan+"\"> = </td><td style=\"background-color: lightblue\">&nbsp;</td></tr>";
            $tableElement.append(row);
            var idx = 0;
            if (horizontalLength != totalRows) {
                for (let w =  horizontalLength; w < totalRows; w++) {
                    row = "<tr><td style=\"background-color: lightblue\">&nbsp;</td>";
                    for (let j = 0 ; j < verticalLength; j++) {
                        row += (j == 0) ? "<td style=\"background-color: "+colors[0]+"\"><img class=\"imgAddProd\" id=\"addprod"+productIdx+"\" onclick=\"htImageZoom('imgprod"+productIdx+"', '0%')\" src=\"\" /></td>": "<td>&nbsp;</td>";
                    }
                    row += htAddTDtoGradeTable(i*1000, rowspan++, productVector[productIdx], -1, "background-color: "+colors[idx], true);
                    row += "</tr>";
                    productIdx++;

                    if (totalRows == 5) {
                        if ( (horizontalLength == 3 && verticalLength == 3) || ((horizontalLength != 3 || verticalLength != 3) && w != horizontalLength)) {
                            idx++;
                        }
                    } else if (totalRows == 4 && (horizontalLength == 3 || verticalLength == 3)) {
                        idx++;
                    }

                    $tableElement.append(row);
                }
            }
            if (totalRows == 5) {
                if ((horizontalLength != 3 || verticalLength != 3) && (horizontalLength == 2 || verticalLength == 2)) { 
                    initialColorChange = 1;
                }
            } else if (totalRows == 4) {
                initialColorChange = (horizontalLength == 3 || verticalLength == 3) ? 0 : 1;
            } else if (totalRows == 3 && (horizontalLength == 1 || verticalLength == 1)) {
                initialColorChange = 1;
            }
            continue;
        }

        var currentHorizontal = horizontalVector[horizontalIdx]; 
        row += htAddTDtoGradeTable(i*1000, rowspan++, currentHorizontal, -1, "background-color: lightblue", true);

        var currentColorIdx = initialColorIdx;
        for (let j = 0 ; j < verticalLength; j++) {
            var currentTotal = currentHorizontal*verticalVector[j];
            var additional = -1;
            if (currentTotal > 19) {
                currentTotal = currentHorizontal;
                additional = verticalVector[j];
            }
            row += htAddTDtoGradeTable(i*100, rowspan++, currentTotal, additional, "background-color: "+colors[currentColorIdx], false);
            currentColorIdx++;
        }
        row += htAddTDtoGradeTable(i*10, rowspan++, productVector[productIdx], -1, "background-color: "+colors[currentColorIdx - 1], true);
        row += "</tr>";
        initialColorIdx++;
        $tableElement.append(row);

        horizontalIdx++;
        productIdx++;
    }
}

function htFillCalcTable6481070f0 (tableId) {
    const $tableElement = $(tableId);

    if ($tableElement.length === 0) {
        return;
    }
    $tableElement.empty();
    initialColorChange = 0;

    var first = parseInt($("#firstV").val());
    firstVector = htMesoamericanNumberOrder(first);

    var second = parseInt($("#secondV").val());
    secondVector = htMesoamericanNumberOrder(second);

    htFillWriteMesoTableHeader(tableId, secondVector);

    var product = first * second;
    mayaProductVector = htMesoamericanNumberOrder(product);
    $("#thirdV").val(product);

    if (firstVector.length > 1) {
        firstVector.reverse();
    }

    if (secondVector.length > 1) {
        secondVector.reverse();
    }

    if (mayaProductVector.length > 1) {
        mayaProductVector.reverse();
    }


    htFillWriteTableBody(tableId, firstVector, secondVector, mayaProductVector);
}

function htChangeCleanUnused() {
        $(".imgAdd").each(function(index, element) {
            $(this).remove();
        });

        $(".timesAdd").each(function(index, element) {
            $(this).remove();
        });
}

function htChangeCalcTable6481070f0 (tableId) {
    const $tableElement = $(tableId);

    if ($tableElement.length === 0) {
        return;
    }

    if (mayaProductVector.length == 0) {
        return;
    }

    var verticalLength = secondVector.length;
    var horizontalLength = firstVector.length;
    var productLength = mayaProductVector.length;
    if (horizontalLength == 1 && verticalLength == 1 && productLength > 1) {
        htChangeCleanUnused();

        $($(".imgAddProd").get().reverse()).each(function(index, element) {
            $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[0]+".png");
        });

        $(".resChanged").each(function(index, element) {
            $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[1]+".png");
        });
        return;
    }

    htChangeCleanUnused();

    var verticalLengthP1 = secondVector.length + 1;
    var productIdx = initialColorChange;
    var cell = 1;
    var row = 2;

    var additional = productIdx - 1;
    $($(".imgAddProd").get().reverse()).each(function(index, element) {
        if (additional < 0) { 
            return false;
        }

        $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[additional]+".png");
        additional--;
    });

    
    var test = (horizontalLength == 1 && verticalLength == 1 && productLength > 1);
    $(".resChanged").each(function(index, element) {
        if (test) {
            $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[index]+".png");
        } else {
            if (index < verticalLength ) {
                $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[productIdx]+".png");
                productIdx++;
            } else {
                if ( (cell % verticalLength) == 0) {
                    $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[productIdx]+".png");
                    productIdx++;
                    row++;
                } else {
                    $(this).attr("src", "images/HistoryTracers/Maya_0.png");
                }
                if (productIdx >= productLength) {
                    return false;
                }
            }
            cell++;
        }
    });
}


function htLoadExercise() {
    $( "#ia2yupana0" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        if (value > 99999) {
            $(this).val(999);
        } else if (value < 0) {
            $(this).val(0);
        }

        htCleanYupanaDecimalValues('#yupana1', 5);
        lValues = htFillYupanaDecimalValues('#yupana1', value, 5, 'red_dot_right_up');
        rValues = htFillYupanaDecimalValues('#yupana1', $("#ia2yupana1").val(), 5, 'blue_dot_right_bottom');
    });

    $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        if (value > 99999) {
            $(this).val(999);
        } else if (value < 0) {
            $(this).val(0);
        }

        htCleanYupanaDecimalValues('#yupana1', 5);
        lValues = htFillYupanaDecimalValues('#yupana1', $("#ia2yupana0").val(), 5, 'red_dot_right_up');
        rValues = htFillYupanaDecimalValues('#yupana1', value, 5, 'blue_dot_right_bottom');
    });

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var sel = $(this).val();
        htCleanYupanaDecimalValues('#yupana1', 5);
        var value0 = $("#ia2yupana0").val();
        var value1 = $("#ia2yupana1").val();
        $("#tc7f1").html("");
        var errmsg = "";
        if (sel == "mult") {
            if (value0 < 0 || value0 > 9) {
                errmsg += mathKeywords[6]+ " "+value0+". ";
                value0 = 0;
            }

            if (value1 < 0 || value1 > 9) {
                errmsg += mathKeywords[6]+ " "+value1+". ";
                value1 = 0;
            }


            htFillYupanaMultYupana0(value0, value1);
            htCleanYupanaDecimalValues('#yupana1', 5);
            var result = value0 * value1;
            resultValues = htFillYupanaDecimalValues('#yupana1', result, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', resultValues);
            htMultMakeMultiplicationTableText(value0, value1, '#yupana1', '#tc7f1');
            htFillYupanaDecimalOperator('#yupana1', '#op', 5, 'x');
        } else if (sel == "sum") {
            if (value0 < 0 || value0 > 99999) {
                errmsg += mathKeywords[6]+ " "+value0+". ";
                value0 = 0;
            }

            if (value1 < 0 || value1 > 99999) {
                errmsg += mathKeywords[6]+ " "+value1+". ";
                value1 = 0;
            }

            htCleanYupanaDecimalValues('#yupana1', 5);
            lValues = htFillYupanaDecimalValues('#yupana1', value0, 5, 'red_dot_right_up');
            rValues = htFillYupanaDecimalValues('#yupana1', value1, 5, 'blue_dot_right_bottom');
            htCleanYupanaDecimalValues('#yupana1', 5);
            var totals = htSumYupanaVectors(lValues, rValues);
            htFillYupanaDecimalValues('#yupana1', totals, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', totals);
            htWriteYupanaSumMovement(lValues, rValues, '#yupana1', 5, '#tc7f1');
            htFillYupanaDecimalOperator('#yupana1', '#op', 5, '+');
            htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', lValues);
            htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', rValues);
        }
        $("#mathmessage").html(errmsg);
    });

    $( "input[name='yupanaradio2']" ).on( "change", function() {
        yupanaSelected = $(this).val();
        htResetValuesbe2d7ec9();

        htUpdateYupanabe2d7ec9(leftbe2d7ec9, rightbe2d7ec9);
    });

    $("#traineeUp3").on("click", function() {
        htSetValuesbe2d7ec9();

        var totals = htSumYupanaVectors(rvalues2, lvalues2);
        htCleanYupanaDecimalValues('#yupana0', 2);
        htFillYupanaDecimalValues('#yupana0', totals, 2, 'red_dot_right_up');
    });

    $("#traineeDown3").on("click", function() {
        htResetValuesbe2d7ec9();
        htUpdateYupanabe2d7ec9(leftbe2d7ec9, rightbe2d7ec9);
    });

    $("#firstV").on("keyup", function() {
        var val = $(this).val();
        if (val > 999) {
            $(this).val(999);
        } else if (val < 0) {
            $(this).val(0);
        }
    });

    $("#secondV").on("keyup", function() {
        var val = $(this).val();
        if (val > 999) {
            $(this).val(999);
        } else if (val < 0) {
            $(this).val(0);
        }
    });

    $("#equalCalc").on("click", function() {
        htFillCalcTable6481070f0 ("#calcGrid");
    });

    $("#changeResult").on("click", function() {
        htChangeCalcTable6481070f0 ("#calcGrid");
    });

    htFillCalcTable6481070f0 ("#calcGrid");

    htWriteNavigation(["indigenous_who", "myths_believes"]);

    return false;
}
