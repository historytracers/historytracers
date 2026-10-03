// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorf899e6cf = undefined;

function htLoadExercise() {
    if (localAnswerVectorf899e6cf == undefined) {
        localAnswerVectorf899e6cf = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorf899e6cf);
    }
}

function htLoadContent() {
    htWriteNavigation();
    htAddReligionReflection("#htReligiousReflection");



    htSetImageSrc("imgB", "images/BritishMuseum/mid_00404485_001.jpg");
    htSetImageSrc("imgCMP", "images/Mapswire/mapswire-world-political-white-equal_earth_babylon.png");
    htSetImageSrc("imgCradle", "images/Mapswire/mapswire-world-political-white-equal_earth_cradle.png");

    var local_lang = $("#site_language").val();
    if (local_lang == "en-US") {
        htSetImageSrc("imgUSG", "images/USGS/USGS_WaterCycle_English_ONLINE_20230302.png");
    } else {
        htSetImageSrc("imgUSG", "images/USGS/USGS_WaterCycle_Spanish_ONLINE_20230302.png");
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorf899e6cf != undefined) {
        for (let i = 0; i < localAnswerVectorf899e6cf.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorf899e6cf[i], "#answer"+i, "#explanation"+i);
        }
    }
}

