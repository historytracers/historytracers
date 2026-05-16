// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

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
    htSetImageSrc("mamut", "images/MexicoCityMuseo/Mamute.jpg");
    htSetImageSrc("imgPoint", "images/BritishMuseum/mid_DSC_0597.jpg");
    htSetImageSrc("imgAtlatl", "images/MetropolitanMuseum/1987.394.70.jpeg");
    htSetImageSrc("imgMV", "images/PLOS/pone.0141923.g006.png");

    return false;
}
