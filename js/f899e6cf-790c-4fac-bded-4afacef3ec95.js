// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorf899e6cf = undefined;

function htLoadExercise() {
    if (localAnswerVectorf899e6cf == undefined) {
        localAnswerVectorf899e6cf = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorf899e6cf);
    }
}

function htLoadContent() {
    htWriteNavigation();
    htAddReligionReflection("#htReligiousReflection");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorf899e6cf != undefined) {
        for (let i = 0; i < localAnswerVectorf899e6cf.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorf899e6cf[i], "#answer"+i, "#explanation"+i);
        }
    }
}

