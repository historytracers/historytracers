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

		htSetImageSrc("mp", "images/MachuPicchu/MachuPicchu2.jpg");
		htSetImageSrc("qp", "images/Caral/QuipuPanel.png");
		htSetImageSrc("imgCW", "images/UNESCO/site_0438_0002.jpg");
		htSetImageSrc('imgGeo24', 'images/Mapswire/mapswire-world-political-white-equal_earth_journey.png');
    htSetImageSrc("imgWALL", "images/UNESCO/site_0364_0028-1000-750-20250313170037.jpg");

    return false;
}
