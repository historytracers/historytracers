// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector49c7f908 = undefined;

function htLoadExercise() {
    if (localAnswerVector49c7f908 == undefined) {
        localAnswerVector49c7f908 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector49c7f908);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector49c7f908 != undefined) {
        for (let i = 0; i < localAnswerVector49c7f908.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector49c7f908[i], "#answer"+i, "#explanation"+i);
        }
    }
}

