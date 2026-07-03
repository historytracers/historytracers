// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector033077a0 = undefined;

function htLoadExercise() {
    if (localAnswerVector033077a0 == undefined) {
        localAnswerVector033077a0 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector033077a0);
    }

    var xVector1 = [ 0, 0.5, 1.0, 1.5, 2.0];
    var yVector1 = [ 5, 5, 5, 5, 5];

    var chart1Options = {
        "chartId" : "chart1",
        "yVector" : yVector1,
        "yLable": keywords[51],
        "yType" : "linear",
        "xVector" : xVector1,
        "xLable": keywords[51],
        "xType" : "linear",
        "datasetFill" : true
    };
    htPlotConstantContinuousChart(chart1Options);

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var sel = $(this).val();
        var result = 0;
        var resultValues = 0;
        if (sel == "area") {
            htCleanYupanaDecimalValues('#yupana0', 5);
            result = 4;
            resultValues = htFillYupanaDecimalValues('#yupana0', result, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', resultValues);
            htMultMakeMultiplicationTableText(2, 2, '#yupana0', '#tc7f1');
        } else if (sel == "volume"){
            htCleanYupanaDecimalValues('#yupana0', 5);
            result = 16;
            resultValues = htFillYupanaDecimalValues('#yupana0', result, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', resultValues);
            htMultMakeMultiplicationTableText(4, 2, '#yupana0', '#tc7f1');
        }
    });

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector033077a0 != undefined) {
        for (let i = 0; i < localAnswerVector033077a0.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector033077a0[i], "#answer"+i, "#explanation"+i);
        }
    }
}
