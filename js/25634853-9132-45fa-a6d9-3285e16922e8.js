// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htSetImageSrc("imgCD", "images/BritishMuseum/mid_01020674_001.jpg");
    htSetImageSrc("imgKL", "images/Ashmolean/KingList.jpg");
    htSetImageSrc("imgLVR", "images/Louvre/0001315485_OG.JPG");
    htSetImageSrc("imgPBM", "images/BritishMuseum/mid_WCT24211.jpg");
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector != undefined) {
        for (let i = 0; i < localAnswerVector.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector[i], "#answer"+i, "#explanation"+i);
        }
    }
}

function htLoadContent() {
    htAddTreeReflection("#myFirstReflection", 55);
    $("#SumerianKingListDesc").html(keywords[90]);

    htWriteNavigation();

    return false;
}
