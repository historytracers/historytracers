// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorcabc9843 = undefined;

function htLoadContent() {
    htWriteNavigation();
    return false;
}

function htLoadExercise() {
    if (localAnswerVectorcabc9843 == undefined) {
        localAnswerVectorcabc9843 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorcabc9843);
    }
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorcabc9843 != undefined) {
        for (let i = 0; i < localAnswerVectorcabc9843.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorcabc9843[i], "#answer"+i, "#explanation"+i);
        }
    }
}
