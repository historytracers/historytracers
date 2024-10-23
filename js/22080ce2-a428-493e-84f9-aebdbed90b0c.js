// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector22080ce2 = undefined;

function htLoadExercise() {
    if (localAnswerVector22080ce2 == undefined) {
        localAnswerVector22080ce2 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector22080ce2);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector22080ce2 != undefined) {
        for (let i = 0; i < localAnswerVector22080ce2.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector22080ce2[i], "#answer"+i, "#explanation"+i);
        }
    }
}

