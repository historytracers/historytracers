// SPDX-License-Identifier: GPL-3.0-or-later

var rValues = [];
var lValues = [];

var mayaProductVector = [];
var firstVector = [];
var secondVector = [];

var localAnswerVector648170f0 = undefined;
var currentExampleIdx = 0;
var initialColorChange = 0;

function htFillYupanaMultYupana0(value, times)
{
    lValues = htFillYupanaDecimalValuesWithRepetition("#yupana0", value, times, 5, yupanaClasses);
    rValues = lValues.slice();
    htWriteYupanaValuesOnHTMLTable('#vl', '#yupana0', lValues);
    rValues[0] = times;
    htWriteYupanaValuesOnHTMLTable('#vr', '#yupana0', rValues);
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
    if (localAnswerVector648170f0 == undefined) {
        localAnswerVector648170f0 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector648170f0);
    }

    htWriteNavigation();

    var times = $("#ia2yupana1").val();
    var value = $("#ia2yupana0").val();

    $( "#ia2yupana0" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        if (value < 0 || value > 9) {
            $(this).val(0);
        }
    });

    $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        if (value < 0 || value > 9) {
            $(this).val(0);
        }
    });

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var sel = $(this).val();
        htCleanYupanaDecimalValues('#yupana0', 5);
        value = $("#ia2yupana0").val();
        times = $("#ia2yupana1").val();
        htFillYupanaMultYupana0(value, times);
        if (sel == "values") {
            htCleanYupanaAdditionalColumn('#yupana0', 5, '#tc6f');
            $('#tc7f1').html("");
            htFillYupanaMultYupana0(value, times);
        } else {
            htCleanYupanaDecimalValues('#yupana0', 5);
            var result = value * times;
            resultValues = htFillYupanaDecimalValues('#yupana0', result, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', resultValues);
            htMultMakeMultiplicationTableText(value, times, '#yupana0', '#tc7f1');
        }
    });

    var rvalues = [];
    var lvalues = [];

    htCleanYupanaDecimalValues('#yupana1', 5);
    lvalues = htFillYupanaDecimalValues('#yupana1', "55555", 5, 'red_dot_right_up');
    rvalues = htFillYupanaDecimalValues('#yupana10', "55555", 5, 'blue_dot_right_bottom');
    var totals = htSumYupanaVectors(lvalues, rvalues);
    htFillYupanaDecimalValues('#yupana1', totals, 5, 'red_dot_right_up');
    htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', totals);
    htWriteYupanaSumMovement(lvalues, rvalues, '#yupana1', 5, '#tc7f1');

    htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', lvalues);
    htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', rvalues);

    $('.ordercheck').change(function(){
        var id = $(this).attr("id");
        if (id == undefined) {
            return;
        }

        if ($(this).is(':checked')) {
            htSetMultColors("multexample1", "red", id);
        } else {
            htSetMultColors("multexample1", "black", id);
        }
    });

    $("#traineeUp3").on("click", function() {
        if (currentExampleIdx >= 4) {
            currentExampleIdx = 0;
        }

        $("#imgm"+currentExampleIdx).attr("src", "images/HistoryTracers/Maya_2.png");
        currentExampleIdx++;
    });

    $("#traineeDown3").on("click", function() {
        for (let i = 0; i < 4; i++) {
            $("#imgm"+i).attr("src", "");
        }
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

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector648170f0 != undefined) {
        for (let i = 0; i < localAnswerVector648170f0.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector648170f0[i], "#answer"+i, "#explanation"+i);
        }
    }
}

