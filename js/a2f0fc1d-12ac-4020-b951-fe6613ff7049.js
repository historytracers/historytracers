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

    
    htSetImageSrc("img3", "images/Tula/TulaColumna.jpg")
    htSetImageSrc("img4", "images/Tula/CiudadTula.jpg")
    htSetImageSrc("img5", "images/Athens/ParthenonColumns.jpg")
    htSetImageSrc("imgLH", "images/HistoryTracers/Left_Hand.png")
    htSetImageSrc("imgRH", "images/HistoryTracers/Right_Hand.png")
    htSetImageSrc("z0", "images/Sadomba/Gourd.png")
    return false;
}
