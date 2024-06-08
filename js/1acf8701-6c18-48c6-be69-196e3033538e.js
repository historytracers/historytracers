// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector1acf8701 = undefined;

function htLoadExercise() {
    if (localAnswerVector1acf8701 == undefined) {
        localAnswerVector1acf8701 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector1acf8701);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector1acf8701 != undefined) {
        for (let i = 0; i < localAnswerVector1acf8701.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector1acf8701[i], "#answer"+i, "#explanation"+i);
        }
    }
}

