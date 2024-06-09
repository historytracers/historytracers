// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector81390684 = undefined;

function htLoadExercise() {
    if (localAnswerVector81390684 == undefined) {
        localAnswerVector81390684 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector81390684);
    }

    return false;
}

function htCheckAnswers()
{
    //var vector = [0, 1, 0, 1, 0, 0, 1, 0, 1];
    if (localAnswerVector81390684 != undefined) {
        for (let i = 0; i < localAnswerVector81390684.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector81390684[i], "#answer"+i, "#explanation"+i);
        }
    }
}

