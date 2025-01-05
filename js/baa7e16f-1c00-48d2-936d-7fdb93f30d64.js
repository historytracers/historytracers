// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorbaa7e16f = undefined;

function htLoadExercise() {
    if (localAnswerVectorbaa7e16f == undefined) {
        localAnswerVectorbaa7e16f = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorbaa7e16f);
    }

    htAddReligionReflection("#htReligiousReflection");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorbaa7e16f != undefined) {
        for (let i = 0; i < localAnswerVectorbaa7e16f.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorbaa7e16f[i], "#answer"+i, "#explanation"+i);
        }
    }
}

