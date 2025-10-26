// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorc83c7c27 = undefined;

function htLoadExercise() {
    if (localAnswerVectorc83c7c27 == undefined) {
        localAnswerVectorc83c7c27 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorc83c7c27);
    }


    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorc83c7c27 != undefined) {
        for (let i = 0; i < localAnswerVectorc83c7c27.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorc83c7c27[i], "#answer"+i, "#explanation"+i);
        }
    }
}

