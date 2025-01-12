// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector3b7f79c2 = undefined;

function htLoadExercise() {
    if (localAnswerVector3b7f79c2 == undefined) {
        localAnswerVector3b7f79c2 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector3b7f79c2);
    }

    htAddReligionReflection("#htReligiousReflection");
    $("#SumerianKingListDesc").html(keywords[90]);

    htWriteNavigation("families");

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector3b7f79c2 != undefined) {
        for (let i = 0; i < localAnswerVector3b7f79c2.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector3b7f79c2[i], "#answer"+i, "#explanation"+i);
        }
    }
}

