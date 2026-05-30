// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htSetImageSrc("imgd700", "images/MexicoCityMuseo/Cuauhxicalli.jpg");
    htSetImageSrc("img4", "images/Xunantunich/WitzXunantunich.jpg");
    htSetImageSrc("img9", "images/ResearchGate/Figura-9-Hueso-de-Lebombo.png");
    htSetImageSrc("img2", "images/HistoryTracers/pyramid.jpg");
    htSetImageSrc("imgShona", "images/UniversityJohannesburg/ShonaJohannnesburg.jpg");
    htSetImageSrc("imgESA2", "images/ESA/Planck_history_of_Universe.jpg");
    htSetImageSrc("img3", "images/HistoryTracers/pentagonal_pyramid.jpg");
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

    $(".sumexample1").hover(function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "red");
    }, function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "black");
    });

    htFillMultiplicationTable("chart4", 0, 9, false, true);

    return false;
}
