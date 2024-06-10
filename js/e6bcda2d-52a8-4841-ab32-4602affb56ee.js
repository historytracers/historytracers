// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectore6bcda2d = undefined;

function htLoadExercise() {
    if (localAnswerVectore6bcda2d == undefined) {
        localAnswerVectore6bcda2d = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectore6bcda2d);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectore6bcda2d != undefined) {
        for (let i = 0; i < localAnswerVectore6bcda2d.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectore6bcda2d[i], "#answer"+i, "#explanation"+i);
        }
    }
}

