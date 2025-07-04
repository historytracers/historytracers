// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation("first_steps");
    htWriteMultiplicationTable("#mParent8", 8);

    var xVector =  [ 0, 1,  2,  3,  4,  5,  6,  7,  8,  9, 10];
    var yVector2 = [ 0, 2,  4,  6,  8, 10, 12, 14, 16, 18, 20];
    var yVector4 = [ 0, 4,  8, 12, 16, 20, 24, 28, 32, 36, 40];
    var yVector8 = [ 0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80];

    htFillMultiplicationTable("chart1", 8, 8, false);

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
                    },
                    {
                        data : yVector8,
                        label : mathKeywords[16]+"8",
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
        "ymax": 80,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart2Options);

    htFillMultiplicationTable("chart3", 9, 9, false);
    htFillMultiplicationTable("chart4", 0, 9, false);

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

