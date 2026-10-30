// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector3d7db1f2 = undefined;

function htLoadContent() {
    htWriteNavigation();
    return false;
}

function htLoadExercise() {
    if (localAnswerVector3d7db1f2 == undefined) {
        localAnswerVector3d7db1f2 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector3d7db1f2);
    }
}

function htCheckAnswers() {
    if (localAnswerVector3d7db1f2 != undefined) {
        for (let i = 0; i < localAnswerVector3d7db1f2.length; i++) {
            htCheckExerciseAnswer("exercise" + i, localAnswerVector3d7db1f2[i], "#answer" + i, "#explanation" + i);
        }
    }
}
