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

    var year = new Date().getFullYear() - 378;
    $("#iage").html(year);

    
    htSetImageSrc("Copan", "images/Copan/JuegoDePelotaCopan.jpg")
    htSetImageSrc("Experiment", "images/Mapswire/continent_an-where-is-antarctica.png")
    htSetImageSrc("Experiment2", "images/Mapswire/mapswire-continent_as-plain-map-asia-robinson-267_geolocation.jpg")
    return false;
}
