// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector2acc8c3a = undefined;

var slideIndexae2acc8c3a = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndexae2acc8c3a += n;
    if (slideIndexae2acc8c3a == x.length) {
        slideIndexae2acc8c3a = 0;
    } else if (slideIndexae2acc8c3a < 0) {
        slideIndexae2acc8c3a = x.length - 1;
    }

    htShowSlideDivs(x, slideIndexae2acc8c3a);
}

function htLoadExercise() {
    htAddAlterQImages(".htSlides");
    htPlusDivs(0);

    if (localAnswerVector2acc8c3a == undefined) {
        localAnswerVector2acc8c3a = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector2acc8c3a);
    }

    htWriteNavigation("first_steps");

    var xVector1 = [ 0, 0.5,  1,  1.5, 2,  2.5, 3,  3.5, 4,  4.5, 5,  5.5, 6,  6.5, 7,  7.5, 8,  8.5, 9,  9.5, 10];
    var yVector1 = [ 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0];

    var xVector2 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var yVector2 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var chart1Options = {
        "chartId" : "chart1",
        "yVector" : yVector1,
        "yLable": mathKeywords[14],
        "yType" : "linear",
        "xVector" : xVector1,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "datasetFill" : false,
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart1Options);

    var chart2Options = {
        "chartId" : "chart2",
        "yVector" : yVector2,
        "yLable": mathKeywords[14],
        "yType" : "linear",
        "xVector" : xVector2,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "datasetFill" : false,
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart2Options);

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

