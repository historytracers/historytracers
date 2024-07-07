// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector588c52dc = undefined;

function htLoadExercise() {
    if (localAnswerVector588c52dc == undefined) {
        localAnswerVector588c52dc = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector588c52dc);
    }

    htAddTreeReflection("#myFirstReflection");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector588c52dc != undefined) {
        for (let i = 0; i < localAnswerVector588c52dc.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector588c52dc[i], "#answer"+i, "#explanation"+i);
        }
    }
}

