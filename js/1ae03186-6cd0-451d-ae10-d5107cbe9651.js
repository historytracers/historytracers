// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector1ae03186 = undefined;

function htLoadExercise() {
    if (localAnswerVector1ae03186 == undefined) {
        localAnswerVector1ae03186 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector1ae03186);
    }

    htWriteNavigation("first_steps");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector1ae03186 != undefined) {
        for (let i = 0; i < localAnswerVector1ae03186.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector1ae03186[i], "#answer"+i, "#explanation"+i);
        }
    }
}

