// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectora86f373e = undefined;

function htLoadExercise() {
    if (localAnswerVectora86f373e == undefined) {
        localAnswerVectora86f373e = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectora86f373e);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectora86f373e != undefined) {
        for (let i = 0; i < localAnswerVectora86f373e.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectora86f373e[i], "#answer"+i, "#explanation"+i);
        }
    }
}

