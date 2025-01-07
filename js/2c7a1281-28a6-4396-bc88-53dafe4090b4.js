// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector2c7a1281 = undefined;

function htLoadExercise() {
    if (localAnswerVector2c7a1281 == undefined) {
        localAnswerVector2c7a1281 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector2c7a1281);
    }

    var applied = 0;
    $('table').each(function() {
        if (!$(this).hasClass('book_navigation') && applied == 0) {
            $(this).addClass('three_table_bg');
            applied = 1;
        }
    });

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector2c7a1281 != undefined) {
        for (let i = 0; i < localAnswerVector2c7a1281.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector2c7a1281[i], "#answer"+i, "#explanation"+i);
        }
    }
}

