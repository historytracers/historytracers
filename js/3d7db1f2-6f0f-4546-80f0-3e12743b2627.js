// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector3d7db1f2 = undefined;

function htLoadContent() {
    htWriteNavigation();

    htSetImageSrc("sumHandOneL", "images/HistoryTracers/1Left_Hand_Small.png");
    htSetImageSrc("sumHandOneR", "images/HistoryTracers/1Right_Hand_Small.png");
    htSetImageSrc("sumHand2L", "images/HistoryTracers/Left_Hand.png");
    htSetImageSrc("sumHand2R", "images/HistoryTracers/Right_Hand.png");
    htSetImageSrc("sumHand5L", "images/HistoryTracers/Left_Hand.png");
    htSetImageSrc("sumHand5R", "images/HistoryTracers/Right_Hand.png");

    var weekStart = htCalendarWeekStart();
    htWriteCalendarFigure("#htSumWeekCalendarFigure", weekStart, 1);
    htWriteCalendarFigure("#htSumFourWeekCalendarFigure", weekStart, 4);
    return false;
}

function htLoadExercise() {
    if (localAnswerVector3d7db1f2 == undefined) {
        localAnswerVector3d7db1f2 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector3d7db1f2);
    }
}

function htCheckAnswers() {
    if (localAnswerVector3d7db1f2 != undefined) {
        for (let i = 0; i < localAnswerVector3d7db1f2.length; i++) {
            htCheckExerciseAnswer("exercise" + i, localAnswerVector3d7db1f2[i], "#answer" + i, "#explanation" + i);
        }
    }
}
