// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector31cbdd3c = undefined;

function htLoadExercise() {
    if (localAnswerVector31cbdd3c == undefined) {
        localAnswerVector31cbdd3c = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector31cbdd3c);
    }


    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector31cbdd3c != undefined) {
        for (let i = 0; i < localAnswerVector31cbdd3c.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector31cbdd3c[i], "#answer"+i, "#explanation"+i);
        }
    }
}

