// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector9cd69f67 = undefined;

function htLoadExercise() {
    if (localAnswerVector9cd69f67 == undefined) {
        localAnswerVector9cd69f67 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector9cd69f67);
    }

    htAddTreeReflection("#myFirstReflection", 55);
    htAddTreeReflection("#GenealogicalLimit", 72);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector9cd69f67 != undefined) {
        for (let i = 0; i < localAnswerVector9cd69f67.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector9cd69f67[i], "#answer"+i, "#explanation"+i);
        }
    }
}

