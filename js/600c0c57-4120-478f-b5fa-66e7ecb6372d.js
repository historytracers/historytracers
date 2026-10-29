// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector600c0c57 = undefined;

function htLoadContent() {
    htWriteNavigation();

    htWriteMultiplicationTable("#mParent6", 6);
    htWriteMultiplicationTable("#mParent7", 7);
    return false;
}

function htLoadExercise() {
    if (localAnswerVector600c0c57 == undefined) {
        localAnswerVector600c0c57 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector600c0c57);
    }
}

function htCheckAnswers() {
    if (localAnswerVector600c0c57 != undefined) {
        for (let i = 0; i < localAnswerVector600c0c57.length; i++) {
            htCheckExerciseAnswer("exercise" + i, localAnswerVector600c0c57[i], "#answer" + i, "#explanation" + i);
        }
    }
}
