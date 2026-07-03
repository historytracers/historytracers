// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htSetImageSrc("img2", "images/HistoryTracers/RHand_Grape.jpg");
    htSetImageSrc("img1", "images/HistoryTracers/Hand_Grape.jpg");
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

    htWriteMultiplicationTable("#mParent1", 1);
    htFillMultiplicationTable("chart3", 1, 1, false, false);

    return false;
}
