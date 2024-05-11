// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector883098fb = undefined;

function htLoadExercise() {
    if (localAnswerVector883098fb == undefined) {
        localAnswerVector883098fb = htLoadAnswersFromExercise();
    } else { 
        htResetAnswers(localAnswerVector883098fb);
        for (let i = 0; i < localAnswerVector883098fb.length; i++) {
            $("#answer"+i).text("");
            $("input[name=exercise"+i+"]").prop("checked", false);
        }
    }

    htPlotConstantChart('chart0', 3, keywords[46], keywords[47]);
    var xVector1 = [ 0, 1, 2, 3, 4, 5];
    var yVector1 = [ 3, 3, 3, 3, 3, 3];

    var chart1Options = {
        "chartId" : "chart1",
        "yVector" : yVector1,
        "yLable": keywords[48],
        "yType" : "linear",
        "xVector" : xVector1,
        "xLable": keywords[49],
        "xType" : "linear",
        "datasetFill" : false
    };
    htPlotConstantContinuousChart(chart1Options);

    var yVector2 = [ 3, 3, 3, 3, 3, 3];
    var xVector2 = [ 0, 0.00000001, 0.01, 0.001, 0.9, 1];

    var chart2Options = {
        "chartId" : "chart2",
        "yVector" : yVector2,
        "yLable": keywords[48],
        "yType" : "linear",
        "xVector" : xVector2,
        "xLable": keywords[49],
        "xType" : "logarithmic",
        "datasetFill" : false
    };
    htPlotConstantContinuousChart(chart2Options);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector883098fb != undefined) { 
        for (let i = 0; i < localAnswerVector883098fb.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector883098fb[i], "#answer"+i, "#explanation"+i);
        }   
    }
}
