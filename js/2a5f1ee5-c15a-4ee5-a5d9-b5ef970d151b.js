// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htSetImageSrc("imgCaral", "images/Caral/CaralPiramideH1.jpg");
    htSetImageSrc("imgPottery", "images/BritishMuseum/mid_DSC04993.jpg");
    htSetImageSrc("imgPottery1", "images/BritishMuseum/mid_00237212_001.jpg");
    htSetImageSrc("imgPottery2", "images/MetropolitanMuseum/DP23088.jpg");
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
    $("#htJapanNipponNihonKoku").html(keywords[139]);

    return false;
}
