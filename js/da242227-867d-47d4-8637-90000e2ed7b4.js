// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorda242227 = undefined;

function htLoadExercise() {
    if (localAnswerVectorda242227 == undefined) {
        localAnswerVectorda242227 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorda242227);
    }
}

function htLoadContent() {
    htWriteNavigation();

    
    htSetImageSrc("imgCopanTemple", "images/Copan/Temple16Copan.png")
    htSetImageSrc("imgCopanTemple2", "images/Copan/Templo16Inside.jpg")
    htSetImageSrc("imgCopanTemple3", "images/Copan/Temple16External.jpg")
    htSetImageSrc("imgCopanWholeTextSA", "images/Copan/CopanWholeTextStelaAltar.png")
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorda242227 != undefined) {
        for (let i = 0; i < localAnswerVectorda242227.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorda242227[i], "#answer"+i, "#explanation"+i);
        }
    }
}

