// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectora648cecf = undefined;

function htLoadExercise() {
    if (localAnswerVectora648cecf == undefined) {
        localAnswerVectora648cecf = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectora648cecf);
    }
}

function htLoadContent() {
    htWriteNavigation();

    htWriteMultiplicationTable("#mParent0", 0);
    htWriteMultiplicationTable("#mParent1", 1);

    var xVectorSteps = [ 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

    var yVector0Points = [ 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0, null, 0];
    var chart1Options = {
        "datasets": [
                    {
                        data : yVector0Points,
                        label : mathKeywords[16]+"0",
                        fill : false
                    }],
        "chartId" : "chart1",
        "yType" : "linear",
        "xVector" : xVectorSteps,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart1Options);

    var yVector1Points = [ 0, null, 1, null, 2, null, 3, null, 4, null, 5, null, 6, null, 7, null, 8, null, 9, null, 10];
    var chart2Options = {
        "datasets": [
                    {
                        data : yVector1Points,
                        label : mathKeywords[16]+"1",
                        fill : false
                    }],
        "chartId" : "chart2",
        "yType" : "linear",
        "xVector" : xVectorSteps,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart2Options);

    var yVector0Line = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var chart3Options = {
        "datasets": [
                    {
                        data : yVector0Line,
                        label : mathKeywords[16]+"0",
                        fill : false
                    }],
        "chartId" : "chart3",
        "yType" : "linear",
        "xVector" : xVectorSteps,
        "xLable": mathKeywords[15],
        "xType" : "linear",
        "ymin": 0,
        "ymax": 10,
        "useCallBack": false
    };
    htPlotConstantContinuousChart(chart3Options);

    htFillMultiplicationTable("chart4", 1, 1, false, true);

    htFillBoxesMultiplicationChart("chart5");

    htFillMultiplicationTable("chart6", 1, 1, true, true);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectora648cecf != undefined) {
        for (let i = 0; i < localAnswerVectora648cecf.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectora648cecf[i], "#answer"+i, "#explanation"+i);
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
            responsive : true,
            maintainAspectRatio : true,
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
