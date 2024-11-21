// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector9b824032 = undefined;

function htLoadExercise() {
    if (localAnswerVector9b824032 == undefined) {
        localAnswerVector9b824032 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector9b824032);
    }

    $('table').each(function() {
        if (!$(this).hasClass('book_navigation')) {
            $(this).addClass('three_table_bg');
        }
    });

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector9b824032 != undefined) {
        for (let i = 0; i < localAnswerVector9b824032.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector9b824032[i], "#answer"+i, "#explanation"+i);
        }
    }
}

