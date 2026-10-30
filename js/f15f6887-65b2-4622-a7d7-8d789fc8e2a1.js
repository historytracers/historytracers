// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorf15f6887 = undefined;

function htLoadContent() {
    htWriteNavigation();

    htWriteMultiplicationTable("#mParent8", 8);
    htWriteMultiplicationTable("#mParent9", 9);
    return false;
}

function htLoadExercise() {
    if (localAnswerVectorf15f6887 == undefined) {
        localAnswerVectorf15f6887 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorf15f6887);
    }
}

function htCheckAnswers() {
    if (localAnswerVectorf15f6887 != undefined) {
        for (let i = 0; i < localAnswerVectorf15f6887.length; i++) {
            htCheckExerciseAnswer("exercise" + i, localAnswerVectorf15f6887[i], "#answer" + i, "#explanation" + i);
        }
    }
}
