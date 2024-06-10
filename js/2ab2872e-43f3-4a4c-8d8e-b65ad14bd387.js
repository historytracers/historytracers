// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector2ab2872e = undefined;

function htLoadExercise() {
    if (localAnswerVector2ab2872e == undefined) {
        localAnswerVector2ab2872e = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector2ab2872e);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector2ab2872e != undefined) {
        for (let i = 0; i < localAnswerVector2ab2872e.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector2ab2872e[i], "#answer"+i, "#explanation"+i);
        }
    }
}

