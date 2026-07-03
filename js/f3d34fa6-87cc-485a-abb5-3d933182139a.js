// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorf3d34fa6 = undefined;

function htLoadExercise() {
    if (localAnswerVectorf3d34fa6 == undefined) {
        localAnswerVectorf3d34fa6 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorf3d34fa6);
    }

    return false;
}

function htCheckAnswers()
{
 //   var vector = [0, 1, 1, 1, 0, 0, 0, 1, 1];
    if (localAnswerVectorf3d34fa6 != undefined) {
        for (let i = 0; i < localAnswerVectorf3d34fa6.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorf3d34fa6[i], "#answer"+i, "#explanation"+i);
        }
    }
}

