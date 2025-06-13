// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorad9516ac = undefined;

function htLoadExercise() {
    if (localAnswerVectorad9516ac == undefined) {
        localAnswerVectorad9516ac = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorad9516ac);
    }

    var xVector =  [ 0, 1, 2,  3,  4,  5,  6,  7,  8,  9, 10];
    var yVector0 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var yVector1 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var yVector2 = [ 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    var yVector3 = [ 0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30];
    var yVector4 = [ 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
    var yVector5 = [ 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

    var chart1Options = {
        "datasets": [
                    {
                        data : yVector4,
                        label : mathKeywords[16]+"4",
                        fill : true
                    }
        ],
        "chartId" : "chart1",
        "yType" : "linear",
        "xVector" : xVector,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 40,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart1Options);

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

    var chart3Options = {
        "datasets": [
                    {
                        data : yVector5,
                        label : mathKeywords[16]+"5",
                        fill : false
                    }
        ],
        "chartId" : "chart3",
        "yType" : "linear",
        "xVector" : xVector,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "datasetFill" : false,
        "ymin": 0,
        "ymax": 50,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart3Options);

    var chart4Options = {
        "datasets": [
                    {
                        data : yVector0,
                        label : mathKeywords[16]+"0",
                        fill : false
                    },
                    {
                        data : yVector1,
                        label : mathKeywords[16]+"1",
                        fill : false
                    },
                    {
                        data : yVector2,
                        label : mathKeywords[16]+"2",
                        fill : false
                    },
                    {
                        data : yVector3,
                        label : mathKeywords[16]+"3",
                        fill : false
                    },
                    {
                        data : yVector4,
                        label : mathKeywords[16]+"4",
                        fill : false
                    },
                    {
                        data : yVector5,
                        label : mathKeywords[16]+"5",
                        fill : false
                    }
        ],
        "chartId" : "chart4",
        "yType" : "linear",
        "xVector" : xVector,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "datasetFill" : false,
        "ymin": 0,
        "ymax": 50,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart4Options);

    htWriteNavigation("first_steps");

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

