// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector6d519d82 = undefined;

function htLoadExercise() {
    if (localAnswerVector6d519d82 == undefined) {
        localAnswerVector6d519d82 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector6d519d82);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector6d519d82 != undefined) {
        for (let i = 0; i < localAnswerVector6d519d82.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector6d519d82[i], "#answer"+i, "#explanation"+i);
        }
    }
}

