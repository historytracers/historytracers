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
    htFillMultiplicationTable("chart1", 0, 9, false, true);

    htFillMultiplicationTable("chart2", 0, 9, false, false);

    
    htSetImageSrc("ChronologyTeotihuacan", "images/Teotihuacan/TeotihuacanGeneral.jpg")
    htSetImageSrc("ChronologyTeotihuacan2", "images/Teotihuacan/TeotihuacanMountains.jpg")
    htSetImageSrc("imgCopanTemple", "images/Copan/Temple16Copan.png")
    htSetImageSrc("imgMoutains", "images/Mapswire/continent_na-physical-map-north-america-robinson-269.jpg");
    htSetImageSrc("pyramid", "images/HistoryTracers/pyramid.jpg")
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

