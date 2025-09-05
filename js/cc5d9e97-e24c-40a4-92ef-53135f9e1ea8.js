// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorcc5d9e97 = undefined;

function htLoadExercise() {
    if (localAnswerVectorcc5d9e97 == undefined) {
        localAnswerVectorcc5d9e97 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorcc5d9e97);
    }

    htWriteNavigation();

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorcc5d9e97 != undefined) {
        for (let i = 0; i < localAnswerVectorcc5d9e97.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorcc5d9e97[i], "#answer"+i, "#explanation"+i);
        }
    }
}

