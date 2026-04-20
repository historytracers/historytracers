// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

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

function htLoadContent() {
    htWriteNavigation();

    htWriteMultiplicationTable("#mParent1", 1);
    htWriteMultiplicationTable("#mParent2", -1);

    htFillMultiplicationTable("chart4", 1, 1, false, true);
    htFillMultiplicationTable("chart5", -1, -1, false, true);

    var xVector1 = [ -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    var chart1Options = {
        "datasets": [
                    {
                        data : xVector1,
                        label : mathKeywords[16]+"1",
                        fill : false
                    }],
        "chartId" : "chart1",
        "yType" : "linear",
        "xVector" : xVector1,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": -10,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart1Options);

    return false;
}
