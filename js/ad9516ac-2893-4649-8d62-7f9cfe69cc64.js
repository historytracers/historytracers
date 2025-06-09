// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorad9516ac = undefined;

function htLoadExercise() {
    if (localAnswerVectorad9516ac == undefined) {
        localAnswerVectorad9516ac = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorad9516ac);
    }

    htWriteNavigation("first_steps");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorad9516ac != undefined) {
        for (let i = 0; i < localAnswerVectorad9516ac.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorad9516ac[i], "#answer"+i, "#explanation"+i);
        }
    }
}

