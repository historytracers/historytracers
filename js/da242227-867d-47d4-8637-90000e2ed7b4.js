// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorda242227 = undefined;

function htLoadExercise() {
    if (localAnswerVectorda242227 == undefined) {
        localAnswerVectorda242227 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorda242227);
    }

    htWriteNavigation("literature");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorda242227 != undefined) {
        for (let i = 0; i < localAnswerVectorda242227.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorda242227[i], "#answer"+i, "#explanation"+i);
        }
    }
}

