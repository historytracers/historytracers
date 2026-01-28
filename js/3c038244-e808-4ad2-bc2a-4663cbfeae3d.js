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

    var xVector1 = [ 0, 0.5,  1,  1.5, 2,  2.5, 3,  3.5, 4,  4.5, 5,  5.5, 6,  6.5, 7,  7.5, 8,  8.5, 9,  9.5, 10];
    var yVector3 = [ 0, null, 1, null, 2, null, 3, null, 4, null, 5, null, 6, null, 7, null, 8, null, 9, null, 10];

    var chart3Options = {
        "datasets": [
                    {
                        data : yVector3,
                        label : mathKeywords[16]+"1",
                        fill : false
                    }],
        "chartId" : "chart3",
        "yType" : "linear",
        "xVector" : xVector1,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart3Options);


    return false;
}
