// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector2a2cbd69 = undefined;

function htLoadExercise() {
    if (localAnswerVector2a2cbd69 == undefined) {
        localAnswerVector2a2cbd69 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector2a2cbd69);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector2a2cbd69 != undefined) {
        for (let i = 0; i < localAnswerVector2a2cbd69.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector2a2cbd69[i], "#answer"+i, "#explanation"+i);
        }
    }
}

