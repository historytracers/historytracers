// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector2acc8c3a = undefined;
var localCounter2acc8c3a = 0;

var slideIndexae2acc8c3a = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    if (!x) {
        return;
    }

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

    htWriteNavigation();

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

    var xVector00 = [ 0, 0.5,  1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8,  8.5, 9,  9.5, 10];
    var yVector00 = [ 0, 0.0,  0, 0.0, 0, 0.0, 0, 0.0, 0, 0.0, 0, 0.0, 0, 0.0, 0, 0.0, 0,  0.0, 0,  0.0, 0];
    var chart0Options = {
        "datasets": [
                    {
                        data : yVector00,
                        label : mathKeywords[16]+"0",
                        fill : false
                    }],
        "chartId" : "chart3",
        "yType" : "linear",
        "xVector" : xVector00,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart0Options);

    htWriteMultiplicationTable("#mParent0", 0);
    htWriteMultiplicationTable("#mParent1", 1);

    htFillBoxesMultiplicationChart("chart4");

    
    htSetImageSrc("imgTeotihuacanGeneral", "images/Teotihuacan/TeotihuacanGeneral.jpg")
    htSetImageSrc("lefthand", "images/HistoryTracers/0Left_Hand_Small.png")
    htSetImageSrc("righthand", "images/HistoryTracers/0Right_Hand_Small.png")
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

function htFillBoxesMultiplicationChart(target)
{
    if ($("#"+target).length == 0) {
        return;
    }

    var labels = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
    var datasets = [];
    for (var unit = 1; unit <= 10; unit++) {
        var values = [];
        for (var i = 0; i < labels.length; i++) {
            values.push(labels[i] >= unit ? 1 : 0);
        }
        datasets.push({
            data : values,
            label : mathKeywords[16]+unit,
            backgroundColor : "#E67E22",
            borderColor : "#A85B1E",
            borderWidth : 1
        });
    }

    var canvas = document.getElementById(target);
    var existing = Chart.getChart(canvas);
    if (existing) {
        existing.destroy();
    }

    new Chart(canvas.getContext("2d"), {
        type : "bar",
        data : {
            labels : labels,
            datasets : datasets
        },
        options : {
            responsive : false,
            maintainAspectRatio : false,
            scales : {
                y : {
                    stacked : true,
                    min : 0,
                    max : 10,
                    ticks : {
                        stepSize : 1
                    },
                    title : {
                        display : true,
                        text : mathKeywords[14]
                    }
                },
                x : {
                    stacked : true,
                    title : {
                        display : true,
                        text : mathKeywords[15]
                    }
                }
            },
            plugins : {
                legend : {
                    display : false
                }
            }
        }
    });
}


