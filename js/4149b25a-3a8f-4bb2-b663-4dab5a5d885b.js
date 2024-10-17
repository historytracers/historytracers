// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector4149b25a = undefined;

function htLoadExercise() {
    if (localAnswerVector4149b25a == undefined) {
        localAnswerVector4149b25a = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector4149b25a);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector4149b25a != undefined) {
        for (let i = 0; i < localAnswerVector4149b25a.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector4149b25a[i], "#answer"+i, "#explanation"+i);
        }
    }
}

