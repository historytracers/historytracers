// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector648170f0 = undefined;

function htLoadExercise() {
    if (localAnswerVector648170f0 == undefined) {
        localAnswerVector648170f0 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector648170f0);
    }

    htWriteNavigation("first_steps");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector648170f0 != undefined) {
        for (let i = 0; i < localAnswerVector648170f0.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector648170f0[i], "#answer"+i, "#explanation"+i);
        }
    }
}

