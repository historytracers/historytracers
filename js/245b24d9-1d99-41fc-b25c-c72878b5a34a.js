// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector245b24d9 = undefined;

function htLoadExercise() {
    if (localAnswerVector245b24d9 == undefined) {
        localAnswerVector245b24d9 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector245b24d9);
    }

    htWriteNavigation("history");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector245b24d9 != undefined) {
        for (let i = 0; i < localAnswerVector245b24d9.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector245b24d9[i], "#answer"+i, "#explanation"+i);
        }
    }
}

