// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }
}

function htLoadContent() {
    htWriteNavigation();

    htFillMultiplicationTable("chart4", 0, 5, false, true);



    htSetImageSrc("CaralH1", "images/Caral/CaralPiramideH1.jpg");
    htSetImageSrc("imgCopanTemple", "images/Copan/Temple16Copan.png");
    htSetImageSrc("imgCopanTemple2", "images/Copan/Templo16Inside.jpg");
    htSetImageSrc("imgCopanTemple3", "images/Copan/Temple16External.jpg");
    htSetImageSrc("imgm12", "images/HistoryTracers/Maya_12.png");
    htSetImageSrc("imgm3", "images/HistoryTracers/Maya_3.png");
    htSetImageSrc("imgm4", "images/HistoryTracers/Maya_4.png");
    htSetImageSrc("imgMoutains", "images/Mapswire/continent_na-physical-map-north-america-robinson-269.jpg");
    htSetImageSrc("JC", "images/JoyaCeren/JoyaCeren.jpg");
    htSetImageSrc("miPueblito", "images/MiPueblito/MiPueblito.jpg");
    htSetImageSrc("qp", "images/Caral/QuipuPanel.png");
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

