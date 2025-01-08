// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector376a5f3c = undefined;

function htLoadExercise() {
    if (localAnswerVector376a5f3c == undefined) {
        localAnswerVector376a5f3c = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector376a5f3c);
    }

    htAddReligionReflection("#htReligiousReflection");
    $("#SumerianKingListDesc").html(keywords[90]);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector376a5f3c != undefined) {
        for (let i = 0; i < localAnswerVector376a5f3c.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector376a5f3c[i], "#answer"+i, "#explanation"+i);
        }
    }
}

