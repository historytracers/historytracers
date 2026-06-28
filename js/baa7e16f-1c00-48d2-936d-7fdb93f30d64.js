// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorbaa7e16f = undefined;

function htLoadExercise() {
    if (localAnswerVectorbaa7e16f == undefined) {
        localAnswerVectorbaa7e16f = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorbaa7e16f);
    }
}

function htLoadContent() {
    htWriteNavigation();
    htAddReligionReflection("#htReligiousReflection");



    htSetImageSrc("imgAtra", "images/BritishMuseum/mid_00032581_001.jpg");
    htSetImageSrc("imgCaralPiramideH1", "images/Caral/CaralPiramideH1.jpg");
    htSetImageSrc("imgE", "images/HistoryTracers/Enmebaragesi.png");
    htSetImageSrc("imgGilgamesh", "images/BritishMuseum/mid_00107404_001.jpg");
    htSetImageSrc("imgKL", "images/Ashmolean/KingList.jpg");
    htSetImageSrc("imgS", "images/Ashmolean/47565.jpg");
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorbaa7e16f != undefined) {
        for (let i = 0; i < localAnswerVectorbaa7e16f.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorbaa7e16f[i], "#answer"+i, "#explanation"+i);
        }
    }
}

