// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector13ba52a9 = undefined;

function htLoadExercise() {
    if (localAnswerVector13ba52a9 == undefined) {
        localAnswerVector13ba52a9 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector13ba52a9);
    }

    htPlotConstantChart('chart0', 0, keywords[46], keywords[48]);


    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector13ba52a9 != undefined) {
        for (let i = 0; i < localAnswerVector13ba52a9.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector13ba52a9[i], "#answer"+i, "#explanation"+i);
        }
    }
}
