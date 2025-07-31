// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation("first_steps");

    htWriteMultiplicationTable("#mParent7", 7);
    htWriteMultiplicationTable("#mParent10", 10);

    $(".multexample").hover(function(){
        var id = $(this).attr("id");
        htChangeMultUniqueDigitStyle(id, "red");
    }, function(){
        var id = $(this).attr("id");
        htChangeMultUniqueDigitStyle(id, "black");
    });

    $(".sumexample1").hover(function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "red");
    }, function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "black");
    });

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

    var xVector1 = [ 1,   1.5,  2,  2.5,  3,  3.5,  4,  4.5,  5,  5.5,  6,  6.5,  7,  7.5,  8];
    var yVector1 = [ 70, null, 70, null, 70, null, 70, null, 70, null, 70, null, 70, null, 15];

    var chart1Options = {
        "datasets": [
                    {
                        data : yVector1,
                        label : mathKeywords[24],
                        fill : false
                    }],
        "chartId" : "chart1",
        "yType" : "linear",
        "xVector" : xVector1,
        "xLable": mathKeywords[25],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 100,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart1Options);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector != undefined) {
        for (let i = 0; i < localAnswerVector.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector[i], "#answer"+i, "#explanation"+i);
        }
    }
}

