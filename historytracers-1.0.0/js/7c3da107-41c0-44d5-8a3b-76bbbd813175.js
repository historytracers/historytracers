// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector7c3da107 = undefined;

function htLoadExercise() {
    if (localAnswerVector7c3da107 == undefined) {
        localAnswerVector7c3da107 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector7c3da107);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector7c3da107  != undefined) {
        for (let i = 0; i < localAnswerVector7c3da107.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector7c3da107[i], "#answer"+i, "#explanation"+i);
        }
    }
}

