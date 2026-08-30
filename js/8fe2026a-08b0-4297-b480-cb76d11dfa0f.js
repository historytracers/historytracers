// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector8fe2026a = undefined;

function htLoadContent() {
    htWriteNavigation();
}

function htLoadExercise() {
    if (localAnswerVector8fe2026a == undefined) {
        localAnswerVector8fe2026a = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector8fe2026a);
    }

    
    htSetImageSrc("imgGrape", "images/HistoryTracers/grape.jpg")
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector8fe2026a != undefined) {
        for (let i = 0; i < localAnswerVector8fe2026a.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector8fe2026a[i], "#answer"+i, "#explanation"+i);
        }
    }
}
