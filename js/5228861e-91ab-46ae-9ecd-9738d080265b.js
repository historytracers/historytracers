// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector5228861e = undefined;

function htLoadExercise() {
    if (localAnswerVector5228861e == undefined) {
        localAnswerVector5228861e = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector5228861e);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector5228861e != undefined) {
        for (let i = 0; i < localAnswerVector5228861e.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector5228861e[i], "#answer"+i, "#explanation"+i);
        }
    }
}

