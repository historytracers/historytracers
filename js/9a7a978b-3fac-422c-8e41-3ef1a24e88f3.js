// SPDX-License-Identifier: GPL-3.0-or-later

var rValues = [];
var lValues = [];

var localAnswerVector9a7a978b = undefined;

function htFillYupanaMultYupana0(value, times)
{
    lValues = htFillYupanaDecimalValuesWithRepetition("#yupana0", value, times, 5, yupanaClasses);
    rValues = lValues.slice();
    htWriteYupanaValuesOnHTMLTable('#vl', '#yupana0', lValues);
    rValues[0] = times;
    htWriteYupanaValuesOnHTMLTable('#vr', '#yupana0', rValues);
}

function htLoadExercise() {
    if (localAnswerVector9a7a978b == undefined) {
        localAnswerVector9a7a978b = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector9a7a978b);
    }

    htWriteNavigation();

    var times = $("#ia2yupana1").val();
    var value = $("#ia2yupana0").val();

    $( "#ia2yupana0" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        if (value < 0 || value > 9) {
            $(this).val(0);
        }
    });

    $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        if (value < 0 || value > 9) {
            $(this).val(0);
        }
    });

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var sel = $(this).val();
        htCleanYupanaDecimalValues('#yupana0', 5);
        value = $("#ia2yupana0").val();
        times = $("#ia2yupana1").val();
        htFillYupanaMultYupana0(value, times);
        if (sel == "values") {
            htCleanYupanaAdditionalColumn('#yupana0', 5, '#tc6f');
            $('#tc7f1').html("");
            htFillYupanaMultYupana0(value, times);
        } else {
            htCleanYupanaDecimalValues('#yupana0', 5);
            var result = value * times;
            resultValues = htFillYupanaDecimalValues('#yupana0', result, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', resultValues);
            htMultMakeMultiplicationTableText(value, times, '#yupana0', '#tc7f1');
        }
    });

    var rvalues = [];
    var lvalues = [];

    htCleanYupanaDecimalValues('#yupana1', 5);
    lvalues = htFillYupanaDecimalValues('#yupana1', "55555", 5, 'red_dot_right_up');
    rvalues = htFillYupanaDecimalValues('#yupana10', "55555", 5, 'blue_dot_right_bottom');
    var totals = htSumYupanaVectors(lvalues, rvalues);
    htFillYupanaDecimalValues('#yupana1', totals, 5, 'red_dot_right_up');
    htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', totals);
    htWriteYupanaSumMovement(lvalues, rvalues, '#yupana1', 5, '#tc7f1');

    htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', lvalues);
    htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', rvalues);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector9a7a978b != undefined) {
        for (let i = 0; i < localAnswerVector9a7a978b.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector9a7a978b[i], "#answer"+i, "#explanation"+i);
        }
    }
}

