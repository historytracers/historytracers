// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation("first_steps");

    var xVector1 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var yVector1 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    var chart1Options = {
        "chartId" : "chart1",
        "yVector" : yVector1,
        "yLable": mathKeywords[14],
        "yType" : "linear",
        "xVector" : xVector1,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "datasetFill" : true,
        "ymin": 0,
        "ymax": 10,
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

