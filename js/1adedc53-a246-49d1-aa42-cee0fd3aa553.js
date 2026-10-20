// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector1adedc53 = undefined;

function htLoadContent() {
    htWriteNavigation();

    return false;
}

function htLoadExercise() {
    if (localAnswerVector1adedc53 == undefined) {
        localAnswerVector1adedc53 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector1adedc53);
    }
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector1adedc53 != undefined) {
        for (let i = 0; i < localAnswerVector1adedc53.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector1adedc53[i], "#answer"+i, "#explanation"+i);
        }
    }
}
