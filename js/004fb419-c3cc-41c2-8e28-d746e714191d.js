// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector004fb419 = undefined;

function htLoadExercise() {
    if (localAnswerVector004fb419 == undefined) {
        localAnswerVector004fb419 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector004fb419);
    }

    htWriteNavigation("literature");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector004fb419 != undefined) {
        for (let i = 0; i < localAnswerVector004fb419.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector004fb419[i], "#answer"+i, "#explanation"+i);
        }
    }
}

