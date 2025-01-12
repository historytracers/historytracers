// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector3ea21df7 = undefined;

function htLoadExercise() {
    if (localAnswerVector3ea21df7 == undefined) {
        localAnswerVector3ea21df7 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector3ea21df7);
    }

    htWriteNavigation("families");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector3ea21df7 != undefined) {
        for (let i = 0; i < localAnswerVector3ea21df7.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector3ea21df7[i], "#answer"+i, "#explanation"+i);
        }
    }
}

