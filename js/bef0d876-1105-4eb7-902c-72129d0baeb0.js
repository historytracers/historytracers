// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorbef0d876 = undefined;

function htLoadExercise() {
    if (localAnswerVectorbef0d876 == undefined) {
        localAnswerVectorbef0d876 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorbef0d876);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorbef0d876 != undefined) {
        for (let i = 0; i < localAnswerVectorbef0d876.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorbef0d876[i], "#answer"+i, "#explanation"+i);
        }
    }
}

