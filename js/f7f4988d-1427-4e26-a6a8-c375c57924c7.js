// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation();

    htWriteMultiplicationTable("#mParent2", 2);
    htWriteMultiplicationTable("#mParent3", 3);

    htFillMultiplicationTable("chart1", 1, 1, true, true);

    htFillMultiplicationTable("chart2", 2, 2, false, true);

    htFillMultiplicationTable("chart3", 1, 2, false, true);

    htFillMultiplicationTable("chart4", 3, 3, false, true);

    htFillMultiplicationTable("chart5", 1, 3, false, true);

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

