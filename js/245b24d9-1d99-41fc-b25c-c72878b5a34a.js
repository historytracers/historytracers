// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector245b24d9 = undefined;

function htLoadExercise() {
    if (localAnswerVector245b24d9 == undefined) {
        localAnswerVector245b24d9 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector245b24d9);
    }
}

function htLoadContent() {
    htWriteNavigation();
    $("#OriginHTMW").html(keywords[82]+" "+keywords[83]);

    htSetImageSrc("imgCaralPiramideH1", "images/Caral/CaralPiramideH1.jpg");
    htSetImageSrc("imgCW", "images/UNESCO/site_0438_0002.jpg");
    htSetImageSrc("imgAthens", "images/Athens/Erechtheion.jpg");
    htSetImageSrc("originmigration", "images/Mapswire/mapswire-world-political-white-equal_earth_journey.png");
    htSetImageSrc("imgMWPWEEC", "images/Mapswire/mapswire-world-political-white-equal_earth_cradle.png");
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector245b24d9 != undefined) {
        for (let i = 0; i < localAnswerVector245b24d9.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector245b24d9[i], "#answer"+i, "#explanation"+i);
        }
    }
}

