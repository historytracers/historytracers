// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector8bbd4fa3 = undefined;

function htLoadContent() {
    htWriteNavigation();

    htSetImageSrc("imgLH", "images/HistoryTracers/Left_Hand.png");
    htSetImageSrc("imgRH", "images/HistoryTracers/Right_Hand.png");

    htWriteMultiplicationTable("#mParent2", 2);
    htWriteMultiplicationTable("#mParent3", 3);
    return false;
}

function htLoadExercise() {
    if (localAnswerVector8bbd4fa3 == undefined) {
        localAnswerVector8bbd4fa3 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector8bbd4fa3);
    }
}

function htCheckAnswers() {
    if (localAnswerVector8bbd4fa3 != undefined) {
        for (let i = 0; i < localAnswerVector8bbd4fa3.length; i++) {
            htCheckExerciseAnswer("exercise" + i, localAnswerVector8bbd4fa3[i], "#answer" + i, "#explanation" + i);
        }
    }
}
