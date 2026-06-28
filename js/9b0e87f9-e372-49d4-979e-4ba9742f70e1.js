// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htSetImageSrc("imgRH", "images/HistoryTracers/Right_Hand.png");
    htSetImageSrc("imgLH", "images/HistoryTracers/Left_Hand.png");
    htSetImageSrc("imgESA2", "images/ESA/Planck_history_of_Universe.jpg");
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector != undefined) {
        for (let i = 0; i < localAnswerVector.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector[i], "#answer"+i, "#explanation"+i);
        }
    }
}

function htLoadContent() {
    htWriteNavigation();

    htWriteMultiplicationTable("#mParent2", 2);

    return false;
}
