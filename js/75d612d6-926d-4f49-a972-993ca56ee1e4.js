// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htSetImageSrc("imgBZ0", "images/BingZhao/img-5.jpg");
    htSetImageSrc("imgGB", "images/BritishMuseum/mid_01289911_001.jpg");
    htSetImageSrc("imgLVR", "images/Louvre/0000166561_OG.JPG");
    htSetImageSrc("imgWALL", "images/UNESCO/site_0364_0028-1000-750-20250313170037.jpg");
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

    return false;
}
