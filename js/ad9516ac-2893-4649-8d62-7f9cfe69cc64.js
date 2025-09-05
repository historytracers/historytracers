// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorad9516ac = undefined;

function htLoadExercise() {
    if (localAnswerVectorad9516ac == undefined) {
        localAnswerVectorad9516ac = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorad9516ac);
    }

    htWriteMultiplicationTable("#mParent4", 4);
    htWriteMultiplicationTable("#mParent5", 5);


    var xVector =  [ 0, 1, 2,  3,  4,  5,  6,  7,  8,  9, 10];
    var yVector2 = [ 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    var yVector4 = [ 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40];

    htFillMultiplicationTable("chart1", 4, 4, false, true);

    var chart2Options = {
        "datasets": [
                    {
                        data : yVector2,
                        label : mathKeywords[16]+"2",
                        fill : false
                    },
                    {
                        data : yVector4,
                        label : mathKeywords[16]+"4",
                        fill : false
                    }
        ],
        "chartId" : "chart2",
        "yType" : "linear",
        "xVector" : xVector,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "datasetFill" : false,
        "ymin": 0,
        "ymax": 40,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart2Options);

    htFillMultiplicationTable("chart3", 5, 5, false, true);

    htFillMultiplicationTable("chart4", 0, 5, false, true);

    htWriteNavigation();

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorad9516ac != undefined) {
        for (let i = 0; i < localAnswerVectorad9516ac.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorad9516ac[i], "#answer"+i, "#explanation"+i);
        }
    }
}

