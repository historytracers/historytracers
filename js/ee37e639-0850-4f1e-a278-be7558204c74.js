// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectoree37e639 = undefined;

function htLoadExercise() {
    if (localAnswerVectoree37e639 == undefined) {
        localAnswerVectoree37e639 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectoree37e639);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectoree37e639 != undefined) {
        for (let i = 0; i < localAnswerVectoree37e639.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectoree37e639[i], "#answer"+i, "#explanation"+i);
        }
    }
}

