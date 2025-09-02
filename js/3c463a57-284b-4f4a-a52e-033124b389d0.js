// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector3c463a57 = undefined;

function htLoadExercise() {
    if (localAnswerVector3c463a57 == undefined) {
        localAnswerVector3c463a57 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector3c463a57);
    }

    htAddTreeReflection("#myFirstReflection", 55);
    htAddTreeReflection("#GenealogicalLimit", 72);

    htWriteNavigation(["families", "myths_believes"]);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector3c463a57 != undefined) {
        for (let i = 0; i < localAnswerVector3c463a57.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector3c463a57[i], "#answer"+i, "#explanation"+i);
        }
    }
}

