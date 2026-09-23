// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorfe5132a9 = undefined;

function htLoadExercise() {
    if (localAnswerVectorfe5132a9 == undefined) {
        localAnswerVectorfe5132a9 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorfe5132a9);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorfe5132a9 != undefined) {
        for (let i = 0; i < localAnswerVectorfe5132a9.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorfe5132a9[i], "#answer"+i, "#explanation"+i);
        }
    }
}

function htLoadContent() {
    htWriteNavigation();

    return false;
}
