// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation(["first_steps", "myths_believes"]);

    var xVector1 = [ 1, 1.5,  2,  2.5, 3,  3.5, 4,  4.5, 5,  5.5, 6,  6.5, 7,  7.5, 8,  8.5, 9,  9.5, 10,  10.5, 11,  11.5, 12];
    var yVector1 = [ 1, null, 2, null, 3, null, 4, null, 5, null, 6, null, 7, null, 8, null, 9, null, 10,  null, 11,  null, 12];

    var chart1Options = {
        "datasets": [
                    {
                        data : yVector1,
                        label : mathKeywords[19],
                        fill : false
                    }],
        "chartId" : "chart1",
        "yType" : "linear",
        "xVector" : xVector1,
        "xLable": mathKeywords[18],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 12,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart1Options);

    var xVector2 = [ 1, 1.5,  2,  2.5, 3,  3.5, 4,  4.5, 5,  5.5, 6,  6.5, 7,  7.5, 8,  8.5, 9,  9.5, 10,  10.5, 11,  11.5, 12,  12.5, 13,  13.5, 14];
    var yVector2 = [ 5, null, 5, null, 5, null, 5, null, 5, null, 5, null, 5, null, 5, null, 5, null,  5,  null,  5,  null,  5,  null,  5,  null,  5];

    var chart2Options = {
        "datasets": [
                    {
                        data : yVector2,
                        label : mathKeywords[21],
                        fill : false
                    }],
        "chartId" : "chart2",
        "yType" : "linear",
        "xVector" : xVector2,
        "xLable": mathKeywords[20],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart2Options);

    var xVector3 = [ 1, 1.5,  2,  2.5, 3,  3.5, 4,  4.5, 5,  5.5, 6,  6.5, 7,  7.5, 8,  8.5, 9];
    var yVector3 = [ 2, null, 2, null, 2, null, 2, null, 2, null, 2, null, 2, null, 2, null, 2];

    var chart3Options = {
        "datasets": [
                    {
                        data : yVector3,
                        label : mathKeywords[22],
                        fill : false
                    }],
        "chartId" : "chart3",
        "yType" : "linear",
        "xVector" : xVector3,
        "xLable": mathKeywords[23],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart3Options);

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

