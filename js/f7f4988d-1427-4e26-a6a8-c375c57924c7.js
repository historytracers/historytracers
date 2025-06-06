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
        "datasets": [
                    {
                        data : yVector1,
                        label : mathKeywords[16]+"1",
                        fill : true
                    }
        ],
        "chartId" : "chart1",
        "yType" : "linear",
        "xVector" : xVector1,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart1Options);

    var xVector2 = [ 0, 1, 2, 3, 4,  5,  6,  7,  8,  9, 10];
    var yVector2 = [ 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];

    var chart2Options = {
        "datasets": [
                    {
                        data : yVector2,
                        label : mathKeywords[16]+"2",
                        fill : false
                    }],
        "chartId" : "chart2",
        "yType" : "linear",
        "xVector" : xVector2,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "datasetFill" : false,
        "ymin": 0,
        "ymax": 20,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart2Options);

    var yVector3 = [ 0, 1, 2, 3, 4,  5,  6,  7,  8,  9, 10];
    var chart3Options = {
        "datasets": [
                    {
                        data : yVector3,
                        label : mathKeywords[16]+"1",
                        fill : false
                    },
                    {
                        data : yVector2,
                        label : mathKeywords[16]+"2",
                        fill : false
                    }
        ],
        "chartId" : "chart3",
        "yType" : "linear",
        "xVector" : xVector2,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "datasetFill" : false,
        "ymin": 0,
        "ymax": 20,
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

