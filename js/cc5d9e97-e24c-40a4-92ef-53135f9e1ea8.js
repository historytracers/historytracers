// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorcc5d9e97 = undefined;

function htLoadExercise() {
    if (localAnswerVectorcc5d9e97 == undefined) {
        localAnswerVectorcc5d9e97 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorcc5d9e97);
    }
}

function htLoadContent() {
    htWriteNavigation();

    htSetImageSrc("imgAsia", "images/Mapswire/mapswire-continent_as-printable-map-asia-robinson-267.jpg");
    htSetImageSrc("imgBering", "images/ElSalvadorMuseo/Bering.jpg");
    htSetImageSrc("imgDNA", "images/HistoryTracers/DNA.png");
    htSetImageSrc("imgNature", "images/Nature/41598_2019_48093_Fig3_HTML.webp");
    htSetImageSrc("imgRNA", "images/HistoryTracers/RNA.png");
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorcc5d9e97 != undefined) {
        for (let i = 0; i < localAnswerVectorcc5d9e97.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorcc5d9e97[i], "#answer"+i, "#explanation"+i);
        }
    }
}

