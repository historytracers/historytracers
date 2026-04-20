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

    htWriteMultiplicationTable("#mParent1", 1);
    htWriteMultiplicationTable("#mParent2", -1);

    htFillMultiplicationTable("chart4", 1, 1, false, true);
    htFillMultiplicationTable("chart5", -1, -1, false, true);

    return false;
}
