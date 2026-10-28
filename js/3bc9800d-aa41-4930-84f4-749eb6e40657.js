// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector3bc9800d = undefined;

function htLoadContent() {
    htWriteNavigation();

    htSetImageSrc("imgLH", "images/HistoryTracers/Left_Hand.png");
    htSetImageSrc("imgRH", "images/HistoryTracers/Right_Hand.png");

    htWriteMultiplicationTable("#mParent4", 4);
    htWriteMultiplicationTable("#mParent5", 5);
    return false;
}

function htLoadExercise() {
    if (localAnswerVector3bc9800d == undefined) {
        localAnswerVector3bc9800d = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector3bc9800d);
    }
}

function htCheckAnswers() {
    if (localAnswerVector3bc9800d != undefined) {
        for (let i = 0; i < localAnswerVector3bc9800d.length; i++) {
            htCheckExerciseAnswer("exercise" + i, localAnswerVector3bc9800d[i], "#answer" + i, "#explanation" + i);
        }
    }
}
