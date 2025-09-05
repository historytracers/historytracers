// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector1c00e340 = undefined;

function htLoadExercise() {
    if (localAnswerVector1c00e340 == undefined) {
        localAnswerVector1c00e340 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector1c00e340);
    }

    htWriteNavigation();

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector1c00e340 != undefined) {
        for (let i = 0; i < localAnswerVector1c00e340.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector1c00e340[i], "#answer"+i, "#explanation"+i);
        }
    }
}

