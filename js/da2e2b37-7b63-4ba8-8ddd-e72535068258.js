// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorDa2e2b37 = undefined;
var localCounterDa2e2b37 = 0;

function htLoadContent() {
    htSetImageSrc("lefthand", "images/HistoryTracers/0Left_Hand_Small.png");
    htSetImageSrc("righthand", "images/HistoryTracers/0Right_Hand_Small.png");
    return false;
}

function htLoadExercise() {
    localCounterDa2e2b37 = 0;

    htWriteNavigation();

    if (localAnswerVectorDa2e2b37 == undefined) {
        localAnswerVectorDa2e2b37 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorDa2e2b37);
    }

    $("#traineeUp0").off("click").on("click", function() {
        localCounterDa2e2b37++;
        if (localCounterDa2e2b37 > 10) { localCounterDa2e2b37 = 10; }
        htSetImageForMembers('#lefthand', 'Left_Hand_Small.png', '#righthand', 'Right_Hand_Small.png', localCounterDa2e2b37);
    });

    $("#traineeDown0").off("click").on("click", function() {
        localCounterDa2e2b37--;
        if (localCounterDa2e2b37 < 0) { localCounterDa2e2b37 = 0; }
        htSetImageForMembers('#lefthand', 'Left_Hand_Small.png', '#righthand', 'Right_Hand_Small.png', localCounterDa2e2b37);
    });

    htSetImageForMembers('#lefthand', 'Left_Hand_Small.png', '#righthand', 'Right_Hand_Small.png', localCounterDa2e2b37);
}

function htCheckAnswers() {
    if (localAnswerVectorDa2e2b37 != undefined) {
        for (let i = 0; i < localAnswerVectorDa2e2b37.length; i++) {
            htCheckExerciseAnswer("exercise" + i, localAnswerVectorDa2e2b37[i], "#answer" + i, "#explanation" + i);
        }
    }
}
