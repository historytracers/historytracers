// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation("first_steps");

    htWriteMultiplicationTable("#mtTwo", "", 2);

    htWriteMultiplicationTable("#mtThree", "", 3);

    htFillMultiplicationTable("chart1", 1, 1, true);

    htFillMultiplicationTable("chart2", 2, 2, false);

    htFillMultiplicationTable("chart3", 1, 2, false);

    htFillMultiplicationTable("chart4", 3, 3, false);

    htFillMultiplicationTable("chart5", 1, 3, false);

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

