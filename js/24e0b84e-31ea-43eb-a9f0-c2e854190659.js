// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector24e0b84e = undefined;

function htLoadExercise() {
    if (localAnswerVector24e0b84e == undefined) {
        localAnswerVector24e0b84e = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector24e0b84e);
    }

    htWriteNavigation("indigenous_who");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector24e0b84e != undefined) {
        for (let i = 0; i < localAnswerVector24e0b84e.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector24e0b84e[i], "#answer"+i, "#explanation"+i);
        }
    }
}
