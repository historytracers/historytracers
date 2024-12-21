// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector1009578c = undefined;

function htLoadExercise() {
    if (localAnswerVector1009578c == undefined) {
        localAnswerVector1009578c = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector1009578c);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector1009578c != undefined) {
        for (let i = 0; i < localAnswerVector1009578c.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector1009578c[i], "#answer"+i, "#explanation"+i);
        }
    }
}

