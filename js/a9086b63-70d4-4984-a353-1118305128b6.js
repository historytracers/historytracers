// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htSetImageSrc("imgHHB", "images/HistoryTracers/HTHumanBody.jpg");
    htSetImageSrc("metate3", "images/Teotihuacan/MetateTeotihuacan.jpg");
    htSetImageSrc("imgSCP", "images/SanAndres/SanAndresCoveredPyramid.jpg");
    htSetImageSrc("imgCPE", "images/CahalPech/CahalPechExcavation.jpg");
    htSetImageSrc("cr0", "images/SanJoseCRJade/CRSuportCeramica.jpg");
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

    return false;
}
