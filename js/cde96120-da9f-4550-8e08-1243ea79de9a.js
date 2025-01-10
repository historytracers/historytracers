// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorcde96120 = undefined;

function htLoadExercise() {
    if (localAnswerVectorcde96120 == undefined) {
        localAnswerVectorcde96120 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorcde96120);
    }

    htWriteNavigation("literature");
    htAddReligionReflection("#htReligiousReflection");

    $('table').each(function() {
        if (!$(this).hasClass('book_navigation')) {
            $(this).addClass('three_table_bg');
        }
    });

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorcde96120 != undefined) {
        for (let i = 0; i < localAnswerVectorcde96120.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorcde96120[i], "#answer"+i, "#explanation"+i);
        }
    }
}

