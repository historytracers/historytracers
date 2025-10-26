// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector17c76904 = undefined;

function htLoadExercise() {
    if (localAnswerVector17c76904 == undefined) {
        localAnswerVector17c76904 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector17c76904);
    }

    htPlotConstantChart('chart0', 10, keywords[44], keywords[45]);
    htPlotConstantChart('chart1', 7, keywords[44], keywords[45]);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector17c76904 != undefined) {
        for (let i = 0; i < localAnswerVector17c76904.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector17c76904[i], "#answer"+i, "#explanation"+i);
        }
    }
}

