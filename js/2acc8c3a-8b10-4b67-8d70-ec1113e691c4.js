// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector2acc8c3a = undefined;
var localCounter2acc8c3a = 0;

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
    localCounter2acc8c3a = 0;
    htAddAlterQImages(".htSlides");
    htPlusDivs(0);

    htWriteNavigation("first_steps");

    if (localAnswerVector2acc8c3a == undefined) {
        localAnswerVector2acc8c3a = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector2acc8c3a);
    }

    $("#traineeUp0").on("click", function() {
        localCounter2acc8c3a++;
        if (localCounter2acc8c3a > 10) { localCounter2acc8c3a = 10; }
        htSetImageForMembers('#lefthand', 'Left_Hand_Small.png', '#righthand', 'Right_Hand_Small.png', localCounter2acc8c3a);
    });

    $("#traineeDown0").on("click", function() {
        localCounter2acc8c3a--;
        if (localCounter2acc8c3a < 0) { localCounter2acc8c3a = 0; }
        htSetImageForMembers('#lefthand', 'Left_Hand_Small.png', '#righthand', 'Right_Hand_Small.png', localCounter2acc8c3a);
    });

    htSetImageForMembers('#lefthand', 'Left_Hand_Small.png', '#righthand', 'Right_Hand_Small.png', localCounter2acc8c3a);

    var xVector1 = [ 0, 0.5,  1,  1.5, 2,  2.5, 3,  3.5, 4,  4.5, 5,  5.5, 6,  6.5, 7,  7.5, 8,  8.5, 9,  9.5, 10];
    var yVector1 = [ 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0];

    var chart1Options = {
        "datasets": [
                    {
                        data : yVector1,
                        label : mathKeywords[16]+"0",
                        fill : false
                    }],
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

    var xVector2 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var yVector2 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var chart2Options = {
        "datasets": [
                    {
                        data : yVector2,
                        label : mathKeywords[16]+"0",
                        fill : false
                    }],
        "chartId" : "chart2",
        "yType" : "linear",
        "xVector" : xVector2,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart2Options);

    var xVector3 = [ 0, 0.5,  1,  1.5, 2,  2.5, 3,  3.5, 4,  4.5, 5,  5.5, 6,  6.5, 7,  7.5, 8,  8.5, 9,  9.5, 10];
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
        "xVector" : xVector3,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart3Options);

    var xVector4 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var yVector4 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    var chart4Options = {
        "datasets": [
                    {
                        data : yVector4,
                        label : mathKeywords[16]+"1",
                        fill : false
                    }],
        "chartId" : "chart4",
        "yType" : "linear",
        "xVector" : xVector4,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart4Options);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector2acc8c3a != undefined) {
        for (let i = 0; i < localAnswerVector2acc8c3a.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector2acc8c3a[i], "#answer"+i, "#explanation"+i);
        }
    }
}

