// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorde3d4fb3 = undefined;

function htLoadExercise() {
    if (localAnswerVectorde3d4fb3 == undefined) {
        localAnswerVectorde3d4fb3 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers();
    }

    var gregoryYear = new Date().getFullYear() ;
    var localCalendar = $("#site_calendar").val();
    var yupanaYear = htConvertGregorianYear(localCalendar, gregoryYear);

    $("#ia2yupana").html(yupanaYear);
    htFillYupanaValues('#yupana0', yupanaYear, 5, '#tc6f', 'red_dot_right_up');


    var lValues = htFillYupanaDecimalValuesWithRepetition("#yupana1", 2, 3, 5, yupanaClasses);
    rValues = lValues.slice();
    htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', lValues);
    rValues[0] = 3;
    htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', rValues);

    htCleanYupanaDecimalValues('#yupana1', 5);
    resultValues = htFillYupanaDecimalValues('#yupana1', 6, 5, 'red_dot_right_up');
    htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', resultValues);
    htMultMakeMultiplicationTableText(2, 3, '#yupana1', '#tc7f1');

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorde3d4fb3 != undefined) {
        for (let i = 0; i < localAnswerVectorde3d4fb3.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorde3d4fb3[i], "#answer"+i, "#explanation"+i);
        }
    }
}
