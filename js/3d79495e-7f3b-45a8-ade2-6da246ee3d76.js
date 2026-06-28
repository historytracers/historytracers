// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }
}

function htLoadContent() {
    htWriteNavigation();

    htSetImageSrc("imgC1", "images/BritishMuseum/mid_01532055_001.jpg");
    htSetImageSrc("imgKL", "images/Ashmolean/KingList.jpg");
    htSetImageSrc("imgT1", "images/BritishMuseum/mid_00425090_001.jpg");
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

