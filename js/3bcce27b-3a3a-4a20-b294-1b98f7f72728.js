// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

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
    htWriteNavigation();
    $("#htChinaZhongguo").html(keywords[137]);

    
    htSetImageSrc("img2", "images/HistoryTracers/pyramid.jpg")
    htSetImageSrc("img3", "images/HistoryTracers/pentagonal_pyramid.jpg")
    htSetImageSrc("img4", "images/Xunantunich/WitzXunantunich.jpg")
    htSetImageSrc("imgChinese", "images/BritishMuseum/mid_RRC5932_14.jpg")
    return false;
}
