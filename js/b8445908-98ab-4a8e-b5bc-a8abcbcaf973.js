// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorb8445908 = undefined;

function htLoadExercise() {
    if (localAnswerVectorb8445908 == undefined) {
        localAnswerVectorb8445908 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorb8445908);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorb8445908 != undefined) {
        for (let i = 0; i < localAnswerVectorb8445908.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorb8445908[i], "#answer"+i, "#explanation"+i);
        }
    }
}

