// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation("first_steps");
    htWriteMultiplicationTable("#mParent6", 6);

    var xVector =  [ 0, 1,  2,  3,  4,  5,  6,  7,  8,  9, 10];
    var yVector2 = [ 0, 2,  4,  6,  8, 10, 12, 14, 16, 18, 20];
    var yVector3 = [ 0, 3,  6,  9, 12, 15, 18, 21, 24, 27, 30];
    var yVector6 = [ 0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60];

    htFillMultiplicationTable("chart1", 6, 6, false);

    var chart2Options = {
        "datasets": [
                    {
                        data : yVector2,
                        label : mathKeywords[16]+"2",
                        fill : false
                    },
                    {
                        data : yVector3,
                        label : mathKeywords[16]+"4",
                        fill : false
                    },
                    {
                        data : yVector6,
                        label : mathKeywords[16]+"6",
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
        "ymax": 60,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart2Options);

    htFillMultiplicationTable("chart3", 7, 7, false);
    htFillMultiplicationTable("chart4", 0, 7, false);

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

